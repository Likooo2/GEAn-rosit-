/* ════════════════════════════════════════════════════════════════════
   GEAnérosité — FICHIER DE CONFIGURATION
   Une journée de collecte de vêtements à l'IUT d'Amiens.
   ════════════════════════════════════════════════════════════════════

   👉 C'est LE SEUL fichier à modifier pour mettre le site à jour.

   Les 4 règles d'or (sinon le site casse) :
     1. Les textes restent entre guillemets droits : "comme ça".
        Besoin de guillemets DANS un texte ? Utilise les français : « comme ça ».
     2. Chaque ligne se termine par une virgule, comme dans les exemples.
     3. Les nombres s'écrivent SANS guillemets ni espaces : 300 (pas "300 kg").
        Les décimales s'écrivent avec un point : 12.5
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
     PARTIE 1 — LES COMPTEURS (à mettre à jour, surtout le jour J)
     ══════════════════════════════════════════════════════════════════ */

  compteurs: {
    kg: 0,             // kg de vêtements déjà collectés  ← LE chiffre à mettre à jour
    objectifKg: 300,   // l'objectif de la journée, en kg (voir le repère plus bas)
    donateurs: 0,      // nombre de personnes venues déposer des vêtements
    billets: 0,        // billets de tombola vendus
    cagnotte: 0,       // € récoltés (tombola + dons en ligne)
    miseAJour: "",     // ex : "12h30" ou "lundi 16 novembre à 18h" (vide = ligne masquée)
  },

  /* 📏 REPÈRE POUR L'OBJECTIF
     1 kg ≈ 4 vêtements (un jean ≈ 700 g, un tee-shirt ≈ 150 g, un pull ≈ 400 g).
     Un sac de courses bien rempli ≈ 5 kg.
       150 kg → prudent (30 sacs)
       300 kg → ambitieux mais atteignable sur une journée entière (60 sacs)
       500 kg → très ambitieux, il faut que tout l'IUT joue le jeu
     Le site calcule tout seul le pourcentage et le nombre de vêtements estimé. */
  kgParVetement: 0.25,   // poids moyen d'un vêtement, en kg (sert à l'estimation)


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 2 — LES LIENS
     ⚠️ Ne mets QUE de vrais liens (avec https://).
     Lien vide = bouton grisé, avec « bientôt disponible ».
     ══════════════════════════════════════════════════════════════════ */

  liens: {
    tombola: "",     // 🎟️ HelloAsso : billets de tombola en ligne (facultatif :
                     //    les billets papier se vendent sur place le jour J)
    cagnotte: "",    // 💰 HelloAsso : dons en ligne pour les projets de l'association
    instagram: "",   // compte Instagram du projet
    email: "",       // adresse de contact (sans « mailto: »)
    twitch: "https://www.twitch.tv/geanerosite",   // chaîne du projet (facultatif)
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 3 — LA JOURNÉE DE COLLECTE
     ══════════════════════════════════════════════════════════════════ */

  dates: {
    jourCollecte: "",          // ex : "2026-11-18" (vide = « date à confirmer »)
    ouverture: "08:00",        // heure d'ouverture
    fermeture: "19:00",        // heure de fermeture
    distribution: "2026-11-21", // remise des vêtements à l'association
    dateConfirmee: false,      // true quand la date est définitive
  },

  // 🧪 POUR TESTER : "" (automatique), "avant", "direct" ou "apres"
  // Astuce : ajoute ?etat=direct à la fin de l'adresse du site.
  forcerEtat: "",

  collecte: {
    lieu: "IUT d'Amiens",   // établissement
    salle: "",              // ex : "Hall d'entrée, bâtiment A" (vide = à confirmer)
    quiPeutVenir: "Étudiants, enseignants et personnels de l'IUT",
    accepte: [
      "Vêtements propres et en bon état",
      "Manteaux, pulls et vêtements chauds",
      "Jeans, pantalons, robes, tee-shirts",
      "Vêtements pour enfants et pour bébés",
      "Chaussures par paire, attachées ensemble",
      "Linge de maison : draps, serviettes, couvertures",
    ],
    aEviter: [
      "Vêtements troués, tachés ou déchirés",
      "Linge humide ou non lavé",
      "Sous-vêtements usagés",
      "Chaussures dépareillées ou abîmées",
    ],
    conseils: [
      "Rassemblez vos vêtements dans un sac fermé : c'est plus simple à peser et à transporter.",
      "Pas besoin de plier : nous trions sur place avec l'association.",
      "Vous pouvez venir à plusieurs, ou déposer pour un ami absent.",
    ],
  },


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 4 — LA TOMBOLA
     ══════════════════════════════════════════════════════════════════ */

  tombola: {
    prixBillet: 1,        // prix d'un billet en €
    billetsPapier: "Sur place, le jour de la collecte, à la table d'accueil",
    tirage: "Le samedi 21 novembre, le jour de la remise à l'association",
    // statut : "recherche" (on cherche un partenaire) ou "confirme" (lot obtenu).
    lots: [
      { nom: "Carte cadeau Amazon",                              emoji: "🎁", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau Steam, PlayStation ou Xbox",          emoji: "🕹️", statut: "recherche", partenaire: "" },
      { nom: "Places de cinéma",                                 emoji: "🎬", statut: "recherche", partenaire: "" },
      { nom: "Repas ou menu offert dans un restaurant d'Amiens", emoji: "🍔", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau Uber Eats ou Deliveroo",              emoji: "🛵", statut: "recherche", partenaire: "" },
      { nom: "Écouteurs Bluetooth",                              emoji: "🎧", statut: "recherche", partenaire: "" },
      { nom: "Enceinte Bluetooth",                               emoji: "🔊", statut: "recherche", partenaire: "" },
      { nom: "Panier garni ou produits locaux",                   emoji: "🧺", statut: "recherche", partenaire: "" },
      { nom: "Session bowling, laser game ou escape game",        emoji: "🎳", statut: "recherche", partenaire: "" },
      { nom: "Carte cadeau d'un magasin de vêtements",           emoji: "👟", statut: "recherche", partenaire: "" },
      { nom: "Abonnement musique ou streaming (1 à 3 mois)",     emoji: "🎵", statut: "recherche", partenaire: "" },
      { nom: "Goodies et bons d'achat de commerces locaux",      emoji: "🛍️", statut: "recherche", partenaire: "" },
    ],
    gagnants: [],         // APRÈS le tirage : numéros ou prénoms gagnants, dans l'ordre des lots
  },

  // 🎯 CE QUE L'ARGENT DE LA TOMBOLA FINANCE : les projets de l'association.
  // ⚠️ Exemples à valider avec A.V.A. avant de les annoncer.
  projetsFinances: [
    { emoji: "🚌", texte: "Des sorties pour les enfants et les familles accompagnées" },
    { emoji: "🌊", texte: "Un voyage, par exemple à la mer" },
    { emoji: "🎨", texte: "Du matériel pour les ateliers de l'association" },
  ],


  /* ══════════════════════════════════════════════════════════════════
     PARTIE 5 — L'ASSOCIATION, L'ÉQUIPE, LA TRANSPARENCE
     ══════════════════════════════════════════════════════════════════ */

  association: {
    nom: "A.V.A. – Amiens",
    nomComplet: "Accompagnement Vers l'Autonomie",
    logo: "img/logo-ava.png",   // logotype extrait du visuel de l'association
    site: "",                   // site ou page de l'asso, avec https:// (facultatif)
    // Numéros repris du visuel d'A.V.A. Laisse "" pour ne pas les afficher.
    telephone: "07 49 05 15 41 / 07 69 30 06 57",
    presentation: [
      "A.V.A. – Amiens, pour Accompagnement Vers l'Autonomie, est un espace de vie sociale. L'association accueille les habitants et les accompagne dans leur quotidien : cours de français, accompagnement scolaire, aide administrative, point relais CAF et conseiller numérique France Services.",
      "Elle propose aussi des ateliers toute l'année : cuisine, couture, tricot et crochet, coiffure et bien-être, activités créatives, sport et marche, et des temps consacrés à la parentalité.",
      "Les vêtements collectés lui sont remis pour être donnés gratuitement. L'argent de la tombola finance ses projets : sorties, voyages et activités.",
    ],
  },

  transparence: {
    // Qui encaisse l'argent ? (vide = « modalités précisées prochainement »)
    encaissement: "Les paiements en ligne arrivent directement sur le compte HelloAsso de l'association : l'argent ne passe jamais par nous.",
    // Et l'argent des billets papier vendus sur place ?
    especes: "L'argent des billets papier est compté à deux, noté au fur et à mesure, puis remis à l'association avec les vêtements.",
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
