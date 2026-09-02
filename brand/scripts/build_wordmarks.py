#!/usr/bin/env python3
"""Pixelpoint production marks.

Skeleton: Anybody (variable), instantiated and outlined.
The only custom idea: Point-green square tittles. Carbon lettering.
Shaped with HarfBuzz so kerning is real.
"""
from __future__ import annotations

import io
import os
from typing import Iterable

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FONT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "fonts"))
FONT_PATH = os.path.join(FONT_DIR, "Anybody-Wordmark.ttf")  # overwritten per cut
SPORT_PATH = os.path.join(FONT_DIR, "Anybody-Sport.ttf")
CAPTION_PATH = os.path.join(FONT_DIR, "Anybody-Caption.ttf")
DISPLAY_PATH = os.path.join(FONT_DIR, "Anybody-Display.ttf")

POINT = "#62E000"
CARBON = "#0A0A0A"
BONE = "#F3F0E7"
PAPER = "#FAF8F2"
INK_ON_DARK = "#F6F3EA"


def load_ttf(path: str) -> TTFont:
    return TTFont(path)


def font_blob(font: TTFont) -> bytes:
    buf = io.BytesIO()
    font.save(buf)
    return buf.getvalue()


def shape(font: TTFont, text: str) -> tuple[list, list]:
    blob = font_blob(font)
    face = hb.Face(blob)
    hbf = hb.Font(face)
    upem = font["head"].unitsPerEm
    hbf.scale = (upem, upem)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbf, buf)
    return list(buf.glyph_infos), list(buf.glyph_positions)


def cap_height(font: TTFont) -> float:
    os2 = font["OS/2"]
    if getattr(os2, "sCapHeight", 0):
        return float(os2.sCapHeight)
    return float(font["hhea"].ascent) * 0.70


def x_height(font: TTFont) -> float:
    os2 = font["OS/2"]
    if getattr(os2, "sxHeight", 0):
        return float(os2.sxHeight)
    return cap_height(font) * 0.52


def glyph_bounds(font: TTFont, name: str) -> tuple[float, float, float, float]:
    g = font["glyf"][name]
    if g.numberOfContours == 0:
        return (0, 0, 0, 0)
    return (g.xMin, g.yMin, g.xMax, g.yMax)


