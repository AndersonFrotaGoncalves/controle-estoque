const usuario = JSON.parse(localStorage.getItem("usuario"));

const ehAdmin = usuario && usuario.role === "admin";
if (!ehAdmin) {
    alert("Only administrators can open this page");
    window.location.replace("dashboard.html");
}


/* ====================
CARREGAR
==================== */
async function carregarUsuarios(){

    if (!ehAdmin) return;
    const res = await fetch("/usuarios");
    const usuarios = await res.json();
    if (!res.ok) { alert(usuarios.error || "Error loading users"); return; }

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
                <button onclick="editarUsuario(${u.id})">Edit</button>
                <button onclick="excluirUsuario(${u.id})">Delete</button>
            </td>
        </tr>
        `;

    });

}

carregarUsuarios();


/* ====================
API REQUEST (shows the server error, if any)
==================== */
async function enviar(url, metodo, corpo){
    const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok) alert(dados.error || "The action could not be completed.");
    carregarUsuarios();
}

/* ====================
NEW USER
==================== */
function novoUsuario(){
    const nome = prompt("Name:");
    if (nome === null) return;          // cancelled
    const email = prompt("Email:");
    if (email === null) return;
    const senha = prompt("Password (at least 6 characters):");
    if (senha === null) return;
    const role = prompt("Role (admin/user):", "user");
    if (role === null) return;
    enviar("/usuarios", "POST", { nome, email, senha, role: role.trim().toLowerCase() });
}

/* ====================
EDIT (empty fields keep the current value)
==================== */
function editarUsuario(id){
    const nome = prompt("New name (empty = keep):");
    if (nome === null) return;
    const email = prompt("New email (empty = keep):");
    if (email === null) return;
    const role = prompt("Role admin/user (empty = keep):");
    if (role === null) return;
    const senha = prompt("New password (empty = keep):");
    if (senha === null) return;
    enviar(`/usuarios/${id}`, "PUT", { nome, email, role: role.trim().toLowerCase() || undefined, senha });
}

/* ====================
DELETE
==================== */
function excluirUsuario(id){
    if (!confirm("Delete this user?")) return;
    enviar(`/usuarios/${id}`, "DELETE");
}
