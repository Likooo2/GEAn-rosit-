/* ════════════════════════════════════════════════════════════════════
   VÉLO CHAOS : la soirée maudite — FICHIER DE CONFIGURATION
   ════════════════════════════════════════════════════════════════════

   👉 C'est LE SEUL fichier à modifier pour mettre le site à jour.

   Les 4 règles d'or (sinon le site casse) :
     1. Les textes restent entre guillemets droits : "comme ça".
        Besoin de guillemets DANS un texte ? Utilise les français : « comme ça ».
     2. Chaque ligne se termine par une virgule, comme dans les exemples.
     3. Les nombres s'écrivent SANS guillemets ni espaces : 1250 (pas "1 250").
        Pour les décimales, un point : 12.5
     4. Tout ce qui suit // est un commentaire : le site l'ignore.

   ⚠️ EXEMPLE = valeur inventée pour la démo. À remplacer avant de partager !

   Si le site devient vide ou bizarre après une modif : c'est presque
   toujours une virgule ou un guillemet oublié juste à l'endroit modifié.
   ════════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* 🚧 MODE BROUILLON
     true  = les exemples à remplacer sont entourés de pointillés bleus
             et un bandeau s'affiche en bas de l'écran.
     false = site propre, prêt à être partagé. */
  modeBrouillon: true,


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 1 — À METTRE À JOUR PENDANT LA CAMPAGNE
     ══════════════════════════════════════════════════════════════════ */

  // 💰 LA CAGNOTTE
  cagnotte: {
    montant: 340,                              // Total récolté en € (HelloAsso + espèces). Ex : 1250
    objectif: 1000,                            // ⚠️ EXEMPLE : votre objectif en €
    miseAJour: "vendredi 6 novembre à 18h30",  // Texte libre, affiché tel quel sous la jauge
  },

  // 🎲 LES PARIS : combien de pronostics dans chaque tranche de km ?
  // Tu peux ajouter, supprimer ou modifier les tranches.
  //   de : km minimum de la tranche
  //   a  : km maximum de la tranche (mets null pour « et plus »)
  compteurParis: {
    tranches: [
      { de: 0,  a: 39,   parieurs: 6  },   // → « moins de 40 km »
      { de: 40, a: 49,   parieurs: 14 },
      { de: 50, a: 59,   parieurs: 23 },
      { de: 60, a: 69,   parieurs: 19 },
      { de: 70, a: 79,   parieurs: 9  },
      { de: 80, a: null, parieurs: 4  },   // → « 80 km et plus »
    ],
    // Nombre total de parieurs affiché.
    // null = somme automatique des tranches. Sinon, écris le nombre (ex : 58).
    totalParieurs: null,
  },

  // 🏁 LES RÉSULTATS : à remplir APRÈS le live (laisse null / vide avant)
  resultat: {
    km: null,        // Distance officielle, arrondie au km. Ex : 63
    gagnant: "",     // Prénom + initiale du gagnant du pari. Ex : "Camille B."
    tombola: [],     // Numéros des billets gagnants, dans l'ordre des lots. Ex : ["0427", "0112", "0035"]
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 2 — À REMPLIR UNE FOIS (asso, liens, lots, équipe…)
     ══════════════════════════════════════════════════════════════════ */

  // 🤝 L'ASSOCIATION
  association: {
    nom: "L'Épi Solidaire",   // ⚠️ EXEMPLE : nom de l'association
    logo: "",                 // Chemin du logo, ex : "img/logo-asso.png" (vide = nom écrit à la place)
    site: "",                 // Site de l'asso, ex : "https://www.site-asso.fr" (optionnel)

    // ⚠️ EXEMPLE : présentation de l'asso (un texte = un paragraphe)
    presentation: [
      "Depuis 2012, L'Épi Solidaire accompagne à Amiens des familles, des étudiants et des personnes seules qui traversent une période difficile.",
      "Ses bénévoles tiennent une épicerie solidaire et un vestiaire, où les adhérents trouvent des produits du quotidien et des vêtements, mais aussi un accueil chaleureux, une oreille attentive et un coup de main pour leurs démarches.",
      "Ici, pas de jugement : l'asso aide chacun à passer un cap, le temps qu'il faut.",
    ],

    // ⚠️ EXEMPLE : 3 chiffres clés (demandez les vrais à l'asso)
    chiffres: [
      { valeur: "350", texte: "foyers accompagnés chaque année" },
      { valeur: "45",  texte: "bénévoles toute l'année" },
      { valeur: "2",   texte: "ouvertures par semaine à Amiens" },
    ],
  },

  // 🔗 LES LIENS (copie-colle les adresses complètes, avec https://)
  liens: {
    donsHelloAsso:     "https://www.helloasso.com/associations/l-epi-solidaire/formulaires/1",                 // ⚠️ EXEMPLE
    parisHelloAsso:    "https://www.helloasso.com/associations/l-epi-solidaire/evenements/velo-chaos-paris",   // ⚠️ EXEMPLE
    tombolaHelloAsso:  "https://www.helloasso.com/associations/l-epi-solidaire/evenements/tombola-vendredi-13", // ⚠️ EXEMPLE
    // Optionnel : boutique HelloAsso « un article = un sabotage ou un boost ». Vide = lien des dons.
    sabotagesHelloAsso: "",
    // Optionnel : adresse du widget HelloAsso pour afficher le formulaire de don dans la page
    // (voir le mode d'emploi). Vide = simple bouton.
    donsWidget: "",
    twitch:    "https://www.twitch.tv/velochaos_amiens",      // ⚠️ EXEMPLE : lien de la chaîne
    instagram: "https://www.instagram.com/velochaos.amiens/", // ⚠️ EXEMPLE
    email:     "contact@velochaos-exemple.fr",                // ⚠️ EXEMPLE (sans « mailto: »)
  },

  // 🗓️ LES DATES (heure de Paris). « +01:00 » = heure d'hiver française, ne le supprime pas.
  dates: {
    debutLive:    "2026-11-13T19:00:00+01:00",
    finLive:      "2026-11-13T22:00:00+01:00",
    clotureParis: "2026-11-13T18:00:00+01:00",
    distribution: "2026-11-21T10:00:00+01:00",   // seul le jour est affiché
  },

  // 🧪 POUR TESTER L'AFFICHAGE : "" (automatique), "avant", "direct" ou "apres"
  // Astuce : sans rien modifier, ajoute ?etat=direct à la fin de l'adresse du site.
  forcerEtat: "",

  // 🪜 LES PALIERS (sub goals) : montant en €, emoji, texte.
  // ⚠️ À VÉRIFIER : remplace les textes par votre liste définitive de défis.
  // Tu peux en ajouter ou en retirer : le site s'adapte tout seul.
  paliers: [
    { montant: 50,   emoji: "🎭", texte: "Le chat Twitch choisit mon déguisement pour tout le live" },
    { montant: 100,  emoji: "🗣️", texte: "Tout le live avec l'accent picard" },
    { montant: 200,  emoji: "👨‍🏫", texte: "Un prof de GEA vient pédaler 15 minutes en direct" },
    { montant: 300,  emoji: "🥄", texte: "Dégustation à l'aveugle de produits bizarres choisis par le chat" },
    { montant: 400,  emoji: "📼", texte: "On tourne en live une pub façon années 90 pour l'association" },
    { montant: 500,  emoji: "💇", texte: "Une mèche de cheveux teinte de la couleur votée par le chat" },
    { montant: 750,  emoji: "🎤", texte: "Karaoké dans le hall de l'IUT sur une chanson choisie par les donateurs" },
    { montant: 1000, emoji: "👠", texte: "Grand final : défilé de mode en live avec les tenues les plus improbables" },
  ],

  // 🚴 LE DÉFI
  // ⚠️ À VÉRIFIER : noms, effets et prix des cartes (ajoute ou retire des cartes librement).
  defi: {
    cycliste: "Hugo",   // ⚠️ EXEMPLE : prénom de la personne qui pédale
    // prix en € — ⚠️ EXEMPLES de prix
    sabotages: [
      { nom: "Pédaler avec des palmes",                  emoji: "🤿", prix: 5,  effet: "Je ressemble à un canard en détresse. Vitesse divisée par deux, dignité par dix." },
      { nom: "Résistance au max pendant 5 minutes",      emoji: "🥵", prix: 5,  effet: "Mes cuisses portent plainte. Le compteur ralentit, mes cris accélèrent." },
      { nom: "Pédaler avec un plateau de verres d'eau",  emoji: "🥛", prix: 7,  effet: "Une goutte renversée et je passe la serpillière. En direct." },
      { nom: "Manger un citron entier sans s'arrêter",   emoji: "🍋", prix: 10, effet: "Zeste compris. Grimaces garanties, pédales interdites de repos." },
    ],
    boosts: [
      { nom: "Musique de motivation",                    emoji: "🎧", prix: 3,  effet: "Tu choisis le son, je pédale en rythme. Même si c'est la Macarena." },
      { nom: "Boisson énergisante",                      emoji: "⚡", prix: 5,  effet: "Turbo activé pendant 10 minutes. Enfin, en théorie." },
      { nom: "Un pote pédale 5 minutes à ma place",      emoji: "🦸", prix: 10, effet: "Je souffle 5 minutes, les kilomètres continuent de tourner." },
    ],
  },

  // 🎯 LE PARI
  paris: {
    lot: "Un panier gourmand 100 % picard : macarons d'Amiens, tuiles au chocolat et jus de pomme de la Somme", // ⚠️ EXEMPLE
    numeroAutorisation: "2026-117",   // ⚠️ EXEMPLE : n° d'autorisation de la mairie d'Amiens
  },

  // 🎟️ LA TOMBOLA
  tombola: {
    prixBillet: 2,   // ⚠️ EXEMPLE : prix d'un billet en €
    // photo : chemin de l'image (ex : "img/lots/macarons.jpg"). Vide = emoji à la place.
    lots: [ // ⚠️ EXEMPLES de lots et de commerçants
      { nom: "Un coffret de macarons d'Amiens",           partenaire: "Pâtisserie Le Beffroi Gourmand", photo: "", emoji: "🍪" },
      { nom: "Un sweat brodé aux couleurs de l'IUT",      partenaire: "Atelier Brod'Amiens",            photo: "", emoji: "🧥" },
      { nom: "Un panier de légumes des hortillonnages",   partenaire: "Les Jardins de la Somme",        photo: "", emoji: "🥬" },
      { nom: "Une plante verte et son pot en céramique",  partenaire: "Fleuriste L'Herbe Folle",        photo: "", emoji: "🪴" },
      { nom: "Un jeu de société pour les soirées entre potes", partenaire: "Le Repaire du Dé",          photo: "", emoji: "🎲" },
    ],
    // Où acheter des billets papier
    pointsDeVente: [
      "Sur notre stand dans le hall de l'IUT d'Amiens, tous les midis",
      "À l'épicerie Au Coin Gourmand, rue des Trois-Cailloux", // ⚠️ EXEMPLE
    ],
  },

  // 🎁 RETRAIT DES LOTS (pari + tombola) — ⚠️ EXEMPLE
  retraitDesLots: "Les gagnants sont contactés par e-mail dans les 7 jours (grâce aux coordonnées laissées sur HelloAsso). Les lots se récupèrent sur notre stand à l'IUT ou au local de l'association, jusqu'au 21 novembre. Billet papier ? Garde-le bien : on vérifie les numéros sur le site.",

  // 💚 LES DONS
  dons: {
    deductible: true,     // true si l'asso est d'intérêt général (elle délivre des reçus fiscaux). Sinon false.
    tauxDeduction: 66,    // 66 % en général. 75 % si l'asso fournit gratuitement repas, soins ou logement
                          // à des personnes en difficulté : vérifiez avec elle !
    exempleDeduction: 30, // Montant pris en exemple : « 30 € donnés ne te coûtent que… »
    // ⚠️ EXEMPLES : montants et objets à caler avec l'asso
    equivalences: [
      { montant: 5,  emoji: "🧼", objet: "un kit d'hygiène : savon, dentifrice, brosse à dents" },
      { montant: 10, emoji: "🥣", objet: "un colis petit-déjeuner pour une famille" },
      { montant: 20, emoji: "🥕", objet: "un panier de fruits et légumes frais" },
      { montant: 50, emoji: "🍼", objet: "un kit bébé : couches et lait infantile" },
    ],
  },

  // 📦 LA COLLECTE (nourriture et vêtements)
  collecte: {
    lieux: [
      { ou: "Supermarché du quartier Saint-Leu", quand: "vendredi 6 et samedi 7 novembre, de 9h à 19h" }, // ⚠️ EXEMPLE
      { ou: "Hall de l'IUT d'Amiens",            quand: "tous les midis, du 2 au 20 novembre" },
    ],
    onCollecte: [
      "Conserves : légumes, poisson, plats cuisinés",
      "Pâtes, riz, semoule, lentilles",
      "Café, thé, sucre, biscuits, céréales",
      "Hygiène : savon, dentifrice, shampoing, protections périodiques",
      "Vêtements chauds, propres et en bon état : manteaux, pulls, écharpes",
    ],
    onNeCollectePas: [
      "Produits frais ou surgelés",
      "Produits ouverts ou périmés",
      "Vêtements abîmés ou tachés",
    ],
  },

  // 🗺️ LA FRISE CHRONOLOGIQUE
  // debut / fin au format année-mois-jour : sert à surligner l'étape en cours.
  frise: [
    { quand: "2 nov.",     titre: "Lancement",             texte: "Le site, la cagnotte, les paris et la tombola ouvrent.", debut: "2026-11-02", fin: "2026-11-02" },
    { quand: "6 et 7 nov.", titre: "Collecte en magasin",  texte: "On remplit les caddies avec toi.",                      debut: "2026-11-06", fin: "2026-11-07" },
    { quand: "13 nov.",    titre: "Vélo Chaos",            texte: "3 heures de live, de sueur et de sabotages.",          debut: "2026-11-13", fin: "2026-11-13" },
    { quand: "14–20 nov.", titre: "Préparation des colis", texte: "On trie, on range, on emballe.",                       debut: "2026-11-14", fin: "2026-11-20" },
    { quand: "21 nov.",    titre: "Distribution",          texte: "Tout est remis aux adhérents de l'association.",        debut: "2026-11-21", fin: "2026-11-21" },
  ],

  // 👥 L'ÉQUIPE — ⚠️ EXEMPLES
  // photo : chemin de l'image carrée (ex : "img/equipe/hugo.jpg"). Vide = avatar rigolo.
  equipe: [
    { prenom: "Hugo",    role: "Le cycliste maudit", emoji: "🚴", photo: "", phrase: "S'entraîne depuis trois semaines. Enfin, il a acheté un cuissard." },
    { prenom: "Inès",    role: "Trésorière",         emoji: "🧮", photo: "", phrase: "Compte chaque centime. Même ceux que tu n'as pas encore donnés." },
    { prenom: "Camille", role: "Com' et réseaux",    emoji: "📱", photo: "", phrase: "Poste quatorze stories par jour. Minimum." },
    { prenom: "Théo",    role: "Logistique",         emoji: "📦", photo: "", phrase: "Porte six packs de lait d'un coup. Il l'a prouvé. Deux fois." },
  ],

  // 🏫 LOGO DE L'IUT (pied de page)
  logoIUT: "",   // Ex : "img/logo-iut.png" (vide = nom écrit à la place)

  // ⚖️ MENTIONS LÉGALES
  mentionsLegales: {
    responsable: "Inès Martin, pour l'équipe Vélo Chaos", // ⚠️ EXEMPLE : prénom + nom d'une personne de l'équipe
    // Si vous passez par Netlify, remplacez par : "Netlify, Inc. (adresse sur netlify.com)"
    hebergeur: "GitHub Pages, service de GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis",
  },
};
