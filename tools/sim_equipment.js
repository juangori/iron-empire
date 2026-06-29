// Iron Empire — equipment (maquinarias) deep analysis.
// Replica las fórmulas reales (getEquipCost, repair, breakdown, capacity) sobre los datos de
// data.js y produce tablas de diagnóstico: eficiencia por tier, "muro de costo", ROI marginal,
// balance miembros-vs-capacidad, economía de roturas, y la config óptima por nivel.
// Run: `node tools/sim_equipment.js`

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const data = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const sb = { Math, JSON, console };
vm.createContext(sb);
vm.runInContext(data + '\nvar __D={EQUIPMENT,GYM_ZONES};', sb);
const EQ = sb.__D.EQUIPMENT, ZONES = sb.__D.GYM_ZONES;

// --- formulas (game.js) ---
const cost = (e, level) => Math.ceil(e.baseCost * Math.pow(e.costMult, level));        // L -> L+1
const repairCost = (e, level) => Math.ceil(e.baseCost * Math.pow(e.costMult, level - 1) * 0.3);
const repairDur = level => 60 + level * 30;
const upgradeDur = level => 20 * level;
const cumCost = (e, L) => { let c = 0; for (let l = 0; l < L; l++) c += cost(e, l); return c; }; // 0 -> L
const fmtM = n => n >= 1e9 ? (n/1e9).toFixed(1)+'B' : n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : ''+Math.round(n);
const fmtT = s => s < 60 ? Math.round(s)+'s' : s < 3600 ? (s/60).toFixed(1)+'m' : (s/3600).toFixed(1)+'h';

console.log('===== A. OVERVIEW por equipo =====');
console.log('  ' + 'equipo'.padEnd(11) + 'reqLv  baseCost  inc/lv  mem/lv cap/lv  cMult   $/inc(L1)  payback(L1)');
EQ.forEach((e, i) => {
  const ipd = e.incomePerLevel / e.baseCost;
  console.log('  ' + e.id.padEnd(11) + String(e.reqLevel).padStart(3) + '  ' + String(e.baseCost).padStart(9) + '  ' +
    String(e.incomePerLevel).padStart(5) + '  ' + String(e.membersPerLevel).padStart(5) + '  ' + String(e.capacityPerLevel).padStart(5) + '  ' +
    e.costMult.toFixed(2) + '   ' + ipd.toFixed(5).padStart(8) + '   ' + fmtT(e.baseCost / e.incomePerLevel).padStart(7));
});
console.log('  (>> $/inc cae monótono = cada tier es menos eficiente por dólar pero da más techo absoluto)');

console.log('\n===== B. MURO DE COSTO — costo de UN upgrade a nivel L =====');
console.log('  ' + 'equipo'.padEnd(11) + 'L1->2     L5->6     L10->11   L15->16   L20->21');
EQ.forEach(e => {
  console.log('  ' + e.id.padEnd(11) + [1,5,10,15,20].map(l => fmtM(cost(e, l)).padStart(8)).join('  '));
});
console.log('  (con costMult 2.0-2.5 los tiers altos explotan: un upgrade vale más que toda tu plata)');

console.log('\n===== C. ROI MARGINAL — payback CRUDO de 1 upgrade (cost / inc-por-nivel), en seg de ingreso bruto =====');
console.log('  ' + 'equipo'.padEnd(11) + 'L1->2     L5->6     L10->11   L15->16');
EQ.forEach(e => {
  console.log('  ' + e.id.padEnd(11) + [1,5,10,15].map(l => fmtT(cost(e, l)/e.incomePerLevel).padStart(8)).join('  '));
});
console.log('  (cuando un upgrade tarda >1h de ingreso bruto en repagarse, conviene comprar OTRO equipo)');

console.log('\n===== D. ¿Conviene maxear hasta el cap de nivel? costo acumulado 0->L vs ingreso ganado =====');
[5,10,15,20].forEach(L => {
  console.log('  -- maxeando todo lo disponible a nivel ' + L + ' --');
  EQ.filter(e => e.reqLevel <= L).forEach(e => {
    const c = cumCost(e, L), inc = e.incomePerLevel * L;
    console.log('    ' + e.id.padEnd(11) + 'costo ' + fmtM(c).padStart(8) + '  ->  +' + inc.toFixed(0).padStart(4) + ' inc/s   (payback bruto ' + fmtT(c/inc) + ')');
  });
});

