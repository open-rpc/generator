import { describe, it, expect } from '@jest/globals';
import {
  normalizeMethodNameJavascript,
  normalizeMethodNameRust,
  extractParameterNames,
} from './helper';

describe('Test normalizeMethodNameJavascript', () => {
  it('returns the original name if it does not contain a dot', () => {
    expect(normalizeMethodNameJavascript('hello')).toBe('hello');
    expect(normalizeMethodNameJavascript('foo_bar')).toBe('foo_bar');
  });

  it('splits and capitalizes correctly with dot', () => {
    expect(normalizeMethodNameJavascript('foo.bar')).toBe('fooBar');
    expect(normalizeMethodNameJavascript('foo.bar.baz')).toBe('fooBarBaz');
  });

  it('capitalizes only subsequent parts', () => {
    expect(normalizeMethodNameJavascript('one.two.three')).toBe('oneTwoThree');
  });

  it('handles leading/trailing separators gracefully', () => {
    expect(normalizeMethodNameJavascript('.foo.bar')).toBe('FooBar');
    expect(normalizeMethodNameJavascript('foo.bar.')).toBe('fooBar');
    expect(normalizeMethodNameJavascript('..foo..bar..')).toBe('FooBar');
  });

  it('handles empty string', () => {
    expect(normalizeMethodNameJavascript('')).toBe('');
  });
});

describe('Test normalizeMethodNameRust', () => {
  it('returns the original name if it does not contain a dot', () => {
    expect(normalizeMethodNameRust('hello')).toBe('hello');
    expect(normalizeMethodNameRust('foo_bar')).toBe('foo_bar');
  });

  it('splits and capitalizes correctly with dot', () => {
    expect(normalizeMethodNameRust('foo.bar')).toBe('foo_bar');
    expect(normalizeMethodNameRust('foo.bar.baz')).toBe('foo_bar_baz');
  });

  it('capitalizes only subsequent parts', () => {
    expect(normalizeMethodNameRust('one.two.three')).toBe('one_two_three');
  });

  it('handles leading/trailing separators gracefully', () => {
    expect(normalizeMethodNameRust('.foo.bar')).toBe('foo_bar');
    expect(normalizeMethodNameRust('foo.bar.')).toBe('foo_bar');
    expect(normalizeMethodNameRust('..foo..bar..')).toBe('foo_bar');
  });

  it('handles empty string', () => {
    expect(normalizeMethodNameRust('')).toBe('');
  });
});

describe('Test extractParameterNames', () => {
  it('extracts parameter names from a string with types', () => {
    expect(extractParameterNames('number:int, address: string')).toEqual(['number', 'address']);
    expect(extractParameterNames('id:number, name:string, active:boolean')).toEqual([
      'id',
      'name',
      'active',
    ]);
  });

  it('handles single parameter', () => {
    expect(extractParameterNames('value:string')).toEqual(['value']);
  });

  it('handles parameters without types', () => {
    expect(extractParameterNames('param1, param2, param3')).toEqual(['param1', 'param2', 'param3']);
  });

  it('handles mixed parameters with and without types', () => {
    expect(extractParameterNames('id:number, name, active:boolean')).toEqual([
      'id',
      'name',
      'active',
    ]);
  });

  it('handles empty string', () => {
    expect(extractParameterNames('')).toEqual([]);
  });

  it('handles string with only whitespace', () => {
    expect(extractParameterNames('   ')).toEqual([]);
  });

  it('handles parameters with extra whitespace', () => {
    expect(extractParameterNames('  number : int  ,  address : string  ')).toEqual([
      'number',
      'address',
    ]);
  });

  it('filters out empty parameter names', () => {
    expect(extractParameterNames('valid:type, , another:type')).toEqual(['valid', 'another']);
  });
});
