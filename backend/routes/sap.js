// Reads the stock report exported from SAP and returns the rows, without saving anything.
// The front end compares these quantities with the system's.
const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/sap", upload.single("arquivo"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });
  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    res.json(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Could not read the SAP report." });
  }
});

module.exports = router;
