/* 🔒 PROTEÇÃO DE ACESSO */

const usuarioSalvo = localStorage.getItem("usuario");

if (!usuarioSalvo) {
    window.location.href = "login.html";
}

/* 👤 USUÁRIO LOGADO */

let nomeUsuario = "";

try {

    const dados = JSON.parse(usuarioSalvo);
    if (dados.nome) {
    nomeUsuario = dados.nome;
} else if (dados.email) {
    nomeUsuario = dados.email.split("@")[0]; // 🔥 pega só "anderson"
} else {
    nomeUsuario = "Usuário";
}
} catch {

    nomeUsuario = usuarioSalvo;

}

const elementoUsuario = document.getElementById("usuarioLogado");

if (elementoUsuario) {

    const nomeFormatado = nomeUsuario
        .toLowerCase()
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");

    elementoUsuario.innerText = nomeFormatado;
}