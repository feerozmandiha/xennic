
## 📁 فایل 2: `API_INTEGRATION_GUIDE.md` – کامل

# Engineering Service – API Integration Guide

**For:** Xennic NestJS Backend Team  
**Service:** Engineering Calculation Engine  
**Base URL:** `http://engineering-service:8001` (internal) or `http://localhost:8001` (development)

---

## 📡 Service Overview

The Engineering Service provides RESTful endpoints for electrical engineering calculations. All responses follow the standard Xennic unified format.

### Base Information

| Property | Value |
|----------|-------|
| **Protocol** | HTTP/1.1 |
| **Port** | 8001 |
| **Content-Type** | `application/json` |
| **Health Check** | `GET /health` |

---

## 🔌 Available Endpoints

### 1. Ohm's Law (BASIC-001)

**Endpoint:** `POST /api/v1/engineering/basic/ohms-law`

**Description:** Calculate voltage, current, or resistance when exactly two parameters are provided.

**Request Body:**

```json
{
  "voltage_v": 230.0,        // optional, float
  "current_a": 10.0,         // optional, float  
  "resistance_ohm": 23.0     // optional, float
}
// Exactly two of the three parameters must be provided
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "calculation_code": "BASIC-001",
    "calculation_name": "Ohm's Law",
    "formula_version": "1.0",
    "standard": "IEC 60050",
    "standard_version": "2023",
    "engine_version": "0.1.0",
    "inputs": {"current_a": 10.0, "resistance_ohm": 23.0},
    "results": {"voltage_v": 230.0},
    "units": {"voltage_v": "V", "current_a": "A", "resistance_ohm": "Ω"},
    "warnings": [],
    "recommendations": [],
    "calculation_timestamp": "2026-06-03T12:00:00Z"
  },
  "meta": {"engine_version": "0.1.0"}
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:8001/api/v1/engineering/basic/ohms-law \
  -H "Content-Type: application/json" \
  -d '{"current_a": 10.0, "resistance_ohm": 23.0}'
```

---

### 2. Active Power (BASIC-002)

**Endpoint:** `POST /api/v1/engineering/basic/active-power`

**Description:** Calculate active (real) power in single-phase or three-phase systems.

**Request Body:**

```json
{
  "voltage_v": 230.0,           // required, float > 0
  "current_a": 10.0,            // required, float > 0  
  "power_factor": 0.85,         // required, float in (0, 1]
  "phase_type": "single"        // optional, "single" or "three", default "single"
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "calculation_code": "BASIC-002",
    "results": {
      "active_power_w": 1955.0,
      "active_power_kw": 1.955
    }
  }
}
```

---

### 3. Apparent Power (BASIC-003)

**Endpoint:** `POST /api/v1/engineering/basic/apparent-power`

**Request Body:**

```json
{
  "voltage_v": 230.0,      // required, float > 0
  "current_a": 10.0,       // required, float > 0
  "phase_type": "single"   // optional, "single" or "three"
}
```

---

### 4. Reactive Power (BASIC-004)

**Endpoint:** `POST /api/v1/engineering/basic/reactive-power`

**Request Body:**

```json
{
  "active_power_w": 800.0,      // required, float > 0
  "apparent_power_va": 1000.0   // required, float > active_power_w
}
```

---

### 5. Power Factor (BASIC-005)

**Endpoint:** `POST /api/v1/engineering/basic/power-factor`

**Request Body:**

```json
{
  "active_power_w": 850.0,      // required, float > 0
  "apparent_power_va": 1000.0   // required, float > active_power_w
}
```

---

## ❌ Error Handling

All errors follow this standard format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Exactly two of the three parameters must be provided."
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed (invalid range, missing fields) |
| `CALCULATION_ERROR` | 500 | Internal calculation error |
| `REQUEST_VALIDATION_ERROR` | 422 | Malformed JSON or invalid field types |

### Common Validation Errors

**Missing parameters:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Exactly two of the three parameters must be provided."
  }
}
```

**Invalid power factor:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Power factor must be in range (0, 1]"
  }
}
```

