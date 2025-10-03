import { Ollama } from 'ollama';
import ZhipuAI from 'zhipu-sdk-js';
import * as lancedb from "@lancedb/lancedb";


import 'dotenv/config';


async function queryDocuments(userQuestion) {
  // 1. 创建客户端和数据库连接
  const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
  const embeddingModel = 'mxbai-embed-large';
  const zhipuClient = new ZhipuAI({
    apiKey: process.env.ZHIPUAI_API_KEY,
  });
  const llmModel = 'glm-4.5-flash';
  const dbPath = './lancedb';
  const tableName = 'tech_manual_docs';
  const db = await lancedb.connect(dbPath);
  
  // 2. 问题向量化 (使用本地 Ollama)
  const { embedding: questionEmbedding } = await ollama.embeddings({
    model: embeddingModel,
    prompt: userQuestion,
  });
  
  // 3. 向量相似度搜索
  const table = await db.openTable(tableName);
  const results = await table.search(questionEmbedding).limit(3).toArray();
  
  const relevantDocs = results.map(item => item.text);
  const context = relevantDocs.join('\n\n');

  // 4. 构建 Prompt
  const prompt = `你是一个专业的问答机器人，请根据以下提供的文档内容来回答用户的问题。
  如果文档中没有相关信息，请直接回答“我无法从提供的文档中找到相关信息”。

  文档内容：
  ${context}

  用户问题：
  ${userQuestion}`;

  // 5. LLM 生成答案 (使用智谱 AI)
  const { choices } = await zhipuClient.createCompletions({
    model: llmModel,
    messages: [{
      "role": "user",
      "content": prompt
    }],
  });
  const answer = choices[0].message.content;
  return answer;
}

const userQuestion = "TT和KK有什么区别？";
queryDocuments(userQuestion).then(answer => {
  console.log('答案:', answer);
}).catch(console.error);