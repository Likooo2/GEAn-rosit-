# Mode d'emploi : site VÉLO CHAOS

**La règle d'or : tu ne modifies qu'un seul fichier, `js/config.js`.** Montant de la cagnotte, paris, résultats, liens, lots, équipe… tout est dedans, en français et commenté. Tu n'as pas besoin de toucher au reste.

Pour l'ouvrir et le modifier : un éditeur de texte simple (Bloc-notes, TextEdit en mode « texte brut », ou mieux, [VS Code](https://code.visualstudio.com), gratuit). Une fois le site en ligne, tu peux même le modifier directement sur GitHub (voir plus bas).

> Si le site devient vide ou affiche un bandeau rouge après une modification : c'est presque toujours une **virgule** ou un **guillemet** oublié à l'endroit que tu viens de modifier. Compare avec les lignes voisines.

---

## 1. Avant le lancement : remplacer les exemples

Le site est livré en **mode brouillon** : tout ce qui est inventé est entouré de **pointillés bleus** quand tu ouvres `index.html`, et marqué `⚠️ EXEMPLE` dans `config.js`.

À remplacer par vos vraies infos :

- [ ] **L'association** : nom, logo, présentation, 3 chiffres clés (à demander à l'asso)
- [ ] **Les liens** : les 3 formulaires HelloAsso (dons, paris, tombola), la chaîne Twitch, Instagram, l'e-mail
- [ ] **L'objectif** de la cagnotte
- [ ] **Le défi** : prénom du cycliste, textes des 8 paliers, cartes sabotage/boost et leurs prix (à caler sur votre liste définitive)
- [ ] **Le pari** : le lot et le **n° d'autorisation de la mairie**
- [ ] **La tombola** : prix du billet, lots, commerçants partenaires, points de vente des billets papier
- [ ] **Le retrait des lots** (texte affiché dans la FAQ)
- [ ] **Les dons** : les équivalences « 5 € = … » (à valider avec l'asso) et la déduction fiscale : `deductible: true` seulement si l'asso délivre des reçus fiscaux ; taux de 66 %, ou 75 % pour certaines aides aux personnes en difficulté (à confirmer avec elle)
- [ ] **La collecte** : lieux, dates, liste de ce que vous prenez
- [ ] **L'équipe** : prénoms, rôles, phrases, photos (voir `img/LISEZ-MOI-PHOTOS.txt`)
- [ ] **Les mentions légales** : nom de la personne responsable de la publication

Quand tout est rempli, passe `modeBrouillon: true` à **`modeBrouillon: false`**. Les pointillés et le bandeau disparaissent.

---

## 2. Pendant la campagne : mettre à jour la jauge et les paris

### La jauge (la cagnotte)

Dans `config.js`, partie **LA CAGNOTTE** :

```js
cagnotte: {
  montant: 340,                               // ← le nouveau total en €
  objectif: 1000,
  miseAJour: "vendredi 6 novembre à 18h30",   // ← la date de ta mise à jour
},
```

Le total, c'est ce que vous décidez de compter (conseil : l'addition de tous les formulaires HelloAsso + les espèces). Écris le nombre **sans espace ni €** : `1250`, pas `"1 250 €"`. Les paliers se débloquent tout seuls.

### Le graphique des paris

HelloAsso ne donne pas le détail par tranche : il faut compter. Exporte la liste des participants du formulaire de paris (fichier Excel), puis compte les pronostics de chaque tranche. Avec les pronostics en colonne C, par exemple :

```
=NB.SI.ENS(C:C;">=40";C:C;"<=49")
```

Puis reporte les chiffres dans `config.js` :

```js
tranches: [
  { de: 0,  a: 39,   parieurs: 6  },
  { de: 40, a: 49,   parieurs: 14 },   // ← change juste ces nombres
  …
],
```

Le total de parieurs se calcule tout seul. Tu peux aussi changer les tranches (`de` et `a`), en ajouter ou en retirer.

---

## 3. Après le live : les résultats

Partie **LES RÉSULTATS** :

```js
resultat: {
  km: 63,                            // la distance officielle
  gagnant: "Camille B.",             // prénom + initiale, jamais le nom complet
  tombola: ["0427", "0112", "0035"], // numéros gagnants, dans l'ordre des lots
},
```

Le site affiche alors « Merci ! » avec la distance sur l'écran du compteur, le gagnant, la tranche gagnante en vert dans le graphique, et les numéros sous chaque lot.

Le reste change **tout seul** selon la date et l'heure : compte à rebours avant le live, « EN DIRECT » pendant, « Merci ! » après, et les paris affichés « clos » à partir de l'heure de clôture.

