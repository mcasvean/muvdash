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

function isTooltipOpen(trigger: Element | null | undefined) {
  const tooltipId = trigger?.getAttribute('aria-describedby')
  return (
    document
      .getElementById(tooltipId ?? '')
      ?.closest('.v-overlay')
      ?.classList.contains('v-overlay--active') ?? false
  )
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
  vi.stubGlobal('visualViewport', new EventTarget())
  componentStyles = document.createElement('style')
  componentStyles.textContent = [extractStyle(FilmCardSource), extractStyle(HomeViewSource)].join(
    '\n',
  )
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
          description: 'Two sisters discover forest spirits. '.repeat(20),
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
    expect(firstCard?.querySelector('img')?.getAttribute('alt')).toBe(
      'Poster for My Neighbor Totoro',
    )
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

  it('opens the selected film details with available core fields in order and closes cleanly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          {
            id: 'film-1',
            title: 'My Neighbor Totoro',
            image: 'https://example.test/totoro.jpg',
            description: 'Two sisters discover forest spirits.',
            director: 'Hayao Miyazaki',
            producer: 'Toru Hara',
            release_date: '1988',
            running_time: '86',
            rt_score: '94',
          },
          { id: 'film-2', title: 'Only Yesterday' },
        ]),
      ),
    )
    const root = await mountHome()

    await vi.waitFor(() => expect(root.querySelectorAll('.film-card')).toHaveLength(2))

    const detailsAction = root.querySelector<HTMLButtonElement>(
      '.film-card__details-action[aria-label="View details for My Neighbor Totoro"]',
    )
    expect(detailsAction).not.toBeNull()
    detailsAction?.click()

    await vi.waitFor(() => expect(document.body.querySelector('.film-details')).not.toBeNull())

    const dialog = document.body.querySelector('.film-details')
    expect(dialog?.querySelector('h2#film-details-title')?.textContent).toContain(
      'My Neighbor Totoro',
    )
    expect(dialog?.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.test/totoro.jpg',
    )
    expect(
      Array.from(dialog?.querySelectorAll('.film-details__field dt') ?? []).map((label) =>
        label.textContent?.trim(),
      ),
    ).toEqual(['Description', 'Director', 'Producer', 'Release date', 'Running time', 'Score'])
    expect(
      Array.from(dialog?.querySelectorAll('.film-details__field dd') ?? []).map((value) =>
        value.textContent?.trim(),
      ),
    ).toEqual([
      'Two sisters discover forest spirits.',
      'Hayao Miyazaki',
      'Toru Hara',
      '1988',
      '86 minutes',
      '94%',
    ])

    const closeButton = dialog?.querySelector<HTMLButtonElement>(
      'button[aria-label="Close film details"]',
    )
    expect(closeButton).not.toBeNull()
    closeButton?.focus()
    expect(document.activeElement).toBe(closeButton)
    closeButton?.click()
    await vi.waitFor(() => expect(document.body.querySelector('.film-details')).toBeNull())
    expect(root.querySelector('.film-card')).not.toBeNull()
  })

  it('omits absent detail fields instead of rendering placeholders', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          {
            id: 'film-1',
            title: 'Only Yesterday',
            image: 'https://example.test/only-yesterday.jpg',
            director: 'Isao Takahata',
          },
        ]),
      ),
    )
    const root = await mountHome()

    await vi.waitFor(() => expect(root.querySelector('.film-card')).not.toBeNull())
    root.querySelector<HTMLButtonElement>('.film-card__details-action')?.click()
    await vi.waitFor(() => expect(document.body.querySelector('.film-details')).not.toBeNull())

    const dialog = document.body.querySelector('.film-details')
    expect(
      Array.from(dialog?.querySelectorAll('.film-details__field dt') ?? []).map((label) =>
        label.textContent?.trim(),
      ),
    ).toEqual(['Director'])
    expect(dialog?.textContent).not.toContain('film-1')
    expect(dialog?.textContent).not.toContain('undefined')
    expect(dialog?.textContent).not.toContain('null')
  })

  it('resolves usable selected-film relationships and omits unusable or untrusted data', async () => {
    const personUrl = 'https://ghibliapi.vercel.app/people/person-1'
    const speciesUrl = 'https://ghibliapi.vercel.app/species/species-1'
    const emptySpeciesUrl = 'https://ghibliapi.vercel.app/species/species-empty'
    const locationUrl = 'https://ghibliapi.vercel.app/locations/location-1'
    const vehicleUrl = 'https://ghibliapi.vercel.app/vehicles/vehicle-1'
    const untrustedUrl = 'https://example.test/vehicles/other'
    const film = {
      id: 'film-1',
      title: 'Castle in the Sky',
      description: 'A floating castle adventure.',
      people: [personUrl, personUrl],
      species: [speciesUrl, emptySpeciesUrl],
      locations: [locationUrl, 'https://ghibliapi.vercel.app/locations/'],
      vehicles: [vehicleUrl, untrustedUrl],
    }
    const responses = new Map<string, ReturnType<typeof jsonResponse>>([
      ['https://ghibliapi.vercel.app/films', jsonResponse([film])],
      [
        personUrl,
        jsonResponse({
          id: 'person-1',
          name: 'Sheeta',
          age: '13',
          gender: 'Female',
          eye_color: 'Black',
          hair_color: 'Brown',
          url: personUrl,
        }),
      ],
      [speciesUrl, jsonResponse({ id: 'species-1', name: 'Human', classification: 'Mammal' })],
      [emptySpeciesUrl, jsonResponse({ id: 'species-empty', url: speciesUrl })],
      [
        locationUrl,
        jsonResponse({
          id: 'location-1',
          name: 'Laputa',
          climate: 'Continental',
          terrain: 'Island',
        }),
      ],
      [
        vehicleUrl,
        jsonResponse({
          id: 'vehicle-1',
          name: 'Tiger Moth',
          description: 'A pirate airship.',
          vehicle_class: 'Airship',
        }),
      ],
    ])
    const fetchMock = vi.fn((input: string | URL) =>
      Promise.resolve(responses.get(String(input)) ?? jsonResponse({}, false)),
    )
    vi.stubGlobal('fetch', fetchMock)

    const root = await mountHome()
    await vi.waitFor(() => expect(root.querySelector('.film-card')).not.toBeNull())
    expect(fetchMock).toHaveBeenCalledTimes(1)

    root.querySelector<HTMLButtonElement>('.film-card__details-action')?.click()
    await vi.waitFor(() =>
      expect(document.body.querySelector('.film-details__related-category')).not.toBeNull(),
    )

    const dialog = document.body.querySelector('.film-details')
    expect(
      Array.from(dialog?.querySelectorAll('.film-details__related-category h3') ?? []).map(
        (heading) => heading.textContent?.trim(),
      ),
    ).toEqual(['People', 'Species', 'Locations', 'Vehicles'])
    expect(dialog?.textContent).toContain('Castle in the Sky')
    expect(dialog?.textContent).toContain('Sheeta')
    expect(dialog?.textContent).toContain('13')
    expect(dialog?.textContent).toContain('Female')
    expect(dialog?.textContent).toContain('Human')
    expect(dialog?.textContent).toContain('Mammal')
    expect(dialog?.textContent).toContain('Laputa')
    expect(dialog?.textContent).toContain('Continental')
    expect(dialog?.textContent).toContain('Tiger Moth')
    expect(dialog?.textContent).toContain('A pirate airship.')
    expect(dialog?.textContent).not.toContain('location-1')
    expect(dialog?.textContent).not.toContain('person-1')
    expect(dialog?.textContent).not.toContain('vehicle-1')
    expect(dialog?.textContent).not.toContain('species-empty')
    expect(dialog?.textContent).not.toContain('https://')
    expect(fetchMock.mock.calls.map(([url]) => String(url)).sort()).toEqual(
      [
        'https://ghibliapi.vercel.app/films',
        emptySpeciesUrl,
        locationUrl,
        personUrl,
        speciesUrl,
        vehicleUrl,
      ].sort(),
    )
  })

  it('shows only an error message and close control when a related request fails', async () => {
    const personUrl = 'https://ghibliapi.vercel.app/people/person-1'
    const missingSpeciesUrl = 'https://ghibliapi.vercel.app/species/species-missing'
    let resolveFailedResponse!: (response: ReturnType<typeof jsonResponse>) => void
    const failedResponse = new Promise<ReturnType<typeof jsonResponse>>((resolve) => {
      resolveFailedResponse = resolve
    })
    const film = {
      id: 'film-1',
      title: 'Castle in the Sky',
      description: 'A floating castle adventure.',
      people: [personUrl],
      species: [missingSpeciesUrl],
    }
    const responses = new Map<string, ReturnType<typeof jsonResponse>>([
      ['https://ghibliapi.vercel.app/films', jsonResponse([film])],
      [personUrl, jsonResponse({ id: 'person-1', name: 'Sheeta' })],
    ])
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string | URL) => {
        if (String(input) === missingSpeciesUrl) return failedResponse
        return Promise.resolve(responses.get(String(input)) ?? jsonResponse({}, false))
      }),
    )

    const root = await mountHome()
    await vi.waitFor(() => expect(root.querySelector('.film-card')).not.toBeNull())
    root.querySelector<HTMLButtonElement>('.film-card__details-action')?.click()
    await vi.waitFor(() =>
      expect(document.body.querySelector('.film-details__loading-message')).not.toBeNull(),
    )
    expect(document.body.querySelector('#film-details-title')).toBeNull()
    expect(document.body.querySelector('.film-details__fields')).toBeNull()
    resolveFailedResponse(jsonResponse({}, false))
    await vi.waitFor(() =>
      expect(document.body.querySelector('.film-details__error-message')).not.toBeNull(),
    )

    const dialog = document.body.querySelector('.film-details')
    expect(dialog?.textContent).toContain('Oops, the details are not available right now.')
    expect(dialog?.querySelector('#film-details-title')).toBeNull()
    expect(dialog?.querySelector('.film-details__image-frame')).toBeNull()
    expect(dialog?.querySelector('.film-details__fields')).toBeNull()
    expect(dialog?.querySelector('.film-details__related-category')).toBeNull()
    expect(dialog?.querySelector('button[aria-label="Close film details"]')).not.toBeNull()
    expect(dialog?.querySelector('button[aria-label*="Retry"]')).toBeNull()

    dialog?.querySelector<HTMLButtonElement>('button[aria-label="Close film details"]')?.click()
    await vi.waitFor(() => expect(document.body.querySelector('.film-details')).toBeNull())
    expect(root.querySelector('.film-card')).not.toBeNull()
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

    const mobileToggle = root.querySelector<HTMLButtonElement>(
      '.card-orientation-mobile button[aria-label="Card orientation: portrait"]',
    )
    const mobileHelp = root.querySelector<HTMLButtonElement>(
      '.card-orientation-mobile button[aria-label="Help: card orientation"]',
    )
    expect(root.querySelector('.film-card img')?.getAttribute('src')).toBe(
      'https://example.test/totoro.jpg',
    )
    expect(mobileToggle?.getAttribute('aria-pressed')).toBe('false')
    expect(mobileToggle?.textContent).toContain('portrait')
    expect(root.querySelector('.card-orientation-desktop')?.classList.contains('d-md-flex')).toBe(
      true,
    )
    expect(root.querySelector('.card-orientation-mobile')?.classList.contains('d-md-none')).toBe(
      true,
    )

    mobileToggle?.click()
    await vi.waitFor(() =>
      expect(root.querySelector('.film-card img')?.getAttribute('src')).toBe(
        'https://example.test/totoro-banner.jpg',
      ),
    )
    expect(mobileToggle?.getAttribute('aria-pressed')).toBe('true')

    const landscapeToggle = root.querySelector<HTMLButtonElement>(
      '.card-orientation-mobile button[aria-label="Card orientation: landscape"]',
    )
    expect(landscapeToggle?.getAttribute('aria-pressed')).toBe('true')
    expect(landscapeToggle?.textContent).toContain('landscape')
    expect(root.querySelector('.film-card__image-frame--landscape')).not.toBeNull()
    expect(root.querySelector('.film-card img')?.getAttribute('alt')).toBe(
      'Banner for My Neighbor Totoro',
    )

    mobileHelp?.click()
    await vi.waitFor(() => expect(isTooltipOpen(mobileHelp)).toBe(true))
    expect(isTooltipOpen(mobileHelp)).toBe(true)
    const tooltipDescriptionId = mobileHelp?.getAttribute('aria-describedby')
    expect(document.getElementById(tooltipDescriptionId ?? '')?.textContent).toContain(
      'Switch between portrait and landscape card images',
    )
    expect(document.getElementById(tooltipDescriptionId ?? '')?.getAttribute('role')).toBe(
      'tooltip',
    )

    mobileHelp?.click()
    await vi.waitFor(() => expect(isTooltipOpen(mobileHelp)).toBe(false))

    await new Promise((resolve) => setTimeout(resolve, 60))
    mobileHelp?.click()
    await vi.waitFor(() => expect(isTooltipOpen(mobileHelp)).toBe(true))
    landscapeToggle?.click()
    await vi.waitFor(() =>
      expect(root.querySelector('.film-card img')?.getAttribute('src')).toBe(
        'https://example.test/totoro.jpg',
      ),
    )
    expect(isTooltipOpen(mobileHelp)).toBe(false)

    expect(
      root
        .querySelector<HTMLButtonElement>(
          '.card-orientation-mobile button[aria-label="Card orientation: portrait"]',
        )
        ?.getAttribute('aria-pressed'),
    ).toBe('false')
  })

  it('shows card-view guidance on desktop button hover and focus', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse([{ id: 'film-1', title: 'Totoro' }])),
    )
    const root = await mountHome()

    await vi.waitFor(() => expect(root.querySelector('.film-card')).not.toBeNull())

    const desktopToggle = root.querySelector<HTMLButtonElement>(
      '.card-orientation-desktop button[aria-label="Card orientation: portrait"]',
    )
    expect(desktopToggle).not.toBeNull()

    desktopToggle?.dispatchEvent(new MouseEvent('mouseenter'))
    await vi.waitFor(() => expect(isTooltipOpen(desktopToggle)).toBe(true))
    expect(
      document.getElementById(desktopToggle?.getAttribute('aria-describedby') ?? '')?.textContent,
    ).toContain('Switch between portrait and landscape card images')
    expect(
      document
        .getElementById(desktopToggle?.getAttribute('aria-describedby') ?? '')
        ?.getAttribute('role'),
    ).toBe('tooltip')

    desktopToggle?.dispatchEvent(new MouseEvent('mouseleave'))
    await vi.waitFor(() => expect(isTooltipOpen(desktopToggle)).toBe(false))
  })

  it('left-aligns capped card tracks with matching toolbar and header boundaries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse([{ id: 'film-1', title: 'Totoro' }])),
    )
    const root = await mountHome()

    await vi.waitFor(() => expect(root.querySelector('.film-card')).not.toBeNull())

    const grid = root.querySelector('.film-grid')
    const rules = Array.from(componentStyles?.sheet?.cssRules ?? [])
    const shellRule = rules.find((rule) => rule.cssText.startsWith('.home-shell {'))
    const toolbarRule = rules.find((rule) => rule.cssText.startsWith('.catalog-search {'))
    const gridRule = rules.find((rule) => rule.cssText.startsWith('.film-grid {'))
    const filmCardRule = rules.find((rule) => rule.cssText.startsWith('.film-card {'))
    const skeletonRule = rules.find((rule) => rule.cssText.startsWith('.film-skeleton {'))
    const mobileGridRule = rules.find((rule) =>
      rule.cssText.startsWith('@media (max-width: 600px)'),
    )

    expect(grid?.querySelector('.film-card')?.parentElement).toBe(grid)
    expect(grid?.querySelector('.v-col')).toBeNull()
    expect(shellRule?.cssText).toContain('width: min(100% - 2rem, 80rem)')
    expect(shellRule?.cssText).toContain('margin-inline: auto')
    expect(toolbarRule?.cssText).toContain('padding: 0.75rem 0')
    expect(gridRule?.cssText).toContain('display: grid')
    expect(gridRule?.cssText).toContain('repeat(auto-fill')
    expect(gridRule?.cssText).toContain('14rem')
    expect(gridRule?.cssText).toContain('1fr')
    expect(gridRule?.cssText).toContain('justify-content: start')
    expect(gridRule?.cssText).toContain('gap: 1rem 0.75rem')
    expect(filmCardRule?.cssText).toContain('max-width: 18rem')
    expect(filmCardRule?.cssText).toContain('max-height: 36rem')
    expect(skeletonRule?.cssText).toContain('max-width: 18rem')
    expect(skeletonRule?.cssText).toContain('max-height: 36rem')
    expect(mobileGridRule?.cssText).toContain('.film-grid {')
    expect(mobileGridRule?.cssText).toContain('repeat(2, minmax(0, 1fr))')
  })

  it('keeps a single search result left-aligned and within the card size limits', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          { id: 'film-1', title: 'My Neighbor Totoro' },
          { id: 'film-2', title: 'Castle in the Sky' },
        ]),
      ),
    )
    const root = await mountHome()
    await vi.waitFor(() => expect(root.querySelectorAll('.film-card')).toHaveLength(2))

    const input = root.querySelector<HTMLInputElement>('#film-search')
    input!.value = 'totoro'
    input!.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    const grid = root.querySelector('.film-grid')
    const rules = Array.from(componentStyles?.sheet?.cssRules ?? [])
    const gridRule = rules.find((rule) => rule.cssText.startsWith('.film-grid {'))
    const cardRule = rules.find((rule) => rule.cssText.startsWith('.film-card {'))
    expect(grid?.querySelectorAll('.film-card')).toHaveLength(1)
    expect(gridRule?.cssText).toContain('repeat(auto-fill')
    expect(gridRule?.cssText).toContain('1fr')
    expect(gridRule?.cssText).toContain('justify-content: start')
    expect(cardRule?.cssText).toContain('max-width: 18rem')
    expect(cardRule?.cssText).toContain('max-height: 36rem')
  })

  it('keeps film card dimensions, truncation, and reduced-motion behavior', () => {
    const rules = Array.from(componentStyles?.sheet?.cssRules ?? [])
    const imageFrameRule = rules.find((rule) => rule.cssText.startsWith('.film-card__image-frame'))
    const landscapeImageFrameRule = rules.find((rule) =>
      rule.cssText.startsWith('.film-card__image-frame--landscape'),
    )
    const descriptionRule = rules.find((rule) => rule.cssText.startsWith('.film-card__description'))
    const orientationFocusRule = rules.find((rule) =>
      rule.cssText.includes('.card-orientation-toggle:focus-visible'),
    )
    const reducedMotionRules = rules.filter((rule) =>
      rule.cssText.startsWith('@media (prefers-reduced-motion: reduce)'),
    )

    expect(imageFrameRule?.cssText).toContain('aspect-ratio: 2 / 3')
    expect(landscapeImageFrameRule?.cssText).toContain('aspect-ratio: 16 / 9')
    expect(descriptionRule?.cssText).toContain('-webkit-line-clamp: 2')
    expect(
      reducedMotionRules.some((rule) => rule.cssText.includes('transition-duration: 0ms')),
    ).toBe(true)
    expect(reducedMotionRules.some((rule) => rule.cssText.includes('animation: none'))).toBe(true)
    const toggleRule = rules.find((rule) => rule.cssText.startsWith('.card-orientation-toggle {'))
    expect(toggleRule?.cssText).toContain('min-height: 2.75rem')
    expect(orientationFocusRule?.cssText).toContain('outline: 2px solid')
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
    const placeholderRule = rules.find((rule) =>
      rule.cssText.startsWith('.catalog-search__input::placeholder'),
    )
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
    expect(placeholderRule?.cssText).toContain('color: rgb(var(--v-theme-on-surface))')
    expect(placeholderRule?.cssText).toContain('opacity: 1')
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
