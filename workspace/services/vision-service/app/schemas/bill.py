from __future__ import annotations


from pydantic import BaseModel, Field


class BillLineItem(BaseModel):
    description: str
    amount: float = 0.0
    unit: str | None = None
    quantity: float | None = None
    unit_price: float | None = None


class BillData(BaseModel):
    """Structured output for electricity bill reading."""

    # Header
    bill_number: str | None = None
    customer_name: str | None = None
    customer_id: str | None = None
    address: str | None = None
    billing_period: str | None = None
    issue_date: str | None = None
    due_date: str | None = None

    # Consumption
    previous_reading_kwh: float | None = Field(None, ge=0.0)
    current_reading_kwh: float | None = Field(None, ge=0.0)
    consumption_kwh: float | None = Field(None, ge=0.0)
    average_daily_consumption: float | None = Field(None, ge=0.0)

    # Charges
    energy_charge: float | None = Field(None, ge=0.0)
    transmission_charge: float | None = Field(None, ge=0.0)
    distribution_charge: float | None = Field(None, ge=0.0)
    tax: float | None = Field(None, ge=0.0)
    other_charges: float | None = Field(None, ge=0.0)
    total_amount: float | None = Field(None, ge=0.0)

    # Payment
    payment_status: str | None = None
    payment_date: str | None = None

    # Detailed breakdown
    line_items: list[BillLineItem] = Field(default_factory=list)
    extra_fields: dict[str, str] = Field(default_factory=dict)
