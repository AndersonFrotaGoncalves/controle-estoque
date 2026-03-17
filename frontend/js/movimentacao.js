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
            const prod = document.getElementById("produto");

            if(desc) desc.value = produto.descricao;
            if(prod) prod.value = produto.id;

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
                usuario: localStorage.getItem("usuario")

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

        dados.forEach(mov => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${mov.descricao}</td>
                <td>${mov.tipo}</td>
                <td>${mov.quantidade}</td>
                <td>${mov.usuario}</td>
                <td>${new Date(mov.data).toLocaleString()}</td>
            `;

            tbody.appendChild(tr);

        });

    }catch(error){

        console.error("Erro ao carregar histórico:", error);

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