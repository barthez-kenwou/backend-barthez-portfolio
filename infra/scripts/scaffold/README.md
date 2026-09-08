# Module scaffold CLI

Generates a full Barthez Kenwou Portfolio Backend bounded context (CRUD vertical
slice).

```bash
npm run scaffold:module -- <name> [--wire] [--with-audit] [--force] [--dry-run] [--mount <slug>]
```

See [scaffolding-a-module.md](../../../docs/guides/scaffolding-a-module.md).

## Layout

```
infra/scripts/scaffold/
├── module.mjs                 # CLI entry
├── lib/
│   ├── naming.mjs             # singular/plural, Pascal/camel
│   ├── fs.mjs                 # render + write
│   └── wire.mjs               # optional composition-root patches
├── templates/
│   └── module.templates.mjs   # file contents
└── README.md
```
