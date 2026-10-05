# -*- coding: utf-8 -*-
"""LIT Corporate Document System — shared engine for the 7 client-onboarding templates."""
import io, os
from helpers import *
from reportlab.lib.utils import ImageReader

reg_fonts()
HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = ImageReader(os.path.join(HERE, "assets", "lit_logo_circle.png"))
TEAL = HexColor("#1FA9A2")
MIST = HexColor("#EEF1F7")
RED  = HexColor("#B4443A")
GREEN = HexColor("#2E8B57")
COMPANY = "LOGIC INTELLIGENCE TECHNOLOGIES"
LEGAL_NAME = "Logic Intelligence Technologies Pvt. Ltd."

BODY_TOP = 728
BODY_BOT = 70
GAP, SGAP = 8, 22


def wrap(c, s, f, sz, mw):
    out = []
    for para in str(s).split("\n"):
        words = para.split(); cur = ""
        split = []
        for w in words:
            while c.stringWidth(w, f, sz) > mw and len(w) > 1:
                k = len(w)
                while k > 1 and c.stringWidth(w[:k], f, sz) > mw: k -= 1
                cut = w.rfind("-", 0, k)
                k = cut + 1 if cut > 0 else k
                split.append(w[:k]); w = w[k:]
            split.append(w)
        for w in split:
            t = (cur + " " + w).strip()
            if c.stringWidth(t, f, sz) <= mw: cur = t
            else:
                if cur: out.append(cur)
                cur = w
        out.append(cur)
    return out or [""]


import re as _re
BLANK = "__________"
KEEP_CHIPS = {"S1", "S2", "S3", "S4"}


# Client data. Keys are the placeholder names exactly as written in build_templates.py
# (without the square brackets), e.g. {"Client Company": "Acme Pvt. Ltd."}.
# Any placeholder present here is printed with its value; any missing one is left blank.
FILL = {}


def set_fill(data):
    FILL.clear()
    FILL.update({k.strip(): str(v) for k, v in (data or {}).items() if str(v).strip()})
    if "Client Company" in FILL and "CLIENT COMPANY" not in FILL:
        FILL["CLIENT COMPANY"] = FILL["Client Company"].upper()


COUNT = {}          # occurrence counter per placeholder name (reset for every document pass)
RECORD = []         # (section, key) list, filled when building with --list
CTX = {"section": "Cover / Document control"}


def reset_counts():
    COUNT.clear(); RECORD.clear(); CTX["section"] = "Cover / Document control"


def single(s):
    s = str(s).strip()
    return s.startswith("[") and s.endswith("]") and s.count("[") == 1


def _lookup(name, count=True):
    """Value for a placeholder. 'Name#3' (3rd occurrence in the document) beats plain 'Name'."""
    if not count:
        return FILL.get(name)
    COUNT[name] = COUNT.get(name, 0) + 1
    key = f"{name}#{COUNT[name]}"
    RECORD.append((CTX["section"], key))
    return FILL.get(key, FILL.get(name))


def fillin(s, n=10, count=True):
    """Replace each [placeholder] with its client value, or a blank ____ field when no value is given."""
    def rep(m):
        v = _lookup(m.group(1).strip(), count)
        return v if v is not None else "_" * n
    return _re.sub(r"\[([^\]]*)\]", rep, str(s))


def val(s, n=10):
    """Like fillin, but a cell/field that is ONE unfilled placeholder returns '' (draw it blank)."""
    return fillin(s, 0) if single(s) else fillin(s, n)


def logo(c, cx, cy, r, ring=GOLD, rw=1.0):
    c.saveState(); c.setFillColor(WHITE); c.circle(cx, cy, r, stroke=0, fill=1); c.restoreState()
    c.drawImage(LOGO, cx - r, cy - r, 2 * r, 2 * r, mask="auto")
    c.saveState(); c.setStrokeColor(ring); c.setLineWidth(rw); c.circle(cx, cy, r, stroke=1, fill=0); c.restoreState()


