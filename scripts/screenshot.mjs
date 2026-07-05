#!/usr/bin/env node

import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SCREENSHOTS = join(ROOT, 'docs', 'screenshots')
const BASE = 'http://localhost:3001'
const VIEWPORT = { width: 1440, height: 900 }

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

const demoMeeting = (id) => ({
  id,
  title: 'Sprint Planning — Week 12',
  source: 'zoom',
  startedAt: new Date(Date.now() - 7 * 864e5).toISOString(),
  durationSeconds: 2700,
  participants: ['Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez'],
  createdAt: new Date(Date.now() - 7 * 864e5).toISOString(),
})

/* ── Pre-built rich API mocks ── */
const demoStats = () => ({
  memories: 12847,
  meetings: 143,
  decisions: 91,
  actions: 218,
  projects: 26,
  people: 74,
  searches: 3421,
  knowledgeConnections: 18902,
})

const demoSparklines = () => ({
  meetings: [12, 18, 9, 22, 15, 20, 25, 14, 19, 23, 17, 21, 16, 24],
  memories: [45, 62, 38, 71, 55, 68, 82, 49, 59, 73, 51, 64, 78, 60],
  decisions: [3, 5, 2, 7, 4, 6, 8, 3, 5, 7, 4, 6, 5, 9],
  actions: [12, 8, 15, 10, 18, 7, 14, 11, 16, 9, 13, 6, 17, 10],
})

const demoMeetings = () =>
  Array.from({ length: 8 }, (_, i) => ({
    id: `demo-meeting-${i + 1}`,
    title: ['Sprint Planning — Week 12', 'Product Review — Q1 OKRs', 'Architecture Decision: API Migration', 'Design Sprint — Memory Engine v2', 'Client Onboarding — Acme Corp', 'Engineering All-Hands', 'Security Audit Review', 'Team Retrospective'][i],
    source: i % 3 === 0 ? 'zoom' : i % 3 === 1 ? 'meet' : 'manual',
    startedAt: new Date(Date.now() - i * 3 * 864e5).toISOString(),
    durationSeconds: [2700, 3600, 4500, 5400, 1800, 3600, 4800, 2400][i],
    participants: [['Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez'], ['Alex Kim', 'Priya Patel', 'David Park'], ['Sarah Chen', 'Marcus Johnson', 'Priya Patel'], ['Elena Rodriguez', 'Alex Kim', 'David Park'], ['Sarah Chen', 'Priya Patel'], ['All (24 participants)'], ['Alex Kim', 'Priya Patel', 'David Park'], ['Sarah Chen', 'Elena Rodriguez', 'Marcus Johnson']][i],
    createdAt: new Date(Date.now() - i * 2 * 864e5 - 864e5).toISOString(),
    memoriesExtracted: [34, 28, 52, 41, 18, 94, 37, 22],
    decisions: [4, 3, 7, 5, 2, 11, 6, 3],
    actionItems: [12, 8, 15, 10, 5, 22, 14, 9],
  }))

