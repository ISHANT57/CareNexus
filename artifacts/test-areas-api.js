const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/areas?limit=500',
  method: 'GET',
  headers: {
    'x-tenant-id': 'ALL',
    // We need a valid JWT token to test this, so maybe direct prisma is better.
  }
};
