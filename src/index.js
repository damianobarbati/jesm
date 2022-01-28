import path from 'path';
import fsp from 'fs/promises';
import { AsyncLocalStorage } from 'async_hooks';
import { set, filter, groupBy } from 'lodash-es';
import quibble from 'quibble';
import treeify from 'treeify';

const asyncLocalStorage = new AsyncLocalStorage();
export const specs = [];

const before_alls = [];
const before_eaches = [];
const after_eaches = [];
const after_alls = [];

export const beforeAll = async (fn) => {
  const { describe_name = 'default' } = asyncLocalStorage.getStore() || {};
  const file_name = getCallerFile();
  before_alls.push({ file_name, describe_name, fn });
};

export const beforeEach = async (fn) => {
  const { describe_name = 'default' } = asyncLocalStorage.getStore() || {};
  const file_name = getCallerFile();
  before_eaches.push({ file_name, describe_name, fn });
};

export const afterEach = async (fn) => {
  const { describe_name = 'default' } = asyncLocalStorage.getStore() || {};
  const file_name = getCallerFile();
  after_eaches.push({ file_name, describe_name, fn });
};

export const afterAll = async (fn) => {
  const { describe_name = 'default' } = asyncLocalStorage.getStore() || {};
  const file_name = getCallerFile();
  after_alls.push({ file_name, describe_name, fn });
};

export const test = async (spec_name, fn) => {
  const { describe_name = 'default' } = asyncLocalStorage.getStore() || {};
  const file_name = getCallerFile();
  specs.push({ file_name, describe_name, spec_name, fn });
};

test.focus = async (spec_name, fn) => {
  const { describe_name = 'default' } = asyncLocalStorage.getStore() || {};
  const file_name = getCallerFile();
  specs.push({ file_name, describe_name, spec_name, fn, focus: true });
};

test.skip = async (spec_name, fn) => {
  const { describe_name = 'default' } = asyncLocalStorage.getStore() || {};
  const file_name = getCallerFile();
  specs.push({ file_name, describe_name, spec_name, fn, skip: true });
};

export const it = test;

export const describe = (describe_name, fn) => asyncLocalStorage.run({ describe_name }, fn);

export const run = async ({ testNamePattern, runTestsByPath }) => {
  const describes = groupBy(specs, 'describe_name');

  for (const [describe_name, specs] of Object.entries(describes)) {
    const before_all = filter(before_alls, { describe_name }).map((v) => v.fn);
    const before_each = filter(before_eaches, { describe_name }).map((v) => v.fn);
    const after_each = filter(after_eaches, { describe_name }).map((v) => v.fn);
    const after_all = filter(after_alls, { describe_name }).map((v) => v.fn);

    const specs_to_run = specs.filter((spec) => {
      const describe_spec_name = spec.describe_name !== 'default' ? `${spec.describe_name} ${spec.spec_name}` : spec.spec_name;
      const testNamePattern_is_respected = testNamePattern ? describe_spec_name.match(new RegExp(testNamePattern)) : true;
      const runTestsByPath_is_respected = runTestsByPath ? spec.file_name.match(new RegExp(runTestsByPath)) : true;
      const result = testNamePattern_is_respected && runTestsByPath_is_respected;
      return result;
    });

    await runDescribe(specs_to_run, { before_all, before_each, after_each, after_all });
  }

  const report = {};
  for (const spec of specs) {
    let outcome;
    if (spec.success) outcome = `✅`;
    else if (spec.error) outcome = `❌ ${spec.error.stack}`;
    if (outcome) set(report, `["${spec.file_name}"]["${spec.describe_name}"]["${spec.spec_name}"]`, outcome);
  }

  console.log(treeify.asTree(report, true));

  const exit_code = specs.find((spec) => spec.error) ? 1 : 0;
  process.exit(exit_code);
};

export const runDescribe = async (specs, { before_all, before_each, after_each, after_all }) => {
  for (const fn of before_all) await fn();

  let unskipped_focused_specs = specs.filter((spec) => !spec.skip);
  if (specs.find((spec) => spec.focus)) unskipped_focused_specs = specs.filter((spec) => spec.focus);

  for (const spec of unskipped_focused_specs) {
    const { fn } = spec;

    try {
      for (const fn of before_each) await fn();
      await fn();
      spec.success = true;
    } catch (error) {
      spec.error = error;
    } finally {
      for (const fn of after_each) await fn();
    }
  }

  for (const fn of after_all) await fn();
};

export const mockModule = async (import_path, default_import, named_imports) => {
  // if not an absolute path we must import file from proper folder which is the one of the caller
  if (!import_path.startsWith('/')) {
    const callerFile = getCallerFile();
    const folderScope = path.dirname(callerFile);
    import_path = path.normalize(`${folderScope}/${import_path}`);
  }

  // lookup for import in __mocks__ folder
  let useMockFolderFile;
  try {
    const mock_path = path.dirname(import_path) + '/__mocks__/' + path.basename(import_path);
    await fsp.access(mock_path);
    useMockFolderFile = mock_path;
  } catch {} // eslint-disable-line

  // lookup for import .mock.js file
  let useMockJSFile;
  try {
    const mock_path = path.dirname(import_path + '/') + '/' + path.basename(import_path, '.js') + '.mock.js';
    await fsp.access(mock_path);
    useMockJSFile = mock_path;
  } catch {} // eslint-disable-line

  if (useMockJSFile || useMockFolderFile) {
    const mocked_module = await import(useMockJSFile || useMockFolderFile);
    const default_import = mocked_module.default;
    const { default: discard, ...named_imports } = mocked_module; // eslint-disable-line
    await quibble.esm(import_path, named_imports, default_import);
  } else {
    await quibble.esm(import_path, named_imports, default_import);
  }
};

mockModule.reset = quibble.reset;

export const getCallerFile = (position = 2) => {
  if (position >= Error.stackTraceLimit)
    throw new TypeError(`getCallerFile: "position" (${position}) must be less than "Error.stackTraceLimit" (${Error.stackTraceLimit})`);

  const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack;
  Error.prepareStackTrace = oldPrepareStackTrace;

  // stack[0] holds current file => stack[1] holds file where this function was called => stack[2] holds the caller file
  const callerFile = stack?.[position].getFileName().replace('file://', '');
  return callerFile;
};
