const express = require('express');
const client = require('prom-client');

const app = express();

// Create registry
const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ register });

// Custom metric (optional but good)
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of requests',
});

// Routes
app.get('/', (req, res) => {
  httpRequests.inc();
  res.json({ message: 'Hello DevOps!', version: '1.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start server
app.listen(3000, () => {
  console.log('App running on port 3000');
});