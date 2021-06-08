import { register } from './app.js';

const registerForm = document.querySelector(".register-form");

window.addEventListener("load", () => {
    const client = JSON.parse(localStorage.getItem("client"));
    if(client) {
        localStorage.removeItem("client");
    }
});

registerForm.addEventListener("submit", e => {

    e.preventDefault();
    const response = document.querySelector("#response");
    const { username, email, password } = e.target.elements;
    //You probably wondering why I have if statement messed like this... simply
    // because I do not why the **ck someone would just submit a form without inputs😂😂🤣
    if(!username.value || !email.value || !password.value || password.value.length < 4 || email.value.length < 2 || username.value.length < 1) {
        response.innerHTML = "Invalid inputs";
        return;
    }
    register(username.value, email.value, password.value);
});