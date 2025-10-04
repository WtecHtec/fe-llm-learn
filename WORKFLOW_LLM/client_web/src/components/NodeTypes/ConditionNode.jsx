import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";

export default function ConditionNode({ data, colors = { input: "blue", output: "green" } }) {

  const containerRef = useRef(null);


  return (
    <div ref={containerRef} className="p-2  border  rounded-lg w-60 bg-white">
      <div className="font-bold text-center mb-2">{data.label || "节点"}</div>



      {/* 条件分支展示 */}

      {data.conditions?.map((cond, index) => (
        <div className="condition-text">
          <div className="mb-1 font-semibold  text-sm">条件{index + 1}</div>
          <div
            key={index}
            className="flex justify-between items-center mb-1 bg-blue-100 p-1 rounded relative"
          >
            <span className="text-xs">
              {cond.left || "左值"} {cond.op || "=="} {cond.right || "右值"}
            </span>

            {/* 条件对应 Handle */}
            <Handle
              type="source"
              position={Position.Right}
              id={`target-${index}`}
              className="bg-yellow-500 w-4 h-4 rounded-full"
              style={{ background: colors.output, width: 12, height: 12 }}
            />
          </div>
        </div>
      ))}

      <div className="else-text">
        <div className="mb-1 font-semibold  text-sm ">否则</div>
        <div
          key="else"
          className="flex justify-between items-center   relative"
        >
          {/* 条件对应 Handle */}
          <Handle
            type="source"
            position={Position.Right}
            id={`target-else`}
            className="bg-yellow-500 w-4 h-4 rounded-full"
            style={{ background: colors.output, width: 12, height: 12 }}
          />
        </div>
      </div>

      {/* 输入 Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="bg-yellow-700 w-4 h-4 rounded-full"
        style={{ background: colors.input, width: 12, height: 12 }}
      />
    </div>
  );
}