exports.up = (knex) =>
  knex.schema.createTable("company_stats", (t) => {
    t.increments("id").primary();
    t.string("label", 100).notNullable();
    t.string("value", 50).notNullable();
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("company_stats");
