// Credentials:
const username = "admin";
const password = "admin123";

const handleLogin = () => {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;

    if (username === usernameInput && password === passwordInput) {
        document.getElementById("invalide-credentials").classList.add("hidden");
        window.location.assign("./home.html");
    } else {
        document.getElementById("invalide-credentials").classList.remove("hidden");
    }

}