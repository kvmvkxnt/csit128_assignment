exports.up = (knex) =>
  knex.schema.createTable("timeline", (t) => {
    t.increments("id").primary();
    t.integer("year").notNullable();
    t.string("milestone", 150).notNullable();
    t.text("detail");
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("timeline");
