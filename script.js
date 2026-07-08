// ===============================
// AUTHENTIFICATION
// ===============================
const AUTH_USERNAME = "admin";
const AUTH_PASSWORD = "support_it";

let isAuthenticated = false;

// ===============================
// CONFIG API - ⚠️ REMPLACEZ PAR VOTRE URL
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbxzpC8V0uQF7tCmBjWSQHbLyZ3-r4RfL5R7iy-euW7oRyb4B3h0FJ5h844Etrm6Z16N/exec";

function apiRequest(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const url = new URL(API_URL);

    url.searchParams.set("action", action);
    url.searchParams.set("callback", callbackName);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const TIMEOUT = 30000;

    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window[callbackName];
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Délai dépassé lors de l'appel à l'API"));
    }, TIMEOUT);

    window[callbackName] = (data) => {
      clearTimeout(timeoutId);
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error("Impossible de contacter l'API"));
    };

    script.src = url.toString();
    document.head.appendChild(script);
  });
}

// ===============================
// ELEMENTS HTML
// ===============================
let el = {};

function initializeElements() {
  el = {
    loginSection: document.getElementById("loginSection"),
    loginForm: document.getElementById("loginForm"),
    loginMessage: document.getElementById("loginMessage"),
    username: document.getElementById("username"),
    password: document.getElementById("password"),
    matricule: document.getElementById("matricule"),
    noToolDeleteCheckbox: document.getElementById("noToolDeleteCheckbox"),
    affichageMatricule: document.getElementById("affichageMatricule"),
    nom: document.getElementById("nom"),
    statut: document.getElementById("statut"),
    fonction: document.getElementById("fonction"),
    rattachement: document.getElementById("rattachement"),
    datedepart: document.getElementById("datedepart"),
    login: document.getElementById("login"),
    dateCreation: document.getElementById("dateCreation"),
    deadline: document.getElementById("deadline"),
    outils: document.getElementById("outils"),
    materiels: document.getElementById("materiels"),
    etat: document.getElementById("etat"),
    dateFin: document.getElementById("dateFin"),
    ticketTyfanieDisplay: document.getElementById("ticketTyfanieDisplay"),
    statutSuivi: document.getElementById("statutSuivi"),
    msg: document.getElementById("msg"),
    dashboardCard: document.getElementById("dashboardCard"),
    formCard: document.getElementById("formCard"),
    detailCard: document.getElementById("detailCard"),
    detailTableBody: document.getElementById("detailTableBody"),
    detailEmptyMessage: document.getElementById("detailEmptyMessage"),
    matriculeDropdown: document.getElementById("matriculeDropdown"),
    fonctionDropdown: document.getElementById("fonctionDropdown"),
    rattachementDropdown: document.getElementById("rattachementDropdown"),
    statutDropdown: document.getElementById("statutDropdown"),
    ticketDropdown: document.getElementById("ticketDropdown")
  };
}

// ===============================
// GET FILTER VALUE
// ===============================
function getFilterValue(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return "";
  const selected = dropdown.querySelector(".dropdown-option.selected");
  return selected ? selected.dataset.value : "";
}

function setFilterValue(dropdownId, value) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  const input = dropdown.querySelector(".filter-search-input");
  const options = dropdown.querySelectorAll(".dropdown-option");
  options.forEach(opt => opt.classList.remove("selected"));
  let selectedOption = null;
  options.forEach(opt => {
    if (opt.dataset.value === value) {
      opt.classList.add("selected");
      selectedOption = opt;
    }
  });
  if (selectedOption) {
    input.value = selectedOption.textContent.trim();
  } else {
    input.value = "";
  }
}

// ===============================
// OUTILS DISPONIBLES
// ===============================
const OUTILS_DISPONIBLES = [
  { value: "S3", label: "S3" },
  { value: "Sentinel Mada", label: "Sentinel Mada" },
  { value: "Ability", label: "Ability" },
  { value: "Angaza", label: "Angaza" },
  { value: "ARTEC", label: "ARTEC" },
  { value: "BDC 1", label: "BDC 1" },
  { value: "BDC 2", label: "BDC 2" },
  { value: "ECMS", label: "ECMS" },
  { value: "Klaod", label: "Klaod" },
  { value: "Novacare (Astellia)", label: "Novacare (Astellia)" },
  { value: "Pentaho", label: "Pentaho" },
  { value: "Sage", label: "Sage" },
  { value: "Sandvine", label: "Sandvine" },
  { value: "SIMS Telma", label: "SIMS Telma" },
  { value: "Sms Connect", label: "Sms Connect" },
  { value: "Utiba 2Tmv", label: "Utiba 2Tmv" },
  { value: "RBS NEW", label: "RBS NEW" },
  { value: "POS", label: "POS" },
  { value: "LOAN", label: "LOAN" },
  { value: "Lynx", label: "Lynx" },
  { value: "BO", label: "BO" },
  { value: "Vocalcom", label: "Vocalcom" },
  { value: "Zendesk", label: "Zendesk" },
  { value: "Moodle", label: "Moodle" },
  { value: "Charlie", label: "Charlie" },
  { value: "Viber", label: "Viber" },
  { value: "Skype", label: "Skype" },
  { value: "Whatsapp", label: "Whatsapp" },
  { value: "Outlook", label: "Outlook" },
  { value: "Mail Office 365", label: "Mail Office 365" },
  { value: "Office 365", label: "Office 365" },
  { value: "Facebook", label: "Facebook" },
  { value: "Dlreporting", label: "Dlreporting" },
  { value: "Nextcloud", label: "Nextcloud" },
  { value: "OGC Telma", label: "OGC Telma" },
  { value: "Success Corner", label: "Success Corner" },
  { value: "Scoring Tool", label: "Scoring Tool" },
  { value: "Jupiter", label: "Jupiter" },
  { value: "Dataviz", label: "Dataviz" },
  { value: "Plateforme Mcb", label: "Plateforme Mcb" },
  { value: "Utiba Mvola", label: "Utiba Mvola" },
  { value: "Billrun", label: "Billrun" },
  { value: "CBS Free", label: "CBS Free" },
  { value: "Numlex", label: "Numlex" },
  { value: "Sentinel Free", label: "Sentinel Free" },
  { value: "Web Provisionning", label: "Web Provisionning" },
  { value: "CBS Comores", label: "CBS Comores" },
  { value: "CPS", label: "CPS" },
  { value: "Sentinel Comores", label: "Sentinel Comores" },
  { value: "Sims Telco", label: "Sims Telco" },
  { value: "VMS", label: "VMS" },
  { value: "REQ", label: "REQ" },
  { value: "S2 Mayotte", label: "S2 Mayotte" },
  { value: "S2 Réunion", label: "S2 Réunion" },
  { value: "S2 Run", label: "S2 Run" },
  { value: "S2 May", label: "S2 May" },
  { value: "Sav Only", label: "Sav Only" },
  { value: "Helios", label: "Helios" },
  { value: "UPYA", label: "UPYA" },
  { value: "Visio", label: "Visio" },
  { value: "Service Now", label: "Service Now" },
  { value: "YouTube", label: "YouTube" },
  { value: "INOCX", label: "INOCX" },
  { value: "Centraltest", label: "Centraltest" },
  { value: "Linkedin", label: "Linkedin" },
  { value: "SAGE RH", label: "SAGE RH" },
  { value: "Adobe", label: "Adobe" },
  { value: "Canva", label: "Canva" },
  { value: "Instagram", label: "Instagram" },
  { value: "Mojo", label: "Mojo" },
  { value: "Aithor", label: "Aithor" },
  { value: "SugarCRM", label: "SugarCRM" },
  { value: "E-koragna", label: "E-koragna" },
  { value: "Google Sheet", label: "Google Sheet" },
  { value: "Google Collab", label: "Google Collab" },
  { value: "Looker Studio", label: "Looker Studio" },
  { value: "App Sheet", label: "App Sheet" },
  { value: "Whois.com", label: "Whois.com" },
  { value: "DOLIBAR Callity", label: "DOLIBAR Callity" },
  { value: "Bot Agent", label: "Bot Agent" },
  { value: "Cogneed", label: "Cogneed" },
  { value: "CRM Client", label: "CRM Client" },
  { value: "Odigo", label: "Odigo" },
  { value: "I Advize", label: "I Advize" },
  { value: "KEYYO", label: "KEYYO" },
  { value: "SAGE 1000", label: "SAGE 1000" },
  { value: "BAYA", label: "BAYA" },
  { value: "Winscp", label: "Winscp" },
  { value: "Python", label: "Python" }
];

