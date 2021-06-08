import { login }from './app.js';

//DOM variables
const loginForm = document.querySelector(".login-form");

window.addEventListener("load", () => {
    const client = JSON.parse(localStorage.getItem("client"));
    if(client) {
        localStorage.removeItem("client")
    }

});

loginForm.addEventListener("submit", e => {
    console.log("Here")

    //Prevent default form submission
    e.preventDefault();
    
    const response = document.querySelector("#response");
    //Form values
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    if(!email || !password || password.length < 4 || email.length < 2) {
        response.innerHTML = "Invalid inputs";
        return;
    }
    //Handle login
    login(email, password);
})