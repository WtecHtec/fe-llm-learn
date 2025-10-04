import runWorkflow from "../WorkFlowRunner/index.js";

const dsl = {
  "nodes":[
    {"id":"input-1","type":"inputNode","data":{"label":"输入节点","inputs":[{"name":"prompt","type":"string"},{"name":"system","type":"string"}]}},
    {"id":"output-1","type":"outputNode","data":{"label":"输出节点","outputs":[{"name":"answer","from":"llm-2.content"},{"name":"parma","from":"input-1.prompt"}]}},
    {"id":"llm-2","type":"llmNode","data":{"label":"LLM","model":"gpt-3.5","inputs":[{"name":"prompt","from":"input-1.prompt"},{"name":"system","from":"input-1.system"}],"outputs":[{"name":"content","type":"string"}]}}
  ],
  "edges":[
    {"source":"input-1","sourceHandle":"source","target":"llm-2","targetHandle":"target","id":"xy-edge__input-1source-llm-2target"},
    {"source":"llm-2","sourceHandle":"source","target":"output-1","targetHandle":"target","id":"xy-edge__llm-2source-output-1target"}
  ]
};

const inputParams = { prompt: "你好，世界", system: "你是助手" };

const result = await runWorkflow(dsl, inputParams);
console.log(result);