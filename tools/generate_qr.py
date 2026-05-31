"""Generate booth QR codes for InnoVEX 2026 Catch & Go."""
import os
import re
import qrcode

BASE = "https://innovvex2026-keelung-catch-go.vercel.app"
VENDOR_BASE = f"{BASE}/?vendor="
VENDORS = [
    (1, "杭特電子"),
    (2, "茁思科技"),
    (3, "順易利"),
    (4, "台續"),
    (5, "智慧光"),
    (6, "蔡技企業"),
    (7, "佳音醫療"),
    (8, "和平島地質公園"),
    (9, "森田生技"),
]

root = os.path.join(os.path.dirname(__file__), "..")
out_dir = os.path.join(root, "assets", "qr")
config_path = os.path.join(root, "config.public.js")
os.makedirs(out_dir, exist_ok=True)


def read_form_backup_url():
    if not os.path.exists(config_path):
        return ""
    text = open(config_path, encoding="utf-8").read()
    match = re.search(r"googleFormBackupUrl:\s*['\"]([^'\"]+)['\"]", text)
    return match.group(1).strip() if match else ""


def save_qr(url, filename):
    qr = qrcode.QRCode(version=1, box_size=12, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    path = os.path.join(out_dir, filename)
    qr.make_image(fill_color="#1A3E95", back_color="white").save(path)
    print(f"OK: {path}")


save_qr(BASE, "homepage.png")

for vid, _name in VENDORS:
    save_qr(f"{VENDOR_BASE}{vid}", f"vendor_{vid}.png")

form_url = read_form_backup_url()
if form_url:
    save_qr(form_url, "form_backup.png")
else:
    print("Skip form_backup.png — 請在 config.public.js 設定 googleFormBackupUrl 後再執行")

print(f"\nDone. Output: {out_dir}")
