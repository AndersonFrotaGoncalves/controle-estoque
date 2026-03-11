const apiUrl = "/produtos";
const usuario = JSON.parse(localStorage.getItem("usuario"));

const btnExcluir = document.getElementById("btnExcluirSelecionados");

if (btnExcluir && usuario?.role !== "admin") {
    btnExcluir.style.display = "none";
}

/* ========================================
   UTIL
======================================== */

async function fetchProdutos() {

    try {

        const response = await fetch(apiUrl);
        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return [];
    }

}

async function carregarProdutos(){

    const resposta = await fetch("/produtos");
    const dados = await resposta.json();

    console.log("PRODUTOS RECEBIDOS:", dados);

    const tabela = document.querySelector("#tabelaProdutos tbody");
    tabela.innerHTML = "";

    if(!Array.isArray(dados)){
        console.error("API não retornou lista de produtos");
        return;
    }

    dados.forEach(produto => {

    const tr = document.createElement("tr");

tr.innerHTML = `
<td>${produto.codigo}</td>
<td>${produto.descricao}</td>
<td>${produto.rack}</td>
<td>${produto.nivel}</td>
<td>${produto.quantidade ?? 0}</td>
<td>

${usuario?.role === "admin" ? `
<button onclick="editarProduto(${produto.id})">Editar</button>

<input 
type="checkbox"
class="selecionarProduto"
value="${produto.id}"
title="Selecionar para excluir"
>
` : `<span style="color:#888;">Somente leitura</span>`}

</td>
`;
    tabela.appendChild(tr);

});

}


/* ========================================
   CADASTRO / EDIÇÃO
======================================== */

const formProduto = document.getElementById("formProduto");

if (formProduto) {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {

        document.getElementById("tituloFormulario").innerText = "Editar Produto";

        fetchProdutos().then(data => {

            const produto = data.find(p => p.id == id);
            if (!produto) return;

            codigo.value = produto.codigo;
            descricao.value = produto.descricao;
            rack.value = produto.rack;
            nivel.value = produto.nivel;
            quantidade.value = produto.quantidade;
            quantidade_minima.value = produto.quantidade_minima;

        });

    }

    formProduto.addEventListener("submit", function (e) {

        e.preventDefault();

        const produto = {
            codigo: codigo.value,
            descricao: descricao.value,
            rack: rack.value,
            nivel: nivel.value,
            quantidade: quantidade.value,
            quantidade_minima: quantidade_minima.value || 2
        };

        const method = id ? "PUT" : "POST";
        const url = id ? `${apiUrl}/${id}` : apiUrl;

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        })
        .then(res => res.json())
        .then(() => {

            mostrarToast(id ? "Produto atualizado!" : "Produto cadastrado!");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 900);

        });

    });

}

/* ========================================
   MAPA
======================================== */

let dadosMapa = [];

if (document.getElementById("mapa")) {

    fetchProdutos().then(data => {

        dadosMapa = data;
        renderizarMapa(data);

    });

}

function renderizarMapa(data) {

    const mapa = document.getElementById("mapa");
    mapa.innerHTML = "";

    const niveis = Array.from({ length: 30 }, (_, i) => i + 1);

    const racks = [
        "A","B","C","D","E",
        "E-ARM4","E-ARM5","E-ARM6","E-ARM7",
        "F","G","H","I","J","K","L","M","N","O"
    ];

    racks.forEach(rack => {

        const produtosRack = data.filter(p => p.rack === rack);

        const rackCard = document.createElement("div");
        rackCard.classList.add("rack-card");

        const header = document.createElement("div");
        header.classList.add("rack-header");

        const titulo = document.createElement("h3");
        titulo.innerText = `Rack ${rack}`;

        const contador = document.createElement("span");
        contador.classList.add("rack-count");
        contador.innerText = `${produtosRack.length} ocupadas`;

        header.appendChild(titulo);
        header.appendChild(contador);

        const grid = document.createElement("div");
        grid.classList.add("rack-grid");

        niveis.forEach(nivel => {

            const posicao = document.createElement("div");
            posicao.classList.add("posicao");

            posicao.dataset.rack = rack;
            posicao.dataset.nivel = nivel;

            const produtosNivel = produtosRack.filter(p => Number(p.nivel) === nivel);

            if (produtosNivel.length > 0) {

    posicao.classList.add("ocupada");

    let tooltip = "";

    produtosNivel.forEach(p => {
        tooltip += `${p.codigo} - ${p.descricao}\n`;
    });

    posicao.title = tooltip;

} else {

                posicao.classList.add("vazia");

            }

            posicao.innerText = `N${nivel}`;
            grid.appendChild(posicao);

        });

        rackCard.appendChild(header);
        rackCard.appendChild(grid);
        mapa.appendChild(rackCard);

    });

}

