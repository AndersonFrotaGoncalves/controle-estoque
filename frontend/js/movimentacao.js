// ================================
// CARREGAR PRODUTOS NO SELECT
// ================================
async function carregarProdutos(){

    try{

        const response = await fetch("http://localhost:3000/api/produtos");
        const produtos = await response.json();

        const select = document.getElementById("produto");

        if(!select){
            console.error("Elemento #produto não existe");
            return;
        }

        select.innerHTML = '<option value="">Selecione um produto</option>';

        produtos.forEach(produto => {

            const option = document.createElement("option");

            option.value = produto.id;
            option.textContent = produto.descricao;

            select.appendChild(option);

        });

    }catch(error){

        console.error("Erro ao carregar produtos:", error);

    }

}


// ================================
// BUSCAR PRODUTO PELO CÓDIGO
// ================================
async function buscarProduto(){

    const codigo = document.getElementById("codigo")?.value;

    if(!codigo){
        alert("Digite o código");
        return;
    }

    try{

        const response = await fetch(`http://localhost:3000/api/produtos/codigo/${codigo}`);
        const produto = await response.json();

        if(produto){

            const desc = document.getElementById("descricao");
            const prod = document.getElementById("produto"); // 🔥 CAMPO OCULTO

            if(desc) desc.value = produto.descricao;
            if(prod) prod.value = produto.id; // 🔥 ESSENCIAL

        }else{
            alert("Produto não encontrado");
        }

    }catch(error){
        console.error(error);
    }

}

// ================================
// SALVAR MOVIMENTAÇÃO
// ================================
async function salvarMovimentacao(){

    const produto = document.getElementById("produto").value;
    const tipo = document.getElementById("tipo").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const obs = document.getElementById("obs").value;

    if(!produto || !quantidade){

        alert("Preencha todos os campos");
        return;

    }

    try{

        const response = await fetch("http://localhost:3000/api/movimentacoes", {

            method: "POST",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify({

                produto_id: produto,
                tipo: tipo,
                quantidade: quantidade,
                observacao: obs,
                usuario: JSON.parse(localStorage.getItem("usuario")).email

            })

        });

        const data = await response.json();

        if(data.sucesso){

            alert("Movimentação registrada com sucesso!");

            document.getElementById("quantidade").value = "";
            document.getElementById("obs").value = "";

            carregarHistorico();

        }else{

            alert("Erro ao registrar movimentação");

        }

    }catch(error){

        console.error("Erro ao salvar movimentação:", error);

    }

}


// ================================
// CARREGAR HISTÓRICO
// ================================
async function carregarHistorico(){

    try{

        const response = await fetch("http://localhost:3000/api/movimentacoes");
        const dados = await response.json();

        const tbody = document.querySelector("#tabelaMovimentacoes tbody");
        tbody.innerHTML = "";

        // 🔥 PEGA O TIPO DA PÁGINA (entrada ou saída)
        const tipoPagina = document.getElementById("tipo").value;

        dados.forEach(mov => {

            // 🔥 FILTRO AQUI
            if (mov.tipo !== tipoPagina) return;

            const tr = document.createElement("tr");

            const tipoClass = mov.tipo === "entrada"
                ? "tipo-entrada"
                : "tipo-saida";

            tr.innerHTML = `
                <td><strong>${mov.codigo}</strong> - ${mov.descricao}</td>
                <td class="${tipoClass}">${mov.tipo}</td>
                <td>${mov.observacao || "-"}</td>
                <td>${mov.quantidade}</td>
                <td>${new Date(mov.data).toLocaleString()}</td>
                <td>${formatarUsuario(mov.usuario)}</td>
            `;

            tbody.appendChild(tr);

        });

    }catch(error){

        console.error("Erro ao carregar histórico:", error);

    }

}

function formatarUsuario(usuario){

    try {
        const obj = JSON.parse(usuario);

        if (obj.nome) {
            return obj.nome;
        }

        if (obj.email) {
            return obj.email.split("@")[0]; // 🔥 pega só o nome
        }

        return "Desconhecido";

    } catch {

        if (usuario.includes("@")) {
            return usuario.split("@")[0]; // 🔥 fallback
        }

        return usuario;
    }

}

carregarHistorico();


// ================================
// BUSCAR PRODUTO COM ENTER
// ================================
const campoCodigo = document.getElementById("codigo");

if(campoCodigo){
    campoCodigo.addEventListener("keypress", function(e){
        if(e.key === "Enter"){
            buscarProduto();
        }
    });
}


//funcao exporta excell

function exportarExcel() {

    const tabela = document.getElementById("tabelaMovimentacoes");

    if (!tabela) {
        alert("Tabela não encontrada");
        return;
    }

    let html = tabela.outerHTML;

    let url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);

    let link = document.createElement("a");
    link.href = url;
    link.download = "movimentacoes.xls";

    link.click();
}

function imprimir() {
    window.print();
}

//funcao filtrto por data

function filtrarPorData() {

    const inicio = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;

   const linhas = document.querySelectorAll("#tabelaMovimentacoes tbody tr");

    linhas.forEach(linha => {

        const dataTexto = linha.children[4].innerText.split(",")[0].trim();

        const [dia, mes, ano] = dataTexto.split("/");

        const dataLinha = new Date(ano, mes - 1, dia);

        let mostrar = true;

        if (inicio) {
            const dataInicio = new Date(inicio);
            dataInicio.setHours(0,0,0,0);

            if (dataLinha < dataInicio) mostrar = false;
        }

        if (fim) {
            const dataFim = new Date(fim);
            dataFim.setHours(23,59,59,999);

            if (dataLinha > dataFim) mostrar = false;
        }

        linha.style.display = mostrar ? "" : "none";
    });
}
    
    
    //funcao limpar filtro

