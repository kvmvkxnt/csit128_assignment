const request = require("supertest");
const app = require("../../server");
const db = require("../../src/db");

afterAll(() => db.destroy());

describe("public read endpoints", () => {
  test("GET /api/company returns profile, history, stats and offices", async () => {
    const res = await request(app).get("/api/company");
    expect(res.status).toBe(200);
    expect(res.body.company.name).toBe("Veyra Technologies");
    expect(Array.isArray(res.body.company.history)).toBe(true);
    expect(Array.isArray(res.body.company.stats)).toBe(true);
    expect(Array.isArray(res.body.offices)).toBe(true);
    expect(res.body.offices.length).toBeGreaterThan(0);
  });

  test("GET /api/services returns only active services", async () => {
    const res = await request(app).get("/api/services");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("startingPrice");
  });

  test("GET /api/products returns seeded products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.some((p) => p.id === "edge-node")).toBe(true);
  });

  test("GET /api/team returns founders and staff", async () => {
    const res = await request(app).get("/api/team");
    expect(res.status).toBe(200);
    expect(res.body.some((m) => m.founder)).toBe(true);
  });

  test("unknown /api route returns 404", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/comments", () => {
  test("rejects an invalid payload with field errors", async () => {
    const res = await request(app)
      .post("/api/comments")
      .send({ name: "A", email: "not-an-email", rating: 9, message: "short" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test("accepts a valid comment and it appears in GET /api/comments", async () => {
    const payload = {
      name: "Jest Tester",
      email: "jest.tester@example.com",
      rating: 5,
      message: "Posted from the automated test suite, all good here.",
    };
    const postRes = await request(app).post("/api/comments").send(payload);
    expect(postRes.status).toBe(201);
    expect(postRes.body.ok).toBe(true);

    const listRes = await request(app).get("/api/comments");
    expect(listRes.body.some((c) => c.message === payload.message)).toBe(true);
  });
});
