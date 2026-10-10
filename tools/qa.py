import sys, time, os
from playwright.sync_api import sync_playwright
W, H, tag = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
OUT = os.path.join(os.path.dirname(__file__), '..', 'qa')
def shot(p, name): p.screenshot(path=os.path.join(OUT, f'{tag}-{name}.png'))
with sync_playwright() as pw:
    b = pw.chromium.launch(channel='msedge')
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, is_mobile=W < 700, has_touch=W < 700)
    p = ctx.new_page()
    logs = []
    p.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
    p.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
    p.goto('http://localhost:4340/', wait_until='networkidle')
    time.sleep(1.6); shot(p, '01-gate-drawing')
    time.sleep(4.5); shot(p, '02-gate-ready')
    p.click('[data-gate-open]')
    time.sleep(1.4); shot(p, '03-runes-fire')
    time.sleep(1.4); shot(p, '04-doors-opening')
    time.sleep(1.6); shot(p, '05-into-light')
    time.sleep(3.2); shot(p, '06-hero')
    def wheel(px, n=1, pause=0.12):
        for _ in range(n):
            p.mouse.wheel(0, px); time.sleep(pause)
    # hero -> clouds
    wheel(300, 4); time.sleep(1.2); shot(p, '07-hero-rising')
    wheel(300, 6); time.sleep(1.5); shot(p, '08-clouds')
    # journey: step through with settle time so snap lands
    for i in range(14):
        wheel(H * 0.55, 1); time.sleep(2.2); shot(p, f'1{i:02d}-journey')
    wheel(H, 4); time.sleep(2); shot(p, '20-rsvp')
    wheel(H, 4); time.sleep(2); shot(p, '21-finale')
    print('\n'.join(logs) or 'no console errors')
    b.close()