function limparFiltro() {

    document.getElementById("dataInicio").value = "";
    document.getElementById("dataFim").value = "";

   const linhas = document.querySelectorAll("#tabelaMovimentacoes tbody tr");

    linhas.forEach(linha => {
        linha.style.display = "";
    });
}

// funcao transferir mais de um produto

// abrir / fechar modal
function abrirModal() {
    document.getElementById("modalMov").style.display = "block";
}

function fecharModal() {
    document.getElementById("modalMov").style.display = "none";
}

// adicionar itens no modal
function adicionarItemModal() {

    const div = document.createElement("div");

    div.classList.add("linha-item");

    div.innerHTML = `
        <input placeholder="Código" class="codigo" onblur="buscarDescricao(this)">
        <input placeholder="Descrição" class="descricao" readonly>

        <select class="tipo">
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
        </select>

        <input type="number" placeholder="Qtd" class="quantidade">
        <input placeholder="Observação" class="obs">

        <button onclick="this.parentElement.remove()">❌</button>
    `;

    document.getElementById("listaItensModal").appendChild(div);
}

// buscar descrição automática
async function buscarDescricao(inputCodigo) {

    const codigo = inputCodigo.value;

    if (!codigo) return;

    try {

        const response = await fetch(`http://localhost:3000/api/produtos/codigo/${codigo}`);
        const produto = await response.json();

        if (produto) {

            const linha = inputCodigo.parentElement;

            linha.querySelector(".descricao").value = produto.descricao;

        } else {
            alert("Produto não encontrado");
        }

    } catch (error) {
        console.error("Erro ao buscar produto:", error);
    }
}

// salvar movimentação em lote
async function salvarMovimentacaoLote() {

    const itens = document.querySelectorAll("#listaItensModal .linha-item");

    let lista = [];

    itens.forEach(item => {

        const codigo = item.querySelector(".codigo").value;
        const quantidade = item.querySelector(".quantidade").value;
        const tipo = item.querySelector(".tipo").value;
        const obs = item.querySelector(".obs").value;

        if (codigo && quantidade) {
            lista.push({
                codigo,
                quantidade,
                tipo,
                observacao: obs
            });
        }

    });

    if (lista.length === 0) {
        alert("Adicione itens");
        return;
    }

    try {

        const response = await fetch("http://localhost:3000/api/movimentacoes/lote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                itens: lista,
                usuario: JSON.parse(localStorage.getItem("usuario")).email
            })
        });

        const data = await response.json();

        console.log("RESPOSTA BACKEND:", data);

        if (!response.ok) {
            alert("Erro ao salvar movimentação");
            return;
        }

        alert("Movimentação salva com sucesso!");

        fecharModal();

        document.getElementById("listaItensModal").innerHTML = "";

        carregarHistorico();

    } catch (err) {
        console.error("Erro ao salvar lote:", err);
        alert("Erro no servidor");
    }
}

// graficos movimentacoes 

async function carregarDashboard() {

    try {

        const response = await fetch("http://localhost:3000/api/movimentacoes");
        const dados = await response.json();

        let entradas = 0;
        let saidas = 0;

        const hoje = new Date().toDateString();

        dados.forEach(mov => {

            const dataMov = new Date(mov.data).toDateString();

            if (dataMov === hoje) {

                if (mov.tipo === "entrada") {
                    entradas += Number(mov.quantidade);
                } else {
                    saidas += Number(mov.quantidade);
                }

            }

        });

        document.getElementById("totalEntradas").innerText = entradas;
        document.getElementById("totalSaidas").innerText = saidas;
        document.getElementById("saldoHoje").innerText = entradas - saidas;

    } catch (error) {
        console.error("Erro dashboard:", error);
    }
}

carregarDashboard();
carregarHistorico();

// movimentacoes do dia
async function carregarGrafico() {

    try {

        const response = await fetch("http://localhost:3000/api/movimentacoes");
        const dados = await response.json();

        let mapa = {};

        dados.forEach(mov => {

            const data = new Date(mov.data).toLocaleDateString();

            if (!mapa[data]) {
                mapa[data] = { entrada: 0, saida: 0 };
            }

            if (mov.tipo === "entrada") {
                mapa[data].entrada += Number(mov.quantidade);
            } else {
                mapa[data].saida += Number(mov.quantidade);
            }

        });

        const labels = Object.keys(mapa);
        const entradas = labels.map(d => mapa[d].entrada);
        const saidas = labels.map(d => mapa[d].saida);

       const ctx = document.getElementById("graficoMov");

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Entradas',
                data: entradas,
                backgroundColor: 'rgba(22, 163, 74, 0.7)', // verde
                borderRadius: 6,
                barPercentage: 0.5,
                categoryPercentage: 0.5
            },
            {
                label: 'Saídas',
                data: saidas,
                backgroundColor: 'rgba(220, 38, 38, 0.7)', // vermelho
                borderRadius: 6,
                barPercentage: 0.5,
                categoryPercentage: 0.5
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

    } catch (error) {
        console.error("Erro gráfico:", error);
    }
}

carregarDashboard();
carregarGrafico();

