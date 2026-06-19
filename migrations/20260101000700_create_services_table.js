exports.up = (knex) =>
  knex.schema.createTable("services", (t) => {
    t.increments("id").primary();
    t.string("slug", 60).notNullable().unique();
    t.string("name", 150).notNullable();
    t.string("icon", 50);
    t.string("summary", 255);
    t.text("details");
    t.string("starting_price", 50);
    t.boolean("is_active").notNullable().defaultTo(true);
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("services");
