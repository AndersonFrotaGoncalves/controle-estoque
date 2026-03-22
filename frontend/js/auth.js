document.addEventListener("DOMContentLoaded", function () {

    const API_URL = ""; // mesma origem

    const form = document.getElementById("loginForm");

    if (!form) {
        console.error("Formulário não encontrado");
        return;
    }

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const erro = document.getElementById("erroLogin");

        if (erro) erro.innerText = "";

        try {

            console.log("LOGIN DISPARADO");

            const res = await fetch("/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ email, senha })
});

            console.log("STATUS:", res.status);

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("Resposta inválida do servidor");
            }

            console.log("RESPOSTA:", data);

            if (!res.ok) {
                if (erro) erro.innerText = data.error || "Erro no login";
                return;
            }

            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            console.log("LOGIN OK - REDIRECIONANDO");

            window.location.href = "dashboard.html";

        } catch (err) {
            console.error("ERRO LOGIN:", err);
            if (erro) erro.innerText = "Servidor não disponível";
        }

    });

});