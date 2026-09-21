# Mode d'emploi : site GEAnérosité (course solidaire)

**La règle d'or : tu ne modifies qu'un seul fichier, `js/config.js`.** Compteurs, coureurs, liens, projets financés, lots, collecte, équipe : tout est dedans, en français et commenté.

Le site est en ligne : **https://likooo2.github.io/GEAn-rosit-/**
Pour le modifier : ouvre le lien ci-dessous, clique sur le crayon ✏️, change ce que tu veux, puis **Commit changes**. C'est publié une à deux minutes plus tard, et ça marche aussi depuis un téléphone :
👉 https://github.com/Likooo2/GEAn-rosit-/edit/main/js/config.js

> Bandeau rouge après une modification ? C'est presque toujours une **virgule** ou un **guillemet** oublié à l'endroit que tu viens de modifier.

Ce qui est déjà renseigné : la date (mercredi 11 novembre 2026, à partir de 14h), le lieu (piste d'athlétisme de l'UPJV), l'objectif de 1 000 €, les 4 prénoms de l'équipe, la collecte alimentaire et vestimentaire, et les 12 exemples de lots.

---

## 1. Les tableaux se mettent-ils à jour automatiquement ?

**Oui, si tu passes par une feuille de calcul.** Deux façons de faire, au choix :

### A. Automatique (recommandé) : un Google Sheet publié

