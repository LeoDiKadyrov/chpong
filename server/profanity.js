/**
 * Server-side profanity filter
 * Same as client version but imported server-side
 */

const BLOCKED_WORDS = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'cunt',
  'dick',
  'pussy',
  'bastard',
  'damn',
  'piss',
  'asshole',
];

/**
 * Filter profanity from a message
 * @param {string} text - Raw message text
 * @returns {string} Filtered message with bad words replaced by ***
 */
export function filterMessage(text) {
  if (!text || typeof text !== 'string') return text;

  let result = text;
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, '***');
  }
  return result;
}
