import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const cyclesArgument = process.argv.find(argument => argument.startsWith('--cycles='));
const requireClean = process.argv.includes('--require-clean');
const diagnosticMode = process.argv.includes('--diagnostic');
const healthMode = process.argv.includes('--health');
const defaultCycles = healthMode || diagnosticMode ? '1' : '20';
const cycles = Number.parseInt(
  cyclesArgument?.slice('--cycles='.length)
    ?? process.env.TERMINAL_STRESS_CYCLES
    ?? defaultCycles,
  10,
);
const timeout = 10_000;

const terminalGate = {
  name: 'terminal',
  executable: '/bin/echo',
  args: ['CODEX_TERMINAL_OK'],
  expectedOutput: /^CODEX_TERMINAL_OK\s*$/,
};

const stressCommands = [
  terminalGate,
  { name: 'head', executable: 'git', args: ['rev-parse', 'HEAD'], expectedOutput: /^[0-9a-f]{40}\s*$/ },
  { name: 'status', executable: 'git', args: ['status', '--porcelain=v1', '--branch'], expectedOutput: /^## / },
  { name: 'log', executable: 'git', args: ['--no-pager', 'log', '-1', '--oneline'], expectedOutput: /\S/ },
  { name: 'rev-list', executable: 'git', args: ['rev-list', '--left-right', '--count', 'origin/develop...HEAD'], expectedOutput: /^\d+\s+\d+\s*$/ },
];

const healthCommands = [
  terminalGate,
  stressCommands[2],
  stressCommands[3],
];

const diagnosticCommands = [
  terminalGate,
  { name: 'pwd', executable: '/bin/pwd', args: [], expectedOutput: /\S/ },
  { name: 'printf', executable: '/usr/bin/printf', args: ['terminal-exit-test\n'], expectedOutput: /^terminal-exit-test\s*$/ },
  { name: 'worktree', executable: 'git', args: ['rev-parse', '--is-inside-work-tree'], expectedOutput: /^true\s*$/ },
  { name: 'toplevel', executable: 'git', args: ['rev-parse', '--show-toplevel'], expectedOutput: /\S/ },
  { name: 'branch', executable: 'git', args: ['branch', '--show-current'], expectedOutput: /\S/ },
  stressCommands[1],
  { name: 'origin', executable: 'git', args: ['rev-parse', 'origin/develop'], expectedOutput: /^[0-9a-f]{40}\s*$/ },
  stressCommands[2],
  stressCommands[3],
  stressCommands[4],
];

if (healthMode && diagnosticMode) {
  console.error('Use either --health or --diagnostic, not both');
  process.exit(1);
}

if (!Number.isInteger(cycles) || cycles < 1 || cycles > 100) {
  console.error('TERMINAL_STRESS_CYCLES must be an integer between 1 and 100');
  process.exit(1);
}

const commands = diagnosticMode
  ? diagnosticCommands
  : healthMode
    ? healthCommands
    : stressCommands;

const environment = {
  ...process.env,
  TERM: 'dumb',
  PAGER: 'cat',
  GIT_PAGER: 'cat',
  GIT_TERMINAL_PROMPT: '0',
  GIT_OPTIONAL_LOCKS: '0',
};

function commandLabel(command) {
  return [command.executable, ...command.args].join(' ');
}

for (let cycle = 1; cycle <= cycles; cycle += 1) {
  const timings = [];

  for (const command of commands) {
    const startedAt = performance.now();
    const result = spawnSync(command.executable, command.args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: environment,
      timeout,
      killSignal: 'SIGKILL',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const elapsed = performance.now() - startedAt;

    if (result.error?.code === 'ETIMEDOUT') {
      console.error('COMMAND TIMEOUT');
      console.error(`command: ${commandLabel(command)}`);
      console.error(`duration: ${elapsed.toFixed(1)} ms`);
      process.exit(1);
    }

    if (result.error || result.status !== 0) {
      const reason = result.error?.message
        ?? result.stderr.trim()
        ?? `exited with status ${result.status}`;
      console.error(`Session ${cycle} ${command.name}: ${reason}`);
      process.exit(1);
    }

    if (command.expectedOutput && !command.expectedOutput.test(result.stdout)) {
      console.error(`Session ${cycle} ${command.name}: expected stdout was not captured`);
      process.exit(1);
    }

    if (command.name === 'status' && requireClean) {
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

    timings.push(`${command.name}=${elapsed.toFixed(1)}ms`);
  }

  console.log(`Session ${cycle}: ${timings.join(' ')}`);
}

const mode = diagnosticMode ? 'diagnostic' : healthMode ? 'health' : 'stress';
console.log(`Terminal ${mode} check PASS: ${cycles} isolated command cycle${cycles === 1 ? '' : 's'}`);
