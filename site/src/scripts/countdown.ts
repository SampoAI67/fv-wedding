export function initCountdown() {
  const el = document.querySelector<HTMLElement>('[data-countdown]');
  if (!el) return;
  const target = new Date(el.dataset.countdown!).getTime();
  const unit = (u: string) => el.querySelector<HTMLElement>(`[data-unit="${u}"]`)!;
  const [d, h, m, s] = ['d', 'h', 'm', 's'].map(unit);
  const pad = (n: number) => String(n).padStart(2, '0');

  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const sec = Math.floor(diff / 1000);
    d.textContent = String(Math.floor(sec / 86400));
    h.textContent = pad(Math.floor((sec % 86400) / 3600));
    m.textContent = pad(Math.floor((sec % 3600) / 60));
    s.textContent = pad(sec % 60);
  };
  tick();
  setInterval(tick, 1000);
}
