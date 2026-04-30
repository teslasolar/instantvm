# ⚡ InstantVM

**x86 VM in the browser via WebAssembly — nothing to install**

## prod/ — Working, deployed to GitHub Pages

```
prod/
├── pages/              Live GitHub Pages app
│   ├── v86/            Self-hosted: libv86.js, v86.wasm, BIOS, disk images
│   ├── vm/             emulator.js — boot/stop lifecycle
│   └── ui/             Dark theme CSS
├── udts/               UDT definitions (VM_Instance, OS_Image, VM_Config)
├── tags/               Tag instances (freedos, windows101, config)
└── index.html          Entry point
```

## dev/ — Work in progress, do not deploy

```
dev/
├── electron/           Native Windows Sandbox launcher (Electron app)
│   ├── vm/             .wsb generation, templates, launcher
│   ├── ui/             Electron dock UI
│   ├── bin/            CLI: instantvm <template>
│   └── templates/      Setup scripts for sandbox VMs
├── test-browser.js     Playwright Chrome test suite
└── screenshots/        Debug screenshots
```

## UDTs

| UDT | Fields | What |
|-----|--------|------|
| `VM_Instance` | id, os, state, memory, boot_ms | Running VM state |
| `OS_Image` | id, name, icon, type, url, size, boot_mode | Bootable disk image |
| `VM_Config` | default_os, v86_base, bios paths, issue_label | System config |

## Dynamic Config via GitHub Issues

Create issues with label `instantvm` + JSON code block to add OS images:

```json
{"_udt":"OS_Image","id":"myos","name":"My OS","type":"floppy","url":"v86/myos.img","memory_mb":32}
```
