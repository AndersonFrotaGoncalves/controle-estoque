/* =====================================================
   PROTEÇÃO DAS PÁGINAS
   Carregado antes dos outros scripts em todas as páginas:
   - sem sessão, volta ao login;
   - junta o token JWT a todos os pedidos à API;
   - se o servidor responder 401 (sessão expirada), volta ao login.
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
      // a página vai mudar: não devolve nada, para os scripts não tentarem usar a resposta
      return new Promise(() => {});
    }
    return resposta;
  };

  window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  };

  // nome do utilizador no topo da página
  document.addEventListener("DOMContentLoaded", () => {
    let nome = "Usuário";
    try {
      const u = JSON.parse(localStorage.getItem("usuario"));
      nome = u.nome || u.email || nome;
    } catch (e) { /* sem dados */ }
    const el = document.getElementById("usuarioLogado");
    if (el) el.innerText = nome;
  });
})();
