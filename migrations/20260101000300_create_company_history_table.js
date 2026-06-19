exports.up = (knex) =>
  knex.schema.createTable("company_history", (t) => {
    t.increments("id").primary();
    t.text("paragraph").notNullable();
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("company_history");
