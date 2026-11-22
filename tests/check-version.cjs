// Kenar çubuğundaki sürüm (web/app.js AA_VERSION) ve README'deki sürüm package.json ile aynı olmalı.
const fs = require('node:fs'),
  assert = require('node:assert/strict');
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const app = fs.readFileSync('web/app.js', 'utf8').match(/const AA_VERSION = '([^']+)'/);
assert(app, 'web/app.js içinde AA_VERSION bulunamadı.');
assert.equal(app[1], version, 'web/app.js AA_VERSION package.json sürümüyle aynı değil.');
assert.match(
  fs.readFileSync('README.md', 'utf8'),
  new RegExp('Uygulama sürümü ' + version.replace(/\./g, '\\.') + '\\]'),
  "README'deki sürüm package.json ile aynı değil."
);
console.log('Version check passed: ' + version);
