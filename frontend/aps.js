// ===============================
// VAR GLOBAL
// ===============================
let filtroAtual = "GERAL";
let timeoutSalvar;


// ===============================
// CONVERTER DATA (PT)
// ===============================
function converterData(data) {

  if (!data) return null;

  const partes = data.split(" ")[0].split("/");

  if (partes.length !== 3) return null;

  let [dia, mes, ano] = partes;

  // 🔥 corrige ano tipo 26 → 2026
  if (ano.length === 2) {
    ano = "20" + ano;
  }

  return new Date(`${ano}-${mes}-${dia}`);
}

// ===============================
// ADICIONAR LINHA
// ===============================
window.adicionarLinha = function () {

  const tbody = document.getElementById("bodyAPs");

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td contenteditable="false"></td>
    <td contenteditable="false"></td>
    <td contenteditable="false"></td>
    <td contenteditable="false"></td>
    <td contenteditable="false"></td>
    <td contenteditable="false"></td>
    <td contenteditable="false"></td>

    <td contenteditable="false" class="data-manual"></td>
    <td contenteditable="false" class="data-disponivel"></td>
    <td class="dias-espera">0</td>

    <td contenteditable="false"></td>

    <td class="check-tec"></td>
    <td class="check-arm"></td>

    <td contenteditable="false"></td>

    <td>
      <select>
       <option></option>
        <option>Disponível</option>
        <option>Em Espera - Pedido efetuado</option>
        <option>OT Programada</option>
        <option>Por Tratar</option>
      </select>
    </td>

    <td class="acoes">
      <button class="btn-editar">✏️</button>
      <button class="btn-excluir">🗑</button>
    </td>
  `;

  tbody.appendChild(tr);

  configurarCalculo(tr);
  configurarChecks(tr);
  configurarEnter(tr); 
  configurarEditar(tr, true); // 🔥 já começa editando
  configurarDelete(tr);

  atualizarContadores();
};


// ===============================
// EDITAR
// ===============================F
function configurarEditar(tr, iniciarEditando = false) {

  const btn = tr.querySelector(".btn-editar");
  const celulas = tr.querySelectorAll("td[contenteditable]");

  let editando = iniciarEditando;

  // 🔥 aplica estado inicial
  celulas.forEach((td, i) => {
    td.contentEditable = editando;
    td.style.background = editando ? "#fff7ed" : "#f9fafb";
  });

  if (editando) {
    btn.classList.add("ativo");
  }

  btn.addEventListener("click", () => {

    editando = !editando;

    celulas.forEach((td, i) => {
      td.contentEditable = editando;
      td.style.background = editando ? "#fff7ed" : "#f9fafb";
    });

    btn.classList.toggle("ativo");

    // 🔥 quando sair da edição → salva
    if (!editando) {
      salvarLinha(tr);
    }

  });

}

// ===============================
// DELETE
function configurarDelete(tr) {

  const btn = tr.querySelector(".btn-excluir");

  btn.addEventListener("click", () => {

    const numeroOT = tr.children[1].innerText;
    
     // 🔥 SE NÃO TEM OT → só remove da tela
    if (!numeroOT) {
      tr.remove();
      return;
    }

    if (!confirm(`Excluir OT ${numeroOT}?`)) return;

    fetch(`/api/aps/${numeroOT}`, {
      method: "DELETE"
    })
    .then(res => res.json())
    .then(res => {
      console.log("DELETE OK", res);
      tr.remove();
    })
    .catch(err => console.error("ERRO DELETE:", err));

  });

}


// ===============================
// ENTER (NÃO QUEBRA LINHA)
// ===============================
function configurarEnter(tr) {

  const celulas = tr.querySelectorAll("td[contenteditable]");

  celulas.forEach((celula, index) => {

    celula.addEventListener("keydown", (e) => {

      if (e.key === "Enter") {
        e.preventDefault();

        const proxima = celulas[index + 1];
        if (proxima) proxima.focus();
      }

    });

  });

}


// CALCULO DIAS (CORRIGIDO)
// ===============================
function configurarCalculo(tr) {

  const data1 = tr.children[7];
  const data2 = tr.children[8];
  const campo = tr.children[9];

  function calcular() {

    const d1 = converterData(data1.innerText.trim());
    const d2 = converterData(data2.innerText.trim());

    if (d1 && d2) {

      const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
      const dias = diff >= 0 ? diff : 0;

      campo.innerText = dias;

      // 🔥 ALERTAS VISUAIS
      if (dias >= 30) {
        campo.style.background = "#fee2e2"; // vermelho claro
        campo.style.color = "#b91c1c";
        campo.style.fontWeight = "bold";
      } 
      else if (dias > 5) {
        campo.style.color = "red";
        campo.style.background = "";
      } 
      else {
        campo.style.color = "green";
        campo.style.background = "";
      }

    } else {
      campo.innerText = 0;
      campo.style = "";
    }

  }

  data1.addEventListener("keyup", calcular);
  data2.addEventListener("keyup", calcular);

  data1.addEventListener("blur", calcular);
  data2.addEventListener("blur", calcular);

}

// ===============================
// CHECKS
// ===============================
function configurarChecks(tr) {

  const tec = tr.querySelector(".check-tec");
  const arm = tr.querySelector(".check-arm");

  tec.addEventListener("click", () => {

    const ativo = tec.classList.toggle("ativo");

    if (ativo) {
      arm.classList.remove("ativo");
    }

  });

  arm.addEventListener("click", () => {

    const ativo = arm.classList.toggle("ativo");

    if (ativo) {
      tec.classList.remove("ativo");
    }

  });

}

// ===============================
// PEGAR DADOS
// ===============================
function obterDadosLinha(tr) {

  return {
    situacao: tr.children[0].innerText,
    numero_ot: tr.children[1].innerText,
    data: tr.children[2].innerText,
    responsavel: tr.children[3].innerText,
    cod_local: tr.children[4].innerText,
    localizacao: tr.children[5].innerText,
    descricao: tr.children[6].innerText,
    data_manual: tr.children[7].innerText,
    disponibilidade: tr.children[8].innerText,
    dias_espera: tr.children[9].innerText,
    documento_compras: tr.children[10].innerText,
    pedido_tec: tr.children[11].classList.contains("ativo"),
    armazem_mrpt: tr.children[12].classList.contains("ativo"),
    observacoes: tr.children[13].innerText,
    status: tr.children[14].querySelector("select").value
  };

}


// ===============================
// SALVAR
// ===============================
function salvarLinha(tr) {

  const dados = obterDadosLinha(tr);

  if (!dados.numero_ot || dados.numero_ot.trim() === "") {
    console.warn("⚠️ Linha sem Nº OT não será salva");
    return;
  }

  fetch(`/api/aps/${dados.numero_ot}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });

}


