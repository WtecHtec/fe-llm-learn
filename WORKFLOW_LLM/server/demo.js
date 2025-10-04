import { StateGraph, START, END } from "@langchain/langgraph";
import callLLM from "./llmClients.js";
import { z } from "zod";

/**
 * 根据 from 字段解析输入参数
 * @param {*} fromStr  格式: "nodeId.fieldName"
 * @param {*} nodeMap  所有节点 map
 * @param {*} nodeData  当前状态中的节点数据
 */
function resolveFrom(fromStr, nodeMap, nodeData) {
  if (!fromStr) return undefined;
  const [nodeId, fieldName] = fromStr.split(".");
  const node = nodeMap[nodeId];
  if (!node || !nodeData[nodeId]) return undefined;
  return nodeData[nodeId][fieldName];
}

/**
 * 根据 node id 获取上游节点输出参数，解析 inputs
 * @param {*} node 当前节点
 * @param {*} nodeMap 所有节点 map
 * @param {*} nodeData 当前状态中的节点数据
 */
function getNodeInputs(node, nodeMap, nodeData) {
  const inputs = {};
  if (!node.data.inputs) return inputs;

  node.data.inputs.forEach((inp) => {
    if (inp.from) {
      inputs[inp.name] = resolveFrom(inp.from, nodeMap, nodeData);
    } else if (inp.value !== undefined) {
      inputs[inp.name] = inp.value; // 自定义输入值
    } else {
      inputs[inp.name] = undefined; // 默认 undefined
    }
  });

  return inputs;
}

/**
 * 执行 workflow
 * @param {*} dsl workflow DSL(JSON)
 * @param {*} inputParams 输入参数
 */
export async function runWorkflow(dsl, inputParams = {}) {
  // 使用 Zod schema 定义状态
  const StateSchema = z.object({
    nodeData: z.record(z.any()),
    inputParams: z.any(),
    outputResults: z.record(z.any()),
    currentStep: z.string().optional()
  });
  
  const graph = new StateGraph(StateSchema);

  // 建立节点映射
  const nodeMap = {};
  dsl.nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });

  // 找到输入节点作为入口点
  const inputNodes = dsl.nodes.filter(node => node.type === "inputNode");
  if (inputNodes.length === 0) {
    throw new Error("No input node found in workflow");
  }
  const startNode = inputNodes[0];

  // 注册节点执行器
  dsl.nodes.forEach((node) => {
    if (node.type === "inputNode") {
      graph.addNode(node.id, async (state) => {
        const nodeData = { ...state.nodeData };
        nodeData[node.id] = inputParams; // 注入全局输入
        return { 
          nodeData,
          currentStep: node.id
        };
      });
    } else if (node.type === "llmNode") {
      graph.addNode(node.id, async (state) => {
        const inputs = getNodeInputs(node, nodeMap, state.nodeData);

        // 支持多输入字段，组合成 prompt
        const promptParts = [];
        Object.entries(inputs).forEach(([key, value]) => {
          if (value !== undefined) promptParts.push(`${key}: ${value}`);
        });
        console.log("inputs::", inputs)
        const prompt = promptParts.join("\n");

        const result = "llm 结果";

        // 输出字段映射 DSL 输出
        const outputs = {};
        if (node.data.outputs) {
          node.data.outputs.forEach((out) => {
            outputs[out.name] = result;
          });
        }
        
        const nodeData = { ...state.nodeData };
        nodeData[node.id] = outputs;
        return { 
          nodeData,
          currentStep: node.id
        };
      });
    } else if (node.type === "conditionNode") {
      graph.addNode(node.id, async (state) => {
        const inputs = getNodeInputs(node, nodeMap, state.nodeData);
        const condition = node.data.condition; 
        const fn = new Function("inputs", `return ${condition}`);
        const value = fn(inputs);
        
        const nodeData = { ...state.nodeData };
        nodeData[node.id] = value;
        return { 
          nodeData,
          currentStep: node.id
        };
      });
    } else if (node.type === "outputNode") {
      graph.addNode(node.id, async (state) => {
        const outputs = {};
        if (node.data.outputs) {
          node.data.outputs.forEach((out) => {
            outputs[out.name] = resolveFrom(out.from, nodeMap, state.nodeData);
          });
        }
        
        const nodeData = { ...state.nodeData };
        nodeData[node.id] = outputs;
        return { 
          nodeData,
          outputResults: outputs,
          currentStep: node.id
        };
      });
    }
  });

  // 添加边
  dsl.edges.forEach((e) => graph.addEdge(e.source, e.target));

  // 设置入口点 - 使用新的方法替代已弃用的 setEntryPoint
  graph.addEdge(START, startNode.id);

  // 找到输出节点并连接到 END
  const outputNodes = dsl.nodes.filter(node => node.type === "outputNode");
  outputNodes.forEach(outputNode => {
    graph.addEdge(outputNode.id, END);
  });

  // 编译 graph
  const compiledGraph = graph.compile();

  // 执行 workflow
  const result = await compiledGraph.invoke({
    nodeData: {},
    inputParams,
    outputResults: {},
    currentStep: startNode.id
  });

  // 收集输出节点结果
  const outputResults = {};
  dsl.nodes
    .filter((n) => n.type === "outputNode")
    .forEach((n) => {
      if (result.nodeData[n.id]) {
        outputResults[n.id] = result.nodeData[n.id];
      }
    });

  return outputResults;
}