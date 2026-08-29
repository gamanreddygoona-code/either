document.getElementById('start').onclick=async()=>{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  await chrome.tabs.sendMessage(tab.id,{type:"START_RECORD"});
  document.getElementById('out').textContent="Recording... click and type on page";
};
document.getElementById('stop').onclick=async()=>{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  const res=await chrome.tabs.sendMessage(tab.id,{type:"STOP_RECORD"});
  document.getElementById('out').textContent=JSON.stringify(res.actions,null,2);
  // Send to Either
  await fetch("http://127.0.0.1:3000/api/workflow/capture",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({actions:res.actions})})
    .then(r=>r.json()).then(j=>{ document.getElementById('out').textContent += "\n\n// Puppeteer script\n"+j.script; })
    .catch(()=>{ document.getElementById('out').textContent += "\n(Start Either desktop on :3000 to send)"; });
};
