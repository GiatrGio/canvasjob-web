from __future__ import annotations

import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / "public" / "marketing" / "screenshots"
OUT_DIR = ROOT / "public" / "marketing" / "videos"
ENCODER = ROOT / "scripts" / "encode_frames.swift"

W, H = 1080, 1920
FPS = 30
DURATION_SECONDS = 9
TOTAL_FRAMES = FPS * DURATION_SECONDS

BLACK = (17, 18, 24, 255)
INK = (24, 25, 31, 255)
MUTED = (108, 110, 121, 255)
WHITE = (255, 255, 255, 255)
CREAM = (255, 250, 238, 255)
EMERALD = (0, 138, 92, 255)
MINT = (207, 255, 229, 255)
ORANGE = (255, 151, 0, 255)
AMBER = (255, 220, 119, 255)
BLUE = (62, 88, 255, 255)
ROSE = (225, 50, 72, 255)


def font(size: int, weight: str = "regular") -> ImageFont.FreeTypeFont:
    base = Path("/System/Library/Fonts/Supplemental")
    path = base / ("Arial Bold.ttf" if weight == "bold" else "Arial.ttf")
    return ImageFont.truetype(str(path), size=size)


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def ease_out(v: float) -> float:
    v = clamp(v)
    return 1 - (1 - v) ** 3


def ease_in_out(v: float) -> float:
    v = clamp(v)
    return v * v * (3 - 2 * v)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def blend(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(lerp(a[i], b[i], t)) for i in range(3))


def rgba(color: tuple[int, ...], alpha: float = 1.0) -> tuple[int, int, int, int]:
    return (color[0], color[1], color[2], int((color[3] if len(color) > 3 else 255) * alpha))


