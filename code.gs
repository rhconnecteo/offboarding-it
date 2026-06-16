/*******************************************************
 * CODE.GS
 * API Google Apps Script pour lire et enregistrer
 * les données de la feuille Google Sheets "Processus Offboarding".
 *
 * Colonnes dans la feuille "Processus Offboarding" :
 * 1  = Matricule
 * 2  = Statut
 * 3  = Nom et Prénoms
 * 4  = Fonction
 * 5  = Rattachement
 * 6  = Date de départ
 * 7  = Login
 * 8  = Date de création
 * 9  = Deadline (calculée automatiquement ou saisie)
 * 10 = Date fin (calculée dans JavaScript puis enregistrée ici)
 * 11 = Ticket Tyfanie
 * 12 = StatutSuivi (formule Google Sheets)
 * 13 = Etat (formule Google Sheets)
 *
 * Ensuite à partir de la colonne 14 :
 * Outil1 | N° Ticket | Statut | Date Début | Date Fin |
 * Outil2 | N° Ticket | Statut | Date Début | Date Fin ...
 *
 *******************************************************/


const SPREADSHEET_ID = "1h7KpviGAHD7Afh9twRJlH1UzHAp0n4V_6-bZqv_WfCk";
const SHEET_NAME = "Processus Offboarding (outils)";
const RESTITUTION_SHEET_NAME = "Processus Offboarding (restitution)";


/* =====================================================
   1) ENTRY POINT : doGet()
   Cette fonction reçoit les requêtes HTTP GET.
   Exemple :
   - ?action=getUsers
   - ?action=getDashboard
   - ?action=saveUser&data=....
   - ?callback=maFonctionJsonp
===================================================== */
function doGet(e) {

  const params = (e && e.parameter) ? e.parameter : {};
  const action = params.action;
  const callback = params.callback;

  if (!action) {
    return outputJSON({ error: "Action manquante" }, callback);
  }

  switch (action) {

    case "getUsers":
      return outputJSON(getUsersAPI(), callback);

    case "getDashboard":
      return outputJSON(getDashboardAPI(), callback);

    case "saveUser":

      if (!params.data) {
        return outputJSON({ error: "Paramètre data manquant" }, callback);
      }

      const user = JSON.parse(params.data);

      saveUserAPI(user);

      return outputJSON({ success: true }, callback);

    default:
      return outputJSON({ error: "Action invalide : " + action }, callback);
  }
}


/* =====================================================
   2) outputJSON()
   Transforme un objet JS en réponse JSON lisible
===================================================== */
function outputJSON(obj, callback) {
  const payload = JSON.stringify(obj);

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${payload});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}


function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME);

  if (!sh) {
    throw new Error(`Feuille introuvable : ${SHEET_NAME}`);
  }

  return sh;
}

function getRestitutionSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(RESTITUTION_SHEET_NAME);

  if (!sh) {
    // Si la feuille n'existe pas, la créer avec les mêmes entêtes
    const templateSh = ss.getSheetByName(SHEET_NAME);
    const newSh = ss.insertSheet(RESTITUTION_SHEET_NAME);
    
    if (templateSh) {
      const headers = templateSh.getRange(1, 1, 1, templateSh.getLastColumn()).getValues()[0];
      newSh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    return newSh;
  }

  return sh;
}

function parseDynamicItems(row, startCol, fieldNames) {
  const items = [];
  if (!row || row.length <= startCol) return items;

  const blockSize = fieldNames.length;

  for (let col = startCol; col < row.length; col += blockSize) {
    const item = {};
    let hasValue = false;

    fieldNames.forEach((field, idx) => {
      const value = (row[col + idx] || "").toString().trim();
      item[field] = value;
      if (value) hasValue = true;
    });

    if (hasValue) {
      items.push(item);
    }
  }

  return items;
}