const demoTimeline = () =>
  Array.from({ length: 12 }, (_, i) => ({
    id: `demo-activity-${i + 1}`,
    memoryId: `demo-mem-${i + 1}`,
    meetingId: `demo-meeting-${(i % 8) + 1}`,
    meetingTitle: ['Sprint Planning — Week 12', 'Product Review — Q1 OKRs', 'Architecture Decision: API Migration', 'Design Sprint — Memory Engine v2', 'Client Onboarding — Acme Corp', 'Engineering All-Hands', 'Security Audit Review', 'Team Retrospective'][i % 8],
    memoryType: ['DECISION', 'ACTION_ITEM', 'FACT', 'COMMITMENT', 'DISCUSSION'][i % 5],
    content: ['Decided to adopt micro-frontend architecture for the dashboard module.', 'Sarah Chen to finalize API contract for memory search endpoint by Friday.', 'Vector search latency increased by 40% after the latest embedding model update.', 'Committed to delivering the knowledge graph visualization feature by end of Q2.', 'Discussed potential migration from PostgreSQL to CockroachDB for multi-region.', 'Deferred the decision on Redis vs. KeyDB to next sprint.', 'JWT token rotation needs to be hardened following the latest audit.', 'Alex Kim assigned to investigate alternative text embedding models.', 'Product team aligned on prioritizing semantic search for the next release.', 'Elena Rodriguez proposed adopting an event-driven architecture.', 'Decision to standardize on Tailwind CSS v4 across all frontend applications.', 'Marcus Johnson taking ownership of the AI assistant chat integration.'][i],
    ownerName: ['Elena Rodriguez', 'Sarah Chen', 'Marcus Johnson', 'Alex Kim', 'Priya Patel', 'David Park', 'Sarah Chen', 'Alex Kim', 'Elena Rodriguez', 'Marcus Johnson', 'Priya Patel', 'Sarah Chen'][i],
    createdAt: new Date(Date.now() - i * 2 * 3600000 - i * 15 * 60000).toISOString(),
    eventDate: new Date(Date.now() - Math.floor(i / 2) * 864e5).toISOString(),
  }))

const demoActionItems = () =>
  [
    { id: 'demo-ai-1', meetingId: 'demo-meeting-1', ownerName: 'Sarah Chen', task: 'Finalize API contract for memory search endpoint', status: 'IN_PROGRESS', priority: 'HIGH', deadline: new Date(Date.now() + 3 * 864e5).toISOString(), createdAt: new Date(Date.now() - 5 * 864e5).toISOString() },
    { id: 'demo-ai-2', meetingId: 'demo-meeting-2', ownerName: 'Alex Kim', task: 'Investigate alternative text embedding models', status: 'PENDING', priority: 'MEDIUM', deadline: new Date(Date.now() + 7 * 864e5).toISOString(), createdAt: new Date(Date.now() - 4 * 864e5).toISOString() },
    { id: 'demo-ai-3', meetingId: 'demo-meeting-3', ownerName: 'Elena Rodriguez', task: 'Create migration plan for micro-frontend architecture', status: 'DONE', priority: 'HIGH', deadline: new Date(Date.now() - 14 * 864e5).toISOString(), createdAt: new Date(Date.now() - 3 * 864e5).toISOString() },
    { id: 'demo-ai-4', meetingId: 'demo-meeting-4', ownerName: 'Marcus Johnson', task: 'Benchmark PostgreSQL vs CockroachDB for multi-region', status: 'PENDING', priority: 'LOW', deadline: new Date(Date.now() + 10 * 864e5).toISOString(), createdAt: new Date(Date.now() - 2 * 864e5).toISOString() },
    { id: 'demo-ai-5', meetingId: 'demo-meeting-6', ownerName: 'Priya Patel', task: 'Design new semantic search result page', status: 'IN_PROGRESS', priority: 'MEDIUM', deadline: new Date(Date.now() + 5 * 864e5).toISOString(), createdAt: new Date(Date.now() - 1 * 864e5).toISOString() },
    { id: 'demo-ai-6', meetingId: 'demo-meeting-1', ownerName: 'David Park', task: 'Implement rate limiting for search API', status: 'DONE', priority: 'HIGH', deadline: new Date(Date.now() - 8 * 864e5).toISOString(), createdAt: new Date(Date.now() - 6 * 864e5).toISOString() },
  ]

