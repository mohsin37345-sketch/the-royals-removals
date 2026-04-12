const fs = require('fs');

const oldHtml = `<option value="" disabled selected>Select floor</option>
                          <option value="Basement">Basement</option>
                          <option value="Ground">Ground</option>
                          <option value="Ground plus first floor">Ground plus first floor</option>
                          <option value="1st and Ground Floor">1st and Ground Floor</option>
                          <option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor</option>`;

const newHtml = `<option value="" disabled selected>Select floor</option>
                          <option value="Basement">Basement</option>
                          <option value="Ground floor">Ground floor</option>
                          <option value="Ground and 1st floor">Ground and 1st floor</option>
                          <option value="1st floor">1st floor</option>
                          <option value="1st and Ground Floor">1st and Ground Floor</option>
                          <option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor</option>
                          <option value="2nd floor">2nd floor</option>
                          <option value="3rd floor">3rd floor</option>
                          <option value="4th floor">4th floor</option>
                          <option value="5th floor">5th floor</option>
                          <option value="6th floor">6th floor</option>
                          <option value="Above 6th floor">Above 6th floor</option>`;

let gaq = fs.readFileSync('templates/get-a-quote.html', 'utf8');
gaq = gaq.split(oldHtml).join(newHtml);
fs.writeFileSync('templates/get-a-quote.html', gaq);

const oldJs = `<option value="" disabled selected>Select floor</option>
              <option value="Basement">Basement</option>
              <option value="Ground">Ground</option>
              <option value="Ground plus first floor">Ground plus first floor</option>
              <option value="1st and Ground Floor">1st and Ground Floor</option>
              <option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor</option>`;

const newJs = `<option value="" disabled selected>Select floor</option>
              <option value="Basement">Basement</option>
              <option value="Ground floor">Ground floor</option>
              <option value="Ground and 1st floor">Ground and 1st floor</option>
              <option value="1st floor">1st floor</option>
              <option value="1st and Ground Floor">1st and Ground Floor</option>
              <option value="1st 2nd and Ground Floor">1st 2nd and Ground Floor</option>
              <option value="2nd floor">2nd floor</option>
              <option value="3rd floor">3rd floor</option>
              <option value="4th floor">4th floor</option>
              <option value="5th floor">5th floor</option>
              <option value="6th floor">6th floor</option>
              <option value="Above 6th floor">Above 6th floor</option>`;

let scriptjs = fs.readFileSync('script.js', 'utf8');
scriptjs = scriptjs.split(oldJs).join(newJs);
scriptjs = scriptjs.split("val !== 'Ground'").join("val !== 'Ground floor'");
fs.writeFileSync('script.js', scriptjs);

console.log('Floors updated to mega list.');
