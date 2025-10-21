let LIST = [];

document.addEventListener("DOMContentLoaded", async ()=>{
  drawSignature("firmaCabina");
  document.getElementById("recepcionFecha").value = todayISO();
  buscar();
});

function limpiarFiltros(){
  document.getElementById("filtroFecha").value = "";
  document.getElementById("filtroMatricula").value = "";
  buscar();
}

function buscar(){
  const filtros = {
    fecha: document.getElementById("filtroFecha").value.trim(),
    matricula: document.getElementById("filtroMatricula").value.trim()
  };

  const tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "<tr><td colspan='6'>Cargando…</td></tr>";

  if (!window.__APPS_SCRIPT__) {
    setTimeout(()=>{
      LIST = []; tbody.innerHTML = "<tr><td colspan='6'>Vista local: sin datos.</td></tr>";
    }, 400);
    return;
  }

  google.script.run.withSuccessHandler(rows=>{
    LIST = rows;
    if (!rows.length){
      tbody.innerHTML = "<tr><td colspan='6'>Sin resultados</td></tr>";
      return;
    }
    tbody.innerHTML = rows.map(r=>`
      <tr>
        <td>${r.fecha}</td>
        <td>${r.matricula}</td>
        <td>${r.tipoLimpieza}</td>
        <td>${r.posicion}</td>
        <td>${r.nroVuelo}</td>
        <td><button class="btn" onclick="ver('${r.recordId}')">Ver limpieza</button></td>
      </tr>
    `).join("");
  }).listarLimpiezas(filtros);
}

function ver(recordId){
  if (!window.__APPS_SCRIPT__) return alert("Solo disponible en Apps Script.");
  google.script.run.withSuccessHandler(det=>{
    abrirModal(det);
  }).obtenerDetalle(recordId);
}

function abrirModal(det){
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");
  document.getElementById("modalTitle").textContent = `Limpieza ${det.matricula} – Vuelo ${det.nroVuelo}`;

  const d = document.getElementById("detalle");
  d.innerHTML = `
    <p><strong>Fecha:</strong> ${det.fecha}</p>
    <p><strong>Matrícula:</strong> ${det.matricula}</p>
    <p><strong>Posición:</strong> ${det.posicion}</p>
    <p><strong>Vuelo:</strong> ${det.nroVuelo}</p>
    <p><strong>Tipo:</strong> ${det.tipoLimpieza}</p>
    <p><strong>Inicio:</strong> ${det.horaInicio} | <strong>Fin:</strong> ${det.horaFin}</p>
    <p><strong>Responsable:</strong> ${det.responsableNombre} (Legajo ${det.responsableLegajo})</p>
    <p><strong>Observaciones:</strong> ${det.observaciones || "-"}</p>
    <p><a target="_blank" href="${det.carpetaUrl.replace('=HYPERLINK(\"','').replace('\",\"link\")','')}">Abrir carpeta de Drive</a> · 
       <a target="_blank" href="${det.pdfUrl.replace('=HYPERLINK(\"','').replace('\",\"link\")','')}">PDF</a></p>
  `;

  // Prefill fecha/hora recepción
  document.getElementById("recepcionFecha").value = todayISO();
  setNow("recepcionHora");

  // Guardar recordId en dataset
  const form = document.getElementById("form-2");
  form.dataset.recordId = det.recordId;
}

function cerrarModal(){
  document.getElementById("modal").classList.add("hidden");
}

async function enviarEtapa2(){
  const btn = document.getElementById("enviarBtn2");
  const msg = document.getElementById("msg2");
  btn.disabled = true; msg.textContent = "Enviando…";

  try{
    const payload = {
      recordId: document.getElementById("form-2").dataset.recordId,
      recepcionFecha: toDDMMYYYY(document.getElementById("recepcionFecha").value),
      recepcionHora: document.getElementById("recepcionHora").value,
      recepcionNombre: document.getElementById("recepcionNombre").value.trim(),
      recepcionLegajo: document.getElementById("recepcionLegajo").value.trim(),
      estadoCabina: document.getElementById("estadoCabina").value,
      observacionesCabina: document.getElementById("observacionesCabina").value.trim(),
      firmaDataUrl: document.getElementById("firmaCabina").toDataURL("image/png"),
      files: await filesToDataUrls(document.getElementById("files2"))
    };

    if (!window.__APPS_SCRIPT__) {
      await new Promise(r=>setTimeout(r, 800));
      msg.textContent = "Vista local: simulación OK.";
      btn.disabled = false;
      return;
    }

    google.script.run.withSuccessHandler(res=>{
      msg.innerHTML = `✔️ Completo. <a target="_blank" href="${res.pdfUrl}">PDF actualizado</a>`;
      btn.disabled = false;
      // refrescar listado (pasa a COMPLETADO)
      buscar();
    }).withFailureHandler(err=>{
      msg.textContent = "Error: " + err.message;
      btn.disabled = false;
    }).enviarEtapa2(payload);

  } catch(e){
    msg.textContent = "Error: " + e.message;
    btn.disabled = false;
  }
}
