import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const API_BASE = __ENV.API_BASE || 'http://localhost:3000/api/v1';

const errorRate = new Rate('errors');
const latency = new Trend('latency');

export const options = {
  vus: 20,
  duration: '4h',
  thresholds: {
    errors: ['rate<0.01'],
    latency: ['p(95)<3000'],
  },
};

const endpoints = [
  { method: 'GET', path: '/health', name: 'health' },
  { method: 'GET', path: '/knowledge?limit=5', name: 'knowledge' },
  { method: 'GET', path: '/search?q=stability', name: 'search' },
];

export default function () {
  group('Soak Test', () => {
    for (const ep of endpoints) {
      const res = http.get(`${API_BASE}${ep.path}`);
      errorRate.add(res.status >= 500);
      latency.add(res.timings.duration);

      check(res, {
        [`${ep.name} status ok`]: (r) => r.status < 500,
      });
    }

    sleep(5);
  });
}
