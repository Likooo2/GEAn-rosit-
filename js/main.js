/* ════════════════════════════════════════════════════════════════════
   VÉLO CHAOS : la soirée maudite — script principal
   Pas besoin de toucher à ce fichier : tout se règle dans js/config.js.

   Astuces pour tester l'affichage sans rien modifier :
     index.html?etat=avant    → compte à rebours
     index.html?etat=direct   → « EN DIRECT »
     index.html?etat=apres    → « Merci ! » et résultats
     index.html?maintenant=2026-11-13T20:30  → simule une date et une heure
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
    console.error("VÉLO CHAOS : js/config.js est introuvable ou contient une erreur (virgule ou guillemet oublié ?).");
    return;
  }

  const C = CONFIG;
  const L = C.liens || {};
  const TZ = "Europe/Paris";
  const params = new URLSearchParams(window.location.search);


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

  const formatEuros0 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuros2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function euros(v) {
    const n = Math.round((Number(v) || 0) * 100) / 100;
    const texte = Number.isInteger(n) ? formatEuros0.format(n) : formatEuros2.format(n);
    return texte.replace(/[\u202F\u2009]/g, "\u00A0"); // nos polices n'ont pas l'espace fine
  }

  // Dates : "2026-11-13T19:00:00+01:00" (ou "2026-11-13") → objet Date
  function lireDate(v) {
    if (!v) return null;
    let s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += "T12:00:00";
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ":00";
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(s)) s += "+01:00"; // heure de Paris (hiver)
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  const dates = C.dates || {};
  const D = {
    debutLive: lireDate(dates.debutLive) || lireDate("2026-11-13T19:00"),
    finLive: lireDate(dates.finLive) || lireDate("2026-11-13T22:00"),
    clotureParis: lireDate(dates.clotureParis) || lireDate("2026-11-13T18:00"),
    distribution: lireDate(dates.distribution) || lireDate("2026-11-21"),
  };

  // Horloge (simulable avec ?maintenant=2026-11-13T20:00)
  let decalage = 0;
  const simulation = lireDate(params.get("maintenant"));
  if (simulation) decalage = simulation.getTime() - Date.now();
  const maintenant = () => new Date(Date.now() + decalage);

  const fJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const fJourCourt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const fHeure = new Intl.DateTimeFormat("fr-FR", { hour: "numeric", minute: "2-digit", hourCycle: "h23", timeZone: TZ });
  const fCle = new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });
  const cleJour = (d) => fCle.format(d); // → "2026-11-13"
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
      case "JourCourt": return majuscule(fJourCourt.format(d));
      case "heure": return heure(d, false);
      case "heure00": return heure(d, true);
      default: return fJour.format(d);
    }
  }

  // Avant / pendant / après le live
  function etatForce() {
    const v = String(params.get("etat") || C.forcerEtat || "").toLowerCase().replace("è", "e");
    return ["avant", "direct", "apres"].includes(v) ? v : "";
  }
  function etatActuel() {
    const force = etatForce();
    if (force) return force;
    const t = maintenant();
    if (t < D.debutLive) return "avant";
    if (t < D.finLive) return "direct";
    return "apres";
  }
  const parisClos = () => etatActuel() !== "avant" || maintenant() >= D.clotureParis;

  function lien(cle) {
    if (cle === "sabotages") return L.sabotagesHelloAsso || L.donsHelloAsso || "#donner";
    return L[cle] || "#";
  }

  // Espaces insécables à la française (avant ? ! : ; et entre un nombre et €, %, km)
  function typographie(racine) {
    if (!racine) return;
    const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && !n.parentElement.closest("script, style, code")
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
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

  // Compteur qui défile de 0 jusqu'au montant
  function compter(el, cible, duree) {
    if (!el) return;
    if (mouvementReduit || cible <= 0) { el.textContent = euros(cible); return; }
    const debut = performance.now();
    const pas = (t) => {
      const k = Math.min(1, (t - debut) / (duree || 1200));
      const v = cible * (1 - Math.pow(1 - k, 3));
      el.textContent = euros(k < 1 ? Math.round(v) : cible);
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }

  // Remplace une photo introuvable par l'emoji prévu
  function secoursImages(racine, selecteurParent, classeEmoji) {
    $$("img", racine).forEach((img) => {
      img.addEventListener("error", () => {
        const parent = img.closest(selecteurParent);
        const span = document.createElement("span");
        span.className = classeEmoji;
        span.setAttribute("aria-hidden", "true");
        span.textContent = (parent && parent.dataset.emoji) || "🎁";
        console.warn("VÉLO CHAOS : image introuvable → " + img.getAttribute("src"));
        img.replaceWith(span);
      }, { once: true });
    });
  }


  /* ───────────────────── Textes et liens simples ───────────────────── */

  function appliquerLiaisons() {
    $$("[data-bind]").forEach((el) => {
      const v = lire(el.dataset.bind);
      if (v !== undefined && v !== null && v !== "") el.textContent = v;
    });
    $$("[data-date]").forEach((el) => {
      const d = D[el.dataset.date];
      if (d) el.textContent = formaterDate(d, el.dataset.format);
    });
    $$("[data-lien]").forEach((a) => {
      const cle = a.dataset.lien;
      if (cle === "email") {
        if (L.email) {
          a.href = "mailto:" + L.email;
          if (a.hasAttribute("data-afficher")) a.textContent = L.email;
        }
        return;
      }
      const url = lien(cle);
      a.href = url;
      if (url.charAt(0) === "#") { a.removeAttribute("target"); a.removeAttribute("rel"); }
    });
  }


  /* ───────────────────── 1. L'écran du compteur (accueil) ───────────────────── */

  const montant = Math.max(0, nombre(C.cagnotte && C.cagnotte.montant) || 0);
  const objectif = Math.max(1, nombre(C.cagnotte && C.cagnotte.objectif) || 1);
  const pourcent = (montant / objectif) * 100;
  const pourcentTexte = Math.floor(pourcent) + "\u00A0%";

  // Chiffres « 7 segments » dessinés en SVG
  const SEGMENTS = {
    a: "8,5 12,1 38,1 42,5 38,9 12,9",
    b: "45,8 49,12 49,38 45,42 41,38 41,12",
    c: "45,48 49,52 49,78 45,82 41,78 41,52",
    d: "8,85 12,81 38,81 42,85 38,89 12,89",
    e: "5,48 9,52 9,78 5,82 1,78 1,52",
    f: "5,8 9,12 9,38 5,42 1,38 1,12",
    g: "8,45 12,41 38,41 42,45 38,49 12,49",
  };
  const ALLUMES = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
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
      const texte = String(valeurs[i] ?? "").padStart(svgs.length, "0").slice(-svgs.length);
      svgs.forEach((svg, k) => afficherChiffre(svg, texte[k]));
    });
  }
  const deux = (n) => String(n).padStart(2, "0");
  const point = (texte) => (/[.!?…]$/.test(texte) ? "" : "."); // évite « Camille B.. »

  function rendreMiniJauge() {
    const n = 20;
    let pleins = Math.round((Math.min(100, pourcent) / 100) * n);
    if (montant > 0) pleins = Math.max(1, pleins);
    $("#lcd-segments").innerHTML = Array.from({ length: n }, (_, i) =>
      `<span class="lcd-seg${i < pleins ? " plein" : ""}" style="--i:${i}"></span>`).join("");
    $("#lcd-objectif").textContent = euros(objectif);
    $("#lcd-pourcent").textContent = pourcentTexte;
    compter($("#lcd-montant"), montant, 500 + pleins * 55);
  }

  let etatCourant = null;
  let parisClosCourant = null;
  const titreOriginal = document.title;

  function rendreEtat(e) {
    html.dataset.etat = e;
    const lcd = $("#lcd");
    const titre = $("#lcd-titre");
    const message = $("#lcd-message");
    const zone = $("#lcd-chiffres");
    lcd.dataset.mode = e;

    if (e === "avant") {
      titre.textContent = "Le chaos commence dans";
      construireEcran([{ label: "jours" }, { label: "heures" }, { label: "min" }, { label: "sec" }]);
      message.textContent = "";
      zone.setAttribute("aria-label", `Compte à rebours jusqu'au début du live, le ${formaterDate(D.debutLive, "jour")} à ${heure(D.debutLive)}`);
    } else if (e === "direct") {
      titre.innerHTML = '<span class="point-direct" aria-hidden="true"></span>En direct';
      construireEcran([{ label: "h", nb: 1 }, { label: "min" }, { label: "sec" }]);
      message.textContent = `Temps de souffrance écoulé. Fin prévue à ${heure(D.finLive)}.`;
      zone.setAttribute("aria-label", `Le live est en cours jusqu'à ${heure(D.finLive)}`);
    } else {
      titre.textContent = "Merci !";
      const km = nombre(C.resultat && C.resultat.km);
      if (km !== null) {
        const k = String(Math.round(km));
        construireEcran([{ label: "km parcourus", nb: Math.max(2, k.length) }]);
        majEcran([k]);
        const gagnant = String((C.resultat && C.resultat.gagnant) || "").trim();
        message.textContent = gagnant ? `Pari remporté par ${gagnant}${point(gagnant)} Bravo !` : "Le nom du gagnant arrive très vite.";
        zone.setAttribute("aria-label", `Distance officielle : ${k} kilomètres`);
      } else {
        construireEcran([]);
        message.textContent = "Le résultat officiel arrive très vite, ici même.";
        zone.removeAttribute("aria-label");
      }
    }

    const boutonLive = $("#hero-live");
    boutonLive.textContent = e === "direct" ? "Regarder le live" : e === "apres" ? "Revoir le live" : "Voir le live";
    boutonLive.classList.toggle("est-direct", e === "direct");
    const agenda = $(".hero-agenda");
    if (agenda) agenda.hidden = e !== "avant";
    document.title = e === "direct" ? "🔴 EN DIRECT : " + titreOriginal : titreOriginal;

    rendreLive(e);
    rendreParisEtat();
    typographie(lcd);
  }

  function tic() {
    const e = etatActuel();
    if (e !== etatCourant) { etatCourant = e; rendreEtat(e); }
    const t = maintenant().getTime();
    if (e === "avant") {
      let s = Math.max(0, Math.floor((D.debutLive.getTime() - t) / 1000));
      const j = Math.floor(s / 86400); s -= j * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      majEcran([deux(Math.min(j, 99)), deux(h), deux(m), deux(s)]);
    } else if (e === "direct") {
      let s = Math.max(0, Math.floor((t - D.debutLive.getTime()) / 1000));
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      majEcran([String(Math.min(h, 9)), deux(m), deux(s)]);
    }
    const clos = parisClos();
    if (clos !== parisClosCourant) { parisClosCourant = clos; rendreParisEtat(); }
  }

  // Boutons « Ajouter à mon agenda »
  function initAgenda() {
    const asso = (C.association && C.association.nom) || "une association solidaire";
    const titre = "VÉLO CHAOS : la soirée maudite (live Twitch)";
    const details = `3 heures de vélo en direct au profit de ${asso}. Le live : ${L.twitch || "sur Twitch"}`;
    const ics = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const google = new URLSearchParams({
      action: "TEMPLATE", text: titre, details, location: L.twitch || "Twitch",
      dates: `${ics(D.debutLive)}/${ics(D.finLive)}`,
    });
    $("#agenda-google").href = "https://calendar.google.com/calendar/render?" + google.toString();

    const echap = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    const fichier = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Velo Chaos//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:velo-chaos-" + ics(D.debutLive) + "@velochaos",
      "DTSTAMP:" + ics(new Date()),
      "DTSTART:" + ics(D.debutLive),
      "DTEND:" + ics(D.finLive),
      "SUMMARY:" + echap(titre),
      "DESCRIPTION:" + echap(details),
      "LOCATION:" + echap(L.twitch || "Twitch"),
      "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:" + echap("Le Vélo Chaos commence dans 30 minutes !"), "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    try {
      $("#agenda-ics").href = URL.createObjectURL(new Blob([fichier], { type: "text/calendar;charset=utf-8" }));
    } catch (err) {
      $("#agenda-ics").hidden = true;
    }
  }


  /* ───────────────────── 2. La jauge (l'échelle) ───────────────────── */

  function rendreJauge() {
    $("#jauge-objectif").textContent = euros(objectif);
    $("#jauge-pourcent").textContent = pourcentTexte;
    const compteur = $("#compteur");
    compteur.setAttribute("aria-valuemax", String(Math.max(objectif, montant)));
    compteur.setAttribute("aria-valuenow", String(montant));
    compteur.setAttribute("aria-valuetext", `${euros(montant)} récoltés sur ${euros(objectif)}, soit ${pourcentTexte} de l'objectif`);
    quandVisible(compteur, () => compter($("#jauge-montant"), montant, 1300), 0.6);

    const paliers = (Array.isArray(C.paliers) ? C.paliers : [])
      .filter((p) => p && nombre(p.montant) !== null)
      .map((p) => Object.assign({}, p, { montant: Number(p.montant) }))
      .sort((a, b) => a.montant - b.montant);
    const n = paliers.length;
    const bilan = $("#jauge-bilan");
    if (!n) { bilan.hidden = true; return; }

    // Hauteur de remplissage de l'échelle (0 = en bas, n - 0,5 = tout en haut)
    let niveau;
    if (montant <= 0) niveau = -0.5;
    else if (montant < paliers[0].montant) niveau = -0.5 + 0.5 * (montant / paliers[0].montant);
    else {
      niveau = n - 0.5;
      for (let i = 0; i < n - 1; i++) {
        if (montant < paliers[i + 1].montant) {
          niveau = i + (montant - paliers[i].montant) / (paliers[i + 1].montant - paliers[i].montant);
          break;
        }
      }
    }
    const iProchain = paliers.findIndex((p) => montant < p.montant);
    const nbDebloques = paliers.filter((p) => montant >= p.montant).length;
    const cadenas = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="2.5" y="7" width="11" height="8" rx="1.8" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';

    $("#echelle").innerHTML = paliers.map((p, i) => {
      const debloque = montant >= p.montant;
      const prochain = i === iProchain;
      const remplissage = Math.max(0, Math.min(1, niveau - (i - 0.5)));
      let progression = "";
      if (prochain) {
        const precedent = i > 0 ? paliers[i - 1].montant : 0;
        const k = Math.max(0, Math.min(1, (montant - precedent) / (p.montant - precedent)));
        progression = `<div class="palier-progression">
            <div class="mini-barre" aria-hidden="true"><span style="--p:${k.toFixed(3)}"></span></div>
            <p class="palier-reste">Plus que ${euros(p.montant - montant)} !</p>
          </div>`;
      }
      return `<li class="palier ${debloque ? "est-debloque" : prochain ? "est-prochain" : "est-verrouille"}" style="--fill:${remplissage.toFixed(3)};--ordre:${i}">
          <div class="echelon" aria-hidden="true"><span class="echelon-plein"></span><span class="barreau"></span></div>
          <div class="palier-carte">
            <div class="palier-haut">
              <span class="palier-montant">${euros(p.montant)}</span>
              <span class="palier-statut">${debloque ? "Débloqué" : cadenas + "Verrouillé"}</span>
            </div>
            <p class="palier-texte">${p.emoji ? `<span class="palier-emoji" aria-hidden="true">${esc(p.emoji)}</span> ` : ""}${esc(p.texte)}</p>
            ${progression}
          </div>
        </li>`;
    }).reverse().join(""); // le palier le plus haut en premier, comme une vraie échelle

    // L'animation démarre quand le bas de l'échelle est visible
    const echelle = $("#echelle");
    quandVisible(echelle.lastElementChild || echelle, () => echelle.classList.add("revele"), 0.6);

    if (iProchain === -1) {
      bilan.innerHTML = "<strong>Tous les paliers sont débloqués !</strong> Vous êtes incroyables. Mes jambes, un peu moins.";
    } else {
      const reste = paliers[iProchain].montant - montant;
      bilan.innerHTML = `<strong>${nbDebloques} ${nbDebloques > 1 ? "paliers débloqués" : "palier débloqué"} sur ${n}.</strong> Prochain palier à ${euros(paliers[iProchain].montant)} : plus que ${euros(reste)}.`;
    }
    bilan.hidden = false;
  }


  /* ───────────────────── 3. Le défi : cartes et live ───────────────────── */

  function carte(item, type) {
    return `<li class="carte-jeu">
        <div class="carte-cadre">
          <div class="carte-haut">
            <span class="carte-prix" data-exemple><span class="sr-only">Prix : </span>${euros(item.prix)}</span>
            <span class="carte-type">${type}</span>
          </div>
          <span class="carte-art" aria-hidden="true">${esc(item.emoji || "")}</span>
          <h4 class="carte-nom">${esc(item.nom)}</h4>
          ${item.effet ? `<p class="carte-effet">${esc(item.effet)}</p>` : ""}
        </div>
      </li>`;
  }
  function rendreDefi() {
    const d = C.defi || {};
    $("#cartes-sabotages").innerHTML = (d.sabotages || []).map((s) => carte(s, "Sabotage")).join("");
    $("#cartes-boosts").innerHTML = (d.boosts || []).map((b) => carte(b, "Boost")).join("");
  }

  function chaineTwitch() {
    try { return new URL(L.twitch).pathname.split("/").filter(Boolean)[0] || ""; } catch (err) { return ""; }
  }
  // Le lecteur Twitch ne se charge que si on appuie dessus (page plus légère, pas de cookies sans action)
  function rendreLive(e) {
    const ecran = $("#live-ecran");
    if (!ecran || ecran.querySelector("iframe")) return;
    const url = esc(L.twitch || "#");
    const jourJ = e === "direct" || (e === "avant" && cleJour(maintenant()) === cleJour(D.debutLive));
    ecran.classList.remove("a-info");
    if (jourJ) {
      ecran.innerHTML = `<button class="live-lancer" type="button">
          <span class="live-play" aria-hidden="true"></span>
          <span class="live-lancer-texte">${e === "direct" ? "C'est parti : lance le live ici" : `Le live démarre à ${heure(D.debutLive)} : lance le lecteur ici`}</span>
        </button>
        <p class="live-note">Le lecteur Twitch se charge seulement si tu appuies.</p>`;
      $(".live-lancer", ecran).addEventListener("click", () => chargerLecteur(ecran));
    } else {
      const apres = e === "apres";
      ecran.classList.add("a-info");
      ecran.innerHTML = `<div class="live-info">
          <p class="live-info-titre">${apres ? "Le live est terminé. Merci !" : "Le lecteur apparaîtra ici le jour J"}</p>
          <p>${apres ? "Le replay reste disponible quelques jours sur la chaîne." : `Rendez-vous le ${formaterDate(D.debutLive, "jourCourt")} à ${heure(D.debutLive)}. D'ici là, suis la chaîne pour recevoir une notif au lancement.`}</p>
          <a class="bouton bouton-twitch" href="${url}" target="_blank" rel="noopener" data-exemple>${apres ? "Revoir le live sur Twitch" : "Suivre la chaîne sur Twitch"}</a>
        </div>`;
    }
    typographie(ecran);
  }
  function chargerLecteur(ecran) {
    const chaine = chaineTwitch();
    const domaine = window.location.hostname;
    if (!chaine || !domaine) {
      ecran.classList.add("a-info");
      ecran.innerHTML = `<div class="live-info">
          <p class="live-info-titre">Le lecteur s'affiche seulement sur le site en ligne</p>
          <p>Twitch bloque son lecteur quand la page est ouverte depuis un fichier sur l'ordinateur. En attendant :</p>
          <a class="bouton bouton-twitch" href="${esc(L.twitch || "#")}" target="_blank" rel="noopener">Ouvrir le live sur Twitch</a>
        </div>`;
      typographie(ecran);
      return;
    }
    const src = `https://player.twitch.tv/?channel=${encodeURIComponent(chaine)}&parent=${encodeURIComponent(domaine)}&autoplay=true&muted=false`;
    ecran.classList.remove("a-info");
    ecran.innerHTML = `<iframe class="live-iframe" src="${src}" title="Live Twitch du Vélo Chaos" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }


  /* ───────────────────── 4. Les paris ───────────────────── */

  let totalParieurs = 0;

  // style : "court" (graphique), "phrase" (entre 60 et 69 km) ou rien (de 60 à 69 km)
  function libelleTranche(t, style) {
    const de = nombre(t.de);
    const a = nombre(t.a);
    const court = style === true || style === "court";
    if (de === null || de <= 0) return court ? `< ${(a ?? 0) + 1}` : `moins de ${(a ?? 0) + 1} km`;
    if (a === null) return court ? `${de} +` : style === "phrase" ? `${de} km ou plus` : `${de} km et plus`;
    if (court) return `${de}-${a}`;
    return style === "phrase" ? `entre ${de} et ${a} km` : `de ${de} à ${a} km`;
  }

  function rendreParis() {
    const cp = C.compteurParis || {};
    const tranches = Array.isArray(cp.tranches) ? cp.tranches : [];
    const valeurs = tranches.map((t) => Math.max(0, Math.round(nombre(t.parieurs) || 0)));
    const somme = valeurs.reduce((a, b) => a + b, 0);
    totalParieurs = nombre(cp.totalParieurs) ?? somme;
    const max = Math.max(1, ...valeurs);
    const km = nombre(C.resultat && C.resultat.km);
    const kmArrondi = km === null ? null : Math.round(km);
    const iResultat = kmArrondi === null ? -1 : tranches.findIndex((t) => {
      const de = nombre(t.de) ?? -Infinity;
      const a = nombre(t.a);
      return kmArrondi >= de && (a === null || kmArrondi <= a);
    });
    const iTop = somme > 0 ? valeurs.indexOf(Math.max(...valeurs)) : -1;

    const liste = $("#barres");
    liste.style.setProperty("--n", Math.max(1, tranches.length));
    liste.innerHTML = tranches.map((t, i) => {
      const v = valeurs[i];
      const classes = ["barre", i === iResultat ? "est-resultat" : "", iResultat < 0 && i === iTop ? "est-top" : ""].join(" ").trim();
      return `<li class="${classes}" style="--h:${(v / max).toFixed(3)}">
          <span class="barre-zone" aria-hidden="true"><span class="barre-valeur">${v}</span><span class="barre-colonne"></span></span>
          <span class="barre-label" aria-hidden="true">${esc(libelleTranche(t, true))}</span>
          <span class="sr-only">${esc(libelleTranche(t))} : ${v} ${v > 1 ? "parieurs" : "parieur"}</span>
        </li>`;
    }).join("");

    let commentaire = "";
    if (iResultat >= 0) {
      commentaire = `Résultat officiel : ${kmArrondi} km. Bravo à celles et ceux qui ont misé ${libelleTranche(tranches[iResultat], "phrase")} !`;
    } else if (somme === 0) {
      commentaire = "Personne n'a encore parié. La place de premier est libre.";
    } else {
      const position = tranches.length > 1 ? iTop / (tranches.length - 1) : 0.5;
      const zone = libelleTranche(tranches[iTop]);
      commentaire = position < 0.34 ? `Le plus de paris : ${zone}. Vexé. Très vexé.`
        : position < 0.67 ? `Le plus de paris : ${zone}. Vous me voyez dans la moyenne. Merci ?`
        : `Le plus de paris : ${zone}. Vous croyez beaucoup trop en moi.`;
    }
    $("#graphique-commentaire").textContent = commentaire;
  }

  function rendreParisEtat() {
    const clos = parisClos();
    const e = etatActuel();

    const boutonHero = $("#hero-parier");
    if (boutonHero) boutonHero.textContent = clos ? "Voir les paris" : "Je parie (1\u00A0€)";

    const action = $("#paris-action");
    if (action) {
      action.innerHTML = clos
        ? `<p class="paris-clos"><strong>Les paris sont clos</strong>Depuis le ${formaterDate(D.clotureParis, "jourCourt")} à ${heure(D.clotureParis, true)}. Merci à tous les parieurs !</p>`
        : `<a class="bouton bouton-poisse" href="${esc(L.parisHelloAsso || "#")}" target="_blank" rel="noopener" data-exemple>Je parie 1 €</a>
           <p class="bulletin-note">Paiement sécurisé sur HelloAsso, où tu indiques ton pronostic en km.</p>`;
    }

    const total = $("#graphique-total");
    if (total) total.innerHTML = `<strong>${totalParieurs}</strong> ${totalParieurs > 1 ? "parieurs" : "parieur"} ${clos ? "au total" : "pour l'instant"}`;

    const resultat = $("#paris-resultat");
    if (resultat) {
      if (e === "apres") {
        const km = nombre(C.resultat && C.resultat.km);
        const gagnant = String((C.resultat && C.resultat.gagnant) || "").trim();
        resultat.innerHTML = km !== null
          ? `<p class="resultat-titre">Résultat officiel</p>
             <p class="resultat-km">${Math.round(km)} km</p>
             <p class="resultat-gagnant">${gagnant ? `Pari remporté par <strong>${esc(gagnant)}</strong>${point(gagnant)} Bravo !` : "Le nom du gagnant arrive très vite."}</p>`
          : `<p class="resultat-titre">Résultat officiel</p>
             <p class="resultat-gagnant">On relit le compteur et on affiche la distance ici très vite.</p>`;
        resultat.hidden = false;
      } else {
        resultat.hidden = true;
      }
    }
    typographie($("#paris"));
  }


  /* ───────────────────── 5. La tombola ───────────────────── */

  function rendreTombola() {
    const t = C.tombola || {};
    $("#prix-billet").textContent = euros(t.prixBillet);
    $("#points-de-vente").innerHTML = (t.pointsDeVente || []).map((p) => `<li>${esc(p)}</li>`).join("");
    const gagnants = (C.resultat && Array.isArray(C.resultat.tombola)) ? C.resultat.tombola : [];
    $("#lots").innerHTML = (t.lots || []).map((lot, i) => {
      const numero = gagnants[i] ? String(gagnants[i]).trim() : "";
      const visuel = lot.photo
        ? `<img src="${esc(lot.photo)}" alt="${esc(lot.nom)}" width="300" height="300" loading="lazy" decoding="async">`
        : `<span class="lot-emoji" aria-hidden="true">${esc(lot.emoji || "🎁")}</span>`;
      return `<li class="lot">
          <div class="lot-visuel" data-emoji="${esc(lot.emoji || "🎁")}">${visuel}</div>
          <div>
            <p class="lot-numero">Lot n° ${i + 1}</p>
            <h4 class="lot-nom" data-exemple>${esc(lot.nom)}</h4>
            ${lot.partenaire ? `<p class="lot-partenaire">Offert par <strong data-exemple>${esc(lot.partenaire)}</strong></p>` : ""}
            ${numero ? `<p class="lot-gagnant">Billet gagnant : n° ${esc(numero)}</p>` : ""}
          </div>
        </li>`;
    }).join("");
    secoursImages($("#lots"), ".lot-visuel", "lot-emoji");

    if (gagnants.some((g) => String(g).trim())) {
      const annonce = document.createElement("p");
      annonce.className = "tombola-annonce";
      annonce.innerHTML = "<strong>Le tirage a eu lieu !</strong> Les numéros gagnants sont indiqués sous chaque lot. Pour récupérer ton lot, tout est expliqué dans la <a href=\"#faq\">FAQ</a>.";
      $("#lots").before(annonce);
    }
  }


  /* ───────────────────── 6. Les dons ───────────────────── */

  function rendreDons() {
    const d = C.dons || {};
    $("#equivalences").innerHTML = (d.equivalences || []).map((x) => `<li class="etiquette">
        <span class="etiquette-trou" aria-hidden="true"></span>
        <span class="etiquette-montant">${euros(x.montant)}</span>
        ${x.emoji ? `<span class="etiquette-emoji" aria-hidden="true">${esc(x.emoji)}</span>` : ""}
        <span class="etiquette-objet">${esc(x.objet)}</span>
      </li>`).join("");

    const deduction = $("#deduction");
    if (d.deductible) {
      const taux = nombre(d.tauxDeduction) ?? 66;
      const exemple = nombre(d.exempleDeduction) ?? 30;
      const cout = Math.round(exemple * (100 - taux)) / 100;
      deduction.innerHTML = `Ton don est déductible à ${taux} % de tes impôts. Concrètement, si tu es imposable, ${euros(exemple)} donnés ne te coûtent que <strong>${euros(cout)}</strong>. L'association te délivre un reçu fiscal.`;
      deduction.hidden = false;
    } else {
      deduction.hidden = true;
    }

    // Formulaire HelloAsso intégré dans la page (facultatif)
    const widget = String(L.donsWidget || "").trim();
    if (/^https:\/\/([a-z0-9-]+\.)*helloasso\.com\//i.test(widget)) {
      const bloc = $("#widget-dons");
      const iframe = document.createElement("iframe");
      iframe.src = widget;
      iframe.title = "Formulaire de don HelloAsso";
      iframe.loading = "lazy";
      bloc.appendChild(iframe);
      bloc.hidden = false;
      window.addEventListener("message", (ev) => {
        try { if (!/(^|\.)helloasso\.com$/.test(new URL(ev.origin).hostname)) return; } catch (err) { return; }
        const h = ev.data && Number(ev.data.height);
        if (h > 100) iframe.style.height = h + "px";
      });
    }
  }


  /* ───────────────────── 7. Le projet et l'association ───────────────────── */

  function logo(el, src, alt, texte) {
    if (!el) return;
    el.innerHTML = src
      ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`
      : `<span class="${el.id === "asso-logo" ? "asso-logo-texte" : "pied-logo-texte"}" data-exemple>${esc(texte)}</span>`;
  }

  function rendreProjet() {
    const a = C.association || {};
    logo($("#asso-logo"), a.logo, "Logo de " + (a.nom || "l'association"), a.nom || "Logo");
    logo($("#logo-asso"), a.logo, "Logo de " + (a.nom || "l'association"), a.nom || "Association");
    logo($("#logo-iut"), C.logoIUT, "Logo de l'IUT d'Amiens", "IUT d'Amiens");

    $("#asso-presentation").innerHTML = (a.presentation || []).map((p) => `<p>${esc(p)}</p>`).join("");
    const site = String(a.site || "").trim();
    if (site) { $("#asso-site").href = site; $("#asso-site-ligne").hidden = false; }
    const chiffres = a.chiffres || [];
    $("#asso-chiffres").innerHTML = chiffres.map((c) =>
      `<li><span class="chiffre-valeur">${esc(c.valeur)}</span><span class="chiffre-texte">${esc(c.texte)}</span></li>`).join("");
    $("#asso-chiffres").hidden = !chiffres.length;

    const col = C.collecte || {};
    $("#collecte-lieux").innerHTML = (col.lieux || []).map((l) => `<li><strong>${esc(l.ou)}</strong><span>${esc(l.quand)}</span></li>`).join("");
    $("#collecte-oui").innerHTML = (col.onCollecte || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#collecte-non").innerHTML = (col.onNeCollectePas || []).map((x) => `<li>${esc(x)}</li>`).join("");

    rendreFrise();
    rendreEquipe();
  }

  function rendreFrise() {
    const aujourdHui = cleJour(maintenant());
    const etapes = (C.frise || []).map((f) => {
      const debut = String(f.debut || "");
      const fin = String(f.fin || f.debut || "");
      let statut = "a-venir";
      if (fin && aujourdHui > fin) statut = "fait";
      else if (debut && aujourdHui >= debut) statut = "en-cours";
      return Object.assign({}, f, { statut });
    });
    if (!etapes.some((x) => x.statut === "en-cours")) {
      const k = etapes.findIndex((x) => x.statut === "a-venir");
      if (k >= 0) etapes[k].statut = "prochaine";
    }
    const frise = $("#frise");
    frise.style.setProperty("--n", Math.max(1, etapes.length));
    frise.innerHTML = etapes.map((x) => {
      const badge = x.statut === "en-cours" ? '<span class="etape-badge">On en est là</span>'
        : x.statut === "prochaine" ? '<span class="etape-badge">Prochaine étape</span>'
        : x.statut === "fait" ? '<span class="sr-only">(étape terminée)</span>' : "";
      return `<li class="etape etape-${x.statut}">
          <span class="etape-point" aria-hidden="true"></span>
          <p class="etape-date">${esc(x.quand)}</p>
          <h4 class="etape-titre">${esc(x.titre)}</h4>
          <p class="etape-texte">${esc(x.texte)}</p>
          ${badge}
        </li>`;
    }).join("");
  }

  function rendreEquipe() {
    const rotations = [-2.2, 1.6, -1.2, 2.4];
    $("#equipe").innerHTML = (C.equipe || []).map((m, i) => {
      const photo = m.photo
        ? `<img src="${esc(m.photo)}" alt="Photo de ${esc(m.prenom)}" width="400" height="400" loading="lazy" decoding="async">`
        : `<span class="polaroid-emoji" aria-hidden="true">${esc(m.emoji || "🙂")}</span><span class="polaroid-initiale" aria-hidden="true">${esc(String(m.prenom || "?").charAt(0))}</span>`;
      return `<li class="polaroid" style="--rot:${rotations[i % rotations.length]}deg">
          <div class="polaroid-photo" data-emoji="${esc(m.emoji || "🙂")}">${photo}</div>
          <h4 class="polaroid-nom" data-exemple>${esc(m.prenom)}</h4>
          <p class="polaroid-role">${esc(m.role)}</p>
          <p class="polaroid-phrase">${esc(m.phrase)}</p>
        </li>`;
    }).join("");
    secoursImages($("#equipe"), ".polaroid-photo", "polaroid-emoji");
  }


  /* ───────────────────── Interface : menu, fenêtres, bandeaux ───────────────────── */

  function initMenu() {
    const burger = $(".burger");
    const nav = $("#nav");
    if (!burger || !nav) return;
    const ecranLarge = window.matchMedia("(min-width: 62rem)");
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

    // Surligne dans le menu la partie de la page en cours de lecture
    const liens = $$("a[href^='#']", nav);
    const sections = $$("main > section[id]"); // toutes, pour que rien ne reste allumé à tort
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
      d.addEventListener("click", (e) => { if (e.target === d) fermer(); }); // clic sur le fond
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
    try { fn(); } catch (err) { console.error(`VÉLO CHAOS : problème dans « ${nom} ». Vérifie cette partie de js/config.js.`, err); }
  }

  if (C.modeBrouillon) {
    html.classList.add("brouillon");
    $("#bandeau-brouillon").hidden = false;
    console.info("VÉLO CHAOS (mode brouillon) : pour tester, ajoute ?etat=avant, ?etat=direct ou ?etat=apres à l'adresse. Ou ?maintenant=2026-11-13T20:30 pour simuler une heure.");
  }

  lancer("textes et liens", appliquerLiaisons);
  lancer("mini-jauge de l'accueil", rendreMiniJauge);
  lancer("jauge et paliers", rendreJauge);
  lancer("défi", rendreDefi);
  lancer("compteur des paris", rendreParis);
  lancer("tombola", rendreTombola);
  lancer("dons", rendreDons);
  lancer("projet et association", rendreProjet);
  lancer("agenda", initAgenda);
  lancer("compte à rebours", () => {
    tic();
    $("#lcd").classList.add("demarre");
    setInterval(tic, 1000);
  });
  lancer("typographie", () => typographie(document.body));
})();
