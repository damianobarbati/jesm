# Jesm

Repro showing how to test and mock native ESM, jest-free.

The stupid [src/index.js](src/index.js) can easily be turned into an NPM package. 

To mock ESM modules we are using [quibble](https://www.npmjs.com/package/quibble).

To use additional features like spies and stubs we can use [sinon](https://sinonjs.org/releases/v12.0.1/). 

## How to try

```sh
nvm install
yarn install
yarn test
```

## References
- <https://gils-blog.tayar.org/posts/mock-all-you-want-supporting-esm-in-testdouble-js-mocking-library/>
