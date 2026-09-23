import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './msw.js'
import { resetStore, clearRequestLog } from '../demo/mocks/handlers.js'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  server.resetHandlers()
  resetStore()
  clearRequestLog()
})
afterAll(() => server.close())