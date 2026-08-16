const ADJ = [
  "Night-",
  "Lost",
  "Gentle",
  "Silent",
  "Radiant",
  "Lazy",
  "Brave",
  "Sleepless",
  "Heart-stealing",
  "Strolling",
  "Tipsy",
  "Wind-chasing",
];
const NOUN = [
  "Cat",
  "Whale",
  "Deer",
  "Courier",
  "Cloud",
  "Traveler",
  "Star",
  "Bear",
  "Robin",
  "Moon",
  "Firefly",
  "Chime",
];

export function randomCodename(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${a}${n}${num}`;
}
