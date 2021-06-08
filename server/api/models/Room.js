const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Message = new Schema({
    content: {
        type: String,
    },
    senderEmail: {
        type: String,
    },
    senderName: {
        type: String,
    },
    createdAt: {
        type: String,
        default: Date.now
    }
});

const Room = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        default: 'ChatTV'
    },
    roomName: {
        type: String
    },
    messages: [Message],
    users: []
});

const rooms = mongoose.model("rooms", Room);

module.exports = Message;
module.exports = rooms;