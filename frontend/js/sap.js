async function importarExcel(){

    const input = document.getElementById("excelFile");

    if(!input.files.length){
        alert("Selecione um arquivo");
        return;
    }

    const formData = new FormData();
    formData.append("arquivo", input.files[0]);

    try{

        // 🔥 envia Excel (não salva, só lê)
        const resExcel = await fetch("/api/sap", {
            method: "POST",
            body: formData
        });

        const dadosExcel = await resExcel.json();

        // 🔥 pega produtos do sistema
        const resProdutos = await fetch("/api/produtos");
        const produtos = await resProdutos.json();

        montarTabela(dadosExcel, produtos);

    }catch(error){
        console.error(error);
        alert("Erro ao importar Excel");
    }

}

function montarTabela(excel, produtos){

    const tbody = document.querySelector("#tabelaSAP tbody");
    tbody.innerHTML = "";

    excel.forEach(item => {

       const codigo = item.codigo || item.Material;

const qtdSAP = Number(
    item["Estoque SAP"] ||
    item.quantidade ||
    item.Qtd ||
    0
);
        const produto = produtos.find(p => p.codigo == codigo);

        const qtdSistema = produto ? Number(produto.quantidade) : 0;

        const diferenca = qtdSistema - qtdSAP;

        let cor = "";
        if(diferenca < 0) cor = "red";
        if(diferenca > 0) cor = "green";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${codigo}</td>
            <td>${produto?.descricao || "Não encontrado"}</td>
            <td>${qtdSistema}</td>
            <td>${qtdSAP}</td>
            <td style="color:${cor}; font-weight:bold;">
                ${diferenca}
            </td>
        `;

        tbody.appendChild(tr);

    });

}

document.getElementById("excelFile").addEventListener("change", function(){
    const nome = this.files[0]?.name || "Nenhum arquivo selecionado";
    document.getElementById("nomeArquivo").innerText = nome;
});


function exportarExcel(){

    let tabela = document.getElementById("tabelaSAP");
    let linhas = tabela.querySelectorAll("tr");

    let dados = [];

    linhas.forEach((linha, index) => {

        let colunas = linha.querySelectorAll("th, td");
        let linhaDados = [];

        colunas.forEach(col => {
            linhaDados.push(col.innerText);
        });

        dados.push(linhaDados);

    });

    // 🔥 cria planilha
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dados);

    XLSX.utils.book_append_sheet(wb, ws, "Inventario SAP");

    XLSX.writeFile(wb, "relatorio_inventario_sap.xlsx");
}

function imprimirRelatorio(){

    const conteudo = document.querySelector("#tabelaSAP").outerHTML;

    const janela = window.open("", "", "width=900,height=700");

    janela.document.write(`
        <html>
        <head>
            <title>Relatório Inventário SAP</title>
            <style>
                body{ font-family: Arial; padding:20px; }
                h1{ text-align:center; }

                table{
                    width:100%;
                    border-collapse: collapse;
                    margin-top:20px;
                }

                th, td{
                    border:1px solid #ccc;
                    padding:8px;
                }

                th{
                    background:#1e293b;
                    color:white;
                }
            </style>
        </head>
        <body>

        <h1>Relatório de Inventário SAP</h1>

        ${conteudo}

        </body>
        </html>
    `);

    janela.document.close();

    janela.onload = function(){
        janela.print();
        janela.close(); // 🔥 FECHA AUTOMATICAMENTE
    };
}