const demoDecisions = () =>
  [
    { id: 'demo-dec-1', meetingId: 'demo-meeting-3', title: 'Adopt micro-frontend architecture for dashboard module', description: 'Decided to split the monolithic dashboard into independently deployable micro-frontends.', status: 'APPROVED', ownerName: 'Elena Rodriguez', createdAt: new Date(Date.now() - 3 * 864e5).toISOString() },
    { id: 'demo-dec-2', meetingId: 'demo-meeting-6', title: 'Standardize on Tailwind CSS v4 for all frontend apps', description: 'All new frontend projects must use Tailwind CSS v4 as the styling framework.', status: 'APPROVED', ownerName: 'Marcus Johnson', createdAt: new Date(Date.now() - 2 * 864e5).toISOString() },
    { id: 'demo-dec-3', meetingId: 'demo-meeting-1', title: 'Prioritize semantic search over advanced filtering', description: 'Product team aligned on shipping semantic search first, deferring advanced filters.', status: 'APPROVED', ownerName: 'Sarah Chen', createdAt: new Date(Date.now() - 1 * 864e5).toISOString() },
    { id: 'demo-dec-4', meetingId: 'demo-meeting-5', title: 'Evaluate CockroachDB migration', description: 'Deferred decision pending benchmark results from Marcus.', status: 'DEFERRED', ownerName: 'Marcus Johnson', createdAt: new Date(Date.now() - 4 * 864e5).toISOString() },
    { id: 'demo-dec-5', meetingId: 'demo-meeting-7', title: 'Harden JWT token rotation', description: 'Security audit findings must be addressed before next release.', status: 'PENDING', ownerName: 'Alex Kim', createdAt: new Date(Date.now() - 5 * 864e5).toISOString() },
  ]

const demoSearchResults = () =>
  [
    { memoryId: 'demo-result-1', meetingId: 'demo-meeting-3', meetingTitle: 'Architecture Decision: API Migration', memoryType: 'DECISION', content: 'Decided to adopt micro-frontend architecture for the dashboard module to enable independent team deployments.', ownerName: 'Elena Rodriguez', bm25Score: 0.89, vectorScore: 0.94, finalScore: 0.92, createdAt: new Date(Date.now() - 3 * 864e5).toISOString() },
    { memoryId: 'demo-result-2', meetingId: 'demo-meeting-1', meetingTitle: 'Sprint Planning — Week 12', memoryType: 'ACTION_ITEM', content: 'Sarah Chen to finalize API contract for memory search endpoint by Friday EOD.', ownerName: 'Sarah Chen', bm25Score: 0.85, vectorScore: 0.91, finalScore: 0.88, createdAt: new Date(Date.now() - 5 * 864e5).toISOString() },
    { memoryId: 'demo-result-3', meetingId: 'demo-meeting-6', meetingTitle: 'Engineering All-Hands', memoryType: 'FACT', content: 'Engineering team identified that vector search latency increased by 40% after the latest embedding model update.', ownerName: 'Marcus Johnson', bm25Score: 0.92, vectorScore: 0.87, finalScore: 0.90, createdAt: new Date(Date.now() - 1 * 864e5).toISOString() },
    { memoryId: 'demo-result-4', meetingId: 'demo-meeting-4', meetingTitle: 'Design Sprint — Memory Engine v2', memoryType: 'COMMITMENT', content: 'Committed to delivering the knowledge graph visualization feature by end of Q2.', ownerName: 'Alex Kim', bm25Score: 0.78, vectorScore: 0.95, finalScore: 0.86, createdAt: new Date(Date.now() - 2 * 864e5).toISOString() },
  ]

async function setupAuth(page) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.evaluate((t) => {
    localStorage.setItem('accessToken', t)
    localStorage.setItem('refreshToken', t)
  }, fakeJWT())
}