// ===============================
// FILTRO + BOTÃO ATIVO
// ===============================
function filtrarStatus(status) {

  filtroAtual = status;
  localStorage.setItem("filtroAPS", status);

  const linhas = document.querySelectorAll("#bodyAPs tr");
  const btnNovaLinha = document.getElementById("btnNovaLinha");

  linhas.forEach(tr => {

    const valor = tr.children[14].querySelector("select").value;

    tr.style.display = (status === "GERAL" || valor === status) ? "" : "none";

  });

  // botão nova linha
  btnNovaLinha.disabled = status !== "GERAL";
  btnNovaLinha.style.opacity = status === "GERAL" ? "1" : "0.5";

  // 🔥 botão ativo
  document.querySelectorAll(".btn-filtro").forEach(btn => {
    btn.classList.remove("ativo");
    if (btn.dataset.status === status) {
      btn.classList.add("ativo");
    }
  });

}


// ===============================
// CONTADORES
// ===============================
function atualizarContadores() {

  const linhas = document.querySelectorAll("#bodyAPs tr");

  const contagem = {
    "GERAL": 0,
    "Disponível": 0,
    "Em Espera - Pedido efetuado": 0,
    "OT Programada": 0,
    "Por Tratar": 0
  };

  linhas.forEach(tr => {

    const status = tr.children[14].querySelector("select").value;

    contagem["GERAL"]++;
    if (contagem[status] !== undefined) contagem[status]++;

  });

  document.querySelectorAll(".btn-filtro").forEach(btn => {

    const status = btn.dataset.status;

    if (contagem[status] !== undefined) {
      btn.innerText = `${status} (${contagem[status]})`;
    }

  });

}


