import express from 'express';

import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';



import WeatherServer from "../WeatherMCPServer/index.js";



const app = express();


app.use(express.json());

const weatherServer = new WeatherServer();

let transport = null;


app.get('/sse', async (req, res) => {
    // Create SSE transport for legacy clients
    transport = new SSEServerTransport('/messages', res);
    const server = weatherServer.getServer();

    res.on('close', () => {
        console.log('Request closed');
        transport.close();
        server.close();
    });

    await server.connect(transport);
});

app.post('/messages', async (req, res) => {
    if (transport) {
        await transport.handlePostMessage(req, res, req.body);
    } else {
        res.status(400).send('No transport found for sessionId');
    }
});



// Start the server
const PORT = 3200;
weatherServer.run()
    .then(() => {
        app.listen(PORT, error => {
            if (error) {
                console.error('Failed to start server:', error);
                process.exit(1);
            }
            console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to set up the server:', error);
        process.exit(1);
    });