def compose(
    font: TTFont,
    text: str,
    *,
    size: float,
    tracking_em: float,
    square_at: Iterable[int],
    letter_fill: str,
    point_fill: str,
    square_over_stem: float = 1.05,
    trailing_point: bool = False,
    trailing_ratio: float = 0.38,
) -> tuple[str, float, float]:
    """Return (inner svg, width, height) with origin at top-left ink + pad."""
    square_at = set(square_at)
    # Swap custom-tittle i/I for dotless forms so we own the square.
    chars = list(text)
    shaped_chars = []
    for i, ch in enumerate(chars):
        if i in square_at and ch == "i":
            shaped_chars.append("ı")
        else:
            shaped_chars.append(ch)
    shaped = "".join(shaped_chars)

    infos, positions = shape(font, shaped)
    gs = font.getGlyphSet()
    upem = font["head"].unitsPerEm
    scale = size / upem
    track = tracking_em * size

    paths = []
    squares = []
    pen_x = 0.0
    glyphs_out = []

    for idx, (info, pos) in enumerate(zip(infos, positions)):
        name = font.getGlyphName(info.codepoint)
        gx = (pen_x + pos.x_offset) * scale
        gy = (0 + pos.y_offset) * scale
        pen = SVGPathPen(gs)
        tp = TransformPen(pen, (scale, 0, 0, -scale, gx, -gy))
        gs[name].draw(tp)
        d = pen.getCommands()
        xmin, ymin, xmax, ymax = glyph_bounds(font, name)
        vis = {
            "name": name,
            "char": shaped[idx] if idx < len(shaped) else "",
            "idx": idx,
            "xmin": gx + xmin * scale,
            "xmax": gx + xmax * scale,
            "ytop": -gy - ymax * scale,
            "ybot": -gy - ymin * scale,
            "advance": pos.x_advance * scale,
        }
        glyphs_out.append(vis)
        if d:
            paths.append(f'<path fill="{letter_fill}" d="{d}"/>')
        if idx in square_at:
            stem_cx = (vis["xmin"] + vis["xmax"]) / 2
            stem_w = vis["xmax"] - vis["xmin"]
            side = max(stem_w * square_over_stem, size * 0.095)
            # Gap: a hair of air between stem and pixel — the craft is the gap.
            gap = max(size * 0.048, stem_w * 0.22)
            sx = stem_cx - side / 2
            sy = vis["ytop"] - gap - side
            squares.append((sx, sy, side))
        pen_x += pos.x_advance
        if idx < len(infos) - 1:
            pen_x += tracking_em * upem

    if trailing_point and glyphs_out:
        last = glyphs_out[-1]
        cap = cap_height(font) * scale
        side = cap * trailing_ratio
        gap = cap * 0.16
        sx = last["xmax"] + gap
        sy = last["ybot"] - side
        squares.append((sx, sy, side))

    xs = [g["xmin"] for g in glyphs_out] + [s[0] for s in squares]
    xe = [g["xmax"] for g in glyphs_out] + [s[0] + s[2] for s in squares]
    yt = [g["ytop"] for g in glyphs_out] + [s[1] for s in squares]
    yb = [g["ybot"] for g in glyphs_out] + [s[1] + s[2] for s in squares]
    if not xs:
        raise RuntimeError("no ink")
    xmin, xmax, ymin, ymax = min(xs), max(xe), min(yt), max(yb)

    pad = size * 0.06
    w = (xmax - xmin) + pad * 2
    h = (ymax - ymin) + pad * 2
    dx = -xmin + pad
    dy = -ymin + pad
    sq = "".join(
        f'<rect x="{sx:.3f}" y="{sy:.3f}" width="{side:.3f}" height="{side:.3f}" fill="{point_fill}"/>'
        for sx, sy, side in squares
    )
    inner = f'<g transform="translate({dx:.3f} {dy:.3f})">{"".join(paths)}{sq}</g>'
    return inner, w, h


def svg(inner: str, w: float, h: float, bg: str | None = None, label: str = "Pixelpoint") -> str:
    bg_el = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.3f} {h:.3f}" '
        f'fill="none" role="img" aria-label="{label}">\n{bg_el}{inner}\n</svg>\n'
    )


def lockup(
    word_font: TTFont,
    cap_font: TTFont,
    word: str,
    squares: set[int],
    *,
    letter_fill: str,
    point_fill: str,
    word_size: float,
    word_track: float,
    cap_size: float,
    cap_track: float,
    trailing_point: bool = True,
) -> tuple[str, float, float]:
    w_inner, ww, wh = compose(
        word_font,
        word,
        size=word_size,
        tracking_em=word_track,
        square_at=squares,
        letter_fill=letter_fill,
        point_fill=point_fill,
        trailing_point=trailing_point,
    )
    c_inner, cw, ch = compose(
        cap_font,
        "STUDIO",
        size=cap_size,
        tracking_em=cap_track,
        square_at=(),
        letter_fill=letter_fill,
        point_fill=point_fill,
    )
    gap = word_size * 0.16
    total_w = max(ww, cw)
    total_h = wh + gap + ch
    return (
        f'<g transform="translate({(total_w - ww) / 2:.3f} 0)">{w_inner}</g>'
        f'<g transform="translate({(total_w - cw) / 2:.3f} {wh + gap:.3f})">{c_inner}</g>',
        total_w,
        total_h,
    )


