let recording=false, actions=[];
chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
  if(msg.type==="START_RECORD"){ recording=true; actions=[]; sendResponse({ok:true}); }
  if(msg.type==="STOP_RECORD"){ recording=false; sendResponse({actions}); }
  if(msg.type==="GET_ACTIONS"){ sendResponse({actions}); }
});
document.addEventListener("click", e=>{
  if(!recording) return;
  const sel = e.target.tagName.toLowerCase() + (e.target.id ? "#"+e.target.id : "") + (e.target.className ? "."+String(e.target.className).split(" ").join(".") : "");
  actions.push({ type:"click", selector: sel, text: e.target.innerText?.slice(0,50) });
}, true);
document.addEventListener("input", e=>{
  if(!recording) return;
  const sel = e.target.tagName.toLowerCase() + (e.target.id ? "#"+e.target.id : "");
  actions.push({ type:"type", selector: sel, text: e.target.value });
}, true);
