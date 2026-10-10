/*
  Every piece of copy lives here so the couple's real details can be swapped in one place.
  Anything marked PLACEHOLDER was invented for the demo and MUST be confirmed with the client
  before the site is shared with guests.
*/

export const COUPLE = {
  bride: 'Federica',
  groom: 'Valentino',
  monogram: 'F·V',
};

export const WEDDING = {
  /** ISO date-time of the ceremony (Europe/Rome, CEST = +02:00). The time is a PLACEHOLDER. */
  iso: '2027-08-30T16:00:00+02:00',
  dateLong: 'Lunedì 30 agosto 2027',
  dateShort: '30 · 08 · 2027',
  venue: 'Ristorante «La Betulla»',
  town: 'Serle (BS)',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ristorante+La+Betulla+Serle+BS',
};

export const GATE = {
  kicker: 'Le Porte della Compagnia',
  riddle: 'Dite, amici, ed entrate.',
  hint: 'Pronuncia la parola elfica che significa «amico»',
  password: 'Mellon',
};

export const HERO = {
  kicker: 'Save the date',
  cue: 'Inizia il viaggio',
};

/** The guest travels the map; each stop is one part of the invitation. */
export const STOPS = {
  contea: {
    chapter: 'Capitolo I',
    place: 'La Contea dei Due Sorrisi',
    title: 'Una Compagnia di due',
    text: 'C’era una volta, e c’è ancora, una storia cominciata con due sorrisi. Ora Federica e Valentino partono per l’avventura più grande, e nessuna impresa si compie senza la sua Compagnia.',
    invite: 'Per questo ti invitano a celebrare con loro il giorno del loro matrimonio.',
  },
  luna: {
    chapter: 'Capitolo II',
    place: 'Il Colle della Luna',
    moonLetters: 'Ci vediamo sotto la luna d’agosto',
    note: 'al giorno in cui la Compagnia si riunirà',
  },
  fuochi: {
    chapter: 'Capitolo III',
    place: 'I Monti dei Fuochi',
    title: 'Accendete i fuochi',
    /** PLACEHOLDER: the whole programme (times + titles) is invented for the demo. */
    items: [
      { time: '15:30', title: 'Il raduno della Compagnia', text: 'Arrivo degli ospiti' },
      { time: '16:00', title: 'Il giuramento', text: 'La cerimonia' },
      { time: '17:30', title: 'Un brindisi alla Contea', text: 'Aperitivo in giardino' },
      { time: '20:00', title: 'Il banchetto', text: 'Perché un pasto solo non basta mai' },
      { time: '23:00', title: 'Danze sotto le stelle', text: 'Torta, musica e festa' },
    ],
  },
  bosco: {
    chapter: 'Capitolo IV',
    place: 'Il Bosco delle Betulle',
    text: 'Sull’altopiano sopra Serle, tra le betulle, la Compagnia si riunirà.',
    cta: 'Apri in Google Maps',
  },
  fine: {
    title: 'Il viaggio è tracciato',
    text: 'Manca solo una cosa: la tua risposta.',
    cta: 'Rispondi alla chiamata',
  },
};

/** PLACEHOLDER: deadline + WhatsApp number. While the X's are in place the form runs in demo mode. */
export const RSVP = {
  chapter: 'Capitolo V',
  title: 'Rispondi alla chiamata',
  intro: 'Gli sposi chiamano a raccolta la loro Compagnia.',
  deadline: '30 giugno 2027',
  whatsapp: '39XXXXXXXXXX',
};

export const FINALE = {
  line: 'E vissero felici e contenti, fino alla fine dei loro giorni.',
  farewell: 'Namárië',
  farewellGloss: 'addio, in lingua elfica: a presto, alla festa',
};

/* Elder Futhark transliteration, the same rune family as the printed save-the-date. */
const RUNES: Record<string, string> = {
  a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ', i: 'ᛁ', j: 'ᛃ', k: 'ᚲ', l: 'ᛚ', m: 'ᛗ',
  n: 'ᚾ', o: 'ᛟ', p: 'ᛈ', q: 'ᚲ', r: 'ᚱ', s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚹ', w: 'ᚹ', x: 'ᚲᛊ', y: 'ᛃ', z: 'ᛉ',
};

export function toRunes(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split('')
    .map((ch) => (ch === ' ' ? ' ᛫ ' : (RUNES[ch] ?? ch)))
    .join('');
}

export const RUNE_NAMES = toRunes(`${COUPLE.bride} ${COUPLE.groom}`);
export const RUNE_ARCH = toRunes(`${COUPLE.bride} e ${COUPLE.groom} trenta agosto`);