### Tester l'affichage sans attendre le 13 novembre

Ajoute ceci à la fin de l'adresse du site :

- `?etat=direct` : le site comme pendant le live
- `?etat=apres` : le site comme après le live
- `?maintenant=2026-11-13T20:30` : simule n'importe quelle date et heure

Personne d'autre ne voit ces tests : ils ne changent rien au site.

---

## 4. Mettre le site en ligne (gratuit)

Choisis **une** des deux options. GitHub Pages est la plus pratique pour les mises à jour ; Netlify est la plus rapide pour démarrer.

### Option A : GitHub Pages (recommandé)

1. Crée un compte gratuit sur [github.com](https://github.com).
2. En haut à droite, clique sur **+** puis **New repository**. Nom : `velo-chaos`. Laisse **Public** coché. Clique sur **Create repository**.
3. Sur la page qui s'affiche, clique sur le lien **uploading an existing file**.
4. Ouvre le dossier du site sur ton ordinateur, sélectionne **tout son contenu** (`index.html` et les dossiers `css`, `js`, `fonts`, `img`) et glisse-le dans la page. Clique sur **Commit changes**.
5. Va dans **Settings** puis **Pages** (menu de gauche). Dans **Branch**, choisis `main` et `/ (root)`, puis **Save**.
6. Attends une ou deux minutes et recharge la page : l'adresse de ton site s'affiche, du type `https://ton-pseudo.github.io/velo-chaos/`.
7. **Une seule fois** : ouvre `index.html` (sur GitHub, clique sur le fichier puis sur le crayon ✏️) et remplace les **2 adresses** `https://ton-pseudo.github.io/velo-chaos/` en haut du fichier par la vraie adresse. C'est ce qui affiche la belle image d'aperçu quand vous partagez le lien sur WhatsApp ou Instagram.

**Mettre à jour ensuite** (jauge, paris, résultats) : sur GitHub, ouvre `js/config.js`, clique sur le crayon ✏️, modifie, puis **Commit changes**. En ligne en une à deux minutes.

### Option B : Netlify

1. Crée un compte gratuit sur [app.netlify.com](https://app.netlify.com).
2. Dans **Projects**, ouvre le menu **Add new project** et choisis **Deploy manually** (ou va directement sur [app.netlify.com/drop](https://app.netlify.com/drop)).
3. Glisse **le dossier du site entier** dans la zone prévue. En quelques secondes, le site est en ligne à une adresse en `.netlify.app`.
4. Clique sur **Customize** sous l'adresse provisoire pour choisir une jolie adresse, par exemple `velo-chaos-amiens.netlify.app`.
5. Remplace les 2 adresses de partage dans `index.html` (comme l'étape 7 ci-dessus), et dans `config.js`, partie **MENTIONS LÉGALES**, remplace l'hébergeur par Netlify.

**Mettre à jour ensuite** : modifie `config.js` sur ton ordinateur, puis glisse à nouveau **tout le dossier** dans la zone de dépôt en bas de la page **Deploys** de ton projet.

### Bon à savoir

- **Le lecteur Twitch** ne s'affiche que sur le site en ligne, pas quand tu ouvres le fichier sur ton ordinateur : c'est une règle de Twitch, pas un bug.
- **Tu ne vois pas ta modification ?** Recharge la page (sur téléphone, ferme et rouvre l'onglet). Le navigateur garde parfois l'ancienne version quelques minutes.
- **Afficher le formulaire de don HelloAsso directement dans la page** (facultatif) : dans HelloAsso, cherche l'option pour intégrer le formulaire à un site, copie l'adresse qui suit `src="` dans le code proposé, et colle-la dans `liens.donsWidget`.
- **Aucun paiement ne passe par le site** : tous les boutons mènent aux formulaires HelloAsso de l'association.

---

## 5. En cas de pépin

| Ce que tu vois | La solution |
|---|---|
| Bandeau rouge « config.js contient une erreur » | Une virgule ou un guillemet manque à l'endroit modifié. Sur ordinateur, la touche **F12** (onglet *Console*) donne le numéro de la ligne. |
| Une photo ne s'affiche pas | Vérifie le chemin (`img/equipe/hugo.jpg`) et le nom exact du fichier, sans espace ni accent. En attendant, le site affiche l'emoji à la place. |
| Un bouton ne mène nulle part | Le lien correspondant est vide ou mal copié dans `liens` (il doit commencer par `https://`). |
| L'aperçu du lien sur WhatsApp est vide | Les 2 adresses de partage dans `index.html` n'ont pas été remplacées. |
