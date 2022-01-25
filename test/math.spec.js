import expect from 'expect';
import quibble from 'quibble';
import { test, run, beforeAll, beforeEach, afterEach, afterAll } from '../src/index.js';
import { sum, subtract } from './math.js';
import { MAGIC_NUMBER } from './subtract.js';

beforeAll(() => console.log('beforeAll'));
beforeEach(() => console.log('before'));
afterEach(() => console.log('after'));
afterAll(() => console.log('afterAll'));

test('sum', async () => {
  const actual = sum(1, 1);
  const expected = 2;
  expect(actual).toEqual(expected);
});

test('subtract', async () => {
  const actual = subtract(1, 1);
  const expected = 0;
  expect(actual).toEqual(expected);

  expect(MAGIC_NUMBER).toEqual(123);
});

test('subtract mocked', async () => {
  // mock imports
  await quibble.esm('./subtract.js', { MAGIC_NUMBER: 666 }, (a, b) => a * b);

  // import mocks
  const { subtract } = await import('./math.js');
  const { MAGIC_NUMBER } = await import('./subtract.js');

  const actual = subtract(2, 2);
  const expected = 4;
  expect(actual).toEqual(expected);

  expect(MAGIC_NUMBER).toEqual(666);

  // reset mocks
  quibble.reset();
});

await run();
