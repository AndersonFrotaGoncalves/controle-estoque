/* USUÁRIO LOGADO */

const usuarioSalvo = localStorage.getItem("usuario");

if (usuarioSalvo) {

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

}
