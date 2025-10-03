import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';





// 连接 mcp 服务
const transport = new StdioClientTransport({
    command: 'node',
    args: ['./MCPServer/stdio.js'],
});

const client = new Client({
    name: 'weather-stdio-client',
    version: '0.0.1'
});

await client.connect(transport);


export default client;





