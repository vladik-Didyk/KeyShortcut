#!/usr/bin/env node
// Validates CONTENT structure and completeness.
// Runs the content test suite via vitest as part of the build pipeline.
import { execFileSync } from 'node:child_process'

try {
  execFileSync('npx', ['vitest', 'run', 'src/test/content.test.js', '--reporter=dot'], {
    stdio: 'inherit',
    cwd: new URL('..', import.meta.url).pathname,
  })
} catch {
  console.error('\n\u2717 Content validation failed. Fix errors above before building.\n')
  process.exit(1)
}