console.log('\n===== E. MIEMBROS vs CAPACIDAD (si construís todo lo disponible a nivel L) =====');
console.log('  nivel   miembros-generados   capacidad-equipos   +cap-zonas-disp   ¿alcanza?');
[3,6,10,13,16,20].forEach(L => {
  let mem = 0, cap = 0; EQ.forEach(e => { if (e.reqLevel <= L) { mem += e.membersPerLevel * L; cap += e.capacityPerLevel * L; } });
  let zcap = 0; ZONES.forEach(z => { if (z.reqLevel <= L) zcap += z.capacityBonus; });
  const total = cap + zcap;
  console.log('  ' + String(L).padStart(4) + '    ' + String(mem).padStart(15) + '    ' + String(cap).padStart(14) + '    ' + String(zcap).padStart(12) + '    ' + (total >= mem ? 'sí ('+total+')' : 'NO — faltan ' + (mem-total)));
});
console.log('  (Palermo capea a 2500: ahora la CAPACIDAD (equipos+zonas) es el límite real de miembros,');
console.log('   y el surplus de atracción te mantiene siempre lleno. El bonus de miembros llega a x3 a ~1000.)');

console.log('\n===== F. ECONOMÍA DE ROTURAS (por equipo, a nivel 10, SIN limpieza) =====');
console.log('  ' + 'equipo'.padEnd(11) + 'chance/30s   roturas/hora   repCost(L10)   repTiempo(L10)');
let totBreaksHr = 0;
EQ.forEach((e, i) => {
  const ch = 0.003 + i * 0.0003;
  const perHr = ch * 120; // 120 checks/hour (cada 30s)
  totBreaksHr += perHr;
  console.log('  ' + e.id.padEnd(11) + (ch*100).toFixed(2).padStart(7) + '%   ' + perHr.toFixed(2).padStart(10) + '   ' + fmtM(repairCost(e,10)).padStart(10) + '   ' + fmtT(repairDur(10)).padStart(10));
});
console.log('  TOTAL esperado: ' + totBreaksHr.toFixed(2) + ' roturas/hora con los 12 equipos (sin limpieza)');
console.log('  Con limpiador Nv.1 (-40%): ' + (totBreaksHr*0.6).toFixed(2) + '/h · Nv.5 (-72%, cap 90%): ' + (totBreaksHr*0.28).toFixed(2) + '/h');

console.log('\n===== G. CONFIG ÓPTIMA (greedy por mejor $/ingreso) a nivel-cap L con presupuesto generoso =====');
function greedy(L, budget) {
  const lv = {}; EQ.forEach(e => lv[e.id] = 0);
  let spent = 0, steps = 0;
  while (steps++ < 100000) {
    let best = null, bestEff = 0;
    EQ.forEach(e => {
      if (e.reqLevel > L || lv[e.id] >= L) return;
      const c = cost(e, lv[e.id]); if (spent + c > budget) return;
      const eff = e.incomePerLevel / c; // income per dollar at the margin
      if (eff > bestEff) { bestEff = eff; best = e; }
    });
    if (!best) break;
    lv[best.id]++; spent += cost(best, lv[best.id]-1);
  }
  let inc = 0; EQ.forEach(e => inc += e.incomePerLevel * lv[e.id]);
  return { lv, spent, inc };
}
[[8, 5e6], [15, 500e6], [22, 50e9]].forEach(([L, b]) => {
  const r = greedy(L, b);
  const cfg = EQ.filter(e => e.reqLevel <= L).map(e => e.id.replace('_','')+':'+r.lv[e.id]).join(' ');
  const dead = EQ.filter(e => e.reqLevel <= L && r.lv[e.id] === 0).map(e => e.id);
  console.log('  Lv' + L + ' (budget $' + fmtM(b) + '): inc bruto ' + r.inc.toFixed(0) + '/s, gastado $' + fmtM(r.spent));
  console.log('     ' + cfg);
  if (dead.length) console.log('     ⚠️ NUNCA conviene comprar: ' + dead.join(', '));
});
