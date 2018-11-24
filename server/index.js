require('dotenv').config()
const express = require('express')
const consola = require('consola')
const bodyParser = require('body-parser')
const az = require('azure-storage')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)
app.use(bodyParser.json())

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  app.post('/submit', (req, res) => {
    console.log('got here with ' + JSON.stringify(req.body));
    let queueSvc = az.createQueueService(process.env['storageConnectionString']);
    queueSvc.messageEncoder = new az.QueueMessageEncoder.TextBase64QueueMessageEncoder;
    // Send data to the server or update your stores and such.
    queueSvc.createMessage('frontline', JSON.stringify(req.body.user), function (err) {
      console.log('message sent');
      res.send('OK');
    });
  });

  // Give nuxt middleware to express
  app.use(nuxt.render)


  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