function buscarProduto() {

    const input = document.getElementById("buscarCodigo");
    const codigoBusca = input.value.trim().toLowerCase();

    document.querySelectorAll(".posicao").forEach(p => {
        p.classList.remove("destacada", "apagada");
    });

    if (!codigoBusca) return;

    const produto = dadosMapa.find(p =>
        p.codigo.toLowerCase() === codigoBusca
    );

    if (!produto) {
        alert("Produto não encontrado!");
        return;
    }

    const posicao = document.querySelector(
        `[data-rack="${produto.rack}"][data-nivel="${produto.nivel}"]`
    );

    if (!posicao) return;

    document.querySelectorAll(".posicao").forEach(p => {
        p.classList.add("apagada");
    });

    posicao.classList.remove("apagada");
    posicao.classList.add("destacada");

    const rackCard = posicao.closest(".rack-card");

    rackCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

/* ========================================
   DASHBOARD
======================================== */
/* ========================================
   GRÁFICOS DO DASHBOARD
======================================== */

if (document.getElementById("graficoPosicoes")) {

    fetchProdutos().then(data => {

        const racks = [
            "A","B","C","D","E",
            "E-ARM4","E-ARM5","E-ARM6","E-ARM7",
            "F","G","H","I","J","K","L","M","N","O"
        ];

        const niveisPorRack = 30;

        const totalPosicoes = racks.length * niveisPorRack;

        const ocupadas = data.length;

        const livres = totalPosicoes - ocupadas;

        const ctxPosicoes = document.getElementById("graficoPosicoes");

        new Chart(ctxPosicoes, {
            type: "doughnut",
            data: {
                labels: ["Ocupadas", "Livres"],
                datasets: [{
                    data: [ocupadas, livres],
                    backgroundColor: [
                        "#16a34a",
                        "#1e3a8a"
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });

    });

}

if (document.getElementById("graficoEstoque")) {

    fetchProdutos().then(data => {

        const estoqueNormal = data.filter(p =>
            Number(p.quantidade) > Number(p.quantidade_minima)
        ).length;

        const estoqueBaixo = data.filter(p =>
            Number(p.quantidade) <= Number(p.quantidade_minima)
        ).length;

        const ctxEstoque = document.getElementById("graficoEstoque");

        new Chart(ctxEstoque, {
            type: "pie",
            data: {
                labels: ["Estoque Normal", "Estoque Baixo"],
                datasets: [{
                    data: [estoqueNormal, estoqueBaixo],
                    backgroundColor: [
                        "#16a34a",
                        "#dc2626"
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });

    });

}
/* ========================================
   MODAL & TOAST
======================================== */

let idParaExcluir = null;

function editarProduto(id) {
    window.location.href = `cadastro.html?id=${id}`;
}

function abrirModal(id) {
    idParaExcluir = id;
    document.getElementById("modalExcluir").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modalExcluir").style.display = "none";
    idParaExcluir = null;
}

function confirmarExclusao() {

    if (!idParaExcluir) return;

    fetch(`${apiUrl}/${idParaExcluir}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {

            fecharModal();
            mostrarToast("Produto excluído com sucesso!");

            setTimeout(() => {
                location.reload();
            }, 900);

        });

}

function mostrarToast(mensagem) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.innerText = mensagem;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}

/* ========================================
   LOGOUT
======================================== */

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    window.location.href = "login.html";

}
if (document.getElementById("tabelaProdutos")) {
    carregarProdutos();
}

/* =========================
   MENU ATIVO AUTOMÁTICO
========================= */

const paginaAtual = window.location.pathname.split("/").pop();

document.querySelectorAll(".sidebar a").forEach(link => {

    const linkPagina = link.getAttribute("href");

    if(linkPagina === paginaAtual){
        link.classList.add("ativo");
    }else{
        link.classList.remove("ativo");
    }

});



/* ========================================
   DASHBOARD CARDS
======================================== */

if (document.getElementById("totalProdutos")) {

    fetchProdutos().then(data => {

        const totalProdutos = data.length;

        const totalPecas = data.reduce((soma, p) => 
            soma + Number(p.quantidade), 0
        );

        const racks = [
            "A","B","C","D","E",
            "E-ARM4","E-ARM5","E-ARM6","E-ARM7",
            "F","G","H","I","J","K","L","M","N","O"
        ];

        const niveisPorRack = 30;

        const totalPosicoes = racks.length * niveisPorRack;

        const ocupadas = data.length;

        const estoqueBaixo = data.filter(p =>
            Number(p.quantidade) <= Number(p.quantidade_minima)
        ).length;

        document.getElementById("totalProdutos").innerText = totalProdutos;

        document.getElementById("totalPecas").innerText = totalPecas;

        document.getElementById("ocupadas").innerText = ocupadas;

        document.getElementById("estoqueBaixo").innerText = estoqueBaixo;

    });

}

function excluirProduto(id){

if(!confirm("Deseja excluir este produto?")) return;

fetch(`/produtos/${id}`,{

method:"DELETE"

})
.then(res => res.json())
.then(()=>{

alert("Produto excluído com sucesso");

carregarProdutos();

});

}
async function excluirSelecionados(){

const selecionados = document.querySelectorAll(".selecionarProduto:checked");

if(selecionados.length === 0){
alert("Selecione pelo menos um produto");
return;
}

if(!confirm("Deseja excluir os produtos selecionados?")) return;

const ids = Array.from(selecionados).map(cb => cb.value);

for(const id of ids){

await fetch(`/produtos/${id}`,{
method:"DELETE"
});

}

alert("Produtos excluídos com sucesso");

carregarProdutos();

}