**Negative values:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR", 
    "message": "Value must be positive"
  }
}
```

---

## 🔧 NestJS Integration Example

### Creating a Client Service

```typescript
// engineering-client.service.ts
import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class EngineeringClientService {
  private readonly baseUrl = process.env.ENGINEERING_SERVICE_URL || 'http://localhost:8001';

  constructor(private readonly http: HttpService) {}

  async calculateOhmsLaw(params: OhmsLawDto) {
    const response = await this.http.post(
      `${this.baseUrl}/api/v1/engineering/basic/ohms-law`,
      params
    ).toPromise();
    
    if (!response.data.success) {
      throw new EngineeringError(response.data.error);
    }
    
    return response.data.data.results;
  }

  async calculateActivePower(params: ActivePowerDto) {
    const response = await this.http.post(
      `${this.baseUrl}/api/v1/engineering/basic/active-power`,
      params
    ).toPromise();
    
    return response.data.data.results;
  }
}
```

### DTOs (Data Transfer Objects)

```typescript
// engineering.dto.ts
export class OhmsLawDto {
  voltage_v?: number;
  current_a?: number;
  resistance_ohm?: number;
}

export class ActivePowerDto {
  voltage_v: number;
  current_a: number;
  power_factor: number;
  phase_type?: 'single' | 'three';
}
```

---

## 🏥 Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "engineering-service",
  "version": "0.1.0",
  "calculators_registered": 5
}
```

---

## 📚 Additional Resources

- **Swagger UI:** `http://engineering-service:8001/docs`
- **ReDoc:** `http://engineering-service:8001/redoc`
- **Source Code:** `services/engineering-service/`
- **Team Contact:** Engineering Calculation Architect

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-06-03 | Initial release with 5 basic calculations |

---

**For questions or support, contact the Xennic Engineering Team.** ⚡
EOF
```

---

## 🔧 دستورات بررسی نهایی کیفیت کد

```bash
cat > final_qa_check.sh << 'EOF'
#!/bin/bash
echo "=========================================="
echo "Xennic Engineering Service - Final QA Check"
echo "=========================================="
echo ""

cd ~/xennic/workspace/services/engineering-service
source venv/bin/activate

echo "1. Ruff Check (Linting)"
echo "----------------------------------------"
ruff check src/ tests/ --fix
echo ""

echo "2. Ruff Format Check"
echo "----------------------------------------"
ruff format --check src/ tests/
echo ""

echo "3. Mypy Type Check"
echo "----------------------------------------"
mypy src/ --ignore-missing-imports
echo ""

echo "4. Pytest with Coverage"
echo "----------------------------------------"
pytest tests/ -v --cov=src --cov-report=term-missing --ignore=tests/test_core/test_registry.py
echo ""

echo "5. Health Check Test"
echo "----------------------------------------"
curl -s http://localhost:8001/health | python3 -m json.tool
echo ""

echo "6. API Test - Ohm's Law"
echo "----------------------------------------"
curl -s -X POST http://localhost:8001/api/v1/engineering/basic/ohms-law \
  -H "Content-Type: application/json" \
  -d '{"current_a": 10.0, "resistance_ohm": 5.0}' | python3 -m json.tool
echo ""

echo "=========================================="
echo "QA Check Complete"
echo "=========================================="
EOF

chmod +x final_qa_check.sh
```

---

## 🐳 تست Docker (اختیاری)

```bash
cat > docker_test.sh << 'EOF'
#!/bin/bash
echo "=========================================="
echo "Docker Build & Test"
echo "=========================================="

cd ~/xennic/workspace

echo "1. Building Docker image..."
docker-compose build engineering-service

echo ""
echo "2. Starting service..."
docker-compose up -d engineering-service

echo ""
echo "3. Waiting for service to be ready..."
sleep 10

echo ""
echo "4. Testing health endpoint..."
curl -s http://localhost:8001/health | python3 -m json.tool

echo ""
echo "5. Testing Ohm's Law API..."
curl -s -X POST http://localhost:8001/api/v1/engineering/basic/ohms-law \
  -H "Content-Type: application/json" \
  -d '{"current_a": 10.0, "resistance_ohm": 5.0}' | python3 -m json.tool

echo ""
echo "6. Stopping service..."
docker-compose down

echo ""
echo "=========================================="
echo "Docker Test Complete"
echo "=========================================="
EOF

chmod +x docker_test.sh
```

---
