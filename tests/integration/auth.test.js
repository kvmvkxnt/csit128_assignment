const request = require("supertest");
const app = require("../../server");
const db = require("../../src/db");

afterAll(() => db.destroy());

describe("auth flow", () => {
  const email = "auth.flow@example.com";
  const password = "Passw0rd1";

  test("rejects registration with a weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Weak Pw", email: "weak@example.com", password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("registers a new user and sets an auth cookie", async () => {
    const agent = request.agent(app);
    const res = await agent.post("/api/auth/register").send({ name: "Auth Flow", email, password });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.password_hash).toBeUndefined();

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  test("rejects a duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Dupe", email, password });
    expect(res.status).toBe(409);
  });

  test("logs in with correct credentials and rejects wrong password", async () => {
    const goodRes = await request(app).post("/api/auth/login").send({ email, password });
    expect(goodRes.status).toBe(200);

    const badRes = await request(app).post("/api/auth/login").send({ email, password: "wrong-password1" });
    expect(badRes.status).toBe(401);
  });

  test("GET /api/auth/me without a token is rejected", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("logout clears the session for subsequent /me calls", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email, password });
    await agent.post("/api/auth/logout");
    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(401);
  });
});
