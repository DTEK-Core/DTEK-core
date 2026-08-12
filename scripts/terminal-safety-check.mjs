import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const cyclesArgument = process.argv.find(argument => argument.startsWith('--cycles='));
const requireClean = process.argv.includes('--require-clean');
const cycles = Number.parseInt(
  cyclesArgument?.slice('--cycles='.length) ?? process.env.TERMINAL_STRESS_CYCLES ?? '10',
  10,
);
const timeout = 10_000;
const commands = [
  ['status', 'exec git status --porcelain=v1 --branch </dev/null', /^## /],
  ['log', 'exec git --no-pager log -5 --oneline --decorate </dev/null', /\S/],
  ['diff', 'exec git diff --check </dev/null', null],
  ['branch', 'exec git branch --show-current </dev/null', /\S/],
];

if (!Number.isInteger(cycles) || cycles < 1 || cycles > 100) {
  console.error('TERMINAL_STRESS_CYCLES must be an integer between 1 and 100');
  process.exit(1);
}

const environment = {
  ...process.env,
  TERM: 'dumb',
  PAGER: 'cat',
  GIT_PAGER: 'cat',
  GIT_TERMINAL_PROMPT: '0',
};

for (let cycle = 1; cycle <= cycles; cycle += 1) {
  const timings = [];

  for (const [name, command, expectedOutput] of commands) {
    const startedAt = performance.now();
    const result = spawnSync('/bin/zsh', ['-f', '-c', command], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: environment,
      timeout,
      killSignal: 'SIGKILL',
    });
    const elapsed = performance.now() - startedAt;

    if (result.error || result.status !== 0) {
      const reason = result.error?.code === 'ETIMEDOUT'
        ? `timed out after ${timeout} ms`
        : result.stderr.trim() || `exited with status ${result.status}`;
      console.error(`Session ${cycle} ${name}: ${reason}`);
      process.exit(1);
    }

    if (expectedOutput && !expectedOutput.test(result.stdout)) {
      console.error(`Session ${cycle} ${name}: expected stdout was not captured`);
      process.exit(1);
    }

    if (name === 'status' && requireClean) {
      const statusLines = result.stdout.trim().split('\n');
      const branchLine = statusLines[0] ?? '';
      const isSynced = branchLine.includes('...')
        && !branchLine.includes('[ahead ')
        && !branchLine.includes('[behind ');

      if (statusLines.length !== 1 || !isSynced) {
        console.error(`Session ${cycle} status: working tree is dirty or branch is not synchronized`);
        process.exit(1);
      }
    }

    timings.push(`${name}=${elapsed.toFixed(1)}ms`);
  }

  console.log(`Session ${cycle}: ${timings.join(' ')}`);
}

console.log(`Terminal safety check PASS: ${cycles} isolated shell session${cycles === 1 ? '' : 's'}`);
