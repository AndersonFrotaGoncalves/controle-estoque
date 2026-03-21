const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario || usuario.role !== "admin") {
    alert("Apenas administrador pode acessar");
    window.location.href = "dashboard.html";
}

const api = "/api/usuarios"; // 🔥 CORRETO

/* ====================
CARREGAR
==================== */
async function carregarUsuarios(){

    const res = await fetch("/usuarios");
    const usuarios = await res.json();

    const tabela = document.querySelector("#tabelaUsuarios tbody");

    tabela.innerHTML = "";

    usuarios.forEach(u => {

        tabela.innerHTML += `
        <tr>
            <td>${u.id}</td>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>
                <button onclick="editarUsuario(${u.id})">Editar</button>
                <button onclick="excluirUsuario(${u.id})">Excluir</button>
            </td>
        </tr>
        `;

    });

}

carregarUsuarios();


/* ====================
NOVO USUÁRIO
==================== */
function novoUsuario(){

    const nome = prompt("Nome:");
    const email = prompt("Email:");
    const senha = prompt("Senha:");
    const role = prompt("Permissão (admin/user):");

    fetch("/usuarios", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ nome, email, senha, role })
    })
    .then(() => carregarUsuarios());

}


/* ====================
EDITAR
==================== */
function editarUsuario(id){

    const nome = prompt("Novo nome:");
    const email = prompt("Novo email:");
    const role = prompt("Permissão (admin/user):");
    const senha = prompt("Nova senha (deixe vazio para não alterar):");

    fetch(`/usuarios/${id}`, {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ nome, email, role, senha })
    })
    .then(() => carregarUsuarios());

}


/* ====================
EXCLUIR
==================== */
function excluirUsuario(id){

    if(!confirm("Excluir usuário?")) return;

   fetch(`/usuarios/${id}`,{
        method:"DELETE"
    })
    .then(() => carregarUsuarios());

}