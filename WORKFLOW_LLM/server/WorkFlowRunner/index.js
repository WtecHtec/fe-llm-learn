import { StateGraph, START, END } from "@langchain/langgraph";

import { z } from "zod";
import { findInputNode } from "./utils.js";
import registerNodeExecutors from "./executor/index.js";
import addEdgesToGraph from "./edges/index.js";
/**
 * 创建状态模式
 */
function createStateSchema() {
    return z.object({
        nodeData: z.record(z.any()),
        inputParams: z.any(),
        outputResults: z.record(z.any()),
        currentStep: z.string().optional()
    });
}


/**
* 建立节点映射
* @param {*} nodes 节点数组
*/
function createNodeMap(nodes) {
    const nodeMap = {};
    nodes.forEach((node) => {
        nodeMap[node.id] = node;
    });
    return nodeMap;
}





/**
* 设置图的入口和出口
* @param {*} graph 图对象
* @param {*} startNode 开始节点
* @param {*} outputNodes 输出节点数组
*/
function setupGraphEntryAndExit(graph, startNode, outputNodes) {
    // 设置入口点
    graph.addEdge(START, startNode.id);

    // 找到输出节点并连接到 END
    outputNodes.forEach(outputNode => {
        graph.addEdge(outputNode.id, END);
    });
}

/**
* 收集输出结果
* @param {*} nodes 节点数组
* @param {*} result 执行结果
*/
function collectOutputResults(nodes, result) {
    const outputResults = {};
    nodes
        .filter((n) => n.type === "outputNode")
        .forEach((n) => {
            if (result.nodeData[n.id]) {
                outputResults[n.id] = result.nodeData[n.id];
            }
        });
    return outputResults;
}


/**
* 执行 workflow
* @param {*} dsl workflow DSL(JSON)
* @param {*} inputParams 输入参数
*/
async function runWorkflow(dsl, inputParams = {}) {
    // 创建状态模式和图
    const StateSchema = createStateSchema();
    const graph = new StateGraph(StateSchema);

    // 建立节点映射
    const nodeMap = createNodeMap(dsl.nodes);

    // 找到输入节点作为入口点
    const startNode = findInputNode(dsl.nodes);

    // 注册节点执行器
    registerNodeExecutors(graph, dsl.nodes, nodeMap, inputParams, dsl.edges);

    // 添加边
    addEdgesToGraph(graph, dsl.edges, nodeMap);

    // 设置入口和出口
    const outputNodes = dsl.nodes.filter(node => node.type === "outputNode");
    setupGraphEntryAndExit(graph, startNode, outputNodes);

    // 编译并执行 workflow
    const compiledGraph = graph.compile();

    // const config = {
    //     callbacks: [
    //         {
    //             handleChainStart: async (chain) => {
    //                 console.log("链开始:", chain);
    //             },
    //             handleChainEnd: async (outputs) => {
    //                 console.log("链结束:", outputs);
    //             },
    //             handleChainError: async (err) => {
    //                 console.log("链错误:", err);
    //             },
    //         }
    //     ]
    // };


    const result = await compiledGraph.invoke({
        nodeData: {},
        inputParams,
        outputResults: {},
        currentStep: startNode.id

    });

    // 收集并返回输出结果
    return collectOutputResults(dsl.nodes, result);
}

export default runWorkflow