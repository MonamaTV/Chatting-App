import { createRoom, getRooms, clearOldClient } from './app.js';

const createRoomButton = document.querySelector(".create-btn");
const logout = document.querySelector(".icon-btn");

window.addEventListener("load", e => {

    const client = JSON.parse(localStorage.getItem("client"));
    if(!client) {
        window.location = "../index.html";
    }
    getRooms();

});

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

logout.addEventListener("click", () => {
    clearOldClient();
    window.location = "../index.html";
});

createRoomButton.addEventListener("click", e => {
    e.preventDefault();
    createRoom();
    //Close modal
    const modal = document.querySelector(".create-modal");
    modal.style.display = "none";
})