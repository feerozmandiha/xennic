
#!/usr/bin/env python3
"""Mock vision-service برای تست اپ موبایل"""
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

class MockHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass
    def do_POST(self):
        if "/nameplate/read" in self.path:
            data = {"success": True, "confidence": 0.92, "data": {"manufacturer": "ABB", "model": "M2BA 315S", "serial_number": "SN-2025-8847", "year_of_manufacture": 2024, "power_kw": 55.0, "voltage_v": 400, "current_a": 85.0, "frequency_hz": 50, "efficiency_pct": 94.5, "extra_fields": {"کارخانه":"تهران","وضعیت":"نو"}}}
        elif "/bill/read" in self.path:
            data = {"success": True, "confidence": 0.88, "data": {"bill_number":"1405-98765","customer_name":"شرکت صنعتی البرز","customer_id":"C-5521","billing_period":"1405/04/01 تا 1405/04/31","consumption_kwh": 1250, "energy_charge": 1850000, "tax": 165000, "total_amount": 2015000, "line_items": [{"description":"هزینه انرژی پایه","amount":1850000},{"description":"مالیات بر ارزش افزوده","amount":165000}], "extra_fields":{"منطقه":"صنعتی","تعرفه":"صنعتی"}}}
        else:
            data = {"success": False, "error": "Unknown endpoint"}
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

if __name__ == "__main__":
    print("Mock vision-service running on http://localhost:8003")
    HTTPServer(("0.0.0.0", 8003), MockHandler).serve_forever()
