import { chatMessage, userTyping, leaveRoom, init } from './app.js';

//Get query
const query = location.search;
const id = query.split("=")[1];

//DOM variables
const messageForm = document.querySelector(".message-form");
const messageInput = document.querySelector("#message");
const leavebtn = document.querySelector(".room-btn");
const sharebtn = document.querySelector(".icon-btn");
const search = document.querySelector("#search-room");
const rooms = document.getElementsByClassName("room");

//Search rooms you joined
search.addEventListener("keyup", () => {
    // e.preventDefault();
    const value = search.value.toString().toLowerCase();

    Array.from(rooms).forEach(room => {
        const innerText = room.innerText;
        if(innerText.toLowerCase().indexOf(value) != -1) {
            room.style.display = "block";
        }
        else {
            room.style.display = "none";
        }
    })
})

//Get client from local storage
const client = JSON.parse(localStorage.getItem("client"));

//client shares room
sharebtn.addEventListener("click", e => {
    const shareRoom = {
        title: "Share room",
        message: "Send room to your friends",
        url: location.href
    }

    try {
        if(navigator.share) {
            navigator.share(shareRoom);
        }
        else {
            alert("Your browser does not support this feature");
        }
    } catch (error) {
        alert("Failed to share room");
    }
})

//Client leaves the room
leavebtn.addEventListener("click", e => {

    const { username, email } = client;

    leaveRoom(id, email, username);

    window.location = "./home.html";
})

window.addEventListener("load", e => {

    e.preventDefault();

    if(!client) {
        window.location = "../index.html";
    }

    init(id);

});

messageInput.addEventListener("keypress", () => {

    const { username, email } = client;
  
    userTyping(username, email, id);
})


messageForm.addEventListener("submit", e => {

    e.preventDefault();

    const { message } = e.target.elements;

    const { username, email } = client;
    if(message.value === "" || message.value.length < 1) return; 

    chatMessage(id, username, email, message.value);

    e.target.elements.message.value = "";
})