1. Crée un Google Sheet avec une ligne par coureur et ces colonnes (l'ordre n'a pas d'importance, les majuscules et les accents non plus) :

   | prenom | dossard | objectif | km | verifie | strava | promesse |
   |---|---|---|---|---|---|---|
   | Julien | 1 | 15 | 15.2 | oui | https://… | 3.5 |

   - `km` : kilomètres réalisés · `verifie` : `oui` quand c'est vérifié sur Strava
   - `promesse` : total des engagements reçus pour ce coureur, en € par km
2. Dans Google Sheets : **Fichier → Partager → Publier sur le web**, choisis la feuille et le format **.csv**, puis copie l'adresse.
3. Colle-la dans `config.js`, ligne `liens.feuilleCoureurs`.

À partir de là, **il n'y a plus rien à recopier** : tu modifies la feuille, et le site affiche les nouveaux coureurs et les nouveaux kilomètres au chargement suivant. Astuce : si ton formulaire d'inscription est un Google Form, ses réponses arrivent déjà dans un Sheet — ajoute simplement les colonnes `km` et `verifie` à côté.

Si la feuille est indisponible ou mal formée, le site utilise la liste de `config.js` : il n'y a jamais d'écran vide.

### B. Manuelle : la liste dans `config.js`

```js
coureurs: [
  { prenom: "Julien", dossard: 1, objectifKm: 15, km: 0, kmVerifies: false, strava: "", promesseParKm: 0 },
],
```

Le `dossard` doit être unique : il sert aussi de **lien de partage**. Julien peut envoyer `…/GEAn-rosit-/?coureur=1`, la page s'ouvre directement sur son engagement.

### Ce qui reste manuel dans tous les cas

- Le **montant de la cagnotte** (`compteurs.cagnotte`), sauf si tu ajoutes le widget HelloAsso (`liens.widgetCagnotte`) qui affiche le montant réel en direct, en plus de la jauge.
- Les **denrées et vêtements collectés**, et les **participants à la tombola**.

---

## 2. Ce que le site ne peut pas faire

Ce site est **statique** : il affiche, il calcule, mais il ne reçoit rien.

| Ce qu'il faut faire | Comment ça marche ici |
|---|---|
| Inscrire les coureurs | Un formulaire externe (Google Forms ou HelloAsso) : lien `liens.inscriptionCoureur`. |
| Recueillir les engagements | Le site **simule et récapitule** (montant par km, plafond, total), puis renvoie vers le formulaire officiel : `liens.engagement`. Le visiteur peut aussi imprimer son **document d'engagement** signé. |
| Encaisser | HelloAsso uniquement : `liens.cagnotte` et `liens.tombola`. |

Les engagements simulés restent **sur l'appareil du visiteur** : le site ne les reçoit pas. C'est le formulaire ou le document signé qui fait foi.

### Ce qu'il faut demander dans les formulaires

- **Inscription coureur** : prénom affiché, nom, e-mail, téléphone, objectif en km, lien Strava, accord parental si mineur.
- **Engagement** : nom, prénom, e-mail, téléphone, coureur soutenu (prénom + dossard), montant par kilomètre, plafond éventuel, case « je m'engage sur l'honneur », signature.

---

## 3. Ce qu'il reste à compléter

- [ ] **Les liens** : `inscriptionCoureur`, `engagement`, `cagnotte`, `tombola`, `live`, `strava`, `instagram`, `email`. Tant qu'un lien est vide, le bouton reste grisé avec « bientôt disponible » : aucun faux lien sur le site.
- [ ] **Les projets financés** (`projetsFinances`) : à valider avec A.V.A. avant de les annoncer.
- [ ] **La tombola** : prix du billet et date du tirage. Pour chaque lot obtenu, passe `statut` de `"recherche"` à `"confirme"` et ajoute le partenaire.
- [ ] **La collecte** : lieux et dates de dépôt dans `collecte.points`.
- [ ] **L'association** : présentation, sigle complet, logo (avec son accord).
- [ ] **Les photos de l'équipe** et, si vous voulez, les rôles (la ligne est masquée quand le rôle est vide).
- [ ] **L'encaissement** (`transparence.encaissement`) et le **responsable de publication** (`mentionsLegales.responsable`, obligatoire).
- [ ] Facultatif : `course.depart` (retrait des dossards) et `course.info` (par exemple « piste de 400 m : 2 tours et demi = 1 km »).

Le mode brouillon est désactivé (`modeBrouillon: false`). Passe-le à `true` pendant que tu travailles : tout ce qui manque est alors entouré de pointillés bleus.

---

## 4. Pendant et après la course

1. Pendant la course, mets les `km` à jour de temps en temps (feuille de calcul ou `config.js`) : classement, compteurs et montants suivent automatiquement.
2. Après la course, relève la distance de chaque activité Strava, corrige les `km`, puis passe `verifie` / `kmVerifies` à `oui` / `true`.
3. Les montants passent alors de « en attente » à « à verser ». Contacte les personnes engagées avec les coordonnées de ton formulaire, et envoie-leur le lien de la cagnotte.
4. Mets à jour `compteurs.cagnotte`, `denreesKg`, `vetements`, `participantsTombola` et `miseAJour`.

### Tester l'affichage sans attendre

- `?etat=direct` : le site comme pendant la course · `?etat=apres` : comme après
- `?maintenant=2026-11-11T15:30` : simule une date et une heure
- `?coureur=1` : ouvre directement l'engagement pour le dossard 1

---

## 5. Quatre points à faire valider

Nous ne sommes pas juristes : fais confirmer ces points par A.V.A. et, si besoin, par l'UPJV et la mairie.

1. **La sécurité et l'accès à la piste.** Autorisation d'utiliser la piste de l'UPJV, assurance, encadrement des mineurs, présence de secours, point d'eau. C'est le point le plus important.
2. **La promesse de don.** Un engagement au kilomètre repose sur la confiance : personne ne peut être contraint de payer. Le site le dit clairement, et le plafond aide à rester raisonnable.
3. **La tombola.** Une tombola ouverte au public demande en général une **autorisation de la mairie**. Les lots doivent être des objets ou des bons, jamais de l'argent.
4. **Le règlement.** Celui du site est présenté comme un **projet à valider**. Fais-le relire, puis retire la mention « à valider » dans `index.html`.

Pense aussi à l'accord des personnes photographiées et à l'accord d'A.V.A. pour son logo.

---

## 6. En cas de pépin

| Ce que tu vois | La solution |
|---|---|
| Bandeau rouge « config.js contient une erreur » | Une virgule ou un guillemet manque à l'endroit modifié. Sur ordinateur, la touche **F12** (onglet *Console*) donne le numéro de la ligne. |
| Un bouton reste grisé | Le lien correspondant est vide ou mal copié dans `liens` (il doit commencer par `https://`). |
| La feuille de calcul n'est pas prise en compte | Vérifie qu'elle est **publiée au format .csv** et qu'une colonne s'appelle bien `prenom`. La console (F12) affiche les colonnes trouvées. |
| Un coureur n'apparaît pas | Son `prenom` est vide, ou son `dossard` est déjà utilisé par un autre. |
| Le lecteur du live ne s'affiche pas | Il ne fonctionne que sur le site en ligne, et seulement pour un lien Twitch. Sinon le bouton ouvre le live dans un nouvel onglet. |
| Ta modification n'apparaît pas | Recharge la page. GitHub met une à deux minutes à publier. |
