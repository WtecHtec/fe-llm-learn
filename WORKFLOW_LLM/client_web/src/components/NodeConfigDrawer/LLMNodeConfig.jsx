import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, Space, Radio } from "antd";
import { observer } from "mobx-react-lite";
import { getNodeAvailableInputs } from "@/utils/flow";
import { useReactFlow } from "@xyflow/react";
const { TextArea } = Input;
const fieldTypes = ["string", "number", "boolean", "object"];
const models = ["glm-4.5-flash", "gpt-3.5", "gpt-4", "claude-2", "local-model"];

const LLMNodeConfig = observer(({ node }) => {
    const reactFlow = useReactFlow();

  const [form] = Form.useForm();
  
  form.setFieldsValue(node.data);

  const availableOutputs = getNodeAvailableInputs(node.id, reactFlow.getNodes(), reactFlow.getEdges());
 


  const handleSave = () => {
    form.validateFields().then((values) => {
      node.data = { ...node.data, ...values };
      reactFlow.updateNode(node.id, { ...node }, { replace: true }) // 触发刷新
    });
  };

  return (
    <Form layout="vertical" form={form} initialValues={node.data}>
      <Form.Item label="节点名称" name="label">
        <Input />
      </Form.Item>

      <Form.Item label="选择模型" name="model">
        <Select>
          {models.map((m) => (
            <Select.Option key={m} value={m}>
              {m}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

     


      {/* 输入参数绑定 */}
      <Form.List name="inputs">
        {(fields, { add, remove }) => (
          <div>
            <h4>输入参数绑定</h4>
            {fields.map(({ key, name, ...rest }) => (
              <Space key={key} align="baseline" className="mb-2">
                <Form.Item {...rest} name={[name, "name"]}>
                  <Input placeholder="别名" />
                </Form.Item>
                <Form.Item {...rest} name={[name, "from"]}>
                  <Select style={{ width: 220 }} placeholder="选择上游输出">
                    {availableOutputs.map((out) => (
                      <Select.Option
                        key={`${out.nodeId}.${out.name}`}
                        value={`${out.nodeId}.${out.name}`}
                      >
                        {out.nodeLabel}.{out.name} ({out.type})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Button danger onClick={() => remove(name)}>
                  删除
                </Button>
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()}>
              + 添加输入绑定
            </Button>
          </div>
        )}
      </Form.List>

      <Form.Item label="系统提示词(使用: ${key})" name="system_prompt">
        <TextArea rows={4} placeholder="自定义输入值" />
      </Form.Item>

       {/* 输出参数 */}
       <Form.List name="outputs">
        {(fields, { add, remove }) => (
          <div className="mt-4">
            <h4>输出参数</h4>
            {fields.map(({ key, name, ...rest }) => (
              <Space key={key} align="baseline" className="mb-2">
                <Form.Item {...rest} name={[name, "name"]}>
                  <Input placeholder="字段名" />
                </Form.Item>
                <Form.Item {...rest} name={[name, "type"]}>
                  <Select style={{ width: 120 }}>
                    {fieldTypes.map((t) => (
                      <Select.Option key={t} value={t}>
                        {t}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Button danger onClick={() => remove(name)}>
                  删除
                </Button>
              </Space>
            ))}
            <Button type="dashed" onClick={() => add()}>
              + 添加输出
            </Button>
          </div>
        )}
      </Form.List>
      
      <div className="mt-4 text-right">
        <Button type="primary" onClick={handleSave}>
          保存
        </Button>
      </div>
    </Form>
  );
});

export default LLMNodeConfig;