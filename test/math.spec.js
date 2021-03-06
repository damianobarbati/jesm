/* eslint-disable jest/no-standalone-expect */
import expect from 'expect';
import { test, it, describe, beforeAll, beforeEach, afterEach, afterAll, mockModule } from '../src/index.js';
import { sum, subtract } from './math.js';
import { MAGIC_NUMBER } from './subtract.js';

beforeAll(() => console.log('beforeAll'));
beforeEach(() => console.log('before'));
afterEach(() => console.log('after'));
afterAll(() => console.log('afterAll'));

describe('math', () => {
  beforeAll(() => console.log('beforeAll in describe'));
  beforeEach(() => console.log('beforeEach in describe'));
  afterEach(() => console.log('afterEach in describe'));
  afterAll(() => console.log('afterAll in describe'));

  it('sum', async () => {
    const actual = sum(1, 1);
    const expected = 2;
    expect(actual).toEqual(expected);
  });

  it('subtract', async () => {
    const actual = subtract(1, 1);
    const expected = 0;
    expect(actual).toEqual(expected);
    expect(MAGIC_NUMBER).toEqual(123);
  });
});

test('subtract mocked inline', async () => {
  // mock imports
  await mockModule('./subtract.js', (a, b) => a * b, { MAGIC_NUMBER: 666 });

  // import mocks
  const { subtract } = await import('./math.js');
  const { MAGIC_NUMBER } = await import('./subtract.js');

  const actual = subtract(2, 2);
  const expected = 4;
  expect(actual).toEqual(expected);
  expect(MAGIC_NUMBER).toEqual(666);

  // reset mocks
  mockModule.reset();
});

test('multiply mocked with .mock.js file', async () => {
  // mock imports
  await mockModule('./multiply.js');

  // import mocks
  const { multiply } = await import('./math.js');
  const { MAGIC_NUMBER } = await import('./multiply.js');

  const actual = multiply(3, 3);
  const expected = 27;
  expect(actual).toEqual(expected);
  expect(MAGIC_NUMBER).toEqual(2);

  // reset mocks
  mockModule.reset();
});

test('divide mocked with __mocks__ folder', async () => {
  // mock imports
  await mockModule('./divide.js');

  // import mocks
  const { divide } = await import('./math.js');
  const { MAGIC_NUMBER } = await import('./divide.js');

  const actual = divide(3, 3);
  const expected = 27;
  expect(actual).toEqual(expected);
  expect(MAGIC_NUMBER).toEqual(2);

  // reset mocks
  mockModule.reset();
});
