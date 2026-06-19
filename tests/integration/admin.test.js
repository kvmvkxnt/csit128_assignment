const request = require("supertest");
const app = require("../../server");
const db = require("../../src/db");

afterAll(() => db.destroy());

function extractCsrf(html) {
  const match = html.match(/name="_csrf" value="([^"]+)"/);
  return match ? match[1] : null;
}

describe("admin panel", () => {
  test("unauthenticated request to /admin redirects to login", async () => {
    const res = await request(app).get("/admin");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/admin/login");
  });

  test("rejects login with wrong credentials", async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get("/admin/login");
    const csrf = extractCsrf(loginPage.text);

    const res = await agent
      .post("/admin/login")
      .type("form")
      .send({ email: process.env.ADMIN_EMAIL, password: "wrong-password", _csrf: csrf });
    expect(res.status).toBe(401);
  });

  test("logs in, sees dashboard counts, and creates a product through a CSRF-protected form", async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get("/admin/login");
    const csrf = extractCsrf(loginPage.text);

    const login = await agent
      .post("/admin/login")
      .type("form")
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, _csrf: csrf });
    expect(login.status).toBe(302);
    expect(login.headers.location).toBe("/admin");

    const dashboard = await agent.get("/admin");
    expect(dashboard.status).toBe(200);
    expect(dashboard.text).toContain("products");

    const productsPage = await agent.get("/admin/products");
    const productsCsrf = extractCsrf(productsPage.text);

    const create = await agent.post("/admin/products").type("form").send({
      slug: "jest-test-product",
      name: "Jest Test Product",
      order_index: 0,
      _csrf: productsCsrf,
    });
    expect(create.status).toBe(302);

    const listed = await request(app).get("/api/products");
    expect(listed.body.some((p) => p.id === "jest-test-product")).toBe(true);

    await db("products").where({ slug: "jest-test-product" }).del();
  });

  test("rejects a write request without a valid CSRF token", async () => {
    const agent = request.agent(app);
    const loginPage = await agent.get("/admin/login");
    const csrf = extractCsrf(loginPage.text);
    await agent
      .post("/admin/login")
      .type("form")
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, _csrf: csrf });

    const res = await agent
      .post("/admin/products")
      .type("form")
      .send({ slug: "no-csrf", name: "Should not be created" });
    expect(res.status).toBe(403);

    const listed = await request(app).get("/api/products");
    expect(listed.body.some((p) => p.id === "no-csrf")).toBe(false);
  });
});
