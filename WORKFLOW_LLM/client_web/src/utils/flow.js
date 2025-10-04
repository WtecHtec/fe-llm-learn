
/**
   * 获取当前节点可绑定的上游输出参数
   * @param {*} nodeId
   * @returns [{ nodeId, nodeLabel, name, type }]
   */
export function getNodeAvailableInputs(nodeId, nodes, edges ) {
    const visited = new Set();
    const result = [];

    const traverseUpstream = (currentNodeId) => {
      if (visited.has(currentNodeId)) return;
      visited.add(currentNodeId);

      // 找所有指向 currentNodeId 的 edges
      const incomingEdges = edges.filter(
        (e) => e.target === currentNodeId
      );

      incomingEdges.forEach((edge) => {
        const upstreamNode = nodes.find((n) => n.id === edge.source);
        if (!upstreamNode) return;

        // upstream 输出参数
        (upstreamNode.data.outputs || []).forEach((out) => {
          result.push({
            nodeId: upstreamNode.id,
            nodeLabel: upstreamNode.data.label,
            name: out.name,
            type: out.type,
          });
        });

        // 递归往上游找
        traverseUpstream(upstreamNode.id);
      });
    };

    const currentNode = nodes.find((n) => n.id === nodeId);
    if (!currentNode) return [];

    if (currentNode.type === "inputNode") {
      // 输入节点可选输入参数为自己的输入参数
      (currentNode.data.inputs || []).forEach((inp) =>
        result.push({
          nodeId: currentNode.id,
          nodeLabel: currentNode.data.label,
          name: inp.name,
          type: inp.type,
        })
      );
    } else {
      // 普通节点：从上游遍历
      traverseUpstream(nodeId);

      // 同时加上输入节点的输入参数（全局输入）
      nodes
        .filter((n) => n.type === "inputNode")
        .forEach((inputNode) => {
          (inputNode.data.inputs || []).forEach((inp) =>
            result.push({
              nodeId: inputNode.id,
              nodeLabel: inputNode.data.label,
              name: inp.name,
              type: inp.type,
            })
          );
        });
    }

    return result;
  };


  export function  exportDSL(nodes, edges) {
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        data: n.data,
      })),
      edges,
    };
  }
