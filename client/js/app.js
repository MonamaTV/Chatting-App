//Connection established
const socket = io("http://localhost:3000");

const BASE_URL = socket.io.uri;

//DOM variables
const response = document.querySelector("#response");


//Clears the client that might have logged in before the current user
export const clearOldClient = () => localStorage.removeItem("client");
//Save the client to persist during the session
const saveClientToLocalStorage = (data) => {
    try {
        localStorage.setItem("client", JSON.stringify(data)); 
    } catch (error) {
        saveClientToLocalStorage(data);
    }
}
//Retrieves client details
const getSavedClient = () => {
    try {
        const client = JSON.parse(localStorage.getItem("client"));     
        return client;
    } catch (error) {
        return null;
    }
}
const postData = (url, body) => {
    //TODO
}

const getData = (url) => {
    //TODO
}
//Render rooms
const renderRooms = (rooms) => {
    rooms && rooms.forEach(room => {
        renderRoom(room);
    });
}
//Render room 
const renderRoom = ({ roomName, createdBy, _id}) => {
    
    const room = document.createElement("a");

    const rooms = document.querySelector(".rooms");

    room.href = `chat.html?id=${_id}`;

    room.className = "room";

    room.innerHTML = `<p>${roomName}</p> <small>Created by ${createdBy}</small>`;

    rooms.appendChild(room);
}

//A login function
export const login = (email, password) => {

    socket.emit("login", {
        email,
        password
    });

    socket.on("login", data => {
        if(!data.success) {
            response.innerHTML = data.message;
        }
        else {
            const { email, username } = data;

            const client = {
                email,
                username
            }

            clearOldClient();
            saveClientToLocalStorage(client);
            //Move to home screen
            window.location.href = "../views/home.html";
        }
    })
}
//Register
export const register = (username, email, password) => {
    
    socket.emit("register", {
        username,
        email,
        password
    });

    socket.on("register", data => {
        
        if(!data.success) {
            response.innerHTML = data.message;
        }
        else {
            const { email, username } = data;

            const client = {
                email,
                username
            }
            saveClientToLocalStorage(client);

            window.location.href = "../views/home.html";

        }
    })
}

export const init = (id) => {
    const client = getSavedClient();
    if(!id) {
        return;
    }
    if(!client) {
        window.location.href = "../index.html";
        return;
    }

    //Load all the neccesary functions
    listenigToUserTyping(client.email);
    //Gets messages
    getMessages(id, client);

    socket.on("chatmessage", data => {
        if(!data.success) {
            alert(data.message);
        }
        else {
            const { senderName, content, createdAt } = data;
            const sentByMe = (data.senderEmail === client.email);
            renderMessage({
                senderName,
                content,
                createdAt
            }, sentByMe);
        }
    });
   
    //When a client leaves/joins a room
    listenToEmitters("joinroom", client.email);
    listenToEmitters("leaveroom", "");
};

