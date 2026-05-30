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
    const files = fs.readdirSync(satDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
    files.forEach(file => {
      const name = path.parse(file).name.toLowerCase();
      // normalize names like moon_4k -> moon
      const base = name.replace(/_\d+k$/i, '').replace(/_topo(_\d+k)?$/i, '').replace(/[_\s]+/g, '_');
      const publicPath = `/assets/textures/${planet}/satellites/${file}`;
      // prefer exact base name mapping
      if (!entries[base]) entries[base] = publicPath;
      // also map raw filename (without suffix)
      if (!entries[name]) entries[name] = publicPath;
    });
  });

  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2));
  console.log('wrote', outPath);
}

walk();
