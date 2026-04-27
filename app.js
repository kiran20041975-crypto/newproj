const express = require('express');
const client = require('prom-client');
const app = express();

// EJS setup
app.set('view engine', 'ejs');
app.set('views', './views');

// Prometheus setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of requests',
});

let requestCount = 0;

// Routes
app.get('/', (req, res) => {
  httpRequests.inc();
  requestCount++;
  res.render('index', {
    version: '1.0',
    requests: requestCount
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => {
  console.log('App running on port 3000');
});