//When entering a chat, it retrives the chat's messages
const getMessages = async (id, client) => {

    const { email, username } = client;
    const responsedb = await fetch(`${BASE_URL}/rooms/${id}/messages/${email}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await responsedb.json();

    if(!data.success) {
        alert(data.message)
    }
    else {
        
        //If client is requesting a room they are not in... they are prompt to enter the room
        if(!data.inRoom) {
            if(confirm("You are not in this room. Do you want to join?")) {
                joinRoom(email, username, data.roomID);
            }
            else window.location.href = "./home.html";
            return;
        };
        const chat = document.querySelector("#chat-name");
        chat.innerText = data.messages.roomName;
        const messages = data.messages;     
        renderMessages(messages.messages, email)
    }
}

const listenToEmitters = (type, email = "") => {
    
    socket.on(type, data => {
        const { username, response } = data;
        if(!response.success) {
            alert(data.response);
        }
        else {
            if(type === "joinroom") {
                if(data.email === email) 
                    userRoom(username, ", welcome to a new ChatTV room!");
                else userRoom(username, " has joined the room"); 
            }
            if(type === "leaveroom") {
                userRoom(username);
            }   
        }
    });
}

const listenigToUserTyping = (email) => {
    const typingIndicator = document.querySelector(".typing");
    socket.on("usertyping", data => {
        if(data.success) {
            if(data.email !== email) {
                typingIndicator.innerHTML = `${data.username} 
                is typing...`;
            }
        }
        else typingIndicator.innerHTML = "";
    });
}
//sends message and append to the screen
export const chatMessage = async (roomID, senderName, senderEmail, content) => {
    socket.emit("chatmessage", {
        roomID, 
        senderName, 
        senderEmail, 
        content
    }); 

    const {day, month, year} = setFormatDate();
    const createdAt = `${year}-${month}-${day}` + "T" + setFormatTime();
    
    renderMessage({
        senderName,
        content,
        createdAt
    }, true);
}
//Renders messages
const renderMessages = (messages, email) => {
    messages && messages.forEach(message => {
        const sentByMe = message?.senderEmail === email ? true : false; 
        renderMessage(message, sentByMe);
    });
}

const setFormatDate = () => {

    const date = new Date();
    const day = date.getDate() < 10 ? "0".concat(date.getDate()) : date.getDate().toString();
    const year =  date.getFullYear();
    const month = date.getMonth() < 10 ? "0".concat(1+ (+date.getMonth())) : date.getMonth().toString();

    return { day, year, month };
}

const setFormatTime = () => {

    let time = new Date().toLocaleTimeString({ hour12: false});

    return time.substr(0, 5);
}

const formatTime = (time) => {

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const {day, month, year } = setFormatDate();
   
    const formatNowDate = `${year}-${month}-${day}`
    
    const dateSplit = time.split("T");
    const dateMessageSent = dateSplit[0];
   
    const timeMesssageSent = dateSplit[1].slice(0, 5);

    if(dateMessageSent === formatNowDate) {
        return timeMesssageSent;
    }
    else {
        let index = +month;
        return months[--index] + " " +dateMessageSent.substr(8,9); 
    }
    
}
//Render message 
const renderMessage = (message, sentByMe) => {

    const { content, senderName, createdAt } = message;

    const div = document.createElement("div");

    const messages =  document.querySelector(".messages");

    div.className = sentByMe ? "client-message" : "friend-message";

    const time = formatTime(createdAt);

    div.innerHTML = `<small>${sentByMe ? 'You' : senderName} at ${time}</small> <p>${content}</p>`;

    messages.appendChild(div);

    window.scroll(100, messages.scrollHeight)
    
}
//Get rooms belonging to the email(client)
export const getRooms = async () => {

    const { email } =  getSavedClient();

    const responsedb = await fetch(`${BASE_URL}/rooms/${email}`, {
        method: "GET"
    });

    const data = await responsedb.json();

    if(!data.success) {
        response.innerHTML = data.message;
    }
    else {
        const rooms = data.rooms;
        renderRooms(rooms);
    }
}
//Leave a room
export const leaveRoom = async (roomID, email, username) => {

    const responsedb = await fetch(`${BASE_URL}/rooms/leaveroom/${roomID}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            email
        })
    });

    const data = await responsedb.json();

    if(!data.success) {
        alert(data.message);
    }
    else {
        alert(data.message);
        window.location.href = "../views/home.html";
    }
}
//Helper function
const userRoom = (username, message = " has left the room") => {
    
    const div = document.createElement("div");

    div.className = "user-leave-room";

    div.innerHTML = `<small>${username}${message}</small>`;

    const messages =  document.querySelector(".messages");

    messages.appendChild(div);

    window.scroll(100, messages.scrollHeight)

}
//Create a room
export const createRoom = async () => {

    const room = document.querySelector("#roomname");

    const client = getSavedClient();

    if(!client) {
        window.location.href = "../index.html";
    }

    const { username, email } = client;

    const responsedb = await fetch(`${BASE_URL}/rooms/createroom/`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            email,
            roomName: room.value
        })
    });

    const data = await responsedb.json();

    if(!data.success) {
        response.innerHTML = data.message;
    }
    else {
        renderRoom(data?.room);
    }
}
//Join
const joinRoom = async (email, username, roomID) => {
   
    const response = await fetch(`${BASE_URL}/rooms/joinroom/${roomID}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            username
        })
    });
    const data = await response.json();
    if(!data.success) {
        alert(data.message);
        return;
    }
    getMessages(roomID, { email, username});
}
//Some nice features
export const userTyping = (username, email, roomID) => {
    socket.emit("usertyping", {
        username,
        email, 
        roomID
    }); 
};

export const verifyToken = async (token) => {

    const email = getChangePasswordEmail();

    if(!email) {
        response.innerHTML = "Please restart the process from <a href=''> </a>"
        return;
    }

    const responsedb = await fetch(`${BASE_URL}/users/verifytoken`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            email,
            token
        }
    });

    const data = await responsedb.json();

    if(!data.success) {
        response.innerHTML = data.message;
    } 
    else {
        window.location.href = "../views/changepassword.html";
    }
}

//Save email
const changePasswordEmail = (email) => localStorage.setItem("changepasswordemail", email);
//Get email
const getChangePasswordEmail = () => localStorage.getItem("changepasswordemail");

export const resetPassword = async (email) => {

    changePasswordEmail(email);

    const responsedb = await fetch(`${BASE_URL}/users/resetpassword`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email
        })
    });

    const data = await responsedb.json();

    if(!data.success) {
        response.innerHTML = data.message;
    }
    else {
        window.location.href = "../views/token.html";
    }

}

export const changePassword = async (password) => {
    
    const email = getChangePasswordEmail();

    const responsedb = await fetch(`${BASE_URL}/users/changepassword`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            email,
            password
        }
    });
    //The code below appears too much needs to be put in a function
    const data = responsedb.json();
    
    if(!data.success) {
        response.innerHTML = data.message;
    }
    else {
        window.location.href = "../index.html";
    }
};