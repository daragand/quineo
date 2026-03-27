import type { Server } from 'socket.io'

declare global {
  // eslint-disable-next-line no-var
  var __io: Server | undefined
}

/** Accès à l'instance Socket.io depuis les routes API (custom server uniquement) */
export function getIO(): Server | undefined {
  return globalThis.__io
}
