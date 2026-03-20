const apiUrl = "/api/produtos";

const usuario = JSON.parse(localStorage.getItem("usuario"));

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

async function carregarProdutos() {
    try {
        const resposta = await fetch(apiUrl);
        const dados = await resposta.json();

        const tabela = document.querySelector("#tabelaProdutos tbody");
        tabela.innerHTML = "";

        if (!Array.isArray(dados)) {
            console.error("API não retornou lista de produtos");
            return;
        }

        dados.forEach(produto => {
            const tr = document.createElement("tr");

           tr.innerHTML = `
    <td>
        <input type="checkbox" class="selecionarProduto" value="${produto.id}">
    </td>
    <td>${produto.codigo}</td>
    <td>${produto.descricao}</td>
    <td>${produto.rack}</td>
    <td>${produto.nivel}</td>
    <td>${produto.quantidade ?? 0}</td>
    <td>
    ${usuario?.role === "admin" ? `
        <button onclick="editarProduto(${produto.id})">Editar</button>
    ` : `<span style="color:#888;">Somente leitura</span>`}
    </td>
`;

            tabela.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

/* ========================================
   CADASTRO / EDIÇÃO
======================================== */

function editarProduto(id) {
    window.location.href = `cadastro.html?id=${id}`;
}

/* ========================================
   INICIAR
======================================== */

if (document.getElementById("tabelaProdutos")) {
    carregarProdutos();
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

        const totalPosicoes = niveis.length;

        const niveisOcupados = new Set(
            produtosRack.map(p => p.nivel)
        );

        const ocupadas = niveisOcupados.size;

        const percentual = Math.round((ocupadas / totalPosicoes) * 100);

        const contador = document.createElement("span");
        contador.classList.add("rack-count");

        contador.innerHTML = `
        ${percentual}% ocupado<br>
        ${ocupadas} de ${totalPosicoes} posições
        `;

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

/* ========================================
   DASHBOARD
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

const posicoesUnicas = new Set();

data.forEach(p => {

const rack = String(p.rack || "").trim();
const nivel = parseInt(p.nivel);

if(rack && !isNaN(nivel)){
posicoesUnicas.add(rack + "-" + nivel);
}

});

const ocupadas = posicoesUnicas.size;

const livres = totalPosicoes - ocupadas;

const ctxPosicoes = document.getElementById("graficoPosicoes");

new Chart(ctxPosicoes, {

type: "doughnut",

data: {
labels: ["Ocupadas", "Livres"],
datasets: [{
data: [ocupadas, livres],
backgroundColor: ["#16a34a","#1e3a8a"]
}]
},

options: {
responsive: true,
cutout: "65%",
plugins: { legend: { position: "bottom" } }
}

});

});

}

/* ========================================
   LOGOUT
======================================== */

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

/* ========================================
   MENU ATIVO
======================================== */

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
   CADASTRO DE PRODUTO
======================================== */

const formProduto = document.getElementById("formProduto");

if (formProduto) {

    formProduto.addEventListener("submit", async (e) => {

        e.preventDefault();

        const dados = {
            codigo: document.getElementById("codigo").value,
            descricao: document.getElementById("descricao").value,
            rack: document.getElementById("rack").value,
            nivel: document.getElementById("nivel").value,
            quantidade: document.getElementById("quantidade").value,
            quantidade_minima: document.getElementById("quantidade_minima").value
        };

        const params = new URLSearchParams(window.location.search);
        const produtoId = params.get("id");

        const url = produtoId
            ? `/api/produtos/${produtoId}`
            : `/api/produtos`;

        const method = produtoId ? "PUT" : "POST";

        try {

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                alert("Erro ao salvar");
                return;
            }

            alert(produtoId ? "Produto atualizado!" : "Produto criado!");

            window.location.href = "index.html";

        } catch (error) {
            console.error(error);
            alert("Erro no servidor");
        }

    });

}
function excluirSelecionados(){

    const selecionados = document.querySelectorAll(".selecionarProduto:checked");

    if(selecionados.length === 0){
        alert("Selecione pelo menos um produto");
        return;
    }

    if(!confirm("Deseja excluir os produtos selecionados?")) return;

    const ids = Array.from(selecionados).map(cb => cb.value);

    Promise.all(
        ids.map(id =>
            fetch(`/api/produtos/${id}`, {
                method: "DELETE"
            })
        )
    )
    .then(() => {
        alert("Produtos excluídos com sucesso!");
        carregarProdutos();
    })
    .catch(err => {
        console.error(err);
        alert("Erro ao excluir");
    });

}
/* ========================================
   DASHBOARD CARDS
======================================== */

if (document.getElementById("totalProdutos")) {

fetchProdutos().then(data => {

const racks = [
"A","B","C","D","E",
"E-ARM4","E-ARM5","E-ARM6","E-ARM7",
"F","G","H","I","J","K","L","M","N","O"
];

const niveisPorRack = 30;

const totalPosicoes = racks.length * niveisPorRack;

/* TOTAL PRODUTOS */
const totalProdutos = data.length;

/* POSIÇÕES OCUPADAS */
const posicoesUnicas = new Set();

data.forEach(p => {

const rack = String(p.rack || "").trim();
const nivel = parseInt(p.nivel);

if(rack && !isNaN(nivel)){
posicoesUnicas.add(rack + "-" + nivel);
}

});

const ocupadas = posicoesUnicas.size;

/* POSIÇÕES LIVRES */
const livres = totalPosicoes - ocupadas;

/* TOTAL RACKS */
const totalRacks = racks.length;

/* MOSTRAR NA TELA */
document.getElementById("totalProdutos").innerText = totalProdutos;
document.getElementById("totalPecas").innerText = totalRacks;
document.getElementById("ocupadas").innerText = ocupadas;
document.getElementById("estoqueBaixo").innerText = livres;

});

}

/* ========================================
   GRAFICO PRODUTOS POR RACK
======================================== */

if (document.getElementById("graficoRacks")) {

fetchProdutos().then(data => {

const racks = {};

data.forEach(produto => {

if(!racks[produto.rack]){
racks[produto.rack] = 0;
}

racks[produto.rack]++;

});

const labels = Object.keys(racks);
const valores = Object.values(racks);

const ctx = document.getElementById("graficoRacks");

new Chart(ctx, {

type: "bar",

data: {

labels: labels,

datasets: [{

label: "Produtos por Rack",

data: valores,

backgroundColor: "#2563eb",

borderRadius: 6

}]

},

options: {

responsive: true,

plugins: {

legend: {
display:false
}

},

scales:{

y:{
beginAtZero:true
}

}

}

});

});

}

/* ========================================
   ALERTAS DE ESTOQUE
======================================== */

if (document.getElementById("listaAlertas")) {

fetchProdutos().then(data => {

const container = document.getElementById("listaAlertas");

container.innerHTML = "";

const produtosBaixo = data.filter(p =>
    Number(p.quantidade) <= Number(p.quantidade_minima)
);

if (produtosBaixo.length === 0) {

container.innerHTML = "<p>Nenhum alerta no momento</p>";
return;

}

produtosBaixo.forEach(p => {

const alerta = document.createElement("div");

alerta.style.padding = "8px";
alerta.style.marginBottom = "6px";
alerta.style.background = "#fee2e2";
alerta.style.borderRadius = "6px";
alerta.style.color = "#991b1b";

alerta.innerText = `⚠ ${p.descricao} com estoque baixo (${p.quantidade})`;

container.appendChild(alerta);

});

});

}

/* ========================================
   GRAFICO ESTOQUE BAIXO
======================================== */

if (document.getElementById("graficoEstoque")) {

fetchProdutos().then(data => {

const estoqueNormal = data.filter(p =>
    Number(p.quantidade) > Number(p.quantidade_minima)
).length;

const estoqueBaixo = data.filter(p =>
    Number(p.quantidade) <= Number(p.quantidade_minima)
).length;

const ctx = document.getElementById("graficoEstoque");

new Chart(ctx, {

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
   PRODUTOS MAIS MOVIMENTADOS
======================================== */

if (document.getElementById("graficoTopProdutos")) {

fetch("/api/movimentacoes")
.then(res => res.json())
.then(data => {

const contagem = {};

data.forEach(mov => {
contagem[mov.descricao] = (contagem[mov.descricao] || 0) + 1;
});

const top = Object.entries(contagem)
.sort((a,b)=>b[1]-a[1])
.slice(0,5);

// 🔥 corta texto grande
const labelsCurtos = top.map(t =>
t[0].length > 15 ? t[0].substring(0,15) + "..." : t[0]
);

const labelsCompletos = top.map(t => t[0]);

new Chart(document.getElementById("graficoTopProdutos"), {

type: "bar",

data: {
labels: labelsCurtos,
datasets: [{
data: top.map(t=>t[1]),
backgroundColor: "#3b82f6",
borderRadius: 8,
barThickness: 30
}]
},

options: {
plugins:{
legend:{display:false},

// 🔥 mostra nome completo no hover
tooltip:{
callbacks:{
label: function(context){
return labelsCompletos[context.dataIndex] + ": " + context.raw;
}
}
}

},

scales:{
x:{
ticks:{
maxRotation: 0,
minRotation: 0,
color:"#64748b",
font:{size:11}
}
},
y:{
beginAtZero:true,
ticks:{color:"#64748b"}
}
}

}

});

});

}

// ================================
// CARREGAR PRODUTO PARA EDIÇÃO
// ================================

const params = new URLSearchParams(window.location.search);
const produtoId = params.get("id");

if (produtoId && document.getElementById("formProduto")) {

    fetch(`/api/produtos`)
        .then(res => res.json())
        .then(produtos => {

            const produto = produtos.find(p => p.id == produtoId);

            if (!produto) return;

            document.getElementById("codigo").value = produto.codigo;
            document.getElementById("descricao").value = produto.descricao;
            document.getElementById("rack").value = produto.rack;
            document.getElementById("nivel").value = produto.nivel;
            document.getElementById("quantidade").value = produto.quantidade;
            document.getElementById("quantidade_minima").value = produto.quantidade_minima;

        })
        .catch(err => console.error("Erro ao carregar produto:", err));
}