import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const API_BASE = __ENV.API_BASE || 'http://localhost:3000/api/v1';

const errorRate = new Rate('errors');
const throughput = new Rate('throughput_rps');

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 200 },
    { duration: '3m', target: 500 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.1'],
    http_req_duration: ['p(95)<10000'],
  },
};

export default function () {
  group('Stress Test', () => {
    const res = http.get(`${API_BASE}/health`);
    throughput.add(1);
    errorRate.add(res.status !== 200);
    check(res, {
      'status is 200 or 503': (r) => r.status === 200 || r.status === 503,
    });

    if (res.status === 503) {
      sleep(2);
    } else {
      sleep(0.1);
    }
  });
}
