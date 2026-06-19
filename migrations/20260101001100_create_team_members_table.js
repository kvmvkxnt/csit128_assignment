exports.up = (knex) =>
  knex.schema.createTable("team_members", (t) => {
    t.increments("id").primary();
    t.string("name", 100).notNullable();
    t.string("role", 150).notNullable();
    t.string("initials", 5);
    t.boolean("founder").notNullable().defaultTo(false);
    t.string("accent", 10);
    t.text("bio");
    t.boolean("is_active").notNullable().defaultTo(true);
    t.integer("order_index").notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("team_members");
