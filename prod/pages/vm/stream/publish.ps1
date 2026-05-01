# publish.ps1 — capture screen + publish JPEG frames via MQTT
# Requires: pip install paho-mqtt pillow
param(
    [string]$Channel = "default",
    [string]$Broker = "broker.hivemq.com",
    [int]$Port = 1883,
    [int]$Fps = 2,
    [double]$Quality = 40,
    [int]$MaxWidth = 800
)

$py = @"
import paho.mqtt.client as mqtt
import time, io, sys
from PIL import ImageGrab

broker = "$Broker"
port = $Port
topic = "instantvm/screen/$Channel"
fps = $Fps
quality = int($Quality)
max_w = $MaxWidth

client = mqtt.Client(client_id=f"ivm-pub-{time.time():.0f}")
client.connect(broker, port)
client.loop_start()
print(f"Publishing to {topic} @ {fps}fps (q={quality}, max={max_w}px)")

while True:
    try:
        img = ImageGrab.grab()
        if img.width > max_w:
            ratio = max_w / img.width
            img = img.resize((max_w, int(img.height * ratio)))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality)
        client.publish(topic, buf.getvalue())
        time.sleep(1.0 / fps)
    except KeyboardInterrupt:
        break
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(1)

client.loop_stop()
client.disconnect()
"@

python -c $py
