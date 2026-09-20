# Mode d'emploi : site GEAnérosité (course solidaire)

**La règle d'or : tu ne modifies qu'un seul fichier, `js/config.js`.** Compteurs, coureurs, kilomètres, liens, lots, collecte, équipe : tout est dedans, en français et commenté.

Le site est en ligne : **https://likooo2.github.io/GEAn-rosit-/**
Pour le modifier, ouvre ce lien, clique sur le crayon ✏️, change ce que tu veux, puis **Commit changes**. C'est publié une à deux minutes plus tard, et ça marche aussi depuis un téléphone :
👉 https://github.com/Likooo2/GEAn-rosit-/edit/main/js/config.js

> Bandeau rouge après une modification ? C'est presque toujours une **virgule** ou un **guillemet** oublié à l'endroit que tu viens de modifier.

---

## 1. Ce que le site fait tout seul

- Il calcule les montants des engagements : montant par km × kilomètres du coureur, en respectant le plafond éventuel.
- Il affiche un statut **« en attente »** tant que tu n'as pas coché `kmVerifies: true`, puis **« à verser »**.
- Il classe les coureurs par kilomètres, additionne le total et met à jour les compteurs.
- Il prévient les personnes qui s'engagent quand le montant devient important, et propose un plafond.
- Il garde le récapitulatif de chaque visiteur **sur son propre appareil** : aucune donnée ne part vers nous.

## 2. Ce qu'il ne peut pas faire (et comment on contourne)

Un site GitHub Pages est un site « statique » : il ne peut ni recevoir d'inscriptions, ni lire automatiquement le solde HelloAsso.

| Besoin | Solution mise en place |
|---|---|
| Inscrire les coureurs | Un formulaire externe (HelloAsso, Google Forms…) → `liens.inscriptionCoureur`. Tu recopies ensuite les coureurs dans `config.js`. |
| Recevoir les engagements signés | Le visiteur remplit son document sur le site, l'imprime ou l'enregistre en PDF, puis l'envoie. Le bouton « Valider mes engagements » pointe vers `liens.engagement`. |
| Cagnotte en direct | Deux possibilités : mettre `compteurs.cagnotte` à jour à la main (jauge et paliers), et/ou coller l'adresse du **widget HelloAsso** dans `liens.widgetCagnotte` : il affiche le montant réel, mis à jour automatiquement. |
| Vérifier les kilomètres | Tu relèves la distance sur Strava, tu l'écris dans `km`, puis tu passes `kmVerifies` à `true`. |

---

## 3. Avant le lancement

- [ ] **Les liens** : `inscriptionCoureur`, `engagement`, `cagnotte`, `tombola`, `live`, `strava`, `instagram`, `email`. Tant qu'un lien est vide, le bouton reste grisé avec « bientôt disponible » : jamais de faux lien.
- [ ] **La date** : `dates.debutCourse`, par exemple `"2026-11-21T10:00"`. Passe `dateConfirmee` à `true` quand elle est définitive.
- [ ] **La course** : lieu, format, heure de départ.
- [ ] **Les paliers** de la cagnotte : les textes sont des exemples, à valider avec A.V.A.
- [ ] **La tombola** : prix du billet, date du tirage, statut des lots.
- [ ] **La collecte** : lieux et dates de dépôt dans `collecte.points`.
- [ ] **L'association** : présentation, sigle, logo (avec son accord).
- [ ] **L'équipe**, **la transparence** (`encaissement`) et **les mentions légales** (responsable de la publication).
- [ ] Passer `modeBrouillon` à `false`.

---

## 4. Ajouter un coureur

Dans `config.js`, partie **LES COUREURS** :

```js
coureurs: [
  { prenom: "Julien", dossard: 1, objectifKm: 15, km: 0, kmVerifies: false, strava: "", promesseParKm: 0 },
  { prenom: "Sarah",  dossard: 2, objectifKm: 10, km: 0, kmVerifies: false, strava: "", promesseParKm: 0 },
],
```