def monogram_pair(size: int = 512, fg: str = POINT, bg: str | None = None) -> str:
    """Two squares on a diagonal. Survives 16px."""
    unit = size / 8.0
    large = unit * 4.0
    small = unit * 1.15
    gap = unit * 0.55
    group_w = large + gap + small
    group_h = large + gap + small
    ox = (size - group_w) / 2
    oy = (size - group_h) / 2
    bg_el = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="Pixelpoint">
{bg_el}<rect x="{ox:.3f}" y="{oy:.3f}" width="{large:.3f}" height="{large:.3f}" fill="{fg}"/>
<rect x="{ox + large + gap:.3f}" y="{oy + large + gap:.3f}" width="{small:.3f}" height="{small:.3f}" fill="{fg}"/>
</svg>
'''


def monogram_notch(size: int = 512, fg: str = POINT, bg: str | None = None) -> str:
    """A pixel that has dropped a point. Primary app icon."""
    pad = size * 0.20
    box = size - 2 * pad
    gap = box * 0.09
    small = box * 0.26
    large = box - small - gap
    lx, ly = pad, pad
    n = small + gap
    # Large square with BR notch (evenodd).
    d = (
        f"M{lx:.3f},{ly:.3f}h{large:.3f}v{large - n:.3f}h{-n:.3f}v{n:.3f}h{-(large - n):.3f}z"
    )
    sx = lx + large + gap
    sy = ly + large + gap
    bg_el = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="Pixelpoint">
{bg_el}<path fill="{fg}" d="{d}"/>
<rect x="{sx:.3f}" y="{sy:.3f}" width="{small:.3f}" height="{small:.3f}" fill="{fg}"/>
</svg>
'''


