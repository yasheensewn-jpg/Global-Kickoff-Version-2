const http = require('http');
http.get('http://localhost:5001/src/css/style.css', (res) => {
  console.log('CSS Status:', res.statusCode);
});
http.get('http://localhost:5001/src/js/game.js', (res) => {
  console.log('JS Status:', res.statusCode);
});
http.get('http://localhost:5001/Rangitoto%20Background.jpeg', (res) => {
  console.log('Img Status:', res.statusCode);
});
