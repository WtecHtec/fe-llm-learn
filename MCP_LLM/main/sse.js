
import runConversation from '../chat.js';

import sse_client from '../MCPClient/sse_client.js'

runConversation(sse_client).catch(error => {
    console.error('Server error:', error);
    process.exit(1);
});