/* =====================================================
   Utilitaires : lecture de l'entête et mapping nom->index
   - getHeaderMap(sh) : retourne un objet { normalizedHeader: zeroBasedIndex }
   - colIndex(name, headerMap, fallbackOneBased) : récupère index (0-based)
===================================================== */
function normalizeHeader(h) {
  if (h === undefined || h === null) return "";
  try {
    return String(h)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  } catch (e) {
    return String(h).toLowerCase().replace(/\s+/g, ' ').trim();
  }
}

function getHeaderMap(sh) {
  const lastCol = sh.getLastColumn();
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0] || [];
  const map = {};

  for (let i = 0; i < headers.length; i++) {
    const key = normalizeHeader(headers[i]);
    if (key) map[key] = i;
  }

  return map;
}

function colIndex(name, headerMap, fallbackOneBased) {
  const key = normalizeHeader(name);
  if (headerMap && headerMap.hasOwnProperty(key)) return headerMap[key];
  // fallback to provided 1-based column index -> convert to 0-based
  return (typeof fallbackOneBased === 'number') ? (fallbackOneBased - 1) : undefined;
}

function findRowByMatricule(sh, matricule, matriculeCol) {
  if (!matricule || typeof matriculeCol !== 'number') return null;
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return null;

  const values = sh.getRange(2, matriculeCol + 1, lastRow - 1, 1).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || "").trim() === String(matricule).trim()) {
      return i + 2;
    }
  }

  return null;
}

function findToolsStartIndex(headerMap, sh) {
  // Prefer explicit headers that contain the word 'outil' or 'materiel'
  const lastCol = sh.getLastColumn();
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0] || [];

  for (let i = 0; i < headers.length; i++) {
    const h = normalizeHeader(headers[i]);
    if (h && (h.indexOf('outil') !== -1 || h.indexOf('materiel') !== -1)) return i; // zero-based index of first 'outil' or 'materiel' header
  }

  // List of possible known header name variants (fallback)
  const known = [
    'matricule','statut','nom et prenoms','nom et prénoms','fonction','rattachement',
    'date de depart','date de départ','date dintegration','date d integration','date d\'integration','login',
    'ticket tyfanie','date de creation','date de création','date de deadline','deadline','date fin','statutsuivi','etat'
  ];

  let maxIdx = -1;

  known.forEach(k => {
    const i = headerMap[normalizeHeader(k)];
    if (typeof i === 'number' && i > maxIdx) maxIdx = i;
  });

  if (maxIdx >= 0) return maxIdx + 1; // start after last known header

  // default fallback: tools start at column 14 (1-based) -> index 13
  // Ensure we never return an index before column 14 (zero-based 13)
  return 13;
}

// Ensure tools start index is at least column 14 (zero-based 13)
function normalizeToolsStartIndex(idx) {
  if (typeof idx !== 'number' || idx < 13) return 13;
  return idx;
}

function getMainColumnIndex(name, headerMap, sh, toolsStart, fallbackOneBased) {
  const key = normalizeHeader(name);
  const lastCol = sh.getLastColumn();
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0] || [];
  const limit = typeof toolsStart === 'number' ? Math.min(toolsStart, headers.length) : headers.length;

  for (let i = 0; i < limit; i++) {
    if (normalizeHeader(headers[i]) === key) return i;
  }

  const fallbackIndex = colIndex(name, headerMap, fallbackOneBased);
  if (typeof fallbackIndex === 'number' && (typeof toolsStart !== 'number' || fallbackIndex < toolsStart)) {
    return fallbackIndex;
  }

  return (typeof fallbackOneBased === 'number') ? (fallbackOneBased - 1) : undefined;
}


