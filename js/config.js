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
     true  = ce qu'il reste à compléter est entouré de pointillés bleus
             (pratique pour travailler, mais visible par tout le monde).
     false = site propre. */
  modeBrouillon: false,


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 1 — LES COMPTEURS (à mettre à jour pendant le projet)
     ══════════════════════════════════════════════════════════════════ */

  compteurs: {
    cagnotte: 0,              // € réellement présents sur la cagnotte HelloAsso
    objectif: 1000,           // € : l'objectif, c'est la ligne d'arrivée de la piste
    denreesKg: 0,             // kg de denrées alimentaires collectées
    vetements: 0,             // nombre de vêtements collectés
    participantsTombola: 0,   // personnes ayant pris un billet de tombola
    // Ces deux compteurs se calculent tout seuls dès qu'il y a des coureurs
    // (liste ci-dessous ou feuille de calcul). Sinon, écris-les à la main.
    coureursInscrits: 0,
    kmParcourus: 0,
    miseAJour: "",            // ex : "lundi 9 novembre à 18h" (vide = ligne masquée)
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 2 — LES LIENS
     ⚠️ Ne mets QUE de vrais liens (avec https://).
     Lien vide = bouton grisé, avec « bientôt disponible ».
     ══════════════════════════════════════════════════════════════════ */

  liens: {
    inscriptionCoureur: "",  // 🏃 formulaire d'inscription des coureurs (Google Forms, HelloAsso…)
    engagement: "",          // 🤝 formulaire d'engagement au kilomètre
    cagnotte: "",            // 💰 HelloAsso : la cagnotte
    tombola: "",             // 🎟️ HelloAsso : la tombola
    live: "https://www.twitch.tv/geanerosite",   // 📺 le live
    strava: "",              // 🟠 club Strava du projet (facultatif)
    instagram: "",
    email: "",               // adresse de contact (sans « mailto: »)

    // 📊 MISE À JOUR AUTOMATIQUE DES COUREURS (facultatif mais très pratique)
    // Adresse CSV d'un Google Sheet publié sur le web (Fichier → Partager →
    // Publier sur le web → format « .csv »). Le site lit la feuille à chaque
    // chargement : plus besoin de recopier les coureurs ni les kilomètres ici.
    // Colonnes reconnues : prenom, dossard, objectif, km, verifie, strava, promesse
    feuilleCoureurs: "",

    // Facultatif : adresse du widget HelloAsso de la cagnotte (iframe).
    // Il affiche le montant réel en direct, sans mise à jour manuelle.
    // Dans HelloAsso : diffusion → intégrer à mon site → copie l'adresse après src="
    widgetCagnotte: "",
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 3 — LA COURSE
     ══════════════════════════════════════════════════════════════════ */

  dates: {
    debutCourse: "2026-11-11T14:00",   // départ (clôture aussi les engagements)
    distribution: "2026-11-21",        // jour de la distribution avec l'association
    // Heure à laquelle le site bascule en « après la course ».
    // La course s'arrête au dernier coureur : mets une heure large.
    finCourse: "2026-11-11T19:00",
    dateConfirmee: true,               // false = le site précise « date provisoire »
  },

  // 🧪 POUR TESTER : "" (automatique), "avant", "direct" ou "apres"
  // Astuce : ajoute ?etat=direct à la fin de l'adresse du site.
  forcerEtat: "",

  course: {
    lieu: "Piste d'athlétisme de l'UPJV, juste derrière l'IUT d'Amiens",
    horaires: "À partir de 14h, jusqu'au dernier coureur",
    depart: "",   // ex : "Retrait des dossards à 13h30" (vide = ligne masquée)
    info: "",     // ex : "Piste de 400 m : 2 tours et demi = 1 km" (vide = ligne masquée)
  },

  /* 🏃 LES COUREURS
     Deux possibilités :
       • soit tu remplis la liste ci-dessous à la main ;
       • soit tu renseignes « feuilleCoureurs » plus haut, et le site lit
         directement ta feuille de calcul (la liste ci-dessous est alors ignorée).
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

  // 🎯 CE QUE L'ARGENT FINANCE : les projets de l'association.
  // ⚠️ Exemples à valider avec A.V.A. avant de les annoncer.
  projetsFinances: [
    { emoji: "🚌", texte: "Des sorties pour les enfants et les familles accompagnées" },
    { emoji: "🌊", texte: "Un voyage, par exemple à la mer" },
    { emoji: "🎨", texte: "Du matériel pour les activités de l'association" },
  ],


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 4 — TOMBOLA ET COLLECTE
     ══════════════════════════════════════════════════════════════════ */

  tombola: {
    prixBillet: 1,        // prix d'un billet en €
    tirage: "Le samedi 21 novembre, le jour de la distribution",
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

  /* 📦 LES DONS EN NATURE
     Pas de dépôt public : l'équipe passe elle-même dans les commerces et les
     entreprises. Ces listes disent simplement ce qui est utile.
     Le tout est distribué le 21 novembre avec l'association. */
  collecte: {
    lieuDistribution: "",   // ex : "Local d'A.V.A., rue…" (vide = à confirmer)
    alimentaire: [
      "Conserves : légumes, poisson, plats cuisinés",
      "Pâtes, riz, semoule, lentilles",
      "Huile, sucre, farine",
      "Café, thé, céréales, biscuits",
    ],
    vetements: [
      "Vêtements propres et en bon état",
      "Manteaux, pulls, vêtements chauds",
      "Vêtements pour enfants",
      "Chaussures en bon état",
    ],
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 5 — L'ASSOCIATION, L'ÉQUIPE, LA TRANSPARENCE
     ══════════════════════════════════════════════════════════════════ */

  association: {
    nom: "A.V.A. – Amiens",
    nomComplet: "Accompagnement Vers l'Autonomie",   // signification du sigle A.V.A.
    logo: "img/logo-ava.png",   // logotype extrait du visuel de l'association
    // Numéros repris du visuel d'A.V.A. Laisse "" pour ne pas les afficher.
    telephone: "07 49 05 15 41 / 07 69 30 06 57",
    site: "",         // site ou page de l'asso, avec https:// (facultatif)
    presentation: [
      "A.V.A. – Amiens, pour Accompagnement Vers l'Autonomie, est un espace de vie sociale. L'association accueille les habitants et les accompagne dans leur quotidien : cours de français, accompagnement scolaire, aide administrative, point relais CAF et conseiller numérique France Services.",
      "Elle propose aussi des ateliers toute l'année : cuisine, couture, tricot et crochet, coiffure et bien-être, activités créatives, sport et marche, et des temps consacrés à la parentalité.",
      "L'argent que nous récoltons finance ses projets : sorties, voyages et activités. Les denrées et les vêtements que nous récupérons auprès des commerces et des entreprises sont distribués le 21 novembre, avec l'association.",
    ],
  },

  transparence: {
    // Qui encaisse l'argent ? (vide = « modalités précisées prochainement »)
    encaissement: "Les paiements arrivent directement sur le compte HelloAsso de l'association : l'argent ne passe jamais par nous.",
  },

  // 👥 L'ÉQUIPE. role : facultatif (la ligne est masquée si c'est vide).
  // photo : facultatif aussi ; laissé vide, le site affiche juste les noms.
  equipe: [
    { nom: "Volkan Akbulut",   role: "", photo: "" },
    { nom: "Julien Pires",     role: "", photo: "" },
    { nom: "Abdoulaye Deme",   role: "", photo: "" },
    { nom: "Noha Bayonga",     role: "", photo: "" },
  ],

  logoIUT: "",   // ex : "img/logo-iut.png" (vide = nom écrit à la place)

  mentionsLegales: {
    responsable: "",   // prénom + nom d'une personne de l'équipe (obligatoire)
    hebergeur: "GitHub Pages, service de GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis",
  },
};
