# -*- coding: utf-8 -*-
from reportlab.pdfgen import canvas as rlcanvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

import os
FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
A4W, A4H = 595, 842
ML = MR = 56
CW = A4W - ML - MR

NAME  = "VIKASH SARAVANAN"
WEB   = "logicintelligencetechnologies.in"
EMAIL = "support@logicintelligencetechnologies.in"
PHONE = "+91 93428 77474"

NAVY=HexColor("#0D1B3E"); NAVY2=HexColor("#142255"); NAVY3=HexColor("#1C2D6B")
PAPER=HexColor("#FAF9F6"); PAPER2=HexColor("#F3F1EA"); LINE=HexColor("#DEDACB")
GOLD=HexColor("#C99A3D"); GOLD_DK=HexColor("#A87C25"); CREAM=HexColor("#EDEAE0")
CREAM_DIM=HexColor("#B9BEDD"); SLATE=HexColor("#4B5170"); SLATE_LT=HexColor("#8890B0")
INK=HexColor("#101425"); WHITE=HexColor("#FFFFFF"); CYAN=HexColor("#45D9D2")
AZURE=HexColor("#0B94DE")

def reg_fonts():
    pdfmetrics.registerFont(TTFont("PP",  f"{FONT_DIR}/Poppins-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("PPM", f"{FONT_DIR}/Poppins-Medium.ttf"))
    pdfmetrics.registerFont(TTFont("PPB", f"{FONT_DIR}/Poppins-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("PPL", f"{FONT_DIR}/Poppins-Light.ttf"))
    pdfmetrics.registerFont(TTFont("PPI", f"{FONT_DIR}/Poppins-Italic.ttf"))
    pdfmetrics.registerFont(TTFont("LR",  f"{FONT_DIR}/Lora-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("LI",  f"{FONT_DIR}/Lora-Italic.ttf"))
    pdfmetrics.registerFont(TTFont("LB",  f"{FONT_DIR}/Lora-Bold.ttf"))

def nc(path): return rlcanvas.Canvas(path, pagesize=(A4W, A4H))
def bgp(c): c.setFillColor(PAPER); c.rect(0,0,A4W,A4H,stroke=0,fill=1)
def bgn(c): c.setFillColor(NAVY); c.rect(0,0,A4W,A4H,stroke=0,fill=1)

def hl(c,x,y,w,col=LINE,sw=0.6):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(sw)
    c.line(x,y,x+w,y); c.restoreState()

def vl(c,x,y1,y2,col=LINE,sw=0.6):
    c.saveState(); c.setStrokeColor(col); c.setLineWidth(sw)
    c.line(x,y1,x,y2); c.restoreState()

def T(c,x,y,s,f="PP",sz=10,col=INK,a="left",tr=0):
    if not s: return
    c.saveState(); c.setFillColor(col); c.setFont(f,sz)
    if tr:
        cx=x; tot=sum(c.stringWidth(ch,f,sz)+tr for ch in s)-tr
        if a=="center": cx=x-tot/2
        elif a=="right": cx=x-tot
        for ch in s:
            c.drawString(cx,y,ch); cx+=c.stringWidth(ch,f,sz)+tr
    else:
        if a=="right": c.drawRightString(x,y,s)
        elif a=="center": c.drawCentredString(x,y,s)
        else: c.drawString(x,y,s)
    c.restoreState()

def B(c,x,y,s,f="PP",sz=10,ld=15,col=INK,mw=400):
    words=s.split(); lines=[]; cur=""
    for w in words:
        t=(cur+" "+w).strip()
        if c.stringWidth(t,f,sz)<=mw: cur=t
        else:
            if cur: lines.append(cur)
            cur=w
    if cur: lines.append(cur)
    cy=y
    for ln in lines: T(c,x,cy,ln,f=f,sz=sz,col=col); cy-=ld
    return cy

def RR(c,x,y,w,h,r=5,fill=None,stroke=None,sw=0.8):
    c.saveState()
    if fill: c.setFillColor(fill)
    if stroke: c.setStrokeColor(stroke); c.setLineWidth(sw)
    c.roundRect(x,y,w,h,r,stroke=1 if stroke else 0,fill=1 if fill else 0)
    c.restoreState()

def DIA(c,x,y,r=3.5,col=GOLD):
    c.saveState(); c.setFillColor(col)
    p=c.beginPath(); p.moveTo(x,y+r); p.lineTo(x+r,y); p.lineTo(x,y-r); p.lineTo(x-r,y); p.close()
    c.drawPath(p,fill=1,stroke=0); c.restoreState()

def DISK(c,cx,cy,r,n,fc=GOLD_DK,tc=WHITE,sz=9):
    c.saveState(); c.setFillColor(fc); c.circle(cx,cy,r,stroke=0,fill=1)
    c.setFillColor(tc); c.setFont("PPB",sz); c.drawCentredString(cx,cy-sz*0.36,str(n))
    c.restoreState()

def KK(c,x,y,s,col=GOLD_DK): T(c,x,y,s.upper(),f="PPM",sz=8.5,col=col,tr=2.0)

def RH(c,label,dark=False):
    col=CREAM_DIM if dark else SLATE_LT
    hr=HexColor("#2A3266") if dark else LINE
    T(c,ML,A4H-34,"LOGIC INTELLIGENCE TECHNOLOGIES",f="PPM",sz=7.6,col=col,tr=1.6)
    T(c,A4W-MR,A4H-34,label.upper(),f="PPM",sz=7.6,col=col,tr=1.0,a="right")
    hl(c,ML,A4H-44,CW,col=hr)

def FT(c,pg,tot,dark=False,dl="LOGIC INTELLIGENCE TECHNOLOGIES"):
    col=CREAM_DIM if dark else SLATE_LT
    hr=HexColor("#2A3266") if dark else LINE
    hl(c,ML,44,CW,col=hr)
    T(c,ML,30,dl,f="PPM",sz=7.6,col=col,tr=1.0)
    T(c,A4W/2,30,NAME,f="PPM",sz=7.6,col=col,tr=1.4,a="center")
    T(c,A4W-MR,30,f"{str(pg).zfill(2)} / {str(tot).zfill(2)}",f="PPM",sz=7.6,col=col,a="right")

def SH(c,x,y,n,t1,t2=""):
    KK(c,x,y,f"Section {n}",col=GOLD_DK)
    T(c,x,y-26,t1,f="PPB",sz=21,col=INK)
    if t2: T(c,x,y-52,t2,f="PPB",sz=21,col=INK)

def FILL(c,y,dark=False,extra=None):
    col=CREAM_DIM if dark else SLATE_LT
    bg=HexColor("#0F1A45") if dark else PAPER2
    if y>160:
        RR(c,ML,100,CW,y-94,5,fill=bg)
        hl(c,ML,y+10,CW,col=HexColor("#2A3266") if dark else LINE)
        T(c,ML+14,y-4,"WHY LOGIC INTELLIGENCE TECHNOLOGIES?",f="PPM",sz=8,col=GOLD_DK if not dark else GOLD,tr=1.2)
        items=extra or [
            "Free working prototype delivered before any payment commitment",
            "Founder Vikash Saravanan personally codes every client project",
            "Transparent pricing — all packages published at "+WEB,
            "Deterministic AI: Pydantic validation + retry loops on every LLM call"]
        iy=y-22
        for it in items:
            DIA(c,ML+18,iy+3.5,r=3,col=GOLD if dark else GOLD_DK)
            T(c,ML+30,iy,it,f="PP",sz=8.6,col=col); iy-=14

def CSTRIP(c,y):
    """Contact block. y = top edge. Height = 64 pts. Clamps above footer."""
    if y < 116: y = 116
    RR(c,ML,y-64,CW,64,5,fill=PAPER2,stroke=LINE,sw=0.6)
    T(c,ML+14,y-14,"CONTACT & ENGAGEMENT",f="PPM",sz=7.8,col=GOLD_DK,tr=1.6)
    # Vertical divider
    vl(c,ML+CW/2,y-20,y-60,col=LINE,sw=0.5)
    # Left column: Website + Email stacked
    T(c,ML+14,y-30,"Website",f="PPM",sz=7,col=SLATE); T(c,ML+62,y-30,WEB,f="PP",sz=8,col=AZURE)
    T(c,ML+14,y-46,"Email",  f="PPM",sz=7,col=SLATE); T(c,ML+62,y-46,EMAIL,f="PP",sz=8,col=AZURE)
    # Right column: Phone + Location stacked
    rx=ML+CW/2+14
    T(c,rx,y-30,"Phone",   f="PPM",sz=7,col=SLATE); T(c,rx+46,y-30,PHONE,f="PP",sz=8,col=INK)
    T(c,rx,y-46,"Location",f="PPM",sz=7,col=SLATE); T(c,rx+60,y-46,"Coimbatore, Tamil Nadu, India",f="PP",sz=8,col=INK)

def COV(c,t1,t2,sub,tag,tot,kpis=None,r1=None,r2=None):
    bgn(c)
    c.saveState(); c.setStrokeColor(HexColor("#1D2450")); c.setLineWidth(0.8)
    c.circle(A4W+10,A4H+10,260,stroke=1,fill=0)
    c.circle(A4W-40,A4H-50,170,stroke=1,fill=0); c.restoreState()
    c.setFillColor(CYAN); c.rect(0,0,4,A4H,stroke=0,fill=1)
    ty=A4H-64
    T(c,ML,ty,"LOGIC INTELLIGENCE TECHNOLOGIES",f="PPM",sz=9,col=CREAM,tr=2.2)
    T(c,A4W-MR,ty,"OFFICIAL DOCUMENT",f="PPM",sz=9,col=GOLD,tr=1.8,a="right")
    hl(c,ML,ty-14,CW,col=HexColor("#2A3266"))
    ky=ty-46; KK(c,ML,ky,sub,col=GOLD)
    T(c,ML,ky-52,t1,f="PPB",sz=30,col=CREAM)
    T(c,ML,ky-86,t2,f="PPB",sz=30,col=GOLD)
    tag_y=ky-112; hl(c,ML,tag_y-6,200,col=GOLD,sw=2)
    T(c,ML,tag_y-24,f"— {tag} —",f="LI",sz=11.5,col=CREAM_DIM)
    cw3=CW/3-7
    rows=[
        r1 or [("Full-Stack Engineering","Next.js · React · TypeScript · FastAPI · PostgreSQL"),
               ("Autonomous AI Workflows","LLM orchestration · RAG pipelines · Playwright RPA"),
               ("Robotic Process Automation","Headless bots · 24/7 execution · legacy systems")],
        r2 or [("Transparent Pricing","Published rates. Free prototype before any payment."),
               ("Engineering-First","The founder writes production code on every project."),
               ("Deterministic AI","Strict JSON scaffolding on every LLM integration.")],
    ]
    fills=[HexColor("#142255"),HexColor("#0F1A45")]
    accents=[None,GOLD]
    start_y=[tag_y-72,tag_y-146]
    for ri,(row,fill,accent,sy) in enumerate(zip(rows,fills,accents,start_y)):
        cx=ML
        for h_,s_ in row:
            RR(c,cx,sy-58,cw3,58,5,fill=fill)
            if accent: RR(c,cx,sy-58,cw3,3,1,fill=accent)
            col_=CYAN if ri==0 else GOLD
            T(c,cx+14,sy-18,h_,f="PPM",sz=9.2,col=col_)
            B(c,cx+14,sy-32,s_,f="PP",sz=7.8,ld=11,col=CREAM_DIM,mw=cw3-20); cx+=cw3+10
    ky3=tag_y-220
    kpis=kpis or [("8+","Platforms","Omni-channel publishing"),
                  ("100%","Custom-Built","No templates. Ever."),
                  ("₹8,999","Starting From","Digital Launch — 4 weeks")]
    cx=ML
    for big,lbl,sub_ in kpis:
        RR(c,cx,ky3-60,cw3,60,5,fill=NAVY3)
        T(c,cx+cw3/2,ky3-20,big,f="PPB",sz=16,col=CYAN,a="center")
        T(c,cx+cw3/2,ky3-35,lbl,f="PPM",sz=8.6,col=CREAM,a="center")
        T(c,cx+cw3/2,ky3-48,sub_,f="PP",sz=7.2,col=CREAM_DIM,a="center"); cx+=cw3+10
    band=ky3-68; hl(c,ML,band,CW,col=HexColor("#2A3266"))
    T(c,ML,     band-13,"COMPANY",  f="PPM",sz=7,col=GOLD,tr=1.2)
    T(c,ML,     band-26,"Logic Intelligence Technologies",f="PP",sz=8.2,col=CREAM)
    T(c,ML+150, band-13,"FOUNDER",  f="PPM",sz=7,col=GOLD,tr=1.2)
    T(c,ML+150, band-26,"Vikash Saravanan",f="PP",sz=8.2,col=CREAM)
    T(c,ML+268, band-13,"LOCATION", f="PPM",sz=7,col=GOLD,tr=1.2)
    T(c,ML+268, band-26,"Coimbatore, Tamil Nadu, India",f="PP",sz=8.2,col=CREAM)
    T(c,ML+406, band-13,"WEBSITE",  f="PPM",sz=7,col=GOLD,tr=1.2)
    T(c,ML+406, band-26,WEB,        f="PP",sz=7.8,col=CREAM)
    qy=band-50
    T(c,ML,qy,"“Where Logic Meets Innovation” — every system we architect, every line we deploy.",f="LI",sz=10.5,col=CREAM_DIM)
    T(c,ML,qy-18,f"Visit {WEB} to explore services, case studies, and pricing packages.",f="PP",sz=9,col=SLATE_LT)
    pl_y=qy-42; hl(c,ML,pl_y+10,CW,col=HexColor("#1A2560"))
    T(c,ML,pl_y-2,"CORE SERVICES",f="PPM",sz=7,col=GOLD,tr=1.4)
    svcs=["Full-Stack Web Apps","AI & LLM Integration","Robotic Process Automation",
          "PostgreSQL & Supabase","CI/CD & DevOps","E-Commerce Platforms","RAG Pipelines","API Engineering"]
    px=ML; ply=pl_y-18
    for sv in svcs:
        sw_=len(sv)*5+18
        if px+sw_>A4W-MR: px=ML; ply-=18
        RR(c,px,ply-13,sw_,13,6,fill=NAVY3)
        T(c,px+sw_/2,ply-8,sv,f="PP",sz=7,col=CREAM,a="center"); px+=sw_+7
    # footer — NO contact strip, only tagline + name + page number
    hl(c,ML,80,CW,col=HexColor("#1A2560"))
    T(c,ML,66,"ENGINEERING-FIRST  ·  AUTONOMOUS  ·  DETERMINISTIC  ·  SCALABLE",f="PPM",sz=7,col=CREAM_DIM,tr=0.8)
    T(c,A4W/2,32,NAME,f="PPM",sz=7.6,col=CREAM_DIM,tr=1.4,a="center")
    T(c,A4W-MR,66,f"01 / {str(tot).zfill(2)}",f="PPM",sz=7.6,col=CREAM_DIM,a="right")
