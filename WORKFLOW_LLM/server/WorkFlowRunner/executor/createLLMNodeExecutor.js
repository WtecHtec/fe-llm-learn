import { getNodeInputs } from "../utils.js";
import callLLM from "../../llmClients.js";

const formatSystem = (system_prompt, inputs, node) => {
        
    let formattedSystem = ''
    if (system_prompt) {
         // 使用正则表达式匹配 ${key} 格式的占位符
        formattedSystem = system_prompt.replace(/\$\{([^}]+)\}/g, (match, key) => {
            // 从 inputs 中获取对应 key 的值，如果不存在则返回原占位符
            return inputs[key] !== undefined ? inputs[key] : match;
        });
       if (Array.isArray(node.data.outputs)) {
        formattedSystem = `${formattedSystem} ; 输出结果格式如下:${JSON.stringify(node.data.outputs)}`
       }

    }
   
    return formattedSystem
}
/**
 * 创建LLM节点执行器
 * @param {*} node 节点
 * @param {*} nodeMap 节点映射
 */
export function createLLMNodeExecutor(node, nodeMap) {
    return async (state) => {
        const inputs = getNodeInputs(node, nodeMap, state.nodeData);

        // 支持多输入字段，组合成 prompt
        const promptParts = [];
        Object.entries(inputs).forEach(([key, value]) => {
            if (value !== undefined) promptParts.push(`${key}: ${value}`);
        });
        const prompt = promptParts.join("\n");
        const system_prompt = formatSystem(node.data.system_prompt, inputs, node);

        const result = await callLLM(system_prompt, prompt, node.data.model);
        const resultObject = {}
        try {
           let jsons = JSON.parse(result);
           if ( Array.isArray(jsons) ) {
            jsons.forEach.call(jsons, (json) => {
                resultObject[json.name] = json.value
            })
           }
        } catch (error) {
            console.error(error);
            
        }
        // 输出字段映射 DSL 输出
        const outputs = {};
        if (node.data.outputs) {
            node.data.outputs.forEach((out) => {
                outputs[out.name] = resultObject[out.name] || result;
            });
        }

        const nodeData = { ...state.nodeData };
        nodeData[node.id] = outputs;
        return {
            nodeData,
            currentStep: node.id
        };
    };
}


export default createLLMNodeExecutor