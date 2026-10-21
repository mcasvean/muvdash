import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMuvdashApp } from '../createMuvdashApp'

class ResizeObserverMock implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  observe(_target: Element, _options?: ResizeObserverOptions) {}

  unobserve(_target: Element) {}

  disconnect() {}
}

let app: App | undefined
let container: HTMLDivElement | undefined

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
})

afterEach(() => {
  app?.unmount()
  container?.remove()
  app = undefined
  container = undefined
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

    resolveResponse(jsonResponse([]))
  })

  it('renders film cards with only the available fields and makes no card requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: 'film-1',
          title: 'My Neighbor Totoro',
          image: 'https://example.test/totoro.jpg',
          description: 'Two sisters discover forest spirits.',
        },
        { id: 'film-2', title: 'Only Yesterday' },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)

    const root = await mountHome()
    await vi.waitFor(() => expect(root.querySelectorAll('.film-card')).toHaveLength(2))

    const cards = root.querySelectorAll('.film-card')
    const firstCard = cards.item(0)
    expect(firstCard?.textContent).toContain('My Neighbor Totoro')
    expect(firstCard?.textContent).toContain('Two sisters discover forest spirits.')
    expect(firstCard?.querySelector('img')?.getAttribute('alt')).toBe('Poster for My Neighbor Totoro')

    const partialCard = cards.item(1)
    expect(partialCard?.textContent).toContain('Only Yesterday')
    expect(partialCard?.querySelector('img')).toBeNull()
    expect(partialCard?.querySelector('.film-card__description')).toBeNull()
    expect(partialCard?.querySelector('.film-card__image-frame')).not.toBeNull()
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
    expect(column?.classList.contains('v-col--cols-xl-2')).toBe(true)
  })

  it.each([
    ['a failed request', jsonResponse({}, false)],
    ['an empty catalog', jsonResponse([])],
  ])('shows the temporary unavailable message after %s', async (_scenario, response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    const root = await mountHome()

    await vi.waitFor(() => expect(root.textContent).toContain('Unable to load films'))

    expect(root.querySelector('button')).toBeNull()
    expect(root.querySelectorAll('.film-card')).toHaveLength(0)
  })
})