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
    userId: 'demo-user-1', role: 'ADMIN', organizationId: 'demo-org-1',
    sub: 'demo-user-1', iat: 1516239022, exp: 9999999999,
  })}.fake`
}

const now = () => new Date().toISOString()
const res = (data, status = 200) => ({
  status, contentType: 'application/json',
  body: JSON.stringify({ success: true, data, message: null, timestamp: now() }),
})
const pageRes = (data) => res({
  content: data, totalPages: 1, totalElements: data.length,
  size: 100, number: 0, first: true, last: true, empty: data.length === 0,
})

/* ── Rich demo data ── */
const meetings = Array.from({ length: 8 }, (_, i) => ({
  id: `demo-meeting-${i + 1}`,
  title: ['Sprint Planning — Week 12','Product Review — Q1 OKRs','Architecture Decision: API Migration','Design Sprint — Memory Engine v2','Client Onboarding — Acme Corp','Engineering All-Hands','Security Audit Review','Team Retrospective'][i],
  source: ['zoom','meet','manual'][i % 3],
  startedAt: new Date(Date.now() - i * 3 * 864e5).toISOString(),
  durationSeconds: [2700, 3600, 4500, 5400, 1800, 3600, 4800, 2400][i],
  participants: [['Sarah Chen','Marcus Johnson','Elena Rodriguez'],['Alex Kim','Priya Patel','David Park'],['Sarah Chen','Marcus Johnson','Priya Patel'],['Elena Rodriguez','Alex Kim','David Park'],['Sarah Chen','Priya Patel'],['All (24 participants)'],['Alex Kim','Priya Patel','David Park'],['Sarah Chen','Elena Rodriguez','Marcus Johnson']][i],
  createdAt: new Date(Date.now() - i * 2 * 864e5 - 864e5).toISOString(),
  memoriesExtracted: [34, 28, 52, 41, 18, 94, 37, 22],
  decisions: [4, 3, 7, 5, 2, 11, 6, 3],
  actionItems: [12, 8, 15, 10, 5, 22, 14, 9],
}))

const timeline = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i}`, memoryId: `mem${i}`, meetingId: `demo-meeting-${(i%8)+1}`,
  meetingTitle: meetings[i % 8].title,
  memoryType: ['DECISION','ACTION_ITEM','FACT','COMMITMENT','DISCUSSION'][i%5],
  content: ['Decided to adopt micro-frontend architecture for the dashboard module to enable independent team deployments.','Sarah Chen to finalize API contract for memory search endpoint by Friday EOD.','Engineering team identified that vector search latency increased by 40% after the latest embedding model update.','Committed to delivering the knowledge graph visualization feature by end of Q2.','Discussed potential migration from PostgreSQL to CockroachDB for multi-region support.','Deferred the decision on Redis vs. KeyDB to next sprint after benchmarks are completed.','Security team flagged that JWT token rotation needs to be hardened following the latest audit.','Alex Kim assigned to investigate alternative text embedding models for improved recall.','Product team aligned on prioritizing semantic search over advanced filtering for the next release.','Elena Rodriguez proposed adopting a event-driven architecture for real-time memory extraction.','Decision to standardize on Tailwind CSS v4 across all frontend applications moving forward.','Marcus Johnson taking ownership of the AI assistant chat integration with streaming responses.'][i],
  ownerName: ['Elena Rodriguez','Sarah Chen','Marcus Johnson','Alex Kim','Priya Patel','David Park','Sarah Chen','Alex Kim','Elena Rodriguez','Marcus Johnson','Priya Patel','Sarah Chen'][i],
  createdAt: new Date(Date.now() - i * 2 * 3600000 - i * 15 * 60000).toISOString(),
  eventDate: new Date(Date.now() - Math.floor(i/2)*864e5).toISOString(),
}))

const actionItems = [
  { id:'ai1', meetingId:'demo-meeting-1', ownerName:'Sarah Chen', task:'Finalize API contract for memory search endpoint', status:'IN_PROGRESS', priority:'HIGH', deadline:new Date(Date.now()+3*864e5).toISOString(), createdAt:new Date(Date.now()-5*864e5).toISOString() },
  { id:'ai2', meetingId:'demo-meeting-2', ownerName:'Alex Kim', task:'Investigate alternative text embedding models', status:'PENDING', priority:'MEDIUM', deadline:new Date(Date.now()+7*864e5).toISOString(), createdAt:new Date(Date.now()-4*864e5).toISOString() },
  { id:'ai3', meetingId:'demo-meeting-3', ownerName:'Elena Rodriguez', task:'Create migration plan for micro-frontend architecture', status:'DONE', priority:'HIGH', deadline:new Date(Date.now()-14*864e5).toISOString(), createdAt:new Date(Date.now()-3*864e5).toISOString() },
  { id:'ai4', meetingId:'demo-meeting-4', ownerName:'Marcus Johnson', task:'Benchmark PostgreSQL vs CockroachDB for multi-region', status:'PENDING', priority:'LOW', deadline:new Date(Date.now()+10*864e5).toISOString(), createdAt:new Date(Date.now()-2*864e5).toISOString() },
  { id:'ai5', meetingId:'demo-meeting-6', ownerName:'Priya Patel', task:'Design new semantic search result page', status:'IN_PROGRESS', priority:'MEDIUM', deadline:new Date(Date.now()+5*864e5).toISOString(), createdAt:new Date(Date.now()-1*864e5).toISOString() },
  { id:'ai6', meetingId:'demo-meeting-1', ownerName:'David Park', task:'Implement rate limiting for search API', status:'DONE', priority:'HIGH', deadline:new Date(Date.now()-8*864e5).toISOString(), createdAt:new Date(Date.now()-6*864e5).toISOString() },
]

