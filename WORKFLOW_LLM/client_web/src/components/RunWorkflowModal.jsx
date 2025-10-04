import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import { observer } from 'mobx-react-lite';

import { exportDSL } from '@/utils/flow';

const RunWorkflowModal = observer(({ nodes, edges , open, setOpen}) => {
    const [form] = Form.useForm();

    const [result, setResult] = React.useState(null);
    // 确认运行
    const handleRunConfirm = async () => {
        try {
            const values = await form.validateFields();
            const dsl = exportDSL(nodes, edges);
            console.log("运行 DSL:", JSON.stringify(dsl));



            const res = await fetch("http://localhost:3100/run-workflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dsl,
                    inputParams: values
                }),
            });
            const data = await res.json();
            console.log("运行成功: " + JSON.stringify(data))
  
            
            setResult(JSON.stringify(data.result));
            
            
        } catch (err) {
            if (err.errorFields) {
                // 表单验证错误
                return;
            }
            message.error("运行失败: " + err.message);
        }
    };

    // 取消运行
    const handleRunCancel = () => {
        setOpen(false);
        form.resetFields();
    };

    return (
        <Modal
            title="运行工作流"
            open={open}
            onOk={handleRunConfirm}
            onCancel={handleRunCancel}
            okText="确定"
            cancelText="取消"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    label="输入参数"
                    name="prompt"
                    rules={[{ required: true, message: '请输入输入参数' }]}
                >
                    <Input.TextArea 
                        rows={4} 
                        placeholder="请输入输入参数内容"
                    />
                </Form.Item>
                <div> 结果: {result}</div>
            </Form>
        </Modal>
    );
});

export default RunWorkflowModal;