/* =====================================================
   3) getUsersAPI()
   Récupère tous les utilisateurs dont Etat != "Terminé"
   (Etat = colonne 12)
===================================================== */
function getUsersAPI() {

  const sh = getSheet();
  const restitutionSh = getRestitutionSheet();
  const headerMap = getHeaderMap(sh);
  const restitutionHeaderMap = getHeaderMap(restitutionSh);
  const data = sh.getDataRange().getDisplayValues();
  const restitutionData = restitutionSh.getDataRange().getDisplayValues();

  const res = [];

  const toolsStart = normalizeToolsStartIndex(findToolsStartIndex(headerMap, sh)); // zero-based
  const materielsStart = normalizeToolsStartIndex(findToolsStartIndex(restitutionHeaderMap, restitutionSh)); // zero-based

  // Build a map of restitutions indexed by matricule (to avoid relying on identical row numbers)
  const restitutionsByMatricule = {};
  const restitutionMatriculeCol = getMainColumnIndex('matricule', restitutionHeaderMap, restitutionSh, undefined, 1);

  for (let j = 1; j < restitutionData.length; j++) {
    const matriculeRest = String((restitutionData[j][restitutionMatriculeCol] || "")).trim();
    if (!matriculeRest) continue;
    restitutionsByMatricule[matriculeRest] = parseDynamicItems(restitutionData[j], materielsStart, [
      'materiel', 'fabricant', 'modele', 'serial', 'statut'
    ]);
  }

  const matriculeCol = getMainColumnIndex('matricule', headerMap, sh, toolsStart, 1);
  const statutCol = getMainColumnIndex('statut', headerMap, sh, toolsStart, 2);
  const nomCol = getMainColumnIndex('nom et prenoms', headerMap, sh, toolsStart, 3);
  const fonctionCol = getMainColumnIndex('fonction', headerMap, sh, toolsStart, 4);
  const rattachementCol = getMainColumnIndex('rattachement', headerMap, sh, toolsStart, 5);
  const dateDepartCol = getMainColumnIndex('date de depart', headerMap, sh, toolsStart, 6);
  const loginCol = getMainColumnIndex('login', headerMap, sh, toolsStart, 7);
  const dateCreationCol = getMainColumnIndex('date de creation', headerMap, sh, toolsStart, 8);
  const deadlineCol = getMainColumnIndex('deadline', headerMap, sh, toolsStart, 9);
  const dateFinCol = getMainColumnIndex('date fin', headerMap, sh, toolsStart, 10);
  const ticketTyfanieCol = getMainColumnIndex('ticket tyfanie', headerMap, sh, toolsStart, 11);
  const statutSuiviCol = getMainColumnIndex('statutsuivi', headerMap, sh, toolsStart, 12);
  const etatCol = getMainColumnIndex('etat', headerMap, sh, toolsStart, 13);

  for (let i = 1; i < data.length; i++) {

    const matricule = (data[i][matriculeCol] || "").trim();

    if (!matricule) continue;

    const etat = (data[i][etatCol] || "En cours").trim();

    if (etat === "Terminé") continue;

    // =============================
    // Lecture des outils dynamiques
    // =============================
    let outils = [];

    // Chaque outil prend 5 colonnes : Outil | N° Ticket | Statut | Date Début | Date Fin
    for (let col = toolsStart; col < data[i].length; col += 5) {

      const outil = (data[i][col] || "").trim();
      const ticket = (data[i][col + 1] || "").trim();
      const statut = (data[i][col + 2] || "").trim();
      const dateDebut = (data[i][col + 3] || "").trim();
      const dateFin = (data[i][col + 4] || "").trim();

      if (outil) {
        outils.push({
          outil: outil,
          ticket: ticket || "",
          statut: statut || "En cours",
          dateDebut: dateDebut || "",
          dateFin: dateFin || ""
        });
      }
    }

    // =============================
    // Construire l'objet utilisateur
    // =============================
    res.push({
      row: i + 1,

      matricule: matricule,
      statut: data[i][statutCol],
      nom: data[i][nomCol],
      fonction: data[i][fonctionCol],
      rattachement: data[i][rattachementCol],
      dateDepart: data[i][dateDepartCol],
      // backward compatibility for old frontend keys
      dateIntegration: data[i][dateDepartCol],
      // alias for frontend compatibility
      datedepart: data[i][dateDepartCol],

      login: data[i][loginCol],
      dateCreation: data[i][dateCreationCol],
      deadline: data[i][deadlineCol],

      dateFin: data[i][dateFinCol] || "",
      ticketTyfanie: data[i][ticketTyfanieCol] || "",
      statutSuivi: data[i][statutSuiviCol] || "",
      etat: etat,

      outils: outils,
      materiels: restitutionsByMatricule[matricule] || []
    });
  }

  return res;
}


