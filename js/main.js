/* ════════════════════════════════════════════════════════════════════
   GEAnérosité — script du site
   Tout le contenu se règle dans js/config.js.
   Tests d'affichage : ?etat=avant | ?etat=direct | ?etat=apres
                       ?maintenant=2026-11-11T10:30
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const html = document.documentElement;
  const peuDeMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initMenu();
  initModales();
  initBandeau();
  initApparitions();
  initProgression();

  if (typeof CONFIG === "undefined" || !CONFIG) {
    const e = $("#erreur-config");
    if (e) e.hidden = false;
    console.error("GEAnérosité : js/config.js est introuvable ou contient une erreur.");
    return;
  }

  const C = CONFIG;
  const L = C.liens || {};
  const K = C.compteurs || {};
  const COL = C.collecte || {};
  const T = C.tombola || {};
  const TZ = "Europe/Paris";
  const params = new URLSearchParams(window.location.search);
  const brouillon = !!C.modeBrouillon;

  /* ───── Outils ───── */
  const txt = (v) => String(v ?? "").trim();
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lire = (c) => c.split(".").reduce((o, k) => (o == null ? undefined : o[k]), C);
  function nombre(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  const fNb = new Intl.NumberFormat("fr-FR");
  const fDec = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  const fE0 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fE2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fine = (s) => s.replace(/[\u202F\u2009]/g, "\u00A0");
  const entier = (v) => fine(fNb.format(Math.round(Number(v) || 0)));
  const decimal = (v) => fine(fDec.format(Math.max(0, Number(v) || 0)));
  const poids = (v) => decimal(v) + "\u00A0kg";
  function euros(v) {
    const n = Math.round((Number(v) || 0) * 100) / 100;
    return fine(Number.isInteger(n) ? fE0.format(n) : fE2.format(n));
  }
  const aConfirmer = (m) => `<span class="a-confirmer"${brouillon ? " data-manque" : ""}>${esc(m || "à confirmer")}</span>`;

  /* ───── Dates ───── */
  const D = C.dates || {};
  function lireDate(v) {
    if (!v) return null;
    let s = txt(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += "T12:00:00";
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ":00";
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(s)) s += "+01:00";
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  const jour = txt(D.jourCollecte);
  const hOuv = /^\d{1,2}:\d{2}$/.test(txt(D.ouverture)) ? txt(D.ouverture) : "08:00";
  const hFer = /^\d{1,2}:\d{2}$/.test(txt(D.fermeture)) ? txt(D.fermeture) : "19:00";
  const debut = /^\d{4}-\d{2}-\d{2}$/.test(jour) ? lireDate(jour + "T" + hOuv) : null;
  const fin = /^\d{4}-\d{2}-\d{2}$/.test(jour) ? lireDate(jour + "T" + hFer) : null;
  const dateSure = !!D.dateConfirmee;
  let decalage = 0;
  const simulation = lireDate(params.get("maintenant"));
  if (simulation) decalage = simulation.getTime() - Date.now();
  const maintenant = () => new Date(Date.now() + decalage);

  const fJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const fJourAn = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const maj = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const hTexte = (hhmm) => { const [h, m] = hhmm.split(":"); return m === "00" ? Number(h) + "h" : Number(h) + "h" + m; };
  const ouverture = hTexte(hOuv);
  const fermeture = hTexte(hFer);
  const jourTexte = () => (debut ? maj(fJour.format(debut)) : "");

  function etat() {
    const f = txt(params.get("etat") || C.forcerEtat).toLowerCase().replace("è", "e");
    if (["avant", "direct", "apres"].includes(f)) return f;
    if (!debut || !fin) return "avant";
    const t = maintenant();
    return t < debut ? "avant" : t < fin ? "direct" : "apres";
  }

  /* ───── Liens ───── */
  const NOMS = { instagram: "Instagram", facebook: "Facebook", email: "l'adresse e-mail", tombola: "les billets en ligne", cagnotte: "les dons en ligne" };
  function urlValide(cle) {
    const v = txt(L[cle]);
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
        a.classList.remove("inactif");
        a.removeAttribute("aria-disabled");
        a.removeAttribute("data-manque");
        a.removeAttribute("title");
      } else {
        a.removeAttribute("href");
        a.removeAttribute("target");
        a.classList.add("inactif");
        a.setAttribute("aria-disabled", "true");
        a.setAttribute("title", "Lien bientôt disponible");
        if (brouillon) a.setAttribute("data-manque", "");
        if (a.hasAttribute("data-afficher")) a.textContent = "adresse bientôt disponible";
      }
    });
    $$("[data-etat]", racine).forEach((p) => {
      p.textContent = urlValide(p.dataset.etat) ? "En ligne" : "Lien bientôt disponible";
    });
  }

  /* ───── Textes communs ───── */
  function appliquerTextes() {
    $$("[data-bind]").forEach((el) => {
      const v = lire(el.dataset.bind);
      if (v !== undefined && v !== null && v !== "") el.textContent = v;
    });
    const prix = nombre(T.prixBillet);
    $$(".prix-billet").forEach((el) => { el.textContent = prix !== null ? euros(prix) : "1 €"; });
    $$(".quand-jour").forEach((el) => { el.innerHTML = debut ? esc(jourTexte()) : aConfirmer("date à confirmer"); });

    const lieu = txt(COL.lieu) || "IUT d'Amiens";
    const salle = txt(COL.salle);
    $("#hero-date").innerHTML = debut
      ? `${esc(maj(jourTexte()))} · ${esc(ouverture)} → ${esc(fermeture)} · ${esc(lieu)}${dateSure ? "" : " " + aConfirmer("date provisoire")}`
      : `${aConfirmer("date à confirmer")} · ${esc(ouverture)} → ${esc(fermeture)} · ${esc(lieu)}`;
    $("#etape-lieu").innerHTML = salle
      ? `À l'${esc(lieu)}, ${esc(salle)}. Cherchez la table GEAnérosité, on ne sera pas discrets.`
      : `À l'${esc(lieu)}, salle ${aConfirmer("à confirmer")}. Cherchez la table GEAnérosité.`;
    $("#action-quand").innerHTML = debut
      ? `${esc(maj(jourTexte()))}, de ${esc(ouverture)} à ${esc(fermeture)}`
      : `De ${esc(ouverture)} à ${esc(fermeture)}`;

    const mots = [
      "Collecte de vêtements",
      debut ? maj(jourTexte()) : "Date à confirmer",
      `${ouverture} → ${fermeture}`,
      lieu,
      `Objectif ${poids(objectif)}`,
      "Tombola " + (prix !== null ? euros(prix) : "1 €"),
    ];
    const piste = mots.map((m) => `<span>${esc(m)}</span>`).join("");
    $("#ruban-piste").innerHTML = piste + piste;
  }

  /* ───── Kilos, carton, compteurs ───── */
  const kg = Math.max(0, nombre(K.kg) || 0);
  const objectif = Math.max(1, nombre(K.objectifKg) || 300);
  const part = Math.max(0, Math.min(1, kg / objectif));
  const pourcent = Math.floor((kg / objectif) * 100) + "\u00A0%";
  const parVetement = Math.max(0.05, nombre(C.kgParVetement) || 0.25);

  function animerNombre(el, cible, formate) {
    if (!el) return;
    if (peuDeMouvement || cible <= 0) { el.textContent = formate(cible); return; }
    const depart = performance.now();
    const duree = 1100;
    const pas = (t) => {
      const k = Math.min(1, (t - depart) / duree);
      const douceur = 1 - Math.pow(1 - k, 3);
      el.textContent = formate(k < 1 ? cible * douceur : cible);
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }

  function rendreKilos() {
    $("#compte-kg").textContent = poids(kg);
    $("#compte-objectif").textContent = poids(objectif);
    $("#jauge-objectif").textContent = poids(objectif);
    $("#jauge-pourcent").textContent = pourcent;
    $("#entete-kg-valeur").textContent = poids(kg);
    $("#entete-kg-objectif").textContent = poids(objectif);

    const compteur = $("#compteur");
    compteur.setAttribute("aria-valuemax", String(Math.max(objectif, kg)));
    compteur.setAttribute("aria-valuenow", String(kg));
    compteur.setAttribute("aria-valuetext", `${poids(kg)} collectés sur ${poids(objectif)}, soit ${pourcent} de l'objectif`);

    $("#carton-reperes").innerHTML = [0.25, 0.5, 0.75, 1]
      .map((g) => `<li class="${g === 1 ? "repere-haut" : ""}" style="--g:${g}">${esc(poids(Math.round(objectif * g)))}</li>`).join("");

    const remplir = () => {
      $("#carton-remplissage").style.height = (part * 100).toFixed(2) + "%";
      $("#compte-barre").style.width = (part * 100).toFixed(2) + "%";
    };
    quandVisible($(".carton-corps"), () => requestAnimationFrame(remplir), .2);
    setTimeout(remplir, 700);
    quandVisible($("#jauge-kg"), () => animerNombre($("#jauge-kg"), kg, decimal), .4);

    const bilan = $("#objectif-bilan");
    if (kg >= objectif) bilan.textContent = "Objectif atteint. Tout ce qui arrive en plus part aussi à l'association.";
    else if (kg <= 0) bilan.innerHTML = `Le carton est encore vide : il reste <strong>${esc(poids(objectif))}</strong> à collecter.`;
    else bilan.innerHTML = `Encore <strong>${esc(poids(objectif - kg))}</strong> avant d'y arriver.`;

    $("#objectif-estimation").textContent = kg > 0
      ? `Soit environ ${entier(kg / parVetement)} vêtements prêts à repartir.`
      : `L'objectif représente environ ${entier(objectif / parVetement)} vêtements, ou ${entier(objectif / 5)} sacs bien remplis.`;
    $("#objectif-maj").hidden = !txt(K.miseAJour);

    const stats = [
      { v: nombre(K.donateurs) || 0, f: entier, l: (nombre(K.donateurs) || 0) > 1 ? "personnes passées" : "personne passée" },
      { v: nombre(K.billets) || 0, f: entier, l: (nombre(K.billets) || 0) > 1 ? "billets vendus" : "billet vendu" },
      { v: nombre(K.cagnotte) || 0, f: euros, l: "pour l'association" },
      { v: objectif ? Math.floor((kg / objectif) * 100) : 0, f: (x) => Math.round(x) + " %", l: "de l'objectif" },
    ];
    $("#stats").innerHTML = stats
      .map((s) => `<li><span class="stat-valeur" data-valeur>${esc(s.f(0))}</span><span class="stat-label">${esc(s.l)}</span></li>`).join("");
    const cases = $$("#stats .stat-valeur");
    quandVisible($("#stats"), () => cases.forEach((el, i) => animerNombre(el, stats[i].v, stats[i].f)), .3);
  }

  /* ───── Compte à rebours ───── */
  let etatCourant = null;
  const titreOriginal = document.title;
  const bloc = (v, l) => `<li><span class="compte-nombre">${v}</span><span class="compte-label">${l}</span></li>`;
  const deux = (n) => String(n).padStart(2, "0");

  function rendreEtat(e) {
    html.dataset.etat = e;
    const titre = $("#compte-titre");
    const blocs = $("#compte-blocs");
    const message = $("#compte-message");
    const agenda = $("#compte-agenda");
    if (e === "avant") {
      titre.textContent = debut ? "Ouverture dans" : "Bientôt";
      blocs.hidden = !debut;
      message.innerHTML = debut
        ? `${esc(maj(fJourAn.format(debut)))}, de ${esc(ouverture)} à ${esc(fermeture)}.`
        : `La date sera annoncée ici, de ${esc(ouverture)} à ${esc(fermeture)}.`;
      if (agenda) agenda.hidden = !debut;
    } else if (e === "direct") {
      titre.textContent = "C'est aujourd'hui";
      blocs.hidden = false;
      message.textContent = `On est sur place jusqu'à ${fermeture}, avec la balance. Passez quand vous voulez.`;
      if (agenda) agenda.hidden = true;
    } else {
      titre.textContent = "Merci à tous";
      blocs.hidden = true;
      message.innerHTML = kg > 0
        ? `Collecte terminée : <strong>${esc(poids(kg))}</strong> de vêtements partent chez ${esc(txt(lire("association.nom")) || "l'association")}.`
        : "Collecte terminée. Merci à tous ceux qui sont passés.";
      if (agenda) agenda.hidden = true;
    }
    document.title = e === "direct" ? "Collecte en cours — " + titreOriginal : titreOriginal;
    placerCurseurFrise(e);
  }

  function tic() {
    const e = etat();
    if (e !== etatCourant) { etatCourant = e; rendreEtat(e); }
    const blocs = $("#compte-blocs");
    const t = maintenant().getTime();
    if (e === "avant" && debut) {
      let s = Math.max(0, Math.floor((debut.getTime() - t) / 1000));
      const j = Math.floor(s / 86400); s -= j * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      blocs.innerHTML = bloc(j, j === 1 ? "jour" : "jours") + bloc(deux(h), "heures") + bloc(deux(m), "min") + bloc(deux(s), "sec");
      blocs.setAttribute("aria-label", `Ouverture dans ${j} jours, ${h} heures et ${m} minutes`);
    } else if (e === "direct" && fin) {
      let s = Math.max(0, Math.floor((fin.getTime() - t) / 1000));
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      blocs.innerHTML = bloc(h, "heures") + bloc(deux(m), "min") + bloc(deux(s), "sec");
      blocs.setAttribute("aria-label", `Encore ${h} heures et ${m} minutes de collecte`);
      placerCurseurFrise("direct");
    }
  }

  function initAgenda() {
    if (!debut || !fin) return;
    const asso = txt(lire("association.nom")) || "l'association";
    const titre = "GEAnérosité : collecte de vêtements";
    const lieu = [txt(COL.lieu), txt(COL.salle)].filter(Boolean).join(", ") || "IUT d'Amiens";
    const details = `Apportez les vêtements que vous ne mettez plus : tout est remis à ${asso}.`;
    const ics = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const g = new URLSearchParams({ action: "TEMPLATE", text: titre, details, location: lieu, dates: `${ics(debut)}/${ics(fin)}` });
    $("#agenda-google").href = "https://calendar.google.com/calendar/render?" + g.toString();
    const ech = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    const fichier = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GEAnerosite//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT", "UID:geanerosite-" + ics(debut) + "@geanerosite", "DTSTAMP:" + ics(new Date()),
      "DTSTART:" + ics(debut), "DTEND:" + ics(fin), "SUMMARY:" + ech(titre), "DESCRIPTION:" + ech(details), "LOCATION:" + ech(lieu),
      "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:" + ech("Pense à ton sac de vêtements !"), "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    try { $("#agenda-ics").href = URL.createObjectURL(new Blob([fichier], { type: "text/calendar;charset=utf-8" })); }
    catch (e) { $("#agenda-ics").hidden = true; }
  }

  /* ───── L'événement : infos et frise horaire ───── */
  function rendreEvenement() {
    const lieu = txt(COL.lieu) || "IUT d'Amiens";
    const salle = txt(COL.salle);
    const infos = [
      { t: "Quand", v: debut ? esc(maj(fJourAn.format(debut))) : aConfirmer("date à confirmer") },
      { t: "Horaires", v: `${esc(ouverture)} → ${esc(fermeture)}, en continu` },
      { t: "Où", v: salle ? esc(lieu + " — " + salle) : `${esc(lieu)} — salle ${aConfirmer("à confirmer")}` },
      { t: "Pour qui", v: esc(txt(COL.public) || "Ouvert à tous") },
      { t: "Combien", v: "Gratuit. La tombola reste optionnelle" },
    ];
    $("#infos-event").innerHTML = infos.map((i) => `<li><strong>${esc(i.t)}</strong><span>${i.v}</span></li>`).join("");

    const hDeb = Number(hOuv.split(":")[0]) + Number(hOuv.split(":")[1]) / 60;
    const hFinN = Number(hFer.split(":")[0]) + Number(hFer.split(":")[1]) / 60;
    const nb = 5;
    const heures = Array.from({ length: nb }, (_, i) => {
      const h = hDeb + ((hFinN - hDeb) * i) / (nb - 1);
      return `<li>${Math.round(h)}h</li>`;
    }).join("");
    $("#frise-heures").innerHTML = heures;
  }

  function placerCurseurFrise(e) {
    const curseur = $("#frise-curseur");
    if (!curseur) return;
    let p = 0;
    if (e === "apres") p = 1;
    else if (e === "direct" && debut && fin) {
      p = (maintenant().getTime() - debut.getTime()) / (fin.getTime() - debut.getTime());
      p = Math.max(0, Math.min(1, p));
    }
    curseur.style.left = (p * 100).toFixed(2) + "%";
  }

  /* ───── Le tri ───── */
  function rendreTri() {
    $("#liste-accepte").innerHTML = (COL.accepte || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#liste-refuse").innerHTML = (COL.refuse || []).map((x) => `<li>${esc(x)}</li>`).join("");
  }

  /* ───── La tombola ───── */
  function rendreTombola() {
    const lots = Array.isArray(T.lots) ? T.lots : [];
    const gagnants = Array.isArray(T.gagnants) ? T.gagnants : [];
    const tousConfirmes = lots.length > 0 && lots.every((l) => txt(l.statut) === "confirme");
    const prix = nombre(T.prixBillet);

    $("#tombola-info").innerHTML = `${lots.length} lots · billets sur place · ${prix !== null ? esc(euros(prix)) : "1 €"} l'unité`;
    $("#tickets").innerHTML = lots.map((lot, i) => {
      const confirme = txt(lot.statut) === "confirme";
      const gagnant = txt(gagnants[i]);
      return `<li class="ticket" data-reveal style="--i:${i}">
          <div class="ticket-inner">
            <span class="ticket-encoche" aria-hidden="true"></span>
            <span class="ticket-num" aria-hidden="true">${deux(i + 1)}</span>
            <span class="ticket-emoji" aria-hidden="true">${esc(lot.emoji || "🎁")}</span>
            <p class="ticket-nom">${esc(lot.nom)}</p>
            ${confirme && txt(lot.partenaire) ? `<p class="ticket-partenaire">Offert par ${esc(lot.partenaire)}</p>` : ""}
            <p class="ticket-statut">${confirme ? "Lot confirmé" : "En cours de recherche"}</p>
            ${gagnant ? `<p class="ticket-gagnant">Gagnant : ${esc(gagnant)}</p>` : ""}
          </div>
        </li>`;
    }).join("");
    $("#tickets-note").textContent = tousConfirmes
      ? "Tous les lots sont confirmés. Merci aux commerces d'Amiens qui ont joué le jeu."
      : "Ces lots sont en cours de recherche auprès de commerces d'Amiens. La liste est mise à jour dès qu'un lot est confirmé.";

    $("#tombola-papier").innerHTML = txt(T.billetsPapier) ? esc(T.billetsPapier) + "." : "Billets papier sur place, le jour de la collecte.";
    $("#tombola-tirage").innerHTML = txt(T.tirage) ? esc(T.tirage) + "." : `Le moment du tirage est ${aConfirmer("à confirmer")}.`;
    $("#reglement-tirage").innerHTML = txt(T.tirage)
      ? `Le tirage a lieu ${esc(T.tirage.charAt(0).toLowerCase() + T.tirage.slice(1))}.`
      : "Le tirage a lieu à la date annoncée sur ce site.";

    const action = $("#tombola-action");
    if (urlValide("tombola")) {
      action.innerHTML = `<a class="bouton bouton-contour bouton-petit" data-lien="tombola">Prendre un billet en ligne</a>`;
      appliquerLiens(action);
    } else {
      action.innerHTML = `<p class="petit">Paiement en espèces, à la table d'accueil.</p>`;
    }

    const res = $("#tombola-resultat");
    if (gagnants.some((g) => txt(g))) {
      res.innerHTML = '<p class="resultat-titre">Le tirage a eu lieu</p><p>Les gagnants sont indiqués sur chaque ticket. Nous contactons chaque personne avec les coordonnées laissées à l\'achat.</p>';
      res.hidden = false;
    } else res.hidden = true;

    $("#projets-liste").innerHTML = (Array.isArray(C.projetsFinances) ? C.projetsFinances : [])
      .map((p) => `<li>${esc(p.texte)}</li>`).join("");

    initInclinaison();
  }

  /* Légère inclinaison 3D des tickets au survol (souris uniquement) */
  function initInclinaison() {
    if (peuDeMouvement || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".ticket").forEach((ticket) => {
      const inner = $(".ticket-inner", ticket);
      if (!inner) return;
      let cadre = null;
      ticket.addEventListener("pointermove", (ev) => {
        if (cadre) return;
        cadre = requestAnimationFrame(() => {
          cadre = null;
          const r = ticket.getBoundingClientRect();
          const x = (ev.clientX - r.left) / r.width - .5;
          const y = (ev.clientY - r.top) / r.height - .5;
          inner.style.setProperty("--ry", (x * 7).toFixed(2) + "deg");
          inner.style.setProperty("--rx", (-y * 7).toFixed(2) + "deg");
        });
      });
      ticket.addEventListener("pointerleave", () => {
        inner.style.setProperty("--ry", "0deg");
        inner.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ───── Association, équipe, promesses ───── */
  function rendreQui() {
    const a = C.association || {};
    const nom = txt(a.nom) || "l'association";
    const secours = `<span class="asso-logo-texte"${brouillon ? " data-manque" : ""}>${esc(nom)}</span>`;
    const logo = $("#asso-logo");
    logo.innerHTML = txt(a.logo) ? `<img src="${esc(a.logo)}" alt="Logo de ${esc(nom)}" loading="lazy" decoding="async">` : secours;
    secoursImages(logo, ".asso-logo", secours);
    if (txt(a.nomComplet)) { $("#asso-sigle").textContent = a.nomComplet; $("#asso-sigle").hidden = false; }
    $("#asso-presentation").innerHTML = (a.presentation || []).map((p) => `<p>${esc(p)}</p>`).join("");
    const tel = txt(a.telephone);
    if (tel) {
      const liens = tel.split(/[\/·,]+/).map((x) => x.trim()).filter(Boolean)
        .map((x) => `<a href="tel:${esc(x.replace(/[^0-9+]/g, ""))}">${esc(x)}</a>`).join(" · ");
      $("#asso-contact").innerHTML = "Contacter l'association : " + liens;
      $("#asso-contact").hidden = false;
    }
    const site = /^https:\/\/\S+\.\S+$/.test(txt(a.site)) ? txt(a.site) : "";
    if (site) { $("#asso-site").href = site; $("#asso-site-ligne").hidden = false; }

    $("#equipe").innerHTML = (C.equipe || []).map((m) => {
      const n = txt(m.nom);
      return `<li><span class="equipe-nom">${n ? esc(n) : aConfirmer("prénom à ajouter")}</span>${txt(m.role) ? `<span class="equipe-role">${esc(m.role)}</span>` : ""}</li>`;
    }).join("");

    const t = C.transparence || {};
    $("#encaissement").innerHTML = txt(t.encaissement) ? esc(t.encaissement) : aConfirmer("à préciser");
    $("#especes").innerHTML = txt(t.especes) ? esc(t.especes) : aConfirmer("à préciser");

    logoPied($("#logo-iut"), C.logoIUT, "Logo de l'IUT d'Amiens", "IUT d'Amiens");
    logoPied($("#logo-asso"), a.logo, "Logo de " + nom, nom);
    const resp = txt((C.mentionsLegales || {}).responsable);
    $("#mentions-responsable").innerHTML = resp ? esc(resp) : aConfirmer("nom à compléter");
  }
  function logoPied(el, src, alt, nom) {
    if (!el) return;
    const secours = `<span class="pied-logo-texte"${brouillon ? " data-manque" : ""}>${esc(nom)}</span>`;
    el.innerHTML = txt(src) ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : secours;
    secoursImages(el, ".pied-logo", secours);
  }
  function secoursImages(racine, sel, remplacement) {
    $$("img", racine).forEach((img) => {
      img.addEventListener("error", () => {
        const parent = img.closest(sel);
        if (parent) parent.innerHTML = remplacement;
        console.warn("GEAnérosité : image introuvable → " + img.getAttribute("src"));
      }, { once: true });
    });
  }

  /* ───── Partage ───── */
  function initPartage() {
    const bouton = $("#copier-lien");
    const retour = $("#copie-ok");
    if (!bouton) return;
    bouton.addEventListener("click", () => {
      const lien = window.location.origin + window.location.pathname;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lien).then(() => { retour.textContent = "Lien copié !"; }, () => { retour.textContent = lien; });
      } else retour.textContent = lien;
    });
  }

  /* ───── Parallaxe douce du hero ───── */
  function initParallaxe() {
    const objets = $$("[data-parallaxe]");
    if (!objets.length || peuDeMouvement) return;
    let sourisX = 0, sourisY = 0, defilement = 0, cadre = null;
    const appliquer = () => {
      cadre = null;
      objets.forEach((o) => {
        const f = Number(o.dataset.parallaxe) || 10;
        const dx = sourisX * f * .45;
        const dy = sourisY * f * .45 + defilement * f * .06;
        o.style.setProperty("--dx", dx.toFixed(1) + "px");
        o.style.setProperty("--dy", dy.toFixed(1) + "px");
      });
    };
    const planifier = () => { if (!cadre) cadre = requestAnimationFrame(appliquer); };
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      window.addEventListener("pointermove", (e) => {
        sourisX = (e.clientX / window.innerWidth - .5) * 2;
        sourisY = (e.clientY / window.innerHeight - .5) * 2;
        planifier();
      }, { passive: true });
    }
    window.addEventListener("scroll", () => {
      if (window.scrollY > window.innerHeight * 1.2) return;
      defilement = window.scrollY;
      planifier();
    }, { passive: true });
  }

  /* ───── Barre de progression et pastille de l'en-tête ───── */
  function initProgression() {
    const barre = $("#progression-barre");
    const pastille = $("#entete-kg");
    const hero = $("#accueil");
    let cadre = null;
    const calculer = () => {
      cadre = null;
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (barre) barre.style.width = total > 0 ? ((h.scrollTop / total) * 100).toFixed(2) + "%" : "0%";
      if (pastille && hero) {
        const passe = h.scrollTop > hero.offsetHeight * .75;
        pastille.hidden = !passe;
        pastille.classList.toggle("visible", passe);
      }
    };
    window.addEventListener("scroll", () => { if (!cadre) cadre = requestAnimationFrame(calculer); }, { passive: true });
    calculer();
  }

  /* ───── Apparitions, menu, fenêtres ───── */
  function quandVisible(el, action, seuil) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { action(el); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); action(el); }
    }, { threshold: seuil || .2 });
    io.observe(el);
  }

  function initApparitions() {
    const voir = () => {
      const cibles = $$("[data-reveal]:not(.vu)");
      if (!cibles.length) return;
      if (!("IntersectionObserver" in window) || peuDeMouvement) { cibles.forEach((el) => el.classList.add("vu")); return; }
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("vu"); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
      cibles.forEach((el) => io.observe(el));
    };
    voir();
    document.addEventListener("geanerosite:rendu", voir);
  }

  function initMenu() {
    const burger = $(".burger");
    const nav = $("#nav");
    if (!burger || !nav) return;
    const large = window.matchMedia("(min-width: 64rem)");
    const ouvert = () => burger.getAttribute("aria-expanded") === "true";
    const ouvrir = () => {
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Fermer le menu");
      nav.classList.add("ouvert");
      document.body.classList.add("menu-ouvert");
      requestAnimationFrame(() => { const a = $("a", nav); if (a) a.focus(); });
    };
    const fermer = (focus) => {
      if (!ouvert()) return;
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
      nav.classList.remove("ouvert");
      document.body.classList.remove("menu-ouvert");
      if (focus) burger.focus();
    };
    burger.addEventListener("click", () => (ouvert() ? fermer(false) : ouvrir()));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => fermer(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermer(true); });
    if (large.addEventListener) large.addEventListener("change", () => { if (large.matches) fermer(false); });

    const liens = $$("a[href^='#']", nav);
    const sections = $$("main > section[id]");
    if (!("IntersectionObserver" in window) || !sections.length) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => {
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
    $$("[data-ouvre]").forEach((b) => b.addEventListener("click", () => {
      const d = document.getElementById(b.dataset.ouvre);
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

  function initBandeau() {
    const b = $("#bandeau-brouillon");
    const croix = b && $(".bandeau-fermer", b);
    if (croix) croix.addEventListener("click", () => { b.hidden = true; });
  }

  /* ───── Démarrage ───── */
  function lancer(nom, fn) {
    try { fn(); } catch (e) { console.error(`GEAnérosité : problème dans « ${nom} ». Vérifie cette partie de js/config.js.`, e); }
  }
  if (brouillon) { html.classList.add("brouillon"); $("#bandeau-brouillon").hidden = false; }

  lancer("kilos", rendreKilos);
  lancer("textes", appliquerTextes);
  lancer("liens", () => appliquerLiens(document));
  lancer("événement", rendreEvenement);
  lancer("tri", rendreTri);
  lancer("tombola", rendreTombola);
  lancer("association et équipe", rendreQui);
  lancer("agenda", initAgenda);
  lancer("partage", initPartage);
  lancer("parallaxe", initParallaxe);
  lancer("compte à rebours", () => { tic(); setInterval(tic, 1000); });
  document.dispatchEvent(new Event("geanerosite:rendu"));
})();
