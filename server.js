const { createServer } = require('http')
const next = require('next')
const { Server } = require('socket.io')

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: '*' },
  })

  // Rend l'instance io accessible aux routes API
  globalThis.__io = io

  io.on('connection', (socket) => {
    socket.on('join:tirage', (tirageId) => {
      socket.join(`tirage:${tirageId}`)
    })
    socket.on('join:session', (sessionId) => {
      socket.join(`session:${sessionId}`)
    })
  })

  httpServer.listen(port, () => {
    console.log(
      `> Serveur prêt sur http://localhost:${port} [${dev ? 'développement' : 'production'}]`
    )
  })
})
