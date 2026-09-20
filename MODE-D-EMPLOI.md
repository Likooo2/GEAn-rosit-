# Mode d'emploi : site GEAnérosité (course solidaire)

**La règle d'or : tu ne modifies qu'un seul fichier, `js/config.js`.** Compteurs, coureurs, liens, paliers, lots, collecte, équipe : tout est dedans, en français et commenté.

Le site est en ligne : **https://likooo2.github.io/GEAn-rosit-/**
Pour le modifier : ouvre le lien ci-dessous, clique sur le crayon ✏️, change ce que tu veux, puis **Commit changes**. C'est publié une à deux minutes plus tard, et ça marche aussi depuis un téléphone :
👉 https://github.com/Likooo2/GEAn-rosit-/edit/main/js/config.js

> Bandeau rouge après une modification ? C'est presque toujours une **virgule** ou un **guillemet** oublié à l'endroit que tu viens de modifier.

---

## 1. Ce que le site fait, et ce qu'il ne peut pas faire

Ce site est un site **statique** : il affiche des informations, mais il ne peut ni recevoir d'inscriptions, ni encaisser d'argent, ni lire automatiquement HelloAsso. Le fonctionnement retenu :

| Ce qu'il faut faire | Comment ça marche ici |
|---|---|
| Inscrire les coureurs | Un formulaire externe (HelloAsso ou Google Forms) : lien `liens.inscriptionCoureur`. Vous recopiez ensuite les coureurs dans `config.js`. |
| Recueillir les engagements | Le site **simule et récapitule** l'engagement (montant par km, plafond, total), puis renvoie vers le formulaire officiel : lien `liens.engagement`. Le visiteur peut aussi imprimer son **document d'engagement** signé. |
| Suivre les kilomètres | Vous saisissez les km de chaque coureur dans `config.js` ; le site recalcule tous les montants en attente. |
| Afficher la cagnotte en direct | Deux options : le montant que vous saisissez (`compteurs.cagnotte`), et/ou le **widget HelloAsso** (`liens.widgetCagnotte`) qui affiche le montant réel automatiquement. |

Les engagements simulés par un visiteur restent **sur son appareil** (mémoire du navigateur). Le site ne les reçoit pas : c'est le formulaire ou le document qui fait foi.

### Ce qu'il faut demander dans vos formulaires

- **Inscription coureur** : prénom (affiché publiquement), nom, e-mail, téléphone, objectif en km, lien du profil Strava, accord parental si mineur.
- **Engagement** : nom, prénom, e-mail, téléphone, coureur soutenu (prénom + dossard), montant par kilomètre, plafond éventuel, case « je m'engage sur l'honneur », signature.

---

## 2. Avant le lancement

- [ ] **Les liens** : `inscriptionCoureur`, `engagement`, `cagnotte`, `tombola`, `live`, `strava`, `instagram`, `email`. Tant qu'un lien est vide, le bouton reste grisé avec « bientôt disponible » : aucun faux lien sur le site.
- [ ] **La date** : `dates.debutCourse`, par exemple `"2026-11-21T10:00"`, puis `dateConfirmee: true` quand elle est définitive.
- [ ] **La course** : lieu, format, heure de départ (`course.lieu`, `course.format`, `course.depart`).
- [ ] **Les paliers** : les 4 exemples d'utilisation de l'argent sont à valider avec A.V.A. avant de les annoncer.
- [ ] **La tombola** : prix du billet, date du tirage, lots (passer `statut` de `"recherche"` à `"confirme"` quand un lot est obtenu).
- [ ] **La collecte** : lieux et dates de dépôt dans `collecte.points`.
- [ ] **L'association** : présentation, sigle, logo (avec son accord).
- [ ] **L'équipe**, **l'encaissement** (`transparence.encaissement`) et le **responsable de publication**.
- [ ] Passer `modeBrouillon` à `false`.

---

## 3. Ajouter les coureurs

Dans `config.js`, partie **LES COUREURS** :

