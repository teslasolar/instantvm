import paho.mqtt.client as mqtt
import time, io, ctypes
from ctypes import wintypes
from PIL import Image

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

def find_sandbox_window():
    hwnd = user32.FindWindowW(None, "Windows Sandbox")
    return hwnd if hwnd else None

def capture_window(hwnd, max_w=800):
    rect = wintypes.RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rect))
    w = rect.right - rect.left
    h = rect.bottom - rect.top
    if w < 10 or h < 10:
        return None

    hdc = user32.GetDC(0)
    mdc = gdi32.CreateCompatibleDC(hdc)
    bmp = gdi32.CreateCompatibleBitmap(hdc, w, h)
    gdi32.SelectObject(mdc, bmp)
    gdi32.BitBlt(mdc, 0, 0, w, h, hdc, rect.left, rect.top, 0x00CC0020)

    class BITMAPINFOHEADER(ctypes.Structure):
        _fields_ = [("biSize",ctypes.c_uint32),("biWidth",ctypes.c_int32),("biHeight",ctypes.c_int32),
                     ("biPlanes",ctypes.c_uint16),("biBitCount",ctypes.c_uint16),("biCompression",ctypes.c_uint32),
                     ("biSizeImage",ctypes.c_uint32),("biXPelsPerMeter",ctypes.c_int32),("biYPelsPerMeter",ctypes.c_int32),
                     ("biClrUsed",ctypes.c_uint32),("biClrImportant",ctypes.c_uint32)]

    bi = BITMAPINFOHEADER(biSize=40, biWidth=w, biHeight=-h, biPlanes=1, biBitCount=32)
    buf = ctypes.create_string_buffer(w * h * 4)
    gdi32.GetDIBits(mdc, bmp, 0, h, buf, ctypes.byref(bi), 0)

    gdi32.DeleteObject(bmp)
    gdi32.DeleteDC(mdc)
    user32.ReleaseDC(0, hdc)

    img = Image.frombuffer("RGBX", (w, h), buf, "raw", "BGRX", 0, 1).convert("RGB")
    if img.width > max_w:
        ratio = max_w / img.width
        img = img.resize((max_w, int(img.height * ratio)))
    return img

hwnd = find_sandbox_window()
if not hwnd:
    print("Windows Sandbox not found")
    exit(1)

print(f"Found sandbox window: HWND {hwnd}")

client = mqtt.Client(client_id=f"ivm-sandbox-{time.time():.0f}")
client.connect("broker.hivemq.com", 1883)
client.loop_start()
print("Streaming sandbox to instantvm/screen/sandbox @ 2fps")

i = 0
while True:
    i += 1
    try:
        img = capture_window(hwnd)
        if img:
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=40)
            client.publish("instantvm/screen/sandbox", buf.getvalue())
            print(f"Frame {i+1}: {len(buf.getvalue())}b ({img.width}x{img.height})")
        time.sleep(0.5)
    except KeyboardInterrupt:
        break
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(1)

client.loop_stop()
client.disconnect()
print("Done")
