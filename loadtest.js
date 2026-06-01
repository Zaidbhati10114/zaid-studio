import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    realistic_usage: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 2 }, // normal day
        { duration: "60s", target: 3 }, // busy day
        { duration: "30s", target: 0 }, // ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<30000"],
    http_req_failed: ["rate<0.05"], // stricter — less than 5% at realistic load
  },
};

const SCENARIOS = [
  {
    name: "Rahul Sharma",
    email: "rahul@test.com",
    projectType: "Website",
    stage: "Starting from scratch",
    budget: "Under ₹50k",
    timeline: "ASAP",
    description:
      "A landing page for my home interior design business with portfolio gallery, service packages, and WhatsApp contact button.",
  },
  {
    name: "Priya Mehta",
    email: "priya@test.com",
    projectType: "E-commerce",
    stage: "I have a basic website",
    budget: "₹50k – ₹1L",
    timeline: "2–4 weeks",
    description:
      "Online store for handmade jewellery with product catalog, cart, Razorpay payments, and order tracking for customers.",
  },
  {
    name: "Arjun Patel",
    email: "arjun@test.com",
    projectType: "SaaS Product",
    stage: "Starting from scratch",
    budget: "₹1L – ₹3L",
    timeline: "Flexible",
    description:
      "A SaaS tool for freelancers to manage clients, send invoices, track payments, and get reminders for overdue bills.",
  },
  {
    name: "Sneha Kulkarni",
    email: "sneha@test.com",
    projectType: "Web App",
    stage: "Need advanced features",
    budget: "₹50k – ₹1L",
    timeline: "1–2 months",
    description:
      "Appointment booking system for a dental clinic with patient profiles, doctor availability calendar, SMS reminders, and payment collection.",
  },
  {
    name: "Vikram Nair",
    email: "vikram@test.com",
    projectType: "Mobile App",
    stage: "Starting from scratch",
    budget: "₹3L+",
    timeline: "Flexible",
    description:
      "A food delivery app for local restaurants in Pune with real-time order tracking, multiple payment options, and restaurant dashboard.",
  },
];

export default function () {
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

  const res = http.post(
    "https://zaid-studio.vercel.app/api/generate-quote",
    JSON.stringify(scenario),
    {
      headers: { "Content-Type": "application/json" },
      timeout: "35s",
    },
  );

  let body = {};
  try {
    body = JSON.parse(res.body);
  } catch (_) {
    console.log(`PARSE_FAIL [${res.status}]: ${res.body.slice(0, 100)}`);
  }

  check(res, {
    "status 200": (r) => r.status === 200,
    "has quoteId": (_) => body?.quoteId !== undefined,
    "no rate limit": (_) => !body?.details?.includes("429"),
    "no empty response": (_) => !body?.details?.includes("No JSON"),
    "under 30s": (r) => r.timings.duration < 30000,
  });

  if (res.status !== 200) {
    console.log(
      `FAIL [${res.status}] ${scenario.projectType} — ${JSON.stringify(body).slice(0, 120)}`,
    );
  } else {
    console.log(
      `OK [${res.timings.duration.toFixed(0)}ms] ${scenario.projectType} — complexity: ${body?.quote?.complexity}`,
    );
  }

  // Realistic think time — users don't spam, they fill a 4-step form
  sleep(Math.random() * 5 + 3); // 3-8s between requests per user
}
