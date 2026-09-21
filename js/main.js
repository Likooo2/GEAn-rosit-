/* ════════════════════════════════════════════════════════════════════
   GEAnérosité — script principal
   Pas besoin de toucher à ce fichier : tout se règle dans js/config.js.

   Astuces pour tester l'affichage sans rien modifier :
     index.html?etat=avant    → avant la course
     index.html?etat=direct   → pendant la course
     index.html?etat=apres    → après la course
     index.html?maintenant=2026-11-21T10:30  → simule une date et une heure
     index.html?coureur=3     → ouvre directement l'engagement pour le dossard 3
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const $ = (sel, racine = document) => racine.querySelector(sel);
  const $$ = (sel, racine = document) => Array.from(racine.querySelectorAll(sel));
  const html = document.documentElement;

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
  const E = C.engagement || {};
  const TZ = "Europe/Paris";
  const params = new URLSearchParams(window.location.search);
  const brouillon = !!C.modeBrouillon;
  const CLE_STOCKAGE = "geanerosite-engagements";


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
  const formatDecimal = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatEuros0 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuros2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sansEspaceFine = (s) => s.replace(/[\u202F\u2009]/g, "\u00A0");
  function euros(v) {
    const n = Math.round((Number(v) || 0) * 100) / 100;
    return sansEspaceFine(Number.isInteger(n) ? formatEuros0.format(n) : formatEuros2.format(n));
  }
  const entier = (v) => sansEspaceFine(formatNombre.format(Math.round(Number(v) || 0)));
  const km = (v) => sansEspaceFine(formatDecimal.format(Math.max(0, Number(v) || 0)));

  function aConfirmer(mot) {
    return `<span class="a-confirmer"${brouillon ? " data-exemple" : ""}>${esc(mot || "à confirmer")}</span>`;
  }

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
  const debut = lireDate(dates.debutCourse);
  const fin = lireDate(dates.finCourse) || (debut ? new Date(debut.getTime() + 3 * 3600 * 1000) : null);
  const dateConfirmee = !!dates.dateConfirmee;

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

  function typographie(racine) {
    if (!racine) return;
    const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && !n.parentElement.closest("script, style, code, input, textarea") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const noeuds = [];
    while (marcheur.nextNode()) noeuds.push(marcheur.currentNode);
    noeuds.forEach((n) => {
      const avant = n.nodeValue;
      const apres = avant
        .replace(/ ([!?;»])/g, "\u00A0$1")
        .replace(/« /g, "«\u00A0")
        .replace(/ :/g, "\u00A0:")
        .replace(/(\d) (€|%|km\b)/g, "$1\u00A0$2");
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
    inscriptionCoureur: "l'inscription des coureurs", engagement: "le formulaire d'engagement",
    cagnotte: "la cagnotte", tombola: "la tombola", live: "le live", strava: "Strava",
    instagram: "Instagram", email: "l'adresse e-mail",
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


  /* ───────────────────── Les coureurs ───────────────────── */

  const nombreSouple = (v) => nombre(String(v ?? "").replace(",", ".").replace(/[^0-9.\-]/g, "")) || 0;
  function normaliserCoureurs(brut) {
    return (Array.isArray(brut) ? brut : []).map((c, i) => {
      const nom = texte(c.prenom || c.nom);
      const dos = texte(c.dossard);
      if (!nom && !dos) return null;
      return {
        prenom: nom || "Coureur " + (i + 1),
        dossard: dos ? String(Math.round(nombreSouple(dos)) || dos) : String(i + 1),
        objectifKm: Math.max(0, nombreSouple(c.objectifKm)),
        km: Math.max(0, nombreSouple(c.km)),
        kmVerifies: c.kmVerifies === true || ["oui", "true", "vrai", "x", "1", "ok"].includes(texte(c.kmVerifies).toLowerCase()),
        strava: /^https:\/\/\S+\.\S+$/.test(texte(c.strava)) ? texte(c.strava) : "",
        promesseParKm: Math.max(0, nombreSouple(c.promesseParKm)),
      };
    }).filter(Boolean);
  }
  let coureurs = normaliserCoureurs(C.coureurs);
  let parDossard = new Map();
  let kmTotal = 0;
  function majIndexCoureurs() {
    parDossard = new Map(coureurs.map((c) => [c.dossard, c]));
    kmTotal = coureurs.reduce((t, c) => t + c.km, 0);
  }
  majIndexCoureurs();
  const kmReference = Math.max(1, nombre(E.kmReference) || 15);
  const maxParKm = Math.max(1, nombre(E.maxParKm) || 20);
  const seuilAlerte = Math.max(1, nombre(E.seuilAlerte) || 50);
  const seuilFort = Math.max(seuilAlerte, nombre(E.seuilFort) || 100);


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
      titre.textContent = "Départ dans";
      construireEcran([{ label: "jours" }, { label: "heures" }, { label: "min" }, { label: "sec" }]);
      majEcran(["--", "--", "--", "--"]);
      if (debut) {
        message.innerHTML = `<p class="panneau-date">${esc(formaterDate(debut, "Jour"))} à ${esc(heure(debut))}${dateConfirmee ? "" : " " + aConfirmer("date provisoire")}</p>`;
        zone.setAttribute("aria-label", `Compte à rebours jusqu'au départ, le ${formaterDate(debut, "jour")} à ${heure(debut)}`);
        if (agenda) agenda.hidden = false;
      } else {
        message.innerHTML = `<span class="sticker sticker-jaune"${brouillon ? " data-exemple" : ""}>Date à confirmer</span><p class="panneau-date">La date de la course sera annoncée ici.</p>`;
        zone.removeAttribute("aria-label");
        if (agenda) agenda.hidden = true;
      }
      if (boutonLive) boutonLive.hidden = true;
    } else if (e === "direct") {
      titre.innerHTML = '<span class="point-direct" aria-hidden="true"></span>En course';
      construireEcran([{ label: "h", nb: 1 }, { label: "min" }, { label: "sec" }]);
      message.innerHTML = `<p class="panneau-date">de course déjà parcourue${fin ? `, arrivée prévue à ${esc(heure(fin))}` : ""}. Déjà ${esc(km(kmTotal))} km au compteur.</p>`;
      zone.setAttribute("aria-label", "La course est en cours");
      if (agenda) agenda.hidden = true;
      if (boutonLive) { boutonLive.hidden = false; boutonLive.textContent = "Regarder le live"; }
    } else {
      titre.textContent = "Merci !";
      construireEcran([]);
      message.innerHTML = `<p class="panneau-date">${kmTotal > 0 ? `🏁 <strong>${esc(km(kmTotal))} km</strong> parcourus par ${esc(entier(coureurs.length))} coureurs` : "La course est terminée. Merci à toutes et à tous !"}</p>`;
      zone.removeAttribute("aria-label");
      if (agenda) agenda.hidden = true;
      if (boutonLive) { boutonLive.hidden = false; boutonLive.textContent = "Revoir le live"; }
    }

    document.title = e === "direct" ? "🔴 EN DIRECT : " + titreOriginal : titreOriginal;
    appliquerLiens($(".panneau"));
    rendreLive(e);
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
    const titre = "GEAnérosité : course solidaire";
    const details = `Course solidaire au profit de ${asso}.` + (urlValide("live") ? " Le live : " + urlValide("live") : "");
    const ics = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const google = new URLSearchParams({
      action: "TEMPLATE", text: titre, details, location: texte((C.course || {}).lieu) || urlValide("live") || "En ligne",
      dates: `${ics(debut)}/${ics(fin)}`,
    });
    $("#agenda-google").href = "https://calendar.google.com/calendar/render?" + google.toString();
    const echap = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    const fichier = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GEAnerosite//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT", "UID:geanerosite-" + ics(debut) + "@geanerosite",
      "DTSTAMP:" + ics(new Date()), "DTSTART:" + ics(debut), "DTEND:" + ics(fin),
      "SUMMARY:" + echap(titre), "DESCRIPTION:" + echap(details),
      "LOCATION:" + echap(texte((C.course || {}).lieu) || "À confirmer"),
      "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:" + echap("La course commence dans 30 minutes !"), "END:VALARM",
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
    const inscrits = coureurs.length || Math.max(0, nombre(K.coureursInscrits) || 0);
    const distance = coureurs.length ? kmTotal : Math.max(0, nombre(K.kmParcourus) || 0);
    const items = [
      { emoji: "💰", label: "Cagnotte", valeur: montant, unite: "€", uniteLongue: "euros", principal: true },
      { emoji: "🏃", label: "Coureurs inscrits", valeur: inscrits, unite: "", uniteLongue: inscrits > 1 ? "coureurs inscrits" : "coureur inscrit" },
      { emoji: "🛣️", label: "Kilomètres parcourus", valeur: distance, unite: "km", uniteLongue: "kilomètres" },
      { emoji: "🥫", label: "Denrées collectées", valeur: nombre(K.denreesKg) || 0, unite: "kg", uniteLongue: "kilos de denrées" },
      { emoji: "👕", label: "Vêtements collectés", valeur: nombre(K.vetements) || 0, unite: "", uniteLongue: "vêtements" },
      { emoji: "🎟️", label: "Participants à la tombola", valeur: nombre(K.participantsTombola) || 0, unite: "", uniteLongue: (nombre(K.participantsTombola) || 0) > 1 ? "participants" : "participant" },
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
    $("#maj-compteurs").hidden = !texte(K.miseAJour);
  }


  /* ───────────────────── La cagnotte : la piste vers l'arrivée ───────────────────── */

  const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rendreCagnotte() {
    $("#jauge-montant").textContent = euros(montant);
    $("#jauge-objectif").textContent = euros(objectif);
    $("#titre-objectif").textContent = euros(objectif);
    $("#piste-objectif").textContent = euros(objectif);
    $("#jauge-pourcent").textContent = pourcentTexte;
    $("#piste-bulle").textContent = euros(montant);

    const compteur = $("#compteur");
    compteur.setAttribute("aria-valuemax", String(Math.max(objectif, montant)));
    compteur.setAttribute("aria-valuenow", String(montant));
    compteur.setAttribute("aria-valuetext", `${euros(montant)} récoltés sur ${euros(objectif)}, soit ${pourcentTexte} de l'objectif`);

    // Le coureur se place sur la piste, en fonction de l'argent récolté
    const avancee = Math.max(0, Math.min(1, montant / objectif));
    const coureurEl = $("#piste-coureur");
    const placer = () => coureurEl.style.setProperty("--p", avancee.toFixed(4));
    if (mouvementReduit) placer();
    else quandVisible($(".piste-zone"), () => requestAnimationFrame(placer), 0.3);

    const bilan = $("#jauge-bilan");
    if (montant >= objectif) {
      bilan.innerHTML = "<strong>Ligne d'arrivée franchie !</strong> Merci : tout ce qui arrive maintenant finance encore plus de projets pour l'association.";
    } else if (montant <= 0) {
      bilan.innerHTML = `<strong>Le coureur est encore sur la ligne de départ.</strong> Les premiers euros le font avancer vers la ligne d'arrivée, à ${euros(objectif)}.`;
    } else {
      bilan.innerHTML = `<strong>Plus que ${euros(objectif - montant)}</strong> pour franchir la ligne d'arrivée.`;
    }

    $("#projets-liste").innerHTML = (Array.isArray(C.projetsFinances) ? C.projetsFinances : [])
      .map((pr) => `<li><span class="projet-emoji" aria-hidden="true">${esc(pr.emoji || "▶")}</span><span>${esc(pr.texte)}</span></li>`).join("");

    // Cagnotte en direct : widget HelloAsso (facultatif)
    const widget = texte(L.widgetCagnotte);
    if (/^https:\/\/([a-z0-9-]+\.)*helloasso\.com\//i.test(widget)) {
      const bloc = $("#widget-cagnotte");
      const iframe = document.createElement("iframe");
      iframe.src = widget;
      iframe.title = "Cagnotte HelloAsso en direct";
      iframe.loading = "lazy";
      bloc.appendChild(iframe);
      bloc.hidden = false;
    }
  }


  /* ───────────────────── Mise à jour automatique depuis une feuille de calcul ───────────────────── */

  const COLONNES = {
    prenom: ["prenom", "prenom du coureur", "nom", "nom du coureur", "coureur", "pseudo"],
    dossard: ["dossard", "numero", "num", "no", "n"],
    objectifKm: ["objectif", "objectifkm", "objectif km", "objectif (km)", "km objectif"],
    km: ["km", "kilometres", "km parcourus", "km realises", "distance", "distance (km)"],
    kmVerifies: ["verifie", "verifies", "kmverifies", "km verifies", "verification", "valide"],
    strava: ["strava", "lien strava", "activite strava", "profil strava"],
    promesseParKm: ["promesse", "promesses", "promesseparkm", "promesse par km", "euros par km", "engagements"],
  };
  const sansAccent = (v) => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  function parserCSV(contenu) {
    const premiere = contenu.split(/\r?\n/)[0] || "";
    const sep = (premiere.match(/;/g) || []).length > (premiere.match(/,/g) || []).length ? ";" : ",";
    const lignes = [];
    let champ = "", ligne = [], guillemets = false;
    for (let i = 0; i < contenu.length; i++) {
      const c = contenu[i];
      if (guillemets) {
        if (c === '"') { if (contenu[i + 1] === '"') { champ += '"'; i++; } else guillemets = false; }
        else champ += c;
      } else if (c === '"') guillemets = true;
      else if (c === sep) { ligne.push(champ); champ = ""; }
      else if (c === "\n") { ligne.push(champ); lignes.push(ligne); ligne = []; champ = ""; }
      else if (c !== "\r") champ += c;
    }
    if (champ !== "" || ligne.length) { ligne.push(champ); lignes.push(ligne); }
    return lignes;
  }

  function chargerFeuilleCoureurs() {
    const url = texte(L.feuilleCoureurs);
    if (!/^https:\/\/\S+$/.test(url)) return;
    fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("réponse " + r.status))))
      .then((csv) => {
        const lignes = parserCSV(csv).filter((l) => l.some((c) => texte(c)));
        if (lignes.length < 2) return;
        const entetes = lignes[0].map(sansAccent);
        const indice = {};
        Object.keys(COLONNES).forEach((cle) => { indice[cle] = entetes.findIndex((e) => COLONNES[cle].includes(e)); });
        if (indice.prenom < 0) {
          console.warn("GEAnérosité : la feuille de calcul n'a pas de colonne « prenom ». Colonnes trouvées :", entetes);
          return;
        }
        const brut = lignes.slice(1).map((l) => {
          const val = (cle) => (indice[cle] >= 0 ? l[indice[cle]] : "");
          return {
            prenom: val("prenom"), dossard: val("dossard"), objectifKm: val("objectifKm"),
            km: val("km"), kmVerifies: val("kmVerifies"), strava: val("strava"), promesseParKm: val("promesseParKm"),
          };
        });
        const liste = normaliserCoureurs(brut);
        if (!liste.length) return;
        coureurs = liste;
        majIndexCoureurs();
        lancer("compteurs", rendreCompteurs);
        lancer("liste des coureurs", rendreCoureurs);
        lancer("classement des kilomètres", rendreClassement);
        lancer("mes engagements", rendrePanier);
        if (etatCourant) lancer("tableau d'affichage", () => rendreEtat(etatCourant));
        console.info(`GEAnérosité : ${liste.length} coureur(s) chargé(s) depuis la feuille de calcul.`);
      })
      .catch((err) => console.warn("GEAnérosité : feuille de calcul illisible, la liste de js/config.js est utilisée.", err));
  }


  /* ───────────────────── Les engagements (enregistrés sur l'appareil) ───────────────────── */

  function lireStock() {
    try { const d = JSON.parse(localStorage.getItem(CLE_STOCKAGE) || "{}"); return d && typeof d === "object" ? d : {}; }
    catch (err) { return {}; }
  }
  function ecrireStock() {
    try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(stock)); }
    catch (err) { console.warn("GEAnérosité : impossible d'enregistrer sur cet appareil.", err); }
  }
  const stock = lireStock();
  if (!Array.isArray(stock.engagements)) stock.engagements = [];
  if (!stock.infos || typeof stock.infos !== "object") stock.infos = {};

  function montantEngagement(e) {
    const c = parDossard.get(e.dossard);
    const kmFaits = c ? c.km : 0;
    const brut = e.parKm * kmFaits;
    const total = e.plafond ? Math.min(brut, e.plafond) : brut;
    return { coureur: c, kmFaits, brut, total, verifie: !!(c && c.kmVerifies), plafonne: !!(e.plafond && brut > e.plafond) };
  }
  function estimationEngagement(coureur, parKm, plafond) {
    const base = coureur && coureur.objectifKm ? coureur.objectifKm : kmReference;
    const brut = parKm * base;
    return { base, brut, total: plafond ? Math.min(brut, plafond) : brut, plafonne: !!(plafond && brut > plafond) };
  }

  /* ── La liste des coureurs ── */

  function carteCoureur(c) {
    const engage = stock.engagements.find((e) => e.dossard === c.dossard);
    const statut = c.km > 0
      ? `<span class="statut ${c.kmVerifies ? "statut-verifie" : "statut-attente"}">${c.kmVerifies ? "vérifié" : "en attente"}</span>`
      : "";
    const barre = c.objectifKm
      ? `<div class="coureur-barre" aria-hidden="true"><span style="--p:${Math.min(1, c.km / c.objectifKm).toFixed(3)}"></span></div>`
      : "";
    return `<li class="coureur-carte${engage ? " coureur-engage" : ""}" data-prenom="${esc(c.prenom.toLowerCase())}" data-dossard="${esc(c.dossard)}">
        <span class="coureur-dossard" aria-hidden="true">${esc(c.dossard)}</span>
        <div class="coureur-haut">
          <svg class="coureur-silhouette" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><use href="#coureur"></use></svg>
          <p class="coureur-prenom">${esc(c.prenom)}<span class="sr-only"> — dossard ${esc(c.dossard)}</span></p>
        </div>
        ${c.km > 0
          ? `<p class="coureur-km"><strong>${esc(km(c.km))}</strong> km ${statut}</p>`
          : `<p class="coureur-detail">${c.objectifKm ? `Objectif : ${esc(km(c.objectifKm))} km` : "Objectif à annoncer"}</p>`}
        ${barre}
        ${c.promesseParKm ? `<p class="coureur-promesses">Déjà <strong>${esc(euros(c.promesseParKm))} par km</strong> promis</p>` : ""}
        ${engage ? `<p class="coureur-detail"><span class="badge-engage">Mon engagement</span> ${esc(euros(engage.parKm))} par km</p>` : ""}
        <div class="coureur-actions">
          <button class="bouton ${engage ? "bouton-contour" : "bouton-rose"}" type="button" data-engager="${esc(c.dossard)}">${engage ? "Modifier" : "🤝 Je m'engage"}</button>
          ${c.strava ? `<a class="lien-strava" href="${esc(c.strava)}" target="_blank" rel="noopener">Strava</a>` : ""}
        </div>
      </li>`;
  }

  function rendreCoureurs() {
    const liste = $("#liste-coureurs");
    const vide = $("#coureurs-vide");
    const recherche = $(".recherche");
    if (!coureurs.length) {
      liste.innerHTML = "";
      recherche.hidden = true;
      vide.hidden = false;
      vide.innerHTML = `<p><strong>Aucun coureur inscrit pour l'instant.</strong> Soyez le premier : l'inscription est gratuite et ouverte à tout le monde, quel que soit le niveau.</p>
        <div class="cta-bloc">
          <a class="bouton bouton-vert" data-lien="inscriptionCoureur">🏃 Je m'inscris comme coureur</a>
          <p class="destination" data-destination="inscriptionCoureur"></p>
        </div>`;
      appliquerLiens(vide);
      return;
    }
    recherche.hidden = false;
    vide.hidden = true;
    liste.innerHTML = coureurs.map(carteCoureur).join("");
    typographie(liste);
    filtrerCoureurs($("#recherche-coureur").value);
  }

  function filtrerCoureurs(valeur) {
    const q = texte(valeur).toLowerCase();
    const cartes = $$("#liste-coureurs .coureur-carte");
    let visibles = 0;
    cartes.forEach((carte) => {
      const ok = !q || carte.dataset.prenom.includes(q) || carte.dataset.dossard.includes(q);
      carte.hidden = !ok;
      if (ok) visibles++;
    });
    const info = $("#recherche-resultat");
    info.textContent = !q
      ? `${entier(cartes.length)} coureur${cartes.length > 1 ? "s" : ""} inscrit${cartes.length > 1 ? "s" : ""}.`
      : visibles === 0 ? "Aucun coureur ne correspond à cette recherche."
      : `${entier(visibles)} coureur${visibles > 1 ? "s" : ""} trouvé${visibles > 1 ? "s" : ""}.`;
  }

  /* ── La fenêtre « mon engagement » ── */

  let dossardEnCours = null;

  function ouvrirEngagement(dossard) {
    const c = parDossard.get(String(dossard));
    if (!c) return;
    dossardEnCours = c.dossard;
    const existant = stock.engagements.find((e) => e.dossard === c.dossard);
    $("#engagement-coureur").innerHTML = `Je soutiens <strong>${esc(c.prenom)}</strong> (dossard ${esc(c.dossard)})${c.objectifKm ? `, qui vise ${esc(km(c.objectifKm))} km` : ""}.`;
    const suggeres = Array.isArray(E.montantsSuggeres) ? E.montantsSuggeres : [0.5, 1, 2];
    $("#montants-suggeres").innerHTML = suggeres.map((m) =>
      `<button class="montant-choix" type="button" data-montant="${m}" aria-pressed="false">${esc(euros(m))}</button>`).join("");
    $("#par-km").value = existant ? existant.parKm : "";
    $("#plafond").value = existant && existant.plafond ? existant.plafond : (nombre(E.plafondConseille) || "");
    $("#valider-engagement").textContent = existant ? "Mettre à jour mon engagement" : "Ajouter à mes engagements";
    majEstimation();
    const d = $("#modale-engagement");
    if (typeof d.showModal === "function") { d.showModal(); document.body.classList.add("modale-ouverte"); }
    else d.setAttribute("open", "");
    requestAnimationFrame(() => { const b = $("#montants-suggeres button"); if (b) b.focus(); });
  }

  function majEstimation() {
    const c = parDossard.get(dossardEnCours);
    const parKm = nombre($("#par-km").value) || 0;
    const plafond = nombre($("#plafond").value) || 0;
    const zone = $("#estimation");
    const alerte = $("#alerte-engagement");
    $$("#montants-suggeres .montant-choix").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.montant) === parKm)));

    if (parKm <= 0) {
      zone.innerHTML = "Choisissez un montant par kilomètre pour voir ce que cela représente.";
      alerte.hidden = true;
      return;
    }
    const est = estimationEngagement(c, parKm, plafond);
    zone.innerHTML = `Si ${esc(c ? c.prenom : "le coureur")} parcourt ${esc(km(est.base))} km, vous verserez <strong>${esc(euros(est.total))}</strong>${est.plafonne ? ` (plafonné à ${esc(euros(plafond))})` : ""}.`;
    let message = "";
    if (parKm > maxParKm) message = `Le simulateur est limité à ${euros(maxParKm)} par kilomètre. Au-delà, contactez-nous directement.`;
    else if (est.total >= seuilFort) message = `Attention : cet engagement peut dépasser ${euros(seuilFort)}. N'engagez que ce que vous pourrez verser sans difficulté, et pensez au plafond.`;
    else if (est.total >= seuilAlerte) message = `Cela représente déjà plus de ${euros(seuilAlerte)}. Vérifiez que cela reste raisonnable pour vous, ou ajoutez un plafond.`;
    else if (!plafond) message = "";
    alerte.textContent = message;
    alerte.hidden = !message;
  }

  function validerEngagement() {
    const c = parDossard.get(dossardEnCours);
    const parKm = nombre($("#par-km").value) || 0;
    const plafond = nombre($("#plafond").value) || 0;
    if (!c || parKm <= 0) { majEstimation(); $("#par-km").focus(); return; }
    if (parKm > maxParKm) { majEstimation(); $("#par-km").focus(); return; }
    const autres = stock.engagements.filter((e) => e.dossard !== c.dossard);
    stock.engagements = autres.concat([{ dossard: c.dossard, prenom: c.prenom, parKm: Math.round(parKm * 100) / 100, plafond: plafond > 0 ? Math.round(plafond) : 0 }]);
    ecrireStock();
    const d = $("#modale-engagement");
    if (typeof d.close === "function") d.close(); else d.removeAttribute("open");
    rendreCoureurs();
    rendrePanier();
    const panier = $("#panier");
    if (panier) panier.scrollIntoView({ block: "center" });
  }

  /* ── Mes engagements ── */

  function rendrePanier() {
    const bloc = $("#panier");
    if (!stock.engagements.length) {
      bloc.innerHTML = `<div class="vide">
          <p><strong>Vous n'avez pas encore d'engagement.</strong> Choisissez un coureur dans la liste, puis le montant que vous vous engagez à verser par kilomètre.</p>
          <a class="bouton bouton-rose" href="#coureurs">🤝 Choisir un coureur</a>
        </div>`;
      return;
    }
    const lignes = stock.engagements.map((e) => {
      const m = montantEngagement(e);
      const detail = m.coureur
        ? `${esc(km(m.kmFaits))} km ${m.verifie ? "vérifiés" : "relevés"}${m.plafonne ? `, plafonné à ${esc(euros(e.plafond))}` : ""}`
        : "Ce coureur n'est plus dans la liste.";
      return `<li class="engagement-ligne">
          <div class="engagement-haut">
            <span class="engagement-nom">${esc(e.prenom)}</span>
            <span class="engagement-parkm">${esc(euros(e.parKm))} par km${e.plafond ? `, plafond ${esc(euros(e.plafond))}` : ""}</span>
          </div>
          <p class="engagement-detail">${detail}</p>
          <p class="engagement-montant"><strong>${esc(euros(m.total))}</strong>
            <span class="statut ${m.verifie ? "statut-verifie" : "statut-attente"}">${m.verifie ? "à verser" : "en attente"}</span>
          </p>
          <div class="engagement-actions">
            <button class="lien-bouton" type="button" data-engager="${esc(e.dossard)}">Modifier</button>
            <button class="lien-bouton" type="button" data-retirer="${esc(e.dossard)}">Retirer</button>
          </div>
        </li>`;
    }).join("");
    const total = stock.engagements.reduce((t, e) => t + montantEngagement(e).total, 0);
    const tousVerifies = stock.engagements.every((e) => montantEngagement(e).verifie);
    bloc.innerHTML = `<div class="panier">
        <ul class="panier-liste">${lignes}</ul>
        <div class="panier-total">
          <p>Total ${tousVerifies ? "à verser" : "en attente"}</p>
          <p class="panier-total-montant">${esc(euros(total))}</p>
          <p>${tousVerifies
            ? "Les kilomètres sont vérifiés : vous pouvez verser votre participation."
            : "Ce montant évoluera avec les kilomètres réellement parcourus, puis vérifiés sur Strava."}</p>
        </div>
        <div class="panier-actions">
          <div class="cta-bloc">
            <a class="bouton bouton-rose" data-lien="${tousVerifies ? "cagnotte" : "engagement"}">${tousVerifies ? "💰 Verser ma participation" : "🤝 Valider mes engagements"}</a>
            <p class="destination" data-destination="${tousVerifies ? "cagnotte" : "engagement"}"></p>
          </div>
          <button class="lien-bouton" type="button" id="vider-panier">Tout effacer</button>
        </div>
      </div>`;
    appliquerLiens(bloc);
    typographie(bloc);
    const vider = $("#vider-panier");
    if (vider) vider.addEventListener("click", () => {
      stock.engagements = [];
      ecrireStock();
      rendreCoureurs();
      rendrePanier();
    });
  }

  /* ── Le document d'engagement ── */

  function texteRecapitulatif() {
    const i = stock.infos || {};
    const lignes = stock.engagements.map((e) => {
      const m = montantEngagement(e);
      return `- ${e.prenom} (dossard ${e.dossard}) : ${euros(e.parKm)} par km${e.plafond ? `, plafond ${euros(e.plafond)}` : ""} → ${euros(m.total)} ${m.verifie ? "à verser" : "en attente"}`;
    });
    const total = stock.engagements.reduce((t, e) => t + montantEngagement(e).total, 0);
    return [
      "Document d'engagement — GEAnérosité, course solidaire",
      `Nom : ${texte(i.nom) || "…"}`,
      `Prénom : ${texte(i.prenom) || "…"}`,
      `E-mail : ${texte(i.email) || "…"}`,
      `Téléphone : ${texte(i.tel) || "…"}`,
      "",
      "Mes engagements :",
      ...lignes,
      "",
      `Total ${stock.engagements.every((e) => montantEngagement(e).verifie) ? "à verser" : "en attente"} : ${euros(total)}`,
    ].join("\n");
  }

  function rendreApercuDocument() {
    const i = stock.infos || {};
    const apercu = $("#apercu-doc");
    if (!stock.engagements.length) {
      apercu.innerHTML = "<p>Ajoutez d'abord au moins un engagement pour générer votre document.</p>";
      return;
    }
    const total = stock.engagements.reduce((t, e) => t + montantEngagement(e).total, 0);
    const lignes = stock.engagements.map((e) => {
      const m = montantEngagement(e);
      return `<tr><td>${esc(e.prenom)} (${esc(e.dossard)})</td><td>${esc(euros(e.parKm))} / km</td><td>${e.plafond ? esc(euros(e.plafond)) : "—"}</td><td>${esc(euros(m.total))}</td></tr>`;
    }).join("");
    apercu.innerHTML = `<p><strong>${esc(texte(i.prenom))} ${esc(texte(i.nom))}</strong>${texte(i.email) ? ` — ${esc(i.email)}` : ""}${texte(i.tel) ? ` — ${esc(i.tel)}` : ""}</p>
      <table><thead><tr><th>Coureur</th><th>Engagement</th><th>Plafond</th><th>Montant</th></tr></thead><tbody>${lignes}</tbody></table>
      <p class="doc-total">Total : ${esc(euros(total))}</p>`;
  }

  function construireDocumentImprimable() {
    const i = stock.infos || {};
    const asso = texte(lire("association.nom")) || "l'association";
    const total = stock.engagements.reduce((t, e) => t + montantEngagement(e).total, 0);
    const tousVerifies = stock.engagements.length > 0 && stock.engagements.every((e) => montantEngagement(e).verifie);
    const lignes = stock.engagements.map((e) => {
      const m = montantEngagement(e);
      return `<tr><td>${esc(e.prenom)} (dossard ${esc(e.dossard)})</td><td>${esc(euros(e.parKm))} par km</td><td>${e.plafond ? esc(euros(e.plafond)) : "sans plafond"}</td><td>${esc(km(m.kmFaits))} km</td><td>${esc(euros(m.total))}</td></tr>`;
    }).join("");
    const aujourdHui = formaterDate(maintenant(), "jour");
    $("#document-imprimable").innerHTML = `
      <h2 class="doc-titre">Document d'engagement</h2>
      <p class="doc-soustitre">GEAnérosité — course solidaire au profit de ${esc(asso)}${debut ? `, course du ${esc(formaterDate(debut, "jour"))}` : ""}.</p>
      <div class="doc-bloc">
        <h3>La personne qui s'engage</h3>
        <p>Nom : ${esc(texte(i.nom) || "…………………………")}<br>
           Prénom : ${esc(texte(i.prenom) || "…………………………")}<br>
           E-mail : ${esc(texte(i.email) || "…………………………")}<br>
           Téléphone : ${esc(texte(i.tel) || "…………………………")}</p>
      </div>
      <div class="doc-bloc">
        <h3>Mes engagements</h3>
        <table class="doc-table">
          <thead><tr><th>Coureur soutenu</th><th>Montant par km</th><th>Plafond</th><th>Km relevés</th><th>Montant</th></tr></thead>
          <tbody>${lignes}</tbody>
        </table>
        <p class="doc-total">Total ${tousVerifies ? "à verser" : "en attente de vérification"} : ${esc(euros(total))}</p>
      </div>
      <div class="doc-bloc">
        <p>Je m'engage à verser, après la course et la vérification des kilomètres sur Strava, le montant correspondant à chacun de mes engagements ci-dessus, sur la cagnotte du projet. Cet engagement est une promesse de don : il n'entraîne aucun prélèvement automatique.</p>
      </div>
      <div class="doc-signature">
        <div class="doc-case"><span>Fait le ${esc(aujourdHui)}, à</span></div>
        <div class="doc-case"><span>Signature</span></div>
      </div>`;
  }

  function initDocument() {
    const champs = { prenom: $("#doc-prenom"), nom: $("#doc-nom"), email: $("#doc-email"), tel: $("#doc-tel") };
    Object.keys(champs).forEach((cle) => {
      if (!champs[cle]) return;
      champs[cle].value = texte((stock.infos || {})[cle]);
      champs[cle].addEventListener("input", () => {
        stock.infos[cle] = champs[cle].value;
        ecrireStock();
        rendreApercuDocument();
      });
    });
    const message = $("#doc-message");
    $("#imprimer-document").addEventListener("click", () => {
      if (!stock.engagements.length) { message.textContent = "Ajoutez d'abord un engagement."; return; }
      construireDocumentImprimable();
      const doc = $("#document-imprimable");
      doc.hidden = false;
      window.print();
      setTimeout(() => { doc.hidden = true; }, 500);
    });
    $("#copier-document").addEventListener("click", () => {
      const t = texteRecapitulatif();
      const fini = () => { message.textContent = "Récapitulatif copié : vous pouvez le coller dans un message."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(fini).catch(() => { message.textContent = "Copie impossible sur cet appareil."; });
      else message.textContent = "Copie impossible sur cet appareil.";
    });
  }

  function rendreEnvoiDocument() {
    const bloc = $("#doc-envoi");
    const mail = urlValide("email");
    const formulaire = urlValide("engagement");
    if (formulaire) {
      bloc.innerHTML = `<a class="bouton bouton-rose" data-lien="engagement">🤝 Valider mes engagements</a><p class="destination" data-destination="engagement"></p>`;
    } else if (mail) {
      const sujet = encodeURIComponent("Mon engagement — GEAnérosité");
      bloc.innerHTML = `<a class="bouton bouton-rose" href="mailto:${esc(mail)}?subject=${sujet}&body=${encodeURIComponent(texteRecapitulatif())}">✉️ Envoyer mes engagements par e-mail</a>`;
    } else {
      bloc.innerHTML = `<a class="bouton bouton-rose" data-lien="engagement">🤝 Valider mes engagements</a><p class="destination" data-destination="engagement"></p>`;
    }
    appliquerLiens(bloc);
  }


  /* ───────────────────── La course : infos, live, classement ───────────────────── */

  function infosCourse() {
    const co = C.course || {};
    const live = urlValide("live");
    let hote = "";
    try { hote = live ? new URL(live).hostname.replace(/^www\./, "") : ""; } catch (err) { hote = ""; }
    return [
      { emoji: "📅", valeur: debut ? majuscule(formaterDate(debut, "jourCourt")) + (dateConfirmee ? "" : " " + aConfirmer("date provisoire")) : aConfirmer("date à confirmer") },
      { emoji: "🕙", valeur: texte(co.horaires) ? esc(co.horaires) : (debut ? `À partir de ${heure(debut)}` : aConfirmer("horaire à confirmer")) },
      { emoji: "📍", valeur: texte(co.lieu) ? esc(co.lieu) : aConfirmer("lieu à confirmer") },
      { emoji: "📺", valeur: live ? `Live sur ${esc(hote)}` : aConfirmer("lien du live à venir") },
    ];
  }
  function rendreInfosCourse() {
    const html2 = infosCourse().map((i) => `<li><span aria-hidden="true">${i.emoji}</span> ${i.valeur}</li>`).join("");
    $("#infos-course").innerHTML = html2;
    $("#infos-direct").innerHTML = html2;
    const co = C.course || {};
    if (texte(co.info)) {
      const chip = `<li><span aria-hidden="true">🏟️</span> ${esc(co.info)}</li>`;
      $("#infos-course").insertAdjacentHTML("beforeend", chip);
      $("#infos-direct").insertAdjacentHTML("beforeend", chip);
    }
    if (texte(co.depart)) {
      $("#infos-course").insertAdjacentHTML("beforeend", `<li><span aria-hidden="true">🚦</span> ${esc(co.depart)}</li>`);
    }
    const strava = urlValide("strava");
    if (strava) {
      const p = $("#strava-lien");
      p.innerHTML = `<a class="lien-strava" href="${esc(strava)}" target="_blank" rel="noopener">Rejoindre le club Strava du projet</a>`;
      p.hidden = false;
    }
  }

  function rendreClassement() {
    const bloc = $("#classement-km");
    if (!coureurs.length) {
      bloc.innerHTML = `<div class="vide"><p>Les kilomètres s'afficheront ici dès que les premiers coureurs seront inscrits.</p></div>`;
      return;
    }
    const tries = coureurs.slice().sort((a, b) => b.km - a.km || a.prenom.localeCompare(b.prenom));
    bloc.innerHTML = `<ol class="classement-liste">${tries.slice(0, 10).map((c, i) => `
        <li><span class="classement-rang" aria-hidden="true">${i + 1}</span>
          <span>${esc(c.prenom)} <span class="statut ${c.kmVerifies ? "statut-verifie" : "statut-attente"}">${c.kmVerifies ? "vérifié" : "en attente"}</span></span>
          <span class="classement-km">${esc(km(c.km))} km</span></li>`).join("")}</ol>
      <p class="classement-total"><strong>${esc(km(kmTotal))} km</strong> parcourus au total par ${esc(entier(coureurs.length))} coureur${coureurs.length > 1 ? "s" : ""}.</p>`;
  }

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
        <p class="live-info-titre">${apres ? "La course est terminée. Merci !" : e === "direct" ? "Le live est en cours" : "Rendez-vous le jour de la course"}</p>
        <p>${apres ? "Le replay peut rester disponible quelques jours sur la chaîne." : "Suivez la chaîne pour être prévenu du départ."}</p>
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
    ecran.innerHTML = `<iframe class="live-iframe" src="https://player.twitch.tv/?channel=${encodeURIComponent(chaine)}&parent=${encodeURIComponent(domaine)}&autoplay=true" title="Live de la course" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }


  /* ───────────────────── Tombola, collecte, transparence, équipe ───────────────────── */

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
    const site = /^https:\/\/\S+\.\S+$/.test(texte(a.site)) ? texte(a.site) : "";
    if (site) { $("#asso-site").href = site; $("#asso-site-ligne").hidden = false; }

    const rotations = [-2, 1.5, -1.2, 2];
    const silhouette = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="38" r="18" fill="#16161b" opacity=".25"/><path d="M14 96 C 18 66, 34 58, 50 58 C 66 58, 82 66, 86 96 Z" fill="#16161b" opacity=".25"/></svg>';
    $("#equipe").innerHTML = (C.equipe || []).map((m, i) => {
      const prenom = texte(m.nom || m.prenom);
      const photo = texte(m.photo)
        ? `<img src="${esc(m.photo)}" alt="Photo de ${esc(prenom || "l'équipe")}" loading="lazy" decoding="async">`
        : silhouette;
      return `<li class="polaroid" style="--rot:${rotations[i % rotations.length]}deg">
          <div class="polaroid-photo">${photo}</div>
          <p class="polaroid-nom">${prenom ? esc(prenom) : aConfirmer("prénom à ajouter")}</p>
          ${texte(m.role) ? `<p class="polaroid-role">${esc(m.role)}</p>` : ""}
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

  function initInteractions() {
    // Boutons « je m'engage » et « retirer », où qu'ils soient
    document.addEventListener("click", (e) => {
      const engager = e.target.closest("[data-engager]");
      if (engager) { ouvrirEngagement(engager.dataset.engager); return; }
      const retirer = e.target.closest("[data-retirer]");
      if (retirer) {
        stock.engagements = stock.engagements.filter((x) => x.dossard !== retirer.dataset.retirer);
        ecrireStock();
        rendreCoureurs();
        rendrePanier();
      }
    });
    const recherche = $("#recherche-coureur");
    if (recherche) recherche.addEventListener("input", () => filtrerCoureurs(recherche.value));

    $("#montants-suggeres").addEventListener("click", (e) => {
      const b = e.target.closest(".montant-choix");
      if (!b) return;
      $("#par-km").value = b.dataset.montant;
      majEstimation();
    });
    $("#par-km").addEventListener("input", majEstimation);
    $("#plafond").addEventListener("input", majEstimation);
    $("#valider-engagement").addEventListener("click", validerEngagement);
    $("#annuler-engagement").addEventListener("click", () => {
      const d = $("#modale-engagement");
      if (typeof d.close === "function") d.close(); else d.removeAttribute("open");
    });
    const boutonDoc = $("[data-ouvre='modale-document']");
    if (boutonDoc) boutonDoc.addEventListener("click", () => { rendreApercuDocument(); rendreEnvoiDocument(); });
    initDocument();

    // Lien de partage d'un coureur : ?coureur=7
    const demande = texte(params.get("coureur"));
    if (demande && parDossard.has(demande)) {
      const carte = $(`#liste-coureurs [data-dossard="${CSS.escape(demande)}"]`);
      if (carte) carte.scrollIntoView({ block: "center" });
      ouvrirEngagement(demande);
    }
  }


  /* ───────────────────── C'est parti ───────────────────── */

  function lancer(nom, fn) {
    try { fn(); } catch (err) { console.error(`GEAnérosité : problème dans « ${nom} ». Vérifie cette partie de js/config.js.`, err); }
  }

  if (brouillon) {
    html.classList.add("brouillon");
    $("#bandeau-brouillon").hidden = false;
    console.info("GEAnérosité (mode brouillon) : pour tester, ajoute ?etat=direct, ?etat=apres ou ?coureur=1 à l'adresse.");
  }

  lancer("textes", appliquerTextes);
  lancer("liens", () => appliquerLiens(document));
  lancer("tableau d'affichage", rendreLedCagnotte);
  lancer("compteurs", rendreCompteurs);
  lancer("cagnotte et paliers", rendreCagnotte);
  lancer("infos de la course", rendreInfosCourse);
  lancer("liste des coureurs", rendreCoureurs);
  lancer("mes engagements", rendrePanier);
  lancer("classement des kilomètres", rendreClassement);
  lancer("tombola", rendreTombola);
  lancer("collecte", rendreCollecte);
  lancer("transparence", rendreTransparence);
  lancer("association et équipe", rendreQui);
  lancer("agenda", initAgenda);
  lancer("compte à rebours", () => { tic(); setInterval(tic, 1000); });
  lancer("interactions", initInteractions);
  lancer("feuille de calcul des coureurs", chargerFeuilleCoureurs);
  lancer("typographie", () => typographie(document.body));
})();
