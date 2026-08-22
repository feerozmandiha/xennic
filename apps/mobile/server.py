#!/usr/bin/env python3
"""Simple mobile server for Xennic mobile app — port 3002"""
import http.server, socketserver, os, sys

PORT = int(os.environ.get("MOBILE_PORT", sys.argv[1] if len(sys.argv) > 1 else "3002"))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Content-Type", self.guess_type(self.path) or "text/html")
        super().end_headers()

    def guess_type(self, path):
        if path.endswith(".css"): return "text/css"
        if path.endswith(".js"): return "application/javascript"
        if path.endswith(".html"): return "text/html"
        return None

    def log_message(self, fmt, *args):
        print(f"[mobile-app:{PORT}] {self.address_string()} - {fmt % args}")

if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"[mobile-app] Server running at http://0.0.0.0:{PORT}/")
        print(f"[mobile-app] Ready — vision-service: http://localhost:8003")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[mobile-app] Server stopped.")
