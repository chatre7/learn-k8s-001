import express from 'express';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const serviceName = process.env.SERVICE_NAME || 'node-api';

app.get('/healthz', (req, res) => {
  res.type('text/plain').send('ok');
});

app.get('/', (req, res) => {
  res.json({
    service: serviceName,
    message: `Hello from ${serviceName}!`,
    port,
    time: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`[${serviceName}] listening on port ${port}`);
});

