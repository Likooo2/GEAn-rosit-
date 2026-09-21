/* ════════════════════════════════════════════════════════════════════
   GEAnérosité — FICHIER DE CONFIGURATION
   Collecte de vêtements du mercredi 11 novembre, à l'IUT d'Amiens.
   ════════════════════════════════════════════════════════════════════

   👉 C'est LE SEUL fichier à modifier pour mettre le site à jour.

   Les 4 règles d'or (sinon le site casse) :
     1. Les textes restent entre guillemets droits : "comme ça".
        Besoin de guillemets DANS un texte ? Utilise les français : « comme ça ».
     2. Chaque ligne se termine par une virgule, comme dans les exemples.
     3. Les nombres s'écrivent SANS guillemets ni espaces : 300 (pas "300 kg").
        Les décimales s'écrivent avec un point : 182.5
     4. Tout ce qui suit // est un commentaire : le site l'ignore.

   Tant qu'une info n'est pas confirmée, laisse "" (vide) : le site affiche
   « à confirmer » ou grise le bouton, plutôt que d'inventer.
   ════════════════════════════════════════════════════════════════════ */

const CONFIG = {

  // true = les infos manquantes sont entourées de pointillés (pour travailler)
  modeBrouillon: false,


  /* ══════════════════════════════════════════════════════════════════
     1. LES COMPTEURS — à mettre à jour, surtout le jour J
     ══════════════════════════════════════════════════════════════════ */

  compteurs: {
    kg: 0,             // kg de vêtements collectés  ← LE chiffre à mettre à jour
    objectifKg: 300,   // objectif de la journée, en kg
    donateurs: 0,      // nombre de personnes venues déposer
    billets: 0,        // billets de tombola vendus
    cagnotte: 0,       // € récoltés pour l'association
    miseAJour: "",     // ex : "16h10" (vide = ligne masquée)
  },

  /* Repère pour l'objectif : un sac bien rempli ≈ 5 kg, et 1 kg ≈ 4 vêtements.
       150 kg → prudent (30 sacs)      300 kg → ambitieux mais atteignable
       500 kg → seulement si tout l'IUT relaie l'info                        */
  kgParVetement: 0.25,


  /* ══════════════════════════════════════════════════════════════════
     2. LES LIENS — que de vrais liens, avec https://
     Lien vide = bouton grisé, avec « bientôt disponible ».
     ══════════════════════════════════════════════════════════════════ */

  liens: {
    instagram: "",   // page Instagram du projet
    facebook: "",    // page Facebook du projet
    email: "",       // adresse de contact (sans « mailto: »)
    tombola: "",     // facultatif : billets de tombola en ligne (HelloAsso)
    cagnotte: "",    // facultatif : dons en ligne (HelloAsso)
  },


  /* ══════════════════════════════════════════════════════════════════
     3. LA JOURNÉE
     ══════════════════════════════════════════════════════════════════ */

  dates: {
    jourCollecte: "2026-11-11",   // mercredi 11 novembre
    ouverture: "08:00",
    fermeture: "19:00",
    dateConfirmee: true,          // false = le site précise « date provisoire »
  },

  // Pour tester l'affichage : "" (automatique), "avant", "direct" ou "apres"
  // Astuce : ajoute ?etat=direct à la fin de l'adresse du site.
  forcerEtat: "",

  collecte: {
    lieu: "IUT d'Amiens",
    salle: "",     // ex : "Hall du bâtiment A" (vide = « salle à confirmer »)
    public: "Étudiants, enseignants et personnels de l'IUT",
    accepte: [
      "Vêtements propres et en bon état",
      "Manteaux, pulls, vêtements chauds",
      "Jeans, pantalons, robes, tee-shirts",
      "Vêtements enfants et bébés",
      "Chaussures par paire, attachées ensemble",
      "Linge de maison : draps, serviettes, couvertures",
    ],
    refuse: [
      "Vêtements troués, tachés ou déchirés",
      "Linge humide ou non lavé",
      "Sous-vêtements usagés",
      "Chaussures dépareillées ou abîmées",
    ],
  },


  /* ══════════════════════════════════════════════════════════════════
     4. LA TOMBOLA
     ══════════════════════════════════════════════════════════════════ */

  tombola: {
    prixBillet: 1,
    billetsPapier: "Billets papier à la table d'accueil, toute la journée",
    tirage: "À la fin de la journée, sur place",
    // statut : "recherche" tant que le lot n'est pas obtenu, "confirme" ensuite.
    lots: [
      { nom: "Carte cadeau Amazon",                          emoji: "🎁", statut: "recherche", partenaire: "" },
      { nom: "Places de cinéma",                             emoji: "🎬", statut: "recherche", partenaire: "" },
      { nom: "Repas dans un restaurant d'Amiens",            emoji: "🍽️", statut: "recherche", partenaire: "" },
      { nom: "Session de bowling",                           emoji: "🎳", statut: "recherche", partenaire: "" },
      { nom: "Session de laser game",                        emoji: "🎯", statut: "recherche", partenaire: "" },
      { nom: "Escape game",                                  emoji: "🔐", statut: "recherche", partenaire: "" },
    ],
    gagnants: [],   // après le tirage : prénoms ou numéros gagnants, dans l'ordre des lots
  },

  // Ce que l'argent de la tombola finance (à valider avec l'association)
  projetsFinances: [
    { texte: "Des sorties pour les enfants et les familles accompagnées" },
    { texte: "Un voyage, par exemple à la mer" },
    { texte: "Du matériel pour les ateliers de l'association" },
  ],


  /* ══════════════════════════════════════════════════════════════════
     5. L'ASSOCIATION, L'ÉQUIPE, LA TRANSPARENCE
     ══════════════════════════════════════════════════════════════════ */

  association: {
    nom: "A.V.A. – Amiens",
    nomComplet: "Accompagnement Vers l'Autonomie",
    logo: "img/logo-ava.png",
    site: "",
    telephone: "07 49 05 15 41 / 07 69 30 06 57",
    presentation: [
      "A.V.A. – Amiens, pour Accompagnement Vers l'Autonomie, est un espace de vie sociale. L'association accompagne les habitants au quotidien : cours de français, aide aux devoirs, aide administrative, point relais CAF et conseiller numérique.",
      "Elle anime aussi des ateliers toute l'année : cuisine, couture, tricot, coiffure et bien-être, activités créatives, sport et parentalité.",
      "Les vêtements que nous collectons lui sont remis pour être donnés gratuitement. L'argent de la tombola finance ses projets.",
    ],
  },

  transparence: {
    encaissement: "Les paiements en ligne arrivent directement sur le compte HelloAsso de l'association.",
    especes: "L'argent des billets papier est compté à deux, noté au fur et à mesure, puis remis à l'association avec les vêtements.",
  },

  // L'équipe. role : facultatif (la ligne disparaît si c'est vide).
  equipe: [
    { nom: "Volkan Akbulut",  role: "" },
    { nom: "Julien Pires",    role: "" },
    { nom: "Abdoulaye Deme",  role: "" },
    { nom: "Noha Bayonga",    role: "" },
  ],

  logoIUT: "",   // ex : "img/logo-iut.png" (vide = nom écrit à la place)

  mentionsLegales: {
    responsable: "",   // prénom + nom d'une personne de l'équipe (obligatoire)
    hebergeur: "GitHub Pages, service de GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis",
  },
};
