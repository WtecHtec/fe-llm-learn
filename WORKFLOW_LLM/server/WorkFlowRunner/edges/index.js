/**
 * 添加边到图中
 * @param {*} graph 图对象
 * @param {*} edges 边数组
 * @param {*} nodeMap 节点映射
 */
function addEdgesToGraph(graph, edges, nodeMap) {
    // 按源节点分组边
    const edgesBySource = {};
    
    edges.forEach((e) => {
        if (!edgesBySource[e.source]) {
            edgesBySource[e.source] = [];
        }
        edgesBySource[e.source].push(e);
    });

    // 处理每个源节点的边
    Object.entries(edgesBySource).forEach(([sourceId, sourceEdges]) => {
        const sourceNode = nodeMap[sourceId];
        
        if (sourceNode && sourceNode.type === "conditionNode") {
            // 条件节点：创建条件路由映射
            const conditionRoutes = {};
            
            sourceEdges.forEach((e) => {
                const sourceHandle = e.sourceHandle; // target-0, target-1, target-else 等
                let routeKey = sourceHandle;
                
                // 处理特殊的路由键
                if (sourceHandle === "target-else") {
                    routeKey = `router_else_${e.id}`;
                } else if (sourceHandle && sourceHandle.startsWith("target-")) {
                    routeKey = `route_${e.id}`;
                }
                
                conditionRoutes[routeKey] = e.target;
            });
            
            // 确保至少有一个路由
            if (Object.keys(conditionRoutes).length === 0) {
                console.warn(`No routes found for condition node ${sourceId}`);
                return;
            }

            
            // 添加条件边：根据条件结果选择路由
            graph.addConditionalEdges(
                sourceId,
                (state) => {
                    const conditionData = state.nodeData[sourceId];
   
                    
                    const { matchedConditionId , nodeId} = conditionData

                    const edge = sourceEdges.find(e => e.sourceHandle === matchedConditionId && e.source === nodeId)
                    // 根据条件结果选择路由
                    if (conditionData.result) {
                        return  `route_${edge.id}`;
                    } else {
                        // 条件为假时，选择 else 路由
                        return `router_else_${edge.id}`;
                    }
                },
                conditionRoutes
            );
        } else {
            // 普通节点：直接添加边
            sourceEdges.forEach((e) => {
                graph.addEdge(e.source, e.target);
            });
        }
    });
}

export default addEdgesToGraph;