
import runConversation from '../chat.js';

import stido_clien from '../MCPClient/stdio_client.js'

runConversation(stido_clien).catch(error => {
    console.error('Server error:', error);
    process.exit(1);
});