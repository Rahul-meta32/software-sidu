const http = require('http');

http.get('http://localhost:5050/uploads/images-1781331246555-930411367.png', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  process.exit(0);
}).on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});
