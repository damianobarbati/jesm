# Jesm

Native ESM testing and mocking, jest-free:
- to mock ESM modules we are using [quibble](https://www.npmjs.com/package/quibble)
- to use additional features like spies and stubs you can use [sinon](https://sinonjs.org/releases/v12.0.1/)
- to use assertions you can use [expect](https://www.npmjs.com/package/expect)

Assumptions:
- nodejs >= 16 is required
- only `test`, `it`, `describe`, `beforeAll`, `beforeEach`, `afterEach`, `afterAll`, `mockModule` are supported (exported)
- only `testNamePattern`, `runTestsByPath` flags are supported
- only sequential running of test is supported (implicit `--runInBand`)
- **jesm** command must be run in the root of the package

## How to use

Run spec files:
```sh
yarn add --dev jesm
NODE_OPTIONS="--loader=quibble" yarn jesm *.spec.js
```

See (math.spec.js)[./test/match.spec.js] example on how to use `mockModule`.

## Webstorm support

Copy the `.jest-run` folder inside your root before running any spec with the run/debug button.

## References
- <https://gils-blog.tayar.org/posts/mock-all-you-want-supporting-esm-in-testdouble-js-mocking-library/>