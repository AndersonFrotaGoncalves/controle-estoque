// ===============================
// CONVERTER DATA (PT-BR)
// ===============================

function converterData(data) {

  if (!data) return null;

  // remove hora (se tiver)
  const limpa = data.split(" ")[0];

  const partes = limpa.split("/");

  if (partes.length !== 3) return null;

  let dia = partes[0];
  let mes = partes[1];
  let ano = partes[2];

  // 🔥 corrige ano curto (26 → 2026)
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
    <td contenteditable="true"></td>
    <td contenteditable="true"></td>
    <td contenteditable="true"></td>
    <td contenteditable="true"></td>
    <td contenteditable="true"></td>
    <td contenteditable="true"></td>
    <td contenteditable="true"></td>

    <td contenteditable="true" class="data-manual"></td>
    <td contenteditable="true" class="data-disponivel"></td>
    <td class="dias-espera">0</td>

    <td contenteditable="true"></td>

    <td class="check-tec"></td>
    <td class="check-arm"></td>

    <td contenteditable="true"></td>

    <td>
        <select>
            <option>Por Tratar</option>
            <option>Em Andamento</option>
            <option>Disponível</option>
            <option>OT Programada</option>
            <option>Concluído</option>
        </select>
    </td>
  `;

  tbody.appendChild(tr);

  configurarCalculo(tr);
  configurarChecks(tr);
  configurarEnter(tr);
  configurarAutoSave(tr); // ✅ AGORA NO LUGAR CERTO
};


// ===============================
// ENTER NÃO QUEBRA LINHA
// ===============================

function configurarEnter(tr) {

  const celulas = tr.querySelectorAll("td[contenteditable='true']");

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


// ===============================
// CALCULAR DIAS
// ===============================

function configurarCalculo(tr) {

  tr.addEventListener("input", () => {

    const dataManual = tr.children[7].innerText.trim();
    const disponibilidade = tr.children[8].innerText.trim();
    const campoDias = tr.children[9];

    // 🔥 só calcula se ambas existirem
    if (!dataManual || !disponibilidade) {
      campoDias.innerText = "0";
      return;
    }

    const d1 = converterData(dataManual);
    const d2 = converterData(disponibilidade);

    if (!d1 || !d2 || isNaN(d1) || isNaN(d2)) {
      campoDias.innerText = "0";
      return;
    }

    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));

    campoDias.innerText = diff >= 0 ? diff : 0;

    // 🎯 cor automática
    if (diff > 5) {
      campoDias.style.color = "red";
    } else {
      campoDias.style.color = "green";
    }

  });

}


// ===============================
// CHECKS (TEC / ARMAZÉM)
// ===============================

function configurarChecks(linha) {

  const tec = linha.querySelector(".check-tec");
  const arm = linha.querySelector(".check-arm");

  tec.addEventListener("click", () => {

    tec.classList.toggle("ativo");
    arm.classList.remove("ativo");

    tec.innerText = tec.classList.contains("ativo") ? "X" : "";
    arm.innerText = "";

    tec.style.background = tec.classList.contains("ativo") ? "#cf0707" : "";
    tec.style.color = "#fff";

    arm.style.background = "";
  });

  arm.addEventListener("click", () => {

    arm.classList.toggle("ativo");
    tec.classList.remove("ativo");

    arm.innerText = arm.classList.contains("ativo") ? "X" : "";
    tec.innerText = "";

    arm.style.background = arm.classList.contains("ativo") ? "#03751c" : "";
    arm.style.color = "#fff";

    tec.style.background = "";
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
// AUTO SAVE
// ===============================

let timeoutSalvar;

function configurarAutoSave(tr) {

  tr.addEventListener("input", () => {

    clearTimeout(timeoutSalvar);

    timeoutSalvar = setTimeout(() => {
      salvarLinha(tr);
    }, 800);

  });

}


// ===============================
// SALVAR
// ===============================

function salvarLinha(tr) {

  const dados = obterDadosLinha(tr);

  if (!dados.numero_ot) return;

  fetch("/api/aps", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });

}

function carregarAPs() {

  fetch("/api/aps")
    .then(res => res.json())
    .then(data => {

      console.log("DADOS DO BANCO:", data); // 👈 debug

      const tbody = document.getElementById("bodyAPs");

      if (!tbody) {
        console.error("bodyAPs NÃO encontrado ❌");
        return;
      }

      tbody.innerHTML = "";

      data.forEach(ap => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${ap.situacao || ""}</td>
          <td>${ap.numero_ot || ""}</td>
          <td>${ap.data || ""}</td>
          <td>${ap.responsavel || ""}</td>
          <td>${ap.cod_local || ""}</td>
          <td>${ap.localizacao || ""}</td>
          <td>${ap.descricao || ""}</td>

          <td contenteditable="true">${ap.data_manual || ""}</td>
          <td contenteditable="true">${ap.disponibilidade || ""}</td>
          <td class="dias-espera">${ap.dias_espera || 0}</td>

          <td>${ap.documento_compras || ""}</td>

          <td class="check-tec ${ap.pedido_tec ? "ativo" : ""}">
            ${ap.pedido_tec ? "X" : ""}
          </td>

          <td class="check-arm ${ap.armazem_mrpt ? "ativo" : ""}">
            ${ap.armazem_mrpt ? "X" : ""}
          </td>

          <td>${ap.observacoes || ""}</td>

          <td>
            <select>
              <option ${ap.status === "Por Tratar" ? "selected" : ""}>Por Tratar</option>
              <option ${ap.status === "Em Andamento" ? "selected" : ""}>Em Andamento</option>
              <option ${ap.status === "Disponível" ? "selected" : ""}>Disponível</option>
              <option ${ap.status === "OT Programada" ? "selected" : ""}>OT Programada</option>
              <option ${ap.status === "Concluído" ? "selected" : ""}>Concluído</option>
            </select>
          </td>
        `;

        tbody.appendChild(tr);

        // 🔥 REATIVA FUNCIONALIDADES
        configurarCalculo(tr);
        configurarChecks(tr);
        configurarEnter(tr);
        configurarAutoSave(tr);

      });

    })
    .catch(err => {
      console.error("Erro ao carregar:", err);
    });

}


window.onload = carregarAPs;