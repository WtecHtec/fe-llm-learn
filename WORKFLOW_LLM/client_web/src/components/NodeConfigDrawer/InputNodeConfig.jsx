import React from "react";
import { Form, Input, Select, Button, Space } from "antd";
import { useReactFlow } from "@xyflow/react";

const fieldTypes = ["string"];

const InputNodeConfig = ({ node }) => {
    const reactFlow = useReactFlow();

    const [form] = Form.useForm();

    form.setFieldsValue(node.data);

    const handleSave = () => {
        form.validateFields().then((values) => {
            node.data = { ...node.data, ...values };
            console.log("handleSave----", node)
            reactFlow.updateNode(node.id, { ...node }, { replace: true }) // 触发刷新
        });
    };

    return (
        <Form layout="vertical" form={form} initialValues={node.data}>
            <Form.Item label="节点名称" name="label">
                <Input />
            </Form.Item>

            {/* 输入参数 */}
            <Form.List name="inputs">
                {(fields, { add, remove }) => (
                    <div>
                        <h4>输入参数</h4>
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
                            + 添加输入
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
};

export default InputNodeConfig;