import ZhipuAI from 'zhipu-sdk-js';
import 'dotenv/config';

const zhipuClient = new ZhipuAI({
    apiKey: process.env.ZHIPUAI_API_KEY,
});

const llmModel = 'glm-4.5-flash';
async function runConversation(client) {
    const userMessage = "北京今天天气怎么样？";
   
    const mcptools = await client.listTools() || {};
    const tools = []
    if (Array.isArray(mcptools.tools)) {
        mcptools.tools.forEach(tool => {
            tools.push({
                type: 'function',
                function: {
                    ...tool,
                    parameters: tool.inputSchema
                }
            })
        })
    }

    // 向 LLM 发送用户问题，并提供可用的工具
    const response = await zhipuClient.createCompletions({
        model: llmModel,
        messages: [{
            role: 'user',
            content: userMessage,
        }],
        tools: tools,
    });

    const message = response.choices[0].message;

    // 步骤 3: 检查 LLM 是否决定调用函数
    if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // 步骤 4: 在本地执行函数
        const functionResponse = await client.callTool( {
            name:functionName,
            arguments: functionArgs
        }  );

        console.log("mcp返回结果:::", functionResponse)


        // 再次调用 LLM，将函数执行结果作为上下文
        const secondResponse = await zhipuClient.createCompletions({
            model: llmModel,
            messages: [
                { role: 'user', content: userMessage },
                message, // 将 LLM 第一次的响应也作为上下文
                {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: functionResponse.content[0].text, // 将函数执行结果作为上下文
                },
            ],
        });

        // 最终返回 LLM 基于函数结果生成的回答
        console.log(secondResponse.choices[0].message.content);
    } else {
        // 如果 LLM 没决定调用函数，直接返回 LLM 的回答
        console.log(message.content);
    }
}


export default runConversation