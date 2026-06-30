#!/usr/bin/env python3
"""Regenerate src/data/wraith-products.json from the live Wraith Esports Shopify catalog.

Usage: python3 scripts/generate-wraith-products.py
"""
import json
import os
import urllib.request

STORE = "https://wraithesports.com"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "wraith-products.json")
EUR_TO_TRY_FALLBACK = 53.26


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_eur_rate():
    try:
        data = fetch_json("https://open.er-api.com/v6/latest/EUR")
        return float(data["rates"]["TRY"])
    except Exception:
        return EUR_TO_TRY_FALLBACK


def fetch_all_products():
    products = []
    page = 1
    while True:
        data = fetch_json(f"{STORE}/products.json?limit=250&page={page}")
        batch = data.get("products", [])
        if not batch:
            break
        products.extend(batch)
        if len(batch) < 250:
            break
        page += 1
    return products


def normalize_category(product_type, title):
    pt = (product_type or "").strip()
    title_l = title.lower()
    mapping = {
        "Keyboard": "keyboards",
        "Mouse": "mice",
        "Headphone": "headsets",
        "Kulaklık": "headsets",
        "Gaming Headset": "headsets",
        "Keycaps": "keycaps",
        "Keyboard Switch": "switches",
        "mousepad": "mousepads",
        "Mouse Pads": "mousepads",
        "Gamepad": "controllers",
        "Oyun Kolu Aksesuarı": "controllers",
        "Gamepad Dönüştürücü": "controllers",
        "Monitör": "monitors",
        "Chair": "chairs",
        "DAC/AMP": "audio",
        "Audio Mixer": "audio",
        "Computer Case": "cases",
        "Microphone": "microphones",
        "Webcam": "webcams",
    }
    if pt in mapping:
        return mapping[pt]
    accessory_types = {
        "Grip Tape", "Wrist Rest", "Fan", "Mouse Dongle", "Extension Cable",
        "Smart Screen", "Keyboard Case", "PCB", "Boom Arm", "Şarj Ünitesi",
        "Riser Cable", "SSD", "XLR Cable", "İşlemci Soğutucu", "Charging Cable",
    }
    if pt in accessory_types:
        return "accessories"
    if "tuş takım" in title_l or "keycap" in title_l:
        return "keycaps"
    if "grip tape" in title_l or "hoverpad" in title_l or "mouse skate" in title_l:
        return "accessories"
    if "switch" in title_l:
        return "switches"
    return "accessories"


def build_catalog(raw_products, eur_rate):
    out = []
    seen_handles = set()
    for p in raw_products:
        handle = p["handle"]
        if handle in seen_handles:
            continue
        seen_handles.add(handle)

        variants = p.get("variants", [])
        prices = [float(v["price"]) for v in variants if v.get("price")]
        if not prices:
            continue
        min_price = min(prices)

        compare_candidates = [
            float(v["compare_at_price"]) for v in variants
            if v.get("price") and float(v["price"]) == min_price
            and v.get("compare_at_price") and float(v["compare_at_price"]) > 0
        ]
        compare_at = max(compare_candidates) if compare_candidates else None
        if compare_at is not None and compare_at <= min_price:
            compare_at = None

        image = None
        if p.get("images"):
            image = p["images"][0]["src"]
        elif variants[0].get("featured_image"):
            image = variants[0]["featured_image"]["src"]
        if not image:
            continue

        category = normalize_category(p.get("product_type"), p["title"])

        out.append({
            "id": p["id"],
            "title": p["title"],
            "handle": handle,
            "vendor": p["vendor"],
            "category": category,
            "priceTRY": round(min_price, 2),
            "compareAtPriceTRY": round(compare_at, 2) if compare_at else None,
            "priceEUR": round(min_price / eur_rate, 2),
            "compareAtPriceEUR": round(compare_at / eur_rate, 2) if compare_at else None,
            "image": image,
            "available": any(v.get("available") for v in variants),
        })
    return out


def main():
    eur_rate = fetch_eur_rate()
    print(f"EUR/TRY rate: {eur_rate}")
    raw_products = fetch_all_products()
    print(f"Fetched {len(raw_products)} raw products")
    catalog = build_catalog(raw_products, eur_rate)
    print(f"Built catalog with {len(catalog)} products")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=0)
    print(f"Written to {OUT_PATH}")


if __name__ == "__main__":
    main()