async function waitFullySettled(page, extraSleep = 3000) {
  // Wait for no network activity for 500ms
  await page.waitForLoadState('networkidle')
  // Wait for all animations to settle
  await page.waitForTimeout(extraSleep)
}

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

  /* ── Route interceptor: rich API mocks ── */
  await page.route('http://localhost:8080/**', async (route, req) => {
    const url = req.url()
    const method = req.method()

    // Stats / sparklines
    if (url.includes('/stats') || url.includes('/sparklines')) {
      if (url.includes('sparklines')) return route.fulfill(res(demoSparklines()))
      return route.fulfill(res(demoStats()))
    }

    // Meeting detail
    const m = url.match(/\/meetings\/(demo-meeting-\d+)$/)
    if (m && method === 'GET') return route.fulfill(res(demoMeeting(m[1])))

    // Meetings list
    if (url.includes('/meetings') && method === 'GET')
      return route.fulfill(res(pageRes(demoMeetings())))

    // Search
    if (url.includes('/memory/search') && method === 'GET')
      return route.fulfill(res(demoSearchResults()))

    // Search (POST)
    if (url.includes('/search') && method === 'POST')
      return route.fulfill(res(demoSearchResults()))

    // Timeline
    if (url.includes('/timeline') && method === 'GET')
      return route.fulfill(res(demoTimeline()))

    // Action items
    if (url.includes('/action-items') && method === 'GET')
      return route.fulfill(res(demoActionItems()))

    // Decisions
    if (url.includes('/decisions') && method === 'GET')
      return route.fulfill(res(demoDecisions()))

    // Health
    if (url.includes('/health')) return route.fulfill(res({ status: 'UP', service: 'memory-engine', timestamp: now() }))

    // Auth
    if (url.includes('/auth')) return route.fulfill(res(null, 401))

    return route.fulfill(res(null))
  })

  /* ══════════════════════════════════════════
     CAPTURE
     ══════════════════════════════════════════ */

  // 1. Landing page — fully scrolled to capture all sections
  console.log('Capturing landing.png …')
  await page.goto(BASE + '/welcome', { waitUntil: 'networkidle' })
  await page.waitForTimeout(8000)
  await page.screenshot({ path: join(SCREENSHOTS, 'landing.png'), fullPage: true })

  // 2. Dashboard — full page with all cards populated
  console.log('Capturing dashboard.png …')
  await setupAuth(page)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(8000)
  await page.screenshot({ path: join(SCREENSHOTS, 'dashboard.png'), fullPage: true })

  // 3. Knowledge Graph — viewport scrolled to Knowledge Graph section
  console.log('Capturing knowledge-graph.png …')
  await setupAuth(page)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await waitFullySettled(page, 8000)
  await page.evaluate(() => {
    const headings = document.querySelectorAll('h2')
    for (const h2 of headings) {
      if (h2.textContent.includes('Knowledge') || h2.textContent.includes('knowledge')) {
        h2.scrollIntoView({ block: 'start', behavior: 'instant' })
        break
      }
    }
  })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: join(SCREENSHOTS, 'knowledge-graph.png'), fullPage: false })

  // 4. AI Chat — viewport scrolled to AI Chat / Enterprise Memory section
  console.log('Capturing ai-chat.png …')
  await setupAuth(page)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await waitFullySettled(page, 8000)
  await page.evaluate(() => {
    const headings = document.querySelectorAll('h2')
    for (const h2 of headings) {
      if (h2.textContent.includes('Enterprise Memory') || h2.textContent.includes('Chat') || h2.textContent.includes('AI')) {
        h2.scrollIntoView({ block: 'start', behavior: 'instant' })
        break
      }
    }
  })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: join(SCREENSHOTS, 'ai-chat.png'), fullPage: false })

  // 5. Semantic Search — with results loaded
  console.log('Capturing semantic-search.png …')
  await setupAuth(page)
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' })
  await waitFullySettled(page, 8000)
  await page.screenshot({ path: join(SCREENSHOTS, 'semantic-search.png'), fullPage: true })

  // 6. Meeting Details
  console.log('Capturing meeting-details.png …')
  await setupAuth(page)
  await page.goto(BASE + '/meetings/demo-meeting-1', { waitUntil: 'networkidle' })
  await waitFullySettled(page, 8000)
  await page.screenshot({ path: join(SCREENSHOTS, 'meeting-details.png'), fullPage: true })

  // 7. Login
  console.log('Capturing login.png …')
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await waitFullySettled(page, 5000)
  await page.screenshot({ path: join(SCREENSHOTS, 'login.png'), fullPage: false })

  await browser.close()
  console.log('\nAll screenshots saved to docs/screenshots/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
