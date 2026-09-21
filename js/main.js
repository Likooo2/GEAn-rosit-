/* ════════════════════════════════════════════════════════════════════
   GEAnérosité — script du site
   Tout se règle dans js/config.js : pas besoin de toucher à ce fichier.

   Pour tester l'affichage :
     ?etat=avant   ?etat=direct   ?etat=apres
     ?maintenant=2026-11-11T10:30   (simule une date et une heure)
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const $ = (sel, racine = document) => racine.querySelector(sel);
  const $$ = (sel, racine = document) => Array.from(racine.querySelectorAll(sel));
  const html = document.documentElement;
  const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initMenu();
  initModales();
  initBandeau();
  initApparitions();

  if (typeof CONFIG === "undefined" || !CONFIG) {
    const err = $("#erreur-config");
    if (err) err.hidden = false;
    console.error("GEAnérosité : js/config.js est introuvable ou contient une erreur.");
    return;
  }

  const C = CONFIG;
  const L = C.liens || {};
  const K = C.compteurs || {};
  const COL = C.collecte || {};
  const TZ = "Europe/Paris";
  const params = new URLSearchParams(window.location.search);
  const brouillon = !!C.modeBrouillon;

  /* ───── Outils ───── */
  const texte = (v) => String(v ?? "").trim();
  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function lire(chemin) {
    return chemin.split(".").reduce((o, k) => (o == null ? undefined : o[k]), C);
  }
  function nombre(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  const fNombre = new Intl.NumberFormat("fr-FR");
  const fDecimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  const fEuros0 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fEuros2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fine = (s) => s.replace(/[\u202F\u2009]/g, "\u00A0");
  const entier = (v) => fine(fNombre.format(Math.round(Number(v) || 0)));
  const poids = (v) => fine(fDecimal.format(Math.max(0, Number(v) || 0))) + "\u00A0kg";
  function euros(v) {
    const n = Math.round((Number(v) || 0) * 100) / 100;
    return fine(Number.isInteger(n) ? fEuros0.format(n) : fEuros2.format(n));
  }
  const aConfirmer = (mot) => `<span class="a-confirmer"${brouillon ? " data-manque" : ""}>${esc(mot || "à confirmer")}</span>`;

  /* ───── La date de la journée ───── */
  const D = C.dates || {};
  function lireDate(v) {
    if (!v) return null;
    let s = texte(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += "T12:00:00";
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ":00";
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(s)) s += "+01:00";
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  const jour = texte(D.jourCollecte);
  const hOuv = /^\d{1,2}:\d{2}$/.test(texte(D.ouverture)) ? texte(D.ouverture) : "08:00";
  const hFer = /^\d{1,2}:\d{2}$/.test(texte(D.fermeture)) ? texte(D.fermeture) : "19:00";
  const debut = /^\d{4}-\d{2}-\d{2}$/.test(jour) ? lireDate(jour + "T" + hOuv) : null;
  const fin = /^\d{4}-\d{2}-\d{2}$/.test(jour) ? lireDate(jour + "T" + hFer) : null;
  const dateSure = !!D.dateConfirmee;

  let decalage = 0;
  const simulation = lireDate(params.get("maintenant"));
  if (simulation) decalage = simulation.getTime() - Date.now();
  const maintenant = () => new Date(Date.now() + decalage);

  const fJour = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const fJourAn = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const heureTexte = (hhmm) => {
    const [h, m] = hhmm.split(":");
    return m === "00" ? Number(h) + "h" : Number(h) + "h" + m;
  };
  const ouverture = heureTexte(hOuv);
  const fermeture = heureTexte(hFer);
  const jourTexte = () => (debut ? majuscule(fJour.format(debut)) : "");

  function etat() {
    const force = texte(params.get("etat") || C.forcerEtat).toLowerCase().replace("è", "e");
    if (["avant", "direct", "apres"].includes(force)) return force;
    if (!debut || !fin) return "avant";
    const t = maintenant();
    return t < debut ? "avant" : t < fin ? "direct" : "apres";
  }

  /* ───── Liens ───── */
  const NOMS = { instagram: "Instagram", facebook: "Facebook", email: "l'adresse e-mail", tombola: "les billets en ligne", cagnotte: "les dons en ligne" };
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
    $$("[data-destination]", racine).forEach((p) => {
      const cle = p.dataset.destination;
      const url = urlValide(cle);
      if (url) {
        let hote = "";
        try { hote = cle === "email" ? "" : new URL(url).hostname.replace(/^www\./, ""); } catch (e) { hote = ""; }
        p.innerHTML = cle === "email" ? `Ouvre votre messagerie : <strong>${esc(url)}</strong>`
          : (/(^|\.)helloasso\.com$/.test(hote) ? "Paiement sécurisé sur <strong>HelloAsso</strong>" : `Ouvre <strong>${esc(hote)}</strong>`);
      } else {
        p.textContent = `Lien bientôt disponible pour ${NOMS[cle] || "cette action"}.`;
      }
      if (brouillon && !url) p.setAttribute("data-manque", ""); else p.removeAttribute("data-manque");
    });
    $$("[data-destination-courte]", racine).forEach((p) => {
      p.textContent = urlValide(p.dataset.destinationCourte) ? "Nous suivre" : "Bientôt";
    });
  }

  /* ───── Textes communs ───── */
  function appliquerTextes() {
    $$("[data-bind]").forEach((el) => {
      const v = lire(el.dataset.bind);
      if (v !== undefined && v !== null && v !== "") el.textContent = v;
    });
    const prix = nombre((C.tombola || {}).prixBillet);
    $$(".prix-billet").forEach((el) => { el.textContent = prix !== null ? euros(prix) : "1 €"; });
    $$(".quand-ouverture").forEach((el) => { el.textContent = ouverture; });
    $$(".quand-fermeture").forEach((el) => { el.textContent = fermeture; });
    $$(".quand-jour").forEach((el) => { el.innerHTML = debut ? esc(jourTexte()) : aConfirmer("date à confirmer"); });

    const lieu = texte(COL.lieu) || "IUT d'Amiens";
    const salle = texte(COL.salle);
    $("#fil-date").innerHTML = debut ? esc(jourTexte()) + (dateSure ? "" : " " + aConfirmer("date provisoire")) : aConfirmer("date à confirmer");
    $("#fil-horaires").textContent = `${ouverture} – ${fermeture}`;
    $("#fil-lieu").textContent = lieu;
    $("#etape-lieu").innerHTML = salle ? `à l'${esc(lieu)}, ${esc(salle)}` : `à l'${esc(lieu)}, salle ${aConfirmer("à confirmer")}`;
  }

  /* ───── Compte à rebours ───── */
  let etatCourant = null;
  const titreOriginal = document.title;
  const bloc = (valeur, label) => `<li><span class="car-nombre">${valeur}</span><span class="car-label">${label}</span></li>`;
  const deux = (n) => String(n).padStart(2, "0");

  function rendreEtat(e) {
    html.dataset.etat = e;
    const titre = $("#car-titre");
    const message = $("#car-message");
    const blocs = $("#car-blocs");
    const agenda = $("#car-agenda");
    if (e === "avant") {
      titre.textContent = debut ? "La collecte ouvre dans" : "La collecte, bientôt";
      blocs.hidden = !debut;
      message.innerHTML = debut
        ? `${esc(majuscule(fJourAn.format(debut)))}, de ${esc(ouverture)} à ${esc(fermeture)}.`
        : `La date sera annoncée ici, de ${esc(ouverture)} à ${esc(fermeture)}.`;
      if (agenda) agenda.hidden = !debut;
    } else if (e === "direct") {
      titre.textContent = "C'est aujourd'hui, jusqu'à " + fermeture;
      blocs.hidden = false;
      message.textContent = "On est sur place, avec la balance. Passez quand vous voulez.";
      if (agenda) agenda.hidden = true;
    } else {
      titre.textContent = "Merci à tous";
      blocs.hidden = true;
      message.innerHTML = kg > 0
        ? `La collecte est terminée : <strong>${esc(poids(kg))}</strong> de vêtements partent chez ${esc(texte(lire("association.nom")) || "l'association")}.`
        : "La collecte est terminée. Merci à tous ceux qui sont passés.";
      if (agenda) agenda.hidden = true;
    }
    document.title = e === "direct" ? "Collecte en cours — " + titreOriginal : titreOriginal;
  }

  function tic() {
    const e = etat();
    if (e !== etatCourant) { etatCourant = e; rendreEtat(e); }
    const blocs = $("#car-blocs");
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
    }
  }

  function initAgenda() {
    if (!debut || !fin) return;
    const asso = texte(lire("association.nom")) || "l'association";
    const titre = "GEAnérosité : collecte de vêtements";
    const lieu = [texte(COL.lieu), texte(COL.salle)].filter(Boolean).join(", ") || "IUT d'Amiens";
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

  /* ───── Les kilos ───── */
  const kg = Math.max(0, nombre(K.kg) || 0);
  const objectif = Math.max(1, nombre(K.objectifKg) || 300);
  const part = Math.max(0, Math.min(1, kg / objectif));
  const pourcent = Math.floor((kg / objectif) * 100) + "\u00A0%";
  const parVetement = Math.max(0.05, nombre(C.kgParVetement) || 0.25);

  function rendreKilos() {
    $("#car-kg").textContent = poids(kg);
    $("#car-objectif").textContent = poids(objectif);
    $("#jauge-kg").textContent = poids(kg);
    $("#jauge-objectif").textContent = poids(objectif);
    $("#jauge-pourcent").textContent = pourcent;

    const compteur = $("#compteur");
    compteur.setAttribute("aria-valuemax", String(Math.max(objectif, kg)));
    compteur.setAttribute("aria-valuenow", String(kg));
    compteur.setAttribute("aria-valuetext", `${poids(kg)} collectés sur ${poids(objectif)}, soit ${pourcent} de l'objectif`);

    $("#carton-reperes").innerHTML = [0.25, 0.5, 0.75, 1]
      .map((g) => `<li class="${g === 1 ? "repere-haut" : ""}" style="--g:${g}">${esc(poids(Math.round(objectif * g)))}</li>`).join("");

    const remplir = () => {
      $("#carton-remplissage").style.height = (part * 100).toFixed(2) + "%";
      $("#car-barre").style.width = (part * 100).toFixed(2) + "%";
    };
    if (mouvementReduit) remplir();
    else { quandVisible($(".carton-corps"), () => requestAnimationFrame(remplir), 0.2); setTimeout(remplir, 600); }

    const bilan = $("#jauge-bilan");
    if (kg >= objectif) bilan.textContent = "Objectif atteint. Tout ce qui arrive en plus part aussi à l'association.";
    else if (kg <= 0) bilan.innerHTML = `Le carton est encore vide : il reste <strong>${esc(poids(objectif))}</strong> à collecter.`;
    else bilan.innerHTML = `Encore <strong>${esc(poids(objectif - kg))}</strong> avant d'atteindre l'objectif.`;

    $("#estimation-vetements").innerHTML = kg > 0
      ? `Soit environ ${esc(entier(kg / parVetement))} vêtements prêts à être redonnés.`
      : `L'objectif représente environ ${esc(entier(objectif / parVetement))} vêtements, ou ${esc(entier(objectif / 5))} sacs bien remplis.`;

    $("#objectif-maj").hidden = !texte(K.miseAJour);

    const prix = nombre((C.tombola || {}).prixBillet);
    const chiffres = [
      { v: poids(kg), l: "collectés" },
      { v: entier(nombre(K.donateurs) || 0), l: (nombre(K.donateurs) || 0) > 1 ? "personnes passées" : "personne passée" },
      { v: entier(nombre(K.billets) || 0), l: (nombre(K.billets) || 0) > 1 ? "billets vendus" : "billet vendu" },
      { v: euros(nombre(K.cagnotte) || 0), l: "pour l'association" },
    ];
    $("#chiffres-jour").innerHTML = chiffres
      .map((c) => `<li><span class="chiffre-valeur">${esc(c.v)}</span><span class="chiffre-label">${esc(c.l)}</span></li>`).join("");
    if (prix === null) { /* prix non renseigné : rien à ajouter */ }
  }

  /* ───── Infos pratiques et tri ───── */
  function rendreInfos() {
    const lieu = texte(COL.lieu) || "IUT d'Amiens";
    const salle = texte(COL.salle);
    const infos = [
      { t: "Quand", v: debut ? esc(majuscule(fJourAn.format(debut))) : aConfirmer("date à confirmer") },
      { t: "Horaires", v: `De ${esc(ouverture)} à ${esc(fermeture)}, en continu` },
      { t: "Où", v: salle ? esc(lieu + " — " + salle) : `${esc(lieu)} — salle ${aConfirmer("à confirmer")}` },
      { t: "Pour qui", v: esc(texte(COL.public) || "Ouvert à tous") },
    ];
    $("#infos-cles").innerHTML = infos.map((i) => `<li><strong>${esc(i.t)}</strong>${i.v}</li>`).join("");
    $("#liste-accepte").innerHTML = (COL.accepte || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#liste-refuse").innerHTML = (COL.refuse || []).map((x) => `<li>${esc(x)}</li>`).join("");
  }

  /* ───── Tombola ───── */
  function rendreTombola() {
    const B = C.tombola || {};
    const lots = Array.isArray(B.lots) ? B.lots : [];
    const gagnants = Array.isArray(B.gagnants) ? B.gagnants : [];
    const tousConfirmes = lots.length > 0 && lots.every((l) => texte(l.statut) === "confirme");

    $("#lots").innerHTML = lots.map((lot, i) => {
      const confirme = texte(lot.statut) === "confirme";
      const gagnant = texte(gagnants[i]);
      return `<li class="lot">
          <span class="lot-emoji" aria-hidden="true">${esc(lot.emoji || "🎁")}</span>
          <p class="lot-nom">${esc(lot.nom)}</p>
          ${confirme && texte(lot.partenaire) ? `<p class="lot-partenaire">Offert par ${esc(lot.partenaire)}</p>` : ""}
          <p class="lot-statut">${confirme ? "Lot confirmé" : "En cours de recherche"}</p>
          ${gagnant ? `<p class="lot-gagnant">Gagnant : ${esc(gagnant)}</p>` : ""}
        </li>`;
    }).join("");
    $("#lots-note").textContent = tousConfirmes
      ? "Tous les lots sont confirmés. Merci aux commerces qui ont joué le jeu."
      : "Ces lots sont en cours de recherche auprès de commerces d'Amiens : la liste est mise à jour dès qu'un lot est confirmé.";

    $("#tombola-papier").innerHTML = texte(B.billetsPapier) ? esc(B.billetsPapier) : "Billets papier sur place, le jour de la collecte.";
    $("#tombola-tirage").innerHTML = texte(B.tirage) ? esc(B.tirage) + "." : `Le moment du tirage est ${aConfirmer("à confirmer")}.`;
    $("#reglement-tirage").innerHTML = texte(B.tirage) ? `Le tirage a lieu ${esc(B.tirage.charAt(0).toLowerCase() + B.tirage.slice(1))}.` : "Le tirage a lieu à la date annoncée sur ce site.";

    const action = $("#tombola-action");
    if (urlValide("tombola")) {
      action.innerHTML = `<a class="bouton bouton-bleu bouton-petit" data-lien="tombola">Prendre un billet en ligne</a>`;
      appliquerLiens(action);
    } else {
      action.innerHTML = `<p class="petit">Paiement en espèces uniquement, à la table d'accueil.</p>`;
    }

    const res = $("#tombola-resultat");
    if (gagnants.some((g) => texte(g))) {
      res.innerHTML = '<p class="resultat-titre">Le tirage a eu lieu</p><p>Les gagnants sont indiqués sous chaque lot. Nous contactons chaque personne avec les coordonnées laissées à l\'achat.</p>';
      res.hidden = false;
    } else res.hidden = true;
  }

  /* ───── Où va tout ça ───── */
  function rendreSuivi() {
    const t = C.transparence || {};
    $("#encaissement").innerHTML = texte(t.encaissement) ? esc(t.encaissement) : aConfirmer("à préciser");
    $("#especes").innerHTML = texte(t.especes) ? esc(t.especes) : aConfirmer("à préciser");
    $("#projets-liste").innerHTML = (Array.isArray(C.projetsFinances) ? C.projetsFinances : [])
      .map((p) => `<li>${esc(p.texte)}</li>`).join("");
  }

  /* ───── Association et équipe ───── */
  function rendreQui() {
    const a = C.association || {};
    const nom = texte(a.nom) || "l'association";
    const secours = `<span class="asso-logo-texte"${brouillon ? " data-manque" : ""}>${esc(nom)}</span>`;
    const logo = $("#asso-logo");
    logo.innerHTML = texte(a.logo) ? `<img src="${esc(a.logo)}" alt="Logo de ${esc(nom)}" loading="lazy" decoding="async">` : secours;
    secoursImages(logo, ".asso-logo", secours);
    if (texte(a.nomComplet)) { $("#asso-sigle").textContent = a.nomComplet; $("#asso-sigle").hidden = false; }
    $("#asso-presentation").innerHTML = (a.presentation || []).map((p) => `<p>${esc(p)}</p>`).join("");
    const tel = texte(a.telephone);
    if (tel) {
      const liens = tel.split(/[\/·,]+/).map((x) => x.trim()).filter(Boolean)
        .map((x) => `<a href="tel:${esc(x.replace(/[^0-9+]/g, ""))}">${esc(x)}</a>`).join(" · ");
      $("#asso-contact").innerHTML = "Contacter l'association : " + liens;
      $("#asso-contact").hidden = false;
    }
    const site = /^https:\/\/\S+\.\S+$/.test(texte(a.site)) ? texte(a.site) : "";
    if (site) { $("#asso-site").href = site; $("#asso-site-ligne").hidden = false; }

    $("#equipe").innerHTML = (C.equipe || []).map((m) => {
      const n = texte(m.nom);
      return `<li><span class="equipe-nom">${n ? esc(n) : aConfirmer("prénom à ajouter")}</span>${texte(m.role) ? `<span class="equipe-role">${esc(m.role)}</span>` : ""}</li>`;
    }).join("");

    logoPied($("#logo-iut"), C.logoIUT, "Logo de l'IUT d'Amiens", "IUT d'Amiens");
    logoPied($("#logo-asso"), a.logo, "Logo de " + nom, nom);
    const resp = texte((C.mentionsLegales || {}).responsable);
    $("#mentions-responsable").innerHTML = resp ? esc(resp) : aConfirmer("nom à compléter");
  }
  function logoPied(el, src, alt, nom) {
    if (!el) return;
    const secours = `<span class="pied-logo-texte"${brouillon ? " data-manque" : ""}>${esc(nom)}</span>`;
    el.innerHTML = texte(src) ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : secours;
    secoursImages(el, ".pied-logo", secours);
  }
  function secoursImages(racine, selecteur, remplacement) {
    $$("img", racine).forEach((img) => {
      img.addEventListener("error", () => {
        const parent = img.closest(selecteur);
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
        navigator.clipboard.writeText(lien).then(
          () => { retour.textContent = "Lien copié !"; },
          () => { retour.textContent = lien; }
        );
      } else retour.textContent = lien;
    });
  }

  /* ───── Interface ───── */
  function quandVisible(el, action, seuil) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { action(el); return; }
    const io = new IntersectionObserver((entrees) => {
      if (entrees.some((e) => e.isIntersecting)) { io.disconnect(); action(el); }
    }, { threshold: seuil || 0.2 });
    io.observe(el);
  }

  function initApparitions() {
    const cibles = $$("[data-anim]");
    if (!cibles.length) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cibles.forEach((el) => el.classList.add("vu"));
      return;
    }
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("vu"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    cibles.forEach((el) => io.observe(el));
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

  if (brouillon) {
    html.classList.add("brouillon");
    $("#bandeau-brouillon").hidden = false;
  }

  lancer("textes", appliquerTextes);
  lancer("liens", () => appliquerLiens(document));
  lancer("kilos", rendreKilos);
  lancer("infos pratiques", rendreInfos);
  lancer("tombola", rendreTombola);
  lancer("suivi", rendreSuivi);
  lancer("association et équipe", rendreQui);
  lancer("agenda", initAgenda);
  lancer("partage", initPartage);
  lancer("compte à rebours", () => { tic(); setInterval(tic, 1000); });
})();
