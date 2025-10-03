// ingest.js
import fs from 'fs';
import { Ollama } from 'ollama';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as lancedb from '@lancedb/lancedb';

async function ingestDocuments() {
  const docsDir = './docs';
  const docPath = `${docsDir}/my-tech-manual.md`;
  const dbPath = './lancedb';
  
  // 1. 加载和分割文档
  const text = fs.readFileSync(docPath, 'utf8');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await splitter.splitText(text);

  // 2. 创建 Ollama 客户端
  const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
  const embeddingModel = 'mxbai-embed-large';
  
  // 3. 创建或打开 LanceDB 数据库
  const db = await lancedb.connect(dbPath);
  const tableName = 'tech_manual_docs';
  
  // 4. 创建 Embedding 并准备数据
  const data = await Promise.all(
    splitDocs.map(async (doc, i) => {
      const { embedding } = await ollama.embeddings({
        model: embeddingModel,
        prompt: doc,
      });
      return {
        id: i, // 每个文档块需要一个唯一的 id
        vector: embedding,
        text: doc,
      };
    })
  );

  // 5. 写入数据到 LanceDB
  await db.createTable(tableName, data);
  
  console.log(`已将 ${data.length} 个文档块摄入到 LanceDB！`);
}

ingestDocuments();