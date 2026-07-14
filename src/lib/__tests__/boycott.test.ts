import { checkBoycott } from '../boycott';

describe('checkBoycott', () => {
  it('flags a known boycotted brand from the bundled dataset', () => {
    const result = checkBoycott(['Coca Cola'], []);
    expect(result.status).toBe('boycotted');
    expect(result.matchType).toBe('brand');
  });

  it('matches brand names case-insensitively and ignoring punctuation', () => {
    const result = checkBoycott(['coca-cola'], []);
    expect(result.status).toBe('boycotted');
  });

  it('flags a known boycotted manufacturer/company', () => {
    const result = checkBoycott([], ['Nestle']);
    expect(result.status).toBe('boycotted');
    expect(result.matchType).toBe('company');
  });

  it('returns unknown status for a brand absent from the dataset', () => {
    const result = checkBoycott(['Definitely Not A Real Brand XYZ123'], []);
    expect(result.status).toBe('unknown');
  });

  it('returns unknown status when no brands or manufacturers are given', () => {
    expect(checkBoycott([], [])).toEqual({ status: 'unknown' });
  });
});
