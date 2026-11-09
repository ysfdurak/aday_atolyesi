const assert = require('node:assert/strict');
for (let f of ['numeric', 'engine', 'verbal', 'spatial']) require('../web/modules/zihin/' + f + '.js');
function valid(world, p) {
  let cells = [];
  for (let i = 0; i < 8; i++) if ((world & (2 ** i)) !== 0) cells.push(i);
  let inGroup = (cell, g) => Math.floor(cell / 2 ** g) % 2 === 1,
    [op, a, b] = p;
  switch (op) {
    case 'all':
      return cells.filter(c => inGroup(c, a)).every(c => inGroup(c, b));
    case 'none':
      return cells.filter(c => inGroup(c, a)).every(c => !inGroup(c, b));
    case 'some':
      return cells.some(c => inGroup(c, a) && inGroup(c, b));
    case 'notall':
      return cells.some(c => inGroup(c, a) && !inGroup(c, b));
    case 'exists':
      return cells.some(c => inGroup(c, a));
  }
}
let verbal = 0,
  spatial = 0,
  templates = new Set();
for (let t = 0; t < 6; t++)
  for (let l = 1; l <= 3; l++)
    for (let n = 0; n < 60; n++) {
      let q = Engine.question('verbal', t, l),
        p = q.proof;
      assert.equal(q.bankVersion, 4);
      assert(q.options.includes(q.answer));
      assert.equal(new Set(q.options).size, q.options.length);
      assert(q.options.length >= 3);
      templates.add(q.templateId);
      if (p.kind === 'verbal-policy') {
        let result =
          p.mode === 0
            ? (p.age <= p.limit || !!p.risk) && !!p.approval
            : p.mode === 1
              ? !!p.complete && !!p.approval && !p.blocked
              : p.mode === 2
                ? (!!p.risk || !!p.complete) && !p.blocked
                : ((!!p.risk && !!p.approval) || !!p.complete) && !p.blocked;
        assert.equal(q.answer, result ? 'Doğru' : 'Yanlış');
      }
      if (p.kind === 'verbal-models') {
        let worlds = Array.from({ length: 255 }, (_, i) => i + 1).filter(w =>
          p.premises.every(x => valid(w, x))
        );
        assert(worlds.length > 0);
        assert(worlds.every(w => valid(w, p.conclusion)));
        p.wrong.forEach(x => assert(worlds.some(w => !valid(w, x))));
      }
      if (p.kind === 'verbal-order') {
        let k = l === 1 ? 4 : l === 2 ? 5 : 6;
        assert.equal(p.order.length, k);
        assert.equal(q.answer, Array.from({ length: k }, (_, i) => p.labels[i]).join(' → '));
      }
      verbal++;
    }
const vecs = { u: [0, 0, 1], d: [0, 0, -1], f: [0, 1, 0], b: [0, -1, 0], r: [1, 0, 0], l: [-1, 0, 0] },
  key = a =>
    a
      .map(v => v.join(','))
      .sort()
      .join(';');
for (let t = 6; t <= 8; t++)
  for (let l = 1; l <= 3; l++)
    for (let n = 0; n < 90; n++) {
      let q = Engine.question('shape', t, l),
        p = q.proof;
      assert.equal(q.bankVersion, 4);
      assert.equal(q.options.length, 5);
      assert.equal(new Set(q.options).size, 5);
      if (t === 6) {
        let holes = [];
        for (let x = 0; x < 8; x++)
          for (let y = 0; y < 8; y++) {
            let xx = x,
              yy = y,
              w = 8,
              h = 8;
            for (let op of p.ops) {
              if (op === 'x') {
                if (xx >= w / 2) xx = w - 1 - xx;
                w /= 2;
              } else {
                if (yy >= h / 2) yy = h - 1 - yy;
                h /= 2;
              }
            }
            if (p.seeds.some(([a, b]) => a === xx && b === yy)) holes.push([x, y]);
          }
        assert.equal(key(holes), key(p.result));
        assert.equal(new Set(p.choices.map(key)).size, 5);
        assert(p.choices.every(x => x.length === p.result.length));
      }
      if (t === 7) {
        let positions = Object.entries(p.initial).map(([face, label]) => ({ v: vecs[face].slice(), label }));
        for (let op of p.ops)
          for (let a of positions) {
            let [x, y, z] = a.v;
            a.v = op === 'yaw' ? [y, -x, z] : op === 'pitch' ? [x, z, -y] : [z, y, -x];
          }
        let result = Object.fromEntries(
          Object.entries(vecs).map(([face, v]) => [face, positions.find(p => p.v.join() === v.join()).label])
        );
        assert.deepEqual(result, p.result);
        assert.equal(Spatial.orientations(p.initial).length, 24);
      }
      if (t === 8) {
        let { x, y, direction: d } = p.initial;
        for (let o of p.ops) {
          d = (d + o.turn + 4) % 4;
          x += (d === 1 ? 1 : d === 3 ? -1 : 0) * o.step;
          y += (d === 2 ? 1 : d === 0 ? -1 : 0) * o.step;
          assert(x >= 0 && x < 6 && y >= 0 && y < 6);
        }
        assert.deepEqual({ x, y, direction: d }, p.result);
        assert.equal(q.answer, String.fromCharCode(65 + x) + (y + 1));
      }
      spatial++;
    }
assert.equal(Verbal.passages.length, 20);
assert.equal(Verbal.argumentsBank.length, 16);
assert.equal(Verbal.processes.length, 12);
assert(templates.size >= 55);
console.log(
  `${verbal} verbal and ${spatial} spatial cases passed: model-based deduction, policy logic, paragraph permutations, physical-fold inversion, 3D vector rotations and relative path tracking.`
);
