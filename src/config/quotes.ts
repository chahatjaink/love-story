/**
 * Original lines written in the *spirit* of these shows (not verbatim script).
 * Pull order: 1 sarcastic → 2 loving → 3 funny.
 */
export type QuoteVibe = 'friends' | 'modernFamily' | 'office';

export interface SurprisePullQuote {
  vibe: QuoteVibe;
  /** Small UI label */
  vibeLabel: string;
  quote: string;
  funny: string;
}

export const surprisePullQuotes: SurprisePullQuote[] = [
  {
    vibe: 'friends',
    vibeLabel: 'Sarcastic',
    quote:
      'Could this BE any more us? If showing up counted as points, we would already be platinum.',
    funny:
      'Translation: I would mock you more, but you are disgustingly cute and it ruins my bit.',
  },
  {
    vibe: 'modernFamily',
    vibeLabel: 'Loving',
    quote:
      'The best kind of family is the one you build on purpose — messy kitchens, loud laughter, and someone who eats your last bite.',
    funny:
      'Half inside jokes, half stolen fries, zero perfect plans — and somehow it still turned out soft in the best way.',
  },
  {
    vibe: 'office',
    vibeLabel: 'Funny',
    quote:
      'Feels like the day the awkward meeting ends early and everyone is quietly happy for you — no agenda, just real.',
    funny:
      'That’s what she said — and by “she” I mean the universe, and by “said” I mean “approved.”',
  },
];
