
import { resolveFrom } from "../utils.js";
/**
 * 创建输出节点执行器
 * @param {*} node 节点
 * @param {*} nodeMap 节点映射
 */
function createOutputNodeExecutor(node, nodeMap) {
    return async (state) => {
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
    };
  }
  export default createOutputNodeExecutor