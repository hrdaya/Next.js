import { describe, expect, test } from 'vitest';
import {
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isObject,
  isString,
} from '../../../utils/validation';

describe('Type Guard Functions', () => {
  describe('isString', () => {
    test('文字列でtrueを返す', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
    });
    test('文字列以外でfalseを返す', () => {
      expect(isString(123)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
    });
  });

  describe('isNumber', () => {
    test('数値でtrueを返す', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1.5)).toBe(true);
    });
    test('数値以外またはNaNでfalseを返す', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(Number.NaN)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    test('真偽値でtrueを返す', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });
    test('真偽値以外でfalseを返す', () => {
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe('isObject', () => {
    test('プレーンオブジェクトでtrueを返す', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });
    test('オブジェクト以外、null、配列でfalseを返す', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(() => {})).toBe(false);
    });
  });

  describe('isArray', () => {
    test('配列でtrueを返す', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2])).toBe(true);
    });
    test('配列以外でfalseを返す', () => {
      expect(isArray({})).toBe(false);
      expect(isArray('[]')).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe('isFunction', () => {
    test('関数でtrueを返す', () => {
      expect(isFunction(() => {})).toBe(true);
      const testFunc = () => {};
      expect(isFunction(testFunc)).toBe(true);
      expect(isFunction(Math.abs)).toBe(true);
    });
    test('関数以外でfalseを返す', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction([])).toBe(false);
      expect(isFunction('function')).toBe(false);
    });
  });
});
