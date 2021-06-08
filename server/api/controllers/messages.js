const rooms = require("../models/Room");
const moment = require("moment");

const getMessages = async (roomID, email) => {

    if(!roomID || !email) return {
        message: "Failed to get messages",
        success: false
    }

    try {
        const messages = await rooms.findOne({_id: roomID, 
            "users": {
                "$in": [email]
            }
        });

        return {
            roomID,
            messages,
            message: "Your chat messages",
            success: true
        };

    } catch (error) {
        return {
            message: "Failed to get chat messages",
            success: false
        };
    }
}

const sendMessage = async (roomID, senderEmail, senderName, content) => {

    if(!senderEmail || !senderName || !content || !roomID) {
        return {
            message: "Message failed to send",
            success: false
        }
    }
    
    const createdAt = moment().format();
   
    try {
        const message = {
            senderName,
            senderEmail,
            content,
            createdAt
        };

        await rooms.updateOne({_id: roomID}, {
            "$push": {
                messages: message
            } 
        });

        return {
            message: "Your message is sent",
            success: true
        }

    } catch (error) {
        return {
            message: "Message failed to send",
            success: false
        }
    }


}

module.exports = {
    getMessages,
    sendMessage
}