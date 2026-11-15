/* =====================================================
   PAGE PROTECTION
   Loaded before the other scripts on every page:
   - no session: back to login;
   - adds the JWT token to every API request;
   - if the server answers 401 (expired session): back to login.
===================================================== */
(function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.replace("login.html");
    return;
  }

  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async (url, opcoes = {}) => {
    const mesmoServidor = typeof url === "string" && !/^https?:\/\//i.test(url);
    if (mesmoServidor) {
      opcoes.headers = { ...(opcoes.headers || {}), Authorization: `Bearer ${token}` };
    }
    const resposta = await fetchOriginal(url, opcoes);
    if (mesmoServidor && resposta.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.replace("login.html");
      // the page is changing: return nothing, so scripts don't try to use the response
      return new Promise(() => {});
    }
    return resposta;
  };

  window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  };

  // user name at the top of the page
  document.addEventListener("DOMContentLoaded", () => {
    let nome = "User";
    try {
      const u = JSON.parse(localStorage.getItem("usuario"));
      nome = u.nome || u.email || nome;
    } catch (e) { /* no data */ }
    const el = document.getElementById("usuarioLogado");
    if (el) el.innerText = nome;
  });
})();
