import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Endpoint, Payload } from 'payload'
import { hasRole } from './access'

/**
 * Publish pipeline.
 *
 *  BUILD_MODE=local  → runs deploy/build-and-deploy.sh on this server (astro build → atomic symlink swap).
 *  BUILD_MODE=hook   → POSTs BUILD_HOOK_URL (Cloudflare Pages deploy hook / GitHub workflow_dispatch).
 *                      If BUILD_CALLBACK_SECRET is set, CI reports the result to POST /api/publish/callback;
 *                      otherwise the hook is considered done after BUILD_LOCK_SECONDS.
 *
 * Only one build runs at a time. Publishing while a build runs queues exactly one follow-up build.
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = process.env.REPO_ROOT || path.resolve(dirname, '../../../..')
const SCRIPT = process.env.BUILD_SCRIPT || path.join(REPO_ROOT, 'deploy/build-and-deploy.sh')
const STALE_MS = 30 * 60 * 1000
const LOCK_MS = Number(process.env.BUILD_LOCK_SECONDS || 180) * 1000

type State = 'idle' | 'running' | 'success' | 'failed' | 'triggered'
type Status = {
  state?: State | null
  queued?: boolean | null
  startedAt?: string | null
  finishedAt?: string | null
  lastSuccessAt?: string | null
  triggeredBy?: string | null
  message?: string | null
}

const mode = () => (process.env.BUILD_MODE === 'hook' ? 'hook' : 'local')

const getStatus = (payload: Payload) =>
  payload.findGlobal({ slug: 'build-status', overrideAccess: true }) as Promise<Status>

const setStatus = (payload: Payload, data: Partial<Status>) =>
  payload.updateGlobal({ slug: 'build-status', data, overrideAccess: true }) as Promise<Status>

const isBusy = (s: Status) => {
  if (s.state !== 'running' && s.state !== 'triggered') return false
  const started = s.startedAt ? Date.parse(s.startedAt) : 0
  const limit = s.state === 'triggered' ? LOCK_MS : STALE_MS
  return Date.now() - started < limit
}

async function finish(payload: Payload, ok: boolean, message: string) {
  const now = new Date().toISOString()
  const prev = await getStatus(payload)
  await setStatus(payload, {
    state: ok ? 'success' : 'failed',
    finishedAt: now,
    ...(ok ? { lastSuccessAt: now } : {}),
    message: message.slice(-4000),
    queued: false,
  })
  if (prev.queued) {
    payload.logger.info('[publish] running queued follow-up build')
    await start(payload, `${prev.triggeredBy ?? 'queue'} (queued)`)
  }
}

async function start(payload: Payload, who: string) {
  await setStatus(payload, {
    state: mode() === 'local' ? 'running' : process.env.BUILD_CALLBACK_SECRET ? 'running' : 'triggered',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    triggeredBy: who,
    queued: false,
    message: '',
  })

  if (mode() === 'local') {
    let out = ''
    const child = spawn('bash', [SCRIPT], { cwd: REPO_ROOT, env: process.env })
    const collect = (b: Buffer) => {
      // eslint-disable-next-line no-control-regex
      out = (out + b.toString().replace(/\x1b\[[0-9;]*m/g, '')).slice(-8000)
    }
    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.on('error', (err) => void finish(payload, false, `Could not start build: ${err.message}`))
    child.on('close', (code) => {
      if (code === 0) payload.logger.info('[publish] build finished')
      else payload.logger.error(`[publish] build failed with exit code ${code}`)
      void finish(payload, code === 0, out)
    })
    return
  }

  const url = process.env.BUILD_HOOK_URL
  if (!url) {
    await finish(payload, false, 'BUILD_HOOK_URL is not set')
    return
  }
  try {
    const headers = { 'content-type': 'application/json', ...JSON.parse(process.env.BUILD_HOOK_HEADERS || '{}') }
    const res = await fetch(url, { method: 'POST', headers, body: process.env.BUILD_HOOK_BODY || '{}' })
    if (!res.ok) {
      await finish(payload, false, `Build hook responded ${res.status}: ${(await res.text()).slice(0, 500)}`)
      return
    }
    if (!process.env.BUILD_CALLBACK_SECRET) {
      await setStatus(payload, { message: 'Build hook accepted. The site updates when the build finishes (usually 1–3 minutes).' })
      // No callback: release the lock after LOCK_MS and run a queued build if there is one.
      setTimeout(async () => {
        const s = await getStatus(payload)
        if (s.state === 'triggered') await finish(payload, true, s.message ?? '')
      }, LOCK_MS).unref()
    }
  } catch (err) {
    await finish(payload, false, `Build hook failed: ${(err as Error).message}`)
  }
}

export async function requestPublish(payload: Payload, who: string) {
  const status = await getStatus(payload)
  if (isBusy(status)) {
    await setStatus(payload, { queued: true })
    return { result: 'queued' as const }
  }
  await start(payload, who)
  return { result: 'started' as const }
}

export const publishEndpoints: Endpoint[] = [
  {
    path: '/publish',
    method: 'get',
    handler: async (req) => {
      if (!hasRole(req.user, 'admin', 'editor')) return Response.json({ error: 'forbidden' }, { status: 403 })
      const s = await getStatus(req.payload)
      return Response.json({ ...s, busy: isBusy(s), mode: mode() })
    },
  },
  {
    path: '/publish',
    method: 'post',
    handler: async (req) => {
      if (!hasRole(req.user, 'admin', 'editor')) return Response.json({ error: 'forbidden' }, { status: 403 })
      const who = (req.user as { email?: string } | null)?.email ?? 'unknown'
      return Response.json(await requestPublish(req.payload, who))
    },
  },
  {
    // Called by CI (GitHub Actions) when a hook-triggered build finishes.
    path: '/publish/callback',
    method: 'post',
    handler: async (req) => {
      const secret = process.env.BUILD_CALLBACK_SECRET
      if (!secret || req.headers.get('x-build-secret') !== secret) {
        return Response.json({ error: 'forbidden' }, { status: 403 })
      }
      const body = (await req.json?.().catch(() => ({}))) as { status?: string; message?: string }
      await finish(req.payload, body.status === 'success', body.message ?? '')
      return Response.json({ ok: true })
    },
  },
]
