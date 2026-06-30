// Portfolio screenshot exporter — full-page PNGs at retina pixel density.
// Drives system Chrome headless via puppeteer-core. Shoots the live prod build.
// Usage: node scripts/portfolio-shots.mjs
import puppeteer from 'puppeteer-core'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.SHOT_BASE || 'https://shift-prototype.netlify.app'
const OUT = 'portfolio-exports'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const screens = [
  { slug: 'overview',      path: '/' },
  { slug: 'queue-monitor', path: '/queue-monitor' },
  { slug: 'loans',         path: '/loans' },
  { slug: 'simulation',    path: '/simulation' },
  { slug: 'roster',        path: '/roster' },
  { slug: 'performance',   path: '/performance' },
  { slug: 'viz-lab',       path: '/viz-lab' },
]

// Generous, standard portfolio targets. dpr drives crispness (retina).
const devices = [
  { name: 'mobile',  width: 393,  height: 852,  dpr: 3 },
  { name: 'laptop',  width: 1440, height: 900,  dpr: 2 },
  { name: 'desktop', width: 1920, height: 1080, dpr: 2 },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await mkdir(OUT, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
})

let count = 0
for (const d of devices) {
  for (const s of screens) {
    const page = await browser.newPage()
    await page.setViewport({ width: d.width, height: d.height, deviceScaleFactor: d.dpr })
    try {
      await page.goto(BASE + s.path, { waitUntil: 'networkidle0', timeout: 45000 })
      await sleep(2200) // let framer-motion draw-on + fades settle
      const file = `${OUT}/${s.slug}-${d.name}.png`
      await page.screenshot({ path: file, fullPage: true, type: 'png' })
      count++
      console.log(`✓ ${file}`)
    } catch (e) {
      console.log(`✗ ${s.slug}-${d.name}: ${e.message}`)
    } finally {
      await page.close()
    }
  }
}

await browser.close()
console.log(`\nDone — ${count}/${screens.length * devices.length} PNGs in ${OUT}/`)
