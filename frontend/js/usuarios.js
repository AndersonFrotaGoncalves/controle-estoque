const usuario = JSON.parse(localStorage.getItem("usuario"));

const ehAdmin = usuario && usuario.role === "admin";
if (!ehAdmin) {
    alert("Apenas administrador pode acessar");
    window.location.replace("dashboard.html");
}


/* ====================
CARREGAR
==================== */
async function carregarUsuarios(){

    if (!ehAdmin) return;
    const res = await fetch("/usuarios");
    const usuarios = await res.json();
    if (!res.ok) { alert(usuarios.error || "Erro ao carregar usuários"); return; }

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
PEDIDO À API (mostra o erro do servidor, se houver)
==================== */
async function enviar(url, metodo, corpo){
    const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
    const dados = await res.json().catch(() => ({}));
    if (!res.ok) alert(dados.error || "Não foi possível concluir a operação.");
    carregarUsuarios();
}

/* ====================
NOVO USUÁRIO
==================== */
function novoUsuario(){
    const nome = prompt("Nome:");
    if (nome === null) return;          // cancelado
    const email = prompt("Email:");
    if (email === null) return;
    const senha = prompt("Senha (mínimo 6 caracteres):");
    if (senha === null) return;
    const role = prompt("Permissão (admin/user):", "user");
    if (role === null) return;
    enviar("/usuarios", "POST", { nome, email, senha, role: role.trim().toLowerCase() });
}

/* ====================
EDITAR (campos vazios mantêm o valor atual)
==================== */
function editarUsuario(id){
    const nome = prompt("Novo nome (vazio = manter):");
    if (nome === null) return;
    const email = prompt("Novo email (vazio = manter):");
    if (email === null) return;
    const role = prompt("Permissão admin/user (vazio = manter):");
    if (role === null) return;
    const senha = prompt("Nova senha (vazio = manter):");
    if (senha === null) return;
    enviar(`/usuarios/${id}`, "PUT", { nome, email, role: role.trim().toLowerCase() || undefined, senha });
}

/* ====================
EXCLUIR
==================== */
function excluirUsuario(id){
    if (!confirm("Excluir usuário?")) return;
    enviar(`/usuarios/${id}`, "DELETE");
}
