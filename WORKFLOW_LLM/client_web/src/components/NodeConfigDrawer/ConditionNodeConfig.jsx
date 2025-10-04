import React, { useEffect, useState } from "react";
import {  Form, Select, Button, Input, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useReactFlow } from "@xyflow/react";
import { getNodeAvailableInputs } from "@/utils/flow";

const operators = ["==", ">", "<", ">=", "<=", "contains", "startsWith", "endsWith"];

export default function ConditionNodeConfig({
  node,
}) {
  const [form] = Form.useForm();
  const [conditions, setConditions] = useState([]);
  const reactFlow = useReactFlow();

  const availableOutputs = getNodeAvailableInputs(node.id, reactFlow.getNodes(), reactFlow.getEdges());
 


  useEffect(() => {
    if (node) {
      form.resetFields();
      // 初始化条件分支
      setConditions(
        node.data.conditions || [
          { left: "", op: "==", right: "" },
        ]
      );
    }
  }, [node]);

  const handleAddCondition = () => {
    setConditions([...conditions, { left: "", op: "==", right: "" }]);
  };

  const handleRemoveCondition = (index) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };

  const handleChangeCondition = (index, key, value) => {
    const newConditions = [...conditions];
    newConditions[index][key] = value;
    setConditions(newConditions);
  };

  const handleSave = () => { 

    node.data = {
      ...node.data,
      conditions,
    };

    reactFlow.updateNode(node.id, { ...node }, { replace: true }) // 触发刷新
  
    
  };

  return (
      <Form form={form} layout="vertical">
    

        {/* 条件分支 */}
        <div className="mb-2 font-bold">条件分支</div>
        {conditions.map((cond, index) => (
          <Space key={index} className="mb-2">
            {/* 左值选择 */}
            <Select
              placeholder="左值"
              style={{ width: 120 }}
              value={cond.left}
              onChange={(val) => handleChangeCondition(index, "left", val)}
            >
               {availableOutputs.map((out) => (
                      <Select.Option
                        key={`${out.nodeId}-${out.name}`}
                       value={`${out.nodeId}.${out.name}`}
                      >
                        {out.nodeLabel}.{out.name} ({out.type})
                      </Select.Option>
                    ))}
            </Select>

            {/* 操作符选择 */}
            <Select
              placeholder="操作符"
              style={{ width: 80 }}
              value={cond.op}
              onChange={(val) => handleChangeCondition(index, "op", val)}
            >
              {operators.map((op) => (
                <Select.Option key={op} value={op}>
                  {op}
                </Select.Option>
              ))}
            </Select>

            {/* 右值输入 */}
            <Input
              placeholder="右值"
              style={{ width: 120 }}
              value={cond.right}
              onChange={(e) => handleChangeCondition(index, "right", e.target.value)}
            />

            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveCondition(index)}
            />
          </Space>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddCondition}
          block
          className="mb-4"
        >
          添加条件分支
        </Button>

        <Button type="primary" onClick={handleSave} block>
          保存
        </Button>
      </Form>

  );
}