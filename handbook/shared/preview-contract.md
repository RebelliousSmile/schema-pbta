# Contrat temporaire des aperçus Handbook

Ces pages rendent les exemples canoniques de `examples/<game>/`. Elles ne définissent ni un format de pack installable, ni un second modèle de données. Les fichiers `index.html` sont générés par `npm run handbook:render` et ne doivent pas être édités à la main.

Chaque `preview/preview.toml` contient uniquement l’identifiant du jeu, les slugs des documents canoniques sélectionnés, les variantes visuelles disponibles et la variante par défaut. L’ordre explicite des références garantit qu’un nouvel exemple sans rapport ne modifie pas la page.

## Surface sémantique

| Sélecteur | Sens |
| --- | --- |
| `[data-handbook-preview]` | Racine d’un aperçu. |
| `html[data-game][data-variant]` | Identité du jeu et variante purement visuelle. |
| `[data-region="game-identity"]` | Titre du jeu et choix de variante. |
| `[data-region="character-identity"]` | Identité et création du personnage. |
| `[data-region="playbook-moves"]` | Livret et moves sélectionnés. |
| `[data-region="character-state"]` | Stats et attributs du personnage. |
| `[data-region="mc-actions"]` | Actions réservées à la MC. |
| `.handbook-move[data-move][data-move-type][data-audience]` | Move canonique ou move embarqué du livret. |
| `.handbook-result[data-result]` | Résultat nommé d’un move. |
| `.handbook-stat[data-stat]` | Stat canonique. |
| `.handbook-attribute[data-attribute][data-attribute-type]` | Attribut canonique. |

Une donnée optionnelle absente n’entraîne pas l’invention d’une valeur. Une collection vide peut être omise ; la région MC reste visible avec un état explicite lorsqu’aucune action n’est sélectionnée.

## Surface d’édition Lantern

Les formulaires d’édition doivent être dérivés des schémas JSON générés. Pour un jeu, `character.stats`, `character.attributes` et les vocabulaires de types définissent les contrôles disponibles. Pour un livret, `stats`, `attributes`, `moves`, `choiceSets`, `creation` et `gear` portent les valeurs éditables. Pour un move, `roll` et `results` restent structurés séparément de ses textes.

`statsDetail`, `description` et les autres champs narratifs ne remplacent jamais une valeur mécanique structurée. Ils peuvent expliquer une sélection, mais un formulaire ne doit pas les analyser pour retrouver une stat, un attribut, un type de move ou une audience.
