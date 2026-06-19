require("dotenv").config({ quiet: true });
const knexLib = require("knex");
const knexfile = require("../../knexfile");

// Runs once before the whole test suite: resets the test schema to a
// known state (full rollback + fresh migrate + seed) so tests never
// depend on leftover data from a previous run.
module.exports = async () => {
  const db = knexLib(knexfile.test);
  await db.migrate.rollback({}, true);
  await db.migrate.latest();
  await db.seed.run();
  await db.destroy();
};
