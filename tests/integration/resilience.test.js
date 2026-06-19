const request = require("supertest");
const app = require("../../server");
const db = require("../../src/db");

afterAll(() => db.destroy());

// Regression test for a real production incident: with JWT_SECRET blank,
// the DB insert in /api/auth/register succeeded and then jwt.sign() threw
// synchronously. Because the route was an unhandled async throw, it
// crashed the whole Node process - leaving a user row behind with no
// response ever sent, so the next register attempt for the same email
// got a confusing 409 "already exists" for an account the caller never
// saw succeed. asyncHandler + the global error middleware fix this: the
// request now gets a clean 500 and the process keeps running.
describe("async route errors do not crash the process", () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  test("register returns 500 (not a crash) when JWT_SECRET is missing, and the process stays up", async () => {
    process.env.JWT_SECRET = "";

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Resilience Test", email: "resilience@example.com", password: "Passw0rd1" });

    expect(res.status).toBe(500);

    // The process is still alive and the DB connection still works -
    // proof the error was caught, not an unhandled crash.
    const health = await request(app).get("/api/services");
    expect(health.status).toBe(200);
  });

  test("login returns 500 (not a crash) when JWT_SECRET is missing", async () => {
    process.env.JWT_SECRET = originalSecret;
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Resilience Login", email: "resilience.login@example.com", password: "Passw0rd1" });

    process.env.JWT_SECRET = "";
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "resilience.login@example.com", password: "Passw0rd1" });

    expect(res.status).toBe(500);
  });
});
