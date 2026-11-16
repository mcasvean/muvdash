import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMuvdashApp } from '../createMuvdashApp'
import FilmCardSource from '../components/FilmCard.vue?raw'
import HomeViewSource from '../views/HomeView.vue?raw'

class ResizeObserverMock implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  observe(_target: Element, _options?: ResizeObserverOptions) {}

  unobserve(_target: Element) {}

  disconnect() {}
}

let app: App | undefined
let container: HTMLDivElement | undefined
let componentStyles: HTMLStyleElement | undefined

function extractStyle(source: string) {
  return source.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? ''
}

function mountHome() {
  const instance = createMuvdashApp()

  return instance.router.push('/').then(async () => {
    await instance.router.isReady()
    app = instance.app
    container = document.createElement('div')
    document.body.append(container)
    app.mount(container)
    return container
  })
}

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    json: vi.fn().mockResolvedValue(body),
  }
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  componentStyles = document.createElement('style')
  componentStyles.textContent = [extractStyle(FilmCardSource), extractStyle(HomeViewSource)].join('\n')
  document.head.append(componentStyles)
})

afterEach(() => {
  app?.unmount()
  container?.remove()
  componentStyles?.remove()
  app = undefined
  container = undefined
  componentStyles = undefined
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('film catalog', () => {
  it('requests the catalog once and exposes an accessible loading state while pending', async () => {
    let resolveResponse!: (response: ReturnType<typeof jsonResponse>) => void
    const response = new Promise<ReturnType<typeof jsonResponse>>((resolve) => {
      resolveResponse = resolve
    })
    const fetchMock = vi.fn().mockReturnValue(response)
    vi.stubGlobal('fetch', fetchMock)

    const root = await mountHome()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('https://ghibliapi.vercel.app/films')
    expect(root.querySelector('.film-skeleton')).not.toBeNull()
    expect(root.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(root.querySelector('[role="status"]')?.textContent).toContain('Loading films')
    expect(root.querySelectorAll('.film-card')).toHaveLength(0)
    expect(root.textContent).not.toContain('Totoro')

    resolveResponse(jsonResponse([]))
  })

  it('renders film cards with only the available fields and makes no card requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: 'film-1',
          title: 'My Neighbor Totoro',
          image: 'https://example.test/totoro.jpg',
          description:
            'Two sisters discover forest spirits. '.repeat(20),
        },
        { id: 'film-2', title: 'Only Yesterday' },
        { id: 'film-3', image: 'https://example.test/untitled.jpg' },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)

    const root = await mountHome()
    await vi.waitFor(() => expect(root.querySelectorAll('.film-card')).toHaveLength(3))

    const cards = root.querySelectorAll('.film-card')
    const firstCard = cards.item(0)
    expect(firstCard?.textContent).toContain('My Neighbor Totoro')
    expect(firstCard?.textContent).toContain('Two sisters discover forest spirits.')
    expect(firstCard?.querySelector('img')?.getAttribute('alt')).toBe('Poster for My Neighbor Totoro')
    expect(firstCard?.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.test/totoro.jpg',
    )
    const partialCard = cards.item(1)
    expect(partialCard?.textContent).toContain('Only Yesterday')
    expect(partialCard?.querySelector('img')).toBeNull()
    expect(partialCard?.querySelector('.film-card__description')).toBeNull()
    expect(partialCard?.querySelector('.film-card__image-frame')).not.toBeNull()
    const imageOnlyCard = cards.item(2)
    expect(imageOnlyCard?.querySelector('img')?.getAttribute('alt')).toBe('Film poster')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(root.textContent).not.toContain('film-1')
  })

  it('uses two, four, and six-column responsive grid breakpoints', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse([{ id: 'film-1', title: 'Totoro' }])),
    )
    const root = await mountHome()

    await vi.waitFor(() => expect(root.querySelector('.film-card')).not.toBeNull())

    const column = root.querySelector('.film-grid .v-col')
    expect(column?.classList.contains('v-col--cols-6')).toBe(true)
    expect(column?.classList.contains('v-col--cols-sm-3')).toBe(true)
    expect(column?.classList.contains('v-col--cols-md-3')).toBe(true)
    expect(column?.classList.contains('v-col--cols-lg-2')).toBe(true)

    const responsiveColumns = [
      { width: 375, className: 'v-col--cols-6', count: 2 },
      { width: 1024, className: 'v-col--cols-md-3', count: 4 },
      { width: 1440, className: 'v-col--cols-lg-2', count: 6 },
    ]
    for (const breakpoint of responsiveColumns) {
      const span = Number(breakpoint.className.split('-').pop())
      expect(column?.classList.contains(breakpoint.className)).toBe(true)
      expect(12 / span).toBe(breakpoint.count)
    }
  })

  it('keeps film card dimensions, truncation, and reduced-motion behavior', () => {
    const rules = Array.from(componentStyles?.sheet?.cssRules ?? [])
    const imageFrameRule = rules.find((rule) => rule.cssText.startsWith('.film-card__image-frame'))
    const descriptionRule = rules.find((rule) => rule.cssText.startsWith('.film-card__description'))
    const reducedMotionRule = rules.find((rule) =>
      rule.cssText.startsWith('@media (prefers-reduced-motion: reduce)'),
    )

    expect(imageFrameRule?.cssText).toContain('aspect-ratio: 2 / 3')
    expect(descriptionRule?.cssText).toContain('-webkit-line-clamp: 2')
    expect(reducedMotionRule?.cssText).toContain('animation: none')
  })

  it.each([
    ['a failed request', jsonResponse({}, false)],
    ['an empty catalog', jsonResponse([])],
    ['a malformed film record', jsonResponse([null])],
    ['a missing film ID', jsonResponse([{}])],
    ['an empty film ID', jsonResponse([{ id: ' ' }])],
    ['duplicate film IDs', jsonResponse([{ id: 'film-1' }, { id: 'film-1' }])],
    ['an invalid optional field', jsonResponse([{ id: 'film-1', title: 42 }])],
  ])('shows the temporary unavailable message after %s', async (_scenario, response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    const root = await mountHome()

    await vi.waitFor(() => expect(root.textContent).toContain('Unable to load films'))

    expect(root.querySelector('button')).toBeNull()
    expect(root.querySelectorAll('.film-card')).toHaveLength(0)
  })

  it('shows the temporary unavailable message when the fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')))
    const root = await mountHome()

    await vi.waitFor(() => expect(root.textContent).toContain('Unable to load films'))

    expect(root.querySelector('button')).toBeNull()
    expect(root.querySelectorAll('.film-card')).toHaveLength(0)
  })
})