- `dossard` doit être **unique** : il sert au lien de partage. Le coureur n° 2 peut partager `…/GEAn-rosit-/?coureur=2`, qui ouvre directement la fenêtre d'engagement pour lui. C'est le meilleur moyen de faire monter les promesses.
- `promesseParKm` est le total des engagements reçus pour ce coureur, en € par km : tu le remplis au fur et à mesure des formulaires reçus, c'est très motivant à afficher.
- Le compteur « coureurs inscrits » et le total des kilomètres se calculent automatiquement dès qu'il y a au moins un coureur dans la liste.

## 5. Pendant et après la course

```js
{ prenom: "Julien", dossard: 1, objectifKm: 15, km: 15.2, kmVerifies: true, strava: "https://www.strava.com/activities/…", promesseParKm: 3.5 },
```

1. Pendant la course, mets `km` à jour de temps en temps : le classement et les montants bougent en direct.
2. À l'arrivée, relève la distance Strava de chaque coureur, écris-la dans `km`, colle le lien de l'activité dans `strava`.
3. Passe `kmVerifies` à `true` : les montants passent de « en attente » à « à verser » pour toutes les personnes engagées.
4. Recontacte les personnes engagées (via le formulaire ou les documents reçus) avec leur montant exact.
5. Mets à jour `compteurs.cagnotte` au fur et à mesure des versements.

### Tester sans attendre

- `?etat=direct` : le site comme pendant la course
- `?etat=apres` : le site comme après la course
- `?maintenant=2026-11-21T10:30` : simule une date et une heure
- `?coureur=2` : ouvre l'engagement pour le dossard 2

---

## 6. Trois points à faire valider par A.V.A.

Nous ne sommes pas juristes : faites confirmer ces points par l'association.

1. **La sécurité de la course.** Selon le lieu et le nombre de participants, une déclaration en mairie ou en préfecture, une assurance et un encadrement peuvent être nécessaires. Le règlement du site rappelle déjà que chacun court sous sa responsabilité et que les mineurs doivent être accompagnés.
2. **La tombola.** Une tombola ouverte au public demande en général une **autorisation de la mairie**. Les lots doivent être des objets ou des bons, jamais de l'argent.
3. **Les engagements.** Ce sont des promesses de don : elles ne sont pas juridiquement contraignantes, et c'est très bien ainsi. Ne promettez jamais qu'un versement sera « obligatoire », et gardez la trace des documents signés.

Pensez aussi à l'accord des personnes photographiées, et à l'accord d'A.V.A. pour son logo.

---

## 7. En cas de pépin

| Ce que tu vois | La solution |
|---|---|
| Bandeau rouge « config.js contient une erreur » | Une virgule ou un guillemet manque à l'endroit modifié. Sur ordinateur, la touche **F12** (onglet *Console*) donne le numéro de la ligne. |
| Un bouton reste grisé | Le lien correspondant est vide ou mal copié dans `liens` (il doit commencer par `https://`). |
| Un coureur n'apparaît pas | Vérifie qu'il a bien une virgule à la fin de sa ligne et un `dossard` unique. |
| Le lecteur du live ne s'affiche pas | Il ne fonctionne que sur le site en ligne, et seulement pour un lien Twitch. Sinon, le bouton ouvre le live dans un nouvel onglet. |
| Ta modification n'apparaît pas | Recharge la page : GitHub met une à deux minutes à publier. |

---

## 8. Remettre le site en ligne ailleurs

Le dossier complet fonctionne sur n'importe quel hébergeur de fichiers statiques. Sur **Netlify** : crée un compte, puis dans **Projects**, ouvre **Add new project**, choisis **Deploy manually** et dépose le dossier entier. Pense alors à remplacer les 2 adresses de partage en haut de `index.html`, ainsi que l'hébergeur dans `config.js`.
