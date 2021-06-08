const router = require("express").Router();
//Business logic
const { getMessages, sendMessage } = require("../controllers/messages");
//"Business" logic
const { getRooms, 
        createRoom, 
        leaveRoom, 
        joinRoom, 
        isUserInTheRoom } = require("../controllers/rooms");
//Emitters
const { joinRoomEmitter, 
        leaveRoomEmitter, 
        chatMessageEmitter } = require("../helpers/emitters");

//@route GET /:email
//@desc Get rooms
router.get("/:email?", async (req, res) => {

    const body = req.params;
   
    if(!body) return res.status(400).send({
        message: "Invalid inputs",
        success: false
    });
    
    try {
        const response = await getRooms(body);
        res.status(200).send(response);
    } catch (error) {
       res.status(401).send({
           message: "Failed to get rooms",
           success: false
       })
    }
});

//@route POST /createroom
//@desc creates a new room
router.post("/createroom", async (req, res) => {

    const { email, roomName, username } = req.body;
    if(!email || !roomName || !username) return res.status(400).send({
        message: "Invalid inputs",
        success: false
    });

    try {
        const response = await createRoom(email, username, roomName);
        res.status(200).send(response);
    } catch (error) {
        res.status(401).send({
            message: "Failed to create room",
            success: false
        });
    }
});

//@route POST /leaveroom/:roomID
//@desc When a client leaves room
router.post("/leaveroom/:roomID", async (req, res) => {

    const { roomID } = req.params;

    const { io, socket } = req.app.locals;

    const { email, username } = req.body;

    if(!email || !roomID || !username) return res.status(400).send({
        message: "Invalid inputs",
        success: false
    });

    try {
        socket.join(roomID);
        const response = await leaveRoom(email, roomID);
        //Emitter
        leaveRoomEmitter(io, socket, response, roomID, username);

        response.username = username;

        res.status(200).send(response);  
    } catch (error) {
        res.status(401).send({
            message: "Failed to leave room",
            success: false
        });
    }
});

//@route POST /joinroom/:roomID
//@desc a new client joins room
router.post("/joinroom/:roomID", async (req, res) => {

    const { roomID } = req.params;

    const { io, socket } = req.app.locals;

    const { email, username } = req.body;

    if(!email || !roomID || !username) return res.status(400).send({
        message: "Invalid inputs",
        success: false
    });

    try {
        socket.join(roomID);
        const response = await joinRoom(email, roomID);
        //Emit
        joinRoomEmitter(io, socket, response, roomID, username, email);

        response.username = username;

        res.status(200).send(response);
    } catch (error) {
        res.status(401).send({
            message: "Failed to join room",
            success: false
        });
    }
});

//@route /:id/messages/:email
//@desc Get messages... whose messages? Here is their email address
router.get("/:roomID/messages/:email", async (req, res) => {

    const { roomID, email } = req.params;
    const { socket } = req.app.locals;

    if(!email || !roomID) return res.status(400).send({
        message: "Invalid inputs",
        success: false
    });

    try {
        socket.join(roomID);
        
        const response = await getMessages(roomID, email);

        const inRoom = await isUserInTheRoom(email, roomID);

        response.inRoom = inRoom;

        res.status(200).send(response);
    } catch (error) {
        res.status(400).send({
            message: "Failed to get message",
            success: false
        });
    }
});

//@route POST /:id/messages
//@desc Add a new message
router.post("/:roomID/messages", async (req, res) => {

    const { roomID } = req.params;

    const { io, socket } = req.app.locals;

    
    const { senderEmail, senderName, content } = req.body;
    
    if(!roomID || !senderEmail || !senderName || !content) 
    return res.status(400).send({
        message: "Invalidd inputs",
        success: false
    });
    
    try {
        socket.join(roomID);
        const response = await sendMessage(roomID, senderEmail, senderName, content);
        //Emit
        chatMessageEmitter(io, socket, req.body, response);
        res.status(200).send(response);
    } catch (error) {
        console.log(error)
        res.status(400).send({
            message: "Invalid inputs",
            success: false
        })
    }
});

module.exports = router;