def arrow_down(c, x, y1, y2, col=SLATE_LT):
    vl(c, x, y1, y2 + 4, col=col, sw=1)
    c.saveState(); c.setFillColor(col); p = c.beginPath()
    p.moveTo(x - 3.5, y2 + 5); p.lineTo(x + 3.5, y2 + 5); p.lineTo(x, y2); p.close()
    c.drawPath(p, fill=1, stroke=0); c.restoreState()


def arrow_right(c, x1, x2, y, col=SLATE_LT):
    hl(c, x1, y, x2 - x1 - 4, col=col, sw=1)
    c.saveState(); c.setFillColor(col); p = c.beginPath()
    p.moveTo(x2 - 5, y + 3.5); p.lineTo(x2 - 5, y - 3.5); p.lineTo(x2, y); p.close()
    c.drawPath(p, fill=1, stroke=0); c.restoreState()


CHIP = {"PASS": (GREEN, WHITE), "FAIL": (RED, WHITE), "PENDING": (HexColor("#D9DCE6"), SLATE),
        "N/A": (PAPER2, SLATE), "MUST": (NAVY, CREAM), "SHOULD": (HexColor("#2F4A8A"), CREAM),
        "COULD": (HexColor("#D9DCE6"), SLATE), "OPEN": (HexColor("#F4E6C8"), GOLD_DK),
        "S1": (RED, WHITE), "S2": (HexColor("#C77B30"), WHITE), "S3": (GOLD, WHITE), "S4": (HexColor("#D9DCE6"), SLATE)}


