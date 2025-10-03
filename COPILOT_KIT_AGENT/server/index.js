import express from 'express';
import OpenAI from "openai";
import cors from 'cors';
import fetch from 'node-fetch';
import "dotenv/config";
import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNodeHttpEndpoint,

} from "@copilotkit/runtime";
import { experimental_createMCPClient } from "ai"; 

const app = express();
const PORT = process.env.PORT || 3200;


// 中间件
app.use(cors());
app.use(express.json());

const apiKey = process.env.ZHIPUAI_API_KEY

const llmModel = 'glm-4.5-flash';
// 自定义fetch封装，改成请求智谱API
async function customFetch(url, options) {
    // 你可以根据 url 和 options 自行改造请求，转发到智谱API

    // 这里示范替换 URL 和 headers
    const newUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    const originalBody = JSON.parse(options.body);
    const newBody = { ...originalBody, model: llmModel }

    // 智谱 不支持  developer role类型
    newBody.messages = newBody.messages.map(item => {
        let role = item.role === 'developer' ? 'system' : item.role
        return {
            ...item,
            role
        }
    })

    // 重新构造请求体，headers 等，确保符合智谱API格式
    const newOptions = {
        ...options,
        headers: {
            // ...options.headers,
            Authorization: `Bearer ${apiKey}`, // 智谱token
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newBody), // 如果需要，改写body格式
    };


    return fetch(newUrl, newOptions);
}



const openai = new OpenAI({
    apiKey,
    baseURL: "https://open.bigmodel.cn/api/paas/v4/chat/completions", // 可以留着默认
    fetch: customFetch
});

const serviceAdapter = new OpenAIAdapter({ openai });

// mcp 服务， 前往魔塔社区获取
const mcpServers = [
    {
        endpoint: "https://mcp.api-inference.modelscope.net/***/sse", // 搜索能力
    },
    {
        endpoint: "https://mcp.api-inference.modelscope.net/***/sse" // 页面解析能力
    },
]
app.use('/copilotkit', (req, res, next) => {
    (async () => {
        const runtime = new CopilotRuntime({
            mcpServers: [
                ...mcpServers
            ],
            async createMCPClient(config) {
                return await experimental_createMCPClient({
                    transport: {
                        type: "sse",
                        url: config.endpoint,
                    },
                })
            },
        });
        const handler = copilotRuntimeNodeHttpEndpoint({
            endpoint: '/copilotkit',
            runtime,
            serviceAdapter,
        });

        return handler(req, res);
    })().catch(next);
});

// 健康检查端点

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "AG-UI Node.js Server",
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);
    res.status(500).json({
        error: "Internal server error",
        message: err.message,
    });
});

// 404 处理
app.use("/*", (req, res) => {
    res.status(404).json({
        error: "Endpoint not found",
        path: req.originalUrl,
    });
});

// 启动服务器
app.listen(PORT, async () => {
    console.log(`🚀 AG-UI Node.js 服务器运行在 http://localhost:${PORT}`);
    console.log(`📝 健康检查: http://localhost:${PORT}/health`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});
