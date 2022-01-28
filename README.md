# Jesm

Native ESM testing and mocking, jest-free:
- to mock ESM modules we are using [quibble](https://www.npmjs.com/package/quibble)
- to use additional features like spies and stubs you can use [sinon](https://sinonjs.org/releases/v12.0.1/)
- to use assertions you can use [expect](https://www.npmjs.com/package/expect)

Assumptions and limitations:
- nodejs >= 16 is required
- only `test`, `it`, `describe`, `beforeAll`, `beforeEach`, `afterEach`, `afterAll`, `mockModule` are supported (exported)
- only `testNamePattern`, `runTestsByPath` flags are supported
- only sequential running of test is supported (implicit `--runInBand`)
- no `describe` nested in `describe` support
- no coverage support
- **jesm** command must be run in the root of the package

## Usage

Run spec files:
```sh
yarn add --dev jesm
NODE_OPTIONS="--loader=quibble" yarn jesm *.spec.js
```

See [math.spec.js](./test/match.spec.js) example on how to use `mockModule`.

## mockModule

`mockModule` function can mock a module in 3 ways:
- inline providing of default export and named exports
- lookup of `.mock.js` file
- lookup of `__mocks__` folder

Examples:
```js
test('inline mock', async () => {
  // mock import
  await mockModule('./subtract.js', (a, b) => a * b, { MAGIC_NUMBER: 1 });

  // import mock, either a module importing the one mocked or importing directly the mocked one 
  const { subtract } = await import('./math.js');
  const { MAGIC_NUMBER } = await import('./subtract.js');

  const actual = subtract(2, 2);
  const expected = 4;
  expect(actual).toEqual(expected);
  expect(MAGIC_NUMBER).toEqual(666);
});

test('.mock.js file mock', async () => {
  // mock import
  await mockModule('./multiply.js');

  // import mock
  const { multiply } = await import('./math.js');
  const { MAGIC_NUMBER } = await import('./multiply.js');

  const actual = multiply(3, 3);
  const expected = 27;
  expect(actual).toEqual(expected);
  expect(MAGIC_NUMBER).toEqual(2);

  // reset mocks
  mockModule.reset();
});

test('__mocks__ folder mock', async () => {
  // mock import
  await mockModule('./divide.js');

  // import mock
  const { divide } = await import('./math.js');
  const { MAGIC_NUMBER } = await import('./divide.js');

  const actual = divide(3, 3);
  const expected = 27;
  expect(actual).toEqual(expected);
  expect(MAGIC_NUMBER).toEqual(2);

  // reset mocks
  mockModule.reset();
});
```

## Webstorm support

Copy the `.jest-run` folder inside your root before running any spec with the run/debug button.
Remember to properly set your `NODE_ENV=xxx` variable.

## Notes

Thanks to Gil Tayar and its blog post [here](https://gils-blog.tayar.org/posts/mock-all-you-want-supporting-esm-in-testdouble-js-mocking-library/).