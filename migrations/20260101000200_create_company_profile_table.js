exports.up = (knex) =>
  knex.schema.createTable("company_profile", (t) => {
    t.increments("id").primary();
    t.string("name", 150).notNullable();
    t.string("legal_name", 150);
    t.string("tagline", 255);
    t.integer("founded");
    t.string("headquarters", 150);
    t.string("email", 190);
    t.string("phone", 50);
    t.text("mission");
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("company_profile");
