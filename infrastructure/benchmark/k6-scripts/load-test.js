import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const API_BASE = __ENV.API_BASE || 'http://localhost:3000/api/v1';
const BEARER_TOKEN = __ENV.BEARER_TOKEN || '';

const params = {
  headers: {
    'Content-Type': 'application/json',
    ...(BEARER_TOKEN ? { Authorization: `Bearer ${BEARER_TOKEN}` } : {}),
  },
};

const errorRate = new Rate('errors');
const p50 = new Trend('latency_p50', true);
const p95 = new Trend('latency_p95', true);
const p99 = new Trend('latency_p99', true);

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<5000', 'p(99)<10000'],
    http_req_failed: ['rate<0.05'],
  },
};

const endpoints = [
  { method: 'GET', path: '/health', weight: 20 },
  { method: 'GET', path: '/knowledge?limit=10', weight: 15 },
  { method: 'GET', path: '/search?q=test', weight: 10 },
  { method: 'GET', path: '/engineering/catalog', weight: 10 },
  { method: 'GET', path: '/knowledge-intelligence/graph/search?q=test', weight: 5 },
];

function pickEndpoint() {
  const totalWeight = endpoints.reduce((sum, e) => sum + e.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const ep of endpoints) {
    rand -= ep.weight;
    if (rand <= 0) return ep;
  }
  return endpoints[0];
}

export default function () {
  group('Load Test', () => {
    const ep = pickEndpoint();
    const url = `${API_BASE}${ep.path}`;

    const res = http.request(ep.method, url, null, params);
    errorRate.add(res.status >= 400);
    p50.add(res.timings.duration);
    p95.add(res.timings.duration);
    p99.add(res.timings.duration);

    check(res, {
      [`${ep.method} ${ep.path} status < 500`]: (r) => r.status < 500,
    });

    sleep(Math.random() * 2 + 0.5);
  });
}
