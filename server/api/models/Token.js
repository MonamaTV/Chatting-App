const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const requirements = {
    type: String,
    required: true,
}
const Token = new Schema({
    email: requirements,
    token: requirements
});

const tokens = mongoose.model("Tokens", Token);
module.exports = tokens;