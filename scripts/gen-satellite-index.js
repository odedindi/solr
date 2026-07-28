const fs = require('fs');
const path = require('path');

const TEX_ROOT = path.join(__dirname, '..', 'public', 'assets', 'textures');
const outPath = path.join(__dirname, '..', 'lib', 'satellite-index.json');

function walk() {
  const entries = {};
  const planets = fs.readdirSync(TEX_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  planets.forEach(planet => {
    const satDir = path.join(TEX_ROOT, planet, 'satellites');
    if (!fs.existsSync(satDir)) return;
    const files = fs.readdirSync(satDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      const name = path.parse(file).name.toLowerCase();
      const base = name.replace(/_\d+k$/i, '').replace(/_topo(_\d+k)?$/i, '').replace(/[_\s]+/g, '_');
      const publicPath = `/assets/textures/${planet}/satellites/${file}`;

      const addEntry = (key) => {
        if (!entries[key]) {
          entries[key] = { jpg: null, webp: null };
        }
        if (ext === '.webp') {
          entries[key].webp = publicPath;
        } else {
          entries[key].jpg = publicPath;
        }
      };

      addEntry(base);
      addEntry(name);
    });
  });

  Object.keys(entries).forEach(key => {
    if (!entries[key].jpg && !entries[key].webp) {
      delete entries[key];
    }
  });

  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2));
  console.log('wrote', outPath);
}

walk();
