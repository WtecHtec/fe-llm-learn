
import runConversation from '../chat.js';

import http_client from '../MCPClient/http_client.js'

runConversation(http_client).catch(error => {
    console.error('Server error:', error);
    process.exit(1);
});