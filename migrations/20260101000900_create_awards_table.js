exports.up = (knex) =>
  knex.schema.createTable("awards", (t) => {
    t.increments("id").primary();
    t.integer("year").notNullable();
    t.string("title", 150).notNullable();
    t.string("organisation", 150);
    t.string("note", 255);
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("awards");
