import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import runWorkflow  from "./WorkFlowRunner/index.js";

import "dotenv/config";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 执行 workflow 接口
app.post("/run-workflow", async (req, res) => {
  try {
    const { dsl, inputParams } = req.body;
    const result = await runWorkflow(dsl, inputParams);
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = 3100;
app.listen(PORT, () => {
  console.log(`Workflow backend running on http://localhost:${PORT}`);
});