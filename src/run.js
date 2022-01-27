#!/usr/bin/env node
import yargs from 'yargs';
import { run } from './index.js';

const working_directory = process.cwd(); // broken in subdirectories??
const spec_files = process.argv.filter((arg) => arg.endsWith('spec.js'));

for (const spec_file of spec_files) {
  const import_path = spec_file.startsWith('/') ? spec_file : `${working_directory}/${spec_file}`;
  await import(import_path);
}

// let the magic happen!
const {
  argv: { testNamePattern, runTestsByPath },
} = yargs(process.argv.slice(2));

await run({ testNamePattern, runTestsByPath });
