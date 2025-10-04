
import createInputNodeExecutor from "./createInputNodeExecutor.js";
import createLLMNodeExecutor from "./createLLMNodeExecutor.js";
import createConditionNodeExecutor from "./createConditionNodeExecutor.js";
import createOutputNodeExecutor from "./createOutputNodeExecutor.js";
/**
 * 注册所有节点执行器
 * @param {*} graph 图对象
 * @param {*} nodes 节点数组
 * @param {*} nodeMap 节点映射
 * @param {*} inputParams 输入参数
 */
 function registerNodeExecutors(graph, nodes, nodeMap, inputParams) {
    nodes.forEach((node) => {
      if (node.type === "inputNode") {
        graph.addNode(node.id, createInputNodeExecutor(node, inputParams));
      } else if (node.type === "llmNode") {
        graph.addNode(node.id, createLLMNodeExecutor(node, nodeMap));
      } else if (node.type === "conditionNode") {
        graph.addNode(node.id, createConditionNodeExecutor(node, nodeMap));
      } else if (node.type === "outputNode") {
        graph.addNode(node.id, createOutputNodeExecutor(node, nodeMap));
      }
    });
  }

  export default registerNodeExecutors