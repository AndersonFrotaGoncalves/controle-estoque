function verificarLogin() {

    const usuario = localStorage.getItem("usuario");

    if (!usuario) {
        window.location.href = "login.html";
    }

}

verificarLogin();