# -*- coding: utf-8 -*-
"""Köşelerdeki buğulanmayı ölçer.

Her görselin 4 köşesindeki kare parçanın "keskinlik" değerini (Laplacian varyansı)
merkez bölgenin keskinliğiyle karşılaştırır. Köşe/merkez oranı düşükse o köşeye
bulanıklık uygulanmış demektir.
"""
import sys
import glob
import numpy as np
from PIL import Image


def keskinlik(dizi: np.ndarray) -> float:
    """Basit Laplacian varyansı: yüksek = keskin, düşük = bulanık."""
    lap = (
        -4 * dizi[1:-1, 1:-1]
        + dizi[:-2, 1:-1]
        + dizi[2:, 1:-1]
        + dizi[1:-1, :-2]
        + dizi[1:-1, 2:]
    )
    return float(lap.var())


def incele(yol: str, oran: float = 0.18):
    im = Image.open(yol).convert("L")
    a = np.asarray(im, dtype=np.float32)
    h, w = a.shape
    k = int(min(h, w) * oran)
    koseler = {
        "sol-ust": a[0:k, 0:k],
        "sag-ust": a[0:k, w - k:w],
        "sol-alt": a[h - k:h, 0:k],
        "sag-alt": a[h - k:h, w - k:w],
    }
    merkez = a[h // 2 - k // 2: h // 2 + k // 2, w // 2 - k // 2: w // 2 + k // 2]
    m = keskinlik(merkez)
    sonuc = {ad: keskinlik(p) for ad, p in koseler.items()}
    return w, h, m, sonuc


def main(yollar):
    print(f"{'dosya':<34}{'olcu':>11}{'merkez':>9}   kose/merkez orani (dusuk = bugulu)")
    print("-" * 104)
    for yol in yollar:
        try:
            w, h, m, koseler = incele(yol)
        except Exception as e:  # noqa: BLE001
            print(f"{yol:<34} HATA: {e}")
            continue
        ad = yol.replace("\\", "/").split("/")[-1]
        oranlar = {k: (v / m if m else 0) for k, v in koseler.items()}
        en_dusuk = min(oranlar.values())
        isaret = "  <-- BUGULU KOSE" if en_dusuk < 0.35 else ""
        detay = "  ".join(f"{k}:{v:5.2f}" for k, v in oranlar.items())
        print(f"{ad:<34}{w:>5}x{h:<5}{m:>9.0f}   {detay}{isaret}")


if __name__ == "__main__":
    yollar = sys.argv[1:] or sorted(glob.glob("public/images/products/*.jpg"))
    main(yollar)
