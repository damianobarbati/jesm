#!/usr/bin/env node
import { run } from './index.js';

const working_directory = process.cwd(); // broken in subdirectories??
const spec_files = process.argv.filter((arg) => arg.endsWith('spec.js'));

for (const spec_file of spec_files) {
  const import_path = `${working_directory}/${spec_file}`;
  await import(import_path);
}

// let the magic happen!
await run();
