"""
PS-003: Motor Starting Analysis

Evaluates voltage dip during motor start and estimates acceleration time.

Based on:
- IEEE 399 (Brown Book): Power System Analysis
- IEC 60034: Rotating Electrical Machines
- NEMA MG-1: Motors and Generators
"""

import math
from typing import Dict

import pandapower as pp

from src.core.base_calculator import BaseCalculator
from src.core.validation import ValidationEngine
from src.schemas.power_system import (
    MotorStartingInput,
    MotorStartingResult,
)

from .network_builder import NetworkBuilder


class PowerSystemMotorStartingCalculator(BaseCalculator[MotorStartingInput]):
    CALCULATION_CODE = "PS-003"
    CALCULATION_NAME = "Motor Starting Analysis"
    FORMULA_VERSION = "1.0"
    STANDARD = "IEEE 399 / NEMA MG-1"
    STANDARD_VERSION = "2020"
    ENGINE_VERSION = "0.1.0"

    def validate_inputs(self, inputs: MotorStartingInput) -> bool:
        ValidationEngine.validate_positive(
            inputs.motor.rated_power_kw, "motor.rated_power_kw"
        )
        ValidationEngine.validate_positive(
            inputs.motor.rated_efficiency, "motor.rated_efficiency"
        )
        ValidationEngine.validate_physical_range(
            inputs.motor.rated_efficiency, 0.1, 1.0, "motor.rated_efficiency"
        )
        return True

    def get_units(self) -> Dict[str, str]:
        return {
            "voltage_dip_percent": "%",
            "voltage_dip_deviation": "pu",
            "starting_time_s": "s",
            "acceleration_time_s": "s",
            "starting_current_a": "A",
            "starting_torque_nm": "Nm",
            "v_dip_at_pcc_pu": "pu",
        }

    def _calculate(self, inputs: MotorStartingInput) -> Dict:  # noqa: C901
        warnings: list[str] = []
        recommendations: list[str] = []

        net = NetworkBuilder.create_network(inputs.network)

        pp.runpp(net, calculate_voltage_angles=False)
        v_pre_fault = net.res_bus['vm_pu'].copy()

        bus_map = {net.bus.at[i, 'name']: i for i in net.bus.index}
        motor_bus_idx = bus_map[inputs.motor_bus]
        motor = inputs.motor

        s_rated_mva = motor.rated_power_kw / (motor.rated_efficiency * 1000)
        bus_vn_kv = net.bus.at[motor_bus_idx, 'vn_kv']

        z_base = (bus_vn_kv * bus_vn_kv) / s_rated_mva if s_rated_mva > 0 else 1e6
        i_start_factor = motor.starting_current_factor
        z_motor_pu = 1.0 / i_start_factor
        z_motor_ohm = z_motor_pu * z_base
        r_motor = z_motor_ohm * motor.starting_power_factor
        x_motor = z_motor_ohm * math.sqrt(1 - motor.starting_power_factor ** 2)

        v_base = bus_vn_kv * 1000
        z_base_system = (v_base * v_base) / (1e6)
        r_motor_pu = r_motor / z_base_system
        x_motor_pu = x_motor / z_base_system
        z_motor_pu_sys = math.sqrt(r_motor_pu**2 + x_motor_pu**2)

        # Thevenin impedance at motor bus with load flow result
        try:
            from pandapower.shortcircuit import calc_sc
            calc_sc(net, motor_bus_idx, ip=False, lv_tol=False)
            z_th_r = float(net.res_bus_sc.at[motor_bus_idx, 'rk_ss'])
            z_th_x = float(net.res_bus_sc.at[motor_bus_idx, 'xk_ss'])
        except Exception:
            z_th_r = 0.01
            z_th_x = 0.05

        v_source = v_pre_fault[motor_bus_idx]
        total_r = z_th_r + r_motor_pu
        total_x = z_th_x + x_motor_pu
        total_z = math.sqrt(total_r**2 + total_x**2)

        if total_z > 0:
            v_dip_pu = v_source * z_motor_pu_sys / total_z
        else:
            v_dip_pu = 0

        v_dip_percent = (1 - v_dip_pu) * 100
        v_dip_deviation = 1 - v_dip_pu

        if motor.starting_method == 'direct' and motor.rated_voltage_v > 1000:
            warnings.append(
                f"Direct-on-line start for HV motor ({motor.rated_voltage_v}V) — "
                "consider reduced voltage start"
            )

        if v_dip_percent > 15:
            warnings.append(
                f"Severe voltage dip ({v_dip_percent:.1f}%) during motor start"
            )
            recommendations.append("Consider reduced-voltage starting (VFD, star-delta, soft-starter)")
        elif v_dip_percent > 10:
            warnings.append(
                f"Significant voltage dip ({v_dip_percent:.1f}%) — verify contactor dropout margin"
            )
            recommendations.append("Check motor starting torque vs load torque")
        elif v_dip_percent > 5:
            warnings.append(f"Moderate voltage dip ({v_dip_percent:.1f}%)")

        i_start_a = (s_rated_mva * 1e6) / (math.sqrt(3) * motor.rated_voltage_v)
        i_start_a *= i_start_factor

        rated_torque_nm = (motor.rated_power_kw * 1000) / (2 * math.pi * motor.speed_rpm / 60)
        starting_torque_nm = rated_torque_nm * motor.starting_torque_factor

        # Determine load torque
        load_torque_nm = inputs.load_torque_percent * starting_torque_nm / 100

        # Acceleration torque
        accel_torque_nm = starting_torque_nm - load_torque_nm
        if accel_torque_nm <= 0:
            warnings.append("Motor starting torque insufficient to accelerate load")
            accel_torque_nm = starting_torque_nm * 0.1
            recommendations.append("Motor may not start — verify load torque curve")

        # Acceleration time
        inertia_total = motor.rated_power_kw * 2.74 / (motor.rated_efficiency ** 2)
        if inputs.load_inertia_kgm2:
            inertia_total += inputs.load_inertia_kgm2

        if accel_torque_nm > 0:
            accel_rad_s = (motor.speed_rpm * 2 * math.pi) / 60
            acceleration_time_s = (inertia_total * accel_rad_s) / (accel_torque_nm * 2)
        else:
            acceleration_time_s = float('inf')

        # Starting time (with terminal voltage factor)
        v_terminal_factor = v_dip_pu ** 2
        actual_starting_torque = starting_torque_nm * v_terminal_factor
        actual_accel = actual_starting_torque - load_torque_nm
        if actual_accel > 0:
            starting_time_s = (inertia_total * accel_rad_s) / (actual_accel * 2)
        else:
            starting_time_s = float('inf')
            warnings.append("Motor will not accelerate with reduced terminal voltage")

        v_dip_at_pcc_pu = v_dip_pu
        if inputs.pcc_bus:
            pcc_bus_idx = bus_map.get(inputs.pcc_bus)
            if pcc_bus_idx is not None and pcc_bus_idx in v_pre_fault.index:
                v_pcc_pre = v_pre_fault[pcc_bus_idx]
                # Simple voltage drop to PCC
                pcc_z_r = z_th_r * 0.5
                total_pcc_z = math.sqrt(
                    (pcc_z_r + r_motor_pu)**2 + (z_th_x * 0.5 + x_motor_pu)**2
                )
                v_dip_at_pcc_pu = v_pcc_pre * z_motor_pu_sys / total_pcc_z if total_pcc_z > 0 else 0
                pcc_dip_pct = (1 - v_dip_at_pcc_pu) * 100
                if pcc_dip_pct > 3:
                    warnings.append(
                        f"Voltage dip at PCC ({inputs.pcc_bus}): {pcc_dip_pct:.1f}% "
                        "may affect other loads"
                    )

        if acceleration_time_s != float('inf') and acceleration_time_s > motor.stall_time_s:
            warnings.append(
                f"Acceleration time ({acceleration_time_s:.2f}s) exceeds "
                f"motor stall time ({motor.stall_time_s}s)"
            )
            recommendations.append("Verify motor thermal withstand with manufacturer")

        result = MotorStartingResult(
            voltage_dip_percent=round(v_dip_percent, 2),
            voltage_dip_deviation=round(v_dip_deviation, 4),
            v_dip_at_pcc_pu=round(v_dip_at_pcc_pu, 4),
            starting_current_a=round(i_start_a, 1),
            starting_time_s=round(starting_time_s, 2) if starting_time_s != float('inf') else None,
            acceleration_time_s=round(acceleration_time_s, 2) if acceleration_time_s != float('inf') else None,
            starting_torque_nm=round(starting_torque_nm, 1),
            rated_torque_nm=round(rated_torque_nm, 1),
        )

        return {
            "motor_name": motor.name,
            "motor_bus": inputs.motor_bus,
            "starting_method": motor.starting_method,
            "details": result.model_dump(),
            "warnings": warnings,
            "recommendations": recommendations,
        }
