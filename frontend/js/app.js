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

        console.log("ENVIANDO PRODUTO:", dados);

        try {

            const response = await fetch("/api/produtos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            const result = await response.json();

            console.log("RESPOSTA:", result);

            if (!response.ok) {
                alert("Erro ao cadastrar produto");
                return;
            }

            alert("Produto cadastrado com sucesso!");

            // 👉 volta para lista
            window.location.href = "index.html";

        } catch (error) {
            console.error("ERRO:", error);
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