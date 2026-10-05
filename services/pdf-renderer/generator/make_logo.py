# -*- coding: utf-8 -*-
"""Re-create assets/lit_logo_circle.png (the round logo used at the top of every page).

Usage:
    python make_logo.py                          # uses assets/lit_logo_full.png
    python make_logo.py path/to/new_logo.png     # use a different source image

The script finds the dark logo mark in the top part of the image (above the
company-name text), centres it on a white square with padding, and cuts it
into a circle with a transparent outside.
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "assets", "lit_logo_full.png")
OUT = os.path.join(HERE, "assets", "lit_logo_circle.png")
SIZE = 800          # output resolution (px)
PADDING = 1.45      # >1 = more white space around the mark inside the circle
MARK_AREA = 0.66    # only look at the top 66% of the image (skips the text underneath)

im = Image.open(SRC).convert("RGB")
a = np.array(im)
limit = int(a.shape[0] * MARK_AREA)
dark = a[:limit].sum(axis=2) < 450
ys, xs = np.where(dark)
x0, x1, y0, y1 = xs.min() - 10, xs.max() + 10, ys.min() - 10, min(ys.max() + 10, limit)
mark = im.crop((x0, y0, x1, y1))

side = int(max(mark.size) * PADDING)
sq = Image.new("RGB", (side, side), "white")
sq.paste(mark, ((side - mark.size[0]) // 2, (side - mark.size[1]) // 2))
sq = sq.resize((SIZE, SIZE), Image.LANCZOS)

mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).ellipse((0, 0, SIZE - 1, SIZE - 1), fill=255)
out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
out.paste(sq, (0, 0), mask)
out.save(OUT)
print("Saved", OUT)
