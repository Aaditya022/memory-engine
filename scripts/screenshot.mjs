#!/usr/bin/env node
/**
 * Memory Engine — Screenshot Automation
 *
 * Captures high-resolution (2x) PNG screenshots of the actual running
 * application at http://localhost:3001.  Run with:
 *
 *   node scripts/screenshot.mjs
 *
 * Screenshots are saved to docs/screenshots/.
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SCREENSHOTS = join(ROOT, 'docs', 'screenshots')
const BASE = 'http://localhost:3001'
const VIEWPORT = { width: 1440, height: 900 }

/* ───────────────────────────────────────────
   Fake JWT for dashboard auth
   ─────────────────────────────────────────── */
function fakeJWT() {
  const b = (o) => btoa(JSON.stringify(o))
  return `${b({ alg: 'HS256', typ: 'JWT' })}.${b({
    userId: 'demo-user-1',
    role: 'ADMIN',
    organizationId: 'demo-org-1',
    sub: 'demo-user-1',
    iat: 1516239022,
    exp: 9999999999,
  })}.fake`
}

/* ───────────────────────────────────────────
   API intercept helpers
   ─────────────────────────────────────────── */
const now = () => new Date().toISOString()

const res = (data, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify({ success: true, data, message: null, timestamp: now() }),
})

const pageRes = (data) =>
  res({
    content: data,
    totalPages: 1,
    totalElements: data.length,
    size: 100,
    number: 0,
    first: true,
    last: true,
    empty: data.length === 0,
  })

/* ───────────────────────────────────────────
   Demo meeting (for meeting detail page)
   ─────────────────────────────────────────── */
const demoMeeting = (id) => ({
  id,
  title: 'Sprint Planning — Week 12',
  source: 'zoom',
  startedAt: new Date(Date.now() - 7 * 864e5).toISOString(),
  durationSeconds: 2700,
  participants: ['Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez'],
  createdAt: new Date(Date.now() - 7 * 864e5).toISOString(),
})

/* ───────────────────────────────────────────
   Main
   ─────────────────────────────────────────── */
async function main() {
  mkdirSync(SCREENSHOTS, { recursive: true })

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    locale: 'en-US',
    colorScheme: 'dark',
  })

  const page = await ctx.newPage()

  /* ── Route interceptor: mock the missing backend ── */
  await page.route('http://localhost:8080/**', async (route, req) => {
    const url = req.url()
    const method = req.method()

    // Meeting detail
    const m = url.match(/\/meetings\/(demo-meeting-\d+)$/)
    if (m && method === 'GET') return route.fulfill(res(demoMeeting(m[1])))

    // Meetings list (empty — dashboard falls back to demo data)
    if (url.includes('/meetings') && method === 'GET')
      return route.fulfill(res(pageRes([])))

    // Search (empty — dashboard falls back to demo results)
    if (url.includes('/memory/search') && method === 'GET')
      return route.fulfill(res([]))

    // Timeline
    if (url.includes('/timeline') && method === 'GET')
      return route.fulfill(res([]))

    // Action items
    if (url.includes('/action-items') && method === 'GET')
      return route.fulfill(res([]))

    // Decisions
    if (url.includes('/decisions') && method === 'GET')
      return route.fulfill(res([]))

    // Health
    if (url.includes('/health')) return route.fulfill(res({ status: 'UP', service: 'memory-engine', timestamp: now() }))

    // Auth (login/register — fail gracefully)
    if (url.includes('/auth')) return route.fulfill(res(null, 401))

    // Everything else
    return route.fulfill(res(null))
  })

  /* ── Screenshot helper ── */
  async function snap(name, path, { auth = true, sleep = 3000, fullPage = true, waitFor } = {}) {
    if (auth) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' })
      await page.evaluate((t) => {
        localStorage.setItem('accessToken', t)
        localStorage.setItem('refreshToken', t)
      }, fakeJWT())
    }

    await page.goto(BASE + path, { waitUntil: 'networkidle' })

    if (waitFor) await page.waitForSelector(waitFor, { timeout: 20000 })

    // Let framer-motion / lenis settle
    await page.waitForTimeout(sleep)

    await page.screenshot({ path: join(SCREENSHOTS, name), fullPage })
  }

  /* ══════════════════════════════════════════
     CAPTURE
     ══════════════════════════════════════════ */

  // 1. Landing page
  console.log('Capturing landing.png …')
  await snap('landing.png', '/welcome', {
    auth: false,
    sleep: 4000,
    fullPage: true,
    waitFor: 'section',
  })

  // 2. Dashboard — full page
  console.log('Capturing dashboard.png …')
  await snap('dashboard.png', '/', {
    sleep: 4000,
    fullPage: true,
    waitFor: 'main, [class*="grid"]',
  })

  // 3. Knowledge Graph — viewport scrolled to graph section
  console.log('Capturing knowledge-graph.png …')
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.evaluate((t) => {
    localStorage.setItem('accessToken', t)
    localStorage.setItem('refreshToken', t)
  }, fakeJWT())
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000)
  await page.evaluate(() => {
    const items = document.querySelectorAll('h2')
    for (const h2 of items) {
      if (h2.textContent.includes('Knowledge Graph')) {
        const el = h2.closest('[class*="rounded-2xl"]') || h2.parentElement
        el.scrollIntoView({ block: 'start' })
        break
      }
    }
  })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: join(SCREENSHOTS, 'knowledge-graph.png'), fullPage: false })

  // 4. AI Chat — viewport scrolled to Enterprise Memory section
  console.log('Capturing ai-chat.png …')
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.evaluate((t) => {
    localStorage.setItem('accessToken', t)
    localStorage.setItem('refreshToken', t)
  }, fakeJWT())
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000)
  await page.evaluate(() => {
    const headings = document.querySelectorAll('h2')
    for (const h2 of headings) {
      if (h2.textContent.includes('Enterprise Memory')) {
        const el = h2.closest('[class*="rounded-2xl"]') || h2.parentElement
        el.scrollIntoView({ block: 'start' })
        break
      }
    }
  })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: join(SCREENSHOTS, 'ai-chat.png'), fullPage: false })

  // 5. Semantic Search
  console.log('Capturing semantic-search.png …')
  await snap('semantic-search.png', '/search', {
    sleep: 3500,
    fullPage: true,
    waitFor: 'input[placeholder*="Search"]',
  })

  // 6. Meeting Details
  console.log('Capturing meeting-details.png …')
  await snap('meeting-details.png', '/meetings/demo-meeting-1', {
    sleep: 3500,
    fullPage: true,
    waitFor: 'h1, [class*="text-2xl"]',
  })

  // 7. Login
  console.log('Capturing login.png …')
  await snap('login.png', '/login', {
    auth: false,
    sleep: 3000,
    fullPage: false,
    waitFor: 'form',
  })

  await browser.close()
  console.log('\nAll screenshots saved to docs/screenshots/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
