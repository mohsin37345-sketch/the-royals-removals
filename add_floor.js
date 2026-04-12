const fs = require('fs');

const oldHtml = `<option value="" disabled selected>Select floor</option>
                          <option value="Basement">Basement</option>
                          <option value="Ground">Ground</option>
                          <option value="1st and Ground Floor">1st and Ground Floor</option>
                          <option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor</option>`;

const newHtml = `<option value="" disabled selected>Select floor</option>
                          <option value="Basement">Basement</option>
                          <option value="Ground">Ground</option>
                          <option value="Ground plus first floor">Ground plus first floor</option>
                          <option value="1st and Ground Floor">1st and Ground Floor</option>
                          <option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor</option>`;                          

let gaq = fs.readFileSync('templates/get-a-quote.html', 'utf8');
gaq = gaq.split(oldHtml).join(newHtml);
fs.writeFileSync('templates/get-a-quote.html', gaq);

const oldJs = `<option value="" disabled selected>Select floor</option>
              <option value="Basement">Basement</option>
              <option value="Ground">Ground</option>
              <option value="1st and Ground Floor">1st and Ground Floor</option>
              <option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor</option>`;

const newJs = `<option value="" disabled selected>Select floor</option>
              <option value="Basement">Basement</option>
              <option value="Ground">Ground</option>
              <option value="Ground plus first floor">Ground plus first floor</option>
              <option value="1st and Ground Floor">1st and Ground Floor</option>
              <option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor</option>`;             

let scriptjs = fs.readFileSync('script.js', 'utf8');
scriptjs = scriptjs.split(oldJs).join(newJs);
fs.writeFileSync('script.js', scriptjs);

console.log('Update complete.');