const decisions = [
  { id:'d1', meetingId:'demo-meeting-3', title:'Adopt micro-frontend architecture for dashboard module', description:'Decided to split the monolithic dashboard into independently deployable micro-frontends.', status:'APPROVED', ownerName:'Elena Rodriguez', createdAt:new Date(Date.now()-3*864e5).toISOString() },
  { id:'d2', meetingId:'demo-meeting-6', title:'Standardize on Tailwind CSS v4 for all frontend apps', description:'All new frontend projects must use Tailwind CSS v4 as the styling framework.', status:'APPROVED', ownerName:'Marcus Johnson', createdAt:new Date(Date.now()-2*864e5).toISOString() },
  { id:'d3', meetingId:'demo-meeting-1', title:'Prioritize semantic search over advanced filtering', description:'Product team aligned on shipping semantic search first.', status:'APPROVED', ownerName:'Sarah Chen', createdAt:new Date(Date.now()-1*864e5).toISOString() },
]

const searchResults = [
  { memoryId:'r1', meetingId:'demo-meeting-3', meetingTitle:'Architecture Decision: API Migration', memoryType:'DECISION', content:'Decided to adopt micro-frontend architecture for the dashboard module to enable independent team deployments.', ownerName:'Elena Rodriguez', bm25Score:0.89, vectorScore:0.94, finalScore:0.92, createdAt:new Date(Date.now()-3*864e5).toISOString() },
  { memoryId:'r2', meetingId:'demo-meeting-1', meetingTitle:'Sprint Planning — Week 12', memoryType:'ACTION_ITEM', content:'Sarah Chen to finalize API contract for memory search endpoint by Friday EOD.', ownerName:'Sarah Chen', bm25Score:0.85, vectorScore:0.91, finalScore:0.88, createdAt:new Date(Date.now()-5*864e5).toISOString() },
  { memoryId:'r3', meetingId:'demo-meeting-6', meetingTitle:'Engineering All-Hands', memoryType:'FACT', content:'Engineering team identified that vector search latency increased by 40% after the latest embedding model update.', ownerName:'Marcus Johnson', bm25Score:0.92, vectorScore:0.87, finalScore:0.90, createdAt:new Date(Date.now()-1*864e5).toISOString() },
  { memoryId:'r4', meetingId:'demo-meeting-4', meetingTitle:'Design Sprint — Memory Engine v2', memoryType:'COMMITMENT', content:'Committed to delivering the knowledge graph visualization feature by end of Q2.', ownerName:'Alex Kim', bm25Score:0.78, vectorScore:0.95, finalScore:0.86, createdAt:new Date(Date.now()-2*864e5).toISOString() },
]

async function scrollEntirePage(page) {
  await page.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms))
    const scrollHeight = document.body.scrollHeight
    const viewport = window.innerHeight
    const steps = Math.ceil(scrollHeight / viewport) + 2
    for (let i = 0; i < steps; i++) {
      window.scrollTo(0, i * viewport)
      await delay(300)
    }
    // Scroll back to top
    window.scrollTo(0, 0)
    await delay(500)
  })
}

async function setupAuth(page) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.evaluate((t) => {
    localStorage.setItem('accessToken', t)
    localStorage.setItem('refreshToken', t)
  }, fakeJWT())
}

async function snap(page, name, path, { auth = false, fullPage = true, scrollFirst = false } = {}) {
  if (auth) await setupAuth(page)
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  if (scrollFirst) {
    console.log(`  Scrolling page to trigger all animations …`)
    await scrollEntirePage(page)
    await page.waitForTimeout(3000)
  }

  await page.screenshot({ path: join(SCREENSHOTS, name), fullPage, timeout: 60000 })
  console.log(`  ✓ ${name} saved`)
}

