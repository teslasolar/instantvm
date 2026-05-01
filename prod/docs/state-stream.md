# MQTT Stream State Machine

```mermaid
stateDiagram-v2
    [*] --> IDLE

    state "Publisher (Host)" as pub {
        IDLE --> CAPTURING : start publish.py
        CAPTURING --> PUBLISHING : PIL.grab() → JPEG
        PUBLISHING --> CAPTURING : sleep(1/fps)
        CAPTURING --> CLOSED : KeyboardInterrupt
    }

    state "Broker" as broker {
        PUBLISHING --> RELAY : MQTT publish
        RELAY --> DELIVER : topic match
    }

    state "Viewer (Pages)" as view {
        DELIVER --> RENDERING : MQTT subscribe
        RENDERING --> CANVAS : drawImage()
        CANVAS --> RENDERING : next frame
    }

    CLOSED --> [*]

    note right of PUBLISHING : topic: instantvm/screen/{channel}
    note right of RELAY : broker.hivemq.com:8884 WSS
    note right of CANVAS : fitScreen() scales to viewport
```
