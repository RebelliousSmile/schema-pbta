# Callouts visuels PbtA

Les six packs PbtA reconnaissent les mêmes identifiants Markdown. Leur contenu est libre ; le pack actif change uniquement leur mise en page. Les callouts n'ajoutent pas de mécanique au jeu et ne modifient ni `front`, ni `npc`, ni `move`, ni `playbook`.

| Identifiant | Usage de présentation |
| --- | --- |
| `pbta-clock` | Suivi visuel d'une intrigue, d'une menace ou d'un compte à rebours. |
| `pbta-move` | Mise en avant d'un move dans une note. |
| `pbta-npc-reaction` | Réaction possible d'un PNJ. |
| `pbta-playbook-change` | Événement concernant un livret, par exemple progression ou lien. |

Exemple facultatif de MC pour Monsterhearts, sans statut de règle officielle :

```md
> [!pbta-clock] La fête tourne mal
> - [x] Une rumeur circule
> - [ ] Quelqu'un confronte le personnage
> - [ ] La dispute éclate
```

Les cases, listes et liens dans le corps restent du Markdown Obsidian. Leur édition ne synchronise aucune fiche et n'active aucune action. Les packs peuvent aussi personnaliser l'apparence des callouts PbtA déjà présents : `pbta-rule`, `pbta-trigger`, `pbta-choice` et `pbta-result`.
