require("dotenv").config();
const jwt = require("jsonwebtoken");
TOKEN_KEY='dfasdfwgwr'


module.exports.createSecretToken = (id) => {
  return jwt.sign({ id }, TOKEN_KEY, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};