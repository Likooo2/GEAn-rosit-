/* ════════════════════════════════════════════════════════════════════
   GEAnérosité — FICHIER DE CONFIGURATION
   ════════════════════════════════════════════════════════════════════

   👉 C'est LE SEUL fichier à modifier pour mettre le site à jour.

   Les 4 règles d'or (sinon le site casse) :
     1. Les textes restent entre guillemets droits : "comme ça".
        Besoin de guillemets DANS un texte ? Utilise les français : « comme ça ».
     2. Chaque ligne se termine par une virgule, comme dans les exemples.
     3. Les nombres s'écrivent SANS guillemets ni espaces : 1250 (pas "1 250").
     4. Tout ce qui suit // est un commentaire : le site l'ignore.

   🚫 RÈGLE DU PROJET : NE RIEN INVENTER.
   Tant qu'une info n'est pas confirmée, laisse "" (vide) : le site affiche
   automatiquement « à confirmer » ou « bientôt disponible ».
   ════════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* 🚧 MODE BROUILLON
     true  = ce qu'il reste à compléter est entouré de pointillés bleus,
             et chaque bouton sans lien indique quelle ligne remplir.
     false = site propre, prêt à être partagé. */
  modeBrouillon: true,


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 1 — LES COMPTEURS (à mettre à jour pendant le projet)
     ══════════════════════════════════════════════════════════════════ */

  compteurs: {
    cagnotte: 0,              // € récoltés au total (HelloAsso + espèces)
    objectif: 1000,           // € : le dernier palier du live
    denreesKg: 0,             // kg de denrées alimentaires collectées
    vetements: 0,             // nombre de vêtements collectés
    participantsTournoi: 0,   // joueurs inscrits au tournoi
    participantsTombola: 0,   // personnes ayant pris un billet de tombola
    miseAJour: "",            // ex : "lundi 16 novembre à 18h" (vide = ligne masquée)
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 2 — LES LIENS
     ⚠️ Ne mets QUE de vrais liens, copiés depuis HelloAsso (avec https://).
     Lien vide = le bouton s'affiche grisé avec « Lien bientôt disponible ».
     ══════════════════════════════════════════════════════════════════ */

  liens: {
    cagnotte: "",            // 💰 HelloAsso : formulaire de don / cagnotte
    inscriptionTournoi: "",  // 🎮 HelloAsso (ou autre formulaire) : inscription des joueurs
    pronostic: "",           // 🔮 HelloAsso : formulaire de pronostic
    tombola: "",             // 🎟️ HelloAsso : billetterie de la tombola
    live: "",                // 📺 Lien du live (Twitch ou YouTube)
    instagram: "",           // Compte Instagram du projet
    email: "",               // Adresse e-mail de contact (sans « mailto: »)
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 3 — LE TOURNOI
     ══════════════════════════════════════════════════════════════════ */

  // 🗓️ DATES (heure de Paris). Format : "2026-11-20T18:00". Vide = « date à confirmer ».
  dates: {
    debutTournoi: "",       // coup d'envoi du live (clôture aussi les pronostics)
    finTournoi: "",         // fin prévue du live (vide = 4 h après le début)
    dateConfirmee: false,   // true quand la date est définitive (sinon affichée « provisoire »)
  },

  // 🧪 POUR TESTER L'AFFICHAGE : "" (automatique), "avant", "direct" ou "apres"
  // Astuce : sans rien modifier, ajoute ?etat=direct à la fin de l'adresse du site.
  forcerEtat: "",

  tournoi: {
    jeu: "EA FC",           // jeu utilisé (précise la version quand elle est connue)
    lieu: "",               // lieu d'où le live est diffusé (vide = à confirmer)
    format: "",             // ex : "8 joueurs, 2 groupes, demi-finales et finale" (vide = à confirmer)

    // 👥 LES JOUEURS : nom (ou pseudo) et équipe choisie. Vide = « à confirmer ».
    // Leur numéro (1, 2, 3…) sert dans les groupes et les matchs ci-dessous.
    participants: [
      { nom: "", equipe: "" },   // Joueur 1
      { nom: "", equipe: "" },   // Joueur 2
      { nom: "", equipe: "" },   // Joueur 3
      { nom: "", equipe: "" },   // Joueur 4
      { nom: "", equipe: "" },   // Joueur 5
      { nom: "", equipe: "" },   // Joueur 6
      { nom: "", equipe: "" },   // Joueur 7
      { nom: "", equipe: "" },   // Joueur 8
    ],

    // ⚠️ EXEMPLE DE FORMAT (2 groupes de 4) : adapte-le à votre vrai format.
    // Le classement de chaque groupe se calcule tout seul à partir des scores.
    groupes: [
      { nom: "Groupe A", joueurs: [1, 2, 3, 4] },
      { nom: "Groupe B", joueurs: [5, 6, 7, 8] },
    ],

    // ⚽ LES MATCHS : a et b = numéros des joueurs (ou un texte tant qu'on ne sait pas).
    // score : "2-1" une fois le match joué. tab : tirs au but si égalité, ex : "4-3".
    // heure : "18h15" (vide = à confirmer). Le premier match sans score = « prochain match ».
    matchs: [
      { phase: "Groupe A", a: 1, b: 2, score: "", heure: "" },
      { phase: "Groupe A", a: 3, b: 4, score: "", heure: "" },
      { phase: "Groupe B", a: 5, b: 6, score: "", heure: "" },
      { phase: "Groupe B", a: 7, b: 8, score: "", heure: "" },
      { phase: "Groupe A", a: 1, b: 3, score: "", heure: "" },
      { phase: "Groupe A", a: 2, b: 4, score: "", heure: "" },
      { phase: "Groupe B", a: 5, b: 7, score: "", heure: "" },
      { phase: "Groupe B", a: 6, b: 8, score: "", heure: "" },
      { phase: "Groupe A", a: 1, b: 4, score: "", heure: "" },
      { phase: "Groupe A", a: 2, b: 3, score: "", heure: "" },
      { phase: "Groupe B", a: 5, b: 8, score: "", heure: "" },
      { phase: "Groupe B", a: 6, b: 7, score: "", heure: "" },
      // Phase finale : remplace les textes par les numéros des joueurs qualifiés (ex : a: 3)
      { phase: "Demi-finale 1", a: "1er du groupe A", b: "2e du groupe B", score: "", tab: "", heure: "" },
      { phase: "Demi-finale 2", a: "1er du groupe B", b: "2e du groupe A", score: "", tab: "", heure: "" },
      { phase: "Finale", a: "Vainqueur demi-finale 1", b: "Vainqueur demi-finale 2", score: "", tab: "", heure: "" },
    ],
  },

  // 🪜 LES OBJECTIFS DU LIVE (subgoals) : montant en €, emoji, texte.
  // aConfirmer: true affiche « à confirmer » à côté (quand ça dépend d'une autre personne).
  paliers: [
    { montant: 50,   emoji: "🎮", texte: "Un joueur doit jouer avec une équipe 3 étoiles." },
    { montant: 100,  emoji: "🔄", texte: "Le perdant d'un match obtient une revanche." },
    { montant: 200,  emoji: "🎙️", texte: "Un commentateur invité rejoint les matchs." },
    { montant: 300,  emoji: "👨‍🏫", texte: "Un professeur de BUT GEA participe au tournoi.", aConfirmer: true },
    { montant: 500,  emoji: "🏆", texte: "Grande finale organisée en plein milieu d'Amiens.", aConfirmer: true },
    { montant: 750,  emoji: "🎯", texte: "Le public choisit les équipes de la finale, avec des équipes de niveau équivalent." },
    { montant: 1000, emoji: "🥇", texte: "Match exhibition final : le gagnant du tournoi affronte l'équipe choisie par le public." },
  ],


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 4 — PRONOSTIC ET TOMBOLA
     ══════════════════════════════════════════════════════════════════ */

  pronostic: {
    participation: "",    // ex : "Participation libre, à partir de 1 €" (vide = à confirmer)
    surprise: "",         // la surprise pour le bon pronostic (vide = à confirmer)
    bonsPronostics: "",   // APRÈS le tournoi : prénom + initiale du ou des gagnants
  },

  tombola: {
    prixBillet: null,     // prix d'un billet en € (null = à confirmer). Ex : 2
    tirage: "",           // ex : "Pendant le live, avant la finale" (vide = à confirmer)
    // statut : "recherche" (on cherche un partenaire) ou "confirme" (lot obtenu).
    // partenaire : nom du commerce, à remplir SEULEMENT quand le lot est confirmé.
    lots: [
      { nom: "Carte cadeau Amazon",                                   emoji: "🎁", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau Steam, PlayStation ou Xbox",               emoji: "🕹️", statut: "recherche", partenaire: "" },
      { nom: "Places de cinéma",                                      emoji: "🎬", statut: "recherche", partenaire: "" },
      { nom: "Repas ou menu offert dans un restaurant d'Amiens",      emoji: "🍔", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau Uber Eats ou Deliveroo",                   emoji: "🛵", statut: "recherche", partenaire: "" },
      { nom: "Écouteurs Bluetooth",                                   emoji: "🎧", statut: "recherche", partenaire: "" },
      { nom: "Enceinte Bluetooth",                                    emoji: "🔊", statut: "recherche", partenaire: "" },
      { nom: "Accessoires gaming : manette, casque, tapis de souris",  emoji: "🎮", statut: "recherche", partenaire: "" },
      { nom: "Session bowling, laser game ou escape game",            emoji: "🎳", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau d'un magasin de vêtements",                emoji: "👟", statut: "recherche", partenaire: "" },
      { nom: "Abonnement musique ou streaming (1 à 3 mois)",          emoji: "🎵", statut: "recherche", partenaire: "" },
      { nom: "Goodies et bons d'achat de commerces locaux",           emoji: "🛍️", statut: "recherche", partenaire: "" },
    ],
    gagnants: [],         // APRÈS le tirage : numéros ou prénoms gagnants, dans l'ordre des lots
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 5 — LA COLLECTE
     ══════════════════════════════════════════════════════════════════ */

  collecte: {
    // Où et quand déposer. Vide = « lieux et dates à confirmer ».
    // Ex : { ou: "Hall de l'IUT d'Amiens", quand: "du 2 au 20 novembre, le midi" },
    points: [],
    // Listes indicatives : à ajuster selon les besoins d'A.V.A.
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
    aEviter: [
      "Produits frais, ouverts ou périmés",
      "Vêtements abîmés ou tachés",
    ],
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 6 — L'ASSOCIATION, L'ÉQUIPE, LA TRANSPARENCE
     ══════════════════════════════════════════════════════════════════ */

  association: {
    nom: "A.V.A. – Amiens",
    nomComplet: "",   // signification du sigle A.V.A. (à compléter avec l'asso)
    logo: "",         // ex : "img/logo-ava.png" (vide = nom écrit à la place)
    site: "",         // site ou page de l'asso, avec https:// (optionnel)
    // Présentation : un texte = un paragraphe. Faites-la relire par A.V.A.
    presentation: [
      "A.V.A. – Amiens est l'association que nous soutenons. Elle prépare notamment un voyage ou une sortie pour des enfants issus de situations très précaires.",
      "Les aliments et les vêtements que nous collectons lui sont remis, pour être donnés gratuitement à des personnes dans le besoin.",
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
