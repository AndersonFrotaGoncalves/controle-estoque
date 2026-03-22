/* 🔒 PROTEÇÃO DE ACESSO */

const usuarioSalvo = localStorage.getItem("usuario");

if (!usuarioSalvo) {
    window.location.href = "login.html";
}

/* 👤 USUÁRIO LOGADO */

let nomeUsuario = "";

try {

    const dados = JSON.parse(usuarioSalvo);
    nomeUsuario = dados.nome || dados.email || "Usuário";

} catch {

    nomeUsuario = usuarioSalvo;

}

const elementoUsuario = document.getElementById("usuarioLogado");

if (elementoUsuario) {
    elementoUsuario.innerText = nomeUsuario;
}