from __future__ import annotations


from pydantic import BaseModel, Field


class NameplateData(BaseModel):
    """Structured output for electrical nameplate reading."""

    manufacturer: str | None = None
    model: str | None = None
    serial_number: str | None = None
    year_of_manufacture: int | None = None

    # Electrical parameters
    power_kw: float | None = Field(None, ge=0.0)
    power_hp: float | None = Field(None, ge=0.0)
    voltage_v: float | None = Field(None, ge=0.0)
    current_a: float | None = Field(None, ge=0.0)
    frequency_hz: float | None = Field(None, ge=0.0)
    power_factor: float | None = Field(None, ge=0.0, le=1.0)
    efficiency_pct: float | None = Field(None, ge=0.0, le=100.0)
    poles: int | None = None
    speed_rpm: int | None = Field(None, ge=0)
    insulation_class: str | None = None
    duty_type: str | None = None
    enclosure_type: str | None = None
    connection_type: str | None = None

    # Extra fields
    extra_fields: dict[str, str] = Field(default_factory=dict)
