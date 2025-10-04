import React from "react";
import NodeBase from "./NodeBase";

const OutputNode = ({ data }) => {
  return (
    <NodeBase
      data={data}
      showHandles={{ input: true, output: false }}
      handlePositions={{ input: "left" }}
      colors={{ input: "#10b981" }}
    />
  );
};

export default OutputNode;