def p_mark(size: int = 512, fg: str = INK_ON_DARK, point: str = POINT, bg: str | None = None) -> str:
    """Geometric P: square bowl, square counter. One drawing from 16px to 512."""
    stem = size * 0.16
    cap_h = size * 0.52
    bowl = size * 0.30
    counter = size * 0.12
    ox = (size - (stem * 0.45 + bowl)) / 2
    oy = (size - cap_h) / 2
    stem_x, stem_y = ox, oy
    bowl_x = stem_x + stem * 0.42
    bowl_y = stem_y
    cx = bowl_x + bowl - counter - size * 0.055
    cy = bowl_y + (bowl - counter) * 0.38
    bg_el = f'<rect width="{size}" height="{size}" fill="{bg}"/>' if bg else ""
    # Union silhouette so stem∩bowl is not punched by evenodd.
    right = bowl_x + bowl
    mid = bowl_y + bowl
    bottom = stem_y + cap_h
    inner_stem = stem_x + stem
    outer = (
        f"M{stem_x:.2f},{stem_y:.2f}H{right:.2f}V{mid:.2f}H{inner_stem:.2f}"
        f"V{bottom:.2f}H{stem_x:.2f}Z"
    )
    hole = f"M{cx:.2f},{cy:.2f}h{counter:.2f}v{counter:.2f}h{-counter:.2f}z"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="Pixelpoint">
{bg_el}<path fill="{fg}" fill-rule="evenodd" d="{outer} {hole}"/>
<rect x="{cx:.2f}" y="{cy:.2f}" width="{counter:.2f}" height="{counter:.2f}" fill="{point}"/>
</svg>
'''


def write(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print("wrote", os.path.relpath(path, OUT), os.path.getsize(path))


def main() -> None:
    sport = load_ttf(SPORT_PATH)
    mixed = load_ttf(FONT_PATH)
    caption = load_ttf(CAPTION_PATH)
    display = load_ttf(DISPLAY_PATH)

    none: set[int] = set()
    os.makedirs(os.path.join(OUT, "candidates"), exist_ok=True)

    kw = dict(square_at=none, trailing_point=True, trailing_ratio=0.38)

    inner, w, h = compose(
        mixed, "Pixelpoint", size=240, tracking_em=-0.012,
        letter_fill=CARBON, point_fill=POINT, **kw,
    )
    write(os.path.join(OUT, "wordmark.svg"), svg(inner, w, h, label="Pixelpoint"))
    write(os.path.join(OUT, "wordmark-on-bone.svg"), svg(inner, w, h, BONE))

    inner_d, w, h = compose(
        mixed, "Pixelpoint", size=240, tracking_em=-0.012,
        letter_fill=INK_ON_DARK, point_fill=POINT, **kw,
    )
    write(os.path.join(OUT, "wordmark-on-dark.svg"), svg(inner_d, w, h, CARBON))
    write(os.path.join(OUT, "wordmark-inverse.svg"), svg(inner_d, w, h, label="Pixelpoint"))

    inner, w, h = compose(
        sport, "PIXELPOINT", size=240, tracking_em=-0.008,
        letter_fill=CARBON, point_fill=POINT, **kw,
    )
    write(os.path.join(OUT, "wordmark-caps.svg"), svg(inner, w, h, label="PIXELPOINT"))
    write(os.path.join(OUT, "wordmark-caps-on-bone.svg"), svg(inner, w, h, BONE))
    inner_d, w, h = compose(
        sport, "PIXELPOINT", size=240, tracking_em=-0.008,
        letter_fill=INK_ON_DARK, point_fill=POINT, **kw,
    )
    write(os.path.join(OUT, "wordmark-caps-on-dark.svg"), svg(inner_d, w, h, CARBON))
    write(os.path.join(OUT, "wordmark-caps-inverse.svg"), svg(inner_d, w, h, label="PIXELPOINT"))

    inner, w, h = compose(
        mixed, "Pixelpoint", size=240, tracking_em=-0.012,
        letter_fill=CARBON, point_fill=CARBON, **kw,
    )
    write(os.path.join(OUT, "wordmark-mono.svg"), svg(inner, w, h))

    inner, w, h = lockup(
        mixed, caption, "Pixelpoint", none,
        letter_fill=CARBON, point_fill=POINT,
        word_size=240, word_track=-0.012,
        cap_size=36, cap_track=0.42,
        trailing_point=True,
    )
    write(os.path.join(OUT, "lockup.svg"), svg(inner, w, h, label="Pixelpoint Studio"))
    write(os.path.join(OUT, "lockup-on-bone.svg"), svg(inner, w, h, BONE))

    inner, w, h = lockup(
        sport, caption, "PIXELPOINT", none,
        letter_fill=CARBON, point_fill=POINT,
        word_size=240, word_track=-0.008,
        cap_size=34, cap_track=0.48,
        trailing_point=True,
    )
    write(os.path.join(OUT, "lockup-caps.svg"), svg(inner, w, h, BONE, label="PIXELPOINT STUDIO"))

    inner, w, h = lockup(
        mixed, caption, "Pixelpoint", none,
        letter_fill=INK_ON_DARK, point_fill=POINT,
        word_size=240, word_track=-0.012,
        cap_size=36, cap_track=0.42,
        trailing_point=True,
    )
    write(os.path.join(OUT, "lockup-on-dark.svg"), svg(inner, w, h, CARBON, label="Pixelpoint Studio"))

    write(os.path.join(OUT, "monogram.svg"), p_mark(512, fg=CARBON, point=POINT, bg=None))
    write(os.path.join(OUT, "monogram-on-dark.svg"), p_mark(512, fg=INK_ON_DARK, point=POINT, bg=CARBON))
    write(os.path.join(OUT, "monogram-on-bone.svg"), p_mark(512, fg=CARBON, point=POINT, bg=BONE))
    write(os.path.join(OUT, "monogram-pair.svg"), monogram_pair(512, fg=POINT, bg=None))
    write(os.path.join(OUT, "favicon.svg"), p_mark(32, fg=INK_ON_DARK, point=POINT, bg=CARBON))
    write(os.path.join(OUT, "app-icon.svg"), p_mark(512, fg=INK_ON_DARK, point=POINT, bg=CARBON))

    inner, w, h = compose(
        display, "Pixelpoint", size=240, tracking_em=-0.01,
        letter_fill=CARBON, point_fill=POINT, **kw,
    )
    write(os.path.join(OUT, "candidates", "display-period.svg"), svg(inner, w, h, BONE))


if __name__ == "__main__":
    main()
