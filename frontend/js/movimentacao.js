// ================================
// CARREGAR PRODUTOS NO SELECT
// ================================
async function carregarProdutos(){

    try{

        const response = await fetch("/api/produtos");
        const produtos = await response.json();

        const select = document.getElementById("produto");

        if(!select){
            console.error("Element #produto not found");
            return;
        }

        select.innerHTML = '<option value="">Select a product</option>';

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
        alert("Enter the code");
        return;
    }

    try{

        const response = await fetch(`/api/produtos/codigo/${codigo}`);
        const produto = await response.json();

        if(produto){

            const desc = document.getElementById("descricao");
            const prod = document.getElementById("produto"); // 🔥 CAMPO OCULTO

            if(desc) desc.value = produto.descricao;
            if(prod) prod.value = produto.id; // 🔥 ESSENCIAL

        }else{
            alert("Product not found");
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

        alert("Fill in all fields");
        return;

    }

    try{

        const response = await fetch("/api/movimentacoes", {

            method: "POST",

            headers:{
                "Content-Type":"application/json"
            },

            body: JSON.stringify({

                produto_id: produto,
                tipo: tipo,
                quantidade: quantidade,
                observacao: obs

            })

        });

        const data = await response.json();

        if(data.sucesso){

            alert("Movement recorded.");

            document.getElementById("quantidade").value = "";
            document.getElementById("obs").value = "";

            carregarHistorico();

        }else{

            alert(data.erro || "Error recording the movement");

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

        const response = await fetch("/api/movimentacoes");

        const dados = await response.json();

        const tbody = document.querySelector("#tabelaMovimentacoes tbody");

        tbody.innerHTML = "";
dados.forEach(mov => {

    const tr = document.createElement("tr");

    const tipoClass = mov.tipo === "entrada"
        ? "tipo-entrada"
        : "tipo-saida";

    tr.innerHTML = `
        <td><strong>${mov.codigo}</strong> - ${mov.descricao}</td>
        <td class="${tipoClass}">${mov.tipo === "entrada" ? "In" : "Out"}</td>
        <td>${mov.quantidade}</td>
        <td>${formatarUsuario(mov.usuario)}</td>
        <td>${new Date(String(mov.data).replace(" ", "T")).toLocaleString("en-GB")}</td>
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
        return obj.email || obj.nome || "Desconhecido";
    } catch {
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