// ===============================
// INICIAR
// ===============================
window.onload = () => {

  carregarAPs(); // 🔥 ESSENCIAL

  const filtroSalvo = localStorage.getItem("filtroAPS") || "GERAL";

  setTimeout(() => {
    filtrarStatus(filtroSalvo);
  }, 500);

};

function carregarAPs() {

  fetch("/api/aps")
    .then(res => res.json())
    .then(data => {

      const tbody = document.getElementById("bodyAPs");
      tbody.innerHTML = "";

      data.forEach(ap => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td contenteditable="false">${ap.situacao || ""}</td>
          <td contenteditable="false">${ap.numero_ot || ""}</td>
          <td contenteditable="false">${ap.data || ""}</td>
          <td contenteditable="false">${ap.responsavel || ""}</td>
          <td contenteditable="false">${ap.cod_local || ""}</td>
          <td contenteditable="false">${ap.localizacao || ""}</td>
          <td contenteditable="false">${ap.descricao || ""}</td>

          <td contenteditable="false">${ap.data_manual || ""}</td>
          <td contenteditable="false">${ap.disponibilidade || ""}</td>
          <td class="dias-espera">${ap.dias_espera || 0}</td>

          <td contenteditable="false">${ap.documento_compras || ""}</td>

          <td class="check-tec ${ap.pedido_tec ? "ativo" : ""}"></td>
          <td class="check-arm ${ap.armazem_mrpt ? "ativo" : ""}"></td>

          <td contenteditable="false">${ap.observacoes || ""}</td>

          <td>
            <select>
              <option ${ap.status === "Disponível" ? "selected" : ""}>Disponível</option>
              <option ${ap.status === "Em Espera - Pedido efetuado" ? "selected" : ""}>Em Espera - Pedido efetuado</option>
              <option ${ap.status === "OT Programada" ? "selected" : ""}>OT Programada</option>
              <option ${ap.status === "Por Tratar" ? "selected" : ""}>Por Tratar</option>
            </select>
          </td>

          <td class="acoes">
            <button class="btn-editar">✏️</button>
            <button class="btn-excluir">🗑</button>
          </td>
        `;

        tbody.appendChild(tr);

        // 🔥 REATIVA FUNCIONALIDADES
        configurarCalculo(tr);
        configurarChecks(tr);
        configurarEnter(tr);
        configurarEditar(tr);
        configurarDelete(tr);

      });

      atualizarContadores();

    });

}

document.getElementById("btnSalvarTudo").addEventListener("click", () => {

  const linhas = document.querySelectorAll("#bodyAPs tr");

  const dados = [];

  linhas.forEach(tr => {

    const numeroOT = tr.children[1].innerText;

    if (!numeroOT || numeroOT.trim() === "") return;

    dados.push(obterDadosLinha(tr));

  });

  console.log("ENVIANDO:", dados);

  fetch("/api/aps/lote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  })
  .then(res => res.json())
  .then(res => {
    console.log("RESPOSTA:", res);
    alert("✔ Salvo com sucesso!");
  })
  .catch(err => {
    console.error("ERRO:", err);
    alert("Erro ao salvar!");
  });

});


