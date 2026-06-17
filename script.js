// ===============================
// AUTHENTIFICATION_____
// ===============================
const AUTH_USERNAME = "admin";
const AUTH_PASSWORD = "support_it";

let isAuthenticated = false;

// ===============================
// CONFIG API
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbzces7sj6EOYgX01Ec5CssK7OZQuibeBHn8TfvhFY10gugsddH9iTf7MScqx0ApMGPI/exec";

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

    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window[callbackName];
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Délai dépassé lors de l'appel à l'API"));
    }, 15000);

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
// GET FILTER VALUE (from searchable dropdown)
// ===============================
function getFilterValue(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return "";
  const selected = dropdown.querySelector(".dropdown-option.selected");
  return selected ? selected.dataset.value : "";
}

// ===============================
// SET FILTER VALUE (in searchable dropdown)
// ===============================
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

// 🔥 Liste des outils disponibles
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
let chartEtat = null;
let chartMaterielStatut = null;
let chartEtatOutils = null;
let chartEtatMateriel = null;
let detailsCache = {}; // Cache pour stocker les données de détails
let isSaving = false; // 🔥 Flag pour empêcher les clics multiples


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


// ===============================
// CONVERT DATE FR -> ISO (yyyy-mm-dd)
// ===============================
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


// ===============================
// CONVERT ISO -> FR
// ===============================
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


// ===============================
// PARSE DATE FR
// ===============================
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
    // Si on demande d'inclure les terminés, utiliser l'API dashboard (tous les users)
    const action = includeTermine ? "getDashboard" : "getUsers";
    const data = await apiRequest(action);

    // Si on ne veut pas inclure les terminés, les filtrer côté client
    users = (data || []).filter(u => includeTermine ? true : String(u.etat || "").trim() !== "Terminé");

    el.matricule.innerHTML = `<option value="">-- Choisir un matricule --</option>`;

    users.forEach((u, index) => {
      const opt = document.createElement("option");
      opt.value = u.matricule;  // 🔥 Utiliser le matricule au lieu de l'index
      opt.textContent = `${u.matricule} - ${u.nom}`;
      el.matricule.appendChild(opt);
    });

  } catch (err) {
    showApiError(`Impossible de charger la liste des utilisateurs: ${err.message}`);
  }
}


// ===============================
// NORMALIZE OUTILS (migrate old structure)
// ===============================
function normalizeOutils(outils) {
  if (!outils || !Array.isArray(outils)) return [];
  
  return outils.map(o => {
    // Si l'outil utilise l'ancienne structure avec 'date', le convertir
    if (o.date && !o.dateDebut && !o.dateFin) {
      return {
        outil: o.outil || "",
        ticket: o.ticket || "",
        statut: o.statut || "En cours",
        dateDebut: o.date || "",
        dateFin: ""
      };
    }
    // Sinon, s'assurer que tous les champs existent
    return {
      outil: o.outil || "",
      ticket: o.ticket || "",
      statut: o.statut || "En cours",
      dateDebut: o.dateDebut || "",
      dateFin: o.dateFin || ""
    };
  });
}


// ===============================
// LOAD USER IN FORM
// ===============================
// EDIT USER FROM DASHBOARD
// ===============================
function editUser(matricule) {
  // 🔥 Sélectionner directement par matricule
  el.matricule.value = matricule;
  loadUser();
  showForm();
}


