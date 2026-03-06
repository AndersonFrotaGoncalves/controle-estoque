// verifica se o usuário está logado
function verificarLogin() {

    const token = localStorage.getItem("token");
    const usuario = localStorage.getItem("usuario");

    if (!token || !usuario) {
        window.location.href = "login.html";
        return;
    }

    // mostra o usuário logado se existir o elemento
    const usuarioElemento = document.getElementById("usuarioLogado");

    if (usuarioElemento) {
        usuarioElemento.textContent = "👤 " + usuario;
    }

}

// logout do sistema
function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    window.location.href = "login.html";

}

// executa ao carregar a página
verificarLogin();