
## 📁 فایل 1: `README.md` – کامل


# Xennic Engineering Service

<div align="center">

**Electrical Engineering Calculation Engine**

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-green.svg)](https://fastapi.tiangolo.com/)
[![pytest](https://img.shields.io/badge/pytest-9.0+-orange.svg)](https://pytest.org/)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)]()

</div>

## 📋 Overview

Xennic Engineering Service is a microservice responsible for all electrical engineering calculations in the Xennic Platform. Built with **Clean Architecture** and **DDD** principles, it provides a reliable, reproducible, and traceable calculation engine.

### Key Features

- ✅ **Standard-Based Calculations** – Every formula references IEC/IEEE standards
- ✅ **Version-Controlled Formulas** – Traceable calculation versions
- ✅ **Unit Conversion Engine** – Seamless conversion between engineering units
- ✅ **Validation Pipeline** – Physical range & cross-field validation
- ✅ **RESTful API** – Swagger documentation at `/docs`
- ✅ **High Test Coverage** – ≥85% overall, 100% for basic calculators

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                       │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Routers)                                        │
│         ↓                                                   │
│  Registry (Singleton, Thread-Safe)                          │
│         ↓                                                   │
│  Calculators (BaseCalculator Pattern)                       │
│         ↓                                                   │
│  Core Engines (Validation, Unit Conversion)                 │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.12 or higher
- Docker (optional, for containerized deployment)
- pip (with access to PyPI or internal mirror)

### Local Development

```bash
# Clone the repository
cd services/engineering-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload

# Run tests
pytest tests/ -v --cov=src --cov-report=term-missing
```

### Docker Deployment

```bash
# Build image
docker build -t xennic/engineering-service:latest .

# Run container
docker run -d -p 8001:8001 --name engineering-service xennic/engineering-service:latest

# Using docker-compose
docker-compose up --build
```

## 📊 Available Calculations

| Code | Name | Formula | Standard | Endpoint |
|------|------|---------|----------|----------|
| BASIC-001 | Ohm's Law | V = I × R | IEC 60050 | `/basic/ohms-law` |
| BASIC-002 | Active Power | P = V × I × PF | IEC 60050 | `/basic/active-power` |
| BASIC-003 | Apparent Power | S = V × I | IEC 60050 | `/basic/apparent-power` |
| BASIC-004 | Reactive Power | Q = √(S² - P²) | IEC 60050 | `/basic/reactive-power` |
| BASIC-005 | Power Factor | PF = P / S | IEEE 1459 | `/basic/power-factor` |

### API Documentation

Once running, access interactive documentation:

- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc

### Example Request

```bash
# Ohm's Law - Calculate voltage from current and resistance
curl -X POST http://localhost:8001/api/v1/engineering/basic/ohms-law \
  -H "Content-Type: application/json" \
  -d '{"current_a": 10.0, "resistance_ohm": 5.0}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "calculation_code": "BASIC-001",
    "calculation_name": "Ohm's Law",
    "formula_version": "1.0",
    "standard": "IEC 60050",
    "standard_version": "2023",
    "results": {"voltage_v": 50.0},
    "calculation_timestamp": "2026-06-03T18:56:40.482068Z"
  },
  "meta": {"engine_version": "0.1.0"}
}
```

## 🧪 Testing

```bash
# Run all tests with coverage
pytest tests/ -v --cov=src --cov-report=term-missing

# Run specific test category
pytest tests/test_calculators/ -v
pytest tests/test_core/ -v

# Run integration tests only
pytest tests/integration/ -v
```

## 📁 Project Structure

```
services/engineering-service/
├── src/
│   ├── api/              # FastAPI routers
│   ├── calculators/      # Calculation implementations
│   │   └── basic/        # Basic electrical calculators
│   ├── core/             # Core engines (BaseCalculator, Registry, Validation, UnitConverter)
│   └── main.py           # Application entry point
├── tests/
│   ├── test_calculators/ # Unit tests for calculators
│   ├── test_core/        # Unit tests for core engines
│   └── integration/      # API integration tests
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## 🔧 Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENGINEERING_SERVICE_PORT` | 8001 | Service port |
| `ENVIRONMENT` | development | Runtime environment |
| `LOG_LEVEL` | INFO | Logging level |

## 🛡️ Error Handling

All errors follow a standard format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Exactly two of the three parameters must be provided."
  }
}
```

Error codes:
- `VALIDATION_ERROR` – Input validation failed
- `CALCULATION_ERROR` – Calculation execution failed
- `REQUEST_VALIDATION_ERROR` – Malformed request

## 🤝 Integration with NestJS

See [`API_INTEGRATION_GUIDE.md`](./API_INTEGRATION_GUIDE.md) for detailed instructions on integrating this service with the Xennic NestJS API Gateway.

## 📄 License

Proprietary – Xennic Platform Internal Use Only

## 👥 Authors

Xennic Chief Engineering Calculation Architect  
© 2026 Xennic Platform
