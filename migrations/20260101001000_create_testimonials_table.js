exports.up = (knex) =>
  knex.schema.createTable("testimonials", (t) => {
    t.increments("id").primary();
    t.string("name", 100).notNullable();
    t.string("role", 100);
    t.string("company", 100);
    t.tinyint("rating").notNullable().defaultTo(5);
    t.text("quote").notNullable();
    t.boolean("is_active").notNullable().defaultTo(true);
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("testimonials");
