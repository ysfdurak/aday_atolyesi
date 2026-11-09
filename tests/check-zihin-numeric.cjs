const assert = require('node:assert/strict');
require('../web/modules/zihin/numeric.js');
require('../web/modules/zihin/engine.js');
const fact = n => {
    let v = 1;
    for (let i = 2; i <= n; i++) v *= i;
    return v;
  },
  primes = (() => {
    let a = [];
    for (let n = 2; a.length < 15; n++) if (!a.some(p => n % p === 0)) a.push(n);
    return a;
  })();
function extendedExpected(t, v, p, len) {
  let j = v - 4,
    x = [],
    f = [1, 2, 3, 5, 8, 13, 21, 34];
  for (let n = 0; n < len; n++) {
    if (t === 0) {
      if (!n) x.push(p.a);
      else {
        let z = x[n - 1];
        x.push(
          j === 0
            ? n % 2
              ? z * p.b
              : z + (p.k * n) / 2
            : j === 1
              ? [z + p.k, z * p.b, z + p.k * p.b, z / p.b][(n - 1) % 4]
              : j === 2
                ? z * p.b - n * p.k
                : j === 3
                  ? z * (n % 2 ? 2 : 3) + p.k
                  : j === 4
                    ? z * p.b + (n % 2 ? p.k : -p.k)
                    : j === 5
                      ? z * (n % 2 ? 2 : 3) + (n % 2 ? p.k : -p.k)
                      : j === 6
                        ? [z + p.k, z + 2 * p.k, z - p.k, z * 2][(n - 1) % 4]
                        : n % 2
                          ? z * p.b
                          : z / p.b + p.k
        );
      }
    }
    if (t === 1) {
      let i = Math.floor(n / 2),
        g = n % 2;
      if (j === 0) x.push(p.starts[g] + (p.steps[g] * i * (i + 1)) / 2);
      if (j === 1) x.push(p.starts[g] + (i + 1) ** (g ? 3 : 2));
      if (j === 2) {
        let fib = [p.a, p.a + p.k];
        while (fib.length <= i) fib.push(fib.at(-1) + fib.at(-2));
        x.push(g ? fib[i] : p.starts[0] + i * p.k);
      }
      if (j === 3) x.push(g ? p.b * p.inputs[i] + p.k : p.inputs[i]);
      if (j === 4 || j === 5) {
        let i = Math.floor(n / 3),
          g = n % 3,
          a = p.inputs[i],
          b = p.others[i];
        x.push(g === 0 ? a : g === 1 ? b : j === 4 ? p.b * a + b : a * b + p.k);
      }
      if (j === 6) x.push(g ? p.total - p.inputs[i] : p.inputs[i]);
      if (j === 7) x.push(p.starts[n % 3] + Math.floor(n / 3) * p.steps[n % 3]);
    }
    if (t === 2) {
      if (!n) x.push(p.a);
      else {
        let d =
          j === 0
            ? p.k * n * n
            : j === 1
              ? p.k * n ** 3
              : j === 2
                ? p.k * primes[n - 1]
                : j === 3
                  ? p.k * f[n - 1]
                  : j === 4
                    ? n % 2
                      ? p.k
                      : (n / 2) * p.d
                    : j === 5
                      ? p.d + (p.k * (p.b ** (n - 1) - 1)) / (p.b - 1)
                      : j === 6
                        ? (p.k * n * (n + 1)) / 2
                        : fact(n + 1);
        x.push(x[n - 1] + d);
      }
    }
    if (t === 3) {
      if (n < p.initial.length) x.push(p.initial[n]);
      else {
        let a = x[n - 1],
          b = x[n - 2],
          c = x[n - 3];
        x.push(
          j === 0
            ? 2 * a + b
            : j === 1
              ? a + b + c
              : j === 2
                ? a + c
                : j === 3
                  ? 3 * a - b
                  : j === 4
                    ? a +
                      String(a)
                        .split('')
                        .reduce((s, c) => s + (+c) ** 2, 0)
                    : j === 5
                      ? a + Number(String(a).split('').reverse().join(''))
                      : j === 6
                        ? a + String(a).length * p.k
                        : a + n * b
        );
      }
    }
    if (t === 4) {
      let i = n + 1;
      x.push(
        j === 0
          ? (p.scale * i * (i + 1)) / 2 + p.k
          : j === 1
            ? p.scale * 2 ** i + p.k
            : j === 2
              ? p.scale * 3 ** i + p.k
              : j === 3
                ? p.scale * i * i + (i % 2 ? p.k : -p.k)
                : j === 4
                  ? p.scale * (i * i + i ** 3) + p.k
                  : j === 5
                    ? p.scale * (i * i + primes[i - 1]) + p.k
                    : j === 6
                      ? i * fact(i) + p.k
                      : i ** i + p.k
      );
    }
  }
  return x;
}
function expected(t, v, p, len) {
  if (t === 5) return expected(p.baseType, p.baseVariant, p.baseParams, len);
  if (v >= 4) return extendedExpected(t, v, p, len);
  let arr = [];
  for (let n = 0; n < len; n++) {
    if (t === 0) {
      if (n === 0) arr.push(p.a);
      else if (v === 0) arr.push(n % 2 ? arr[n - 1] * p.b + p.shift : arr[n - 1] + p.k);
      else if (v === 1) arr.push(n % 2 ? arr[n - 1] * p.b : arr[n - 1] - p.k);
      else if (v === 2)
        arr.push(n % 3 === 1 ? arr[n - 1] + p.k : n % 3 === 2 ? arr[n - 1] * p.b : arr[n - 1] - p.sub);
      else arr.push(arr[n - 1] * (n + 1) + p.k);
    }
    if (t === 1) {
      let j = Math.floor(n / (v === 2 ? 3 : 2));
      if (v === 0) arr.push(p.starts[n % 2] + j * p.steps[n % 2]);
      if (v === 1) arr.push(p.starts[n % 2] * p.factors[n % 2] ** j);
      if (v === 2)
        arr.push(
          n % 3 === 0 ? p.starts[0] + j * p.step : n % 3 === 1 ? p.starts[1] * 2 ** j : p.starts[2] + j * j
        );
      if (v === 3)
        arr.push(n % 2 === 0 ? p.inputs[n / 2] : p.inputs[(n - 1) / 2] ** (p.mode === 'cube' ? 3 : 2) + p.k);
    }
    if (t === 2) {
      if (v <= 1)
        arr.push(p.a + n * p.d + ((n * (n - 1)) / 2) * p.dd + ((n * (n - 1) * (n - 2)) / 6) * p.ddd);
      if (v === 2) arr.push(p.a + (p.d * (p.factor ** n - 1)) / (p.factor - 1));
      if (v === 3) {
        let positive = Math.ceil(n / 2),
          negative = Math.floor(n / 2);
        arr.push(p.a + (p.plus * positive * (positive + 1)) / 2 - (p.minus * negative * (negative + 1)) / 2);
      }
    }
    if (t === 3) {
      if (v < 3) arr.push(n === 0 ? p.a : n === 1 ? p.b : arr[n - 1] + p.factor * arr[n - 2] + p.k);
      else
        arr.push(
          n === 0
            ? p.a
            : arr[n - 1] +
                String(arr[n - 1])
                  .split('')
                  .reduce((s, c) => s + +c, 0)
        );
    }
    if (t === 4)
      arr.push(
        v === 0
          ? p.scale * (n + p.start) ** 2 + p.k
          : v === 1
            ? p.scale * (n + p.start) ** 3 + p.k
            : v === 2
              ? fact(n + 2) + p.k
              : p.scale * primes[n + p.start] + p.k
      );
  }
  return arr;
}
let total = 0,
  ids = new Set(),
  positions = [0, 0, 0, 0, 0],
  formats = new Set();
