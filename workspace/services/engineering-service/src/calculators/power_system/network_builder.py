"""
Network Builder — pandapower Network Construction & Validation

Builds and validates a pandapower network from domain data models.
"""

import math

import pandapower as pp

from src.schemas.power_system import (
    MotorData,
    NetworkData,
)


class NetworkBuilder:
    """Builds and validates pandapower networks from domain data models."""

    BUS_TYPE_MAP = {
        'b':      'b',
        'pq':     'b',
        'pv':     'b',
        'slack':  'b',
    }

    @staticmethod
    def create_network(
        network_data: NetworkData,
        add_std_types: bool = True,
    ) -> 'pp.pandapowerNet':
        """
        Build a fully populated pandapower network from structured input data.

        Parameters
        ----------
        network_data : NetworkData
            Domain model containing all network elements.
        add_std_types : bool
            If True, adds standard line types to the network.

        Returns
        -------
        pp.pandapowerNet
            Fully constructed pandapower network.
        """
        net = pp.create_empty_network()

        bus_map: dict[str, int] = {}

        for bus in network_data.buses:
            bus_idx = pp.create_bus(
                net,
                name=bus.name,
                vn_kv=bus.vn_kv,
                type='b',
                min_vm_pu=bus.min_vm_pu,
                max_vm_pu=bus.max_vm_pu,
            )
            bus_map[bus.name] = bus_idx

        for bus in network_data.buses:
            if bus.type == 'slack':
                s_sc_mva = 100 * bus.vn_kv
                pp.create_ext_grid(
                    net,
                    bus=bus_map[bus.name],
                    vm_pu=1.0,
                    s_sc_max_mva=s_sc_mva,
                    s_sc_min_mva=s_sc_mva * 0.5,
                    rx_max=0.1,
                    rx_min=0.1,
                    r0x0_max=0.1,
                    x0x_max=1.0,
                )

        for line in network_data.lines:
            r_ohm = line.r_ohm_per_km * line.length_km
            x_ohm = line.x_ohm_per_km * line.length_km

            vn_kv = _find_bus_voltage(network_data, line.from_bus)
            z_base = (vn_kv * vn_kv) / 100 if vn_kv > 0 else 1
            i_base_ka = (100 / (3**0.5 * vn_kv)) if vn_kv > 0 else 1
            max_i_ka = (line.max_loading_percent / 100.0) * i_base_ka * 2

            pp.create_line_from_parameters(
                net,
                from_bus=bus_map[line.from_bus],
                to_bus=bus_map[line.to_bus],
                length_km=line.length_km,
                r_ohm_per_km=r_ohm / line.length_km,
                x_ohm_per_km=x_ohm / line.length_km,
                c_nf_per_km=(line.b_uf_per_km * 1000) if line.b_uf_per_km > 0 else 0,
                max_i_ka=max(max_i_ka, 1.0),
                name=line.name,
                max_loading_percent=line.max_loading_percent,
            )

        for tf in network_data.transformers:
            vkr = tf.vkr_percent
            if vkr == 0:
                vkr = tf.vk_percent * 0.3

            pp.create_transformer_from_parameters(
                net,
                name=tf.name,
                hv_bus=bus_map[tf.hv_bus],
                lv_bus=bus_map[tf.lv_bus],
                sn_mva=tf.sn_mva,
                vn_hv_kv=tf.vn_hv_kv,
                vn_lv_kv=tf.vn_lv_kv,
                vk_percent=tf.vk_percent,
                vkr_percent=vkr,
                pfe_kw=tf.pfe_kw,
                i0_percent=tf.i0_percent,
                tap_side=tf.tap_side,
                tap_pos=tf.tap_pos,
                tap_step_percent=tf.tap_step_percent,
                tap_neutral=tf.tap_neutral,
            )

        for load in network_data.loads:
            pp.create_load(
                net,
                bus=bus_map[load.bus],
                p_mw=load.p_mw * load.scaling_factor,
                q_mvar=load.q_mvar * load.scaling_factor,
                name=load.name,
            )

        for gen in network_data.generators:
            gen_vn_kv = _find_bus_voltage(network_data, gen.bus)
            pp.create_gen(
                net,
                bus=bus_map[gen.bus],
                p_mw=gen.p_mw,
                vm_pu=gen.vm_pu,
                min_q_mvar=gen.min_q_mvar,
                max_q_mvar=gen.max_q_mvar,
                min_p_mw=gen.min_p_mw,
                max_p_mw=gen.max_p_mw,
                vn_kv=gen_vn_kv,
                sn_mva=gen.p_mw * 1.2,
                rdss_ohm=0.01,
                xdss_pu=0.2,
                cos_phi=0.85,
                name=gen.name,
            )

        return net

    @staticmethod
    def validate_network(net: 'pp.pandapowerNet') -> list[str]:
        """
        Validate a pandapower network and return warning messages.

        Parameters
        ----------
        net : pp.pandapowerNet
            The network to validate.

        Returns
        -------
        list[str]
            List of warning/error messages. Empty if network is valid.
        """
        warnings: list[str] = []

        if len(net.bus) == 0:
            warnings.append("Network has no buses")
            return warnings

        ext_grid_count = len(net.ext_grid)
        if ext_grid_count == 0:
            warnings.append("Network has no external grid (slack) connection")
        elif ext_grid_count > 1:
            warnings.append(f"Network has {ext_grid_count} external grids — ensure consistency")

        if len(net.line) > 0:
            overloaded = net.line['max_loading_percent'].isna().sum()
            if overloaded == len(net.line):
                warnings.append("Line max loading limits not set")
            under_voltage = net.bus[net.bus['vn_kv'] < 0.1]
            if len(under_voltage) > 0:
                warnings.append(f"Buses with very low voltage: {list(under_voltage.index)}")

        return warnings

    @staticmethod
    def add_motor_as_impedance(
        net: 'pp.pandapowerNet',
        bus_idx: int,
        motor_data: MotorData,
    ) -> dict:
        """
        Add motor as impedance load for short-circuit analysis.

        Parameters
        ----------
        net : pp.pandapowerNet
            Network to add motor to.
        bus_idx : int
            Bus index where motor is connected.
        motor_data : MotorData
            Motor parameters.

        Returns
        -------
        dict
            Motor impedance values.
        """
        s_rated_mva = motor_data.rated_power_kw / (motor_data.rated_efficiency * 1000)
        vn_kv = motor_data.rated_voltage_v / 1000
        z_base = (vn_kv * vn_kv) / s_rated_mva if s_rated_mva > 0 else 1e6
        i_start_factor = motor_data.starting_current_factor
        z_motor_pu = 1.0 / i_start_factor
        z_motor_ohm = z_motor_pu * z_base
        r_motor = z_motor_ohm * motor_data.starting_power_factor
        x_motor = z_motor_ohm * math.sqrt(1 - motor_data.starting_power_factor ** 2)

        voltage_kv = net.bus.at[bus_idx, 'vn_kv']
        v_base = voltage_kv * 1000
        z_base_s = (v_base * v_base) / (1e6) if s_rated_mva > 0 else 1
        r_pu = r_motor / z_base_s
        x_pu = x_motor / z_base_s

        return {
            'r_ohm': r_motor,
            'x_ohm': x_motor,
            'r_pu': r_pu,
            'x_pu': x_pu,
            'z_motor_ohm': z_motor_ohm,
            's_rated_mva': s_rated_mva,
            'z_base_ohm': z_base,
        }

    @staticmethod
    def calculate_xr_ratio_at_bus(net: 'pp.pandapowerNet', bus_idx: int) -> float:
        """
        Calculate the equivalent X/R ratio at a given bus using the
        Thevenin impedance from the bus impedance matrix.

        Parameters
        ----------
        net : pp.pandapowerNet
            Network model.
        bus_idx : int
            Bus index.

        Returns
        -------
        float
            X/R ratio at the bus.
        """
        try:
            pp.runpp(net, calculate_voltage_angles=False)
        except Exception:
            pass

        try:
            from pandapower.shortcircuit import calc_sc
            calc_sc(net, bus_idx, ip=False, lv_tol_percent=0)
            sc_results = net.res_bus_sc
            if bus_idx in sc_results.index:
                r_eq = sc_results.at[bus_idx, 'rk_ohm']
                x_eq = sc_results.at[bus_idx, 'xk_ohm']
                if r_eq and r_eq > 0:
                    return x_eq / r_eq
        except Exception:
            pass

        return 5.0


def _find_bus_voltage(network_data: 'NetworkData', bus_name: str) -> float:
    """Find the rated voltage of a bus by name in the network data."""
    for bus in network_data.buses:
        if bus.name == bus_name:
            return bus.vn_kv
    return 0.0
