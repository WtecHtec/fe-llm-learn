import React from "react";
import NodeBase from "./NodeBase";

const InputNode = ({ data }) => {
  return (
    <NodeBase
      data={data}
      showHandles={{ input: false, output: true }}
      handlePositions={{ output: "right" }}
      colors={{ output: "#3b82f6" }}
    />
  );
};

export default InputNode;