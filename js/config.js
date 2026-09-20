/* ════════════════════════════════════════════════════════════════════
   GEAnérosité — FICHIER DE CONFIGURATION
   Course solidaire : chaque kilomètre rapporte.
   ════════════════════════════════════════════════════════════════════

   👉 C'est LE SEUL fichier à modifier pour mettre le site à jour.

   Les 4 règles d'or (sinon le site casse) :
     1. Les textes restent entre guillemets droits : "comme ça".
        Besoin de guillemets DANS un texte ? Utilise les français : « comme ça ».
     2. Chaque ligne se termine par une virgule, comme dans les exemples.
     3. Les nombres s'écrivent SANS guillemets ni espaces : 1250 (pas "1 250").
        Les centimes s'écrivent avec un point : 0.5 pour 0,50 €.
     4. Tout ce qui suit // est un commentaire : le site l'ignore.

   🚫 RÈGLE DU PROJET : NE RIEN INVENTER.
   Tant qu'une info n'est pas confirmée, laisse "" (vide) : le site affiche
   automatiquement « à confirmer » ou « bientôt disponible ».
   ════════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* 🚧 MODE BROUILLON
     true  = ce qu'il reste à compléter est entouré de pointillés bleus.
     false = site propre, prêt à être partagé. */
  modeBrouillon: true,


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 1 — LES COMPTEURS (à mettre à jour pendant le projet)
     ══════════════════════════════════════════════════════════════════ */

  compteurs: {
    cagnotte: 0,              // € réellement présents sur la cagnotte HelloAsso
    objectif: 1000,           // € : l'objectif affiché dans la jauge
    vetements: 0,             // nombre de vêtements déjà collectés
    participantsTombola: 0,   // personnes ayant pris un billet de tombola
    // Ces deux compteurs se calculent tout seuls dès que la liste des coureurs
    // ci-dessous est remplie. Sinon, écris les nombres à la main ici.
    coureursInscrits: 0,
    kmParcourus: 0,
    miseAJour: "",            // ex : "lundi 16 novembre à 18h" (vide = ligne masquée)
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 2 — LES LIENS
     ⚠️ Ne mets QUE de vrais liens (avec https://).
     Lien vide = bouton grisé, avec « bientôt disponible ».
     ══════════════════════════════════════════════════════════════════ */

  liens: {
    inscriptionCoureur: "",  // 🏃 formulaire d'inscription des coureurs (HelloAsso, Google Forms…)
    engagement: "",          // 🤝 formulaire d'engagement au kilomètre
    cagnotte: "",            // 💰 HelloAsso : la cagnotte
    tombola: "",             // 🎟️ HelloAsso : la tombola
    live: "",                // 📺 lien du live (Twitch ou YouTube)
    strava: "",              // 🟠 club Strava du projet (facultatif)
    instagram: "",
    email: "",               // adresse de contact (sans « mailto: »)
    // Facultatif : adresse du widget HelloAsso de la cagnotte (iframe).
    // Il affiche le montant réel en direct, sans mise à jour manuelle.
    // Dans HelloAsso : diffusion → intégrer à mon site → copie l'adresse après src="
    widgetCagnotte: "",
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 3 — LA COURSE
     ══════════════════════════════════════════════════════════════════ */

  // 🗓️ DATES (heure de Paris). Format : "2026-11-21T10:00". Vide = « date à confirmer ».
  dates: {
    debutCourse: "",        // départ de la course (clôture aussi les engagements)
    finCourse: "",          // fin de la course (vide = 3 h après le départ)
    dateConfirmee: false,   // true quand la date est définitive
  },

  // 🧪 POUR TESTER : "" (automatique), "avant", "direct" ou "apres"
  // Astuce : ajoute ?etat=direct à la fin de l'adresse du site.
  forcerEtat: "",

  course: {
    lieu: "",        // ex : "Parc de la Hotoie, Amiens" (vide = à confirmer)
    format: "",      // ex : "2 heures, boucle libre, à son rythme" (vide = à confirmer)
    depart: "",      // ex : "Départ groupé à 10h, échauffement à 9h30" (vide = à confirmer)
  },

  /* 🏃 LES COUREURS
     Ajoute une ligne par coureur inscrit. Le site s'occupe du reste :
     recherche, sélection, calcul des engagements et classement des km.
       prenom       : prénom (+ initiale si besoin), affiché publiquement
       dossard      : numéro unique, sert aussi de lien de partage (?coureur=7)
       objectifKm   : son objectif en km (sert à estimer les engagements)
       km           : kilomètres réalisés, à remplir pendant et après la course
       kmVerifies   : passe à true une fois les km vérifiés sur Strava
       strava       : lien de son activité ou de son profil Strava (facultatif)
       promesseParKm: total des engagements reçus, en € par km (facultatif)
     Exemple :
       { prenom: "Julien", dossard: 1, objectifKm: 15, km: 0, kmVerifies: false, strava: "", promesseParKm: 0 },
  */
  coureurs: [],

  // 🤝 LES ENGAGEMENTS (réglages du simulateur)
  engagement: {
    montantsSuggeres: [0.2, 0.5, 1, 2],  // boutons proposés, en € par km
    plafondConseille: 30,                // plafond proposé par défaut, en €
    seuilAlerte: 50,                     // € : au-delà, message de prudence
    seuilFort: 100,                      // € : au-delà, message plus insistant
    maxParKm: 20,                        // € par km maximum accepté par le simulateur
    kmReference: 15,                     // km utilisés pour estimer si le coureur n'a pas d'objectif
  },

  // 🎯 LES PALIERS DE LA CAGNOTTE : ce que l'argent permet concrètement.
  // ⚠️ Exemples à valider avec l'association avant de les annoncer.
  paliers: [
    { montant: 100,  emoji: "🧺", texte: "Le matériel de la collecte : sacs, cartons, étiquettes et transport des vêtements." },
    { montant: 250,  emoji: "🧼", texte: "Le nettoyage et la remise en état d'une partie des vêtements collectés." },
    { montant: 500,  emoji: "📦", texte: "L'essentiel de la collecte est financé : tri, stockage et distribution." },
    { montant: 1000, emoji: "🌊", texte: "Le surplus part à A.V.A. : de quoi financer un voyage à la mer pour les enfants accompagnés, et d'autres projets." },
  ],


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 4 — TOMBOLA ET COLLECTE
     ══════════════════════════════════════════════════════════════════ */

  tombola: {
    prixBillet: null,     // prix d'un billet en € (null = à confirmer). Ex : 2
    tirage: "",           // ex : "Pendant le live, à l'arrivée des coureurs"
    // statut : "recherche" (on cherche un partenaire) ou "confirme" (lot obtenu).
    lots: [
      { nom: "Carte cadeau Amazon",                              emoji: "🎁", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau Steam, PlayStation ou Xbox",          emoji: "🕹️", statut: "recherche", partenaire: "" },
      { nom: "Places de cinéma",                                 emoji: "🎬", statut: "recherche", partenaire: "" },
      { nom: "Repas ou menu offert dans un restaurant d'Amiens", emoji: "🍔", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau Uber Eats ou Deliveroo",              emoji: "🛵", statut: "recherche", partenaire: "" },
      { nom: "Écouteurs Bluetooth",                              emoji: "🎧", statut: "recherche", partenaire: "" },
      { nom: "Enceinte Bluetooth",                               emoji: "🔊", statut: "recherche", partenaire: "" },
      { nom: "Équipement de running : gourde, ceinture, chaussettes", emoji: "🏃", statut: "recherche", partenaire: "" },
      { nom: "Session bowling, laser game ou escape game",        emoji: "🎳", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau d'un magasin de sport",               emoji: "👟", statut: "recherche", partenaire: "" },
      { nom: "Abonnement musique ou streaming (1 à 3 mois)",     emoji: "🎵", statut: "recherche", partenaire: "" },
      { nom: "Goodies et bons d'achat de commerces locaux",      emoji: "🛍️", statut: "recherche", partenaire: "" },
    ],
    gagnants: [],         // APRÈS le tirage : numéros ou prénoms gagnants, dans l'ordre des lots
  },

  collecte: {
    // Où et quand déposer les vêtements. Vide = « lieux et dates à confirmer ».
    // Ex : { ou: "Hall de l'IUT d'Amiens", quand: "du 2 au 20 novembre, le midi" },
    points: [],
    vetements: [
      "Vêtements propres et en bon état",
      "Manteaux, pulls, vêtements chauds",
      "Vêtements pour enfants",
      "Chaussures en bon état",
    ],
    aEviter: [
      "Vêtements abîmés, tachés ou troués",
      "Linge humide ou non lavé",
    ],
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 5 — L'ASSOCIATION, L'ÉQUIPE, LA TRANSPARENCE
     ══════════════════════════════════════════════════════════════════ */

  association: {
    nom: "A.V.A. – Amiens",
    nomComplet: "",   // signification du sigle A.V.A. (à compléter avec l'asso)
    logo: "",         // ex : "img/logo-ava.png" (vide = nom écrit à la place)
    site: "",         // site ou page de l'asso, avec https:// (facultatif)
    presentation: [
      "A.V.A. – Amiens est l'association que nous soutenons. Elle accompagne notamment des enfants issus de situations très précaires.",
      "Les vêtements que nous collectons lui sont remis, pour être donnés gratuitement à des personnes dans le besoin.",
    ],
  },

  transparence: {
    // Qui encaisse l'argent ? À préciser, ex : "Les paiements arrivent directement
    // sur le compte HelloAsso d'A.V.A." (vide = « modalités précisées prochainement »)
    encaissement: "",
  },

  // 👥 L'ÉQUIPE (4 étudiants). photo : ex "img/equipe/prenom.jpg" (vide = silhouette)
  equipe: [
    { prenom: "", role: "", photo: "" },
    { prenom: "", role: "", photo: "" },
    { prenom: "", role: "", photo: "" },
    { prenom: "", role: "", photo: "" },
  ],

  logoIUT: "",   // ex : "img/logo-iut.png" (vide = nom écrit à la place)

  mentionsLegales: {
    responsable: "",   // prénom + nom d'une personne de l'équipe (obligatoire)
    hebergeur: "GitHub Pages, service de GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis",
  },
};
