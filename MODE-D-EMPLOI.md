# Mode d'emploi du site GEAnérosité

**Un seul fichier à modifier : `js/config.js`.** Le compteur de kilos, l'objectif, les horaires, les lots, l'association : tout est dedans, en français et commenté.

Le site est en ligne : **https://likooo2.github.io/GEAn-rosit-/**
Pour le modifier : ouvre le lien ci-dessous, clique sur le crayon ✏️, change ce que tu veux, puis **Commit changes**. C'est publié une à deux minutes plus tard, même depuis un téléphone :
👉 https://github.com/Likooo2/GEAn-rosit-/edit/main/js/config.js

> Bandeau rouge après une modification ? C'est presque toujours une virgule ou un guillemet oublié à l'endroit que tu viens de modifier.

---

## 1. Le jour J : une seule ligne

```js
compteurs: {
  kg: 0,             // ← le poids collecté, en kg
  objectifKg: 300,
  donateurs: 0,      // personnes venues déposer
  billets: 0,        // billets de tombola vendus
  cagnotte: 0,       // € récoltés
  miseAJour: "",     // ex : "16h10"
},
```

Tu changes `kg`, et tout suit : le pourcentage, le carton qui se remplit, la barre du compte à rebours, le message « encore X kg », l'estimation en nombre de vêtements et les quatre chiffres du bas.

Les décimales s'écrivent avec un point : `182.5` pour 182,5 kg.

**Pendant la journée** : une mise à jour par heure suffit, avec l'heure dans `miseAJour`.

---

## 2. Les liens (Instagram, Facebook, e-mail)

```js
liens: {
  instagram: "",   // ex : "https://www.instagram.com/geanerosite/"
  facebook: "",    // ex : "https://www.facebook.com/geanerosite"
  email: "",       // ex : "geanerosite@gmail.com"  (sans mailto:)
  tombola: "",     // facultatif : billets en ligne
  cagnotte: "",    // facultatif : dons en ligne
},
```

Tant qu'un lien est vide, le bouton reste visible mais grisé, avec « bientôt disponible » : aucun lien mort sur le site. Dès que tu colles l'adresse, le bouton s'active tout seul, dans la section Contact et dans la FAQ.

---

## 3. L'objectif en kilos

`objectifKg: 300` est un choix, pas une vérité. Un sac bien rempli fait environ 5 kg, et 1 kg représente à peu près 4 vêtements.

| Objectif | Ce que ça représente |
|---|---|
| 150 kg | 30 sacs, environ 600 vêtements — prudent |
| **300 kg** | 60 sacs, environ 1 200 vêtements — ambitieux mais atteignable |
| 500 kg | 100 sacs, environ 2 000 vêtements — seulement si tout l'IUT relaie |

Mieux vaut un objectif dépassé qu'une jauge bloquée à 40 % toute la journée. Tu peux le changer jusqu'au dernier moment.

---

## 4. La tombola

```js
tombola: {
  prixBillet: 1,
  billetsPapier: "Billets papier à la table d'accueil, toute la journée",
  tirage: "À la fin de la journée, sur place",
  lots: [ … ],
  gagnants: [],
},
```

Les six lots sont affichés « en cours de recherche ». Quand un commerce accepte, passe son `statut` de `"recherche"` à `"confirme"` et écris son nom dans `partenaire` : le site affiche « Offert par … ».

Après le tirage, remplis `gagnants` dans l'ordre des lots, par exemple `["Camille B.", "Hugo"]`.

---

## 5. Ce qu'il reste à compléter

- [ ] Les liens **Instagram**, **Facebook** et l'**adresse e-mail**.
- [ ] La **salle** exacte : `collecte.salle`, par exemple `"Hall du bâtiment A"`.
- [ ] Le **responsable de la publication** : `mentionsLegales.responsable` (obligatoire dans les mentions légales).
- [ ] Les **lots confirmés**, au fil des réponses des commerces.
- [ ] Facultatif : les **rôles** de chacun dans `equipe`, le **logo de l'IUT** (`logoIUT`), la relecture de la présentation d'A.V.A. par l'association.

---

## 6. Tester sans attendre le 11 novembre

À ajouter à la fin de l'adresse du site :

- `?etat=direct` : le site tel qu'il sera pendant la journée
- `?etat=apres` : le site après la collecte
- `?maintenant=2026-11-11T10:30` : simule une date et une heure

Personne d'autre ne voit ces tests.

---

## 7. À régler avant le jour J

1. **L'autorisation de l'IUT** : la salle ou le hall, une table, l'affichage dans les couloirs, et le droit de stocker les sacs jusqu'à la remise à l'association.
2. **La balance** : un pèse-personne suffit (on monte avec le sac, puis sans).
3. **Le stockage et le transport** des sacs jusqu'à A.V.A.
4. **La tombola** : une tombola ouverte au public demande en général une autorisation de la mairie, et les lots doivent être des objets ou des bons. À voir avec A.V.A., qui a l'habitude. Le règlement du site est un projet à valider.

---

## 8. En cas de pépin

| Ce que tu vois | La solution |
|---|---|
| Bandeau rouge « config.js contient une erreur » | Virgule ou guillemet manquant. Sur ordinateur, F12 puis l'onglet Console donne le numéro de ligne. |
| Le carton ne se remplit pas | `kg` doit être un nombre sans guillemets : `182.5`, pas `"182,5 kg"`. |
| Un bouton reste grisé | Le lien correspondant est encore vide dans `liens`. C'est normal, et volontaire. |
| Le logo d'A.V.A. n'apparaît pas | Le fichier doit s'appeler exactement comme dans `association.logo` (`img/logo-ava.png`). |
| Ta modification n'apparaît pas | Recharge la page : GitHub met une à deux minutes à publier. |
