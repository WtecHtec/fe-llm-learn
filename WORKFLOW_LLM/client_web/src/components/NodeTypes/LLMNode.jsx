import React from "react";
import NodeBase from "./NodeBase";

const LLMNode = ({ data }) => {
  return (
    <NodeBase
      data={data}
      showHandles={{ input: true, output: true }}
      handlePositions={{ input: "left", output: "right" }}
      colors={{ input: "#f59e0b", output: "#ef4444" }}
    >
        <div className="text-xs text-gray-700 mb-1">
          <div className="font-semibold text-gray-800">模型:</div>
          {data.model || '-'}
        </div>
        <div className="text-xs text-gray-700 mb-1">
          <div className="font-semibold text-gray-800">提示词:</div>
          <div className="line-clamp-2">{data.system_prompt || '-'}</div> 
        </div>
        </NodeBase>
  );
};

export default LLMNode;