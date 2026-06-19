exports.up = (knex) =>
  knex.schema.createTable("products", (t) => {
    t.increments("id").primary();
    t.string("slug", 60).notNullable().unique();
    t.string("name", 150).notNullable();
    t.string("category", 80);
    t.text("description");
    t.string("price", 50);
    t.string("image_url", 255);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("products");
