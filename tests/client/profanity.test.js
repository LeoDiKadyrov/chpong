/**
 * profanity.test.js — Unit tests for client/src/game/profanity.js
 */

import { describe, it, expect } from 'vitest';
import { filterMessage } from '../../client/src/game/profanity.js';

describe('filterMessage', () => {
  it('returns clean text unchanged', () => {
    expect(filterMessage('Hello there!')).toBe('Hello there!');
  });

  it('replaces a blocked word with ***', () => {
    expect(filterMessage('what the fuck')).toBe('what the ***');
  });

  it('is case-insensitive — FUCK is replaced', () => {
    expect(filterMessage('FUCK this')).toBe('*** this');
  });

  it('is case-insensitive — mixed case is replaced', () => {
    expect(filterMessage('Shit happens')).toBe('*** happens');
  });

  it('respects word boundaries — "assignment" is NOT filtered', () => {
    expect(filterMessage('assignment')).toBe('assignment');
  });

  it('replaces multiple blocked words in one message', () => {
    const result = filterMessage('fuck and shit');
    expect(result).toBe('*** and ***');
  });

  it('returns an empty string unchanged', () => {
    expect(filterMessage('')).toBe('');
  });
});
