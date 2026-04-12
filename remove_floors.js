const fs = require('fs');

let gaq = fs.readFileSync('templates/get-a-quote.html', 'utf8');
gaq = gaq.replace(/<option value="1st and Ground Floor">1st and Ground Floor<\/option>\s*/g, '');
gaq = gaq.replace(/<option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor<\/option>\s*/g, '');
fs.writeFileSync('templates/get-a-quote.html', gaq);

let scriptjs = fs.readFileSync('script.js', 'utf8');
scriptjs = scriptjs.replace(/<option value="1st and Ground Floor">1st and Ground Floor<\/option>\s*/g, '');
scriptjs = scriptjs.replace(/<option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor<\/option>\s*/g, '');
fs.writeFileSync('script.js', scriptjs);

console.log('Floors removed.');
