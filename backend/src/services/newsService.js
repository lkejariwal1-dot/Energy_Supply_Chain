// Client for NewsData.io — powers the Geopolitical Risk Intelligence Agent's
// live event feed (GET /api/risk/events) with real news instead of only the
// static seed timeline.
//
// Every failure mode falls back to `null` rather than throwing, so the
// calling controller can always fall back to seed/DB data and the API never
// breaks because of an upstream news-provider issue.

const NEWS_ENDPOINT = 'https://newsdata.io/api/1/news'
const REQUEST_TIMEOUT_MS = 8000
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes — keeps us well under NewsData.io's free-tier rate limit

// Query tuned to the challenge's domain: crude oil, chokepoints, sanctions.
const QUERY = 'crude oil OR Strait of Hormuz OR Red Sea shipping OR OPEC OR Iran sanctions OR oil tanker'

export const CRITICAL_KEYWORDS = ['strike', 'attack', 'war', 'closure', 'closed', 'blockade', 'invasion', 'killed', 'mined', 'seized']
export const HIGH_KEYWORDS = ['sanction', 'tension', 'threat', 'missile', 'military', 'conflict', 'disrupt', 'blocked']

let cache = { events: null, fetchedAt: 0 }
let hasWarnedMissingKey = false

// Exported so riskScoringService can score historical/live event text with
// the exact same severity rules used for the live news feed.
export function classifySeverity(text) {
  const lower = text.toLowerCase()
  if (CRITICAL_KEYWORDS.some((kw) => lower.includes(kw))) return 'critical'
  if (HIGH_KEYWORDS.some((kw) => lower.includes(kw))) return 'high'
  return 'medium'
}

function formatTime(pubDate) {
  if (!pubDate) return 'Recent'
  const date = new Date(pubDate.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return 'Recent'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function mapArticleToEvent(article, index) {
  const title = article.title || 'Untitled report'
  const description = article.description ? ` — ${article.description}` : ''
  const outlet = article.source_id ? ` (${article.source_id})` : ''
  const text = `${title}${description}${outlet}`.slice(0, 400)

  return {
    id: index + 1,
    time: formatTime(article.pubDate),
    severity: classifySeverity(text),
    source: 'News Wire',
    text
  }
}

/**
 * Fetches and normalizes live geopolitical/oil-market news.
 * Returns an array of events in the same shape as seedData.liveEvents, or
 * `null` if the feed couldn't be retrieved for any reason (missing key,
 * network error, timeout, rate limit, malformed response, no articles).
 * Never throws.
 */
export async function fetchLiveGeopoliticalEvents() {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    if (!hasWarnedMissingKey) {
      console.warn('[news] NEWS_API_KEY not set — /api/risk/events will use seed data only.')
      hasWarnedMissingKey = true
    }
    return null
  }

  const ttl = Number(process.env.NEWS_CACHE_TTL_MS) || DEFAULT_CACHE_TTL_MS
  const isCacheFresh = cache.events && Date.now() - cache.fetchedAt < ttl
  if (isCacheFresh) return cache.events

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const url = new URL(NEWS_ENDPOINT)
    url.searchParams.set('apikey', apiKey)
    url.searchParams.set('q', QUERY)
    url.searchParams.set('language', 'en')
    url.searchParams.set('category', 'business,politics,world')

    const response = await fetch(url, { signal: controller.signal })

    if (response.status === 401 || response.status === 403) {
      console.error('[news] NewsData.io rejected the API key (401/403). Check NEWS_API_KEY.')
      return null
    }
    if (response.status === 429) {
      console.warn('[news] NewsData.io rate limit hit (429). Serving cached/seed data instead.')
      return cache.events // serve stale cache if we have it, else null falls through to seed data
    }
    if (!response.ok) {
      console.error(`[news] NewsData.io returned HTTP ${response.status}.`)
      return null
    }

    let payload
    try {
      payload = await response.json()
    } catch (parseErr) {
      console.error('[news] Failed to parse NewsData.io response as JSON:', parseErr.message)
      return null
    }

    if (payload.status !== 'success' || !Array.isArray(payload.results)) {
      console.error('[news] Unexpected NewsData.io response shape:', payload.status || payload.message || 'unknown error')
      return null
    }

    const articles = payload.results.filter((a) => a && a.title)
    if (articles.length === 0) {
      console.warn('[news] NewsData.io returned no matching articles — falling back to seed data.')
      return null
    }

    const events = articles.slice(0, 8).map(mapArticleToEvent)
    cache = { events, fetchedAt: Date.now() }
    return events
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`[news] NewsData.io request timed out after ${REQUEST_TIMEOUT_MS}ms.`)
    } else {
      console.error('[news] NewsData.io request failed:', err.message)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}
