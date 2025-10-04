import React, { useState, useEffect } from "react";
import { Drawer } from "antd";
import { observer } from "mobx-react-lite";
import { workflowStore } from "@/store/workflowStore";
import InputNodeConfig from "./InputNodeConfig";
import OutputNodeConfig from "./OutputNodeConfig";
import LLMNodeConfig from "./LLMNodeConfig"
import ConditionNodeConfig from "./ConditionNodeConfig"

const NodeConfigDrawer = observer(() => {
const { selectedNode, flowRef} = workflowStore

  useEffect(() => {
      console.log("workflowStore.selectedNode")
  }, [selectedNode, flowRef]);

  if (!selectedNode) return null;



  const render = () => {
    switch (selectedNode.type) {
      case "inputNode":
        return <InputNodeConfig node={selectedNode} />;
      case "outputNode":
        return <OutputNodeConfig node={selectedNode} />;
      case "llmNode":
        return <LLMNodeConfig node={selectedNode} />;
      case "conditionNode":
        return <ConditionNodeConfig node={selectedNode} />;
      default:
        return null;
    }
  }
  return (
    <Drawer
      title={selectedNode.data.label || "节点配置"}
      open={true}
      onClose={() => workflowStore.setSelectedNode(null)}
      width={400}
    >
      {render()}
    </Drawer>
  );
});

export default NodeConfigDrawer;