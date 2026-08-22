#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = '127.0.0.1';
const PORT = readPositiveInteger('SMOKE_PORT', 3210);
const STARTUP_TIMEOUT_MS = readPositiveInteger('SMOKE_STARTUP_TIMEOUT_MS', 30_000);
const REQUEST_TIMEOUT_MS = readPositiveInteger('SMOKE_REQUEST_TIMEOUT_MS', 8_000);
const MAX_RESPONSE_MS = readPositiveInteger('SMOKE_MAX_RESPONSE_MS', 8_000);
const EXTERNAL_BASE_URL = process.env.SMOKE_BASE_URL?.replace(/\/+$/, '') || null;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://${HOST}:${PORT}`;
const INVALID_INVITE_TOKEN = 'invalid';

let serverProcess = null;
let serverOutput = '';
let serverSpawnError = null;
let handlingSignal = false;

function readPositiveInteger(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function appendServerOutput(chunk) {
  serverOutput = `${serverOutput}${chunk.toString()}`.slice(-12_000);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(route) {
  const startedAt = performance.now();
  const response = await fetch(`${BASE_URL}${route}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { 'user-agent': 'dtek-core-pilot-smoke/1.0' },
  });
  const durationMs = Math.round(performance.now() - startedAt);

  assert(
    durationMs <= MAX_RESPONSE_MS,
    `${route} exceeded ${MAX_RESPONSE_MS}ms (${durationMs}ms)`,
  );

  return { response, durationMs };
}

async function expectPage(route, expectedText) {
  const { response, durationMs } = await request(route);
  const body = await response.text();

  assert(response.status === 200, `${route} returned HTTP ${response.status}, expected 200`);
  assert(body.includes(expectedText), `${route} does not contain expected page marker`);
  return durationMs;
}

async function expectProtectedRedirect(route) {
  const { response, durationMs } = await request(route);
  const location = response.headers.get('location');

  assert(
    response.status >= 300 && response.status < 400,
    `${route} returned HTTP ${response.status}, expected redirect`,
  );
  assert(location, `${route} redirect does not include Location header`);
  assert(
    new URL(location, BASE_URL).pathname === '/login',
    `${route} redirects outside the expected login path`,
  );
  return durationMs;
}

async function expectCsvTemplate(route, expectedHeader) {
  const { response, durationMs } = await request(route);
  const body = await response.text();
  const contentType = response.headers.get('content-type') ?? '';

  assert(response.status === 200, `${route} returned HTTP ${response.status}, expected 200`);
  assert(contentType.includes('text/csv'), `${route} has unexpected Content-Type`);
  assert(body.startsWith(expectedHeader), `${route} has an unexpected CSV contract`);
  return durationMs;
}

async function expectSecurityHeaders() {
  const { response, durationMs } = await request('/');
  const csp = response.headers.get('content-security-policy') ?? '';

  assert(response.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is not DENY');
  assert(response.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options is missing');
  assert(csp.includes("frame-ancestors 'none'"), 'CSP frame-ancestors protection is missing');
  return durationMs;
}

async function waitForServer() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (serverSpawnError) throw serverSpawnError;

    if (serverProcess?.exitCode !== null) {
      throw new Error(`Next.js exited before readiness\n${serverOutput.trim()}`);
    }

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(1_000),
      });
      if (response.status > 0) return;
    } catch {
      // Startup polling is bounded by STARTUP_TIMEOUT_MS.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Next.js did not become ready in ${STARTUP_TIMEOUT_MS}ms\n${serverOutput.trim()}`);
}

async function startServer() {
  if (EXTERNAL_BASE_URL) {
    console.log(`Smoke target: external ${new URL(BASE_URL).origin}`);
    return;
  }

  const buildIdPath = path.join(ROOT, '.next', 'BUILD_ID');
  if (!fs.existsSync(buildIdPath)) {
    throw new Error('Production build not found. Run npm run build before npm run test:smoke.');
  }

  const nextBin = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
  serverProcess = spawn(
    process.execPath,
    [nextBin, 'start', '--hostname', HOST, '--port', String(PORT)],
    {
      cwd: ROOT,
      env: { ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  serverProcess.stdout.on('data', appendServerOutput);
  serverProcess.stderr.on('data', appendServerOutput);
  serverProcess.once('error', (error) => {
    serverSpawnError = error;
  });

  console.log(`Smoke target: local production server ${BASE_URL}`);
  await waitForServer();
}

async function stopServer() {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  if (!serverProcess.pid) return;

  serverProcess.kill('SIGTERM');
  await Promise.race([
    once(serverProcess, 'exit').catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ]);

  if (serverProcess.exitCode === null) {
    serverProcess.kill('SIGKILL');
    await once(serverProcess, 'exit').catch(() => undefined);
  }
}

async function handleSignal(signal) {
  if (handlingSignal) return;
  handlingSignal = true;
  console.error(`Smoke runner received ${signal}; stopping local server.`);
  await stopServer();
  process.exit(signal === 'SIGINT' ? 130 : 143);
}

process.once('SIGINT', () => void handleSignal('SIGINT'));
process.once('SIGTERM', () => void handleSignal('SIGTERM'));

const checks = [
  ['Landing page', () => expectPage('/', 'DTEK')],
  ['Login page', () => expectPage('/login', 'С возвращением')],
  ['Registration page', () => expectPage('/register', 'Создать аккаунт')],
  ['Password recovery page', () => expectPage('/forgot-password', 'Забыли пароль?')],
  [
    'Invalid invitation safe state',
    () => expectPage(`/invite/${INVALID_INVITE_TOKEN}`, 'Приглашение недоступно'),
  ],
  [
    'Objects import template',
    () => expectCsvTemplate(
      '/templates/dtek-core-objects-import-template.csv',
      'name,type,criticality,',
    ),
  ],
  [
    'Risks import template',
    () => expectCsvTemplate(
      '/templates/dtek-core-risks-import-template.csv',
      'title,severity,category,',
    ),
  ],
  ['Security headers', expectSecurityHeaders],
  ...[
    '/dashboard',
    '/objects',
    '/risks',
    '/graph',
    '/configurator',
    '/settings',
    '/users',
    '/reports/executive',
    '/api/reports/risks',
    '/onboarding/create',
  ].map((route) => [`Protected redirect ${route}`, () => expectProtectedRedirect(route)]),
];

let passed = 0;
let failed = 0;

try {
  await startServer();

  for (const [name, run] of checks) {
    try {
      const durationMs = await run();
      passed += 1;
      console.log(`PASS ${name} (${durationMs}ms)`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`FAIL ${name}: ${message}`);
    }
  }
} catch (error) {
  failed += 1;
  const message = error instanceof Error ? error.message : String(error);
  console.error(`FAIL smoke setup: ${message}`);
} finally {
  await stopServer();
}

console.log(`Pilot smoke summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
