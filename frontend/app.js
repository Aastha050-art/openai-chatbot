console.log("Working")
const  input= document.querySelector("#input")
const  question= document.querySelector("#question")
 input.addEventListener("keyup",handleEnter);
 const chatContatainer=document.querySelector("#chatcontainer")
 const askbtn=document.querySelector("#askbtn")
  askbtn.addEventListener("click",handleButton)
 
  const threadId=Date.now().toString(36)+Math.random().toString(36).substring(2,8)

  const loader=document.createElement('div');
  loader.className="py-6 animat-pulse"
  loader.textContent="Thinking..."
 async function generate(text){
  /***
   * !.appent text to ui
   * 2. send it to llm 
   * 3.append result to ui
   * 
   */
const mesg=document.createElement('div');
mesg.className="bg-neutral-800 px-3 py-2 rounded max-w-fit ml-auto my-6"
mesg.textContent= text;
chatContatainer.appendChild(mesg)
input.value=""


chatContatainer.appendChild(loader)
//call server
 const assistantMessage=await callServer(text)
 
 
 const assistantMsgEle=document.createElement('div');
assistantMsgEle.className="max-w-fit"
assistantMsgEle.textContent= assistantMessage ; 

loader.remove()
chatContatainer.appendChild(assistantMsgEle)
 
 
 
}

async function callServer(inputText){
  const response= await fetch("http://localhost:3001/chat",{
      method:"POST",
      headers:{
        'content-type':'application/json'
      },
      body:JSON.stringify({ threadId,message:inputText})
  })
 
  if(!response.ok){
    throw new Error("Error generating response")
  }
  const result=  await response.json()
 
    
  
  return result.result
}



  async function handleEnter(e){
   
    if(e.key==="Enter"){
        console.log(e)
        const text= input.value.trim()
          console.log(text)
         await generate(text)
          if(!text){
            return;
          }
    }
  }

  async function handleButton(e){
   
     const text= input.value.trim()
          console.log(text)
          
          if(!text){
            return;
          }
          await generate(text)
          

  }