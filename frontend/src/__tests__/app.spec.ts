import { getActivePinia } from 'pinia'
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

describe('MuvDash application shell', () => {
  it('registers Vuetify and Pinia and renders Home through its router', async () => {
    const instance = createMuvdashApp()
    await instance.router.push('/')
    await instance.router.isReady()

    app = instance.app

    container = document.createElement('div')
    document.body.append(container)
    app.mount(container)

    expect(container.textContent).toContain('MuvDash')
    expect(container.textContent).toContain('Studio Ghibli films')
    expect(container.querySelector('.v-application')).not.toBeNull()
    expect(getActivePinia()).toBeDefined()
  })
})