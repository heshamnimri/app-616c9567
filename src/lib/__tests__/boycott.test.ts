import { checkBoycott } from '../boycott';

describe('checkBoycott', () => {
  it('flags a known boycotted brand from the bundled dataset', () => {
    const result = checkBoycott(['Coca Cola'], []);
    expect(result.isBoycotted).toBe(true);
    expect(result.matchType).toBe('brand');
  });

  it('matches brand names case-insensitively and ignoring punctuation', () => {
    const result = checkBoycott(['coca-cola'], []);
    expect(result.isBoycotted).toBe(true);
  });

  it('flags a known boycotted manufacturer/company', () => {
    const result = checkBoycott([], ['Nestle']);
    expect(result.isBoycotted).toBe(true);
    expect(result.matchType).toBe('company');
  });

  it('does not flag a brand absent from the dataset', () => {
    const result = checkBoycott(['Definitely Not A Real Brand XYZ123'], []);
    expect(result.isBoycotted).toBe(false);
  });

  it('returns not boycotted when no brands or manufacturers are given', () => {
    expect(checkBoycott([], [])).toEqual({ isBoycotted: false });
  });
});
