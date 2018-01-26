const level = require('level')
// Create our database
// This will create or open the underlying LevelDB store.
var db = level('./masf-entries-db')

var bodyParser = require('body-parser')
var cors = require('cors')

const fs = require('fs');
const http = require('http')
const https = require('https')

var privateKey  = fs.readFileSync('domain.key', 'utf8');
var certificate = fs.readFileSync('domain.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

const express = require('express')
const app = express()

app.use(cors())
// parse application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// Controller Method
var saveEntry = (req, res) => {
    // See if ip already logged; only log once (?)
    db.get(req.body.ip, function (err, value) {
      if (!err) {
        console.log('IP already present - ', req.body.ip)
	return res.sendStatus(204)
      } else if (err.notFound) {
        var now = Date.now()
        db.put(req.body.ip, now, function(err) {
          if (err) return res.status(500).send({err: 'I/O Error!'})
          let o = {ip: req.body.ip, date: now}
          console.log('New User - ', o)
          return res.send(o)
        })
      } else {
        return res.status(500).send({err: err})
      } 
    })
}
app.post('/entry', saveEntry)

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8000);
httpsServer.listen(8443);

console.log('Express App listening on port 8000, 8443!')