for (let type = 0; type < 6; type++)
  for (let variant = 0; variant < 12; variant++)
    for (let level = 1; level <= 3; level++)
      for (let n = 0; n < 60; n++) {
        let q = Engine.question('num', type, level, variant),
          p = q.proof;
        assert.equal(q.ruleId, `num-${type}-${variant}`);
        ids.add(q.ruleId);
        assert.deepEqual(p.full, expected(type, variant, p.params, p.full.length));
        assert.equal(q.options.length, 5);
        assert.equal(new Set(q.options).size, 5);
        assert(q.options.every(x => !x.includes(',') && Number.isInteger(Number(x.replaceAll('.', '')))));
        assert.equal(q.options.filter(x => x === q.answer).length, 1);
        assert.equal(q.hints.length, 3);
        assert.equal(new Set(q.hints).size, 3);
        assert(q.hints.every(h => h.length > 20 && !h.includes('Doğru dizi:')));
        assert.equal(q.answer, p.value.toLocaleString('tr-TR'));
        if (type === 5) {
          assert.equal(p.original, p.full[p.errorIndex]);
          assert.notEqual(p.value, p.original);
        } else {
          assert.equal(p.value, p.full[p.hole]);
          formats.add(p.hole === p.full.length - 1 ? 'end' : 'middle');
        }
        // A correct option cannot stand out as the sole integer; parity and length checks track other superficial cues.
        assert(p.numericOptions.every(Number.isSafeInteger));
        assert(p.numericOptions.filter(x => x % 2 === p.value % 2).length >= 2);
        assert(p.numericOptions.filter(x => String(x).length === String(p.value).length).length >= 2);
        positions[q.options.indexOf(q.answer)]++;
        assert(q.options.every(x => x === q.answer || q.distractorReasons[x]));
        total++;
      }
assert.equal(ids.size, 72);
assert.equal(formats.size, 2);
assert(positions.every(n => n > 2000 && n < 3200));
console.log(
  `${total} numeric questions passed independent rule, integer-option, distinct-choice and staged-hint checks. 60 construction forms plus 12 error presentations; answer positions: ${positions.join(', ')}.`
);
let alternate = 0;
for (let t = 0; t < 5; t++)
  for (let v = 0; v < 12; v++)
    for (let task of ['middle', 'error'])
      for (let i = 0; i < 10; i++) {
        let q = Numeric.create(t, 2, v, task),
          p = q.proof;
        assert.equal(q.ruleId, `num-${t}-${v}`);
        assert.deepEqual(p.full, expected(t, v, p.params, p.full.length));
        if (task === 'error' && !(t === 1 && [3, 7, 8, 9, 10].includes(v)))
          assert.notEqual(p.errorIndex, null);
        else assert.notEqual(p.hole, p.full.length - 1);
        alternate++;
      }
console.log(
  `${alternate} transfer-task checks passed; independent pairs excluded from ambiguous error detection.`
);
