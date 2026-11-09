const assert = require('node:assert/strict');
require('./web/modules/zihin/numeric.js');
require('./web/modules/zihin/engine.js');
require('./web/modules/zihin/verbal.js');
require('./web/modules/zihin/spatial.js');
let count = 0,
  proved = 0;
const fmt = n => Number(n.toFixed(2)).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
function transform(m, kind) {
  let arr = Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => (m >> (r * 3 + c)) & 1)),
    out = Array.from({ length: 3 }, () => [0, 0, 0]);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      if (kind === 'rot') out[c][2 - r] = arr[r][c];
      else out[r][2 - c] = arr[r][c];
    }
  return out.flat().reduce((v, x, i) => v + (x << i), 0);
}
function passesOrder(p, txt) {
  let m;
  if ((m = txt.match(/^(.+), (.+) kişisinden önce gelir\.$/))) return p.indexOf(m[1]) < p.indexOf(m[2]);
  if ((m = txt.match(/^(.+) ile (.+) arasında (\d+) kişi vardır\.$/)))
    return Math.abs(p.indexOf(m[1]) - p.indexOf(m[2])) === +m[3] + 1;
  if ((m = txt.match(/^(.+), (\d+)\. sırada değildir\.$/))) return p.indexOf(m[1]) !== +m[2] - 1;
  if ((m = txt.match(/^(.+), (.+) kişisinden (\d+) sıra (sonra|önce) gelir\.$/)))
    return p.indexOf(m[1]) - p.indexOf(m[2]) === +m[3] * (m[4] === 'sonra' ? 1 : -1);
  throw Error(txt);
}
for (const c of Engine.cats.filter(c => c.id !== 'num'))
  for (let t = 0; t < 6; t++)
    for (let level = 1; level <= 3; level++)
      for (let i = 0; i < 100; i++) {
        const q = Engine.question(c.id, t, level);
        assert(q.q && q.exp && q.answer !== undefined);
        assert(q.options.length >= 3);
        assert.equal(new Set(q.options).size, q.options.length);
        assert.equal(q.options.filter(x => x === q.answer).length, 1);
        assert(!JSON.stringify(q).includes('NaN'));
        assert(!JSON.stringify(q).includes('undefined'));
        assert.equal(q.engineVersion, 2);
        let p = q.proof;

        if (p.kind === 'mask') {
          let a = p.pre === 'none' ? p.a : transform(p.a, p.pre),
            v = p.op === 'xor' ? a ^ p.b : p.op === 'and' ? a & p.b : a | p.b;
          assert.equal(v, p.result);
          let bits = q.answer.match(/fill="(#356b50|#e5e9df)"/g).map(x => (x.includes('#356b50') ? 1 : 0));
          assert.equal(
            bits.reduce((s, x, i) => s + (x << i), 0),
            v
          );
          proved++;
        }
        if (p.kind === 'order') {
          let valid = Engine.perms(p.names).filter(v => p.constraints.every(t => passesOrder(v, t)));
          assert.equal(valid.length, 1);
          assert.deepEqual(valid[0], p.solution);
          assert.equal(q.answer, valid[0][p.position]);
          proved++;
        }
        if (p.kind === 'truth') {
          let matches = p.names
            .map(
              (_, candidate) =>
                p.st.filter(s => (s.not ? !s.ids.includes(candidate) : s.ids.includes(candidate))).length
            )
            .map((n, i) => (n === p.desired ? i : -1))
            .filter(i => i >= 0);
          assert.deepEqual(matches, [p.chosen]);
          assert.equal(q.answer, p.names[p.chosen]);
          proved++;
        }
        if (p.kind === 'network') {
          let [a, b, c, d, e, f] = p.dur;
          assert.equal(+q.answer, Math.max(a + Math.max(b, c) + d, a + c + p.delay + e) + f);
          proved++;
        }
        if (p.kind === 'schedule') {
          let [a, b, c, d] = p.dur;
          let possible = [Math.max(a + b, p.release) + c + d, Math.max(a, p.release) + c + b + d];
          assert.equal(+q.answer, Math.min(...possible));
          proved++;
        }
        if (p.kind === 'weighted') {
          let denominator = p.units.reduce((s, x) => s + x.n, 0),
            numerator = p.units.reduce((s, x) => s + x.n * x.rate, 0);
          assert.equal(
            q.answer,
            fmt(Math.floor((numerator * 200 + denominator) / (denominator * 2)) / 100) + '%'
          );
          proved++;
        }
        if (p.kind === 'reverse') {
          assert.equal(q.answer, fmt(p.old));
          assert(Math.abs(p.old * (1 + p.u / 100) * (1 - p.d / 100) * (1 + p.tax / 100) - p.final) < 0.001);
          proved++;
        }
        if (p.kind === 'capacity') {
          assert.equal(
            q.answer,
            fmt(
              (p.rates[0] * p.h + p.rates[1] * (p.h - p.stop) + (level >= 2 ? p.rates[2] * p.h : 0)) *
                (1 - p.scrap / 100)
            )
          );
          proved++;
        }
        if (p.kind === 'records') {
          let diffs = [];
          p.rows.forEach((r, i) =>
            r.forEach((v, j) => {
              if (v !== p.other[i][j]) diffs.push([i, j]);
            })
          );
          assert.deepEqual(diffs, [[p.row, p.col]]);
          proved++;
        }
        if (p.kind === 'scan') {
          let n = 0;
          for (let j = 0; j < p.str.length; j++) if (p.str.startsWith(p.target, j)) n++;
          assert.equal(q.answer, String(n));
          proved++;
        }
        if (p.kind === 'filter') {
          let result = p.rows
            .filter(x => !x.paid && ((x.risk >= p.risk && x.age > p.day) || (level === 3 && x.ex)))
            .map(x => x.id);
          assert.deepEqual(result, p.ids);
          if (t !== 5) assert.equal(q.answer, String(result.length));
          else assert.equal(q.answer, result.join(', ') || 'Hiçbiri');
          proved++;
        }
        if (p.kind === 'normalize') {
          let clean = x => x.replace(/[-\s]/g, '').toUpperCase();
          let wrong = p.rows.filter(r => clean(r[1]) !== clean(r[2]));
          assert.equal(wrong.length, 1);
          assert.equal(+q.answer, wrong[0][0]);
          proved++;
        }
        if (p.kind === 'latin') {
          let { n, cells, grid } = p;
          for (let j = 0; j < n; j++) {
            assert.equal(new Set(cells.slice(j * n, j * n + n)).size, n);
            assert.equal(new Set(Array.from({ length: n }, (_, i) => cells[i * n + j])).size, n);
          }
          grid.forEach((v, i) => {
            if (v !== -1) assert.equal(v, cells[i]);
          });
          assert.equal(q.answer, p.symbols[cells[p.target]]);
          proved++;
        }
        count++;
      }
console.log(
  `${count} generated questions checked; ${proved} independent solver, transformation, calculation and record checks passed.`
);
