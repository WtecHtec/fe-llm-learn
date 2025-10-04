
import ZhipuAI from 'zhipu-sdk-js';
import "dotenv/config";

const zhipuClient = new ZhipuAI({
    apiKey: process.env.ZHIPUAI_API_KEY,
});

async function callLLM(system_prompt, prompt, model) {
    const { choices } = await zhipuClient.createCompletions({
        model: model,
        messages: [
            {
                "role": "system",
                "content": system_prompt
            },{
            "role": "user",
            "content": prompt
        }],
    });

    const answer = choices[0].message.content;
    return answer;
}

export default callLLM