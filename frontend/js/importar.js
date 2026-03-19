const form = document.getElementById("formImportar");

if (form) {
    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const arquivo = document.getElementById("arquivo").files[0];

        const formData = new FormData();
        formData.append("arquivo", arquivo);

        try {

            const resposta = await fetch("/importar", {
                method: "POST",
                body: formData
            });

            const resultado = await resposta.json();

            alert(resultado.message || "Importação concluída!");

        } catch (erro) {
            console.error(erro);
            alert("Erro ao importar arquivo");
        }

    });
}