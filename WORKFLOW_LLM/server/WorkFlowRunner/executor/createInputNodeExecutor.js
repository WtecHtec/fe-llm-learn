/**
 * 创建输入节点执行器
 * @param {*} node 节点
 * @param {*} inputParams 输入参数
 */
function createInputNodeExecutor(node, inputParams) {
    return async (state) => {
        const nodeData = { ...state.nodeData };
        nodeData[node.id] = inputParams; // 注入全局输入
        return {
            nodeData,
            currentStep: node.id
        };
    };
}

export default createInputNodeExecutor