```js
coureurs: [
  { prenom: "Julien", dossard: 1, objectifKm: 15, km: 0, kmVerifies: false, strava: "", promesseParKm: 0 },
  { prenom: "Sarah",  dossard: 2, objectifKm: 10, km: 0, kmVerifies: false, strava: "", promesseParKm: 0 },
],
```

- `dossard` doit être unique : il sert aussi de **lien de partage**. Julien peut envoyer `…/GEAn-rosit-/?coureur=1` : la page s'ouvre directement sur son engagement.
- `promesseParKm` : le total des engagements reçus pour ce coureur, en € par km. C'est très motivant à afficher, mais ça se met à jour à la main, d'après votre formulaire.
- Tant que la liste est vide, le site affiche une invitation à s'inscrire : c'est normal.

---

## 4. Pendant et après la course

```js
{ prenom: "Julien", dossard: 1, objectifKm: 15, km: 15.2, kmVerifies: true, … },
```

1. Pendant la course, mettez `km` à jour de temps en temps : le classement et tous les montants suivent automatiquement.
2. Après la course, relevez la distance de chaque activité Strava, corrigez `km`, puis passez `kmVerifies` à `true`.
3. Le statut affiché passe alors de « en attente » à « à verser », et chaque personne engagée voit son montant définitif.
4. Contactez les personnes engagées (avec les coordonnées de votre formulaire) et indiquez-leur le lien de la cagnotte.

Pensez aussi à mettre à jour `compteurs.cagnotte`, `compteurs.vetements`, `compteurs.participantsTombola` et `compteurs.miseAJour`.

### Tester l'affichage sans attendre

- `?etat=direct` : le site comme pendant la course
- `?etat=apres` : le site comme après la course
- `?maintenant=2026-11-21T10:30` : simule une date et une heure
- `?coureur=1` : ouvre directement l'engagement pour le dossard 1

---

## 5. Quatre points à faire valider

Nous ne sommes pas juristes : faites confirmer ces points par A.V.A. et, si besoin, par la mairie.

1. **La sécurité de la course.** Parcours, assurance, autorisation si vous utilisez la voie publique, encadrement des mineurs, présence de secours. C'est le point le plus important.
2. **La promesse de don.** Un engagement au kilomètre est une promesse : elle repose sur la confiance, et personne ne peut être contraint de payer. Le site le dit clairement, et le plafond aide à rester raisonnable.
3. **La tombola.** Une tombola ouverte au public demande en général une **autorisation de la mairie**. Les lots doivent être des objets ou des bons, jamais de l'argent.
4. **Le règlement.** Celui du site est présenté comme un **projet à valider**. Faites-le relire, puis retirez la mention « à valider » dans `index.html`.

---

## 6. En cas de pépin

| Ce que tu vois | La solution |
|---|---|
| Bandeau rouge « config.js contient une erreur » | Une virgule ou un guillemet manque à l'endroit modifié. Sur ordinateur, la touche **F12** (onglet *Console*) donne le numéro de la ligne. |
| Un bouton reste grisé | Le lien correspondant est vide ou mal copié dans `liens` (il doit commencer par `https://`). |
| Un coureur n'apparaît pas | Vérifie la virgule à la fin de sa ligne et que son `dossard` n'est pas déjà utilisé. |
| Le lecteur du live ne s'affiche pas | Il ne fonctionne que sur le site en ligne, et seulement pour un lien Twitch. Sinon, le bouton ouvre le live dans un nouvel onglet. |
| La cagnotte HelloAsso ne s'affiche pas | `liens.widgetCagnotte` doit être l'adresse fournie par HelloAsso dans « intégrer à mon site » (celle qui suit `src="`). |
| Ta modification n'apparaît pas | Recharge la page. GitHub met une à deux minutes à publier. |

---

## 7. Remettre le site en ligne ailleurs (si besoin)

Le dossier complet fonctionne sur n'importe quel hébergeur de fichiers statiques. Sur **Netlify** : crée un compte, puis dans **Projects**, ouvre **Add new project**, choisis **Deploy manually** et dépose le dossier entier. Pense alors à remplacer les 2 adresses de partage en haut de `index.html`, ainsi que l'hébergeur dans `config.js`.
