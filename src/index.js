import path from 'path';
import fsp from 'fs/promises';
import quibble from 'quibble';

const specs = [];
let before_all = Function.prototype;
let before_each = Function.prototype;
let after_each = Function.prototype;
let after_all = Function.prototype;

export const beforeAll = async (fn) => (before_all = fn);
export const beforeEach = async (fn) => (before_each = fn);
export const afterEach = async (fn) => (after_each = fn);
export const afterAll = async (fn) => (after_all = fn);

export const test = async (spec_name, fn) => specs.push({ spec_name, fn });
test.focus = async (spec_name, fn) => specs.push({ spec_name, fn, focus: true });
test.skip = async (spec_name, fn) => specs.push({ spec_name, fn, skip: true });

export const run = async () => {
  await before_all();

  let unskipped_focused_specs = specs.filter((spec) => !spec.skip);
  if (specs.find((spec) => spec.focus)) unskipped_focused_specs = specs.filter((spec) => spec.focus);

  for (const spec of unskipped_focused_specs) {
    const { spec_name, fn } = spec;

    try {
      await before_each();
      await fn();
    } catch (error) {
      console.error(`Spec ${spec_name} failed:`);
      console.error(error);
      spec.failure = error;
    } finally {
      await after_each();
    }
  }

  await after_all();
};

export const mockModule = async (import_path, default_import, named_imports) => {
  if (!import_path.startsWith('/')) throw new Error(`import_path must be an absolute path.`);

  // lookup for import in __mocks__ folder
  const useMockFolderFile = await (async (import_path) => {
    try {
      const mock_path = path.dirname(import_path) + '/__mocks__/' + path.basename(import_path);
      await fsp.access(mock_path);
      return mock_path;
    } catch {
      return false;
    }
  })(import_path);

  // lookup for import .mock.js file
  const useMockJSFile = await (async (import_path) => {
    try {
      const mock_path = path.dirname(import_path + '/') + '/' + path.basename(import_path, '.js') + '.mock.js';
      await fsp.access(mock_path);
      return mock_path;
    } catch {
      return false;
    }
  })(import_path);

  if (useMockJSFile) {
    const mocked_module = await import(useMockJSFile);
    const default_import = mocked_module.default;
    const { default: discard, ...named_imports } = mocked_module; // eslint-disable-line
    await quibble.esm(import_path, named_imports, default_import);
  } else if (useMockFolderFile) {
    const mocked_module = await import(useMockFolderFile);
    const default_import = mocked_module.default;

    const { default: discard, ...named_imports } = mocked_module; // eslint-disable-line
    await quibble.esm(import_path, named_imports, default_import);
  } else {
    await quibble.esm(import_path, named_imports, default_import);
  }
};

mockModule.reset = quibble.reset;
