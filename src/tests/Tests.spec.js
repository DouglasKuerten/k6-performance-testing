import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getMkmWebsiteDuration = new Trend('GET_MKM_WEBSITE', true);
export const successfullRequestsRate = new Rate('SUCCESSFULL_REQUESTS_RATE');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<5700']
  },
  stages: [
    { duration: '15s', target: 10 },
    { duration: '40s', target: 10 },
    { duration: '15s', target: 40 },
    { duration: '60s', target: 40 },
    { duration: '15s', target: 100 },
    { duration: '60s', target: 100 },
    { duration: '15s', target: 200 },
    { duration: '60s', target: 200 },
    { duration: '10s', target: 300 },
    { duration: '10s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://www.mkm.net.br/';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getMkmWebsiteDuration.add(res.timings.duration);
  successfullRequestsRate.add(res.status === OK);

  check(res, {
    'MKM WEBSITE GET - Status 200': () => res.status === OK
  });
}
