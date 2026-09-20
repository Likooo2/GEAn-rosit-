# Mode d'emploi : site GEAnérosité

**La règle d'or : tu ne modifies qu'un seul fichier, `js/config.js`.** Compteurs, liens HelloAsso, tournoi, lots, collecte, équipe : tout est dedans, en français et commenté.

Le site est déjà en ligne : **https://likooo2.github.io/GEAn-rosit-/**
Pour le modifier, ouvre le lien ci-dessous, clique sur le crayon ✏️, change ce que tu veux, puis **Commit changes**. C'est publié une à deux minutes plus tard, et ça marche aussi depuis un téléphone :
👉 https://github.com/Likooo2/GEAn-rosit-/edit/main/js/config.js

> Si le site affiche un bandeau rouge après une modification : c'est presque toujours une **virgule** ou un **guillemet** oublié à l'endroit que tu viens de modifier. Compare avec les lignes voisines.

---

## 1. La règle du projet : ne rien inventer

Tout ce qui n'est pas confirmé reste **vide** (`""`) dans `config.js`. Le site affiche alors tout seul « à confirmer », ou grise le bouton avec « lien bientôt disponible ». Personne n'est induit en erreur, et vous remplissez au fur et à mesure.

Le site est livré en **mode brouillon** : ce qui reste à compléter est entouré de pointillés bleus, et chaque bouton sans lien indique la ligne exacte à remplir. Quand tout est prêt, passe `modeBrouillon: true` à **`false`**.

---

## 2. Avant le lancement

- [ ] **Les 4 liens HelloAsso** : `cagnotte`, `inscriptionTournoi`, `pronostic`, `tombola`. Copie l'adresse complète du formulaire (elle commence par `https://www.helloasso.com/…`). Tant qu'un lien est vide, le bouton reste grisé.
- [ ] **Le lien du live** (Twitch ou YouTube), l'**Instagram** et l'**e-mail** de contact.
- [ ] **La date du tournoi** : `dates.debutTournoi`, par exemple `"2026-11-20T18:00"`. Tant qu'elle est vide, le site affiche « date à confirmer ». Quand elle est définitive, passe `dateConfirmee` à `true` (sinon le site précise « date provisoire »).
- [ ] **Le tournoi** : lieu, format, noms des joueurs et équipes choisies.
- [ ] **Le pronostic** : montant de la participation et nature de la surprise.
- [ ] **La tombola** : prix du billet et date du tirage. Pour chaque lot obtenu, passe `statut` de `"recherche"` à `"confirme"` et écris le nom du partenaire.
- [ ] **La collecte** : lieux et dates de dépôt dans `collecte.points`.
- [ ] **L'association** : présentation, signification du sigle et logo (avec l'accord d'A.V.A.).
- [ ] **L'équipe** : prénoms, rôles, photos.
- [ ] **La transparence** : `transparence.encaissement`, pour dire qui encaisse l'argent (par exemple : les paiements arrivent directement sur le compte HelloAsso d'A.V.A.).
- [ ] **Les mentions légales** : prénom et nom de la personne responsable de la publication.
- [ ] Passer `modeBrouillon` à `false`.

---

## 3. Pendant le projet : les compteurs

Partie **LES COMPTEURS** de `config.js` :

```js
compteurs: {
  cagnotte: 0,              // ← le total récolté en €
  objectif: 1000,
  denreesKg: 0,             // ← kg de denrées collectées
  vetements: 0,             // ← nombre de vêtements
  participantsTournoi: 0,
  participantsTombola: 0,
  miseAJour: "",            // ← ex : "lundi 16 novembre à 18h"
},
```

Écris les nombres **sans espace ni €** : `1250`, pas `"1 250 €"`. Les objectifs du live se débloquent tout seuls et le ballon avance sur le terrain.

---

## 4. Le tournoi, pendant le live

Dans `tournoi.matchs`, remplis le champ `score` au fur et à mesure :

```js
{ phase: "Groupe A", a: 1, b: 2, score: "3-1", heure: "18h15" },
```

- `a` et `b` sont les **numéros des joueurs** (leur position dans `participants`).
- Le classement des groupes, le prochain match et le champion se calculent tout seuls.
- Pour la phase finale, remplace les textes (`"1er du groupe A"`) par les numéros des joueurs qualifiés, par exemple `a: 3`.
- En cas d'égalité en phase finale, ajoute les tirs au but : `tab: "4-3"`.

Quand la finale a un score, le champion s'affiche en haut de la page et dans la partie tournoi.

---

## 5. Après le tournoi

```js
pronostic: { bonsPronostics: "Camille B." },     // prénom + initiale
tombola:   { gagnants: ["0427", "0112"] },       // dans l'ordre des lots
```

### Tester l'affichage sans attendre

Ajoute ceci à la fin de l'adresse du site :

- `?etat=direct` : le site comme pendant le live
- `?etat=apres` : le site comme après le tournoi
- `?maintenant=2026-11-20T19:30` : simule une date et une heure

Ces tests ne changent rien pour les autres visiteurs.

---

## 6. Trois points à faire valider avant d'ouvrir les participations

Nous ne sommes pas juristes : faites confirmer ces points par A.V.A., qui a l'habitude.

1. **Le pronostic payant.** En France, un jeu avec participation payante et lot à gagner est encadré. La solution la plus simple est souvent un pronostic **gratuit**, avec un don libre à côté. Les textes du site sont déjà prudents (« ce n'est pas un pari d'argent »), mais la forme juridique doit être validée.
2. **La tombola.** Une tombola organisée par une association et ouverte au public demande en général une **autorisation de la mairie**. Les lots doivent être des objets ou des bons, jamais de l'argent.
3. **Le règlement.** Celui du site est présenté comme un **projet à valider**. Faites-le relire, puis retirez la mention « à valider » dans `index.html` quand c'est fait.

Pensez aussi à l'accord des personnes photographiées, et à l'accord d'A.V.A. pour son logo et sa présentation.

---

## 7. En cas de pépin

| Ce que tu vois | La solution |
|---|---|
| Bandeau rouge « config.js contient une erreur » | Une virgule ou un guillemet manque à l'endroit modifié. Sur ordinateur, la touche **F12** (onglet *Console*) donne le numéro de la ligne. |
| Un bouton reste grisé | Le lien correspondant est vide ou mal copié dans `liens` (il doit commencer par `https://`). |
| Le lecteur du live ne s'affiche pas | Il ne fonctionne que sur le site en ligne, et seulement pour un lien Twitch. Sinon, le bouton ouvre le live dans un nouvel onglet. |
| Une photo ne s'affiche pas | Vérifie le chemin (`img/equipe/prenom.jpg`) et le nom exact du fichier, sans espace ni accent. |
| Ta modification n'apparaît pas | Recharge la page. GitHub met une à deux minutes à publier, et le navigateur garde parfois l'ancienne version. |

---

## 8. Remettre le site en ligne ailleurs (si besoin)

Le dossier complet fonctionne sur n'importe quel hébergeur de fichiers statiques. Sur **Netlify** : crée un compte, puis dans **Projects**, ouvre **Add new project**, choisis **Deploy manually** et dépose le dossier entier. Pense alors à remplacer les 2 adresses de partage en haut de `index.html`, ainsi que l'hébergeur dans `config.js`.
