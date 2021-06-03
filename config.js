/** Common config for bookstore. */
// read .env files and make environmental variables

const ENV = require("dotenv").config().parsed;


let DB_URI = ENV.DB_BASE_URI || "postgresql://";

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/books_test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
}


module.exports = { DB_URI };