const $=id=>document.getElementById(id);
let imageData="";
document.querySelectorAll("#presets button").forEach(b=>b.addEventListener("click",()=>{$("prompt").value=b.dataset.prompt;}));
$("imageInput").addEventListener("change",e=>{
  const file=e.target.files[0]; if(!file)return;
  if(file.size>5*1024*1024){alert("Please choose an image under 5 MB.");e.target.value="";return;}
  const reader=new FileReader();reader.onload=()=>{imageData=reader.result;$("previewImg").src=imageData;$("imagePreview").classList.remove("hidden");};reader.readAsDataURL(file);
});
$("removeImage").addEventListener("click",()=>{imageData="";$("imageInput").value="";$("imagePreview").classList.add("hidden");});
function makeBrief(){
 const prompt=$("prompt").value.trim(); if(!prompt){alert("Please describe your scene first.");$("prompt").focus();return null;}
 return `ALPHAMEN AI — VIDEO GENERATION BRIEF
====================================
Scene prompt:
${prompt}

Creation mode: ${$("mode").value}
Aspect ratio: ${$("ratio").value}
Target quality: ${$("resolution").value}
Clip length: ${$("duration").value}
Voice-over: ${$("voice").value}
Visual style: ${$("style").value}
Reference image attached in this app: ${imageData?"Yes (image is stored only in this browser session)":"No"}

Suggested negative prompt:
blurry, low detail, distorted face, extra fingers, flicker, jitter, unstable camera, watermark, text artifacts, compression artifacts

Suggested production notes:
Keep character appearance consistent. Use smooth cinematic camera movement, coherent motion, realistic lighting, detailed textures and stable anatomy.

IMPORTANT:
This is a prompt brief, not a rendered video. Connect a compatible hosted video-generation model/API to render the clip. 4K upscale is a target export setting, not a guarantee of native 4K generation.
`;
}
function saveBrief(brief){
 let items=JSON.parse(localStorage.getItem("alphamen_projects")||"[]");
 items.unshift({date:new Date().toLocaleString(),brief});
 localStorage.setItem("alphamen_projects",JSON.stringify(items.slice(0,8)));renderSaved();
}
$("buildBtn").addEventListener("click",()=>{const b=makeBrief();if(!b)return;$("brief").textContent=b;$("result").classList.remove("hidden");saveBrief(b);$("result").scrollIntoView({behavior:"smooth"});});
$("copyBtn").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("brief").textContent);$("copyBtn").textContent="COPIED!";}catch(e){alert("Copy not available. Select and copy the text manually.");}});
$("downloadBtn").addEventListener("click",()=>{const blob=new Blob([$("brief").textContent],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="alphamen-video-brief.txt";a.click();URL.revokeObjectURL(a.href);});
function renderSaved(){const items=JSON.parse(localStorage.getItem("alphamen_projects")||"[]");$("savedList").innerHTML=items.length?items.map((x,i)=>`<div class="saved-item"><span>${x.date} · ${x.brief.split("\\n")[3].slice(0,42)}...</span><button data-i="${i}">OPEN</button></div>`).join(""):"No projects saved yet.";document.querySelectorAll(".saved-item button").forEach(b=>b.addEventListener("click",()=>{const x=JSON.parse(localStorage.getItem("alphamen_projects")||"[]")[+b.dataset.i];$("brief").textContent=x.brief;$("result").classList.remove("hidden");$("result").scrollIntoView({behavior:"smooth"});}));}
renderSaved();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
