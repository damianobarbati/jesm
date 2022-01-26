/* eslint-disable jest/no-standalone-expect */
import expect from 'expect';
import { it, describe, beforeAll, afterAll } from '../src/index.js';
import { isEaster } from './date.js';

describe('date', () => {
  beforeAll(() => console.log('beforeAll date'));
  afterAll(() => console.log('afterAll date'));

  it('isEaster success', () => {
    const result = isEaster('2022-04-17');
    expect(result).toEqual(true);
  });

  it.skip('isEaster failure', () => {
    const result = isEaster('2021-04-17');
    expect(result).toEqual(true);
  });
});