class Doc:
    def __init__(self, path, num, short, ref, version="[1.0]", classification="CLIENT-CONFIDENTIAL"):
        self.path, self.num, self.short, self.ref = path, num, short, ref
        self.version, self.cls = version, classification
        self.toc_prev = {}

    # ── build (two passes so "Page X of Y" and contents page numbers are exact) ──
    def build(self, fn):
        self.total = 0; self.toc = {}
        self._run(fn, io.BytesIO())
        self.total, self.toc_prev = self.page, dict(self.toc)
        self._run(fn, self.path)
        return self.page

    def _run(self, fn, target):
        self.c = nc(target); self.page = 0; self.open = False; self.toc = {}
        reset_counts()
        fn(self)
        self.c.save()

    # ── page furniture ──
    def _new(self):
        if self.open: self.c.showPage()
        self.open = True; self.page += 1

    def header(self):
        c = self.c
        logo(c, A4W / 2, A4H - 40, 20, ring=GOLD, rw=0.9)
        T(c, A4W / 2, A4H - 76, COMPANY, f="PPB", sz=8.4, col=NAVY, a="center", tr=1.9)
        T(c, ML, A4H - 36, self.short.upper(), f="PPM", sz=7, col=SLATE, tr=1.2)
        T(c, ML, A4H - 48, fillin(self.ref, 6, count=False), f="PP", sz=7, col=SLATE_LT)
        T(c, A4W - MR, A4H - 36, f"LIT / {self.num:02d}", f="PPB", sz=8, col=GOLD_DK, a="right", tr=1.0)
        T(c, A4W - MR, A4H - 48, f"Version {fillin(self.version, 6, count=False)}", f="PP", sz=7, col=SLATE_LT, a="right")
        hl(c, ML, A4H - 90, CW, col=LINE, sw=0.7)
        hl(c, A4W / 2 - 22, A4H - 90, 44, col=GOLD, sw=1.6)

    def footer(self, dark=False):
        c = self.c; col = CREAM_DIM if dark else SLATE_LT
        hl(c, ML, 46, CW, col=HexColor("#2A3266") if dark else LINE)
        T(c, ML, 31, self.cls, f="PPM", sz=7.2, col=GOLD if dark else GOLD_DK, tr=1.2)
        T(c, A4W / 2, 31, WEB, f="PP", sz=7.2, col=col, a="center")
        tot = self.total or 0
        T(c, A4W - MR, 31, f"Page {self.page:02d} of {tot:02d}", f="PPM", sz=7.2, col=col, a="right")

    def new_page(self):
        self._new(); bgp(self.c); self.header(); self.footer(); self.y = BODY_TOP

    def ensure(self, h):
        if self.y - h < BODY_BOT: self.new_page(); return True
        return False

    def space(self, h):
        if self.y < BODY_TOP: self.y -= h

    # ── cover ──
    def cover(self, kicker, lines, tagline, meta, note=None):
        self._new(); c = self.c; bgn(c)
        c.saveState(); c.setStrokeColor(HexColor("#1D2450")); c.setLineWidth(0.8)
        c.circle(A4W + 20, 60, 230, stroke=1, fill=0); c.circle(A4W - 10, 20, 150, stroke=1, fill=0)
        c.restoreState()
        c.setFillColor(CYAN); c.rect(0, 0, 4, A4H, stroke=0, fill=1)
        logo(c, A4W / 2, A4H - 84, 38, ring=GOLD, rw=1.6)
        T(c, A4W / 2, A4H - 146, COMPANY, f="PPB", sz=12, col=CREAM, a="center", tr=2.6)
        T(c, A4W / 2, A4H - 164, "Where Logic Meets Innovation", f="LI", sz=9.5, col=CREAM_DIM, a="center")
        hl(c, A4W / 2 - 30, A4H - 178, 60, col=GOLD, sw=1.6)
        y = A4H - 228
        T(c, ML, y, kicker.upper(), f="PPM", sz=8.5, col=GOLD, tr=2.0)
        y -= 40
        for i, ln in enumerate(lines):
            T(c, ML, y, ln, f="PPB", sz=28, col=GOLD if i == len(lines) - 1 else CREAM); y -= 34
        hl(c, ML, y + 14, 180, col=GOLD, sw=2)
        T(c, ML, y - 6, tagline, f="LI", sz=11, col=CREAM_DIM)
        # metadata panel
        top = y - 34; rows = (len(meta) + 1) // 2; rh = 40; ph = rows * rh + 22
        RR(c, ML, top - ph, CW, ph, 6, fill=NAVY2)
        RR(c, ML, top - ph, 3, ph, 1, fill=GOLD)
        colw = (CW - 40) / 2
        for i, (k, v) in enumerate(meta):
            cx = ML + 22 + (i % 2) * (colw + 10); cy = top - 24 - (i // 2) * rh
            T(c, cx, cy, k.upper(), f="PPM", sz=6.8, col=GOLD, tr=1.4)
            v = val(v, 8)
            if not v: hl(c, cx, cy - 18, colw - 40, col=HexColor("#4A5590"), sw=0.8)
            else: T(c, cx, cy - 15, v, f="PP", sz=9.6, col=CREAM)
            if i // 2 < rows - 1: hl(c, cx, cy - 25, colw - 10, col=HexColor("#24306A"))
        # confidentiality band
        by = top - ph - 30
        T(c, ML, by, "CONFIDENTIAL", f="PPB", sz=10, col=GOLD, tr=3.0)
        B(c, ML + 128, by + 1, note or "This document contains confidential commercial and technical information "
          "intended solely for the named client. Do not distribute without written consent from "
          "Logic Intelligence Technologies.", f="PP", sz=7.8, ld=11.5, col=CREAM_DIM, mw=CW - 128)
        # LIT document-system pathway
        py = 132
        T(c, ML, py + 24, "LIT CORPORATE DOCUMENT SYSTEM", f="PPM", sz=6.8, col=GOLD, tr=1.6)
        names = ["Proposal", "SOW", "Onboarding", "Tech Spec", "Change Req.", "Delivery", "Support"]
        order = [2, 1, 3, 4, 6, 5, 7]
        gw = 6; pw = (CW - gw * 6) / 7
        for i, (nm, n) in enumerate(zip(names, order)):
            x = ML + i * (pw + gw); cur = n == self.num
            RR(c, x, py - 20, pw, 28, 4, fill=GOLD if cur else NAVY2)
            T(c, x + pw / 2, py - 2, f"{n:02d}", f="PPB", sz=7, col=NAVY if cur else GOLD, a="center")
            T(c, x + pw / 2, py - 13, nm, f="PPM", sz=6.8, col=NAVY if cur else CREAM_DIM, a="center")
        self.footer(dark=True)

    # ── text blocks ──
    def h1(self, num, title, intro=None, keep=96):
        if self.y < BODY_TOP - 4: self.y -= SGAP
        self.ensure(keep)
        c = self.c; y = self.y
        RR(c, ML, y - 7, 26, 22, 4, fill=NAVY)
        T(c, ML + 13, y, f"{num:02d}", f="PPB", sz=9.5, col=GOLD, a="center")
        T(c, ML + 38, y, title, f="PPB", sz=14, col=NAVY)
        hl(c, ML, y - 16, CW, col=LINE)
        self.toc[num] = self.page
        CTX["section"] = f"{num:02d} {title}"
        self.y = y - 36
        if intro: self.p(intro, col=SLATE, font="LI", sz=9.4)

    def h2(self, title):
        if self.y < BODY_TOP - 4: self.y -= 6
        self.ensure(60)
        T(self.c, ML, self.y, title.upper(), f="PPM", sz=7.8, col=GOLD_DK, tr=1.4)
        self.y -= 17

    def lines(self, n=3, ld=20, x=ML, w=CW):
        self.ensure(n * ld + 4)
        for _ in range(n):
            self.y -= ld - 12
            hl(self.c, x, self.y, w, col=HexColor("#C9C4B4"), sw=0.6)
            self.y -= 12
        self.y -= GAP

    def p(self, text, sz=9, ld=14, col=INK, font="PP", x=ML, w=CW, after=GAP):
        text = val(text)
        if not text: return self.lines(3, x=x, w=w)
        if col == AZURE: col = INK
        for ln in wrap(self.c, text, font, sz, w):
            self.ensure(ld)
            T(self.c, x, self.y, ln, f=font, sz=sz, col=col); self.y -= ld
        self.y -= after

    def bullets(self, items, sz=8.9, ld=13.4, w=CW, x=ML, mark=GOLD):
        for it in items:
            it = val(it)
            if not it:
                self.ensure(ld + 6)
                DIA(self.c, x + 4, self.y + 3, r=2.8, col=mark)
                hl(self.c, x + 16, self.y - 2, w - 16, col=HexColor("#C9C4B4"), sw=0.6)
                self.y -= ld + 6; continue
            lines = wrap(self.c, it, "PP", sz, w - 18)
            self.ensure(ld * min(2, len(lines)))
            DIA(self.c, x + 4, self.y + 3, r=2.8, col=mark)
            for ln in lines:
                self.ensure(ld)
                T(self.c, x + 16, self.y, ln, f="PP", sz=sz, col=INK); self.y -= ld
            self.y -= 4
        self.y -= GAP - 4

    def clauses(self, items, sz=8.9, ld=13.4):
        """items = [(num, text)] — numbered legal clauses with hanging indent."""
        for n, it in items:
            it = fillin(it)
            lines = wrap(self.c, it, "PP", sz, CW - 34)
            self.ensure(ld * min(2, len(lines)))
            T(self.c, ML, self.y, n, f="PPM", sz=sz, col=GOLD_DK)
            for ln in lines:
                self.ensure(ld)
                T(self.c, ML + 34, self.y, ln, f="PP", sz=sz, col=INK); self.y -= ld
            self.y -= 5
        self.y -= GAP - 5

    def checklist(self, items, cols=1, sz=8.8):
        cw = (CW - (cols - 1) * 16) / cols
        rows = [items[i:i + cols] for i in range(0, len(items), cols)]
        for row in rows:
            hs = [len(wrap(self.c, t, "PP", sz, cw - 20)) for t in row]
            h = max(hs) * 13 + 6
            self.ensure(h)
            for j, t in enumerate(row):
                x = ML + j * (cw + 16)
                RR(self.c, x, self.y - 2, 9, 9, 1.5, stroke=SLATE, sw=0.8)
                yy = self.y
                for ln in wrap(self.c, t, "PP", sz, cw - 20):
                    T(self.c, x + 17, yy, ln, f="PP", sz=sz, col=INK); yy -= 13
            self.y -= h
        self.y -= GAP

    def callout(self, title, text, tone="navy", icon=None):
        c = self.c; tw = CW - 40 - (26 if icon else 0)
        lines = wrap(c, fillin(text), "PP", 8.8, tw)
        h = 34 + len(lines) * 13.2 + 10
        self.ensure(h + 4)
        y = self.y + 8
        if tone == "navy":
            RR(c, ML, y - h, CW, h, 6, fill=NAVY); tc, bc, hc = CREAM_DIM, GOLD, GOLD
        elif tone == "note":
            RR(c, ML, y - h, CW, h, 6, fill=HexColor("#FBF4E4"), stroke=GOLD, sw=0.8); tc, bc, hc = INK, GOLD, GOLD_DK
        else:
            RR(c, ML, y - h, CW, h, 6, fill=MIST, stroke=HexColor("#C9D0E2"), sw=0.6); tc, bc, hc = INK, TEAL, NAVY
        RR(c, ML, y - h, 4, h, 2, fill=bc)
        tx = ML + 20
        if icon:
            DISK(c, ML + 28, y - 21, 10, icon, fc=bc, tc=NAVY if tone == "navy" else WHITE, sz=11); tx = ML + 48
        T(c, tx, y - 24, title.upper(), f="PPB", sz=9.2, col=hc, tr=1.2)
        yy = y - 42
        for ln in lines: T(c, tx, yy, ln, f="PP", sz=8.8, col=tc); yy -= 13.2
        self.y = y - h - SGAP + 2

    # ── tables ──
    def table(self, headers, rows, widths, sz=8.3, first_bold=True, total_row=False, align=None, hdr_fill=NAVY):
        c = self.c; W = [w * CW for w in widths]; pad = 7; ld = 11.6
        align = align or ["left"] * len(W)

        def draw_header():
            hh = 24
            RR(c, ML, self.y - hh + 8, CW, hh, 4, fill=hdr_fill)
            x = ML
            for i, hd in enumerate(headers):
                tx = x + pad if align[i] == "left" else (x + W[i] - pad if align[i] == "right" else x + W[i] / 2)
                T(c, tx, self.y - 7, hd.upper(), f="PPM", sz=6.9, col=CREAM, a=align[i], tr=1.0)
                x += W[i]
            self.y -= hh + 2

        self.ensure(24 + 30)
        draw_header()
        for ri, row in enumerate(rows):
            is_total = total_row and ri == len(rows) - 1
            cells = []
            row = ["" if (cl in CHIP and cl not in KEEP_CHIPS) else val(cl, 6 if str(cl).startswith("LIT-") else 10) for cl in row]
            for i, cell in enumerate(row):
                f = "PPB" if is_total else ("PPM" if (i == 0 and first_bold) else "PP")
                cells.append((wrap(c, cell, f, sz, W[i] - 2 * pad) if (cell not in CHIP and cell != "\u25cf") else [cell], f))
            h = max(len(l) for l, _ in cells) * ld + 12
            if self.y - h < BODY_BOT:
                self.new_page(); draw_header()
            top = self.y + 8
            fill = HexColor("#F4E6C8") if is_total else (WHITE if ri % 2 == 0 else PAPER2)
            c.saveState(); c.setFillColor(fill); c.rect(ML, top - h, CW, h, stroke=0, fill=1); c.restoreState()
            hl(c, ML, top - h, CW, col=LINE, sw=0.5)
            x = ML
            for i, (lines, f) in enumerate(cells):
                if lines[0] == "\u25cf":
                    c.saveState(); c.setFillColor(TEAL)
                    c.circle(x + W[i] / 2, top - 13, 4, stroke=0, fill=1); c.restoreState()
                elif lines[0] in CHIP and len(lines) == 1:
                    bg, fg = CHIP[lines[0]]; cw_ = c.stringWidth(lines[0], "PPB", 6.8) + 14
                    cx0 = x + pad if align[i] == "left" else x + (W[i] - cw_) / 2
                    RR(c, cx0, top - 19, cw_, 13, 6.5, fill=bg)
                    T(c, cx0 + cw_ / 2, top - 15, lines[0], f="PPB", sz=6.8, col=fg, a="center")
                else:
                    yy = top - 16
                    for ln in lines:
                        col = INK
                        if is_total: col = NAVY
                        tx = x + pad if align[i] == "left" else (x + W[i] - pad if align[i] == "right" else x + W[i] / 2)
                        T(c, tx, yy, ln, f=f, sz=sz, col=col, a=align[i]); yy -= ld
                x += W[i]
            self.y = top - h - 8
        self.y -= GAP + 6

    def kv(self, pairs, label_w=0.24):
        """Two-column definition table (label | value)."""
        self.table(["Field", "Detail"], pairs, [label_w, 1 - label_w])

    # ── signature block ──
    def signatures(self, left_title="FOR LOGIC INTELLIGENCE TECHNOLOGIES",
                   right_title="FOR [CLIENT COMPANY]",
                   left=(("Name", "Vikash Saravanan"), ("Title", "Founder & Lead Engineer")),
                   right=(("Name", "[Authorized Signatory]"), ("Title", "[Title]")),
                   extra=None):
        c = self.c; h = 196; self.ensure(h + 10)
        bw = (CW - 18) / 2; top = self.y + 6
        for k, (ttl, vals) in enumerate(((left_title, left), (right_title, right))):
            x = ML + k * (bw + 18)
            RR(c, x, top - h, bw, h, 6, fill=WHITE, stroke=LINE, sw=0.8)
            RR(c, x, top - 30, bw, 30, 6, fill=NAVY); c.saveState(); c.setFillColor(NAVY)
            c.rect(x, top - 30, bw, 8, stroke=0, fill=1); c.restoreState()
            T(c, x + 14, top - 19, fillin(ttl, 14), f="PPM", sz=7.4, col=GOLD, tr=1.1)
            yy = top - 54
            for lab, val_ in vals:
                T(c, x + 14, yy, lab.upper(), f="PPM", sz=6.6, col=SLATE_LT, tr=1.0)
                v = val(val_)
                if not v: hl(c, x + 74, yy - 3, bw - 90, col=SLATE_LT, sw=0.6)
                else: T(c, x + 74, yy, v, f="PP", sz=9, col=INK)
                yy -= 26
            for lab in (extra or ["Signature", "Date", "Place"]):
                T(c, x + 14, yy, lab.upper(), f="PPM", sz=6.6, col=SLATE_LT, tr=1.0)
                hl(c, x + 74, yy - 3, bw - 90, col=SLATE_LT, sw=0.6); yy -= 30
        self.y = top - h - SGAP

    # ── diagrams ──
    def steps(self, items, fill=NAVY, accent=GOLD):
        """Horizontal numbered process: items=[(title, sub)]."""
        items = [(t, fillin(sx, 4)) for t, sx in items]
        c = self.c; n = len(items); gap = 14; bw = (CW - gap * (n - 1)) / n
        hs = [len(wrap(c, s, "PP", 7.4, bw - 16)) for _, s in items]
        h = 46 + max(hs) * 10.4 + 6
        self.ensure(h + 6)
        top = self.y + 6
        for i, (t, s) in enumerate(items):
            x = ML + i * (bw + gap)
            RR(c, x, top - h, bw, h, 5, fill=fill if i % 2 == 0 else NAVY2)
            RR(c, x, top - 3, bw, 3, 1, fill=accent)
            DISK(c, x + 16, top - 18, 8.5, i + 1, fc=accent, tc=NAVY, sz=8)
            tl = wrap(c, t, "PPB", 8.2, bw - 36)
            T(c, x + 30, top - 21, tl[0], f="PPB", sz=8.2, col=CREAM)
            yy = top - 40
            if len(tl) > 1: T(c, x + 10, yy + 4, " ".join(tl[1:]), f="PPB", sz=8.2, col=CREAM); yy -= 8
            for ln in wrap(c, s, "PP", 7.4, bw - 16):
                T(c, x + 10, yy, ln, f="PP", sz=7.4, col=CREAM_DIM); yy -= 10.4
            if i < n - 1:
                arrow_right(c, x + bw + 2, x + bw + gap - 1, top - h / 2, col=GOLD)
        self.y = top - h - SGAP

    def node(self, x, y, w, h, title, sub=None, fill=NAVY, tc=CREAM, sc=CREAM_DIM, stroke=None):
        RR(self.c, x, y, w, h, 5, fill=fill, stroke=stroke, sw=0.8)
        if sub: sub = val(sub) or None
        if sub:
            T(self.c, x + w / 2, y + h / 2 + 2, title, f="PPB", sz=8.4, col=tc, a="center", tr=0.6)
            T(self.c, x + w / 2, y + h / 2 - 10, sub, f="PP", sz=7, col=sc, a="center")
        else:
            T(self.c, x + w / 2, y + h / 2 - 3, title, f="PPB", sz=8.4, col=tc, a="center", tr=0.6)

    def arch(self, labels=None, caption=None):
        """Generic web-application architecture (Users → Frontend → Auth/API/Storage → DB → External)."""
        L = labels or {}
        c = self.c; H = 300; self.ensure(H + 10)
        top = self.y; cx = A4W / 2
        RR(c, ML, top - H, CW, H, 6, fill=WHITE, stroke=LINE, sw=0.6)
        T(c, ML + 12, top - 16, "REFERENCE ARCHITECTURE", f="PPM", sz=6.8, col=GOLD_DK, tr=1.3)
        self.node(cx - 60, top - 46, 120, 26, L.get("users", "USERS"), fill=PAPER2, tc=NAVY, stroke=LINE)
        arrow_down(c, cx, top - 46, top - 66)
        self.node(cx - 90, top - 106, 180, 40, L.get("fe", "VERCEL · NEXT.JS"), L.get("fe_sub", "[Frontend application]"))
        bx = [cx - 170, cx - 55, cx + 60]; names = [("AUTH", L.get("auth", "[Auth provider]")),
                                                     ("API", L.get("api", "[Backend / API layer]")),
                                                     ("STORAGE", L.get("st", "[File storage]"))]
        hl(c, bx[0] + 55, top - 122, bx[2] - bx[0], col=SLATE_LT, sw=1)
        vl(c, cx, top - 106, top - 122, col=SLATE_LT, sw=1)
        for i, (t, s) in enumerate(names):
            arrow_down(c, bx[i] + 55, top - 122, top - 140)
            self.node(bx[i], top - 176, 110, 36, t, s, fill=NAVY2)
        hl(c, bx[0] + 55, top - 194, bx[2] - bx[0], col=SLATE_LT, sw=1)
        for i in range(3): vl(c, bx[i] + 55, top - 176, top - 194, col=SLATE_LT, sw=1)
        arrow_down(c, cx, top - 194, top - 212)
        self.node(cx - 90, top - 250, 180, 38, L.get("db", "SUPABASE"), L.get("db_sub", "PostgreSQL · Row Level Security"), fill=TEAL, tc=WHITE, sc=WHITE)
        arrow_down(c, cx, top - 250, top - 266)
        self.node(cx - 90, top - 290, 180, 24, L.get("ext", "EXTERNAL SERVICES"), fill=PAPER2, tc=NAVY, stroke=LINE)
        self.y = top - H - 10
        if caption: self.p(caption, sz=7.8, col=SLATE_LT, font="LI")
        self.y -= SGAP - GAP

    def gantt(self, phases, weeks=10):
        """phases=[(name, start_week, length)] — indicative timeline bars."""
        c = self.c; rh = 22; lw = 130; H = 30 + len(phases) * rh + 12
        self.ensure(H + 6)
        top = self.y + 4; gw = (CW - lw) / weeks
        RR(c, ML, top - H, CW, H, 6, fill=WHITE, stroke=LINE, sw=0.6)
        for w in range(weeks):
            x = ML + lw + w * gw
            T(c, x + gw / 2, top - 18, f"W{w + 1}", f="PPM", sz=6.8, col=SLATE_LT, a="center")
            vl(c, x, top - 26, top - H + 8, col=HexColor("#ECE9DF"), sw=0.5)
        for i, (nm, s, l) in enumerate(phases):
            y = top - 30 - i * rh
            T(c, ML + 12, y - 12, nm, f="PPM", sz=8, col=INK)
            hl(c, ML + lw, y - 18, CW - lw - 8, col=HexColor("#ECE9DF"), sw=0.5)
        self.y = top - H - 8

    # ── standard "Document Control" page ──
    def control_page(self, meta, contents, revisions=None, note=None):
        self.new_page()
        T(self.c, ML, self.y, "DOCUMENT CONTROL", f="PPM", sz=8, col=GOLD_DK, tr=2)
        T(self.c, ML, self.y - 26, "Document Information", f="PPB", sz=19, col=NAVY)
        self.y -= 52
        pairs = list(meta)
        rows = []
        for i in range(0, len(pairs), 2):
            a = pairs[i]; b = pairs[i + 1] if i + 1 < len(pairs) else ("", "")
            rows.append([a[0], a[1], b[0], b[1]])
        self.table(["Field", "Value", "Field", "Value"], rows, [0.19, 0.31, 0.19, 0.31])
        self.h2("Revision History")
        self.table(["Version", "Date", "Description", "Prepared by"],
                   revisions or [["1.0", "[Date]", "Initial issue", "LIT"], ["1.1", "[Date]", "[Revision description]", "LIT"]],
                   [0.14, 0.2, 0.46, 0.2])
        self.h2("Contents")
        c = self.c; half = (len(contents) + 1) // 2; cw = (CW - 24) / 2; ld = 16.5
        self.ensure(half * ld + 6)
        y0 = self.y
        for i, (n, t) in enumerate(contents):
            col = i // half; row = i % half
            x = ML + col * (cw + 24); y = y0 - row * ld
            T(c, x, y, f"{n:02d}", f="PPB", sz=8.2, col=GOLD_DK)
            T(c, x + 22, y, t, f="PP", sz=8.6, col=INK)
            pg = self.toc_prev.get(n)
            if pg: T(c, x + cw, y, f"{pg:02d}", f="PPM", sz=8, col=SLATE_LT, a="right")
            hl(c, x, y - 5, cw, col=HexColor("#ECE9DF"), sw=0.5)
        self.y = y0 - half * ld - SGAP
        if note: self.callout("Internal template note — remove before issue", note, tone="note", icon="!")

    def contact(self):
        self.ensure(90)
        self.y -= 6
        CSTRIP(self.c, self.y)
        self.y -= 64 + SGAP
