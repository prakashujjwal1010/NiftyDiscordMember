const express = require('express');
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require("cors");

// Create Express Server
const app = express();

app.use(
  cors()
);
// Configuration
const PORT = 3050;
const HOST = "localhost";
const API_SERVICE_URL = "https://discord.com/api/v8/";

// Logging
app.use(morgan('dev'));

// Info GET endpoint
app.get('/info', (req, res, next) => {
   res.send('This is a proxy service which proxies to discord APIs.');
});

// Authorization
app.use('', (req, res, next) => {
  console.log(req.headers);
   if (req.headers.authorization) {
     console.log("ok");
     res.header("Access-Control-Allow-Origin", "*");
       next();
   } else {
     console.log("no");
       res.sendStatus(403);
   }
});

// Proxy endpoints
app.use('/guilds', createProxyMiddleware({
   target: API_SERVICE_URL,
   changeOrigin: true,
}));

// Start the Proxy
app.listen(PORT, HOST, () => {
   console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
