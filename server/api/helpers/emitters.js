//Emit to clients that user left room
const emitter = (io, socket, response, roomID, username, type,  email) => {
    socket.to(roomID).emit(type, {
        response,
        username,
        email
    });
}

const leaveRoomEmitter = (io, socket, response, roomID, username) => {     
    if(response.success) {
        emitter(io, socket, response, roomID, username, "leaveroom", "");
    }
}

//Broadcast that user joined room
const joinRoomEmitter = (io, socket, response, roomID, username, email) => {
    if(response.success) {
        emitter(io, socket, response, roomID, username, "joinroom", email);
    }
};
const chatMessageEmitter = (io, socket, data, response) => {
    
    const { roomID, senderEmail, senderName, content } = data;

    socket.join(roomID);

    io.to(roomID).emit("usertyping", "");
    
    if(response.success) {
       io.to(roomID).emit("chatmessage", {
            senderName, 
            content,
            senderEmail,
            success: true,
            createdAt: Date.now()
        })
    }
}

module.exports = {
    chatMessageEmitter,
    leaveRoomEmitter,
    joinRoomEmitter
}