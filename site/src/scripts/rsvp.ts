/*
  RSVP without a backend: the answer is composed into a WhatsApp message to the couple.
  While the number in content.ts still has X's, the form runs in demo mode (no message is sent).
*/
import { gsap } from 'gsap';

export function initRsvp(toast: (msg: string) => void, scrollTo: (el: HTMLElement) => void) {
  const form = document.querySelector<HTMLFormElement>('[data-rsvp]');
  if (!form) return;
  const letter = form.closest<HTMLElement>('.rsvp__letter')!;
  const guestsWrap = form.querySelector<HTMLElement>('[data-guests]')!;
  const out = form.querySelector<HTMLOutputElement>('output[name="guests"]')!;
  const err = form.querySelector<HTMLElement>('.rsvp__error')!;
  const done = letter.querySelector<HTMLElement>('.rsvp__done')!;
  let guests = 1;

  form.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((b) =>
    b.addEventListener('click', () => {
      guests = Math.min(8, Math.max(1, guests + Number(b.dataset.step)));
      out.value = String(guests);
    }),
  );

  form.addEventListener('change', () => {
    const coming = (form.elements.namedItem('coming') as RadioNodeList).value === 'yes';
    guestsWrap.classList.toggle('is-hidden', !coming);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    if (!name) {
      err.hidden = false;
      form.querySelector<HTMLInputElement>('input[name="name"]')!.focus();
      return;
    }
    err.hidden = true;
    const coming = data.get('coming') === 'yes';
    const diet = String(data.get('diet') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const couple = form.dataset.couple ?? '';

    const lines = [
      `Ciao ${couple}! Sono ${name}.`,
      coming ? `Rispondo alla chiamata: ci sarò! Saremo in ${guests}.` : 'Purtroppo non potrò esserci, ma brinderò a voi da lontano.',
      diet && coming ? `Allergie/intolleranze: ${diet}` : '',
      message ? `Messaggio: ${message}` : '',
    ].filter(Boolean);
    const text = lines.join('\n');

    const number = form.dataset.whatsapp ?? '';
    const demo = /x/i.test(number) || !number;
    if (!demo) window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');

    // seal the letter
    const stamp = letter.querySelector<HTMLElement>('.rsvp__stamp')!;
    const doneText = done.querySelector<HTMLElement>('[data-done-text]')!;
    doneText.textContent = coming
      ? `Grazie, ${name}! La Compagnia ti aspetta il 30 agosto.`
      : `Grazie, ${name}. Ci mancherai: brinderemo anche per te.`;
    gsap
      .timeline()
      .to(form, { opacity: 0, y: -10, duration: 0.4 })
      .add(() => {
        form.hidden = true;
        done.hidden = false;
        scrollTo(letter);
        done.focus({ preventScroll: true });
      })
      .from(done, { opacity: 0, y: 12, duration: 0.6 })
      .fromTo(
        stamp,
        { opacity: 0, scale: 2.4, rotate: -30 },
        { opacity: 1, scale: 1, rotate: -8, duration: 0.5, ease: 'power4.in' },
        '<',
      )
      .to(letter, { keyframes: { x: [0, -3, 2, 0] }, duration: 0.25 });

    if (demo) toast('Anteprima demo: il numero WhatsApp degli sposi non è ancora configurato, quindi nessun messaggio è stato inviato.');
  });
}