async function main() {
  mkdirSync(SCREENSHOTS, { recursive: true })

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, locale: 'en-US', colorScheme: 'dark' })
  const page = await ctx.newPage()

  /* ── API Route Interceptor ── */
  await page.route('http://localhost:8080/**', async (route, req) => {
    const url = req.url()
    const method = req.method()
    const m = url.match(/\/meetings\/([^/?]+)$/)

    // Meeting detail (must be before the list catch-all)
    if (m && method === 'GET') {
      const id = m[1]
      const mt = meetings.find(x => x.id === id) || meetings[0]
      return route.fulfill(res(mt))
    }

    // Meetings list
    if (url.includes('/meetings') && method === 'GET')
      return route.fulfill(pageRes(meetings))

    // Search (GET)
    if (url.includes('/memory/search') && method === 'GET')
      return route.fulfill(res(searchResults))

    // Search (POST)
    if (url.includes('/search') && method === 'POST')
      return route.fulfill(res(searchResults))

    // Timeline
    if (url.includes('/timeline') && method === 'GET')
      return route.fulfill(res(timeline))

    // Action items
    if (url.includes('/action-items') && method === 'GET')
      return route.fulfill(res(actionItems))

    // Decisions
    if (url.includes('/decisions') && method === 'GET')
      return route.fulfill(res(decisions))

    // Health
    if (url.includes('/health'))
      return route.fulfill(res({ status: 'UP', service: 'memory-engine', timestamp: now() }))

    // Auth
    if (url.includes('/auth')) return route.fulfill(res(null, 401))

    return route.fulfill(res(null))
  })

  /* ══════════════════════════════════════════
     SCREENSHOTS
     ══════════════════════════════════════════ */

  // 1. Landing page (full scroll to trigger all animations)
  console.log('1. Landing page …')
  await snap(page, 'landing.png', '/welcome', { auth: false, scrollFirst: true, fullPage: false })

  // 2. Dashboard
  console.log('2. Dashboard …')
  await snap(page, 'dashboard.png', '/', { auth: true, scrollFirst: true })

  // 3. Knowledge Graph — scroll to graph section
  console.log('3. Knowledge Graph …')
  await setupAuth(page)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  await scrollEntirePage(page)
  await page.evaluate(() => {
    // Find Knowledge Graph heading and scroll to it
    const all = [...document.querySelectorAll('h2, h3, strong, span')]
    for (const el of all) {
      if (el.textContent.toLowerCase().includes('knowledge graph') || el.textContent.toLowerCase().includes('knowledge')) {
        el.scrollIntoView({ block: 'center', behavior: 'instant' })
        break
      }
    }
  })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: join(SCREENSHOTS, 'knowledge-graph.png'), fullPage: false })
  console.log('  ✓ knowledge-graph.png saved')

  // 4. AI Chat — scroll to chat section
  console.log('4. AI Chat …')
  await setupAuth(page)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  await scrollEntirePage(page)
  await page.evaluate(() => {
    const all = [...document.querySelectorAll('h2, h3, strong, span, p')]
    for (const el of all) {
      if (el.textContent.toLowerCase().includes('enterprise memory') || el.textContent.toLowerCase().includes('ai chat') || el.textContent.includes('AI assistant')) {
        el.scrollIntoView({ block: 'center', behavior: 'instant' })
        break
      }
    }
  })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: join(SCREENSHOTS, 'ai-chat.png'), fullPage: false })
  console.log('  ✓ ai-chat.png saved')

  // 5. Semantic Search — populate results by typing a query
  console.log('5. Semantic Search …')
  await setupAuth(page)
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  // Type a search query to trigger results
  const searchInput = await page.$('input[type="text"], input[placeholder*="Search"], input[placeholder*="search"]')
  if (searchInput) {
    await searchInput.click()
    await searchInput.fill('API migration decision')
    await page.waitForTimeout(2000)
    // Press Enter to search
    await searchInput.press('Enter')
    await page.waitForTimeout(4000)
  }
  await page.screenshot({ path: join(SCREENSHOTS, 'semantic-search.png'), fullPage: true })
  console.log('  ✓ semantic-search.png saved')

  // 6. Meeting Details
  console.log('6. Meeting Details …')
  await setupAuth(page)
  await page.goto(BASE + '/meetings/demo-meeting-1', { waitUntil: 'networkidle' })
  await page.waitForTimeout(5000)
  await page.screenshot({ path: join(SCREENSHOTS, 'meeting-details.png'), fullPage: true })
  console.log('  ✓ meeting-details.png saved')

  // 7. Login page
  console.log('7. Login …')
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4000)
  await page.screenshot({ path: join(SCREENSHOTS, 'login.png'), fullPage: false })
  console.log('  ✓ login.png saved')

  await browser.close()
  console.log('\n✅ All screenshots saved to docs/screenshots/')
}

main().catch(err => { console.error(err); process.exit(1) })
