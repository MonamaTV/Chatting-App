const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    }
});

const users = mongoose.model("users", User);
module.exports = users;