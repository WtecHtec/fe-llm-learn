import React, { useCallback } from "react";
import {
    Background, Controls, ReactFlow, addEdge,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { observer } from "mobx-react-lite";
import { workflowStore } from "@/store/workflowStore";
import NodeConfigDrawer from "./NodeConfigDrawer";
import InputNode from "./NodeTypes/InputNode";
import OutputNode from "./NodeTypes/OutputNode";
import LLMNode from "./NodeTypes/LLMNode";
import ConditionNode from "./NodeTypes/ConditionNode";
import { Button, Space, message, Dropdown } from "antd";
import { useMemo } from "react";
import { exportDSL } from "@/utils/flow";
import RunWorkflowModal from './RunWorkflowModal'



const nodeTypes = {
    inputNode: InputNode,
    outputNode: OutputNode,
    llmNode: LLMNode,
    conditionNode: ConditionNode,
};



const initialNodes = [
    {
        id: "input-1",
        type: "inputNode",
        position: { x: 50, y: 200 },
        data: { label: "输入节点" },
    },
    {
        id: "output-1",
        type: "outputNode",
        position: { x: 500, y: 200 },
        data: { label: "输出节点" },
    },
];

const WorkflowEditor = observer(() => {


    const [open, setOpen] = React.useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );


    const items = useMemo(() => [
        {
            label: (
                <span onClick={() => {
                    console.log("输出节点");
                    setNodes((per) => [...per, { id: "output-" + per.length, type: "outputNode", position: { x: 100, y: 200 }, data: { label: "输出节点" } }])
                    }
                }>输出</span>
            ),
            key: '0',
        },
        {
            label: (
                <span onClick={() => {
                    console.log("输出节点");
                    setNodes((per) => [...per, { id: "llm-" + per.length, type: "llmNode", position: { x: 100, y: 200 }, data: { label: "LLM" } }])
                    }
                }>LLM</span>
            ),
            key: '1',
        },
        {
            label: (
                <span onClick={() => {
                    console.log("输出节点");
                    setNodes((per) => [...per, { id: "condition-" + per.length, type: "conditionNode", position: { x: 100, y: 200 }, data: { label: "条件" } }])
                    }
                }>条件</span>
            ),
            key: '2',
        },
    ]
        , [setNodes])




    // Run 按钮
    const handleRun = async () => {
        setOpen(true);
    };



    return (
        <div className="w-full h-full flex flex-col">
            {/* 顶部工具栏 */}
            <div className="p-2 border-b bg-white flex items-center gap-2">
                <Space>

                    <Dropdown.Button menu={{ items }} trigger={['click']}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                添加节点
                            </Space>
                        </a>
                    </Dropdown.Button>
                    <Button type="dashed" onClick={handleRun}>
                        ▶ Run
                    </Button>
                </Space>
            </div>

            {/* 主画布 */}
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onNodeClick={(e, node) => {
                        console.log("点击节点:", node);
                        workflowStore.setSelectedNode(node);
                    }}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>

            {/* 右侧配置 */}
            <NodeConfigDrawer />
            <RunWorkflowModal nodes={nodes} edges={edges} open={open} setOpen={setOpen} />
        </div>
    );
});

export default WorkflowEditor;