import { normalizeMethodName } from './helper';

describe('normalizeMethodName', () => {
  it('returns the original name if it does not contain a dot', () => {
    expect(normalizeMethodName('hello')).toBe('hello');
    expect(normalizeMethodName('foo_bar')).toBe('foo_bar');
  });

  it('splits and capitalizes correctly with dot', () => {
    expect(normalizeMethodName('foo.bar')).toBe('fooBar');
    expect(normalizeMethodName('foo.bar.baz')).toBe('fooBarBaz');
  });

  it('handles both dots and underscores', () => {
    expect(normalizeMethodName('foo_bar.baz_qux')).toBe('fooBarBazQux');
  });

  it('capitalizes only subsequent parts', () => {
    expect(normalizeMethodName('hello.world')).toBe('helloWorld');
    expect(normalizeMethodName('one.two.three')).toBe('oneTwoThree');
  });

  it('handles leading/trailing separators gracefully', () => {
    expect(normalizeMethodName('.foo.bar')).toBe('FooBar');
    expect(normalizeMethodName('foo.bar.')).toBe('fooBar');
    expect(normalizeMethodName('..foo..bar..')).toBe('FooBar');
  });

  it('handles empty string', () => {
    expect(normalizeMethodName('')).toBe('');
  });
});
