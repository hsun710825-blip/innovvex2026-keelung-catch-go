"""Generate booth QR codes for InnoVEX 2026 Catch & Go."""
import os
import qrcode

BASE = "https://innovvex2026-keelung-catch-go.vercel.app/?vendor="
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

out_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "qr")
os.makedirs(out_dir, exist_ok=True)

for vid, name in VENDORS:
    url = f"{BASE}{vid}"
    qr = qrcode.QRCode(version=1, box_size=12, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1A3E95", back_color="white")
    path = os.path.join(out_dir, f"vendor_{vid}.png")
    img.save(path)
    print(f"OK: {path}")

print(f"\nGenerated {len(VENDORS)} QR codes in {out_dir}")
