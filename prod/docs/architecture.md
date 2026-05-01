# InstantVM Architecture

```mermaid
graph TB
    subgraph "GitHub Pages"
        UI[Launcher UI]
        V86[v86 WASM Emulator]
        GPU[WebGPU Compute]
        VIEWER[MQTT Stream Viewer]
    end

    subgraph "Config (JSON)"
        MANIFEST[manifest.json]
        IMAGES[images.json]
        THEME[theme.json]
    end

    subgraph "UDTs"
        UDT_VM[VM_Instance]
        UDT_OS[OS_Image]
        UDT_SVC[SandboxService]
        UDT_STREAM[StreamChannel]
        UDT_TRADE[SandboxTrade]
    end

    subgraph "Tags (GitHub Issues)"
        TAG_FREE[freedos.json]
        TAG_DSL[dsl.json]
        TAG_WIN[windows101.json]
        TAG_CFG[config.json]
    end

    subgraph "OnlyBrains Exchange"
        AD[/api/ad]
        REASON[/api/reason → mine $KONO]
        SANDBOX_API[/api/sandbox → trade for VM/stream]
    end

    subgraph "MQTT"
        BROKER[broker.hivemq.com]
        PUB[publish.py — screen capture]
    end

    subgraph "Host Machine"
        WINSB[Windows Sandbox VM]
        ELECTRON[Electron Dock]
    end

    UI --> V86
    UI --> VIEWER
    MANIFEST --> V86
    IMAGES --> UI
    V86 -.-> GPU
    VIEWER --> BROKER
    PUB --> BROKER
    PUB --> WINSB
    SANDBOX_API --> BROKER
    AD --> SANDBOX_API
    REASON --> SANDBOX_API
```
