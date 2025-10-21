document.addEventListener("DOMContentLoaded", async ()=>{
  drawSignature("firmaCanvas");
  // set defaults
  const fecha = document.getElementById("fecha");
  fecha.value = todayISO();

  // catálogos desde server (en local usamos fallback)
  if (window.__APPS_SCRIPT__) {
    google.script.run.withSuccessHandler(({matriculas, tipos})=>{
      fillSelect("matricula", matriculas);
      fillSelect("tipoLimpieza", tipos);
    }).getCatalogos();
  } else {
    fillSelect("matricula", ["LV-KAY","LV-KDP","LV-KEF"]);
    fillSelect("tipoLimpieza", ["Limpieza superficial","Limpieza profunda","Limpieza profunda plus"]);
  }
});

function fillSelect(id, arr){
  const sel = document.getElementById(id);
  sel.innerHTML = arr.map(v=>`<option>${v}</option>`).join("");
}

async function enviarEtapa1(){
  const btn = document.getElementById("enviarBtn");
  const msg = document.getElementById("msg");
  btn.disabled = true; msg.textContent = "Enviando…";

  try{
    const payload = {
      fecha: toDDMMYYYY(document.getElementById("fecha").value),
      matricula: document.getElementById("matricula").value,
      posicion: document.getElementById("posicion").value.trim(),
      nroVuelo: document.getElementById("nroVuelo").value.trim(),
      tipoLimpieza: document.getElementById("tipoLimpieza").value,
      horaInicio: document.getElementById("horaInicio").value,
      horaFin: document.getElementById("horaFin").value,
      responsableNombre: document.getElementById("responsableNombre").value.trim(),
      responsableLegajo: document.getElementById("responsableLegajo").value.trim(),
      observaciones: document.getElementById("observaciones").value.trim(),
      firmaDataUrl: document.getElementById("firmaCanvas").toDataURL("image/png"),
      files: await filesToDataUrls(document.getElementById("files"))
    };

    if (!window.__APPS_SCRIPT__) {
      await new Promise(r=>setTimeout(r, 800));
      msg.textContent = "Vista local: simulación OK (en Apps Script se enviará a Drive/Sheet).";
      btn.disabled = false;
      return;
    }

    google.script.run.withSuccessHandler(res=>{
      msg.innerHTML = `✔️ Enviado. <a target="_blank" href="${res.pdfUrl}">PDF</a> · <a target="_blank" href="${res.docUrl}">DOC</a> · <a target="_blank" href="${res.folderUrl}">Carpeta</a>`;
      btn.disabled = false;
    }).withFailureHandler(err=>{
      msg.textContent = "Error: " + err.message;
      btn.disabled = false;
    }).enviarEtapa1(payload);

  } catch(e){
    msg.textContent = "Error: " + e.message;
    btn.disabled = false;
  }
}
