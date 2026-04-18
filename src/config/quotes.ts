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
    vibeLabel: 'Sarcastic — Friends energy',
    quote:
      'Could this BE any more obvious? If commitment had a loyalty program, you two would already be platinum with extra foam.',
    funny:
      'Translation: I would mock you more, but you are disgustingly cute and it ruins my bit.',
  },
  {
    vibe: 'modernFamily',
    vibeLabel: 'Loving — Modern Family energy',
    quote:
      'The best kind of family is the one you build on purpose — messy kitchens, loud laughter, and someone who saves you the last bite.',
    funny:
      'Phil Dunphy would call this “peerenting excellence.” I call it: you did good.',
  },
  {
    vibe: 'office',
    vibeLabel: 'Funny — The Office energy',
    quote:
      'Right now this is basically the Dundies if the Dundies were sincere and nobody spilled chili. You earned the good ending.',
    funny:
      'That’s what she said — and by “she” I mean the universe, and by “said” I mean “approved.”',
  },
];
