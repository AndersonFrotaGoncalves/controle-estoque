function verificarLogin(){

    const usuario = localStorage.getItem("usuario");

    if(!usuario){
        window.location.href = "login.html";
        return;
    }

    try{

        const dadosUsuario = JSON.parse(usuario);

        const campoUsuario = document.getElementById("usuarioLogado");

        if(campoUsuario){
            campoUsuario.innerText = dadosUsuario.nome;
        }

    }catch{
        console.log("Erro ao ler usuário");
    }

}

verificarLogin();