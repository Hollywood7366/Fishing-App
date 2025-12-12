import argparse
import os
import random
import sys
import time
from pathlib import Path

from playwright.sync_api import TimeoutError, sync_playwright


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Capture slide images from Brooks Trading Course using Playwright.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--start-url",
        default="https://new-acc-space-15049.ispring.com/s/embed_player/a3c53a4e-7558-11ee-892d-2a3729bc322a",
        help="First slide URL to open after manual login.",
    )
    parser.add_argument(
        "--outdir",
        default="Brooks_Slides",
        help="Directory to save slide images.",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=10_000,
        help="Number of slides to attempt to capture.",
    )
    parser.add_argument(
        "--start-index",
        type=int,
        default=1,
        help="Starting index for slide numbering (resume support).",
    )
    parser.add_argument(
        "--selector",
        default='div[data-at="id=thumbnail"]',
        help="CSS selector for the slide element to screenshot (inside the slide iframe).",
    )
    parser.add_argument(
        "--next-timeout",
        type=int,
        default=8_000,
        help="Timeout (ms) for finding the Next button before stopping.",
    )
    return parser.parse_args()


def ensure_outdir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def should_skip(path: Path) -> bool:
    return path.exists() and path.stat().st_size > 0


def main() -> int:
    args = parse_args()
    outdir = Path(args.outdir)
    ensure_outdir(outdir)

    print(f"[info] Output directory: {outdir.resolve()}")
    print(f"[info] Starting URL: {args.start_url}")
    print("[info] Launching browser (headful)...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto(args.start_url, wait_until="load")
        print("[action] Log in manually if needed, then navigate to the first slide.")
        input("Press Enter after you are logged in and on the first slide...")

        # After manual navigation, ensure we are on the desired start URL.
        if page.url != args.start_url:
            print(f"[warn] Current page URL differs from start-url: {page.url}")

        for i in range(args.start_index, args.start_index + args.count):
            target_file = outdir / f"slide_{i}.png"

            if should_skip(target_file):
                print(f"[skip] {target_file} already exists; skipping.")
            else:
                try:
                    # Wait for the slide element inside the iframe.
                    # The selector should target the visible slide region.
                    locator = page.locator(args.selector)
                    locator.wait_for(state="visible", timeout=10_000)
                    locator.screenshot(path=str(target_file))
                    print(f"[save] slide {i} -> {target_file}")
                except TimeoutError:
                    print(f"[error] Slide element not found for slide {i}; stopping.")
                    break
                except Exception as exc:  # pragma: no cover - runtime guard
                    print(f"[error] Unexpected error on slide {i}: {exc}")
                    break

            # Attempt to click Next; if not found, stop.
            next_clicked = False
            try:
                next_btn = page.locator(".uikit-primary-button__button-text", has_text="Next")
                next_btn.click(timeout=args.next_timeout)
                next_clicked = True
            except TimeoutError:
                try:
                    fallback = page.get_by_text("Next")
                    fallback.click(timeout=args.next_timeout)
                    next_clicked = True
                except TimeoutError:
                    print("[info] Next button not found; assuming end of slides.")
                    break
                except Exception as exc:  # pragma: no cover
                    print(f"[error] Fallback Next click failed: {exc}")
                    break
            except Exception as exc:  # pragma: no cover
                print(f"[error] Next click failed: {exc}")
                break

            if next_clicked:
                delay = random.uniform(2.0, 4.0)
                print(f"[info] Next clicked; sleeping {delay:.2f}s to mimic human pacing.")
                time.sleep(delay)

        print("[done] Capture loop finished.")
        browser.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())




