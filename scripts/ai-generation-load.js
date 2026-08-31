import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "1m",
};

const BASE_URL = __ENV.BASE_URL;
const TEST_SECRET = __ENV.AI_STRESS_TEST_SECRET;

export default function () {
  const res = http.post(`${BASE_URL}/api/test/ai-generation`, null, {
    headers: {
      "x-test-secret": TEST_SECRET,
    },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "success is true": (r) => {
      try {
        return r.json("success") === true;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
