import paho.mqtt.client as mqtt
import time, io
from PIL import ImageGrab

client = mqtt.Client(client_id=f"ivm-pub-{time.time():.0f}")
client.connect("broker.hivemq.com", 1883)
client.loop_start()
print("Publishing to instantvm/screen/default @ 2fps")

for i in range(20):
    try:
        img = ImageGrab.grab()
        img = img.resize((800, int(img.height * 800 / img.width)))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=40)
        client.publish("instantvm/screen/default", buf.getvalue())
        print(f"Frame {i+1}: {len(buf.getvalue())}b")
        time.sleep(0.5)
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(1)

client.loop_stop()
client.disconnect()
print("Done")
