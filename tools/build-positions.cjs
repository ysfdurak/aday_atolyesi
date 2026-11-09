const fs = require('node:fs');
const template = fs.readFileSync('content/position-context.template.js', 'utf8'),
  positions = JSON.parse(fs.readFileSync('content/positions.json'));
fs.writeFileSync('web/position-context.js', template.replace('POSITION_DATA', JSON.stringify(positions)));
