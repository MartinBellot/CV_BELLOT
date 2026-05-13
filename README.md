# CV — Martin Bellot

CV web ultra moderne avec export PDF natif.

## Lancer

Ouvre simplement `index.html` dans un navigateur, ou sers le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Export PDF

Clique sur le bouton **PDF** en haut à droite → la boîte d'impression s'ouvre.
Choisis **« Enregistrer au format PDF »** comme destination.

Une feuille de styles `@media print` dédiée garantit un rendu propre, optimisé A4, en mode clair.

## Personnalisation

- Contenu : `index.html`
- Styles : `styles.css` (dark mode + thème clair + print)
- Interactions : `script.js` (toggle thème, export PDF, animations)

## Stack

HTML / CSS / JS vanilla — aucune dépendance, aucune build step.
