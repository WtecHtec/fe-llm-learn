// index.js
import ZhipuAI from 'zhipu-sdk-js';

import 'dotenv/config';

// 步骤 1: 定义你的工具函数
const tools = [
    {
        type: 'function',
        function: {
            name: 'get_current_weather',
            description: '获取指定城市当前的实时天气',
            parameters: {
                type: 'object',
                properties: {
                    city: {
                        type: 'string',
                        description: '城市名称',
                    },
                    unit: {
                        type: 'string',
                        enum: ['摄氏度', '华氏度'],
                        description: '温度单位',
                    },
                },
                required: ['city'],
            },
        },
    },
];

// 步骤 2: 创建一个假想的函数来执行工具
function get_current_weather(city, unit = '摄氏度') {
    // 这里可以调用外部 API 来获取真实天气数据
    // 为了简化，我们直接返回一个模拟值
    console.log(`正在获取 ${city} 的天气...`);
    const weather = {
        city: city,
        temperature: '25',
        unit: unit,
        forecast: '晴朗',
    };
    return JSON.stringify(weather);
}

// 定义一个映射，将函数名和实际函数绑定
const availableFunctions = {
    get_current_weather: get_current_weather,
};


const zhipuClient = new ZhipuAI({
    apiKey: process.env.ZHIPUAI_API_KEY,
});

const llmModel = 'glm-4.5-flash';
async function runConversation() {
    const userMessage = "北京今天天气怎么样？";

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
        const functionResponse = availableFunctions[functionName](functionArgs.city, functionArgs.unit);

        // 再次调用 LLM，将函数执行结果作为上下文
        const secondResponse = await zhipuClient.createCompletions({
            model: llmModel,
            messages: [
                { role: 'user', content: userMessage },
                message, // 将 LLM 第一次的响应也作为上下文
                {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: functionResponse, // 将函数执行结果作为上下文
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

runConversation();