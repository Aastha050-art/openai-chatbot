import Groq from "groq-sdk";
import {tavily} from '@tavily/core';
import dotenv from "dotenv" ;
import readline from 'node:readline/promises'
import NodeCache from "node-cache"


dotenv.config();
import OpenAI from "openai";
import { threadId } from "node:worker_threads";

const groq = new Groq({  apiKey: process.env.GROQ_API_KEY});
const tvly = tavily({ apiKey:process.env.TAVILY_API_KEY });

const myCache = new NodeCache({stdTTL:60*60*48})


export  async function generate(userMessage,threadId) {


  const baseMessage=[
      // Set an optional system message. This sets the behavior of the
      // assistant and can be used to provide specific instructions for
      // how it should behave throughout the conversation.
      {
        role: "system",
        content: `You are a smart assistant.
        If you know the answer to question, answer it directly in plain english.
        If answer requires real-time,local,up-to-date information, or if you don't know answer,use thae available tools
        to find it.
        You have access to the following tool:
        webSearch(query:string):use this to search the internet for current or unknow information.
        Decide when to use your own knowledge and when to use the  tool.
        Do not mention the tool unless needed.
 
        Examples:
        Q:What is the capital of France?
        A:The capital of france is Paris.

        Q:What's  the weather in mumbai rightnow?
        A:(use Search tool to find latest weather)

        Q:Wh0 is the prime minister  of India?
        A:The current prime minister of India is Narendra modi.

        Q:Tell me the latedt IT news.
        A:(use the search tool to get the latest news)

        current date and time: ${new Date().toUTCString()}
         `
      },
      // Set a user message for the assistant to respond to.
      //{
       // role: "user",
        //content: //"whats wether in mumbai?"
        //"when was iphone 16 launched?",
      //},
    ]

    const mesgArray=myCache.get(threadId)?? baseMessage

  

  mesgArray.push({
    role:"user",
    content:userMessage,
  })

const max_retrives=10;
let count=0

 while(true){


  if (count>max_retrives){

  return "I could not find the result, please try again"
}

  count++

  const completions = await groq.chat.completions.create({

     model: "llama-3.3-70b-versatile",
    temperature:0,

    messages:mesgArray,

    tools: [
    {
      type: "function",

      function: {
        name: "webSearch",
        description: "Search the latest information and realtime update on the internet",
        parameters: {
          // JSON Schema object
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to perform search on"
            }
          },
          required: ["query"]
        }
      }
    }
  ],
  tool_choice:'auto',
   
  });
  mesgArray.push(completions.choices[0].message)

  const toolCalls=completions.choices[0].message.tool_calls
  if(!toolCalls){
    // here we end the chatbot response
    myCache.set(threadId,mesgArray)
    console.log(myCache)
  return completions.choices[0].message.content;
  }
   

   for(const tools of toolCalls){
      console.log('tools:',tools)
    const functionName=tools.function.name;
    const functionParams=tools.function.arguments

    if (functionName==='webSearch'){
      const toolResult=await webSearch(JSON.parse(functionParams))
     // console.log(`Tool result :${toolResult}`)

      mesgArray.push({
        tool_call_id:tools.id,
        role:"tool",
        name:functionName,
        content: toolResult,
      })
    }
  }

  }
 


 }

async function webSearch({query}){
  console.log("calling websearch")
  const response =await tvly.search(query)
  const finalResult= response.results.map((result)=>result.content).join("\n\n");
  //console.log(response)
  return   finalResult

  
}