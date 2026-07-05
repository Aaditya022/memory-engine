import { chromium } from 'playwright'

const BASE = 'http://localhost:3001'

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' })
const page = await ctx.newPage()

// Mock all APIs with rich data
await page.route('http://localhost:8080/**', async (route, req) => {
  const url = req.url()
  if (url.includes('/meetings') && req.method() === 'GET')
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { content: Array.from({length:8},(_,i)=>({id:`m${i}`,title:`Meeting ${i+1}`,source:'zoom',startedAt:new Date().toISOString(),durationSeconds:3600,participants:['A','B'],createdAt:new Date().toISOString(),memoriesExtracted:[10+i],decisions:[1+i],actionItems:[3+i]})), totalPages: 1, totalElements: 8, size: 100, number: 0, first: true, last: true, empty: false } }) })
  if (url.includes('/action-items'))
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: Array.from({length:6},(_,i)=>({id:`a${i}`,meetingId:`m1`,ownerName:'User',task:`Task ${i+1}`,status:i<2?'PENDING':'DONE',priority:'HIGH',deadline:new Date().toISOString(),createdAt:new Date().toISOString()})) }) })
  if (url.includes('/timeline'))
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: Array.from({length:12},(_,i)=>({id:`t${i}`,memoryId:`mem${i}`,meetingId:`m1`,meetingTitle:'Meeting',memoryType:['DECISION','ACTION_ITEM','FACT','COMMITMENT','DISCUSSION'][i%5],content:`Content ${i+1}`,ownerName:'User',eventDate:new Date().toISOString(),createdAt:new Date().toISOString()})) }) })
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: null }) })
})

const pages = ['/welcome', '/login', '/search', '/meetings/demo-meeting-1']

// Check each page
for (const path of pages) {
  const needsAuth = path !== '/welcome' && path !== '/login'
  if (needsAuth) {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.evaluate(() => {
      const t = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vLXVzZXItMSIsInJvbGUiOiJBRE1JTiJ9.fake'
      localStorage.setItem('accessToken', t)
      localStorage.setItem('refreshToken', t)
    })
  }
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(6000)

  const info = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    bodyHeight: document.body.scrollHeight,
    viewportHeight: window.innerHeight,
    sections: Array.from(document.querySelectorAll('section')).map(s => ({
      id: s.id || 'no-id',
      h2: (s.querySelector('h2')?.textContent || '').substring(0, 40),
      height: s.getBoundingClientRect().height,
      top: s.getBoundingClientRect().top,
    })),
    h2Elements: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.substring(0, 50)),
    fullPage: document.body.scrollHeight > window.innerHeight * 1.5 ? 'YES (scrollable)' : 'fits viewport',
    visibleText: document.body.innerText.substring(0, 600),
  }))

  console.log(`\n===== ${path} =====`)
  console.log(`Title: ${info.title}`)
  console.log(`Body Height: ${info.bodyHeight}px (viewport: ${info.viewportHeight}px)`)
  console.log(`Full page: ${info.fullPage}`)
  console.log(`H2 sections: ${info.h2Elements.join(' | ')}`)
  if (info.sections.length > 0) {
    console.log(`Sections:`)
    info.sections.forEach(s => console.log(`  [${s.id}] "${s.h2}" height=${s.height} top=${s.top}`))
  }
  console.log(`Visible text (first 400): ${info.visibleText.substring(0, 400)}`)
}

await browser.close()