/* =====================================================
   4) saveUserAPI(user)
   Enregistre dans la feuille IT :
   - Date fin (col 10) => envoyée depuis JavaScript
   - Les outils (à partir de col 13)
   ⚠️ Ne touche pas Etat et StatutSuivi (formules Sheets)
===================================================== */
function saveUserAPI(user) {

  const sh = getSheet();
  const restitutionSh = getRestitutionSheet();

  const headerMap = getHeaderMap(sh);
  const matriculeCol = getMainColumnIndex('matricule', headerMap, sh, undefined, 1);

  if (!user.row) {
    if (user.matricule) {
      const resolvedRow = findRowByMatricule(sh, user.matricule, matriculeCol);
      if (resolvedRow) {
        user.row = resolvedRow;
      }
    }
  }

  if (user.row) {
    const existingMatricule = String(sh.getRange(user.row, matriculeCol + 1).getDisplayValue() || "").trim();
    const expectedMatricule = String(user.matricule || "").trim();
    if (existingMatricule !== expectedMatricule) {
      const resolvedRow = findRowByMatricule(sh, user.matricule, matriculeCol);
      if (resolvedRow) {
        user.row = resolvedRow;
      }
    }
  }

  if (!user.row) {
    throw new Error("Row manquant dans user");
  }

  const row = user.row;

  const toolsStart = normalizeToolsStartIndex(findToolsStartIndex(headerMap, sh)); // zero-based index

  // =========================================
  // 1) Sauvegarder Date fin (colonne nommée 'Date Fin')
  // =========================================
  const dateFinCol = getMainColumnIndex('date fin', headerMap, sh, toolsStart, 10);
  if (typeof dateFinCol === 'number') {
    sh.getRange(row, dateFinCol + 1).setValue(user.dateFin || "");
  }

  // =========================================
  // 1.b) Ne PAS écrire dans la colonne 'Etat'
  // L'état est calculé par une formule dans la feuille Google Sheets.
  // Pour éviter d'écraser cette formule nous ne persistons pas `user.etat` ici.

  // =========================================
  // 2) NE PAS toucher Ticket Tyfanie, StatutSuivi et Etat
  // =========================================
  // Col 11 = Ticket Tyfanie
  // Col 12 = StatutSuivi (formule Google Sheets)
  // Col 13 = Etat (formule Google Sheets)
  // On ne touche pas pour ne pas casser les formules.


  // =========================================
  // 3) Nettoyer les anciens outils
  // =========================================
  const lastCol = sh.getLastColumn();
  const startColOneBased = toolsStart + 1;

  if (lastCol >= startColOneBased) {
    sh.getRange(row, startColOneBased, 1, lastCol - (startColOneBased - 1)).clearContent();
  }


  // =========================================
  // 4) Réécrire les outils envoyés
  // =========================================
  // Chaque outil prend 5 colonnes :
  // Outil | N° Ticket | Statut | Date Début | Date Fin
  if (user.outils && user.outils.length > 0) {

    user.outils.forEach((o, i) => {

      const colOneBased = startColOneBased + i * 5;

      sh.getRange(row, colOneBased).setValue(o.outil || "");
      sh.getRange(row, colOneBased + 1).setValue(o.ticket || "");
      sh.getRange(row, colOneBased + 2).setValue(o.statut || "En cours");
      sh.getRange(row, colOneBased + 3).setValue(o.dateDebut || "");
      sh.getRange(row, colOneBased + 4).setValue(o.dateFin || "");
    });
  }

  // =========================================
  // 5) Réécrire les matériels envoyés dans la feuille de restitution
  // =========================================
  const restitutionHeaderMap = getHeaderMap(restitutionSh);
  const restitutionToolsStart = normalizeToolsStartIndex(findToolsStartIndex(restitutionHeaderMap, restitutionSh)); // zero-based index
  const restitutionLastCol = restitutionSh.getLastColumn();
  const restitutionStartColOneBased = restitutionToolsStart + 1;

  // Try to find the corresponding row in the restitution sheet by matricule.
  const restitutionMatriculeCol = getMainColumnIndex('matricule', restitutionHeaderMap, restitutionSh, undefined, 1);
  let restitutionRow = findRowByMatricule(restitutionSh, user.matricule, restitutionMatriculeCol) || user.row || (restitutionSh.getLastRow() + 1);

  // Ensure the restitution sheet has enough rows
  if (restitutionRow > restitutionSh.getMaxRows()) {
    restitutionSh.insertRowsAfter(restitutionSh.getMaxRows(), restitutionRow - restitutionSh.getMaxRows());
  }

  if (restitutionLastCol >= restitutionStartColOneBased) {
    restitutionSh.getRange(restitutionRow, restitutionStartColOneBased, 1, restitutionLastCol - (restitutionStartColOneBased - 1)).clearContent();
  }

  if (user.materiels && user.materiels.length > 0) {
    user.materiels.forEach((m, i) => {
      const colOneBased = restitutionStartColOneBased + i * 5;

      restitutionSh.getRange(restitutionRow, colOneBased).setValue(m.materiel || "");
      restitutionSh.getRange(restitutionRow, colOneBased + 1).setValue(m.fabricant || "");
      restitutionSh.getRange(restitutionRow, colOneBased + 2).setValue(m.modele || "");
      restitutionSh.getRange(restitutionRow, colOneBased + 3).setValue(m.serial || "");
      restitutionSh.getRange(restitutionRow, colOneBased + 4).setValue(m.statut || "Non Rendu");
    });
  }

  // =========================================
  // 6) Si tous les matériels sont "Rendu", définir la `dateFin` (colonne Date fin)
  //    - si `user.dateFin` est fourni, l'utiliser
  //    - sinon écrire la date du jour
  //    - si tous les matériels ne sont pas rendus, effacer la dateFin pour refléter l'état
  // =========================================
  try {
    if (typeof dateFinCol === 'number') {
      if (user.materiels && user.materiels.length > 0) {
        const allRendu = user.materiels.every(m => String(m.statut || '').trim().toLowerCase() === 'rendu');
        if (allRendu) {
          // Prefer user-provided dateFin, otherwise use today's date
          const toWrite = user.dateFin && String(user.dateFin).trim() ? new Date(user.dateFin) : new Date();
          sh.getRange(row, dateFinCol + 1).setValue(toWrite);
        } else {
          // Not all returned: clear dateFin to indicate incomplete
          sh.getRange(row, dateFinCol + 1).setValue('');
        }
      }
    }
  } catch (e) {
    // ne pas échouer la sauvegarde si le calcul de dateFin plante
    Logger.log('Erreur lors de la mise à jour automatique de dateFin: ' + e.message);
  }
}


