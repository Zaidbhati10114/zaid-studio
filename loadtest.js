import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    concurrent_users: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 3 },
        { duration: "40s", target: 10 },
        { duration: "20s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<30000"],
    http_req_failed: ["rate<0.1"], // we want this green this time
  },
};

const PAYLOAD = JSON.stringify({
  name: "Load Test User",
  email: "test@loadtest.com",
  projectType: "Website",
  stage: "Starting from scratch",
  budget: "Under ₹50k",
  timeline: "ASAP",
  description:
    "A simple landing page for my gym equipment business with contact form and product showcase.",
});

export default function () {
  const res = http.post("http://localhost:3000/api/generate-quote", PAYLOAD, {
    headers: { "Content-Type": "application/json" },
    timeout: "35s",
  });

  const body = JSON.parse(res.body);

  check(res, {
    "status 200": (r) => r.status === 200,
    "has quoteId": (_) => body?.quoteId !== undefined,
    "no rate limit": (_) => !body?.details?.includes("429"),
    "no empty response": (_) => !body?.details?.includes("No JSON"),
    "under 30s": (r) => r.timings.duration < 30000,
  });

  if (res.status !== 200) {
    console.log(`FAIL [${res.status}] ${JSON.stringify(body)}`);
  }

  sleep(Math.random() * 3 + 2);
}
