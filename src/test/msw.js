import { setupServer } from 'msw/node'
import { handlers } from '../demo/mocks/handlers.js'

export const server = setupServer(...handlers)