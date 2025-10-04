
import { resolveFrom, getNodeInputs } from "../utils.js";

/**
 * 评估单个条件
 * @param {*} condition 条件对象
 * @param {*} nodeMap 节点映射
 * @param {*} nodeData 节点数据
 */
function evaluateCondition(condition, nodeMap, nodeData) {
    const leftValue = resolveFrom(condition.left, nodeMap, nodeData);
    const rightValue = condition.right;
   
    switch (condition.op) {
      case "==":
        return leftValue == rightValue;
      case "===":
        return leftValue === rightValue;
      case "!=":
        return leftValue != rightValue;
      case "!==":
        return leftValue !== rightValue;
      case ">":
        return leftValue > rightValue;
      case ">=":
        return leftValue >= rightValue;
      case "<":
        return leftValue < rightValue;
      case "<=":
        return leftValue <= rightValue;
      case "contains":
        return String(leftValue).includes(String(rightValue));
      case "startsWith":
        return String(leftValue).startsWith(String(rightValue));
      case "endsWith":
        return String(leftValue).endsWith(String(rightValue));
      default:
        console.warn(`Unknown operator: ${condition.op}`);
        return false;
    }
  }


/**
 * 评估条件节点
 * @param {*} node 条件节点
 * @param {*} nodeMap 节点映射
 * @param {*} nodeData 节点数据
 */
function evaluateConditionNode(node, nodeMap, nodeData, edges) {
    const conditions = node.data.conditions || [];
    let conditionResult = false;
    let matchedConditionId = 'target-else';
    


    // 评估每个条件
    for (let i = 0; i < conditions.length; i++) {
     
      const condition = conditions[i];
      const result = evaluateCondition(condition, nodeMap, nodeData);
      
    
      
     
      if (result) {
        conditionResult = true;
        matchedConditionId = `target-${i}`;
        break; // 找到第一个匹配的条件就停止（OR逻辑）
      } 


    }
    

    return {
      result: conditionResult,
      nodeId: node.id,
      matchedConditionId,
      conditions: conditions
    };
  }

  /**
 * 创建条件节点执行器
 * @param {*} node 节点
 * @param {*} nodeMap 节点映射
 */
function createConditionNodeExecutor(node, nodeMap, edges) {
    return async (state) => {
      const inputs = getNodeInputs(node, nodeMap, state.nodeData);
      const conditionResult = evaluateConditionNode(node, nodeMap, state.nodeData, edges);
      
     
      const nodeData = { ...state.nodeData };
      nodeData[node.id] = conditionResult;
   

      return { 
        nodeData,
        currentStep: node.id
      };
    };
  }

  export default createConditionNodeExecutor