const express = require("express");
const cors = require("cors");
const path = require("path");

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "SUA_SENHA_AQUI",
  database: "railway",
  port: 50021
});

connection.connect(function(err) {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
  } else {
    console.log("MySQL conectado com sucesso!");
  }
});