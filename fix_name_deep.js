const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        // Exclude specific folders
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk(__dirname, function(err, results) {
  if (err) throw err;
  let fixedCount = 0;
  results.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (['.html', '.js', '.json', '.css', '.md'].includes(ext)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const replaced = content.replace(/The Royals Removals/g, 'The Royals Removals');
        if (content !== replaced) {
          fs.writeFileSync(file, replaced, 'utf8');
          console.log('Fixed:', path.basename(file));
          fixedCount++;
        }
      } catch(e) {
        // ignore read errors for lockfiles etc
      }
    }
  });
  console.log('Total files fixed:', fixedCount);
});
