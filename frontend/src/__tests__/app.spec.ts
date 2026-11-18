import { getActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMuvdashApp } from '../createMuvdashApp'
import AppSource from '../App.vue?raw'
import { THEME_STORAGE_KEY } from '../stores/theme'
import { vuetify } from '../plugins/vuetify'

class ResizeObserverMock implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  observe(_target: Element, _options?: ResizeObserverOptions) {}

  unobserve(_target: Element) {}

  disconnect() {}
}

let app: App | undefined
let container: HTMLDivElement | undefined

class LocalStorageMock implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: new LocalStorageMock(),
  })
})

afterEach(() => {
  app?.unmount()
  container?.remove()
  app = undefined
  container = undefined
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

async function mountApplication(path = '/') {
  const instance = createMuvdashApp()
  await instance.router.push(path)
  await instance.router.isReady()

  app = instance.app
  container = document.createElement('div')
  document.body.append(container)
  app.mount(container)
  await flushPromises()

  return instance
}

async function click(element: Element | null) {
  expect(element).not.toBeNull()
  element?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
  await flushPromises()
}

describe('MuvDash application shell', () => {
  it('registers Vuetify and Pinia and renders Home through its router', async () => {
    await mountApplication()

    expect(container?.textContent).toContain('MuvDash')
    expect(container?.textContent).toContain('Studio Ghibli films')
    expect(container?.querySelector('.v-application')).not.toBeNull()
    expect(getActivePinia()).toBeDefined()
  })

  it('navigates to Contact and About and returns home through the linked logo', async () => {
    const instance = await mountApplication()

    await click(container?.querySelector('.desktop-nav a[href="/contact"]') ?? null)
    expect(container?.querySelector('h1')?.textContent).toBe('Contact')

    await click(container?.querySelector('.desktop-nav a[href="/about"]') ?? null)
    expect(container?.querySelector('h1')?.textContent).toBe('About')

    await click(container?.querySelector('.brand[href="/"]') ?? null)
    expect(instance.router.currentRoute.value.name).toBe('home')
    expect(container?.textContent).toContain('Studio Ghibli films')
  })

  it('opens the mobile navigation and closes it from an outside tap or close control', async () => {
    await mountApplication('/contact')

    const mobileNavigation = document.body.querySelector('#mobile-navigation')
    expect(mobileNavigation?.getAttribute('aria-hidden')).toBe('true')

    await click(container?.querySelector('button[aria-label="Open navigation menu"]') ?? null)
    const mobileNavigationLinks = document.body.querySelector('nav[aria-label="Mobile navigation"]')
    expect(mobileNavigationLinks?.textContent).toContain('Home')
    expect(mobileNavigationLinks?.textContent).toContain('Contact')
    expect(mobileNavigationLinks?.textContent).toContain('About')
    expect(mobileNavigation?.getAttribute('aria-hidden')).toBe('false')
    expect(document.body.querySelector('.v-navigation-drawer--active')).not.toBeNull()
    expect(
      container
        ?.querySelector('button[aria-label="Open navigation menu"]')
        ?.getAttribute('aria-expanded'),
    ).toBe('true')

    await click(document.body.querySelector('.v-navigation-drawer__scrim'))
    expect(document.body.querySelector('.v-navigation-drawer--active')).toBeNull()

    await click(container?.querySelector('button[aria-label="Open navigation menu"]') ?? null)
    await click(document.body.querySelector('button[aria-label="Close navigation menu"]'))
    expect(document.body.querySelector('.v-navigation-drawer--active')).toBeNull()
  })

  it('closes the mobile navigation after selecting a route', async () => {
    const instance = await mountApplication()

    await click(container?.querySelector('button[aria-label="Open navigation menu"]') ?? null)
    await click(document.body.querySelector('nav[aria-label="Mobile navigation"] a[href="/about"]'))

    expect(instance.router.currentRoute.value.name).toBe('about')
    expect(container?.querySelector('h1')?.textContent).toBe('About')
    expect(document.body.querySelector('.v-navigation-drawer--active')).toBeNull()
  })

  it('provides labeled responsive navigation with a visible active-route indicator', async () => {
    await mountApplication()

    const header = container?.querySelector('.app-header')
    const desktopNavigation = container?.querySelector('nav[aria-label="Primary navigation"]')
    const mobileTrigger = container?.querySelector('button[aria-label="Open navigation menu"]')
    const logo = container?.querySelector('a.brand')
    const activeHomeLink = container?.querySelector('.desktop-nav a[href="/"]')

    expect(header).not.toBeNull()
    expect(window.getComputedStyle(header as HTMLElement).position).toBe('fixed')
    expect(desktopNavigation?.classList.contains('d-none')).toBe(true)
    expect(desktopNavigation?.classList.contains('d-sm-flex')).toBe(true)
    expect(mobileTrigger?.classList.contains('d-sm-none')).toBe(true)
    expect(logo?.getAttribute('href')).toBe('/')
    expect(logo?.getAttribute('aria-label')).toBe('MuvDash home')
    expect(activeHomeLink?.getAttribute('aria-current')).toBe('page')
    expect(activeHomeLink?.classList.contains('router-link-active')).toBe(true)
    expect(container?.querySelector('#mobile-navigation')).not.toBeNull()
    expect(mobileTrigger?.getAttribute('aria-controls')).toBe('mobile-navigation')
  })

  it('uses theme colors, focus indicators, comfortable targets, and reduced-motion styles', () => {
    const styles = AppSource.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? ''

    expect(styles).toContain('rgb(var(--v-theme-secondary))')
    expect(styles).toContain('.brand:focus-visible')
    expect(styles).toContain('outline: 2px solid')
    expect(styles).toContain('min-height: 2.75rem')
    expect(styles).toContain('text-decoration: underline')
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).toContain('transition-duration: 0ms')
  })

  it('defaults to dark and restores a saved theme preference', async () => {
    await mountApplication()

    expect(vuetify.theme.global.name.value).toBe('muvdashDark')
    expect(container?.querySelector('button[aria-label="Use dark theme"]')?.getAttribute('aria-pressed')).toBe('true')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()

    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
    app?.unmount()
    container?.remove()
    await mountApplication('/contact')

    expect(vuetify.theme.global.name.value).toBe('muvdashLight')
    expect(container?.querySelector('button[aria-label="Use light theme"]')?.getAttribute('aria-pressed')).toBe('true')
  })

  it('changes theme across routes and persists the selected preference', async () => {
    await mountApplication()

    await click(container?.querySelector('button[aria-label="Use light theme"]') ?? null)
    expect(vuetify.theme.global.name.value).toBe('muvdashLight')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(container?.querySelector('button[aria-label="Use light theme"]')?.getAttribute('aria-pressed')).toBe('true')

    await click(container?.querySelector('.desktop-nav a[href="/about"]') ?? null)
    expect(container?.querySelector('h1')?.textContent).toBe('About')
    expect(vuetify.theme.global.name.value).toBe('muvdashLight')

    await click(container?.querySelector('button[aria-label="Use dark theme"]') ?? null)
    expect(vuetify.theme.global.name.value).toBe('muvdashDark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(container?.querySelector('button[aria-label="Use dark theme"]')?.getAttribute('aria-pressed')).toBe('true')
  })

  it('renders an ordered, accessible theme control in the responsive header', async () => {
    await mountApplication()

    const themeControl = container?.querySelector('.theme-control')
    const themeOptions = themeControl?.querySelectorAll('button')
    const desktopNavigation = container?.querySelector('.desktop-nav')
    const headerActions = container?.querySelector('.header-actions')
    const mobileTrigger = container?.querySelector('button[aria-label="Open navigation menu"]')

    expect(themeControl?.getAttribute('role')).toBe('group')
    expect(themeControl?.getAttribute('aria-label')).toBe('Theme')
    expect(themeOptions?.[0]?.getAttribute('aria-label')).toBe('Use light theme')
    expect(themeOptions?.[1]?.getAttribute('aria-label')).toBe('Use dark theme')
    expect(themeOptions?.[0]?.textContent).toContain('Light')
    expect(themeOptions?.[1]?.textContent).toContain('Dark')
    expect(
      themeOptions?.[0]?.querySelector('.mdi-white-balance-sunny'),
    ).not.toBeNull()
    expect(themeOptions?.[1]?.querySelector('.mdi-weather-night')).not.toBeNull()
    expect(headerActions?.contains(themeControl as Node)).toBe(true)
    expect(headerActions?.contains(mobileTrigger as Node)).toBe(true)
    expect(
      (desktopNavigation as Element).compareDocumentPosition(headerActions as Element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0)
  })

  it('falls back to dark for an invalid saved preference', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia')

    await mountApplication()

    expect(vuetify.theme.global.name.value).toBe('muvdashDark')
    expect(container?.querySelector('button[aria-label="Use dark theme"]')?.getAttribute('aria-pressed')).toBe('true')
  })
})
