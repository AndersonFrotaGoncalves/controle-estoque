// Demo data (fictional), created only when the SQLite database is new.
const bcrypt = require("bcryptjs");

module.exports = function seed(executar) {
  // fixed-seed generator: the data is always the same
  let s = 42;
  const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const escolher = (lista) => lista[Math.floor(r() * lista.length)];

  executar("INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
    ["Administrator", "admin@estoque.demo", bcrypt.hashSync("admin123", 10), "admin"]);
  executar("INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
    ["Operator", "operador@estoque.demo", bcrypt.hashSync("operador123", 10), "user"]);

  const pecas = [
    "O-RING SEAL 12MM", "O-RING SEAL 20MM", "SILICONE WASHER 30X42", "COPPER WASHER 3/8",
    "HEATING ELEMENT 1200W", "HEATING ELEMENT 2000W", "THERMOSTAT 120ºC", "NTC TEMPERATURE PROBE",
    "2-WAY SOLENOID VALVE", "3-WAY SOLENOID VALVE", "VIBRATION PUMP 48W", "ROTARY PUMP 150L",
    "PRESSURE SWITCH 1.2 BAR", "PRESSURE GAUGE 0-16 BAR", "WATER FILTER 10\"", "ANTI-SCALE CARTRIDGE",
    "PTFE HOSE 1M", "COPPER PIPE 1/4", "COPPER PIPE 3/8", "QUICK CONNECTOR 1/4",
    "GRINDER MOTOR 230V", "GRINDER BURRS 64MM", "DOUBLE PORTAFILTER", "FILTER BASKET 14G",
    "GROUP SHOWER SCREEN 57MM", "GROUP GASKET 8.5MM", "CPU CIRCUIT BOARD", "MEMBRANE KEYPAD 6 KEYS",
    "ON/OFF SWITCH", "RELAY 12V", "CAPACITOR 4µF", "FUSE 10A",
    "FAN 120MM", "LEVEL SENSOR", "STEAM VALVE", "STAINLESS STEAM WAND",
    "SCREW M4X10 STAINLESS", "NUT M6 STAINLESS", "HOSE CLAMP 12-22", "WALL BRACKET 450MM",
  ];
  const racks = ["A", "B", "C", "D", "E", "F", "G", "H", "E-ARM4", "E-ARM5"];
  const usadas = new Set();
  const ids = [];

  pecas.forEach((desc, i) => {
    // up to 3 sizes/variants per part, to fill the map
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

  // movement history for the last 60 days
  const quem = ["admin@estoque.demo", "operador@estoque.demo"];
  const obs = { entrada: ["Order received", "Returned by technician", "Stock count adjustment"], saida: ["Technician restock", "Workshop repair", "Counter sale"] };
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
  console.log(`Demo data created: ${ids.length} products.`);
};
