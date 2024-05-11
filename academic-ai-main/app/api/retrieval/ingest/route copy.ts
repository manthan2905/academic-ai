import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { Pinecone } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export const runtime = "edge";

// Before running, follow set-up instructions at
// https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase

/**
 * This handler takes input text, splits it into chunks, and embeds those chunks
 * into a vector store for later retrieval. See the following docs for more information:
 *
 * https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/recursive_text_splitter
 * https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/supabase
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;
  const file_name = body.file_name;

  if (process.env.NEXT_PUBLIC_DEMO === "true") {
    return NextResponse.json(
      {
        error: [
          "Ingest is not supported in demo mode.",
          "Please set up your own version of the repo here: https://github.com/langchain-ai/langchain-nextjs-template",
        ].join("\n"),
      },
      { status: 403 },
    );
  }

  try {
    // const client = createClient(
    //   process.env.SUPABASE_URL!,
    //   process.env.SUPABASE_PRIVATE_KEY!,
    // );

    // const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    //   chunkSize: 256,
    //   chunkOverlap: 20,
    // });

    // const splitDocuments = await splitter.createDocuments([text]);

    // const vectorstore = await SupabaseVectorStore.fromDocuments(
    //   splitDocuments,
    //   new OpenAIEmbeddings(),
    //   {
    //     client,
    //     tableName: "documents",
    //     queryName: "match_documents",
    //   },
    // );

        /* Load all PDFs within the specified directory */
    const directoryLoader = new DirectoryLoader(
      process.cwd() + "/data/",
      {
        ".pdf": (path: string) => new PDFLoader(path),
      }
    );

    const docs = await directoryLoader.load();

    console.log({ docs });


    // const loader = new PDFLoader("data/test.pdf");


    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 256,
      chunkOverlap: 20,
    });

    // const splitDocuments = (await loader.loadAndSplit(splitter));

    // console.log(splitDocuments.length)

    // const pinecone = new Pinecone({
    //   apiKey: process.env.PINECONE_API_KEY!,
    //   environment: process.env.PINECONE_ENV!,
    // })
    // const pineconeIndex = pinecone.Index("academic-ai");


    // const vectorstore = await PineconeStore.fromDocuments(
    // splitDocuments,
    // new OpenAIEmbeddings(),
    // {
    //   pineconeIndex,
    //   maxConcurrency: 5, // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    // },
    // );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
