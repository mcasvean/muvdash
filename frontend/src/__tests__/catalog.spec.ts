import { nextTick, type App } from 'vue'
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
          movie_banner: 'https://example.test/totoro-banner.jpg',
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
    expect(firstCard?.querySelector('.film-card__image-frame--portrait')).not.toBeNull()
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

  it('switches between portrait posters and landscape banners', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          {
            id: 'film-1',
            title: 'My Neighbor Totoro',
            image: 'https://example.test/totoro.jpg',
            movie_banner: 'https://example.test/totoro-banner.jpg',
          },
        ]),
      ),
    )
    const root = await mountHome()

    await vi.waitFor(() => expect(root.querySelector('.film-card')).not.toBeNull())

    const toggle = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Card orientation: portrait"]',
    )
    expect(root.querySelector('.film-card img')?.getAttribute('src')).toBe(
      'https://example.test/totoro.jpg',
    )
    expect(toggle?.getAttribute('aria-pressed')).toBe('false')
    expect(toggle?.textContent).toContain('portrait')
    toggle?.focus()
    expect(document.activeElement).toBe(toggle)

    toggle?.click()
    await vi.waitFor(() =>
      expect(root.querySelector('.film-card img')?.getAttribute('src')).toBe(
        'https://example.test/totoro-banner.jpg',
      ),
    )

    const landscapeToggle = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Card orientation: landscape"]',
    )
    expect(landscapeToggle?.getAttribute('aria-pressed')).toBe('true')
    expect(landscapeToggle?.textContent).toContain('landscape')
    expect(root.querySelector('.film-card__image-frame--landscape')).not.toBeNull()
    expect(root.querySelector('.film-card img')?.getAttribute('alt')).toBe(
      'Banner for My Neighbor Totoro',
    )

    landscapeToggle?.click()
    await vi.waitFor(() =>
      expect(root.querySelector('.film-card img')?.getAttribute('src')).toBe(
        'https://example.test/totoro.jpg',
      ),
    )
    expect(
      root
        .querySelector<HTMLButtonElement>('button[aria-label="Card orientation: portrait"]')
        ?.getAttribute('aria-pressed'),
    ).toBe('false')
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
    const landscapeImageFrameRule = rules.find((rule) =>
      rule.cssText.startsWith('.film-card__image-frame--landscape'),
    )
    const descriptionRule = rules.find((rule) => rule.cssText.startsWith('.film-card__description'))
    const reducedMotionRule = rules.find((rule) =>
      rule.cssText.startsWith('@media (prefers-reduced-motion: reduce)'),
    )

    expect(imageFrameRule?.cssText).toContain('aspect-ratio: 2 / 3')
    expect(landscapeImageFrameRule?.cssText).toContain('aspect-ratio: 16 / 9')
    expect(descriptionRule?.cssText).toContain('-webkit-line-clamp: 2')
    expect(reducedMotionRule?.cssText).toContain('animation: none')
    const toggleRule = rules.find((rule) => rule.cssText.startsWith('.card-orientation-toggle {'))
    const focusRule = rules.find((rule) => rule.cssText.startsWith('.card-orientation-toggle:focus-visible'))
    expect(toggleRule?.cssText).toContain('min-height: 2.75rem')
    expect(focusRule?.cssText).toContain('outline: 2px solid')
  })

  it.each([
    ['a failed request', jsonResponse({}, false)],
    ['an empty catalog', jsonResponse([])],
    ['a malformed film record', jsonResponse([null])],
    ['a missing film ID', jsonResponse([{}])],
    ['an empty film ID', jsonResponse([{ id: ' ' }])],
    ['duplicate film IDs', jsonResponse([{ id: 'film-1' }, { id: 'film-1' }])],
    ['an invalid optional field', jsonResponse([{ id: 'film-1', title: 42 }])],
    ['an invalid landscape image', jsonResponse([{ id: 'film-1', movie_banner: 42 }])],
    ['an invalid release date', jsonResponse([{ id: 'film-1', release_date: 1986 }])],
    ['an invalid producer', jsonResponse([{ id: 'film-1', producer: 42 }])],
    ['an invalid director', jsonResponse([{ id: 'film-1', director: 42 }])],
  ])('shows the unavailable card with retry after %s', async (_scenario, response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    const root = await mountHome()

    await vi.waitFor(() => expect(root.textContent).toContain('Unable to load films'))

    const statusMessage = root.querySelector('[role="status"]')?.textContent ?? ''
    expect(statusMessage).toContain('Unable to load films')
    expect(statusMessage).not.toContain('No results')

    const button = root.querySelector<HTMLButtonElement>('button[aria-label="Retry loading films"]')
    expect(button).not.toBeNull()
    expect(button?.textContent).toContain('Retry loading films')
    expect(button?.getAttribute('aria-label')).toBe('Retry loading films')
    expect(root.querySelectorAll('.film-card')).toHaveLength(0)
  })

  it('shows the unavailable card with retry when the fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')))
    const root = await mountHome()

    await vi.waitFor(() => expect(root.textContent).toContain('Unable to load films'))

    const button = root.querySelector<HTMLButtonElement>('button[aria-label="Retry loading films"]')
    expect(button).not.toBeNull()
    expect(button?.getAttribute('aria-label')).toBe('Retry loading films')
    expect(root.querySelectorAll('.film-card')).toHaveLength(0)
  })

  it('retries the catalog request and restores the loading/results flow', async () => {
    let resolveRetry!: (response: ReturnType<typeof jsonResponse>) => void
    const retryResponse = new Promise<ReturnType<typeof jsonResponse>>((resolve) => {
      resolveRetry = resolve
    })
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockReturnValueOnce(retryResponse)
    vi.stubGlobal('fetch', fetchMock)

    const root = await mountHome()
    await vi.waitFor(() =>
      expect(root.querySelector('button[aria-label="Retry loading films"]')).not.toBeNull(),
    )

    const button = root.querySelector<HTMLButtonElement>('button[aria-label="Retry loading films"]')
    button?.click()
    button?.click()

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    await vi.waitFor(() =>
      expect(root.querySelector('.visually-hidden')?.textContent).toContain('Loading films'),
    )
    expect(root.querySelector('[aria-busy="true"]')).not.toBeNull()

    resolveRetry(
      jsonResponse([
        { id: 'film-1', title: 'My Neighbor Totoro', image: 'https://example.test/totoro.jpg' },
      ]),
    )
    await vi.waitFor(() => expect(root.querySelectorAll('.film-card')).toHaveLength(1))
    expect(root.textContent).toContain('My Neighbor Totoro')
    expect(root.querySelector('button[aria-label="Retry loading films"]')).toBeNull()
  })

  it.each([
    ['a failed response', jsonResponse({}, false)],
    ['an empty response', jsonResponse([])],
  ])('keeps retry available after a repeated %s', async (_scenario, retryResponse) => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(retryResponse)
    vi.stubGlobal('fetch', fetchMock)

    const root = await mountHome()
    await vi.waitFor(() =>
      expect(root.querySelector('button[aria-label="Retry loading films"]')).not.toBeNull(),
    )

    const retryButton = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Retry loading films"]',
    )
    retryButton?.click()

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    await vi.waitFor(() =>
      expect(root.querySelector('button[aria-label="Retry loading films"]')?.textContent).toContain(
        'Retry loading films',
      ),
    )
    expect(root.textContent).toContain('Unable to load films')
    expect(
      root.querySelector('button[aria-label="Retry loading films"]')?.getAttribute('aria-label'),
    ).toBe('Retry loading films')
  })

  it('keeps retry available when the retry request rejects', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockRejectedValueOnce(new Error('Network unavailable'))
    vi.stubGlobal('fetch', fetchMock)

    const root = await mountHome()
    await vi.waitFor(() =>
      expect(root.querySelector('button[aria-label="Retry loading films"]')).not.toBeNull(),
    )
    root.querySelector<HTMLButtonElement>('button[aria-label="Retry loading films"]')?.click()

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    await vi.waitFor(() =>
      expect(root.querySelector('button[aria-label="Retry loading films"]')?.textContent).toContain(
        'Retry loading films',
      ),
    )
    expect(root.querySelectorAll('.film-card')).toHaveLength(0)
  })

  it('gives the retry control an accessible name and a comfortable touch target', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])))
    const root = await mountHome()

    await vi.waitFor(() =>
      expect(root.querySelector('button[aria-label="Retry loading films"]')).not.toBeNull(),
    )

    const rules = Array.from(componentStyles?.sheet?.cssRules ?? [])
    const cardRule = rules.find((rule) => rule.cssText.startsWith('.catalog-unavailable {'))
    const messageRule = rules.find((rule) =>
      rule.cssText.startsWith('.catalog-unavailable__message'),
    )
    const buttonRule = rules.find((rule) => rule.cssText.startsWith('.catalog-unavailable__button'))
    const focusRule = rules.find((rule) =>
      rule.cssText.startsWith('.catalog-unavailable__button:focus-visible'),
    )
    const button = root.querySelector<HTMLButtonElement>('button[aria-label="Retry loading films"]')
    button?.focus()

    expect(button?.tagName).toBe('BUTTON')
    expect(button?.getAttribute('type')).toBe('button')
    expect(document.activeElement).toBe(button)
    expect(buttonRule?.cssText).toContain('min-block-size: 2.75rem')
    expect(cardRule?.cssText).toContain('--v-theme-surface')
    expect(cardRule?.cssText).toContain('--v-theme-on-surface')
    expect(cardRule?.cssText).not.toContain('transition')
    expect(cardRule?.cssText).not.toContain('animation')
    expect(messageRule?.cssText).toContain('--v-theme-on-surface-variant')
    expect(focusRule?.cssText).toContain('--v-theme-secondary')
    expect(focusRule?.cssText).toContain('outline: 2px solid')
    expect(
      root.querySelector('button[aria-label="Retry loading films"]')?.getAttribute('aria-label'),
    ).toBe('Retry loading films')
  })

  it('filters locally with partial case-insensitive matches across all searchable film fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: 'film-1',
          title: 'Castle in the Sky',
          release_date: '1986',
          producer: 'Isao Takahata',
          director: 'Hayao Miyazaki',
          description: 'A young boy and girl search for a legendary city.',
        },
        {
          id: 'film-2',
          title: "Kiki's Delivery Service",
          release_date: '1989',
          producer: 'Toshio Suzuki',
          director: 'Tomomi Mochizuki',
          description: 'A young witch begins a new life.',
        },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)
    const root = await mountHome()

    await vi.waitFor(() => expect(root.querySelectorAll('.film-card')).toHaveLength(2))

    const input = root.querySelector<HTMLInputElement>('#film-search')
    expect(input).not.toBeNull()

    const searches = ['ASTLE', '986', 'sao taka', 'MIYAZ', 'legendary city']
    for (const query of searches) {
      input!.value = query
      input!.dispatchEvent(new Event('input', { bubbles: true }))
      await nextTick()
      expect(root.querySelectorAll('.film-card')).toHaveLength(1)
      expect(root.querySelector('.film-card__title')?.textContent).toBe('Castle in the Sky')
    }

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows distinct no-results feedback and clears the query back to the full catalog', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        { id: 'film-1', title: 'Castle in the Sky' },
        { id: 'film-2', title: "Kiki's Delivery Service" },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)
    const root = await mountHome()

    await vi.waitFor(() => expect(root.querySelectorAll('.film-card')).toHaveLength(2))

    const input = root.querySelector<HTMLInputElement>('#film-search')
    expect(input).not.toBeNull()
    input!.value = 'unfindable title'
    input!.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    expect(root.querySelector('.no-search-results')).not.toBeNull()
    expect(root.querySelector('[role="status"]')?.textContent).toContain('No films found')
    expect(root.querySelector('.catalog-unavailable')).toBeNull()

    const clearButton = root.querySelector<HTMLButtonElement>(
      '.no-search-results button[aria-label="Clear search"]',
    )
    expect(clearButton?.textContent).toContain('Clear search')
    clearButton?.click()
    await nextTick()

    expect(root.querySelectorAll('.film-card')).toHaveLength(2)
    expect(input?.value).toBe('')
    expect(document.activeElement).toBe(input)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps search sticky, compacts it on scroll, and provides accessible controls', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse([{ id: 'film-1', title: 'Castle in the Sky' }])),
    )
    const root = await mountHome()
    await vi.waitFor(() => expect(root.querySelector('.catalog-search')).not.toBeNull())

    const form = root.querySelector('.catalog-search')
    const input = root.querySelector<HTMLInputElement>('#film-search')
    input!.value = 'castle'
    input!.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    const clearButton = root.querySelector<HTMLButtonElement>(
      '.catalog-search__clear[aria-label="Clear search"]',
    )
    const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY')
    const rules = Array.from(componentStyles?.sheet?.cssRules ?? [])
    const toolbarRule = rules.find((rule) => rule.cssText.startsWith('.catalog-search {'))
    const compactRule = rules.find((rule) => rule.cssText.startsWith('.catalog-search--compact'))
    const inputRule = rules.find((rule) => rule.cssText.startsWith('.catalog-search__input {'))
    const clearRule = rules.find((rule) => rule.cssText.startsWith('.catalog-search__clear {'))
    const focusRule = rules.find((rule) =>
      rule.cssText.startsWith('.catalog-search__input:focus-visible'),
    )
    const reducedMotionRule = rules.find(
      (rule) =>
        rule.cssText.startsWith('@media (prefers-reduced-motion: reduce)') &&
        rule.cssText.includes('.catalog-search {'),
    )

    expect(form?.getAttribute('role')).toBe('search')
    expect(input?.getAttribute('type')).toBe('search')
    expect(root.querySelector('label[for="film-search"]')?.textContent).toBe('Search films')
    expect(clearButton?.textContent).toContain('Clear search')
    input?.focus()
    expect(document.activeElement).toBe(input)
    expect(toolbarRule?.cssText).toContain('position: sticky')
    expect(toolbarRule?.cssText).toContain('top: 4rem')
    expect(inputRule?.cssText).toContain('min-height: 2.75rem')
    expect(clearRule?.cssText).toContain('min-height: 2.75rem')
    expect(focusRule?.cssText).toContain('outline: 2px solid')
    expect(focusRule?.cssText).toContain('.catalog-search__clear:focus-visible')
    clearButton?.focus()
    expect(document.activeElement).toBe(clearButton)
    input?.focus()
    expect(reducedMotionRule?.cssText).toContain('transition: none')

    try {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
      window.dispatchEvent(new Event('scroll'))
      await nextTick()
      expect(form?.classList.contains('catalog-search--compact')).toBe(true)
      expect(compactRule?.cssText).toContain('padding-block: 0.25rem')
    } finally {
      if (originalScrollY) {
        Object.defineProperty(window, 'scrollY', originalScrollY)
      } else {
        Reflect.deleteProperty(window, 'scrollY')
      }
    }
  })
})
