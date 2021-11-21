const { createServer } = require('net')

createServer(socket => {
  socket.pipe(process.stdout)
  const listener = data => {
    socket.write(data)
  }
  process.stdin.on('data', listener)
  socket.on('close', () => {
    process.stdin.off('data', listener)
  })
}).listen(661)