// ===============================
// SHOW DETAILS MODAL (OUTILS)
// ===============================
function showDetails(detailId) {
  const modal = document.getElementById("detailsModal");
  const tbody = document.getElementById("detailsTableBody");
  
  if (!modal || !tbody) return;
  
  // Récupérer les données du cache
  const details = detailsCache[detailId];
  if (!details) {
    return;
  }
  
  // Remplir le header
  document.getElementById("detailsModalMatricule").textContent = details.matricule;
  document.getElementById("detailsModalNom").textContent = details.nom;
  
  // Remplir les infos générales
  document.getElementById("detailsDateCreation").textContent = details.dateCreation;
  document.getElementById("detailsDeadline").textContent = details.deadline;
  
  // Remplir la table des outils
  tbody.innerHTML = "";
  
  const outils = details.outils;
  
  if (!outils || outils.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Aucun outil</td></tr>';
  } else {
    outils.forEach(o => {
      const statusClass = o.statut === "Terminé" ? "status-success" : "status-info";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${o.outil || "-"}</strong></td>
        <td><span class="badge ${statusClass}">${o.statut || "En cours"}</span></td>
        <td>${o.dateDebut || "-"}</td>
        <td>${o.dateFin || "-"}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  // Afficher la modal
  modal.classList.remove("hidden");
}

function closeDetails() {
  const modal = document.getElementById("detailsModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}


// ===============================
window.loadUser = function () {
  const matriculeSelected = el.matricule.value;
  if (matriculeSelected === "") {
    el.msg.textContent = "";
    el.msg.style.color = "";
    return;
  }

  // 🔥 Chercher par matricule au lieu de par index
  currentUser = users.find(u => u.matricule === matriculeSelected);

  if (!currentUser) {
    resetForm();
    return;
  }

  // 🔥 LOG DE DEBUG
  console.log("✅ Utilisateur chargé:", currentUser);
  console.log("✅ Matériels dans currentUser:", currentUser.materiels);

  // Normaliser les outils (ancienne structure → nouvelle)
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


// ===============================
// RENDER OUTILS DYNAMIQUES (sans Rejeté)
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

      <div class="outil-box">
        <label>📋 Outil</label>
        <select class="outil-nom" data-index="${idx}">
          <option value="">-- Choisir un outil --</option>
          ${OUTILS_DISPONIBLES.map(t => `<option value="${t.value}" ${o.outil === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
        </select>
      </div>

      <div class="outil-box">
        <label>🎟️ N° Ticket</label>
        <input type="text" class="outil-ticket" data-index="${idx}" value="${o.ticket || ""}" placeholder="Ex: Insérez le numéro de ticket..." />
      </div>

      <div class="outil-box">
        <label>✓ Statut</label>
        <select class="outil-statut" data-index="${idx}" ${(!o.outil || String(o.outil).trim() === "" || o.statut === "Terminé") ? "disabled" : ""}>
          <option value="En cours" ${(o.statut || "En cours") === "En cours" ? "selected" : ""}>En cours</option>
          <option value="Terminé" ${o.statut === "Terminé" ? "selected" : ""}>Terminé</option>
        </select>
      </div>

      <div class="outil-box">
        <label>📅 Début</label>
        <input type="date" class="outil-dateDebut" data-index="${idx}" value="${convertToISO(o.dateDebut || "")}" />
      </div>

      <div class="outil-box">
        <label>🏁 Fin</label>
        <input type="text" class="outil-dateFin" data-index="${idx}" value="${o.dateFin || ""}" readonly />
      </div>

      <button class="outil-delete-btn" data-index="${idx}" onclick="deleteOutil(${idx})" ${(o.statut || "En cours") !== "En cours" ? "disabled" : ""}>
        🗑️ Supprimer
      </button>
    `;

    container.appendChild(card);
  });

  el.outils.appendChild(container);

  // Synchronisation défensive
  const nomsAfter = container.querySelectorAll('.outil-nom');
  nomsAfter.forEach(inp => {
    const idx = parseInt(inp.dataset.index);
    const val = (inp.value || '').trim();
    const sel = container.querySelector(`.outil-statut[data-index="${idx}"]`);
    
    if (sel) {
      sel.disabled = (val === '' || currentUser?.outils?.[idx]?.statut === 'Terminé');
      if (val === '') {
        sel.value = 'En cours';
        if (currentUser?.outils?.[idx]) currentUser.outils[idx].statut = 'En cours';
      }
    }

    const delBtn = container.querySelector(`.outil-delete-btn[data-index="${idx}"]`);
    if (delBtn) {
      delBtn.disabled = (currentUser?.outils?.[idx]?.statut !== 'En cours');
    }
  });

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

      <div class="outil-box">
        <label>📦 Matériel</label>
        <select class="materiel-nom" data-index="${idx}">
          <option value="">-- Choisir un matériel --</option>
          <option value="Ecran" ${m.materiel === "Ecran" ? 'selected' : ''}>Ecran</option>
          <option value="Laptop" ${m.materiel === "Laptop" ? 'selected' : ''}>Laptop</option>
          <option value="Souris" ${m.materiel === "Souris" ? 'selected' : ''}>Souris</option>
        </select>
      </div>

      <div class="outil-box">
        <label>🏷️ Fabricant</label>
        <input type="text" class="materiel-fabricant" data-index="${idx}" value="${m.fabricant || ""}" placeholder="Ex: Dell, HP..." />
      </div>

      <div class="outil-box">
        <label>🧾 Modèle</label>
        <input type="text" class="materiel-modele" data-index="${idx}" value="${m.modele || ""}" placeholder="Ex: Inspiron 15" />
      </div>

      <div class="outil-box">
        <label>🔎 Numéro de série</label>
        <input type="text" class="materiel-serial" data-index="${idx}" value="${m.serial || ""}" placeholder="Ex: 123456789" />
      </div>

      <div class="outil-box">
        <label>✓ Statut</label>
        <select class="materiel-statut" data-index="${idx}">
          <option value="Rendu" ${m.statut === "Rendu" ? 'selected' : ''}>Rendu</option>
          <option value="Non Rendu" ${m.statut === "Non Rendu" ? 'selected' : ''}>Non Rendu</option>
          <option value="À ne pas rendre" ${m.statut === "À ne pas rendre" ? 'selected' : ''}>À ne pas rendre</option>
        </select>
      </div>

      <div class="outil-box">
        <label>📅 Date</label>
        <input type="date" class="materiel-date" data-index="${idx}" value="${m.date ? convertToISO(m.date) : ''}" />
      </div>

      <button class="outil-delete-btn" data-index="${idx}" onclick="deleteMateriel(${idx})">
        🗑️ Supprimer
      </button>
    `;

    container.appendChild(card);
  });

  el.materiels.appendChild(container);
  setupMaterielsEvents();
}


// ===============================
// ADD MATERIEL
// ===============================
window.addMateriel = function () {
  if (!currentUser) {
    el.msg.textContent = "❌ Veuillez d'abord sélectionner un collaborateur";
    el.msg.style.color = "red";
    return;
  }

  if (!currentUser.materiels) currentUser.materiels = [];

  currentUser.materiels.push({
    materiel: "",
    fabricant: "",
    modele: "",
    serial: "",
    statut: "Non Rendu",
    date: todayFR()
  });

  renderMateriels();
};


// ===============================
// DELETE MATERIEL
// ===============================
window.deleteMateriel = function (idx) {
  if (!currentUser || !currentUser.materiels) return;

  currentUser.materiels.splice(idx, 1);
  renderMateriels();
};


// ===============================
// SETUP MATERIELS EVENTS
// ===============================
function setupMaterielsEvents() {
  const materielSelects = document.querySelectorAll('.materiel-nom');
  const fabricantInputs = document.querySelectorAll('.materiel-fabricant');
  const modeleInputs = document.querySelectorAll('.materiel-modele');
  const serialInputs = document.querySelectorAll('.materiel-serial');
  const statutSelects = document.querySelectorAll('.materiel-statut');
  const dateInputs = document.querySelectorAll('.materiel-date');

  materielSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].materiel = e.target.value || "";
    });
  });

  fabricantInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].fabricant = e.target.value || "";
    });
  });

  modeleInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].modele = e.target.value || "";
    });
  });

  serialInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].serial = e.target.value || "";
    });
  });

  statutSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.materiels[idx].statut = e.target.value || "Non Rendu";
      renderMateriels();
    });
  });

  dateInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      const iso = e.target.value || "";
      currentUser.materiels[idx].date = convertToFR(iso);
    });
  });
}


// ===============================
// ADD OUTIL
// ===============================
window.addOutil = function () {
  if (!currentUser) {
    el.msg.textContent = "❌ Veuillez d'abord sélectionner un collaborateur";
    el.msg.style.color = "red";
    return;
  }

  currentUser.outils.push({
    outil: "",
    ticket: "",
    statut: "En cours",
    dateDebut: todayFR(),
    dateFin: ""
  });

  renderOutils();
  updateEtat();
  setupOutilsEvents();
  updateOutilsDisabledState();
};


// ===============================
// DELETE OUTIL
// ===============================
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
  
  // Récupérer les outils sélectionnés (sauf les vides)
  const selectedOutils = new Set();
  allSelects.forEach(select => {
    if (select.value && select.value.trim() !== "") {
      selectedOutils.add(select.value);
    }
  });

  // Pour chaque select, désactiver les options déjà sélectionnées ailleurs
  allSelects.forEach(select => {
    const currentValue = select.value;
    const options = select.querySelectorAll("option");
    
    options.forEach(option => {
      if (option.value && option.value.trim() !== "") {
        // Désactiver si sélectionné AILLEURS (pas dans ce select)
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
  const outils = document.querySelectorAll(".outil-nom");  // C'est maintenant un SELECT
  const selects = document.querySelectorAll(".outil-statut");
  const tickets = document.querySelectorAll(".outil-ticket");
  const dateDebuts = document.querySelectorAll(".outil-dateDebut");

  outils.forEach(select => {
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

      // 🔥 Mettre à jour l'état des options pour éviter les doublons
      updateOutilsDisabledState();
    });
  });

  selects.forEach(sel => {
    sel.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.outils[idx].statut = e.target.value;

      if (e.target.value === "Terminé" && !currentUser.outils[idx].dateFin) {
        currentUser.outils[idx].dateFin = todayFR();  // 🔥 Date fin = aujourd'hui
      }

      updateEtat();
      renderOutils();   // refresh badges + disabled states
    });
  });

  // 🔥 Event listener pour N° Ticket
  tickets.forEach(input => {
    input.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.index);
      currentUser.outils[idx].ticket = e.target.value || "";
    });
  });

  // 🔥 Event listener pour Date Début
  dateDebuts.forEach(input => {
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
  const showDepartDate = noToolDeletion && materialsOk;
  const showDateFin = !noToolDeletion && toolsOk && materialsOk;

  if (noToolDeletion) {
    currentUser.etat = materialsOk ? "Terminé" : "En cours";
    currentUser.dateFin = "";
  } else {
    if (showDateFin) {
      currentUser.etat = "Terminé";
      if (previousEtat !== "Terminé" || !currentUser.dateFin) {
        currentUser.dateFin = todayFR();
      }
    } else {
      currentUser.etat = "En cours";
      currentUser.dateFin = "";
    }
  }

  const completionDate = noToolDeletion ? currentUser.datedepart : currentUser.dateFin;
  currentUser.statutSuivi = calcStatutSuivi(currentUser.deadline, completionDate, currentUser.etat);

  el.etat.textContent = currentUser.etat;
  el.dateFin.value = showDateFin ? currentUser.dateFin : "";
  el.datedepart.textContent = showDepartDate ? (currentUser.datedepart || "") : "";
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
  if (isSaving) {
    return;
  }

  if (!currentUser) {
    el.msg.textContent = "❌ Veuillez sélectionner un matricule !";
    el.msg.style.color = "red";
    return;
  }

  isSaving = true;
  el.msg.textContent = "⏳ Enregistrement en cours...";
  el.msg.style.color = "blue";

  const noms = document.querySelectorAll(".outil-nom");
  const statuts = document.querySelectorAll(".outil-statut");
  const materielTypes = document.querySelectorAll(".materiel-nom");
  const fabricants = document.querySelectorAll(".materiel-fabricant");
  const modeles = document.querySelectorAll(".materiel-modele");
  const serials = document.querySelectorAll(".materiel-serial");
  const materielStatuts = document.querySelectorAll(".materiel-statut");

  noms.forEach(inp => {
    const idx = parseInt(inp.dataset.index);
    if (currentUser.outils[idx]) currentUser.outils[idx].outil = inp.value;
  });

  statuts.forEach(sel => {
    const idx = parseInt(sel.dataset.index);
    if (currentUser.outils[idx]) currentUser.outils[idx].statut = sel.value;
  });

  currentUser.noToolDeletion = el.noToolDeleteCheckbox.checked;
  currentUser.noToolDeletion = el.noToolDeleteCheckbox.checked;
  currentUser.materiels = currentUser.materiels || [];

  materielTypes.forEach(select => {
    const idx = parseInt(select.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].materiel = select.value || "";
  });

  fabricants.forEach(input => {
    const idx = parseInt(input.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].fabricant = input.value || "";
  });

  modeles.forEach(input => {
    const idx = parseInt(input.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].modele = input.value || "";
  });

  serials.forEach(input => {
    const idx = parseInt(input.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].serial = input.value || "";
  });

  materielStatuts.forEach(select => {
    const idx = parseInt(select.dataset.index);
    if (!currentUser.materiels[idx]) return;
    currentUser.materiels[idx].statut = select.value || "Non Rendu";
  });

  // Si le collaborateur n'a pas besoin de suppression d'outils, les lignes d'outil vides sont ignorées.
  currentUser.outils = currentUser.outils.filter(o => o.outil && o.outil.trim() !== "");

  el.outils.style.border = "";
  el.outils.style.backgroundColor = "";
  el.outils.style.padding = "";
  el.outils.style.borderRadius = "";

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

  // 🔥 LOG DE DEBUG : affiche les données avant l'API
  console.log("✅ Ligne à sauvegarder:", currentUser.row, "Matricule:", currentUser.matricule);
  console.log("✅ Données matériel à envoyer:", currentUser.materiels);
  console.log("✅ Données outils à envoyer:", currentUser.outils);

  try {
    const result = await apiRequest("saveUser", {
      data: JSON.stringify(currentUser)
    });

    if (result.success) {
      el.msg.textContent = "✅ Enregistré avec succès";
      el.msg.style.color = "green";
      await loadUsers(true);
      const matriculeToReload = currentUser.matricule;
      el.matricule.value = matriculeToReload;
      loadUser();
      isSaving = false;
    } else {
      el.msg.textContent = "❌ Erreur lors de l'enregistrement";
      el.msg.style.color = "red";
      isSaving = false;
    }
  } catch (err) {
    el.msg.textContent = "❌ Impossible de contacter l'API";
    el.msg.style.color = "red";
    isSaving = false;
  }
};


// ===============================
// HANDLE DATE FIN CHANGE
// ===============================
function handleDateFinChange(e) {
  if (currentUser) {
    currentUser.dateFin = convertToFR(el.dateFin.value);
    updateEtat();
  }
}


// ===============================
// RESET FORM
// ===============================
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
    const data = await apiRequest("getDashboard");
    dashboardData = data || [];

    renderDashboard(dashboardData);
    updateStats();
    updateCharts();

  } catch (err) {
    showApiError(`Impossible de charger le dashboard: ${err.message}`);
  }
}

function renderDashboard(data) {
  const tbody = document.querySelector("#dashboardTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  detailsCache = {}; // Vider le cache avant de remplir

  data.forEach((row, index) => {
    const suiviClass =
      row.statutSuivi === "Respecté"   ? "status-success" :
      row.statutSuivi === "Non respecté" ? "status-danger" :
      "status-info";

    const modifyBtn = row.etat === "En cours" 
      ? `<button class="btn btn-action btn-modify" onclick="editUser('${row.matricule}')">✏️ Modifier</button>`
      : `<button class="btn btn-action btn-disabled" disabled>✓ Terminé</button>`;

    tbody.innerHTML += `
      <tr>
        <td><strong>${row.matricule || ""}</strong></td>
        <td>${row.statut || ""}</td>
        <td>${row.nom || ""}</td>
        <td>${row.fonction || ""}</td>
        <td>${row.rattachement || ""}</td>
        <td>${row.login || ""}</td>
        <td>${row.dateCreation || ""}</td>
        <td>${row.deadline || ""}</td>
        <td>${row.etat || ""}</td>
        <td>${row.dateFin || ""}</td>
        <td>${row.ticketTyfanie || ""}</td>
        <td><span class="badge ${suiviClass}">${row.statutSuivi || ""}</span></td>
        <td>${modifyBtn}</td>
      </tr>
    `;
  });

  setupTableFilters();
}

function updateStats() {
  const total = dashboardData.length;
  const enCours = dashboardData.filter(u => u.statutSuivi === "En cours").length;
  const respecte = dashboardData.filter(u => u.statutSuivi === "Respecté").length;
  const nonRespecte = dashboardData.filter(u => u.statutSuivi === "Non respecté").length;

  const outils = dashboardData.flatMap(u => u.outils || []);
  const materiels = dashboardData.flatMap(u => u.materiels || []);
  const materielTotal = materiels.filter(m => m.statut !== "À ne pas rendre").length;

  const toolProgressPercent = total ? Math.round(((respecte + nonRespecte) / total) * 100) : 0;

  const collaboratorWithMateriel = dashboardData.filter(u => (u.materiels || []).length > 0);
  const materielCollaboratorRespecte = collaboratorWithMateriel.filter(u => u.statutSuivi === "Respecté").length;
  const materielCollaboratorNonRespecte = collaboratorWithMateriel.filter(u => u.statutSuivi === "Non respecté").length;
  const materielCollaboratorEnCours = collaboratorWithMateriel.filter(u => u.statutSuivi === "En cours").length;
  const materielProgressPercent = total ? Math.round(((materielCollaboratorRespecte + materielCollaboratorNonRespecte) / total) * 100) : 0;

  document.getElementById("statCollaborateursTotal").textContent = total;
  document.getElementById("statOutilsTotal").textContent = outils.length;
  document.getElementById("statMaterielItemsTotal").textContent = materielTotal;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statEnCours").textContent = enCours;
  document.getElementById("statRespecte").textContent = respecte;
  document.getElementById("statNonRespecte").textContent = nonRespecte;
  document.getElementById("statMaterielTotal").textContent = materiels.length;
  document.getElementById("statMaterielRendu").textContent = materiels.filter(m => m.statut === "Rendu").length;
  document.getElementById("statMaterielNonRendu").textContent = materiels.filter(m => m.statut === "Non Rendu").length;
  document.getElementById("statMaterielNoReturn").textContent = materiels.filter(m => m.statut === "À ne pas rendre").length;

  document.getElementById("toolProgressPercent").textContent = `${toolProgressPercent}%`;
  document.getElementById("toolProgressSubtext").textContent = `${respecte + nonRespecte} / ${total} départs`;
  document.getElementById("toolRespecte").textContent = respecte;
  document.getElementById("toolEnCours").textContent = enCours;
  document.getElementById("toolNonRespecte").textContent = nonRespecte;

  document.getElementById("materielProgressPercent").textContent = `${materielProgressPercent}%`;
  document.getElementById("materielProgressSubtext").textContent = `${materielCollaboratorRespecte + materielCollaboratorNonRespecte} / ${total} départs`;
  document.getElementById("materielRespecteSummary").textContent = materielCollaboratorRespecte;
  document.getElementById("materielEnCoursSummary").textContent = materielCollaboratorEnCours;
  document.getElementById("materielNonRespecteSummary").textContent = materielCollaboratorNonRespecte;
}

function updateCharts() {
  if (!dashboardData || dashboardData.length === 0) {
    if (chartSuivi) { chartSuivi.destroy(); chartSuivi = null; }
    if (chartEtatOutils) { chartEtatOutils.destroy(); chartEtatOutils = null; }
    if (chartEtatMateriel) { chartEtatMateriel.destroy(); chartEtatMateriel = null; }
    return;
  }

  const enCours    = dashboardData.filter(u => u.statutSuivi === "En cours").length;
  const respecte   = dashboardData.filter(u => u.statutSuivi === "Respecté").length;
  const nonRespecte = dashboardData.filter(u => u.statutSuivi === "Non respecté").length;

  const etatTermine = dashboardData.filter(u => u.etat === "Terminé").length;
  const etatEnCours = dashboardData.filter(u => u.etat === "En cours").length;

  // Chart Suivi
  try {
    const ctxSuivi = document.getElementById("chartSuivi");
    if (!ctxSuivi) return;

    if (chartSuivi) chartSuivi.destroy();

    chartSuivi = new Chart(ctxSuivi, {
      type: "doughnut",
      data: {
        labels: ["Respecté", "Non respecté", "En cours"],
        datasets: [{
          data: [respecte, nonRespecte, enCours],
          backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
          borderColor: ["#059669", "#dc2626", "#d97706"],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom", labels: { padding: 12, font: { size: 12 }, usePointStyle: true } }
        }
      }
    });
  } catch (err) {
    // Erreur silencieuse
  }

  // Chart Etat Outils
  try {
    const ctxEtatOutils = document.getElementById("chartEtatOutils");
    if (!ctxEtatOutils) return;

    if (chartEtatOutils) chartEtatOutils.destroy();

    chartEtatOutils = new Chart(ctxEtatOutils, {
      type: "doughnut",
      data: {
        labels: ["Terminé", "En cours"],
        datasets: [{
          data: [etatTermine, etatEnCours],
          backgroundColor: ["#3b82f6", "#6b7280"],
          borderColor: ["#1e40af", "#4b5563"],
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom", labels: { padding: 12, font: { size: 12, weight: "bold" }, usePointStyle: true } }
        }
      }
    });
  } catch (err) {
    // Erreur silencieuse
  }

  // Chart Etat Matériel (même données que outils pour l'instant)
  try {
    const ctxEtatMateriel = document.getElementById("chartEtatMateriel");
    if (!ctxEtatMateriel) return;

    if (chartEtatMateriel) chartEtatMateriel.destroy();

    chartEtatMateriel = new Chart(ctxEtatMateriel, {
      type: "doughnut",
      data: {
        labels: ["Terminé", "En cours"],
        datasets: [{
          data: [etatTermine, etatEnCours],
          backgroundColor: ["#3b82f6", "#6b7280"],
          borderColor: ["#1e40af", "#4b5563"],
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom", labels: { padding: 12, font: { size: 12, weight: "bold" }, usePointStyle: true } }
        }
      }
    });
  } catch (err) {
    // Erreur silencieuse
  }

  try {
    const materielCollaborators = dashboardData.filter(u => (u.materiels || []).length > 0);
    const materielRespecte = materielCollaborators.filter(u => u.statutSuivi === "Respecté").length;
    const materielNonRespecte = materielCollaborators.filter(u => u.statutSuivi === "Non respecté").length;
    const materielEnCours = materielCollaborators.filter(u => u.statutSuivi === "En cours").length;

    const ctxMateriel = document.getElementById("chartMaterielStatut");
    if (!ctxMateriel) return;

    if (chartMaterielStatut) chartMaterielStatut.destroy();

    chartMaterielStatut = new Chart(ctxMateriel, {
      type: "doughnut",
      data: {
        labels: ["Respecté", "Non respecté", "En cours"],
        datasets: [{
          data: [materielRespecte, materielNonRespecte, materielEnCours],
          backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
          borderColor: ["#059669", "#dc2626", "#d97706"],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "bottom", labels: { padding: 12, font: { size: 12 }, usePointStyle: true } }
        }
      }
    });
  } catch (err) {
    // Erreur silencieuse
  }
}


// ===============================
// LOAD DETAIL
// ===============================
async function loadDetail() {
  try {
    const data = await apiRequest("getDashboard");
    dashboardData = data || [];

    // Populer les filtres
    populateDetailFilters();

    // Afficher les détails
    renderDetailTable(dashboardData);

  } catch (err) {
    el.detailEmptyMessage.style.display = "block";
    el.detailEmptyMessage.textContent = `❌ Impossible de charger les détails: ${err.message}`;
  }
}

// ===============================
// POPULATE DETAIL FILTERS
// ===============================
function populateDetailFilters() {
  // Matricules
  const matricules = [...new Set(dashboardData.map(u => u.matricule).filter(m => m))];
  populateDropdownOptions('matriculeDropdown', matricules);

  // Fonctions
  const fonctions = [...new Set(dashboardData.map(u => u.fonction).filter(f => f))];
  populateDropdownOptions('fonctionDropdown', fonctions);

  // Rattachements
  const rattachements = [...new Set(dashboardData.map(u => u.rattachement).filter(r => r))];
  populateDropdownOptions('rattachementDropdown', rattachements);

  // Tickets
  const tickets = [];
  dashboardData.forEach(u => {
    if (u.outils && u.outils.length > 0) {
      u.outils.forEach(outil => {
        if (outil.ticket && outil.ticket !== "---") {
          tickets.push(outil.ticket);
        }
      });
    }
  });
  const uniqueTickets = [...new Set(tickets)].sort();
  populateDropdownOptions('ticketDropdown', uniqueTickets);
}

// ===============================
// POPULATE DROPDOWN OPTIONS
// ===============================
function populateDropdownOptions(dropdownId, options) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  
  // Clear all options except the first "all" option
  const firstOption = optionsContainer.querySelector(".dropdown-option");
  optionsContainer.innerHTML = "";
  optionsContainer.appendChild(firstOption);
  
  // Add new options
  options.forEach(optValue => {
    const optElement = document.createElement("div");
    optElement.className = "dropdown-option";
    optElement.dataset.value = optValue;
    optElement.textContent = optValue;
    optElement.onclick = function(e) {
      e.stopPropagation();
      selectDropdownOption(dropdownId, optValue);
    };
    optionsContainer.appendChild(optElement);
  });
}

// ===============================
// SELECT DROPDOWN OPTION
// ===============================
function selectDropdownOption(dropdownId, value) {
  setFilterValue(dropdownId, value);
  const dropdown = document.getElementById(dropdownId);
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  const selectedOption = dropdown.querySelector(`.dropdown-option[data-value="${value}"]`);
  
  // Scroll to selected option
  if (selectedOption && optionsContainer.scrollTop !== undefined) {
    selectedOption.scrollIntoView({ block: "nearest" });
  }
  
  optionsContainer.classList.remove("show");
  applyDetailFilters();
}

// ===============================
// FILTER DROPDOWN OPTIONS (search functionality)
// ===============================
function filterDropdownOptions(input) {
  const dropdownId = input.closest(".searchable-dropdown").id;
  const dropdown = document.getElementById(dropdownId);
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  const options = optionsContainer.querySelectorAll(".dropdown-option");
  
  const searchTerm = input.value.toLowerCase();
  
  // Show/hide options based on search
  options.forEach(option => {
    const text = option.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      option.classList.remove("hidden");
    } else {
      option.classList.add("hidden");
    }
  });
  
  // Show the dropdown when typing
  if (searchTerm.length > 0 || input.value.length === 0) {
    optionsContainer.classList.add("show");
  }
}

// ===============================
// HANDLE KEYBOARD NAVIGATION IN DROPDOWNS
// ===============================
document.addEventListener("keydown", function(e) {
  const input = document.activeElement;
  if (!input.classList.contains("filter-search-input")) return;
  
  const dropdownId = input.closest(".searchable-dropdown").id;
  const dropdown = document.getElementById(dropdownId);
  const optionsContainer = dropdown.querySelector(".dropdown-options");
  const options = optionsContainer.querySelectorAll(".dropdown-option:not(.hidden)");
  
  if (e.key === "Escape") {
    optionsContainer.classList.remove("show");
    e.preventDefault();
  } else if (e.key === "Enter") {
    const firstVisible = options[0];
    if (firstVisible) {
      selectDropdownOption(dropdownId, firstVisible.dataset.value);
    }
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    const allOptions = dropdown.querySelectorAll(".dropdown-option");
    const currentIndex = Array.from(allOptions).findIndex(opt => opt.classList.contains("selected"));
    const nextIndex = Array.from(allOptions).findIndex((opt, idx) => idx > currentIndex && !opt.classList.contains("hidden"));
    if (nextIndex !== -1) {
      selectDropdownOption(dropdownId, allOptions[nextIndex].dataset.value);
    }
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    const allOptions = dropdown.querySelectorAll(".dropdown-option");
    const currentIndex = Array.from(allOptions).findIndex(opt => opt.classList.contains("selected"));
    let prevIndex = -1;
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!allOptions[i].classList.contains("hidden")) {
        prevIndex = i;
        break;
      }
    }
    if (prevIndex !== -1) {
      selectDropdownOption(dropdownId, allOptions[prevIndex].dataset.value);
    }
    e.preventDefault();
  }
});

// ===============================
// CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
// ===============================
document.addEventListener("click", function(event) {
  const searchableDropdowns = document.querySelectorAll(".searchable-dropdown");
  searchableDropdowns.forEach(dropdown => {
    if (!dropdown.contains(event.target)) {
      const optionsContainer = dropdown.querySelector(".dropdown-options");
      optionsContainer.classList.remove("show");
    }
  });
});

// ===============================
// OPEN DROPDOWNS WHEN CLICKING ON INPUT
// ===============================
document.addEventListener("click", function(event) {
  if (event.target.classList.contains("filter-search-input")) {
    const dropdown = event.target.closest(".searchable-dropdown");
    const optionsContainer = dropdown.querySelector(".dropdown-options");
    optionsContainer.classList.add("show");
  }
});

// ===============================
// APPLY DETAIL FILTERS
// ===============================
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
    
    // Filtrer par statut: vérifier si au moins un outil a le statut demandé
    let matchStatut = true;
    if (statut) {
      if (!u.outils || u.outils.length === 0) {
        matchStatut = false;
      } else {
        matchStatut = u.outils.some(o => o.statut === statut);
      }
    }

    // Filtrer par ticket: vérifier si au moins un outil a le ticket demandé
    let matchTicket = true;
    if (ticket) {
      if (!u.outils || u.outils.length === 0) {
        matchTicket = false;
      } else {
        matchTicket = u.outils.some(o => o.ticket === ticket);
      }
    }
    
    return matchMatricule && matchFonction && matchRattachement && matchStatut && matchTicket;
  });

  renderDetailTable(filteredData);
}

// ===============================
// RESET DETAIL FILTERS
// ===============================
function resetDetailFilters() {
  setFilterValue('matriculeDropdown', '');
  setFilterValue('fonctionDropdown', '');
  setFilterValue('rattachementDropdown', '');
  setFilterValue('statutDropdown', '');
  setFilterValue('ticketDropdown', '');
  
  // Clear all search inputs
  document.querySelectorAll(".filter-search-input").forEach(input => {
    input.value = '';
  });
  
  // Hide all dropdowns
  document.querySelectorAll(".dropdown-options").forEach(container => {
    container.classList.remove("show");
  });
  
  renderDetailTable(dashboardData);
}

// ===============================
// RENDER DETAIL TABLE
// ===============================
function renderDetailTable(data) {
  el.detailTableBody.innerHTML = "";
  el.detailEmptyMessage.style.display = "none";

  // Créer une liste d'outils (déploiement)
  const rows = [];

  data.forEach(user => {
    if (!user.outils || user.outils.length === 0) {
      rows.push({
        matricule: user.matricule,
        nom: user.nom,
        fonction: user.fonction,
        rattachement: user.rattachement,
        login: user.login,
        outil: "---",
        ticket: "---",
        statut: "---",
        dateDebut: "---",
        dateFin: "---"
      });
    } else {
      user.outils.forEach(outil => {
        rows.push({
          matricule: user.matricule,
          nom: user.nom,
          fonction: user.fonction,
          rattachement: user.rattachement,
          login: user.login,
          outil: outil.outil || "---",
          ticket: outil.ticket || "---",
          statut: outil.statut || "---",
          dateDebut: outil.dateDebut || "---",
          dateFin: outil.dateFin || "---"
        });
      });
    }
  });

  if (rows.length === 0) {
    el.detailEmptyMessage.style.display = "block";
    el.detailEmptyMessage.textContent = "Aucune donnée à afficher";
  } else {
    rows.forEach(row => {
      const tr = document.createElement("tr");
      const editBtn = `<button class="btn-edit" onclick="editUser('${row.matricule}')">✏️ Modifier</button>`;
      
      tr.innerHTML = `
        <td><strong>${row.matricule}</strong></td>
        <td>${row.nom}</td>
        <td>${row.fonction}</td>
        <td>${row.rattachement}</td>
        <td>${row.login}</td>
        <td>${row.outil}</td>
        <td>${row.ticket}</td>
        <td>
          <span class="badge ${row.statut === 'Terminé' ? 'status-success' : 'status-info'}">
            ${row.statut}
          </span>
        </td>
        <td>${row.dateDebut}</td>
        <td>${row.dateFin}</td>
        <td>${editBtn}</td>
      `;
      el.detailTableBody.appendChild(tr);
    });
  }
}


// ===============================
// FILTER TABLE
// ===============================
function setupTableFilters() {
  const searchBox  = document.getElementById("searchBox");
  const etatFilter  = document.getElementById("etatFilter");
  const suiviFilter = document.getElementById("suiviFilter");

  if (!searchBox || !etatFilter || !suiviFilter) return;

  const filterTable = () => {
    const searchTerm = searchBox.value.toLowerCase();
    const etatValue  = etatFilter.value;
    const suiviValue = suiviFilter.value;

    const tbody = document.querySelector("#dashboardTable tbody");
    if (!tbody) return;

    const rows = tbody.querySelectorAll("tr");

    rows.forEach(row => {
      const matricule = row.cells[0]?.textContent.toLowerCase() || "";
      const statut    = row.cells[1]?.textContent.toLowerCase() || "";
      const nom       = row.cells[2]?.textContent.toLowerCase() || "";
      const login     = row.cells[5]?.textContent.toLowerCase() || "";

      const etat  = row.cells[8]?.textContent || "";
      const suivi = row.cells[10]?.textContent || "";

      const matchSearch =
        matricule.includes(searchTerm) ||
        statut.includes(searchTerm)    ||
        nom.includes(searchTerm)       ||
        login.includes(searchTerm);

      const matchEtat  = !etatValue || etat === etatValue;
      const matchSuivi = !suiviValue || suivi.includes(suiviValue);

      row.style.display = matchSearch && matchEtat && matchSuivi ? "" : "none";
    });
  };

  searchBox.oninput   = filterTable;
  etatFilter.onchange  = filterTable;
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
      // Authentification réussie
      isAuthenticated = true;
      sessionStorage.setItem("authenticated", "true");
      
      el.loginMessage.innerHTML = "✅ Connexion réussie...";
      el.loginMessage.className = "login-message show success";
      
      setTimeout(() => {
        el.loginSection.classList.add("hidden");
        initApp();
      }, 1000);
    } else {
      // Authentification échouée
      el.loginMessage.innerHTML = "❌ Identifiants incorrects";
      el.loginMessage.className = "login-message show error";
      el.password.value = "";
    }
  });
}

function checkAuthentication() {
  // Vérifier si l'utilisateur est déjà connecté
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


// ===============================
// API ERROR / DIAGNOSTICS
// ===============================
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

// bonjour