
/**
* 根据 from 字段解析输入参数
* @param {*} fromStr  格式: "nodeId.fieldName"
* @param {*} nodeMap  所有节点 map
* @param {*} nodeData  当前状态中的节点数据
*/
export function resolveFrom(fromStr, nodeMap, nodeData) {
    if (!fromStr) return undefined;
    const [nodeId, fieldName] = fromStr.split(".");
    const node = nodeMap[nodeId];
    if (!node || !nodeData[nodeId]) return undefined;
    return nodeData[nodeId][fieldName];
}

/**
* 查找输入节点
* @param {*} nodes 节点数组
*/
export function findInputNode(nodes) {
    const inputNodes = nodes.filter(node => node.type === "inputNode");
    if (inputNodes.length === 0) {
        throw new Error("No input node found in workflow");
    }
    return inputNodes[0];
}

/**
* 根据 node id 获取上游节点输出参数，解析 inputs
* @param {*} node 当前节点
* @param {*} nodeMap 所有节点 map
* @param {*} nodeData 当前状态中的节点数据
*/
export function getNodeInputs(node, nodeMap, nodeData) {
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