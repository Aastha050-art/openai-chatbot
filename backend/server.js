import express from "express"
import { generate } from "./chatbot.js"
import cors from 'cors'

 const app= express()
 const port=3001
 
 app.use(cors())
 app.use(express.json())
 app.get("/",(req,res)=>{
    res.send("hello world")
 })

 app.get("/chat",(req,res)=>{
    res.send("received message")
 })
 app.post("/chat", async(req,res)=>{
    const {message,threadId}=req.body
    console.log("message",message)

    const result=await generate(message,threadId)
    res.json({result})
 })

 app.listen(port,()=>{
    console.log("hiii everyone")
 })