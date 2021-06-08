// const rooms = require("../models/Room");
const rooms = require("../models/Room");

const createRoom = async (email, username, roomName) => {
    try {
        const room = new rooms({
            users: [email],
            createdBy: username,
            messages: [],
            roomName
        });

        const newRoom = await room.save();
        return {
            room: newRoom,
            success: true,
            message: "Room created"
        };
    } catch (error) {
        return {
            message: "Could not create room",
            success: false
        }
    }
}

const isUserInTheRoom = async (email, roomID) => {
    try {
        const roomsdb = await rooms.findOne({_id: roomID, 
            "users.": {
                $in :[email]
            }
        });

        return !!roomsdb;

    } catch (error) {
        console.log(error);
    }
}

const getRooms = async (data) => {
    const { email } = data;
    try {
        const roomsdb = await rooms.find({
            "users": {
                "$in": [email]
            }
        }).sort({createdAt: 0});

        return {
            rooms: roomsdb,
            message: "Your rooms",
            success: true
        }
    } catch (error) {
        return {
            message: "Could not find rooms",
            success: false
        }
    }
};

const joinRoom = async (email, roomID) => {

    try {
        await rooms.updateOne({_id: roomID}, {
            "$push": {
                users: email
            } 
        });

        return {
            message: "User joined room",
            success: true
        }

    } catch (error) {
        return {
            message: "Failed to join room",
            success: false
        }
    }

};

const leaveRoom = async (email, roomID) => {

    if(!email || !roomID) return {
        message: "Failed to leave room",
        success: false
    }

    try {
        await rooms.updateOne({_id: roomID}, {
            "$pull": {
                users: email
            }
        });

        return {
            message: "Left room",
            success: true,
        }
        
    } catch (error) {
        return {
            message: "Failed to leave room. Try again",
            success: false
        }
    }

};


module.exports = {
    createRoom,
    getRooms,
    joinRoom,
    leaveRoom,
    isUserInTheRoom
}