def make_bg(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    img = Image.new("RGBA", (W, H), top + (255,))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        draw.line([(0, y), (W, y)], fill=blend(top, bottom, t) + (255,))
    for x in range(-W, W * 2, 155):
        draw.polygon(
            [(x, 0), (x + 42, 0), (x - 520, H), (x - 562, H)],
            fill=(255, 255, 255, 20),
        )
    return img


BG_LIGHT = make_bg((255, 251, 241), (234, 250, 241))
BG_DARK = make_bg((12, 14, 20), (0, 92, 63))
BG_BLUE = make_bg((246, 248, 255), (229, 255, 241))


def draw_brand(draw: ImageDraw.ImageDraw, dark: bool = False) -> None:
    color = WHITE if dark else BLACK
    dot = MINT if dark else EMERALD
    draw.rounded_rectangle((64, 56, 94, 86), radius=8, fill=dot)
    draw.text((108, 48), "canvasjob", font=font(38, "bold"), fill=color)


def text_size(text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = ImageDraw.Draw(Image.new("RGBA", (1, 1))).textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_text(
    frame: Image.Image,
    text: str,
    xy: tuple[float, float],
    size: int,
    color: tuple[int, ...] = BLACK,
    weight: str = "bold",
    alpha: float = 1.0,
    max_width: int | None = None,
    spacing: int = 8,
    align: str = "left",
) -> None:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    fnt = font(size, weight)
    words = text.split()
    lines: list[str] = []
    if max_width is None:
        lines = text.split("\n")
    else:
        current = ""
        for word in words:
            candidate = word if not current else f"{current} {word}"
            if text_size(candidate, fnt)[0] <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)

    x, y = xy
    fill = rgba(color, alpha)
    for line in lines:
        w, h = text_size(line, fnt)
        tx = x if align == "left" else x - w / 2 if align == "center" else x - w
        d.text((tx, y), line, font=fnt, fill=fill)
        y += h + spacing
    frame.alpha_composite(layer)


def chip(
    frame: Image.Image,
    text: str,
    xy: tuple[float, float],
    fill: tuple[int, ...],
    color: tuple[int, ...] = BLACK,
    alpha: float = 1.0,
) -> None:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    fnt = font(33, "bold")
    tw, th = text_size(text, fnt)
    x, y = xy
    box = (int(x), int(y), int(x + tw + 54), int(y + th + 34))
    d.rounded_rectangle(box, radius=28, fill=rgba(fill, alpha), outline=rgba(color, 0.08 * alpha), width=2)
    d.text((x + 27, y + 15), text, font=fnt, fill=rgba(color, alpha))
    frame.alpha_composite(layer)


def cover_image(path: Path, size: tuple[int, int], centering: tuple[float, float]) -> Image.Image:
    img = Image.open(path).convert("RGBA")
    return ImageOps.fit(img, size, method=Image.Resampling.LANCZOS, centering=centering)


def contain_image(path: Path, size: tuple[int, int]) -> Image.Image:
    img = Image.open(path).convert("RGBA")
    fitted = ImageOps.contain(img, size, method=Image.Resampling.LANCZOS)
    out = Image.new("RGBA", size, WHITE)
    out.alpha_composite(fitted, ((size[0] - fitted.width) // 2, (size[1] - fitted.height) // 2))
    return out


def make_card(
    path: Path,
    size: tuple[int, int],
    *,
    mode: str = "cover",
    centering: tuple[float, float] = (0.5, 0.5),
    radius: int = 34,
) -> Image.Image:
    content = contain_image(path, size) if mode == "contain" else cover_image(path, size, centering)
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    content.putalpha(mask)

    pad = 56
    card = Image.new("RGBA", (size[0] + pad * 2, size[1] + pad * 2), (0, 0, 0, 0))
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=(0, 0, 0, 82))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    card.alpha_composite(shadow, (pad, pad + 18))
    border = Image.new("RGBA", size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(border)
    bd.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=WHITE, outline=(20, 22, 28, 42), width=2)
    card.alpha_composite(border, (pad, pad))
    card.alpha_composite(content, (pad, pad))
    return card


def paste_card(
    frame: Image.Image,
    card: Image.Image,
    center: tuple[float, float],
    *,
    scale: float = 1.0,
    angle: float = 0.0,
    alpha: float = 1.0,
) -> None:
    img = card
    if scale != 1.0:
        img = img.resize((int(card.width * scale), int(card.height * scale)), Image.Resampling.LANCZOS)
    if angle:
        img = img.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    if alpha < 1.0:
        img = img.copy()
        a = img.getchannel("A").point(lambda p: int(p * alpha))
        img.putalpha(a)
    x = int(center[0] - img.width / 2)
    y = int(center[1] - img.height / 2)
    frame.alpha_composite(img, (x, y))


def swipe(frame: Image.Image, local: int, color: tuple[int, ...] = ORANGE) -> None:
    if local < 0 or local > 15:
        return
    p = ease_out(local / 15)
    x = int(lerp(-W * 1.2, W * 1.2, p))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.polygon([(x - 210, 0), (x + 120, 0), (x - 230, H), (x - 560, H)], fill=rgba(color, 0.86))
    d.polygon([(x + 130, 0), (x + 210, 0), (x - 140, H), (x - 220, H)], fill=(255, 255, 255, 170))
    frame.alpha_composite(layer)


def progress_bar(frame: Image.Image, frame_idx: int) -> None:
    d = ImageDraw.Draw(frame)
    x0, y0 = 64, H - 70
    x1 = W - 64
    d.rounded_rectangle((x0, y0, x1, y0 + 8), radius=4, fill=(0, 0, 0, 28))
    d.rounded_rectangle((x0, y0, x0 + int((x1 - x0) * frame_idx / (TOTAL_FRAMES - 1)), y0 + 8), radius=4, fill=EMERALD)


def floating_marks(frame: Image.Image, frame_idx: int, dark: bool) -> None:
    d = ImageDraw.Draw(frame)
    color = (255, 255, 255, 34) if dark else (0, 0, 0, 22)
    for i in range(7):
        y = (280 + i * 205 + frame_idx * (10 + i)) % H
        x = 40 + (i * 173) % (W - 120)
        d.line((x, y, x + 58, y - 58), fill=color, width=6)


def prepare_assets() -> dict[str, Image.Image]:
    return {
        "settings": make_card(SCREENSHOTS / "settings-filters.png", (900, 486), centering=(0.5, 0.08)),
        "side": make_card(SCREENSHOTS / "extension-right-panel.png", (700, 1036), centering=(0.5, 0.0)),
        "eval": make_card(SCREENSHOTS / "extension-filter-evaluation.png", (920, 326), centering=(0.5, 0.5)),
        "board": make_card(SCREENSHOTS / "website-board-view.png", (910, 536), centering=(0.5, 0.0)),
        "list": make_card(SCREENSHOTS / "website-list-view.png", (910, 456), centering=(0.5, 0.0)),
        "calendar": make_card(SCREENSHOTS / "website-calendar-view.png", (910, 578), centering=(0.5, 0.0)),
        "job": make_card(SCREENSHOTS / "website-job-page.png", (900, 684), centering=(0.5, 0.05)),
    }


def filter_video_frame(frame_idx: int, assets: dict[str, Image.Image]) -> Image.Image:
    scene = frame_idx
    dark = scene < 48 or scene >= 222
    frame = (BG_DARK if dark else BG_LIGHT).copy()
    floating_marks(frame, frame_idx, dark)
    d = ImageDraw.Draw(frame)
    draw_brand(d, dark=dark)

    if scene < 48:
        p = ease_out(scene / 34)
        draw_text(
            frame,
            "STOP READING JOBS THAT DON'T FIT",
            (64, lerp(360, 270, p)),
            88,
            WHITE,
            "bold",
            p,
            max_width=900,
            spacing=16,
        )
        draw_text(frame, "LinkedIn filters miss the details that matter.", (70, 600), 38, MINT, "bold", clamp((scene - 12) / 18), 820)
        for i, label in enumerate(["Remote?", "Salary?", "Visa?"]):
            cp = ease_out(clamp((scene - 16 - i * 5) / 14))
            chip(frame, label, (lerp(-260, 72 + i * 300, cp), 860 + i * 86), MINT if i != 1 else AMBER, BLACK, cp)
        d.rounded_rectangle((64, 1320, 1016, 1510), radius=46, fill=(255, 255, 255, 22), outline=(255, 255, 255, 60), width=2)
        draw_text(frame, "The right job should pass your rules before you read it.", (105, 1360), 38, WHITE, "bold", clamp((scene - 24) / 16), 820)
    elif scene < 102:
        local = scene - 48
        p = ease_out(local / 24)
        draw_text(frame, "Write the dealbreakers once", (64, 206), 72, BLACK, "bold", p, 900)
        draw_text(frame, "Plain-English filters for each role profile.", (68, 392), 38, MUTED, "bold", clamp((local - 7) / 16), 860)
        paste_card(frame, assets["settings"], (540, lerp(1330, 1115, p)), scale=0.98)
        for i, label in enumerate(["Remote in EU", "Salary above EUR 6k", "Visa sponsorship"]):
            chip(frame, label, (92, 1470 + i * 92), MINT if i != 1 else AMBER, BLACK, clamp((local - 18 - i * 4) / 12))
        swipe(frame, local)
    elif scene < 162:
        local = scene - 102
        p = ease_out(local / 25)
        draw_text(frame, "Open a job. canvasjob checks it.", (64, 150), 70, BLACK, "bold", p, 900)
        paste_card(frame, assets["job"] if "job" in assets else assets["board"], (lerp(115, 262, p), 1020), scale=0.78, angle=-3, alpha=0.95)
        paste_card(frame, assets["side"], (lerp(1180, 720, p), 1040), scale=0.72)
        d.rounded_rectangle((92, 1570, 988, 1718), radius=42, fill=(17, 18, 24, 238))
        for i, label in enumerate(["PASS", "FAIL", "UNKNOWN"]):
            x = 138 + i * 286
            color = EMERALD if label == "PASS" else ROSE if label == "FAIL" else BLUE
            d.ellipse((x, 1615, x + 32, 1647), fill=color)
            draw_text(frame, label, (x + 48, 1604), 34, WHITE, "bold", clamp((local - 12 - i * 5) / 13))
        swipe(frame, local)
    elif scene < 222:
        local = scene - 162
        p = ease_out(local / 20)
        draw_text(frame, "Evidence, not guesses", (64, 150), 76, BLACK, "bold", p, 880)
        draw_text(frame, "Each verdict comes with the exact line from the listing.", (68, 340), 38, MUTED, "bold", clamp((local - 8) / 16), 860)
        paste_card(frame, assets["side"], (540, 1032), scale=0.84)
        d.rounded_rectangle((102, 1350, 978, 1518), radius=36, fill=(255, 250, 238, 245), outline=(255, 151, 0, 170), width=3)
        draw_text(frame, "Salary not mentioned? It stays UNKNOWN.", (138, 1398), 38, BLACK, "bold", clamp((local - 15) / 18), 780)
        swipe(frame, local)
    else:
        local = scene - 222
        p = ease_out(local / 26)
        draw_text(frame, "Launch beta", (540, 300), 66, MINT, "bold", p, 900, align="center")
        draw_text(frame, "Filter jobs before they steal your afternoon.", (540, 470), 76, WHITE, "bold", p, 900, spacing=12, align="center")
        d.rounded_rectangle((170, 1090, 910, 1234), radius=48, fill=WHITE)
        draw_text(frame, "Add to Chrome - free", (540, 1130), 48, BLACK, "bold", p, 700, align="center")
        draw_text(frame, "canvasjob", (540, 1390), 82, WHITE, "bold", p, 800, align="center")
        chip(frame, "50 evals/month", (276, 1542), MINT, BLACK, clamp((local - 10) / 14))
        swipe(frame, local)

    progress_bar(frame, frame_idx)
    return frame


def tracker_video_frame(frame_idx: int, assets: dict[str, Image.Image]) -> Image.Image:
    scene = frame_idx
    dark = scene < 52 or scene >= 222
    frame = (BG_DARK if dark else BG_BLUE).copy()
    floating_marks(frame, frame_idx, dark)
    d = ImageDraw.Draw(frame)
    draw_brand(d, dark=dark)

    if scene < 52:
        p = ease_out(scene / 34)
        draw_text(frame, "YOUR JOB HUNT NEEDS ONE PLACE", (64, lerp(380, 286, p)), 86, WHITE, "bold", p, 900, spacing=14)
        draw_text(frame, "No more saved links, notes, and deadlines scattered everywhere.", (70, 690), 40, MINT, "bold", clamp((scene - 14) / 18), 850)
        for i, label in enumerate(["Saved", "Applied", "Interviewing", "Offer"]):
            chip(frame, label, (84 + (i % 2) * 440, 1040 + (i // 2) * 130), MINT if i != 2 else AMBER, BLACK, clamp((scene - 18 - i * 4) / 14))
    elif scene < 112:
        local = scene - 52
        p = ease_out(local / 22)
        draw_text(frame, "Track from the extension", (64, 150), 72, BLACK, "bold", p, 900)
        draw_text(frame, "One click sends promising roles to your dashboard.", (68, 334), 38, MUTED, "bold", clamp((local - 8) / 16), 860)
        paste_card(frame, assets["side"], (820, 1015), scale=0.68, alpha=0.98)
        paste_card(frame, assets["eval"], (420, lerp(1360, 1160, p)), scale=0.84, angle=-4)
        d.rounded_rectangle((96, 1484, 598, 1600), radius=38, fill=BLACK)
        draw_text(frame, "Track this job", (347, 1516), 42, WHITE, "bold", clamp((local - 14) / 15), 440, align="center")
        swipe(frame, local, EMERALD)
    elif scene < 172:
        local = scene - 112
        p = ease_out(local / 20)
        draw_text(frame, "Board. List. Calendar.", (64, 134), 74, BLACK, "bold", p, 900)
        draw_text(frame, "Switch views based on how you work today.", (68, 318), 38, MUTED, "bold", clamp((local - 8) / 16), 850)
        paste_card(frame, assets["board"], (540, lerp(1220, 760, p)), scale=0.98)
        paste_card(frame, assets["list"], (540, 1354), scale=0.74, alpha=clamp((local - 18) / 18))
        paste_card(frame, assets["calendar"], (540, 1618), scale=0.63, alpha=clamp((local - 28) / 18))
        swipe(frame, local, ORANGE)
    elif scene < 222:
        local = scene - 172
        p = ease_out(local / 22)
        draw_text(frame, "Remember every detail", (64, 152), 74, BLACK, "bold", p, 900)
        draw_text(frame, "Notes, deadlines, interviews, contacts, and the original description.", (68, 338), 38, MUTED, "bold", clamp((local - 8) / 16), 850)
        paste_card(frame, assets["job"], (540, lerp(1320, 1040, p)), scale=0.98)
        for i, label in enumerate(["Deadline", "Round 2", "Recruiter"]):
            chip(frame, label, (112 + i * 292, 1600), AMBER if i != 2 else MINT, BLACK, clamp((local - 18 - i * 4) / 12))
        swipe(frame, local, BLUE)
    else:
        local = scene - 222
        p = ease_out(local / 24)
        draw_text(frame, "Filter first.", (540, 340), 86, MINT, "bold", p, 900, align="center")
        draw_text(frame, "Track next.", (540, 450), 86, WHITE, "bold", p, 900, align="center")
        draw_text(frame, "Launch your job search from one clean flow.", (540, 710), 42, WHITE, "bold", clamp((local - 8) / 16), 830, align="center")
        d.rounded_rectangle((178, 1110, 902, 1252), radius=48, fill=WHITE)
        draw_text(frame, "Try canvasjob beta", (540, 1150), 48, BLACK, "bold", p, 700, align="center")
        chip(frame, "5 tracked jobs free", (294, 1440), MINT, BLACK, clamp((local - 11) / 14))
        swipe(frame, local, EMERALD)

    progress_bar(frame, frame_idx)
    return frame


def render_video(name: str, frame_fn, assets: dict[str, Image.Image]) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUT_DIR / f"{name}.mp4"
    tmp = Path(tempfile.mkdtemp(prefix=f"canvasjob-{name}-", dir="/private/tmp"))
    try:
        for idx in range(TOTAL_FRAMES):
            frame = frame_fn(idx, assets).convert("RGB")
            frame.save(tmp / f"frame_{idx:04d}.png", optimize=False)
            if idx % 45 == 0:
                print(f"{name}: rendered frame {idx}/{TOTAL_FRAMES}")
        subprocess.run(
            [
                "swift",
                "-module-cache-path",
                "/private/tmp/canvasjob-swift-module-cache",
                str(ENCODER),
                str(tmp),
                str(output),
                str(W),
                str(H),
                str(FPS),
                str(TOTAL_FRAMES),
            ],
            check=True,
        )
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return output


def main() -> None:
    assets = prepare_assets()
    videos = [
        render_video("canvasjob-launch-filter", filter_video_frame, assets),
        render_video("canvasjob-launch-tracker", tracker_video_frame, assets),
    ]
    for video in videos:
        print(video)


if __name__ == "__main__":
    main()
