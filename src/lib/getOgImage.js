import { BLOG_URL } from './constants'

const chrome = require('chrome-aws-lambda')
const { createHash } = require('crypto')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'

// Chrome exe path on Mac OS
const exePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

async function getOgImage(
  path,
  baseUrl = 'https://og-image.willianjusten.com.br'
) {
  if (isDev) {
    return 'og image will be generated in production'
  }

  const url = `${baseUrl}${path}`
  const hash = createHash('md5').update(url).digest('hex')
  const ogImageDir = `./public/images/og`
  const imagePath = `${ogImageDir}/${hash}.png`
  const publicPath = `${BLOG_URL}/images/og/${hash}.png`

  const browser = await chrome.puppeteer.launch({
    args: chrome.args,
    executablePath: isDev ? exePath : await chrome.executablePath,
    headless: true
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630 })
  await page.goto(url, { waitUntil: 'networkidle2' })
  const buffer = await page.screenshot({ type: 'png' })
  await browser.close()

  fs.mkdirSync(ogImageDir, { recursive: true })
  fs.writeFileSync(imagePath, buffer)

  return publicPath
}

export default getOgImage
