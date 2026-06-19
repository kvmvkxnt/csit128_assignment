exports.up = (knex) =>
  knex.schema.createTable("comments", (t) => {
    t.increments("id").primary();
    t.integer("user_id").unsigned().nullable();
    t.foreign("user_id").references("users.id").onDelete("SET NULL");
    t.string("name", 100).notNullable();
    t.string("email", 190).notNullable();
    t.tinyint("rating").notNullable();
    t.text("message").notNullable();
    t.boolean("is_approved").notNullable().defaultTo(true);
    t.timestamp("submitted_at").notNullable().defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTableIfExists("comments");
