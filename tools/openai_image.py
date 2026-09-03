#!/usr/bin/env python3
"""
openai_image.py — generate David Craft Beer artwork from the OpenAI Images API.

Standard library only: no `pip install` needed.

    python tools/openai_image.py "Hopper raising a pint on a rooftop" -o assets/hopper-toast.png

By default the brand's house style from design-system.md is prepended to your
prompt, so generated art matches the flat vintage-print look instead of the
photoreal default. Pass --raw to send your prompt untouched.

Reference images (style-match an existing asset, or restyle one):

    python tools/openai_image.py "same character, waving" -o assets/hopper-wave.png \\
        --ref assets/hopper-hero.png

Setup — the API key is NOT your ChatGPT subscription. Create one at
https://platform.openai.com/api-keys (billed separately, per image), then:

    PowerShell (this session):  $env:OPENAI_API_KEY = "sk-..."
    PowerShell (permanent):     setx OPENAI_API_KEY "sk-..."
"""

import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request
import uuid

API_ROOT = "https://api.openai.com/v1"

# Lifted from design-system.md > Media. Keep in sync if the brief changes.
HOUSE_STYLE = (
    "Flat vintage-print illustration. Cream paper background (#FCE4CD), flat "
    "shapes, cocoa ink linework (#572010), accents drawn from honey #FFC24B, "
    "amber #B23A27, teal #2F8577. Slight vintage print misregistration is "
    "welcome. Strictly no photorealism, no 3D render look, no gradients, no "
    "drop shadows inside the artwork, no lettering or text in the image. "
    "Subject: "
)

# gpt-image-2 geometry rules, from the API guide.
MIN_PIXELS, MAX_PIXELS, MAX_EDGE = 655_360, 8_294_400, 3840


def die(msg, code=1):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(code)


def api_key():
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        die(
            "OPENAI_API_KEY is not set.\n\n"
            "  This is an OpenAI *API* key, which is separate from a ChatGPT\n"
            "  subscription and billed per image. Create one at:\n"
            "      https://platform.openai.com/api-keys\n\n"
            "  Then, in PowerShell:\n"
            '      $env:OPENAI_API_KEY = "sk-..."        (this session)\n'
            '      setx OPENAI_API_KEY "sk-..."          (permanent)'
        )
    return key


def check_size(size):
    """Warn early rather than paying for a 400 from the API."""
    if size == "auto" or "x" not in size:
        return
    try:
        w, h = (int(v) for v in size.lower().split("x", 1))
    except ValueError:
        die(f"--size must look like 1536x1024 or 'auto', got {size!r}")
    problems = []
    if w % 16 or h % 16:
        problems.append("both edges must be multiples of 16")
    if max(w, h) > MAX_EDGE:
        problems.append(f"longest edge must be <= {MAX_EDGE}")
    if not MIN_PIXELS <= w * h <= MAX_PIXELS:
        problems.append(f"total pixels must be between {MIN_PIXELS:,} and {MAX_PIXELS:,}")
    if max(w, h) / min(w, h) > 3:
        problems.append("aspect ratio must not exceed 3:1")
    if problems:
        die(f"size {size} is invalid for this model: " + "; ".join(problems))


def post(url, data, headers):
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        try:
            detail = json.loads(body)["error"]["message"]
        except Exception:
            detail = body[:600]
        die(f"HTTP {e.code} from the API — {detail}")
    except urllib.error.URLError as e:
        die(f"could not reach api.openai.com — {e.reason}")


def build_multipart(fields, files):
    """Minimal multipart/form-data encoder for the edits endpoint."""
    boundary = "----dcb" + uuid.uuid4().hex
    out = bytearray()
    for name, value in fields.items():
        if value is None:
            continue
        out += f"--{boundary}\r\n".encode()
        out += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        out += f"{value}\r\n".encode()
    for name, path in files:
        ctype = mimetypes.guess_type(path)[0] or "application/octet-stream"
        with open(path, "rb") as fh:
            blob = fh.read()
        out += f"--{boundary}\r\n".encode()
        out += (
            f'Content-Disposition: form-data; name="{name}"; '
            f'filename="{os.path.basename(path)}"\r\n'
        ).encode()
        out += f"Content-Type: {ctype}\r\n\r\n".encode()
        out += blob + b"\r\n"
    out += f"--{boundary}--\r\n".encode()
    return bytes(out), f"multipart/form-data; boundary={boundary}"


