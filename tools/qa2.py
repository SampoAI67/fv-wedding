import sys, time, os
from playwright.sync_api import sync_playwright
W, H, tag = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
OUT = os.path.join(os.path.dirname(__file__), '..', 'qa')
with sync_playwright() as pw:
    b = pw.chromium.launch(channel='msedge')
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, is_mobile=W < 700, has_touch=W < 700)
    p = ctx.new_page()
    logs = []
    p.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
    p.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type == 'error' else None)
    p.goto('http://localhost:4340/', wait_until='networkidle')
    time.sleep(7.0)
    if W < 700: p.screenshot(path=os.path.join(OUT, f'{tag}-gate.png'))
    p.click('[data-gate-open]', force=True)
    time.sleep(8)
    if W < 700: p.screenshot(path=os.path.join(OUT, f'{tag}-hero.png'))
    for _ in range(8):
        p.mouse.wheel(0, 300); time.sleep(0.1)
    time.sleep(2.5)
    for i in range(int(sys.argv[4]) if len(sys.argv) > 4 else 12):
        p.mouse.wheel(0, 140); time.sleep(2.6)
        y = p.evaluate('Math.round(scrollY)')
        p.screenshot(path=os.path.join(OUT, f'{tag}-j{i:02d}.png'))
        print(i, y)
    print('\n'.join(logs) or 'no errors')
    b.close()
