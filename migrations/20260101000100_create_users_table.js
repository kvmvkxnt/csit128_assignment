exports.up = (knex) =>
  knex.schema.createTable("users", (t) => {
    t.increments("id").primary();
    t.string("name", 100).notNullable();
    t.string("email", 190).notNullable().unique();
    t.string("password_hash", 255).notNullable();
    t.enu("role", ["user", "admin"]).notNullable().defaultTo("user");
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("users");
