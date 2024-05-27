const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
require('dotenv').config({path: './.env.local'});

const codespaceName = process.env.CODESPACE_NAME;
const port = process.env.PORT;
const passphrase = process.env.CERT_PASS;

if (!port || !codespaceName) {
  console.error('Port or codespace name is not defined, both PORT and CODESPACE_NAME env vars are required');
  process.exit(1);
}

const proxy = httpProxy.createProxyServer({
  target: {
    protocol: 'https:',
    host: `${codespaceName}-${port}.app.github.dev`,
    port: 443,
    pfx: fs.readFileSync('keys/certificate.p12'),
    passphrase,
  },
  changeOrigin: true,
});


const proxyServer = http.createServer(function (req, res) {
  proxy.web(req, res);
});

proxyServer.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
});

console.log('Proxy up and listens on port ' + port);

proxyServer.listen(port);
