import time, os
from playwright.sync_api import sync_playwright
OUT = os.path.join(os.path.dirname(__file__), '..', 'qa')
with sync_playwright() as pw:
    b = pw.chromium.launch(channel='msedge')
    for rm in ('no-preference',):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion=rm)
        p = ctx.new_page(); errs = []
        p.on('pageerror', lambda e: errs.append(str(e)))
        p.goto('http://localhost:4340/', wait_until='networkidle'); time.sleep(1.5)
        p.click('[data-gate-open]', force=True); time.sleep(7 if rm == 'no-preference' else 1.5)
        p.click('.header-rsvp'); time.sleep(3.5)
        p.screenshot(path=os.path.join(OUT, f'R-{rm}-1.png'))
        p.fill('input[name="name"]', 'Mario Rossi')
        p.click('[data-step="1"]'); p.click('[data-step="1"]')
        p.fill('input[name="diet"]', 'senza lattosio')
        p.click('.rsvp__send'); time.sleep(1.6)
        p.screenshot(path=os.path.join(OUT, f'R-{rm}-2.png'))
        print(rm, 'guests=', p.inner_text('output[name="guests"]'), 'toast=', p.evaluate("[document.querySelector('[data-toast]').textContent.slice(0,50), document.querySelector('[data-toast]').className]"), 'errors=', errs)
        ctx.close()
    b.close()
