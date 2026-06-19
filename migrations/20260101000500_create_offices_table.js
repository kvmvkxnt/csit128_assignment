exports.up = (knex) =>
  knex.schema.createTable("offices", (t) => {
    t.increments("id").primary();
    t.string("slug", 60).notNullable().unique();
    t.string("city", 100).notNullable();
    t.string("country", 100).notNullable();
    t.string("role", 150);
    t.integer("opened");
    t.string("address", 255);
    t.text("blurb");
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("offices");
