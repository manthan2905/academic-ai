import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { createClient } from "@supabase/supabase-js";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { Document } from "langchain/document";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "langchain/schema/runnable";
import {
  BytesOutputParser,
  StringOutputParser,
} from "langchain/schema/output_parser";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";


export const runtime = "edge";

const combineDocumentsFn = (docs: Document[], separator = "\n\n") => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join(separator);
};

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === "user") {
      return `Human: ${message.content}`;
    } else if (message.role === "assistant") {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join("\n");
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(
  CONDENSE_QUESTION_TEMPLATE,
);

const ANSWER_TEMPLATE = `You are a digital teaching assistant for a university course. Your responses should be energetic and friendly. If you don't know the answer, you can say "I don't know".

Answer the question based only on the following context and chat history:
<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

/**
 * This handler initializes and calls a retrieval chain. It composes the chain using
 * LangChain Expression Language. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#conversational-retrieval-chain
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.25
    });
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENV!,
    })
    const pineconeIndex = pinecone.Index("academic-ai");
  
    const vectorstore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002"
    }), { pineconeIndex });
    /**
     * We use LangChain Expression Language to compose two chains.
     * To learn more, see the guide here:
     *
     * https://js.langchain.com/docs/guides/expression_language/cookbook
     */

    //  const retriever = vectorstore.asRetriever({
    //   searchKwargs: { lambda: 0.9 }
    //  });


  const retriever = ScoreThresholdRetriever.fromVectorStore(vectorstore, {
      minSimilarityScore: 0.7, // Finds results with at least this similarity score
      maxK: 5, // The maximum K value to use. Use it based to your chunk size to make sure you don't run out of tokens
    });

    const retrievalChain = retriever.pipe(combineDocumentsFn);


    // const result = await chain.invoke(currentMessageContent);
    // console.log(result);

    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser(),
    ]);


    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input) => input.question,
          retrievalChain,
        ]),
        chat_history: (input) => input.chat_history,
        question: (input) => input.question,
      },
      answerPrompt,
      model,
    ]);

    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        chat_history: (input) => input.chat_history,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages),
    });

    // const documents = await documentPromise;
    // const serializedSources = Buffer.from(
    //   JSON.stringify(
    //     documents.map((doc) => {
    //       return {
    //         pageContent: doc.pageContent.slice(0, 50) + "...",
    //         metadata: doc.metadata,
    //       };
    //     }),
    //   ),
    // ).toString("base64");

    return new StreamingTextResponse(stream);
    // return new StreamingTextResponse(stream, {
    //   headers: {
    //     "x-message-index": (previousMessages.length + 1).toString(),
    //     "x-sources": serializedSources,
    //   },
    // });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
