#!/usr/bin/env python3
"""Compact OwnerShot Ads mood board + design deck. Study frames only."""

from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
REFS = ROOT / "moodboard" / "refs"
OUT = ROOT / "ownershot-ads-design-deck.pdf"

W, H = letter[1], letter[0]  # landscape
CARBON = (0.039, 0.039, 0.039)
INK = (0.078, 0.078, 0.078)
BONE = (0.953, 0.941, 0.906)
PAPER = (0.980, 0.973, 0.949)
MUTE = (0.431, 0.424, 0.392)
POINT = (0.384, 0.878, 0.0)
HAIR = (0.165, 0.161, 0.141)

pdfmetrics.registerFont(TTFont("Sans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("SansB", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))


def fill(c, rgb, x, y, w, h):
    c.setFillColorRGB(*rgb)
    c.rect(x, y, w, h, fill=1, stroke=0)


def text(c, s, x, y, size=10, bold=False, color=CARBON, align="left"):
    c.setFillColorRGB(*color)
    c.setFont("SansB" if bold else "Sans", size)
    if align == "right":
        c.drawRightString(x, y, s)
    elif align == "center":
        c.drawCentredString(x, y, s)
    else:
        c.drawString(x, y, s)


def wrap(c, s, x, y, size, width, leading=None, color=INK, bold=False):
    leading = leading or size + 3
    c.setFont("SansB" if bold else "Sans", size)
    c.setFillColorRGB(*color)
    words = s.split()
    line = ""
    yy = y
    for w in words:
        trial = (line + " " + w).strip()
        if c.stringWidth(trial, "SansB" if bold else "Sans", size) > width:
            c.drawString(x, yy, line)
            yy -= leading
            line = w
        else:
            line = trial
    if line:
        c.drawString(x, yy, line)
        yy -= leading
    return yy


def footer(c, page, total=6):
    fill(c, CARBON, 0, 0, W, 22)
    text(c, "OWNERSHOT ADS  ·  STUDY DECK  ·  DO NOT SHIP THESE FRAMES", 18, 8, 7, color=BONE)
    text(c, f"{page}/{total}", W - 18, 8, 7, color=POINT, align="right")


def phone(c, path, x, y, h=210, caption="", tag=""):
    im = ImageReader(str(path))
    iw, ih = im.getSize()
    w = h * iw / ih
    # bone frame
    c.setStrokeColorRGB(*HAIR)
    c.setLineWidth(0.6)
    c.rect(x - 2, y - 2, w + 4, h + 4, fill=0, stroke=1)
    c.drawImage(im, x, y, width=w, height=h, preserveAspectRatio=True, mask="auto")
    if tag:
        fill(c, POINT, x, y + h - 12, min(w, 92), 12)
        text(c, tag.upper(), x + 4, y + h - 9, 6, bold=True, color=CARBON)
    if caption:
        text(c, caption, x, y - 11, 6.5, color=MUTE)
    return w


def page_cover(c):
    fill(c, CARBON, 0, 0, W, H)
    fill(c, POINT, 18, H - 36, 10, 10)
    text(c, "PIXELPOINT STUDIO", 36, H - 33, 8, bold=True, color=BONE)
    text(c, "LOCKED PRODUCT", W - 18, H - 33, 8, bold=True, color=POINT, align="right")
    text(c, "OWNERSHOT", 18, H - 120, 42, bold=True, color=BONE)
    text(c, "ADS", 18, H - 168, 42, bold=True, color=POINT)
    wrap(
        c,
        "Shop owner photographs their own product. Original listing copy. Original stills. A 12 to 15 second ad. Android + web. No stock. No celebrity. No third-party brands.",
        18,
        H - 200,
        11,
        360,
        15,
        color=BONE,
    )
    # right column facts
    facts = [
        ("STACK", "Grok 4.6  ·  Higgsfield  ·  Supabase  ·  Vercel  ·  Play  ·  dedicated server"),
        ("STUDY", "Photoroom  ·  Canva Magic Media  ·  Shopify seller  ·  Whatnot  ·  Alta  ·  CapCut"),
        ("RULE", "Borrow the job. Never copy the skin, mark, or pixels."),
    ]
    y = 150
    for k, v in facts:
        text(c, k, 18, y, 8, bold=True, color=POINT)
        wrap(c, v, 70, y, 8, 500, 11, color=BONE)
        y -= 28
    footer(c, 1)


def page_deck(c):
    fill(c, BONE, 0, 0, W, H)
    fill(c, CARBON, 0, H - 40, W, 40)
    text(c, "DESIGN DECK", 18, H - 26, 14, bold=True, color=BONE)
    text(c, "Tokens, type, motion. Transform, do not clone.", W - 18, H - 26, 8, color=MUTE, align="right")

    # color chips
    text(c, "PALETTE  (Pixelpoint, not the neighbors)", 18, H - 62, 8, bold=True)
    chips = [
        ("CARBON", CARBON, BONE),
        ("BONE", BONE, CARBON),
        ("POINT", POINT, CARBON),
        ("INK", INK, BONE),
        ("MUTE", MUTE, BONE),
    ]
    x = 18
    for name, rgb, tc in chips:
        fill(c, rgb, x, H - 118, 88, 48)
        c.setStrokeColorRGB(*HAIR)
        c.rect(x, H - 118, 88, 48, fill=0, stroke=1)
        text(c, name, x + 6, H - 108, 7, bold=True, color=tc)
        hexes = {
            "CARBON": "#0A0A0A",
            "BONE": "#F3F0E7",
            "POINT": "#62E000",
            "INK": "#141414",
            "MUTE": "#6E6C64",
        }
        text(c, hexes[name], x + 6, H - 122 + 8, 6.5, color=tc)
        x += 96

    text(c, "TYPE", 18, H - 142, 8, bold=True)
    wrap(c, "Display + buttons: Anybody (Arial Narrow fallback). Body + fields: Red Hat Text. Squared controls, 2px radius. No 24px pills. No Canva purple, CapCut teal, or Shopify admin blue.", 18, H - 156, 8, 360, 11)

    text(c, "MOTION IDEAS", 400, H - 142, 8, bold=True)
    wrap(c, "Shutter settle. Cover tile snaps to slot 1. Point square pulses on generate. Still crossfades into the 12s clip. Preview frame border fills on export (CapCut lesson, our color).", 400, H - 156, 8, 360, 11)

    # steal / never table
    text(c, "STEAL THE JOB", 18, H - 230, 8, bold=True, color=POINT)
    text(c, "NEVER THE SKIN", 400, H - 230, 8, bold=True, color=CARBON)
    steal = [
        "Photoroom: product is the hero, tools as chips",
        "Canva: one prompt, style grid of the same subject",
        "Shopify: title/desc/price stack, Save off until title",
        "Whatnot: cover vs extras, camera grid, required *",
        "Alta: keep / reject / regenerate on the result",
        "CapCut: progress lives on the preview, then share",
    ]
    never = [
        "Purple CTAs, Dream Lab teal-purple wash",
        "Yellow Publish pills, marketplace brand pickers",
        "Chat-thread generation as the main path",
        "Stock / celebrity / film prompts",
        "Shipping these Mobbin JPEGs in the app or Play listing",
        "Cloning any neighbor layout pixel-for-pixel",
    ]
    y = H - 248
    for s in steal:
        wrap(c, "·  " + s, 18, y, 8, 360, 10)
        y -= 18
    y = H - 248
    for s in never:
        wrap(c, "·  " + s, 400, y, 8, 360, 10)
        y -= 18
    footer(c, 2)


def page_mood(c):
    fill(c, BONE, 0, 0, W, H)
    fill(c, CARBON, 0, H - 36, W, 36)
    text(c, "MOOD BOARD", 18, H - 24, 14, bold=True, color=BONE)
    text(c, "Neighbor frames. Watermarked. Not our UI.", W - 18, H - 24, 8, color=MUTE, align="right")

    items = [
        ("photoroom_home.jpg", "Photoroom home", "TOOLS"),
        ("photoroom_search.jpg", "Photoroom styles", "RAILS"),
        ("canva_dreamlab.jpg", "Canva Dream Lab", "PROMPT"),
        ("canva_magic.jpg", "Canva Magic Media", "TABS"),
        ("shopify_add.jpg", "Shopify add", "STACK"),
        ("whatnot_cam.jpg", "Whatnot camera", "COVER"),
        ("alta_regen.jpg", "Alta regenerate", "JUDGE"),
        ("capcut_export.jpg", "CapCut export", "WAIT"),
    ]
    x0, y0 = 16, 48
    col_w = 96
    for i, (fn, cap, tag) in enumerate(items):
        col = i
        phone(c, REFS / fn, x0 + col * col_w, y0, h=232, caption=cap, tag=tag)
    footer(c, 3)


def flow_page(c, page, title, subtitle, steps):
    fill(c, BONE, 0, 0, W, H)
    fill(c, CARBON, 0, H - 36, W, 36)
    text(c, title, 18, H - 24, 13, bold=True, color=BONE)
    text(c, subtitle, W - 18, H - 24, 8, color=MUTE, align="right")

    n = len(steps)
    gap = 12
    margin = 16
    usable = W - margin * 2 - gap * (n - 1)
    max_h = 300
    # compute phone height from first image
    x = margin
    for i, step in enumerate(steps):
        fn, our, study, tag = step
        path = REFS / fn
        im = ImageReader(str(path))
        iw, ih = im.getSize()
        h = max_h
        w = h * iw / ih
        # if too wide, shrink
        max_w = usable / n
        if w > max_w:
            w = max_w
            h = w * ih / iw
        phone(c, path, x, 150, h=h, caption=study, tag=tag)
        # our screen label under caption
        wrap(c, "OURS  " + our, x, 132, 7, w, 9, color=CARBON, bold=True)
        # arrow
        if i < n - 1:
            c.setFillColorRGB(*POINT)
            c.drawString(x + w + 2, 150 + h / 2, ">")
        x += max_w + gap
    footer(c, page)


def page_map(c):
    fill(c, BONE, 0, 0, W, H)
    fill(c, CARBON, 0, H - 36, W, 36)
    text(c, "OUR SCREENS  ·  CREDITS", 18, H - 24, 13, bold=True, color=BONE)

    screens = [
        ("01 Home", "Shop, last jobs, Shoot / Library"),
        ("02 Capture", "Grid camera, cover slot, extra shots"),
        ("03 Facts", "Title, price, material, owner brand only"),
        ("04 Generate", "Still / Clip tabs, one Point button"),
        ("05 Judge", "Keep, reject, regenerate on the still"),
        ("06 Motion", "12s preview, original audio or none"),
        ("07 Pack", "Square + 9:16 + script + Play text"),
        ("08 Export", "Progress on preview, then share sheet"),
        ("09 Library", "Owner products only"),
        ("10 Settings", "Credits, IP reminder, sign out"),
    ]
    x, y = 18, H - 58
    for i, (name, desc) in enumerate(screens):
        col = i % 2
        row = i // 2
        xx = x + col * 380
        yy = y - row * 36
        fill(c, POINT if i == 0 else CARBON, xx, yy - 4, 6, 16)
        text(c, name, xx + 12, yy, 8, bold=True)
        text(c, desc, xx + 92, yy, 8, color=MUTE)

    text(c, "MOBBIN SOURCES  (open the link, do not paste the JPEG into the product)", 18, 150, 8, bold=True)
    credits = [
        "Photoroom  mobbin.com/screens/fe4e7d2d-b021-4efb-bd55-4dfe12080b55",
        "Canva  mobbin.com/screens/f781e540-6a73-45ea-885f-42f9ceae5011  ·  e9b5410c-2622-4cf0-ae37-4d0627be8f6a",
        "Shopify  mobbin.com/screens/fcf26f79-4747-4ae4-9eca-a72aef95f941",
        "Whatnot  mobbin.com/screens/b1e48a3c-435b-419e-b542-275daba7e001  ·  d37e43d0-959f-411a-9fc0-806cfdb432c1",
        "Alta  mobbin.com/screens/9aae0897-7b98-48c9-8ebd-d16dcfa1219c",
        "CapCut  mobbin.com/screens/0817efa5-475d-47db-b95e-ddf474865ef7  ·  46d36017-a82d-4c33-8e24-2b6151be4cd6",
    ]
    yy = 134
    for line in credits:
        text(c, line, 18, yy, 7, color=INK)
        yy -= 12
    wrap(
        c,
        "Fair-use study board for internal design. Frames remain copyright of their apps and Mobbin. Rebuild every screen in Pixelpoint tokens. If a frame is the shortest path, it is the wrong path.",
        18,
        48,
        7.5,
        750,
        10,
        color=MUTE,
    )
    footer(c, 6)


def main():
    c = canvas.Canvas(str(OUT), pagesize=(W, H))
    c.setTitle("OwnerShot Ads — compact design deck")
    c.setAuthor("Pixelpoint Studio")
    page_cover(c)
    c.showPage()
    page_deck(c)
    c.showPage()
    page_mood(c)
    c.showPage()
    flow_page(
        c,
        4,
        "FLOW A  ·  CAPTURE → FACTS",
        "Study Whatnot + Shopify. Rebuild in carbon / Point.",
        [
            ("whatnot_cam.jpg", "Grid camera. Cover must fit the square.", "Whatnot cover camera", "01"),
            ("whatnot_sheet.jpg", "Camera or library. No barcode scan of other catalogs.", "Whatnot add-media sheet", "02"),
            ("whatnot_form.jpg", "Cover + extras. Title 60. Desc 800.", "Whatnot create product", "03"),
            ("shopify_add.jpg", "Save stays dead until title + one photo.", "Shopify add product", "04"),
        ],
    )
    c.showPage()
    flow_page(
        c,
        5,
        "FLOW B  ·  GENERATE → JUDGE → MOTION → EXPORT",
        "Study Canva + Alta + CapCut. One Point button. No chat thread.",
        [
            ("canva_magic.jpg", "Still / Clip tabs. Owner photo is the only input.", "Canva Magic Media", "05"),
            ("canva_styles.jpg", "Format chips: square, 4:5, 9:16. Same product.", "Canva style sheet", "06"),
            ("alta_regen.jpg", "Keep, reject, regenerate on the still.", "Alta regenerate", "07"),
            ("capcut_export.jpg", "Preview border fills. Then share.", "CapCut export", "08"),
        ],
    )
    c.showPage()
    page_map(c)
    c.save()
    print(OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
