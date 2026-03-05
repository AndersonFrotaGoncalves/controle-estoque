const apiUrl = "/produtos";
/* ========================================
   UTIL
======================================== */
async function carregarProdutos() {

    const response = await fetch("/produtos");

    const produtos = await response.json();

    const tabela = document.querySelector("#tabelaProdutos tbody");

    tabela.innerHTML = "";

    produtos.forEach(produto => {

        const linha = `
        <tr>
            <td>${produto.codigo}</td>
            <td>${produto.descricao}</td>
            <td>${produto.rack}</td>
            <td>${produto.nivel}</td>
            <td>${produto.quantidade}</td>
        </tr>
        `;

        tabela.innerHTML += linha;

    });

}

/* ========================================
   CADASTRO / EDIÇÃO
======================================== */

const form = document.getElementById("formProduto");

if (form) {

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

    form.addEventListener("submit", function (e) {

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
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    },
            body: JSON.stringify(produto)
        })
        .then(res => res.json())
        .then(() => {
            mostrarToast(id ? "Produto atualizado!" : "Produto cadastrado!");
            setTimeout(() => window.location.href = "index.html", 900);
        });
    });
}

/* ========================================
   MAPA PREMIUM
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

            const produto = produtosRack.find(p => Number(p.nivel) === nivel);

            if (produto) {

                if (Number(produto.quantidade) === 0) {
                    posicao.classList.add("sem-estoque");
                } else {
                    posicao.classList.add("ocupada");
                }

                posicao.dataset.codigo = produto.codigo;

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

    // Remove destaques antigos
    document.querySelectorAll(".posicao").forEach(p => {
        p.classList.remove("destacada", "apagada");
    });

    if (!codigoBusca) return;

    // Procura produto
    const produto = dadosMapa.find(p =>
        p.codigo.toLowerCase() === codigoBusca
    );

    if (!produto) {
        alert("Produto não encontrado!");
        return;
    }

    // Localiza posição
    const posicao = document.querySelector(
        `[data-rack="${produto.rack}"][data-nivel="${produto.nivel}"]`
    );

    if (!posicao) return;

    // Apaga visualmente as outras
    document.querySelectorAll(".posicao").forEach(p => {
        p.classList.add("apagada");
    });

    // Destaca a encontrada
    posicao.classList.remove("apagada");
    posicao.classList.add("destacada");

    // 🔥 AQUI ESTÁ A MÁGICA DO SCROLL SUAVE
    const rackCard = posicao.closest(".rack-card");

    rackCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

/* ========================================
   DASHBOARD
======================================== */


if (document.getElementById("totalProdutos")) {

    fetchProdutos().then(data => {

        const totalProdutos = data.length;
        const totalPecas = data.reduce((s, p) => s + Number(p.quantidade), 0);

      // MESMOS RACKS DO MAPA
const racks = [
    "A","B","C","D","E",
    "E-ARM4","E-ARM5","E-ARM6","E-ARM7",
    "F","G","H","I","J","K","L","M","N","O"
];

const niveisPorRack = 30;
const totalPosicoes = racks.length * niveisPorRack;

// Cada produto ocupa uma posição
const ocupadas = data.length;
const vazias = totalPosicoes - ocupadas;

        const estoquePositivo = data.filter(p =>
            Number(p.quantidade) > Number(p.quantidade_minima)
        ).length;

        const estoqueBaixo = data.filter(p =>
            Number(p.quantidade) <= Number(p.quantidade_minima)
        ).length;

        // KPI
        document.getElementById("totalProdutos").innerText = totalProdutos;
        document.getElementById("totalPecas").innerText = totalPecas;
        document.getElementById("ocupadas").innerText = ocupadas;
        document.getElementById("estoqueBaixo").innerText = estoqueBaixo;

        // =========================
        // GRÁFICO 1 - POSIÇÕES
        // =========================

        const ctx1 = document.getElementById("graficoPosicoes");

        if (ctx1) {
            new Chart(ctx1, {
                type: "doughnut",
                data: {
                    labels: ["Ocupadas", "Vazias"],
                    datasets: [{
                        data: [ocupadas, vazias],
                        backgroundColor: ["#16a34a", "#1e3a8a"]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "bottom" }
                    }
                }
            });
        }

        // =========================
        // GRÁFICO 2 - ESTOQUE
        // =========================

        const ctx2 = document.getElementById("graficoEstoque");

        if (ctx2) {
            new Chart(ctx2, {
                type: "doughnut",
                data: {
                    labels: ["Estoque Positivo", "Estoque Baixo"],
                    datasets: [{
                        data: [estoquePositivo, estoqueBaixo],
                        backgroundColor: ["#22c55e", "#dc2626"]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "bottom" }
                    }
                }
            });
        }

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
            setTimeout(() => location.reload(), 900);
        });
}

function mostrarToast(mensagem) {

    const toast = document.getElementById("toast");
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