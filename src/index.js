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
