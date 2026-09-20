/* ════════════════════════════════════════════════════════════════════
   GEAnérosité — script principal
   Pas besoin de toucher à ce fichier : tout se règle dans js/config.js.

   Astuces pour tester l'affichage sans rien modifier :
     index.html?etat=avant    → avant le tournoi
     index.html?etat=direct   → « en direct »
     index.html?etat=apres    → après le tournoi
     index.html?maintenant=2026-11-20T19:30  → simule une date et une heure
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const $ = (sel, racine = document) => racine.querySelector(sel);
  const $$ = (sel, racine = document) => Array.from(racine.querySelectorAll(sel));
  const html = document.documentElement;
  const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Le menu et les fenêtres marchent même si config.js a un problème
  initMenu();
  initModales();
  initBandeaux();

  if (typeof CONFIG === "undefined" || !CONFIG) {
    const erreur = $("#erreur-config");
    if (erreur) erreur.hidden = false;
    console.error("GEAnérosité : js/config.js est introuvable ou contient une erreur (virgule ou guillemet oublié ?).");
    return;
  }

  const C = CONFIG;
  const L = C.liens || {};
  const K = C.compteurs || {};
  const TZ = "Europe/Paris";
  const params = new URLSearchParams(window.location.search);
  const brouillon = !!C.modeBrouillon;


  /* ───────────────────── Petits outils ───────────────────── */

  function esc(valeur) {
    return String(valeur ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function lire(chemin) {
    return chemin.split(".").reduce((objet, cle) => (objet == null ? undefined : objet[cle]), C);
  }
  function nombre(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  const texte = (v) => String(v ?? "").trim();

  const formatNombre = new Intl.NumberFormat("fr-FR");
  const formatEuros0 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuros2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sansEspaceFine = (s) => s.replace(/[\u202F\u2009]/g, "\u00A0"); // nos polices n'ont pas l'espace fine
  function euros(v) {
    const n = Math.round((Number(v) || 0) * 100) / 100;
    return sansEspaceFine(Number.isInteger(n) ? formatEuros0.format(n) : formatEuros2.format(n));
  }
  const entier = (v) => sansEspaceFine(formatNombre.format(Math.round(Number(v) || 0)));

  // « à confirmer » : une note manuscrite, visible par tout le monde
  function aConfirmer(mot) {
    return `<span class="a-confirmer"${brouillon ? " data-exemple" : ""}>${esc(mot || "à confirmer")}</span>`;
  }

  // Dates : "2026-11-20T18:00" → objet Date (heure de Paris)
  function lireDate(v) {
    if (!v) return null;
    let s = texte(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += "T12:00:00";
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ":00";
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(s)) s += "+01:00";
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  const dates = C.dates || {};
  const debut = lireDate(dates.debutTournoi);
  const fin = lireDate(dates.finTournoi) || (debut ? new Date(debut.getTime() + 4 * 3600 * 1000) : null);
  const dateConfirmee = !!dates.dateConfirmee;

  // Horloge (simulable avec ?maintenant=2026-11-20T19:30)
  let decalage = 0;
  const simulation = lireDate(params.get("maintenant"));
  if (simulation) decalage = simulation.getTime() - Date.now();
  const maintenant = () => new Date(Date.now() + decalage);

  const fJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const fJourCourt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const fHeure = new Intl.DateTimeFormat("fr-FR", { hour: "numeric", minute: "2-digit", hourCycle: "h23", timeZone: TZ });
  const fCle = new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });
  const cleJour = (d) => fCle.format(d);
  const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function heure(d, avecMinutes) {
    const parts = fHeure.formatToParts(d);
    const h = Number((parts.find((p) => p.type === "hour") || {}).value);
    const m = (parts.find((p) => p.type === "minute") || {}).value || "00";
    return m === "00" && !avecMinutes ? `${h}h` : `${h}h${m}`;
  }
  function formaterDate(d, format) {
    switch (format) {
      case "Jour": return majuscule(fJour.format(d));
      case "jourCourt": return fJourCourt.format(d);
      case "heure": return heure(d, false);
      default: return fJour.format(d);
    }
  }

  // Avant / pendant / après le tournoi
  function etatForce() {
    const v = texte(params.get("etat") || C.forcerEtat).toLowerCase().replace("è", "e");
    return ["avant", "direct", "apres"].includes(v) ? v : "";
  }
  function etatActuel() {
    const force = etatForce();
    if (force) return force;
    if (!debut) return "avant";
    const t = maintenant();
    if (t < debut) return "avant";
    if (fin && t < fin) return "direct";
    return "apres";
  }
  const pronosticClos = () => etatActuel() !== "avant";

  // Espaces insécables à la française
  function typographie(racine) {
    if (!racine) return;
    const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && !n.parentElement.closest("script, style, code") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const noeuds = [];
    while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
    noeuds.forEach((n) => {
      const avant = n.nodeValue;
      const apres = avant
        .replace(/ ([!?;»])/g, "\u00A0$1")
        .replace(/« /g, "«\u00A0")
        .replace(/ :/g, "\u00A0:")
        .replace(/(\d) (€|%|kg\b)/g, "$1\u00A0$2");
      if (apres !== avant) n.nodeValue = apres;
    });
  }

  function quandVisible(el, action, seuil) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { action(el); return; }
    const io = new IntersectionObserver((entrees) => {
      if (entrees.some((e) => e.isIntersecting)) { io.disconnect(); action(el); }
    }, { threshold: seuil || 0.25 });
    io.observe(el);
  }

  function secoursImages(racine, selecteurParent, remplacement) {
    $$("img", racine).forEach((img) => {
      img.addEventListener("error", () => {
        const parent = img.closest(selecteurParent);
        console.warn("GEAnérosité : image introuvable → " + img.getAttribute("src"));
        if (parent) parent.innerHTML = remplacement;
      }, { once: true });
    });
  }


  /* ───────────────────── Les liens (jamais de faux lien) ───────────────────── */

  const NOMS_LIENS = {
    cagnotte: "la cagnotte", inscriptionTournoi: "l'inscription au tournoi", pronostic: "le pronostic",
    tombola: "la tombola", live: "le live", instagram: "Instagram", email: "l'adresse e-mail",
  };

  function urlValide(cle) {
    const v = texte(L[cle]);
    if (!v) return "";
    if (cle === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v : "";
    return /^https:\/\/[^\s]+\.[^\s]+$/.test(v) ? v : "";
  }

  function appliquerLiens(racine = document) {
    $$("[data-lien]", racine).forEach((a) => {
      const cle = a.dataset.lien;
      const url = urlValide(cle);
      if (url) {
        a.href = cle === "email" ? "mailto:" + url : url;
        if (cle !== "email") { a.target = "_blank"; a.rel = "noopener"; }
        if (a.hasAttribute("data-afficher")) a.textContent = url;
        a.classList.remove("est-inactif");
        a.removeAttribute("aria-disabled");
        a.removeAttribute("data-exemple");
        a.removeAttribute("title");
      } else {
        a.removeAttribute("href");
        a.removeAttribute("target");
        a.classList.add("est-inactif");
        a.setAttribute("aria-disabled", "true");
        a.setAttribute("title", "Lien bientôt disponible");
        if (brouillon) a.setAttribute("data-exemple", "");
        if (a.hasAttribute("data-afficher")) a.textContent = "adresse bientôt disponible";
      }
    });

    $$("[data-destination]", racine).forEach((p) => {
      const cle = p.dataset.destination;
      const url = urlValide(cle);
      if (url) {
        let hote = "";
        try { hote = cle === "email" ? "" : new URL(url).hostname.replace(/^www\./, ""); } catch (err) { hote = ""; }
        p.innerHTML = cle === "email"
          ? `Ouvre votre messagerie : <strong>${esc(url)}</strong>`
          : (/(^|\.)helloasso\.com$/.test(hote)
            ? "🔒 Paiement sécurisé sur <strong>HelloAsso</strong>, au profit du projet"
            : `Ouvre <strong>${esc(hote)}</strong> dans un nouvel onglet`);
        p.classList.remove("destination-manquante");
        p.removeAttribute("data-exemple");
      } else {
        p.innerHTML = brouillon
          ? `⚠️ Lien à ajouter dans <code>js/config.js</code> → <code>liens.${esc(cle)}</code>`
          : `Lien bientôt disponible pour ${esc(NOMS_LIENS[cle] || "cette action")}.`;
        p.classList.add("destination-manquante");
        if (brouillon) p.setAttribute("data-exemple", "");
      }
    });
  }

  function appliquerTextes() {
    $$("[data-bind]").forEach((el) => {
      const v = lire(el.dataset.bind);
      if (v !== undefined && v !== null && v !== "") el.textContent = v;
    });
  }


  /* ───────────────────── Le tableau d'affichage ───────────────────── */

  const montant = Math.max(0, nombre(K.cagnotte) || 0);
  const objectif = Math.max(1, nombre(K.objectif) || 1);
  const pourcent = (montant / objectif) * 100;
  const pourcentTexte = Math.floor(pourcent) + "\u00A0%";

  const SEGMENTS = {
    a: "8,5 12,1 38,1 42,5 38,9 12,9",
    b: "45,8 49,12 49,38 45,42 41,38 41,12",
    c: "45,48 49,52 49,78 45,82 41,78 41,52",
    d: "8,85 12,81 38,81 42,85 38,89 12,89",
    e: "5,48 9,52 9,78 5,82 1,78 1,52",
    f: "5,8 9,12 9,38 5,42 1,38 1,12",
    g: "8,45 12,41 38,41 42,45 38,49 12,49",
  };
  const ALLUMES = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg", "-": "g", " ": "" };
  const NS = "http://www.w3.org/2000/svg";

  function creerChiffre() {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 50 90");
    svg.setAttribute("class", "seg7");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    Object.keys(SEGMENTS).forEach((nom) => {
      const p = document.createElementNS(NS, "polygon");
      p.setAttribute("points", SEGMENTS[nom]);
      p.setAttribute("data-s", nom);
      svg.appendChild(p);
    });
    return svg;
  }
  function afficherChiffre(svg, c) {
    if (svg.getAttribute("data-v") === c) return;
    svg.setAttribute("data-v", c);
    const allumes = ALLUMES[c] || "";
    svg.querySelectorAll("polygon").forEach((p) => p.classList.toggle("on", allumes.includes(p.getAttribute("data-s"))));
  }
  function construireEcran(groupes) {
    const zone = $("#lcd-chiffres");
    zone.textContent = "";
    groupes.forEach((g, i) => {
      if (i > 0) {
        const sep = document.createElement("span");
        sep.className = "lcd-sep";
        sep.setAttribute("aria-hidden", "true");
        zone.appendChild(sep);
      }
      const bloc = document.createElement("div");
      bloc.className = "lcd-groupe";
      const nums = document.createElement("div");
      nums.className = "lcd-nums";
      for (let k = 0; k < (g.nb || 2); k++) nums.appendChild(creerChiffre());
      bloc.appendChild(nums);
      if (g.label) {
        const label = document.createElement("span");
        label.className = "lcd-label";
        label.setAttribute("aria-hidden", "true");
        label.textContent = g.label;
        bloc.appendChild(label);
      }
      zone.appendChild(bloc);
    });
  }
  function majEcran(valeurs) {
    $$("#lcd-chiffres .lcd-groupe").forEach((bloc, i) => {
      const svgs = $$(".seg7", bloc);
      const t = String(valeurs[i] ?? "").padStart(svgs.length, " ").slice(-svgs.length);
      svgs.forEach((svg, k) => afficherChiffre(svg, t[k]));
    });
  }
  const deux = (n) => String(n).padStart(2, "0");
  const point = (t) => (/[.!?…]$/.test(t) ? "" : ".");

  function ledNombre(el, valeur) {
    const t = String(Math.max(0, Math.round(Number(valeur) || 0)));
    el.textContent = "";
    for (const c of t) {
      const svg = creerChiffre();
      el.appendChild(svg);
      afficherChiffre(svg, c);
    }
  }

  function rendreLedCagnotte() {
    const n = 20;
    let pleins = Math.round((Math.min(100, pourcent) / 100) * n);
    if (montant > 0) pleins = Math.max(1, pleins);
    $("#led-barre").innerHTML = Array.from({ length: n }, (_, i) => `<span class="led${i < pleins ? " allumee" : ""}"></span>`).join("");
    $("#panneau-pourcent").textContent = pourcentTexte;
    $("#panneau-montant").textContent = euros(montant);
    $("#panneau-objectif").textContent = euros(objectif);
  }

  let etatCourant = null;
  const titreOriginal = document.title;

  function rendreEtat(e) {
    html.dataset.etat = e;
    const titre = $("#panneau-titre");
    const message = $("#panneau-message");
    const zone = $("#lcd-chiffres");
    const agenda = $("#panneau-agenda");
    const boutonLive = $("#panneau-live");

    if (e === "avant") {
      titre.textContent = "Coup d'envoi dans";
      construireEcran([{ label: "jours" }, { label: "heures" }, { label: "min" }, { label: "sec" }]);
      if (debut) {
        majEcran(["--", "--", "--", "--"]);
        message.innerHTML = `<p class="panneau-date">${esc(formaterDate(debut, "Jour"))} à ${esc(heure(debut))}${dateConfirmee ? "" : " " + aConfirmer("date provisoire")}</p>`;
        zone.setAttribute("aria-label", `Compte à rebours jusqu'au coup d'envoi, le ${formaterDate(debut, "jour")} à ${heure(debut)}`);
        if (agenda) agenda.hidden = false;
      } else {
        majEcran(["--", "--", "--", "--"]);
        message.innerHTML = `<span class="sticker sticker-jaune"${brouillon ? " data-exemple" : ""}>Date à confirmer</span><p class="panneau-date">La date du tournoi sera annoncée ici.</p>`;
        zone.removeAttribute("aria-label");
        if (agenda) agenda.hidden = true;
      }
      if (boutonLive) boutonLive.hidden = true;
    } else if (e === "direct") {
      titre.innerHTML = '<span class="point-direct" aria-hidden="true"></span>En direct';
      construireEcran([{ label: "h", nb: 1 }, { label: "min" }, { label: "sec" }]);
      message.innerHTML = `<p class="panneau-date">de tournoi déjà joué${fin ? `, fin prévue à ${esc(heure(fin))}` : ""}.</p>`;
      zone.setAttribute("aria-label", "Le tournoi est en cours");
      if (agenda) agenda.hidden = true;
      if (boutonLive) { boutonLive.hidden = false; boutonLive.textContent = "Regarder le live"; }
    } else {
      titre.textContent = "Merci !";
      construireEcran([]);
      const champion = championNom();
      message.innerHTML = champion
        ? `<p class="panneau-date">🏆 Champion du tournoi : <strong>${esc(champion)}</strong></p>`
        : `<p class="panneau-date">Le tournoi est terminé. Merci à toutes et à tous !</p>`;
      zone.removeAttribute("aria-label");
      if (agenda) agenda.hidden = true;
      if (boutonLive) { boutonLive.hidden = false; boutonLive.textContent = "Revoir le live"; }
    }

    document.title = e === "direct" ? "🔴 EN DIRECT : " + titreOriginal : titreOriginal;
    appliquerLiens($("#panneau-live") ? $("#panneau-live").parentElement : document);
    rendreLive(e);
    rendrePronosticEtat();
    typographie($(".panneau"));
  }

  function tic() {
    const e = etatActuel();
    if (e !== etatCourant) { etatCourant = e; rendreEtat(e); }
    const t = maintenant().getTime();
    if (e === "avant" && debut) {
      let s = Math.max(0, Math.floor((debut.getTime() - t) / 1000));
      const j = Math.floor(s / 86400); s -= j * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      majEcran([deux(Math.min(j, 99)), deux(h), deux(m), deux(s)]);
    } else if (e === "direct" && debut) {
      let s = Math.max(0, Math.floor((t - debut.getTime()) / 1000));
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      majEcran([String(Math.min(h, 9)), deux(m), deux(s)]);
    }
  }

  function initAgenda() {
    if (!debut || !fin) return;
    const asso = texte(lire("association.nom")) || "l'association";
    const titre = "GEAnérosité : tournoi FIFA solidaire";
    const details = `Tournoi FIFA en live au profit de ${asso}.` + (urlValide("live") ? " Le live : " + urlValide("live") : "");
    const ics = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const google = new URLSearchParams({
      action: "TEMPLATE", text: titre, details, location: urlValide("live") || "En ligne",
      dates: `${ics(debut)}/${ics(fin)}`,
    });
    $("#agenda-google").href = "https://calendar.google.com/calendar/render?" + google.toString();
    const echap = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    const fichier = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GEAnerosite//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT", "UID:geanerosite-" + ics(debut) + "@geanerosite",
      "DTSTAMP:" + ics(new Date()), "DTSTART:" + ics(debut), "DTEND:" + ics(fin),
      "SUMMARY:" + echap(titre), "DESCRIPTION:" + echap(details), "LOCATION:" + echap(urlValide("live") || "En ligne"),
      "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:" + echap("Le tournoi commence dans 30 minutes !"), "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    try {
      $("#agenda-ics").href = URL.createObjectURL(new Blob([fichier], { type: "text/calendar;charset=utf-8" }));
    } catch (err) {
      $("#agenda-ics").hidden = true;
    }
  }


  /* ───────────────────── Les compteurs ───────────────────── */

  function rendreCompteurs() {
    const items = [
      { emoji: "💰", label: "Cagnotte", valeur: montant, unite: "€", uniteLongue: "euros", principal: true },
      { emoji: "🥫", label: "Denrées collectées", valeur: nombre(K.denreesKg) || 0, unite: "kg", uniteLongue: "kilos" },
      { emoji: "👕", label: "Vêtements collectés", valeur: nombre(K.vetements) || 0, unite: "", uniteLongue: "vêtements" },
      { emoji: "🎮", label: "Participants au tournoi", valeur: nombre(K.participantsTournoi) || 0, unite: "", uniteLongue: "joueurs inscrits" },
      { emoji: "🎟️", label: "Participants à la tombola", valeur: nombre(K.participantsTombola) || 0, unite: "", uniteLongue: "participants" },
    ];
    $("#tableau-scores").innerHTML = items.map((it) => `
      <div class="score${it.principal ? " score-principal" : ""}">
        <p class="score-label"><span aria-hidden="true">${it.emoji}</span> ${esc(it.label)}</p>
        <p class="score-valeur">
          <span class="score-led" data-valeur="${it.valeur}" aria-hidden="true"></span>
          ${it.unite ? `<span class="score-unite" aria-hidden="true">${esc(it.unite)}</span>` : ""}
          <span class="sr-only">${esc(entier(it.valeur))} ${esc(it.uniteLongue)}</span>
        </p>
      </div>`).join("");
    $$("#tableau-scores .score-led").forEach((el) => ledNombre(el, el.dataset.valeur));
    const maj = texte(K.miseAJour);
    $("#maj-compteurs").hidden = !maj;
  }


  /* ───────────────────── La cagnotte : le parcours vers le but ───────────────────── */

  const paliers = (Array.isArray(C.paliers) ? C.paliers : [])
    .filter((p) => p && nombre(p.montant) !== null)
    .map((p) => Object.assign({}, p, { montant: Number(p.montant) }))
    .sort((a, b) => a.montant - b.montant);

  function rendreCagnotte() {
    $("#jauge-montant").textContent = euros(montant);
    $("#jauge-objectif").textContent = euros(objectif);
    $("#jauge-pourcent").textContent = pourcentTexte;
    const compteur = $("#compteur");
    compteur.setAttribute("aria-valuemax", String(Math.max(objectif, montant)));
    compteur.setAttribute("aria-valuenow", String(montant));
    compteur.setAttribute("aria-valuetext", `${euros(montant)} récoltés sur ${euros(objectif)}, soit ${pourcentTexte} de l'objectif`);

    const n = paliers.length;
    const bilan = $("#jauge-bilan");
    if (!n) { bilan.hidden = true; return; }

    // Hauteur atteinte sur le terrain (−0,5 = coup d'envoi, n−0,5 = but)
    let niveau;
    if (montant <= 0) niveau = -0.5;
    else if (montant < paliers[0].montant) niveau = -0.5 + 0.5 * (montant / paliers[0].montant);
    else {
      niveau = n - 0.5;
      for (let i = 0; i < n - 1; i++) {
        if (montant < paliers[i + 1].montant) { niveau = i + (montant - paliers[i].montant) / (paliers[i + 1].montant - paliers[i].montant); break; }
      }
    }
    const iProchain = paliers.findIndex((p) => montant < p.montant);
    const nbDebloques = paliers.filter((p) => montant >= p.montant).length;
    const tout = montant >= paliers[n - 1].montant;
    const ligneBallon = tout ? -1 : Math.max(0, Math.min(n - 1, Math.floor(niveau + 0.5)));

    $("#paliers").innerHTML = paliers.map((p, i) => {
      const debloque = montant >= p.montant;
      const prochain = i === iProchain;
      const fill = Math.max(0, Math.min(1, niveau - (i - 0.5)));
      const tier = i < n * 0.42 ? 1 : i < n * 0.72 ? 2 : 3;
      const etat = debloque ? "est-debloque" : prochain ? "est-prochain" : "est-verrouille";
      const tampon = debloque ? "Débloqué" : prochain ? "Prochain objectif" : "À débloquer";
      const ballon = i === ligneBallon ? '<svg class="ballon" aria-hidden="true" focusable="false"><use href="#ballon"></use></svg>' : "";
      let progression = "";
      if (prochain) {
        const precedent = i > 0 ? paliers[i - 1].montant : 0;
        const k = Math.max(0, Math.min(1, (montant - precedent) / (p.montant - precedent)));
        progression = `<div class="palier-progression">
            <div class="mini-barre" aria-hidden="true"><span style="--p:${k.toFixed(3)}"></span></div>
            <p class="palier-reste">Plus que ${euros(p.montant - montant)} pour le débloquer</p>
          </div>`;
      }
      return `<li class="palier tier-${tier} ${etat}" style="--fill:${fill.toFixed(3)};--ordre:${i}">
          <div class="bande" aria-hidden="true"><span class="bande-trace"></span><span class="bande-ligne"></span>${ballon}</div>
          <div class="palier-carte">
            <div class="palier-haut">
              <span class="palier-montant">${euros(p.montant)}</span>
              <span class="tampon">${tampon}</span>
            </div>
            <p class="palier-texte">${p.emoji ? `<span class="palier-emoji" aria-hidden="true">${esc(p.emoji)}</span>` : ""}${esc(p.texte)} ${p.aConfirmer ? aConfirmer("à confirmer") : ""}</p>
            ${progression}
          </div>
        </li>`;
    }).reverse().join("");

    if (tout) {
      const but = $("#but");
      but.classList.add("marque");
      but.innerHTML = '<span class="but-texte">But !</span>';
    }

    // L'animation démarre quand le ballon (ou le but, si tout est débloqué) arrive à l'écran
    const liste = $("#paliers");
    const ballonEl = liste.querySelector(".ballon");
    const cible = (ballonEl && ballonEl.closest(".palier")) || liste.firstElementChild || liste;
    quandVisible(cible, () => liste.classList.add("revele"), 0.4);

    if (iProchain === -1) {
      bilan.innerHTML = "<strong>Tous les objectifs sont débloqués !</strong> Merci : le live va être mémorable.";
    } else if (nbDebloques === 0) {
      bilan.innerHTML = `<strong>Premier objectif à ${euros(paliers[0].montant)}.</strong> Il reste ${euros(paliers[0].montant - montant)} pour le débloquer.`;
    } else {
      bilan.innerHTML = `<strong>${nbDebloques} objectif${nbDebloques > 1 ? "s" : ""} débloqué${nbDebloques > 1 ? "s" : ""} sur ${n}.</strong> Prochain à ${euros(paliers[iProchain].montant)} : plus que ${euros(paliers[iProchain].montant - montant)}.`;
    }
    bilan.hidden = false;
  }


  /* ───────────────────── Le tournoi ───────────────────── */

  const T = C.tournoi || {};
  const participants = Array.isArray(T.participants) ? T.participants : [];
  const matchs = Array.isArray(T.matchs) ? T.matchs : [];
  const groupes = Array.isArray(T.groupes) ? T.groupes : [];
  const MAILLOTS = [
    { fond: "#ff4f9a", texte: "#16161b" }, { fond: "#2c55d4", texte: "#ffffff" },
    { fond: "#ffd43b", texte: "#16161b" }, { fond: "#1f9d55", texte: "#ffffff" },
    { fond: "#ff8a3d", texte: "#16161b" }, { fond: "#8b5cf6", texte: "#ffffff" },
    { fond: "#00b5d8", texte: "#16161b" }, { fond: "#e5383b", texte: "#ffffff" },
  ];

  function joueur(ref) {
    const num = typeof ref === "number" ? ref : (/^\d+$/.test(texte(ref)) ? Number(ref) : null);
    if (num) {
      const p = participants[num - 1] || {};
      const nom = texte(p.nom);
      return { num, nom: nom || "Joueur " + num, equipe: texte(p.equipe), connu: !!nom };
    }
    return { num: null, nom: texte(ref) || "À déterminer", equipe: "", connu: false };
  }
  function lireScore(m) {
    const s = texte(m && m.score).match(/^(\d+)\s*[-–:]\s*(\d+)$/);
    if (!s) return null;
    const r = { a: Number(s[1]), b: Number(s[2]) };
    const t = texte(m.tab).match(/^(\d+)\s*[-–:]\s*(\d+)$/);
    if (t) { r.tabA = Number(t[1]); r.tabB = Number(t[2]); }
    return r;
  }
  function gagnant(m) {
    const s = lireScore(m);
    if (!s) return null;
    if (s.a !== s.b) return s.a > s.b ? "a" : "b";
    if (s.tabA != null && s.tabA !== s.tabB) return s.tabA > s.tabB ? "a" : "b";
    return "nul";
  }
  const estFinale = (m) => /^finale/i.test(texte(m.phase));
  function championNom() {
    const f = matchs.find(estFinale);
    if (!f) return "";
    const g = gagnant(f);
    return g === "a" || g === "b" ? joueur(f[g]).nom : "";
  }

  function classement(groupe) {
    const lignes = (groupe.joueurs || []).map((ref, i) => ({ ref, ordre: i, j: 0, g: 0, n: 0, p: 0, bp: 0, bc: 0, pts: 0 }));
    const parRef = new Map(lignes.map((l) => [String(l.ref), l]));
    matchs.filter((m) => texte(m.phase) === texte(groupe.nom)).forEach((m) => {
      const s = lireScore(m);
      if (!s) return;
      const A = parRef.get(String(m.a));
      const B = parRef.get(String(m.b));
      if (!A || !B) return;
      A.j++; B.j++; A.bp += s.a; A.bc += s.b; B.bp += s.b; B.bc += s.a;
      if (s.a > s.b) { A.g++; B.p++; A.pts += 3; }
      else if (s.a < s.b) { B.g++; A.p++; B.pts += 3; }
      else { A.n++; B.n++; A.pts++; B.pts++; }
    });
    return lignes.sort((x, y) => y.pts - x.pts || (y.bp - y.bc) - (x.bp - x.bc) || y.bp - x.bp || x.ordre - y.ordre);
  }

  const TOURS = [
    { test: /^(huiti|8e)/i, nom: "Huitièmes de finale" },
    { test: /^quart/i, nom: "Quarts de finale" },
    { test: /^demi/i, nom: "Demi-finales" },
    { test: /^petite/i, nom: "Petite finale" },
    { test: /^finale/i, nom: "Finale" },
  ];
  const estPhaseFinale = (m) => TOURS.some((t) => t.test.test(texte(m.phase)));

  function rendreTournoi() {
    // Les informations pratiques
    const live = urlValide("live");
    let hoteLive = "";
    try { hoteLive = live ? new URL(live).hostname.replace(/^www\./, "") : ""; } catch (err) { hoteLive = ""; }
    const infos = [
      { emoji: "📅", valeur: debut ? majuscule(formaterDate(debut, "jourCourt")) + (dateConfirmee ? "" : " " + aConfirmer("date provisoire")) : aConfirmer("date à confirmer") },
      { emoji: "🕖", valeur: debut ? `${heure(debut)}${fin ? " – " + heure(fin) : ""}` : aConfirmer("horaire à confirmer") },
      { emoji: "📍", valeur: texte(T.lieu) ? esc(T.lieu) : aConfirmer("lieu à confirmer") },
      { emoji: "🎮", valeur: texte(T.jeu) ? esc(T.jeu) : aConfirmer("jeu à confirmer") },
      { emoji: "🏟️", valeur: texte(T.format) ? esc(T.format) : aConfirmer("format à confirmer") },
      { emoji: "📺", valeur: live ? `Live sur ${esc(hoteLive)}` : aConfirmer("lien du live à venir") },
    ];
    $("#infos-tournoi").innerHTML = infos.map((i) => `<li><span aria-hidden="true">${i.emoji}</span> ${i.valeur}</li>`).join("");

    // Les joueurs
    const aucunNom = participants.every((p) => !texte(p.nom));
    $("#note-tableau").hidden = !aucunNom;
    $("#joueurs").innerHTML = participants.map((p, i) => {
      const num = i + 1;
      const j = joueur(num);
      const m = MAILLOTS[i % MAILLOTS.length];
      return `<li class="joueur${j.connu ? "" : " est-inconnu"}">
          <span class="joueur-num">${num}</span>
          <svg class="joueur-maillot" viewBox="0 0 100 92" aria-hidden="true" focusable="false">
            <path d="M31 6 L43 2 Q50 11 57 2 L69 6 L94 21 L84 39 L74 33 L74 88 L26 88 L26 33 L16 39 L6 21 Z" fill="${m.fond}" stroke="#16161b" stroke-width="4" stroke-linejoin="round"/>
            <text x="50" y="74" text-anchor="middle" font-family="Big Shoulders, Arial Narrow, sans-serif" font-weight="900" font-size="40" fill="${m.texte}">${num}</text>
          </svg>
          <p class="joueur-nom">${j.connu ? esc(j.nom) : aConfirmer("nom à venir")}</p>
          <p class="joueur-equipe">${j.equipe ? esc(j.equipe) : aConfirmer("équipe à choisir")}</p>
        </li>`;
    }).join("");

    // Les groupes et leur classement
    const blocGroupes = $("#bloc-groupes");
    if (!groupes.length) { blocGroupes.hidden = true; } else {
      $("#groupes").innerHTML = groupes.map((g) => {
        const lignes = classement(g);
        return `<div class="groupe">
            <h4 class="groupe-titre">${esc(g.nom)}</h4>
            <table>
              <thead><tr><th scope="col"><span class="sr-only">Position</span>#</th><th scope="col">Joueur</th><th scope="col" title="Matchs joués">J</th><th scope="col">Pts</th><th scope="col" title="Différence de buts">+/−</th></tr></thead>
              <tbody>${lignes.map((l, i) => {
                const j = joueur(l.ref);
                const diff = l.bp - l.bc;
                return `<tr><td>${i + 1}</td><td>${esc(j.nom)}</td><td>${l.j}</td><td class="pts">${l.pts}</td><td>${diff > 0 ? "+" : ""}${diff}</td></tr>`;
              }).join("")}</tbody>
            </table>
          </div>`;
      }).join("");
    }

    // La phase finale
    const blocFinal = $("#bloc-final");
    const finales = matchs.filter(estPhaseFinale);
    const dernier = paliers.length ? paliers[paliers.length - 1] : null;
    if (!finales.length && !dernier) { blocFinal.hidden = true; } else {
      const colonnes = [];
      TOURS.forEach((tour) => {
        const liste = finales.filter((m) => tour.test.test(texte(m.phase)));
        if (liste.length) colonnes.push({ nom: tour.nom, liste });
      });
      const champion = championNom();
      let sortie = champion ? `<p class="champion"><span aria-hidden="true">🏆</span> Champion : ${esc(champion)}</p>` : "";
      sortie += colonnes.map((col) => `<div class="tour">
          <h4 class="tour-titre">${esc(col.nom)}</h4>
          <div class="tour-matchs">${col.liste.map((m) => carteMatch(m)).join("")}</div>
        </div>`).join("");
      if (dernier) {
        const ouvert = montant >= dernier.montant;
        sortie += `<div class="tour">
            <h4 class="tour-titre">Bonus</h4>
            <div class="tour-matchs"><div class="match-carte match-bonus">
              <p class="match-ligne">${ouvert ? "🔓 Débloqué" : "🔒 Si la cagnotte atteint " + euros(dernier.montant)}</p>
              <p class="match-info">${esc(dernier.texte)}</p>
            </div></div>
          </div>`;
      }
      $("#tableau-final").innerHTML = sortie;
      $("#tableau-final").style.setProperty("--tours", Math.max(1, colonnes.length + (dernier ? 1 : 0)));
    }

    // Tous les matchs, par phase
    const phases = [];
    matchs.forEach((m) => { const p = texte(m.phase) || "Matchs"; if (!phases.includes(p)) phases.push(p); });
    $("#matchs").innerHTML = phases.map((p) => `<div class="phase-bloc">
        <h4>${esc(p)}</h4>
        <ul class="phase-liste">${matchs.filter((m) => (texte(m.phase) || "Matchs") === p).map((m) => {
          const a = joueur(m.a), b = joueur(m.b), s = lireScore(m);
          return `<li><span>${esc(a.nom)} – ${esc(b.nom)}</span><span class="m-score">${s ? `${s.a} – ${s.b}${s.tabA != null ? ` (${s.tabA}–${s.tabB} t.a.b.)` : ""}` : (texte(m.heure) || "à venir")}</span></li>`;
        }).join("")}</ul>
      </div>`).join("");

    rendreProchainMatch();
  }

  function carteMatch(m) {
    const a = joueur(m.a), b = joueur(m.b), s = lireScore(m), g = gagnant(m);
    const ligne = (j, score, gagne) => `<p class="match-ligne${gagne ? " gagne" : ""}"><span>${esc(j.nom)}</span><span class="match-score">${score}</span></p>`;
    const info = s && s.tabA != null ? `Tirs au but : ${s.tabA} – ${s.tabB}` : (texte(m.heure) ? "Coup d'envoi : " + esc(m.heure) : "Horaire à confirmer");
    return `<div class="match-carte">
        ${ligne(a, s ? s.a : "–", g === "a")}
        ${ligne(b, s ? s.b : "–", g === "b")}
        <p class="match-info">${info}</p>
      </div>`;
  }

  function rendreProchainMatch() {
    const bloc = $("#prochain-match");
    const prochain = matchs.find((m) => !lireScore(m));
    if (!matchs.length) { bloc.hidden = true; return; }
    if (!prochain) {
      const champion = championNom();
      bloc.innerHTML = `<p class="pm-haut"><span class="pm-etiquette">Tournoi terminé</span></p>
        <p class="pm-fini">${champion ? `🏆 Champion : <strong>${esc(champion)}</strong>` : "Tous les matchs ont été joués. Merci à tous !"}</p>`;
      return;
    }
    const a = joueur(prochain.a), b = joueur(prochain.b);
    bloc.innerHTML = `<p class="pm-haut">
        <span class="pm-etiquette">Prochain match</span>
        <span class="pm-phase">${esc(texte(prochain.phase) || "Tournoi")}</span>
      </p>
      <div class="pm-affiche">
        <div><p class="pm-nom">${esc(a.nom)}</p><p class="pm-equipe">${a.equipe ? esc(a.equipe) : "équipe à choisir"}</p></div>
        <span class="pm-vs" aria-hidden="true">VS</span>
        <div><p class="pm-nom">${esc(b.nom)}</p><p class="pm-equipe">${b.equipe ? esc(b.equipe) : "équipe à choisir"}</p></div>
      </div>
      <p class="pm-heure">${texte(prochain.heure) ? "Coup d'envoi : " + esc(prochain.heure) : (debut ? "Le " + esc(formaterDate(debut, "jourCourt")) + " à " + esc(heure(debut)) : "Date " + aConfirmer("à confirmer"))}</p>`;
  }

  // Le lecteur du live ne se charge que si on appuie dessus
  function rendreLive(e) {
    const ecran = $("#live-ecran");
    if (!ecran || ecran.querySelector("iframe")) return;
    const live = urlValide("live");
    let hote = "";
    try { hote = live ? new URL(live).hostname.replace(/^www\./, "") : ""; } catch (err) { hote = ""; }
    const twitch = /(^|\.)twitch\.tv$/.test(hote);
    ecran.classList.remove("a-info");

    if (!live) {
      ecran.classList.add("a-info");
      ecran.innerHTML = `<div class="live-info">
          <p class="live-info-titre">Le live s'affichera ici</p>
          <p>Le lien de diffusion sera publié dès qu'il sera prêt.</p>
          ${brouillon ? '<p class="destination destination-manquante" data-exemple>⚠️ Lien à ajouter dans <code>js/config.js</code> → <code>liens.live</code></p>' : ""}
        </div>`;
      return;
    }
    const jourJ = e === "direct" || (e === "avant" && debut && cleJour(maintenant()) === cleJour(debut));
    if (twitch && jourJ) {
      ecran.innerHTML = `<button class="live-lancer" type="button">
          <span class="live-play" aria-hidden="true"></span>
          <span class="live-lancer-texte">${e === "direct" ? "C'est parti : lancer le live" : "Lancer le lecteur du live"}</span>
        </button>`;
      $(".live-lancer", ecran).addEventListener("click", () => chargerLecteur(ecran, live));
      return;
    }
    const apres = e === "apres";
    ecran.classList.add("a-info");
    ecran.innerHTML = `<div class="live-info">
        <p class="live-info-titre">${apres ? "Le tournoi est terminé. Merci !" : e === "direct" ? "Le live est en cours" : "Rendez-vous le jour du tournoi"}</p>
        <p>${apres ? "Le replay peut rester disponible quelques jours sur la chaîne." : "Suivez la chaîne pour être prévenu du lancement."}</p>
        <a class="bouton bouton-rouge" href="${esc(live)}" target="_blank" rel="noopener">${apres ? "Revoir le live" : "Ouvrir le live"}</a>
      </div>`;
  }
  function chargerLecteur(ecran, live) {
    let chaine = "";
    try { chaine = new URL(live).pathname.split("/").filter(Boolean)[0] || ""; } catch (err) { chaine = ""; }
    const domaine = window.location.hostname;
    if (!chaine || !domaine) {
      ecran.classList.add("a-info");
      ecran.innerHTML = `<div class="live-info">
          <p class="live-info-titre">Le lecteur s'affiche seulement sur le site en ligne</p>
          <p>Twitch bloque son lecteur quand la page est ouverte depuis un fichier de l'ordinateur.</p>
          <a class="bouton bouton-rouge" href="${esc(live)}" target="_blank" rel="noopener">Ouvrir le live</a>
        </div>`;
      return;
    }
    ecran.classList.remove("a-info");
    ecran.innerHTML = `<iframe class="live-iframe" src="https://player.twitch.tv/?channel=${encodeURIComponent(chaine)}&parent=${encodeURIComponent(domaine)}&autoplay=true" title="Live du tournoi" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }


  /* ───────────────────── Le pronostic ───────────────────── */

  function rendrePronostic() {
    const P = C.pronostic || {};
    $("#pronostic-participation").innerHTML = texte(P.participation) ? esc(P.participation) : aConfirmer("montant à confirmer");
    $("#pronostic-surprise").innerHTML = texte(P.surprise) ? esc(P.surprise) : aConfirmer("surprise à confirmer");
    $("#pronostic-cloture").innerHTML = debut
      ? `Au coup d'envoi, le ${esc(formaterDate(debut, "jourCourt"))} à ${esc(heure(debut))}`
      : `Au coup d'envoi du tournoi ${aConfirmer("date à confirmer")}`;
    rendrePronosticEtat();
  }

  function rendrePronosticEtat() {
    const action = $("#pronostic-action");
    if (!action) return;
    if (pronosticClos()) {
      action.innerHTML = '<p class="pronostic-clos">Les pronostics sont clos. Merci à toutes les personnes qui ont joué !</p>';
    } else {
      action.innerHTML = `<div class="cta-bloc">
          <a class="bouton bouton-jaune" data-lien="pronostic">🔮 Faire son pronostic</a>
          <p class="destination" data-destination="pronostic"></p>
        </div>`;
      appliquerLiens(action);
    }
    const resultat = $("#pronostic-resultat");
    if (!resultat) return;
    const champion = championNom();
    const bons = texte((C.pronostic || {}).bonsPronostics);
    if (etatActuel() === "apres" && (champion || bons)) {
      resultat.innerHTML = `<p class="resultat-titre">Résultat</p>
        ${champion ? `<p>🏆 Champion du tournoi : <strong>${esc(champion)}</strong></p>` : ""}
        ${bons ? `<p>Bon pronostic : <strong>${esc(bons)}</strong>${point(bons)} Bravo !</p>` : "<p>Les bons pronostics seront annoncés ici.</p>"}`;
      resultat.hidden = false;
    } else {
      resultat.hidden = true;
    }
  }


  /* ───────────────────── La tombola ───────────────────── */

  function rendreTombola() {
    const B = C.tombola || {};
    const prix = nombre(B.prixBillet);
    $("#ticket-prix").innerHTML = prix !== null ? `${esc(euros(prix))} le billet` : `Prix du billet : ${aConfirmer("à confirmer")}`;
    $("#ticket-tirage").innerHTML = texte(B.tirage) ? `Tirage au sort : ${esc(B.tirage)}` : `Date du tirage : ${aConfirmer("à confirmer")}`;

    const lots = Array.isArray(B.lots) ? B.lots : [];
    const gagnants = Array.isArray(B.gagnants) ? B.gagnants : [];
    const tousConfirmes = lots.length > 0 && lots.every((l) => texte(l.statut) === "confirme");
    $("#titre-lots").textContent = tousConfirmes ? "Les lots à gagner" : "Exemples de lots recherchés";
    $("#avertissement-lots").hidden = tousConfirmes;

    $("#lots").innerHTML = lots.map((lot, i) => {
      const confirme = texte(lot.statut) === "confirme";
      const numero = texte(gagnants[i]);
      return `<li class="lot">
          <span class="lot-emoji" aria-hidden="true">${esc(lot.emoji || "🎁")}</span>
          <p class="lot-nom">${esc(lot.nom)}</p>
          <span class="lot-statut ${confirme ? "statut-confirme" : "statut-recherche"}">${confirme ? "Confirmé" : "En recherche"}</span>
          ${confirme && texte(lot.partenaire) ? `<p class="lot-partenaire">Offert par ${esc(lot.partenaire)}</p>` : ""}
          ${numero ? `<p class="lot-gagnant">Gagnant : ${esc(numero)}</p>` : ""}
        </li>`;
    }).join("");

    const resultat = $("#tombola-resultat");
    if (gagnants.some((g) => texte(g))) {
      resultat.innerHTML = '<p class="resultat-titre">Le tirage a eu lieu</p><p>Les gagnants sont indiqués sous chaque lot. Nous contactons chaque personne avec les coordonnées laissées lors de la participation.</p>';
      resultat.hidden = false;
    } else {
      resultat.hidden = true;
    }
  }


  /* ───────────────────── La collecte ───────────────────── */

  function rendreCollecte() {
    const col = C.collecte || {};
    $("#compteur-kg").textContent = entier(nombre(K.denreesKg) || 0);
    $("#compteur-vetements").textContent = entier(nombre(K.vetements) || 0);
    $("#liste-alimentaire").innerHTML = (col.alimentaire || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#liste-vetements").innerHTML = (col.vetements || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#liste-eviter").innerHTML = (col.aEviter || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const points = Array.isArray(col.points) ? col.points.filter((p) => texte(p.ou)) : [];
    $("#points-collecte").innerHTML = points.length
      ? `<ul class="liste-lieux">${points.map((p) => `<li><strong>${esc(p.ou)}</strong><span>${texte(p.quand) ? esc(p.quand) : "dates à confirmer"}</span></li>`).join("")}</ul>`
      : `<p>Les lieux et les dates de collecte sont ${aConfirmer("à confirmer")}. Ils seront annoncés ici et sur Instagram.</p>`;
  }


  /* ───────────────────── Transparence, association, équipe ───────────────────── */

  function rendreTransparence() {
    const t = texte((C.transparence || {}).encaissement);
    $("#encaissement").innerHTML = t ? esc(t) : `Les modalités d'encaissement sont ${aConfirmer("à préciser")} : elles seront indiquées ici.`;
  }

  function rendreQui() {
    const a = C.association || {};
    const nom = texte(a.nom) || "l'association";
    const logo = $("#asso-logo");
    const secours = `<span class="asso-logo-texte"${brouillon ? " data-exemple" : ""}>${esc(nom)}</span>`;
    logo.innerHTML = texte(a.logo) ? `<img src="${esc(a.logo)}" alt="Logo de ${esc(nom)}" loading="lazy" decoding="async">` : secours;
    secoursImages(logo, ".asso-logo", secours);

    if (texte(a.nomComplet)) { $("#asso-sigle").textContent = a.nomComplet; $("#asso-sigle").hidden = false; }
    $("#asso-presentation").innerHTML = (a.presentation || []).map((p) => `<p>${esc(p)}</p>`).join("");
    const site = urlValide("siteAsso") || (/^https:\/\/\S+\.\S+$/.test(texte(a.site)) ? texte(a.site) : "");
    if (site) { $("#asso-site").href = site; $("#asso-site-ligne").hidden = false; }

    const rotations = [-2, 1.5, -1.2, 2];
    const silhouette = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="38" r="18" fill="#16161b" opacity=".25"/><path d="M14 96 C 18 66, 34 58, 50 58 C 66 58, 82 66, 86 96 Z" fill="#16161b" opacity=".25"/></svg>';
    $("#equipe").innerHTML = (C.equipe || []).map((m, i) => {
      const prenom = texte(m.prenom);
      const photo = texte(m.photo)
        ? `<img src="${esc(m.photo)}" alt="Photo de ${esc(prenom || "l'équipe")}" loading="lazy" decoding="async">`
        : silhouette;
      return `<li class="polaroid" style="--rot:${rotations[i % rotations.length]}deg">
          <div class="polaroid-photo">${photo}</div>
          <p class="polaroid-nom">${prenom ? esc(prenom) : aConfirmer("prénom à ajouter")}</p>
          <p class="polaroid-role">${texte(m.role) ? esc(m.role) : aConfirmer("rôle à ajouter")}</p>
        </li>`;
    }).join("");
    secoursImages($("#equipe"), ".polaroid-photo", silhouette);

    logoPied($("#logo-iut"), C.logoIUT, "Logo de l'IUT d'Amiens", "IUT d'Amiens");
    logoPied($("#logo-asso"), a.logo, "Logo de " + nom, nom);

    const resp = texte((C.mentionsLegales || {}).responsable);
    $("#mentions-responsable").innerHTML = resp ? esc(resp) : `Nom ${aConfirmer("à compléter")}`;
  }
  function logoPied(el, src, alt, nom) {
    if (!el) return;
    const secours = `<span class="pied-logo-texte"${brouillon ? " data-exemple" : ""}>${esc(nom)}</span>`;
    el.innerHTML = texte(src) ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : secours;
    secoursImages(el, ".pied-logo", secours);
  }


  /* ───────────────────── Interface : menu, fenêtres, bandeaux ───────────────────── */

  function initMenu() {
    const burger = $(".burger");
    const nav = $("#nav");
    if (!burger || !nav) return;
    const ecranLarge = window.matchMedia("(min-width: 72rem)");
    const estOuvert = () => burger.getAttribute("aria-expanded") === "true";
    const ouvrir = () => {
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Fermer le menu");
      nav.classList.add("ouvert");
      document.body.classList.add("menu-ouvert");
      requestAnimationFrame(() => { const premier = $("a", nav); if (premier) premier.focus(); });
    };
    const fermer = (rendreLeFocus) => {
      if (!estOuvert()) return;
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
      nav.classList.remove("ouvert");
      document.body.classList.remove("menu-ouvert");
      if (rendreLeFocus) burger.focus();
    };
    burger.addEventListener("click", () => (estOuvert() ? fermer(false) : ouvrir()));
    $$(".entete a").forEach((a) => a.addEventListener("click", () => fermer(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermer(true); });
    if (ecranLarge.addEventListener) ecranLarge.addEventListener("change", () => { if (ecranLarge.matches) fermer(false); });

    const liens = $$("a[href^='#']", nav);
    const sections = $$("main > section[id]");
    if (!("IntersectionObserver" in window) || !sections.length) return;
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((en) => {
        if (!en.isIntersecting) return;
        liens.forEach((a) => {
          const actif = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("actif", actif);
          if (actif) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));
  }

  function initModales() {
    $$("[data-ouvre]").forEach((bouton) => bouton.addEventListener("click", () => {
      const d = document.getElementById(bouton.dataset.ouvre);
      if (!d) return;
      if (typeof d.showModal === "function") { d.showModal(); document.body.classList.add("modale-ouverte"); }
      else d.setAttribute("open", "");
    }));
    $$("dialog.modale").forEach((d) => {
      const fermer = () => (typeof d.close === "function" ? d.close() : d.removeAttribute("open"));
      d.addEventListener("close", () => document.body.classList.remove("modale-ouverte"));
      d.addEventListener("click", (e) => { if (e.target === d) fermer(); });
      $$(".modale-fermer", d).forEach((b) => b.addEventListener("click", fermer));
    });
  }

  function initBandeaux() {
    const bandeau = $("#bandeau-brouillon");
    const croix = bandeau && $(".bandeau-fermer", bandeau);
    if (croix) croix.addEventListener("click", () => { bandeau.hidden = true; });
  }


  /* ───────────────────── C'est parti ───────────────────── */

  function lancer(nom, fn) {
    try { fn(); } catch (err) { console.error(`GEAnérosité : problème dans « ${nom} ». Vérifie cette partie de js/config.js.`, err); }
  }

  if (brouillon) {
    html.classList.add("brouillon");
    $("#bandeau-brouillon").hidden = false;
    console.info("GEAnérosité (mode brouillon) : pour tester, ajoute ?etat=direct ou ?etat=apres à l'adresse.");
  }

  lancer("textes", appliquerTextes);
  lancer("liens", () => appliquerLiens(document));
  lancer("tableau d'affichage", rendreLedCagnotte);
  lancer("compteurs", rendreCompteurs);
  lancer("cagnotte et objectifs", rendreCagnotte);
  lancer("tournoi", rendreTournoi);
  lancer("pronostic", rendrePronostic);
  lancer("tombola", rendreTombola);
  lancer("collecte", rendreCollecte);
  lancer("transparence", rendreTransparence);
  lancer("association et équipe", rendreQui);
  lancer("agenda", initAgenda);
  lancer("compte à rebours", () => { tic(); setInterval(tic, 1000); });
  lancer("typographie", () => typographie(document.body));
})();
