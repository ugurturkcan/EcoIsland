import assert from 'node:assert/strict';
import { carbonCard, decompositionLabel } from './carbon.js';

// 0,5 L PET şişe ≈ 22 g
const pet = carbonCard('PET', 22);
assert.equal(pet.productionG, 85);              // 22 g × 3,864 kg/kg
assert.equal(pet.avoided.recycleG, 36);         // (3,864 − 2,214 + 0,00898 − 0,00469) × 22 g
assert.equal(pet.avoided.upcycleG, 85);
assert.ok(pet.carMeters > 450 && pet.carMeters < 520, `carMeters ${pet.carMeters}`);
assert.equal(pet.water.productionL, 5.2);       // 22 g × 235 L/kg
assert.equal(pet.water.estimated, false);
assert.equal(pet.bin, 'sarı (plastik)');

// Kağıt: depolamada metan oluştuğu için geri dönüşüm kaçınımı büyük
const paper = carbonCard('paper', 100);
assert.equal(paper.avoided.recycleG, 145);      // (1,345 − 1,050 + 1,164 − 0,00469) × 100 g
assert.equal(paper.water.savedRecycleL, 2.7);

// Tişört 250 g
const shirt = carbonCard('cotton', 250);
assert.equal(shirt.water.productionL, 2500);
assert.ok(shirt.avoided.upcycleG > 5000);

assert.equal(carbonCard('glass', 200).water.estimated, true);
assert.equal(decompositionLabel(450), '450 yıl');
assert.equal(decompositionLabel(1000000), '1 milyon yıl');
assert.equal(decompositionLabel(0.2), '10 hafta');
assert.equal(carbonCard('other', -5).productionG, 0);
console.log('carbon tests passed', pet);