def save(entry, path):
    """gpt-image-* returns base64; dall-e may return a URL. Handle both."""
    if entry.get("b64_json"):
        blob = base64.b64decode(entry["b64_json"])
    elif entry.get("url"):
        with urllib.request.urlopen(entry["url"], timeout=300) as r:
            blob = r.read()
    else:
        die("the API response contained no image data")
    os.makedirs(os.path.dirname(os.path.abspath(path)) or ".", exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(blob)
    return len(blob)


def numbered(path, i, total):
    if total == 1:
        return path
    stem, ext = os.path.splitext(path)
    return f"{stem}-{i + 1}{ext}"


def main():
    ap = argparse.ArgumentParser(
        description="Generate David Craft Beer artwork via the OpenAI Images API.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split("Setup —")[0].strip(),
    )
    ap.add_argument("prompt", help="what to draw")
    ap.add_argument("-o", "--out", required=True, help="output path, e.g. assets/thing.png")
    ap.add_argument("-m", "--model", default="gpt-image-2",
                    help="gpt-image-2 (default), gpt-image-1.5, gpt-image-1, gpt-image-1-mini")
    ap.add_argument("-s", "--size", default="1024x1024",
                    help="WIDTHxHEIGHT or auto (default 1024x1024)")
    ap.add_argument("-q", "--quality", default="high",
                    choices=["low", "medium", "high", "auto"], help="default high")
    ap.add_argument("-n", "--count", type=int, default=1, help="how many images (default 1)")
    ap.add_argument("--background", choices=["transparent", "opaque", "auto"],
                    help="transparent needs a png or webp output")
    ap.add_argument("--ref", action="append", default=[], metavar="PATH",
                    help="reference image; repeatable, up to 16 (uses the edits endpoint)")
    ap.add_argument("--raw", action="store_true",
                    help="send the prompt without the house style preamble")
    ap.add_argument("--dry-run", action="store_true",
                    help="print the assembled request and exit without spending anything")
    args = ap.parse_args()

    check_size(args.size)
    prompt = args.prompt if args.raw else HOUSE_STYLE + args.prompt
    fmt = os.path.splitext(args.out)[1].lstrip(".").lower() or "png"
    if fmt == "jpg":
        fmt = "jpeg"
    if fmt not in ("png", "jpeg", "webp"):
        die(f"output extension .{fmt} is not supported; use .png, .jpg or .webp")
    if args.background == "transparent" and fmt == "jpeg":
        die("--background transparent needs a .png or .webp output, not .jpg")

    for p in args.ref:
        if not os.path.isfile(p):
            die(f"reference image not found: {p}")
    if len(args.ref) > 16:
        die("at most 16 reference images are accepted")

    endpoint = "edits" if args.ref else "generations"

    if args.dry_run:
        print(f"endpoint : POST {API_ROOT}/images/{endpoint}")
        print(f"model    : {args.model}")
        print(f"size     : {args.size}   quality: {args.quality}   n: {args.count}")
        print(f"format   : {fmt}" + (f"   background: {args.background}" if args.background else ""))
        if args.ref:
            print("refs     : " + ", ".join(args.ref))
        print(f"out      : {args.out}")
        print(f"\nprompt ({len(prompt)} chars):\n{prompt}")
        return

    headers = {"Authorization": f"Bearer {api_key()}"}

    if args.ref:
        fields = {
            "model": args.model,
            "prompt": prompt,
            "n": str(args.count),
            "size": args.size,
            "quality": args.quality,
            "output_format": fmt,
        }
        if args.background:
            fields["background"] = args.background
        body, ctype = build_multipart(fields, [("image[]", p) for p in args.ref])
        headers["Content-Type"] = ctype
    else:
        payload = {
            "model": args.model,
            "prompt": prompt,
            "n": args.count,
            "size": args.size,
            "quality": args.quality,
            "output_format": fmt,
        }
        if args.background:
            payload["background"] = args.background
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    print(f"requesting {args.count} image(s) from {args.model} at {args.size}...")
    res = post(f"{API_ROOT}/images/{endpoint}", body, headers)

    data = res.get("data") or []
    if not data:
        die("the API returned no images")
    for i, entry in enumerate(data):
        path = numbered(args.out, i, len(data))
        print(f"  wrote {path}  ({save(entry, path):,} bytes)")

    usage = res.get("usage") or {}
    if usage:
        print(f"tokens: {usage.get('input_tokens', '?')} in, "
              f"{usage.get('output_tokens', '?')} out")


if __name__ == "__main__":
    main()
