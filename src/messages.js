import en_US from 'en_US.json'

/* Special characters: * - bold, | - line break */
export const VALUES = en_US;
export const MESSAGES = {};
for(let k in VALUES) MESSAGES[k] = k;