let users = [];
let currentUser = null;
let dashboardData = [];
let chartSuivi = null;
let chartEtatOutils = null;
let chartMaterielStatut = null;
let chartEtatMateriel = null;
let detailsCache = {};
let isSaving = false;

// ===============================
// NAVIGATION
// ===============================
function showDashboard() {
  el.formCard.classList.add("hidden");
  el.dashboardCard.classList.remove("hidden");
  el.detailCard.classList.add("hidden");
  document.getElementById("btnForm")?.classList.remove("active");
  document.getElementById("btnDash")?.classList.add("active");
  document.getElementById("btnDetail")?.classList.remove("active");
  loadDashboard();
}

function showForm() {
  el.dashboardCard.classList.add("hidden");
  el.detailCard.classList.add("hidden");
  el.formCard.classList.remove("hidden");
  document.getElementById("btnDash")?.classList.remove("active");
  document.getElementById("btnDetail")?.classList.remove("active");
  document.getElementById("btnForm")?.classList.add("active");
}

function showDetail() {
  el.formCard.classList.add("hidden");
  el.dashboardCard.classList.add("hidden");
  el.detailCard.classList.remove("hidden");
  document.getElementById("btnForm")?.classList.remove("active");
  document.getElementById("btnDash")?.classList.remove("active");
  document.getElementById("btnDetail")?.classList.add("active");
  loadDetail();
}

// ===============================
// FORMAT DATE
// ===============================
function todayFR() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function convertToISO(dateFR) {
  if (!dateFR) return "";
  if (dateFR instanceof Date) {
    if (Number.isNaN(dateFR.getTime())) return "";
    const dd = String(dateFR.getDate()).padStart(2, "0");
    const mm = String(dateFR.getMonth() + 1).padStart(2, "0");
    const yyyy = dateFR.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof dateFR === "number") {
    const d = new Date(dateFR);
    if (Number.isNaN(d.getTime())) return "";
    return convertToISO(d);
  }
  if (typeof dateFR !== "string") return "";
  const trimmed = dateFR.trim();
  if (!trimmed) return "";
  if (trimmed.includes("-")) return trimmed;
  const parts = trimmed.split("/");
  if (parts.length !== 3) return "";
  const dd = parts[0].padStart(2, "0");
  const mm = parts[1].padStart(2, "0");
  const yyyy = parts[2];
  return `${yyyy}-${mm}-${dd}`;
}

