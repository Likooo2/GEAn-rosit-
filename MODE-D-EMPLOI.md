# Mode d'emploi : site GEAnérosité (collecte de vêtements)

**La règle d'or : tu ne modifies qu'un seul fichier, `js/config.js`.** Le compteur de kilos, l'objectif, les horaires, la tombola, les listes, l'association : tout est dedans, en français et commenté.

Le site est en ligne : **https://likooo2.github.io/GEAn-rosit-/**
Pour le modifier : ouvre le lien ci-dessous, clique sur le crayon ✏️, change ce que tu veux, puis **Commit changes**. C'est publié une à deux minutes plus tard, et ça marche depuis un téléphone :
👉 https://github.com/Likooo2/GEAn-rosit-/edit/main/js/config.js

> Bandeau rouge après une modification ? C'est presque toujours une **virgule** ou un **guillemet** oublié à l'endroit que tu viens de modifier.

Déjà renseigné : les horaires (8h → 19h), l'IUT d'Amiens, l'objectif de 300 kg, la tombola à 1 € avec billets papier sur place et tirage le 21 novembre, les listes de ce qu'on accepte et de ce qu'on refuse, le logotype et la présentation d'A.V.A., l'encaissement, et vos quatre noms.

---

## 1. Le jour J : la seule ligne qui compte

```js
compteurs: {
  kg: 0,             // ← le poids collecté, en kg
  objectifKg: 300,
  donateurs: 0,      // nombre de personnes venues déposer
  billets: 0,        // billets de tombola vendus
  cagnotte: 0,       // € récoltés
  miseAJour: "",     // ex : "16h10"
},
```

Tu changes `kg`, tu valides, et tout suit : le pourcentage, le carton qui se remplit, le compte à rebours, le message « plus que X kg », l'estimation en nombre de vêtements et les compteurs.

**Conseil pour la journée** : une mise à jour par heure suffit, avec l'heure dans `miseAJour`. Depuis un téléphone, il faut moins d'une minute : lien ci-dessus, crayon, tu changes le chiffre, **Commit changes**.

Les décimales s'écrivent avec un point : `182.5` pour 182,5 kg.

---

## 2. L'objectif

`objectifKg: 300` est un choix, pas une vérité. Repère utile : un sac de courses bien rempli fait environ 5 kg, et 1 kg représente à peu près 4 vêtements.

| Objectif | Ce que ça représente | Pour qui |
|---|---|---|
| 150 kg | 30 sacs, environ 600 vêtements | prudent |
| **300 kg** | 60 sacs, environ 1 200 vêtements | **ambitieux mais atteignable sur une journée** |
| 500 kg | 100 sacs, environ 2 000 vêtements | seulement si tout l'IUT relaie |

Mieux vaut un objectif atteint et dépassé qu'une jauge bloquée à 40 % toute la journée. Tu peux le changer jusqu'au dernier moment, et même en cours de journée si vous explosez le compteur.

---

## 3. L'affiche pour la salle

Dans la partie **L'objectif**, le bouton « Imprimer l'affiche de la salle » génère une **affiche A4** prête à imprimer : le titre, la date, les horaires, le lieu, ce qu'on accepte et ce qu'on refuse, et une **grande jauge graduée à colorier au marqueur** au fil de la journée, avec une case « déjà collecté : ____ kg ».

Imprime-la en deux exemplaires : une sur la table d'accueil, une à l'entrée du bâtiment.

---

## 4. Ce qu'il reste à compléter

- [ ] **La date de la collecte** : `dates.jourCollecte`, par exemple `"2026-11-18"`. Tant qu'elle est vide, le site affiche « date à confirmer » et le compte à rebours reste à zéro. Quand elle est définitive, passe `dateConfirmee` à `true`.
- [ ] **La salle** : `collecte.salle`, par exemple `"Hall du bâtiment A"`.
- [ ] **L'adresse e-mail** (`liens.email`) : elle sert au bouton « Proposer un lot » des commerces et à la FAQ.
- [ ] **L'Instagram** (`liens.instagram`), si vous en ouvrez un.
- [ ] **Le responsable de publication** (`mentionsLegales.responsable`) : obligatoire, un prénom et un nom.
- [ ] **Les lots** : quand un lot est obtenu, passe son `statut` de `"recherche"` à `"confirme"` et ajoute le partenaire.
- [ ] Facultatif : `liens.tombola` (billets en ligne) et `liens.cagnotte` (dons en ligne). Sans ces liens, le site explique simplement que tout se passe sur place, sans bouton mort.
- [ ] Facultatif : les rôles de l'équipe, le logo de l'IUT (`logoIUT`), la présentation d'A.V.A. relue par l'association.

---

## 5. Tester l'affichage sans attendre

- `?etat=direct` : le site comme pendant la collecte
- `?etat=apres` : le site comme après la collecte
- `?maintenant=2026-11-18T10:30` : simule une date et une heure

Ces tests ne changent rien pour les autres visiteurs.

---

## 6. Cinq points à régler avant le jour J

1. **L'autorisation de l'IUT** : la salle ou le hall, une table, deux chaises, l'affichage dans les couloirs, et le droit de stocker les sacs jusqu'au 21 novembre. C'est le point le plus important.
2. **La balance** : une balance de cuisine ne suffira pas. Un pèse-personne fait très bien l'affaire : vous pesez un sac dans les bras, ou vous montez avec le sac puis sans.
3. **Le stockage et le transport** : où entassez-vous 300 kg de sacs, et avec quelle voiture allez-vous les remettre à A.V.A. le 21 novembre ?
4. **La tombola** : une tombola ouverte au public demande en général une autorisation de la mairie, et les lots doivent être des objets ou des bons, jamais de l'argent. À voir avec A.V.A., qui a l'habitude. Le règlement du site est un projet à valider.
5. **L'argent en espèces** : annoncez comment vous le gérez (le site le dit déjà : compté à deux, noté au fur et à mesure, remis avec les vêtements).

Pense aussi à l'accord d'A.V.A. pour son logo et sa présentation.

---

## 7. En cas de pépin

| Ce que tu vois | La solution |
|---|---|
| Bandeau rouge « config.js contient une erreur » | Une virgule ou un guillemet manque à l'endroit modifié. Sur ordinateur, la touche **F12** (onglet *Console*) donne le numéro de la ligne. |
| Le carton ne bouge pas | Vérifie que `kg` est bien un nombre, sans guillemets ni « kg » : `182.5`, pas `"182,5 kg"`. |
| Un bouton reste grisé | Le lien correspondant est vide dans `liens` (il doit commencer par `https://`). C'est normal tant que vous n'avez pas de lien. |
| Le logo d'A.V.A. n'apparaît pas | Le fichier doit s'appeler exactement comme dans `association.logo` (`img/logo-ava.png`). |
| Ta modification n'apparaît pas | Recharge la page. GitHub met une à deux minutes à publier. |
| L'affiche s'imprime avec le site autour | Choisis « Imprimer » depuis le bouton du site, pas depuis le menu du navigateur. |

---

## 8. Remettre le site en ligne ailleurs (si besoin)

Le dossier complet fonctionne sur n'importe quel hébergeur de fichiers statiques. Sur **Netlify** : crée un compte, puis dans **Projects**, ouvre **Add new project**, choisis **Deploy manually** et dépose le dossier entier. Pense alors à remplacer les 2 adresses de partage en haut de `index.html`, ainsi que l'hébergeur dans `config.js`.
