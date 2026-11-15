// Login: sends email and password, stores the JWT token and opens the dashboard.
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) {
    window.location.replace("dashboard.html");
    return;
  }

  const form = document.getElementById("loginForm");
  const erro = document.getElementById("erroLogin");

  // quick access buttons for the demo accounts
  document.querySelectorAll("[data-demo]").forEach((b) =>
    b.addEventListener("click", () => {
      const [email, senha] = b.dataset.demo.split("|");
      document.getElementById("email").value = email;
      document.getElementById("senha").value = senha;
    }));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    erro.innerText = "";
    const botao = form.querySelector("button[type=submit]");
    botao.disabled = true;

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: document.getElementById("email").value.trim(),
          senha: document.getElementById("senha").value,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        erro.innerText = data.error || "Could not sign in.";
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      window.location.href = "dashboard.html";
    } catch (err) {
      erro.innerText = "Server unavailable. Make sure the backend is running (npm start).";
    } finally {
      botao.disabled = false;
    }
  });
});
