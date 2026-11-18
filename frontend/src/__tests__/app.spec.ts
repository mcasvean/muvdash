import { getActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMuvdashApp } from '../createMuvdashApp'
import AppSource from '../App.vue?raw'

class ResizeObserverMock implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}

  observe(_target: Element, _options?: ResizeObserverOptions) {}

  unobserve(_target: Element) {}

  disconnect() {}
}

let app: App | undefined
let container: HTMLDivElement | undefined

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

afterEach(() => {
  app?.unmount()
  container?.remove()
  app = undefined
  container = undefined
  vi.unstubAllGlobals()
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
})
