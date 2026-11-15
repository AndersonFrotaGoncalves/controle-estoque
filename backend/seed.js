// Dados de demonstração (fictícios), criados só quando a base SQLite é nova.
const bcrypt = require("bcryptjs");

module.exports = function seed(executar) {
  // gerador com semente fixa: os dados são sempre os mesmos
  let s = 42;
  const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const escolher = (lista) => lista[Math.floor(r() * lista.length)];

  executar("INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
    ["Administrador", "admin@estoque.demo", bcrypt.hashSync("admin123", 10), "admin"]);
  executar("INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
    ["Operador", "operador@estoque.demo", bcrypt.hashSync("operador123", 10), "user"]);

  const pecas = [
    "VEDANTE O-RING 12MM", "VEDANTE O-RING 20MM", "ANILHA SILICONE 30X42", "ANILHA COBRE 3/8",
    "RESISTÊNCIA 1200W", "RESISTÊNCIA 2000W", "TERMÓSTATO 120ºC", "SONDA TEMPERATURA NTC",
    "ELETROVÁLVULA 2 VIAS", "ELETROVÁLVULA 3 VIAS", "BOMBA VIBRATÓRIA 48W", "BOMBA ROTATIVA 150L",
    "PRESSOSTATO 1,2 BAR", "MANÓMETRO 0-16 BAR", "FILTRO DE ÁGUA 10\"", "CARTUCHO ANTICALCÁRIO",
    "MANGUEIRA PTFE 1M", "TUBO COBRE 1/4", "TUBO COBRE 3/8", "LIGAÇÃO RÁPIDA 1/4",
    "MOTOR MOINHO 230V", "MÓS MOINHO 64MM", "PORTA-FILTRO DUPLO", "CESTO FILTRO 14G",
    "CHUVEIRO GRUPO 57MM", "JUNTA GRUPO 8,5MM", "PLACA ELETRÓNICA CPU", "TECLADO MEMBRANA 6T",
    "INTERRUPTOR ON/OFF", "RELÉ 12V", "CONDENSADOR 4µF", "FUSÍVEL 10A",
    "VENTILADOR 120MM", "SENSOR DE NÍVEL", "TORNEIRA VAPOR", "LANÇA VAPOR INOX",
    "PARAFUSO M4X10 INOX", "PORCA M6 INOX", "ABRAÇADEIRA 12-22", "SUPORTE PAREDE 450MM",
  ];
  const racks = ["A", "B", "C", "D", "E", "F", "G", "H", "E-ARM4", "E-ARM5"];
  const usadas = new Set();
  const ids = [];

  pecas.forEach((desc, i) => {
    // até 3 tamanhos/variantes por peça, para encher o mapa
    const variantes = 1 + Math.floor(r() * 3);
    for (let v = 0; v < variantes; v++) {
      let rack, nivel;
      do { rack = escolher(racks); nivel = 1 + Math.floor(r() * 30); } while (usadas.has(rack + nivel));
      usadas.add(rack + nivel);
      const minimo = 2 + Math.floor(r() * 4);
      const sorte = r();
      const qtd = sorte < 0.1 ? 0 : sorte < 0.22 ? Math.max(1, minimo - 1) : minimo + Math.floor(r() * 40);
      const codigo = `PC-${String(10000 + i * 37 + v * 7).padStart(5, "0")}`;
      const descricao = variantes > 1 ? `${desc} (V${v + 1})` : desc;
      const res = executar(
        "INSERT INTO produtos (codigo, descricao, rack, nivel, quantidade, quantidade_minima) VALUES (?, ?, ?, ?, ?, ?)",
        [codigo, descricao, rack, String(nivel), qtd, minimo]);
      ids.push(res.insertId);
    }
  });

  // histórico de movimentações dos últimos 60 dias
  const quem = ["admin@estoque.demo", "operador@estoque.demo"];
  const obs = { entrada: ["Receção de encomenda", "Devolução de técnico", "Acerto de inventário"], saida: ["Abastecimento técnico", "Reparação em oficina", "Venda balcão"] };
  for (let d = 60; d >= 0; d--) {
    const n = Math.floor(r() * 5);
    for (let k = 0; k < n; k++) {
      const tipo = r() < 0.4 ? "entrada" : "saida";
      const data = new Date(Date.now() - d * 864e5 - Math.floor(r() * 8) * 36e5);
      const iso = data.toISOString().slice(0, 19).replace("T", " ");
      executar("INSERT INTO movimentacoes (produto_id, tipo, quantidade, observacao, usuario, data) VALUES (?, ?, ?, ?, ?, ?)",
        [escolher(ids), tipo, 1 + Math.floor(r() * 6), escolher(obs[tipo]), escolher(quem), iso]);
    }
  }
  console.log(`Dados de demonstração criados: ${ids.length} produtos.`);
};
