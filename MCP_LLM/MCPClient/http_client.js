import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';


const url = 'http://localhost:3200/mcp';
const baseUrl = new URL(url);


let client;

try {
    client = new Client({
        name: 'weather-http-client',
        version: '1.0.0'
    });
    const transport = new StreamableHTTPClientTransport(new URL(baseUrl));
    await client.connect(transport);
    console.log('Connected using Streamable HTTP transport');
} catch (error) {
    console.log(error);
    // If that fails with a 4xx error, try the older SSE transport
    console.log('Streamable HTTP connection failed, falling back to SSE transport');
    // client = new Client({
    //     name: 'weather-sse-client',
    //     version: '1.0.0'
    // });
    // const sseTransport = new SSEClientTransport(baseUrl);
    // await client.connect(sseTransport);
    // console.log('Connected using SSE transport');
}

const prompts = await client.listPrompts();
console.log("prompts::", prompts)

export default client