function convertToFR(dateISO) {
  if (!dateISO) return "";
  if (dateISO instanceof Date) {
    if (Number.isNaN(dateISO.getTime())) return "";
    const dd = String(dateISO.getDate()).padStart(2, "0");
    const mm = String(dateISO.getMonth() + 1).padStart(2, "0");
    const yyyy = dateISO.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  if (typeof dateISO === "number") {
    const d = new Date(dateISO);
    if (Number.isNaN(d.getTime())) return "";
    return convertToFR(d);
  }
  if (typeof dateISO !== "string") return "";
  const trimmed = dateISO.trim();
  if (!trimmed) return "";
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/");
    if (parts.length === 3) return trimmed;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const dd = String(parsed.getDate()).padStart(2, "0");
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const yyyy = parsed.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return "";
}

function parseFR(dateFR) {
  if (!dateFR) return null;
  if (dateFR instanceof Date) {
    return Number.isNaN(dateFR.getTime()) ? null : dateFR;
  }
  if (typeof dateFR === "number") {
    const d = new Date(dateFR);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateFR !== "string") return null;
  const trimmed = dateFR.trim();
  if (!trimmed) return null;
  if (trimmed.includes("/")) {
    const p = trimmed.split("/");
    if (p.length !== 3) return null;
    return new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// ===============================
// API GET USERS
// ===============================
async function loadUsers(includeTermine = false) {
  try {
    const action = includeTermine ? "getDashboard" : "getUsers";
    const data = await apiRequest(action);
    users = data || [];
    el.matricule.innerHTML = `<option value="">-- Choisir un matricule --</option>`;
    users.forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.matricule;
      opt.textContent = `${u.matricule} - ${u.nom}`;
      el.matricule.appendChild(opt);
    });
  } catch (err) {
    showApiError(`Impossible de charger la liste des utilisateurs: ${err.message}`);
  }
}

function normalizeOutils(outils) {
  if (!outils || !Array.isArray(outils)) return [];
  return outils.map(o => {
    if (o.date && !o.dateDebut && !o.dateFin) {
      return { outil: o.outil || "", ticket: o.ticket || "", statut: o.statut || "En cours", dateDebut: o.date || "", dateFin: "" };
    }
    return { outil: o.outil || "", ticket: o.ticket || "", statut: o.statut || "En cours", dateDebut: o.dateDebut || "", dateFin: o.dateFin || "" };
  });
}

// ===============================
// LOAD USER IN FORM
// ===============================
window.loadUser = function () {
  const matriculeSelected = el.matricule.value;
  if (matriculeSelected === "") {
    el.msg.textContent = "";
    el.msg.style.color = "";
    return;
  }
  currentUser = users.find(u => u.matricule === matriculeSelected);
  if (!currentUser) {
    resetForm();
    return;
  }
  if (!currentUser.outils) {
    currentUser.outils = [];
  } else {
    currentUser.outils = normalizeOutils(currentUser.outils);
  }
  el.dateFin.removeEventListener('change', handleDateFinChange);
  el.dateFin.addEventListener('change', handleDateFinChange);
  currentUser.noToolDeletion = !!currentUser.noToolDeletion;
  el.noToolDeleteCheckbox.checked = currentUser.noToolDeletion;
  el.affichageMatricule.textContent = currentUser.matricule || "";
  el.nom.textContent = currentUser.nom || "";
  el.statut.textContent = currentUser.statut || "";
  el.fonction.textContent = currentUser.fonction || "";
  el.rattachement.textContent = currentUser.rattachement || "";
  el.datedepart.textContent = currentUser.datedepart || "";
  el.login.textContent = currentUser.login || "";
  el.dateCreation.textContent = currentUser.dateCreation || "";
  el.deadline.textContent = currentUser.deadline || "";
  renderOutils();
  renderMateriels();
  updateEtat();
  el.msg.textContent = "";
  el.msg.style.color = "";
};

function editUser(matricule) {
  el.matricule.value = matricule;
  loadUser();
  showForm();
}

function showDetails(detailId) {
  const modal = document.getElementById("detailsModal");
  const tbody = document.getElementById("detailsTableBody");
  if (!modal || !tbody) return;
  const details = detailsCache[detailId];
  if (!details) return;
  document.getElementById("detailsModalMatricule").textContent = details.matricule;
  document.getElementById("detailsModalNom").textContent = details.nom;
  document.getElementById("detailsDateCreation").textContent = details.dateCreation;
  document.getElementById("detailsDeadline").textContent = details.deadline;
  tbody.innerHTML = "";
  const outils = details.outils;
  if (!outils || outils.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Aucun outil</td></tr>';
  } else {
    outils.forEach(o => {
      const statusClass = o.statut === "Terminé" ? "status-success" : "status-info";
      const row = document.createElement("tr");
      row.innerHTML = `<td><strong>${o.outil || "-"}</strong></td><td><span class="badge ${statusClass}">${o.statut || "En cours"}</span></td><td>${o.dateDebut || "-"}</td><td>${o.dateFin || "-"}</td>`;
      tbody.appendChild(row);
    });
  }
  modal.classList.remove("hidden");
}

function closeDetails() {
  const modal = document.getElementById("detailsModal");
  if (modal) modal.classList.add("hidden");
}

// ===============================
// RENDER OUTILS
// ===============================
function renderOutils() {
  if (!currentUser) return;
  el.outils.innerHTML = "";
  const container = document.createElement("div");
  container.className = "outils-container";
  currentUser.outils.forEach((o, idx) => {
    const card = document.createElement("div");
    card.className = "outil-card";
    let badgeClass = "en-cours";
    if (o.statut === "Terminé") badgeClass = "termine";
    card.innerHTML = `
      <span class="outil-status-badge ${badgeClass}">${o.statut || "En cours"}</span>
      <div class="outil-box"><label>📋 Outil</label><select class="outil-nom" data-index="${idx}"><option value="">-- Choisir un outil --</option>${OUTILS_DISPONIBLES.map(t => `<option value="${t.value}" ${o.outil === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
      <div class="outil-box"><label>🎟️ N° Ticket</label><input type="text" class="outil-ticket" data-index="${idx}" value="${o.ticket || ""}" placeholder="Ex: Insérez le numéro de ticket..." /></div>
      <div class="outil-box"><label>✓ Statut</label><select class="outil-statut" data-index="${idx}" ${(!o.outil || String(o.outil).trim() === "" || o.statut === "Terminé") ? "disabled" : ""}><option value="En cours" ${(o.statut || "En cours") === "En cours" ? "selected" : ""}>En cours</option><option value="Terminé" ${o.statut === "Terminé" ? "selected" : ""}>Terminé</option></select></div>
      <div class="outil-box"><label>📅 Début</label><input type="date" class="outil-dateDebut" data-index="${idx}" value="${convertToISO(o.dateDebut || "")}" /></div>
      <div class="outil-box"><label>🏁 Fin</label><input type="text" class="outil-dateFin" data-index="${idx}" value="${o.dateFin || ""}" readonly /></div>
      <button class="outil-delete-btn" data-index="${idx}" onclick="deleteOutil(${idx})" ${(o.statut || "En cours") !== "En cours" ? "disabled" : ""}>🗑️ Supprimer</button>
    `;
    container.appendChild(card);
  });
  el.outils.appendChild(container);
  setupOutilsEvents();
  updateOutilsDisabledState();
}

// ===============================
// RENDER MATERIELS
// ===============================
function renderMateriels() {
  if (!currentUser) return;
  el.materiels.innerHTML = "";
  const container = document.createElement("div");
  container.className = "outils-container";
  const materiels = currentUser.materiels || [];
  materiels.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "outil-card";
    const statusClass = m.statut === "Rendu" ? "termine" : m.statut === "À ne pas rendre" ? "rejete" : "en-cours";
    card.innerHTML = `
      <span class="outil-status-badge ${statusClass}">${m.statut || "Non Rendu"}</span>
      <div class="outil-box"><label>📦 Matériel</label><select class="materiel-nom" data-index="${idx}"><option value="">-- Choisir un matériel --</option><option value="Ecran" ${m.materiel === "Ecran" ? 'selected' : ''}>Ecran</option><option value="Laptop" ${m.materiel === "Laptop" ? 'selected' : ''}>Laptop</option><option value="Souris" ${m.materiel === "Souris" ? 'selected' : ''}>Souris</option><option value="Chargeur laptop" ${m.materiel === "Chargeur laptop" ? 'selected' : ''}>Chargeur laptop</option><option value="Clavier" ${m.materiel === "Clavier" ? 'selected' : ''}>Clavier</option><option value="Casque" ${m.materiel === "Casque" ? 'selected' : ''}>Casque</option><option value="Dongle wifi" ${m.materiel === "Dongle wifi" ? 'selected' : ''}>Dongle wifi</option><option value="Prise multiple" ${m.materiel === "Prise multiple" ? 'selected' : ''}>Prise multiple</option><option value="Tapis souris" ${m.materiel === "Tapis souris" ? 'selected' : ''}>Tapis souris</option><option value="Desktop" ${m.materiel === "Desktop" ? 'selected' : ''}>Desktop</option></select></div>
      <div class="outil-box"><label>🏷️ Fabricant</label><input type="text" class="materiel-fabricant" data-index="${idx}" value="${m.fabricant || ""}" placeholder="Ex: Dell, HP..." /></div>
      <div class="outil-box"><label>🧾 Modèle</label><input type="text" class="materiel-modele" data-index="${idx}" value="${m.modele || ""}" placeholder="Ex: Inspiron 15" /></div>
      <div class="outil-box"><label>🔎 Numéro de série</label><input type="text" class="materiel-serial" data-index="${idx}" value="${m.serial || ""}" placeholder="Ex: 123456789" /></div>
      <div class="outil-box"><label>✓ Statut</label><select class="materiel-statut" data-index="${idx}"><option value="Rendu" ${m.statut === "Rendu" ? 'selected' : ''}>Rendu</option><option value="Non Rendu" ${m.statut === "Non Rendu" ? 'selected' : ''}>Non Rendu</option><option value="À ne pas rendre" ${m.statut === "À ne pas rendre" ? 'selected' : ''}>À ne pas rendre</option></select></div>
      <div class="outil-box"><label>📅 Date</label><input type="date" class="materiel-date" data-index="${idx}" value="${m.date ? convertToISO(m.date) : ''}" /></div>
      <button class="outil-delete-btn" data-index="${idx}" onclick="deleteMateriel(${idx})">🗑️ Supprimer</button>
    `;
    container.appendChild(card);
  });
  el.materiels.appendChild(container);
  setupMaterielsEvents();
}

// ===============================
// ADD / DELETE MATERIEL
// ===============================
window.addMateriel = function () {
  if (!currentUser) {
    el.msg.textContent = "❌ Veuillez d'abord sélectionner un collaborateur";
    el.msg.style.color = "red";
    return;
  }
  if (!currentUser.materiels) currentUser.materiels = [];
  currentUser.materiels.push({ materiel: "", fabricant: "", modele: "", serial: "", statut: "Non Rendu", date: todayFR() });
  if (!currentUser.dateFin) currentUser.dateFin = todayFR();
  renderMateriels();
  updateEtat();
};

window.deleteMateriel = function (idx) {
  if (!currentUser || !currentUser.materiels) return;
  currentUser.materiels.splice(idx, 1);
  renderMateriels();
  updateEtat();
};

// ===============================
// SETUP MATERIELS EVENTS
// ===============================
function setupMaterielsEvents() {
  document.querySelectorAll('.materiel-nom').forEach(select => {
    select.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].materiel = e.target.value || "";
      updateEtat();
    });
  });
  document.querySelectorAll('.materiel-fabricant').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].fabricant = e.target.value || "";
      updateEtat();
    });
  });
  document.querySelectorAll('.materiel-modele').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].modele = e.target.value || "";
      updateEtat();
    });
  });
  document.querySelectorAll('.materiel-serial').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].serial = e.target.value || "";
      updateEtat();
    });
  });
  document.querySelectorAll('.materiel-statut').forEach(select => {
    select.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].statut = e.target.value || "Non Rendu";
      renderMateriels();
      updateEtat();
    });
  });
  document.querySelectorAll('.materiel-date').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      const iso = e.target.value || "";
      currentUser.materiels[idx].date = convertToFR(iso);
      updateEtat();
    });
  });
}

// ===============================
// ADD / DELETE OUTIL
// ===============================
window.addOutil = function () {
  if (!currentUser) {
    el.msg.textContent = "❌ Veuillez d'abord sélectionner un collaborateur";
    el.msg.style.color = "red";
    return;
  }
  currentUser.outils.push({ outil: "", ticket: "", statut: "En cours", dateDebut: todayFR(), dateFin: "" });
  renderOutils();
  updateEtat();
  setupOutilsEvents();
  updateOutilsDisabledState();
};

window.deleteOutil = function (idx) {
  if (!currentUser) return;
  const outil = currentUser.outils[idx];
  if (!outil) return;
  if (outil.statut !== "En cours") {
    el.msg.textContent = "❌ Impossible de supprimer un outil terminé";
    el.msg.style.color = "red";
    return;
  }
  currentUser.outils.splice(idx, 1);
  renderOutils();
  updateEtat();
};

// ===============================
// EVENTS OUTILS
// ===============================
function updateOutilsDisabledState() {
  const allSelects = document.querySelectorAll(".outil-nom");
  const selectedOutils = new Set();
  allSelects.forEach(select => {
    if (select.value && select.value.trim() !== "") selectedOutils.add(select.value);
  });
  allSelects.forEach(select => {
    const currentValue = select.value;
    const options = select.querySelectorAll("option");
    options.forEach(option => {
      if (option.value && option.value.trim() !== "") {
        if (selectedOutils.has(option.value) && option.value !== currentValue) {
          option.disabled = true;
        } else {
          option.disabled = false;
        }
      }
    });
  });
}

function setupOutilsEvents() {
  document.querySelectorAll(".outil-nom").forEach(select => {
    select.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      const val = e.target.value || "";
      currentUser.outils[idx].outil = val;
      const sel = document.querySelector(`.outil-statut[data-index="${idx}"]`);
      if (sel) {
        if (val.trim() === "") {
          sel.value = "En cours";
          sel.disabled = true;
          currentUser.outils[idx].statut = "En cours";
        } else {
          sel.disabled = currentUser.outils[idx].statut === "Terminé";
        }
      }
      updateOutilsDisabledState();
    });
  });
  document.querySelectorAll(".outil-statut").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.outils[idx].statut = e.target.value;
      if (e.target.value === "Terminé" && !currentUser.outils[idx].dateFin) {
        currentUser.outils[idx].dateFin = todayFR();
      }
      updateEtat();
      renderOutils();
    });
  });
  document.querySelectorAll(".outil-ticket").forEach(input => {
    input.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.outils[idx].ticket = e.target.value || "";
    });
  });
  document.querySelectorAll(".outil-dateDebut").forEach(input => {
    input.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      const dateISO = e.target.value || "";
      currentUser.outils[idx].dateDebut = convertToFR(dateISO);
    });
  });
}

// ===============================
// CALCUL STATUT SUIVI
// ===============================
function calcStatutSuivi(deadline, completionDate, etat) {
  if (etat !== "Terminé") return "En cours";
  if (!deadline || !completionDate) return "En cours";
  const d1 = parseFR(deadline);
  const d2 = parseFR(completionDate);
  if (!d1 || !d2) return "En cours";
  return d2 <= d1 ? "Respecté" : "Non respecté";
}

function allMaterielsRendus() {
  const materiels = currentUser?.materiels || [];
  if (materiels.length === 0) return true;
  return materiels.every(m => {
    const statut = (m.statut || "").trim();
    return statut === "Rendu" || statut === "À ne pas rendre";
  });
}

function allOutilsTermines() {
  const outils = currentUser?.outils || [];
  if (outils.length === 0) return true;
  return outils.every(o => (o.statut || "").trim() === "Terminé");
}

window.toggleNoToolDelete = function () {
  if (!currentUser) return;
  currentUser.noToolDeletion = el.noToolDeleteCheckbox.checked;
  updateEtat();
};

// ===============================
// UPDATE ETAT + DATE FIN + STATUT SUIVI
// ===============================
function updateEtat() {
  if (!currentUser) return;
  const previousEtat = currentUser.etat;
  const materialsOk = allMaterielsRendus();
  const noToolDeletion = !!currentUser.noToolDeletion;
  const toolsOk = allOutilsTermines();
  const hasMaterial = (currentUser.materiels || []).some(m => String(m.materiel || "").trim() !== "");

  if (noToolDeletion) {
    currentUser.etat = materialsOk ? "Terminé" : "En cours";
    if (!hasMaterial) currentUser.dateFin = "";
  } else {
    if (toolsOk && materialsOk) {
      currentUser.etat = "Terminé";
      if (previousEtat !== "Terminé" || !currentUser.dateFin) {
        currentUser.dateFin = todayFR();
      }
    } else {
      currentUser.etat = "En cours";
      if (hasMaterial && !currentUser.dateFin) currentUser.dateFin = todayFR();
      if (!hasMaterial) currentUser.dateFin = "";
    }
  }

  const completionDate = noToolDeletion ? currentUser.datedepart : currentUser.dateFin;
  currentUser.statutSuivi = calcStatutSuivi(currentUser.deadline, completionDate, currentUser.etat);

  el.etat.textContent = currentUser.etat;
  el.dateFin.value = currentUser.dateFin || "";
  el.datedepart.textContent = currentUser.datedepart || "";
  el.ticketTyfanieDisplay.textContent = currentUser.ticketTyfanie || "";
  el.statutSuivi.textContent = currentUser.statutSuivi;

  el.etat.classList.remove("etat-ok", "etat-warn");
  if (currentUser.etat === "Terminé") el.etat.classList.add("etat-ok");
  else el.etat.classList.add("etat-warn");
}

// ===============================
// SAVE USER
// ===============================
window.save = async function () {
  if (isSaving) return;
  if (!currentUser) {
    el.msg.textContent = "❌ Veuillez sélectionner un matricule !";
    el.msg.style.color = "red";
    return;
  }
  isSaving = true;
  el.msg.textContent = "⏳ Enregistrement en cours...";
  el.msg.style.color = "blue";

  document.querySelectorAll(".outil-nom").forEach(inp => {
    const idx = parseInt(inp.dataset.index);
    if (currentUser.outils[idx]) currentUser.outils[idx].outil = inp.value;
  });
  document.querySelectorAll(".outil-statut").forEach(sel => {
    const idx = parseInt(sel.dataset.index);
    if (currentUser.outils[idx]) currentUser.outils[idx].statut = sel.value;
  });

  currentUser.noToolDeletion = el.noToolDeleteCheckbox.checked;
  currentUser.materiels = currentUser.materiels || [];

  document.querySelectorAll(".materiel-nom").forEach(select => {
    const idx = parseInt(select.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].materiel = select.value || "";
  });
  document.querySelectorAll(".materiel-fabricant").forEach(input => {
    const idx = parseInt(input.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].fabricant = input.value || "";
  });
  document.querySelectorAll(".materiel-modele").forEach(input => {
    const idx = parseInt(input.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].modele = input.value || "";
  });
  document.querySelectorAll(".materiel-serial").forEach(input => {
    const idx = parseInt(input.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].serial = input.value || "";
  });
  document.querySelectorAll(".materiel-statut").forEach(select => {
    const idx = parseInt(select.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].statut = select.value || "Non Rendu";
  });

  currentUser.outils = currentUser.outils.filter(o => o.outil && o.outil.trim() !== "");
  currentUser.materiels = currentUser.materiels.filter(m => {
    const hasData = (m.materiel && m.materiel.trim() !== "") ||
                    (m.fabricant && m.fabricant.trim() !== "") ||
                    (m.modele && m.modele.trim() !== "") ||
                    (m.serial && m.serial.trim() !== "") ||
                    (m.statut && m.statut !== "Non Rendu") ||
                    (m.date && m.date.trim() !== "");
    return hasData;
  });

  updateEtat();

  try {
    const result = await apiRequest("saveUser", { data: JSON.stringify(currentUser) });
    if (result.success) {
      el.msg.textContent = "✅ Enregistré avec succès";
      el.msg.style.color = "green";
      await loadUsers();
      if (currentUser && currentUser.matricule) el.matricule.value = currentUser.matricule;
      loadUser();
      if (!el.dashboardCard.classList.contains("hidden")) await loadDashboard();
    } else {
      el.msg.textContent = "❌ Erreur lors de l'enregistrement";
      el.msg.style.color = "red";
    }
  } catch (err) {
    el.msg.textContent = "❌ Impossible de contacter l'API";
    el.msg.style.color = "red";
  }
  isSaving = false;
};

function handleDateFinChange(e) {
  if (currentUser) {
    currentUser.dateFin = convertToFR(el.dateFin.value);
    updateEtat();
  }
}

function resetForm() {
  el.matricule.value = "";
  el.nom.textContent = "";
  el.statut.textContent = "";
  el.fonction.textContent = "";
  el.rattachement.textContent = "";
  el.datedepart.textContent = "";
  el.login.textContent = "";
  el.dateCreation.textContent = "";
  el.deadline.textContent = "";
  el.etat.textContent = "";
  el.dateFin.value = "";
  el.ticketTyfanieDisplay.textContent = "";
  el.statutSuivi.textContent = "";
  el.outils.innerHTML = "";
  el.materiels.innerHTML = "";
  if (el.noToolDeleteCheckbox) el.noToolDeleteCheckbox.checked = false;
  currentUser = null;
}

// ===============================
// DASHBOARD
// ===============================
async function loadDashboard() {
  try {
    el.msg.textContent = "⏳ Chargement du dashboard en cours...";
    el.msg.style.color = "blue";
    const data = await apiRequest("getDashboard");
    dashboardData = data || [];
    updateStats();
    updateCharts();
    renderDashboard(dashboardData);
    el.msg.textContent = "";
  } catch (err) {
    showApiError(`Impossible de charger le dashboard: ${err.message}`);
  }
}

function renderDashboard(data) {
  const tbody = document.querySelector("#dashboardTable tbody");
  if (!tbody) return;
  detailsCache = {};
  if (!data || data.length === 0) {
    tbody.innerHTML = "";
    setupTableFilters();
    return;
  }
  let rowsHtml = "";
  data.forEach((row) => {
    const suiviClass = row.statutSuivi === "Respecté" ? "status-success" : row.statutSuivi === "Non respecté" ? "status-danger" : "status-info";
    const modifyBtn = row.etat === "En cours" ? `<button class="btn btn-action btn-modify" onclick="editUser('${row.matricule}')">✏️ Modifier</button>` : `<button class="btn btn-action btn-disabled" disabled>✓ Terminé</button>`;
    rowsHtml += `<tr><td><strong>${row.matricule || ""}</strong></td><td>${row.statut || ""}</td><td>${row.nom || ""}</td><td>${row.fonction || ""}</td><td>${row.rattachement || ""}</td><td>${row.login || ""}</td><td>${row.dateCreation || ""}</td><td>${row.deadline || ""}</td><td>${row.etat || ""}</td><td>${row.dateFin || ""}</td><td>${row.ticketTyfanie || ""}</td><td><span class="badge ${suiviClass}">${row.statutSuivi || ""}</span></td><td>${modifyBtn}</td></tr>`;
  });
  tbody.innerHTML = rowsHtml;
  setupTableFilters();
}

function normalizeMateriels(items) {
  return (items || []).filter(m => m && String(m.materiel || "").trim() !== "");
}

// ===============================
// UPDATE STATS
// ===============================
function updateStats() {
  const total = dashboardData.length;
  const enCours = dashboardData.filter(u => u.statutSuivi === "En cours").length;
  const respecte = dashboardData.filter(u => u.statutSuivi === "Respecté").length;
  const nonRespecte = dashboardData.filter(u => u.statutSuivi === "Non respecté").length;

  const outils = dashboardData.flatMap(u => u.outils || []);
  const validMateriels = dashboardData.flatMap(u => normalizeMateriels(u.materiels));
  const materielNoReturn = validMateriels.filter(m => String(m.statut || "").trim() === "À ne pas rendre").length;
  const materielRendu = validMateriels.filter(m => String(m.statut || "").trim() === "Rendu").length;
  const materielNonRendu = validMateriels.filter(m => String(m.statut || "").trim() === "Non Rendu").length;
  const materielTotal = validMateriels.length;

  const restitutionCompleteCount = dashboardData.filter(u => {
    const etat = String(u.restitutionEtat || "").trim();
    return etat === "Terminé";
  }).length;

  const toolProgressPercent = total ? Math.round(((respecte + nonRespecte) / total) * 100) : 0;
  const materielProgressPercent = total ? Math.round((restitutionCompleteCount / total) * 100) : 0;

  document.getElementById("statCollaborateursTotal").textContent = total;
  document.getElementById("statOutilsTotal").textContent = outils.length;
  document.getElementById("statMaterielItemsTotal").textContent = materielTotal;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statEnCours").textContent = enCours;
  document.getElementById("statRespecte").textContent = respecte;
  document.getElementById("statNonRespecte").textContent = nonRespecte;
  document.getElementById("statMaterielTotal").textContent = validMateriels.length;
  document.getElementById("statMaterielRendu").textContent = materielRendu;
  document.getElementById("statMaterielNonRendu").textContent = materielNonRendu;
  document.getElementById("statMaterielNoReturn").textContent = materielNoReturn;

  document.getElementById("toolProgressPercent").textContent = `${toolProgressPercent}%`;
  document.getElementById("toolProgressSubtext").textContent = `${respecte + nonRespecte} / ${total} départs`;

  document.getElementById("materielProgressPercent").textContent = `${materielProgressPercent}%`;
  document.getElementById("materielProgressSubtext").textContent = `${restitutionCompleteCount} / ${total} collaborateurs`;
}

// ===============================
// UPDATE CHARTS
// ===============================
function updateCharts() {
  if (!dashboardData || dashboardData.length === 0) {
    if (chartSuivi) { chartSuivi.destroy(); chartSuivi = null; }
    if (chartEtatOutils) { chartEtatOutils.destroy(); chartEtatOutils = null; }
    if (chartMaterielStatut) { chartMaterielStatut.destroy(); chartMaterielStatut = null; }
    if (chartEtatMateriel) { chartEtatMateriel.destroy(); chartEtatMateriel = null; }
    return;
  }

  const enCours = dashboardData.filter(u => u.statutSuivi === "En cours").length;
  const respecte = dashboardData.filter(u => u.statutSuivi === "Respecté").length;
  const nonRespecte = dashboardData.filter(u => u.statutSuivi === "Non respecté").length;

  const validMateriels = dashboardData.flatMap(u => normalizeMateriels(u.materiels));
  const etatTermine = dashboardData.filter(u => u.etat === "Terminé").length;
  const etatEnCours = dashboardData.filter(u => u.etat === "En cours").length;
  const materialEtatTermine = dashboardData.filter(u => String(u.restitutionEtat || "").trim() === "Terminé").length;
  const materialEtatEnCours = dashboardData.filter(u => String(u.restitutionEtat || "").trim() !== "Terminé").length;

  // Chart Suivi
  try {
    const canvasSuivi = document.getElementById("chartSuivi");
    const ctxSuivi = canvasSuivi ? canvasSuivi.getContext("2d") : null;
    if (ctxSuivi) {
      if (chartSuivi) chartSuivi.destroy();
      chartSuivi = new Chart(ctxSuivi, {
        type: "doughnut",
        data: {
          labels: ["Respecté", "Non respecté", "En cours"],
          datasets: [{ data: [respecte, nonRespecte, enCours], backgroundColor: ["#10b981", "#ef4444", "#f59e0b"], borderColor: ["#059669", "#dc2626", "#d97706"], borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: "bottom", labels: { padding: 12, font: { size: 12 }, usePointStyle: true } } } }
      });
    }
  } catch (err) { console.warn("Erreur chartSuivi", err); }

  // Chart Etat Outils
  try {
    const canvasEtatOutils = document.getElementById("chartEtatOutils");
    const ctxEtatOutils = canvasEtatOutils ? canvasEtatOutils.getContext("2d") : null;
    if (ctxEtatOutils) {
      if (chartEtatOutils) chartEtatOutils.destroy();
      chartEtatOutils = new Chart(ctxEtatOutils, {
        type: "doughnut",
        data: {
          labels: ["Terminé", "En cours"],
          datasets: [{ data: [etatTermine, etatEnCours], backgroundColor: ["#3b82f6", "#6b7280"], borderColor: ["#1e40af", "#4b5563"], borderWidth: 3 }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: "bottom", labels: { padding: 12, font: { size: 12, weight: "bold" }, usePointStyle: true } } } }
      });
    }
  } catch (err) { console.warn("Erreur chartEtatOutils", err); }

  // Chart Etat Matériel
  try {
    const canvasEtatMateriel = document.getElementById("chartEtatMateriel");
    const ctxEtatMateriel = canvasEtatMateriel ? canvasEtatMateriel.getContext("2d") : null;
    if (ctxEtatMateriel) {
      if (chartEtatMateriel) chartEtatMateriel.destroy();
      chartEtatMateriel = new Chart(ctxEtatMateriel, {
        type: "bar",
        data: {
          labels: ["Terminé", "En cours"],
          datasets: [{ label: "Collaborateurs", data: [materialEtatTermine, materialEtatEnCours], backgroundColor: ["#3b82f6", "#6b7280"], borderColor: ["#1e40af", "#4b5563"], borderWidth: 1, borderRadius: 10, maxBarThickness: 48 }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { enabled: true } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 12 } } }, y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } } } }
      });
    }
  } catch (err) { console.warn("Erreur chartEtatMateriel", err); }

  // Chart Matériel Statut
  try {
    const canvasMateriel = document.getElementById("chartMaterielStatut");
    const ctxMateriel = canvasMateriel ? canvasMateriel.getContext("2d") : null;
    if (ctxMateriel) {
      if (chartMaterielStatut) chartMaterielStatut.destroy();
      const materialCountByName = validMateriels.reduce((acc, m) => {
        const name = String(m.materiel || "").trim() || "Inconnu";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});
      if (Object.keys(materialCountByName).length === 0) materialCountByName["Aucun matériel"] = 0;
      const materialNames = Object.keys(materialCountByName);
      const materialCounts = materialNames.map(name => materialCountByName[name]);
      chartMaterielStatut = new Chart(ctxMateriel, {
        type: "bar",
        data: {
          labels: materialNames,
          datasets: [{ label: "Quantité", data: materialCounts, backgroundColor: materialNames.map((_, idx) => ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"][idx % 4]), borderColor: materialNames.map((_, idx) => ["#059669", "#dc2626", "#d97706", "#1e40af"][idx % 4]), borderWidth: 1, borderRadius: 10, maxBarThickness: 48 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 12 }, maxRotation: 45, minRotation: 0 } }, y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } } } }
      });
    }
  } catch (err) { console.warn("Erreur chartMaterielStatut", err); }
}

// ===============================
// DETAIL
// ===============================
async function loadDetail() {
  try {
    const data = await apiRequest("getDashboard");
    dashboardData = data || [];
    populateDetailFilters();
    renderDetailTable(dashboardData);
  } catch (err) {
    el.detailEmptyMessage.style.display = "block";
    el.detailEmptyMessage.textContent = `❌ Impossible de charger les détails: ${err.message}`;
  }
}

function populateDetailFilters() {
  const matricules = [...new Set(dashboardData.map(u => u.matricule).filter(m => m))];
  populateDropdownOptions('matriculeDropdown', matricules);
  const fonctions = [...new Set(dashboardData.map(u => u.fonction).filter(f => f))];
  populateDropdownOptions('fonctionDropdown', fonctions);
  const rattachements = [...new Set(dashboardData.map(u => u.rattachement).filter(r => r))];
  populateDropdownOptions('rattachementDropdown', rattachements);
  const tickets = [];
  dashboardData.forEach(u => {
    if (u.outils && u.outils.length > 0) {
      u.outils.forEach(outil => { if (outil.ticket && outil.ticket !== "---") tickets.push(outil.ticket); });
    }
  });
  populateDropdownOptions('ticketDropdown', [...new Set(tickets)].sort());
}

function populateDropdownOptions(dropdownId, options) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  const firstOption = optionsContainer.querySelector(".dropdown-option");
  optionsContainer.innerHTML = "";
  optionsContainer.appendChild(firstOption);
  options.forEach(optValue => {
    const optElement = document.createElement("div");
    optElement.className = "dropdown-option";
    optElement.dataset.value = optValue;
    optElement.textContent = optValue;
    optElement.onclick = function(e) { e.stopPropagation(); selectDropdownOption(dropdownId, optValue); };
    optionsContainer.appendChild(optElement);
  });
}

function selectDropdownOption(dropdownId, value) {
  setFilterValue(dropdownId, value);
  const dropdown = document.getElementById(dropdownId);
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  const selectedOption = dropdown.querySelector(`.dropdown-option[data-value="${value}"]`);
  if (selectedOption && optionsContainer.scrollTop !== undefined) selectedOption.scrollIntoView({ block: "nearest" });
  optionsContainer.classList.remove("show");
  applyDetailFilters();
}

function filterDropdownOptions(input) {
  const dropdownId = input.closest(".searchable-dropdown").id;
  const dropdown = document.getElementById(dropdownId);
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  const options = optionsContainer.querySelectorAll(".dropdown-option");
  const searchTerm = input.value.toLowerCase();
  options.forEach(option => {
    const text = option.textContent.toLowerCase();
    if (text.includes(searchTerm)) option.classList.remove("hidden");
    else option.classList.add("hidden");
  });
  if (searchTerm.length > 0 || input.value.length === 0) optionsContainer.classList.add("show");
}

document.addEventListener("keydown", function(e) {
  const input = document.activeElement;
  if (!input.classList.contains("filter-search-input")) return;
  const dropdownId = input.closest(".searchable-dropdown").id;
  const dropdown = document.getElementById(dropdownId);
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  const options = optionsContainer.querySelectorAll(".dropdown-option:not(.hidden)");
  if (e.key === "Escape") { optionsContainer.classList.remove("show"); e.preventDefault(); }
  else if (e.key === "Enter") { const firstVisible = options[0]; if (firstVisible) selectDropdownOption(dropdownId, firstVisible.dataset.value); e.preventDefault(); }
  else if (e.key === "ArrowDown") {
    const allOptions = dropdown.querySelectorAll(".dropdown-option");
    const currentIndex = Array.from(allOptions).findIndex(opt => opt.classList.contains("selected"));
    const nextIndex = Array.from(allOptions).findIndex((opt, idx) => idx > currentIndex && !opt.classList.contains("hidden"));
    if (nextIndex !== -1) selectDropdownOption(dropdownId, allOptions[nextIndex].dataset.value);
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    const allOptions = dropdown.querySelectorAll(".dropdown-option");
    const currentIndex = Array.from(allOptions).findIndex(opt => opt.classList.contains("selected"));
    let prevIndex = -1;
    for (let i = currentIndex - 1; i >= 0; i--) { if (!allOptions[i].classList.contains("hidden")) { prevIndex = i; break; } }
    if (prevIndex !== -1) selectDropdownOption(dropdownId, allOptions[prevIndex].dataset.value);
    e.preventDefault();
  }
});

document.addEventListener("click", function(event) {
  document.querySelectorAll(".searchable-dropdown").forEach(dropdown => {
    if (!dropdown.contains(event.target)) dropdown.querySelector(".dropdown-options").classList.remove("show");
  });
});

document.addEventListener("click", function(event) {
  if (event.target.classList.contains("filter-search-input")) {
    const dropdown = event.target.closest(".searchable-dropdown");
    dropdown.querySelector(".dropdown-options").classList.add("show");
  }
});

function applyDetailFilters() {
  const matricule = getFilterValue('matriculeDropdown');
  const fonction = getFilterValue('fonctionDropdown');
  const rattachement = getFilterValue('rattachementDropdown');
  const statut = getFilterValue('statutDropdown');
  const ticket = getFilterValue('ticketDropdown');

  const filteredData = dashboardData.filter(u => {
    const matchMatricule = !matricule || u.matricule === matricule;
    const matchFonction = !fonction || u.fonction === fonction;
    const matchRattachement = !rattachement || u.rattachement === rattachement;
    let matchStatut = true;
    if (statut) {
      if (!u.outils || u.outils.length === 0) matchStatut = false;
      else matchStatut = u.outils.some(o => o.statut === statut);
    }
    let matchTicket = true;
    if (ticket) {
      if (!u.outils || u.outils.length === 0) matchTicket = false;
      else matchTicket = u.outils.some(o => o.ticket === ticket);
    }
    return matchMatricule && matchFonction && matchRattachement && matchStatut && matchTicket;
  });
  renderDetailTable(filteredData);
}

function resetDetailFilters() {
  setFilterValue('matriculeDropdown', '');
  setFilterValue('fonctionDropdown', '');
  setFilterValue('rattachementDropdown', '');
  setFilterValue('statutDropdown', '');
  setFilterValue('ticketDropdown', '');
  document.querySelectorAll(".filter-search-input").forEach(input => input.value = '');
  document.querySelectorAll(".dropdown-options").forEach(container => container.classList.remove("show"));
  renderDetailTable(dashboardData);
}

function renderDetailTable(data) {
  el.detailTableBody.innerHTML = "";
  el.detailEmptyMessage.style.display = "none";
  const rows = [];
  data.forEach(user => {
    if (!user.outils || user.outils.length === 0) {
      rows.push({ matricule: user.matricule, nom: user.nom, fonction: user.fonction, rattachement: user.rattachement, login: user.login, outil: "---", ticket: "---", statut: "---", dateDebut: "---", dateFin: "---" });
    } else {
      user.outils.forEach(outil => {
        rows.push({ matricule: user.matricule, nom: user.nom, fonction: user.fonction, rattachement: user.rattachement, login: user.login, outil: outil.outil || "---", ticket: outil.ticket || "---", statut: outil.statut || "---", dateDebut: outil.dateDebut || "---", dateFin: outil.dateFin || "---" });
      });
    }
  });
  if (rows.length === 0) {
    el.detailEmptyMessage.style.display = "block";
    el.detailEmptyMessage.textContent = "Aucune donnée à afficher";
  } else {
    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><strong>${row.matricule}</strong></td><td>${row.nom}</td><td>${row.fonction}</td><td>${row.rattachement}</td><td>${row.login}</td><td>${row.outil}</td><td>${row.ticket}</td><td><span class="badge ${row.statut === 'Terminé' ? 'status-success' : 'status-info'}">${row.statut}</span></td><td>${row.dateDebut}</td><td>${row.dateFin}</td><td><button class="btn-edit" onclick="editUser('${row.matricule}')">✏️ Modifier</button></td>`;
      el.detailTableBody.appendChild(tr);
    });
  }
}

// ===============================
// FILTER TABLE
// ===============================
function setupTableFilters() {
  const searchBox = document.getElementById("searchBox");
  const etatFilter = document.getElementById("etatFilter");
  const suiviFilter = document.getElementById("suiviFilter");
  if (!searchBox || !etatFilter || !suiviFilter) return;

  const filterTable = () => {
    const searchTerm = searchBox.value.toLowerCase();
    const etatValue = etatFilter.value;
    const suiviValue = suiviFilter.value;
    const tbody = document.querySelector("#dashboardTable tbody");
    if (!tbody) return;
    const rows = tbody.querySelectorAll("tr");
    rows.forEach(row => {
      const matricule = row.cells[0]?.textContent.toLowerCase() || "";
      const statut = row.cells[1]?.textContent.toLowerCase() || "";
      const nom = row.cells[2]?.textContent.toLowerCase() || "";
      const login = row.cells[5]?.textContent.toLowerCase() || "";
      const etat = row.cells[8]?.textContent || "";
      const suivi = row.cells[10]?.textContent || "";
      const matchSearch = matricule.includes(searchTerm) || statut.includes(searchTerm) || nom.includes(searchTerm) || login.includes(searchTerm);
      const matchEtat = !etatValue || etat === etatValue;
      const matchSuivi = !suiviValue || suivi.includes(suiviValue);
      row.style.display = matchSearch && matchEtat && matchSuivi ? "" : "none";
    });
  };
  searchBox.oninput = filterTable;
  etatFilter.onchange = filterTable;
  suiviFilter.onchange = filterTable;
}

// ===============================
// AUTHENTIFICATION
// ===============================
function setupLoginListener() {
  el.loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const username = el.username.value.trim();
    const password = el.password.value.trim();
    if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
      isAuthenticated = true;
      sessionStorage.setItem("authenticated", "true");
      el.loginMessage.innerHTML = "✅ Connexion réussie...";
      el.loginMessage.className = "login-message show success";
      setTimeout(() => { el.loginSection.classList.add("hidden"); initApp(); }, 1000);
    } else {
      el.loginMessage.innerHTML = "❌ Identifiants incorrects";
      el.loginMessage.className = "login-message show error";
      el.password.value = "";
    }
  });
}

function checkAuthentication() {
  if (sessionStorage.getItem("authenticated") === "true") {
    isAuthenticated = true;
    el.loginSection.classList.add("hidden");
    initApp();
  } else {
    setupLoginListener();
  }
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", function() {
  initializeElements();
  checkAuthentication();
});

function initApp() {
  loadUsers();
}

function showApiError(message) {
  const node = el.msg || document.getElementById("msg");
  if (node) {
    node.textContent = message + " — Vérifiez le déploiement Web App et les permissions (Anyone, even anonymous).";
    node.style.color = "red";
  }
}

async function testApi() {
  try {
    await apiRequest("getDashboard");
    return true;
  } catch (err) {
    showApiError("Test API a échoué: " + err.message);
    return false;
  }
}