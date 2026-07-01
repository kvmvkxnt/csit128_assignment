const express = require("express");
const rateLimit = require("express-rate-limit");

const db = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const {
  isValidName,
  isValidEmail,
  isValidRating,
} = require("../utils/validators");

const router = express.Router();

const ok = (res, data, status = 200) =>
  res.status(status).json(data);

const fail = (res, errors, status = 400) =>
  res.status(status).json({
    ok: false,
    errors: Array.isArray(errors) ? errors : [errors],
  });

const activeQuery = (table) =>
  db(table)
    .where({ is_active: true });
const createLimiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      errors: [message],
    },
  });

const commentLimiter = createLimiter(
  5,
  "Too many comments submitted. Please try again later."
);

const contactLimiter = createLimiter(
  5,
  "Too many messages submitted. Please try again later."
);

const orderLimiter = createLimiter(
  20,
  "Too many orders submitted. Please try again later."
);

router.get(
  "/company",
  asyncHandler(async (_req, res) => {
    const profile = await db("company_profile").first();

    if (!profile) {
      return fail(res, "Company profile not configured.", 404);
    }

    const [history, stats, offices] = await Promise.all([
      db("company_history")
        .orderBy("order_index")
        .pluck("paragraph"),

      db("company_stats")
        .orderBy("order_index")
        .select("label", "value"),

      db("offices")
        .orderBy("order_index")
        .select(
          "slug as id",
          "city",
          "country",
          "role",
          "opened",
          "address",
          "blurb"
        ),
    ]);

    return ok(res, {
      company: {
        name: profile.name,
        legalName: profile.legal_name,
        tagline: profile.tagline,
        founded: profile.founded,
        headquarters: profile.headquarters,
        email: profile.email,
        phone: profile.phone,
        mission: profile.mission,
        history,
        stats,
      },
      offices,
    });
  })
);

router.get(
  "/timeline",
  asyncHandler(async (_req, res) => {
    const rows = await db("timeline")
      .orderBy("order_index")
      .select("year", "milestone", "detail");

    ok(res, rows);
  })
);

router.get(
  "/services",
  asyncHandler(async (_req, res) => {
    const rows = await activeQuery("services")
      .orderBy("order_index")
      .select(
        "slug as id",
        "name",
        "icon",
        "summary",
        "details",
        "starting_price as startingPrice"
      );

    ok(res, rows);
  })
);

router.get(
  "/products",
  asyncHandler(async (_req, res) => {
    const rows = await activeQuery("products")
      .orderBy("order_index")
      .select(
        "slug as id",
        "name",
        "category",
        "description",
        "price",
        "image_url as imageUrl"
      );

    ok(res, rows);
  })
);

router.get(
  "/news",
  asyncHandler(async (_req, res) => {
    const rows = await activeQuery("news_articles")
      .orderBy("published_at", "desc")
      .select(
        "slug as id",
        "title",
        "category",
        "summary",
        "published_at as publishedAt"
      );

    ok(res, rows);
  })
);

router.get(
  "/awards",
  asyncHandler(async (_req, res) => {
    const rows = await db("awards")
      .orderBy("order_index")
      .select(
        "year",
        "title",
        "organisation",
        "note"
      );

    ok(res, rows);
  })
);

router.get(
  "/testimonials",
  asyncHandler(async (_req, res) => {
    const rows = await activeQuery("testimonials")
      .orderBy("order_index")
      .select(
        "name",
        "role",
        "company",
        "rating",
        "quote"
      );

    ok(res, rows);
  })
);
router.get(
  "/team",
  asyncHandler(async (_req, res) => {
    const rows = await activeQuery("team_members")
      .orderBy("order_index")
      .select(
        "name",
        "role",
        "initials",
        "founder",
        "accent",
        "bio"
      );

    ok(res, rows);
  })
);
router.get(
  "/comments",
  asyncHandler(async (_req, res) => {
    const rows = await db("comments")
      .where({ is_approved: true })
      .orderBy("submitted_at", "desc")
      .select(
        "id",
        "name",
        "rating",
        "message",
        "submitted_at as submittedAt"
      );

    ok(res, rows);
  })
);

router.post(
  "/comments",
  commentLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, rating, message } = req.body || {};

    const errors = [];

    if (!isValidName(name))
      errors.push("Valid name required.");

    if (!isValidEmail(email))
      errors.push("Valid email required.");

    if (!isValidRating(rating))
      errors.push("Rating must be between 1 and 5.");

    if (!message || message.trim().length < 10)
      errors.push("Message must contain at least 10 characters.");

    if (errors.length)
      return fail(res, errors);

    const record = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating: Number(rating),
      message: message.trim(),
    };

    const [id] = await db("comments").insert(record);

    return ok(
      res,
      {
        ok: true,
        id,
        ...record,
      },
      201
    );
  })
);
router.post(
  "/orders",
  requireAuth,
  orderLimiter,
  asyncHandler(async (req, res) => {
    const { itemType, itemId } = req.body || {};

    if (!["product", "service"].includes(itemType)) {
      return fail(
        res,
        "itemType must be product or service."
      );
    }

    const table =
      itemType === "product"
        ? "products"
        : "services";

    const item = await db(table)
      .where({
        slug: String(itemId || ""),
        is_active: true,
      })
      .first();

    if (!item) {
      return fail(
        res,
        "Item not found.",
        404
      );
    }

    const [id] = await db("orders").insert({
      user_id: req.user.sub,
      item_type: itemType,
      item_id: item.id,
      item_name: item.name,
      item_price:
        itemType === "product"
          ? item.price
          : item.starting_price,
    });

    return ok(
      res,
      {
        id,
        itemType,
        itemName: item.name,
        status: "pending",
      },
      201
    );
  })
);

router.get(
  "/orders/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await db("orders")
      .where({ user_id: req.user.sub })
      .orderBy("created_at", "desc")
      .select(
        "id",
        "item_type as itemType",
        "item_name as itemName",
        "item_price as itemPrice",
        "status",
        "created_at as createdAt"
      );

    ok(res, rows);
  })
);

router.post(
  "/contact",
  contactLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body || {};

    const errors = [];

    if (!isValidName(name))
      errors.push("Valid name required.");

    if (!isValidEmail(email))
      errors.push("Valid email required.");

    if (!subject || subject.trim().length < 3)
      errors.push("Subject is too short.");

    if (!message || message.trim().length < 10)
      errors.push("Message is too short.");

    if (errors.length)
      return fail(res, errors);

    await db("contact_messages").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return ok(res, {
      message: "Message sent successfully.",
    }, 201);
  })
);

module.exports = router;


