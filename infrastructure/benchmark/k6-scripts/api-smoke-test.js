import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const API_BASE = __ENV.API_BASE || 'http://localhost:3000/api/v1';

const errorRate = new Rate('errors');
const healthTrend = new Trend('health_duration');
const knowledgeTrend = new Trend('knowledge_list_duration');

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    errors: ['rate<0.1'],
    http_req_duration: ['p(95)<2000'],
    health_duration: ['p(95)<500'],
  },
};

export default function () {
  group('Health Check', () => {
    const res = http.get(`${API_BASE}/health`, {
      tags: { name: 'health' },
    });
    healthTrend.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, {
      'health status is 200': (r) => r.status === 200,
      'health response has success field': (r) => {
        try { return JSON.parse(r.body).success === true; }
        catch { return false; }
      },
    });
    sleep(1);
  });

  group('Knowledge API', () => {
    const res = http.get(`${API_BASE}/knowledge?limit=5`, {
      tags: { name: 'knowledge_list' },
    });
    knowledgeTrend.add(res.timings.duration);
    errorRate.add(res.status !== 200);
    check(res, {
      'knowledge list status is 200': (r) => r.status === 200,
      'knowledge list returns array': (r) => {
        try { const b = JSON.parse(r.body); return Array.isArray(b.data || b); }
        catch { return false; }
      },
    });
    sleep(1);
  });
}
