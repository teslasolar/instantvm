# ⚡ InstantVM

**Disposable Windows VMs in one click — Electron + Windows Sandbox**

Boot a sandboxed Windows environment instantly. Map folders, run
setup scripts, auto-teardown on close. Templates for common workloads.

## How It Works

1. Pick a template (or create custom)
2. Click Launch → generates `.wsb` config → boots Windows Sandbox
3. Mapped folders + setup script run automatically inside the VM
4. Close the VM → everything destroyed (disposable)

## Templates

| Template | What |
|----------|------|
| `ignition-designer` | Ignition Designer with cached JRE + gateway connect |
| `dev-sandbox` | Node + Python + Git — clean dev environment |
| `plc-sim` | GitPLC simulator with mock tags |
| `clean-browser` | Isolated browser for testing |
| `custom` | Build your own with folder maps + setup script |

## Structure

```
instantvm/
├── app/                Electron app
│   ├── main.js         Entry point
│   ├── vm/             VM lifecycle (generate wsb, launch, monitor)
│   └── ui/             Dock UI (css, panels, scripts)
├── templates/          .wsb templates + setup scripts
├── bin/                CLI (instantvm <template>)
├── package.json
└── README.md
```
