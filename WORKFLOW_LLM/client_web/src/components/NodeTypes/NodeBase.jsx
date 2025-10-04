import React from "react";
import { Handle, Position } from "@xyflow/react";

const NodeBase = ({ data, handlePositions = { input: Position.Left, output: Position.Right }, showHandles = { input: true, output: true }, colors = { input: "green", output: "blue" } , children}) => {
  const { label, inputs = [], outputs = [] } = data;

  return (
    <div className="rounded-lg border p-3 shadow-md min-w-[180px] bg-white">
      {/* 节点标题 */}
      <div className="font-bold text-center mb-2">{label || "节点"}</div>

      {/* 输入参数 */}
      {inputs.length > 0 && (
        <div className="text-xs text-gray-700 mb-1">
          <div className="font-semibold text-gray-800">入参:</div>
          {inputs.map((inp, idx) => (
            <div key={idx} className="ml-1">
              {inp.name} : {inp.type || inp.from}
            </div>
          ))}
        </div>
      )}

      {/* 输出参数 */}
      {outputs.length > 0 && (
        <div className="text-xs text-gray-700 mb-1">
          <div className="font-semibold text-gray-800">出参:</div>
          {outputs.map((out, idx) => (
            <div key={idx} className="ml-1">
              {out.name} : {out.type || out.from}
            </div>
          ))}
        </div>
      )}

      {children}

      {/* Handles */}
      {showHandles.input && (
        <Handle
          type="target"
          position={handlePositions.input}
          id="target"
          style={{ background: colors.input, width: 12, height: 12 }}
        />
      )}
      {showHandles.output && (
        <Handle
          type="source"
          position={handlePositions.output}
          id="source"
          style={{ background: colors.output, width: 12, height: 12 }}
        />
      )}
    </div>
  );
};

export default NodeBase;