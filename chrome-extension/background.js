chrome.action.onClicked.addListener(async (tab)=>{
  const [{result}] = await chrome.scripting.executeScript({ target:{tabId:tab.id}, func:()=> document.documentElement.outerHTML.slice(0,500) });
  console.log("Either Agent capture", result);
});
