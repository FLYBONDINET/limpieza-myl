function setNow(id){
  const el = document.getElementById(id);
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  el.value = `${hh}:${mm}`;
}

function drawSignature(canvasId="firmaCanvas"){
  const c = document.getElementById(canvasId);
  const ctx = c.getContext("2d");
  let drawing = false, last = null;

  const getPos = (e)=>{
    const rect = c.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return {x: t.clientX-rect.left, y: t.clientY-rect.top};
  };

  const start = (e)=>{ drawing = true; last = getPos(e); e.preventDefault(); };
  const move = (e)=>{
    if(!drawing) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(last.x,last.y);
    ctx.lineTo(p.x,p.y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    last = p;
    e.preventDefault();
  };
  const end = ()=>{ drawing=false; };

  c.addEventListener("mousedown", start);
  c.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  c.addEventListener("touchstart", start, {passive:false});
  c.addEventListener("touchmove", move, {passive:false});
  c.addEventListener("touchend", end);
}

function clearCanvas(canvasId="firmaCanvas"){
  const c = document.getElementById(canvasId);
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
}

async function filesToDataUrls(inputEl){
  const files = Array.from(inputEl.files || []);
  const out = [];
  for(const f of files){
    const b64 = await new Promise((res,rej)=>{
      const r = new FileReader();
      r.onload = ()=>res(r.result);
      r.onerror = rej;
      r.readAsDataURL(f);
    });
    out.push({name:f.name, mimeType:f.type || "application/octet-stream", dataUrl:b64});
  }
  return out;
}

function todayISO(){
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function toDDMMYYYY(dateISO){
  const [y,m,d] = dateISO.split("-");
  return `${d}-${m}-${y}`;
}
