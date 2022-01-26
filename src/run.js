#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from './index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

if (import.meta.url.endsWith(process.argv[1])) {
  const spec_files = process.argv.filter((arg) => arg.endsWith('spec.js'));

  // let the magic happen!
  for (const spec_file of spec_files) {
    await import(path.normalize(`${dirname}/../${spec_file}`));
  }

  await run();
}
