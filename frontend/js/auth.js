async function login() {

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const erro = document.getElementById("erroLogin");

    erro.innerText = "";

    if (!email || !senha) {
        erro.innerText = "Preencha email e senha";
        return;
    }

    try {

        const response = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            erro.innerText = data.error || "Erro ao fazer login";
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        window.location.href = "dashboard.html";

    } catch (err) {
        erro.innerText = "Servidor não disponível";
    }
}