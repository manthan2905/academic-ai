import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { join } from "path";
import { writeFile } from "fs/promises";
import { cwd } from "process";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;


  if (!file) {
    return NextResponse.json({success: false})
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  console.log(process.cwd())
  const path = join(process.cwd(), 'data', file.name);


  await writeFile(path, buffer);
  
  const loader = new WebPDFLoader(file);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 256,
    chunkOverlap: 20,
  });

  const splitDocuments = (await loader.loadAndSplit(splitter));

  console.log(splitDocuments.length)

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENV!,
  })
  const pineconeIndex = pinecone.Index("academic-ai");


  const vectorstore = await PineconeStore.fromDocuments(
  splitDocuments,
  new OpenAIEmbeddings({
    modelName: "text-embedding-ada-002"
  }),
  {
    pineconeIndex,
    maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
  },
  );

  return NextResponse.json({success: true, status: 200})
}