/* =====================================================
   5) getDashboardAPI()
   Récupère tous les utilisateurs (sans filtre Etat)
===================================================== */
function getDashboardAPI() {

  const sh = getSheet();
  const restitutionSh = getRestitutionSheet();
  const headerMap = getHeaderMap(sh);
  const restitutionHeaderMap = getHeaderMap(restitutionSh);
  const data = sh.getDataRange().getDisplayValues();
  const restitutionData = restitutionSh.getDataRange().getDisplayValues();

  const res = [];
  const toolsStart = normalizeToolsStartIndex(findToolsStartIndex(headerMap, sh));
  const materielsStart = normalizeToolsStartIndex(findToolsStartIndex(restitutionHeaderMap, restitutionSh));
  // Build a map of restitutions indexed by matricule (avoid relying on identical row numbers)
  const restitutionsByMatricule = {};
  const restitutionMatriculeCol2 = getMainColumnIndex('matricule', restitutionHeaderMap, restitutionSh, undefined, 1);

  for (let j = 1; j < restitutionData.length; j++) {
    const matriculeRest = String((restitutionData[j][restitutionMatriculeCol2] || "")).trim();
    if (!matriculeRest) continue;
    restitutionsByMatricule[matriculeRest] = parseDynamicItems(restitutionData[j], materielsStart, [
      'materiel', 'fabricant', 'modele', 'serial', 'statut'
    ]);
  }
  const matriculeCol = getMainColumnIndex('matricule', headerMap, sh, toolsStart, 1);
  const statutCol = getMainColumnIndex('statut', headerMap, sh, toolsStart, 2);
  const nomCol = getMainColumnIndex('nom et prenoms', headerMap, sh, toolsStart, 3);
  const fonctionCol = getMainColumnIndex('fonction', headerMap, sh, toolsStart, 4);
  const rattachementCol = getMainColumnIndex('rattachement', headerMap, sh, toolsStart, 5);
  const dateDepartCol = getMainColumnIndex('date de depart', headerMap, sh, toolsStart, 6);
  const loginCol = getMainColumnIndex('login', headerMap, sh, toolsStart, 7);
  const dateCreationCol = getMainColumnIndex('date de creation', headerMap, sh, toolsStart, 8);
  const deadlineCol = getMainColumnIndex('deadline', headerMap, sh, toolsStart, 9);
  const dateFinCol = getMainColumnIndex('date fin', headerMap, sh, toolsStart, 10);
  const ticketTyfanieCol = getMainColumnIndex('ticket tyfanie', headerMap, sh, toolsStart, 11);
  const statutSuiviCol = getMainColumnIndex('statutsuivi', headerMap, sh, toolsStart, 12);
  const etatCol = getMainColumnIndex('etat', headerMap, sh, toolsStart, 13);

  for (let i = 1; i < data.length; i++) {

    const matricule = (data[i][matriculeCol] || "").trim();

    if (!matricule) continue;

    // =============================
    // Lecture des outils dynamiques
    // =============================
    let outils = [];

    for (let col = toolsStart; col < data[i].length; col += 5) {

      const outil = (data[i][col] || "").trim();
      const ticket = (data[i][col + 1] || "").trim();
      const statut = (data[i][col + 2] || "").trim();
      const dateDebut = (data[i][col + 3] || "").trim();
      const dateFin = (data[i][col + 4] || "").trim();

      if (outil) {
        outils.push({
          outil: outil,
          ticket: ticket || "",
          statut: statut || "En cours",
          dateDebut: dateDebut || "",
          dateFin: dateFin || ""
        });
      }
    }

    // =============================
    // Construire l'objet utilisateur
    // =============================
    res.push({
      row: i + 1,
      matricule: matricule,
      statut: data[i][statutCol],
      nom: data[i][nomCol],
      fonction: data[i][fonctionCol],
      rattachement: data[i][rattachementCol],
      dateDepart: data[i][dateDepartCol],
      // backward compatibility for old frontend keys
      dateIntegration: data[i][dateDepartCol],
      // alias for frontend compatibility
      datedepart: data[i][dateDepartCol],

      login: data[i][loginCol],
      dateCreation: data[i][dateCreationCol],
      deadline: data[i][deadlineCol],

      dateFin: data[i][dateFinCol] || "",
      ticketTyfanie: data[i][ticketTyfanieCol] || "",
      statutSuivi: data[i][statutSuiviCol] || "",
      etat: data[i][etatCol] || "",

      outils: outils,
      materiels: restitutionsByMatricule[matricule] || []
    });
  }

  return res;
}
