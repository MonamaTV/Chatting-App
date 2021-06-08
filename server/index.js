//Express application
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const moment = require("moment");

//Database configuration
const databaseConnection = require("./api/database/connection");

//User functions
const { loginUser, registerUser } = require("./api/controllers/users");

//Room functions
const { createRoom,
        getRooms, 
        leaveRoom, 
        isUserInTheRoom, 
        joinRoom } = require("./api/controllers/rooms");

//Message functions
const { sendMessage, getMessages } = require("./api/controllers/messages");

//Routes imports
const rooms = require("./api/routes/rooms");
const users = require("./api/routes/users");

//Config
const app = express();
app.use(express.json());
dotenv.config();
app.use(cors());

//Allow socket.io to listens to emits
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*"}});

//Home route
app.get("/", (req, res) => {
    res.send("You are home of the ChatTV app root route");
});

//Route middleware
app.use("/rooms", rooms);
app.use("/users", users);

//Connection from clients
io.on("connection", socket => {

    app.locals.io = io;
    app.locals.socket = socket;
    console.log(socket.id);
    //client logins and emit response back to the client 
    socket.on("login", async (data) => {

        const { email, password } = data;

        const response = await loginUser(email, password);
       
        socket.emit("login", response);
        
    });

    //client register and emit response back to the client
    socket.on("register", async (data) => {
        
        const { username, email, password } = data;

        const response = await registerUser(username, email, password);

        socket.emit("register", response);
    });


    

   

    //Client sends message, emits back to the clients
    socket.on("chatmessage", async (data) => {
        
        const {roomID, senderEmail, senderName, content } = data;
        socket.join(roomID); 
        
        const response = await sendMessage(roomID, senderEmail, senderName, content);
        
        socket.to(roomID).emit("usertyping", "");
        const time =  moment().format();
        console.log(time)
        if(response.success) {
            socket.to(roomID).emit("chatmessage", {
                senderName, 
                content,
                senderEmail,
                success: true,
                createdAt: time
            })
        }
    });
   
    //Additional features
    socket.on("usertyping", data => {

        const { username, email, roomID } = data;
        
        socket.join(roomID);

        socket.to(roomID).emit("usertyping", {
            username,
            email,
            success: true,
        })
    });


    io.on("disconnect", () => {
        console.log("Well... well.")
    })

});


databaseConnection;

server.listen(process.env.PORT, err => {
    if(err) console.log(err);
    console.log("Server is running on port:" + 3000);
});