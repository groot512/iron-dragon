/* =========================================================================
   IRON DRAGON (거북선 / GEOBUKSEON) — 3D WEBGL, VR 360, TOPOGRAPHY & POSTER ENGINE
   Built with Three.js r128 + Procedural Cyber-Joseon Heritage Geometry
   ========================================================================= */

window.POSTER_CACHE = {};
window.THUMB_CACHE = {};
window.DIORAMA_IMG_ELS = {};

// Preload the 6 AI-sculpted 3D diorama images for instant canvas & poster compositing
function preloadDioramaImages() {
  if (!window.CHAPTERS_DB) return;
  window.CHAPTERS_DB.forEach((chap, idx) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = chap.dioramaImg || `assets/diorama-node${idx}.png`;
    img.onload = () => {
      window.DIORAMA_IMG_ELS[idx] = img;
      delete window.POSTER_CACHE[idx]; // Invalidate so next poster render includes the 3D diorama
    };
  });
}

/* -------------------------------------------------------------------------
   1. PROCEDURAL ULTRA-HD RELIC POSTER & THUMBNAIL GENERATOR
   Generates crisp, self-contained data URLs for thumbnails, AR cards, & HD posters
   ------------------------------------------------------------------------- */
function generateRelicPosterDataURL(index, isThumb = false) {
  const chap = window.CHAPTERS_DB[index] || window.CHAPTERS_DB[0];
  if (isThumb && chap.dioramaImg) {
    return chap.dioramaImg;
  }
  const cache = isThumb ? window.THUMB_CACHE : window.POSTER_CACHE;
  if (cache[index]) return cache[index];

  const canvas = document.createElement('canvas');
  canvas.width = isThumb ? 320 : 900;
  canvas.height = isThumb ? 320 : 1200;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const ko = chap.ko;
  const en = chap.en;

  // Deep Obsidian Cyber-Heritage Gradient Background
  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.05, w * 0.5, h * 0.5, h * 0.75);
  bgGrad.addColorStop(0, '#162c30');
  bgGrad.addColorStop(0.5, '#0D1117');
  bgGrad.addColorStop(1, '#07090d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle Cyber Grid
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.07)';
  ctx.lineWidth = 1;
  const step = isThumb ? 24 : 45;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  //Sacred Joseon Celestial Circle
  const cx = w * 0.5;
  const cy = isThumb ? h * 0.5 : h * 0.43;
  const r = isThumb ? w * 0.36 : w * 0.34;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = isThumb ? 1.5 : 2.5;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

  ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
  ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // 8 Trigrams / Cardinal ticks
  for (let i = 0; i < 12; i++) {
    const ang = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * r * 0.9, Math.sin(ang) * r * 0.9);
    ctx.lineTo(Math.cos(ang) * r * 1.04, Math.sin(ang) * r * 1.04);
    ctx.strokeStyle = i % 3 === 0 ? '#D4AF37' : 'rgba(45,212,191,0.5)';
    ctx.stroke();
  }

  // Node-specific Emblem Artwork (Uses AI-Sculpted 3D Diorama if preloaded, else procedural emblem)
  ctx.shadowBlur = isThumb ? 12 : 28;
  ctx.shadowColor = index % 2 === 0 ? '#2DD4BF' : '#D4AF37';

  const preloadedDiorama = window.DIORAMA_IMG_ELS && window.DIORAMA_IMG_ELS[index];
  if (preloadedDiorama && preloadedDiorama.complete && preloadedDiorama.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2);
    ctx.clip();
    const dSize = r * 1.72;
    ctx.drawImage(preloadedDiorama, -dSize * 0.5, -dSize * 0.5, dSize, dSize);
    ctx.restore();
  } else if (index === 0) {
    // Dragon Head Silhouette & Cyber Flame
    ctx.strokeStyle = '#D4AF37';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.18)';
    ctx.lineWidth = isThumb ? 2.5 : 4;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.35);
    ctx.lineTo(-r * 0.35, -r * 0.45);
    ctx.lineTo(-r * 0.05, -r * 0.7);
    ctx.lineTo(r * 0.1, -r * 0.35);
    ctx.lineTo(r * 0.6, -r * 0.25);
    ctx.lineTo(r * 0.3, r * 0.0);
    ctx.lineTo(r * 0.55, r * 0.2);
    ctx.lineTo(r * 0.0, r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Glowing Eye & Breath
    ctx.fillStyle = '#2DD4BF';
    ctx.beginPath(); ctx.arc(r * 0.08, -r * 0.2, r * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2DD4BF';
    ctx.beginPath();
    ctx.moveTo(r * 0.35, -r * 0.05);
    ctx.quadraticCurveTo(r * 0.75, -r * 0.2, r * 0.85, 0);
    ctx.quadraticCurveTo(r * 0.75, r * 0.2, r * 0.35, r * 0.08);
    ctx.stroke();
  } else if (index === 1) {
    // Hexagonal Iron Carapace & Spikes
    const hexR = r * 0.26;
    const offsets = [[0, 0], [0, -hexR * 1.75], [0, hexR * 1.75], [-hexR * 1.5, -hexR * 0.88], [hexR * 1.5, -hexR * 0.88], [-hexR * 1.5, hexR * 0.88], [hexR * 1.5, hexR * 0.88]];
    offsets.forEach(([ox, oy], idx) => {
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        const hx = ox + Math.cos(a) * hexR * 0.92;
        const hy = oy + Math.sin(a) * hexR * 0.92;
        if (k === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = idx === 0 ? 'rgba(212, 175, 55, 0.28)' : 'rgba(45, 212, 191, 0.14)';
      ctx.fill();
      ctx.strokeStyle = idx === 0 ? '#D4AF37' : '#2DD4BF';
      ctx.lineWidth = isThumb ? 2 : 3;
      ctx.stroke();
      // Center Spike Dot
      ctx.fillStyle = '#F0F6FC';
      ctx.beginPath(); ctx.arc(ox, oy, isThumb ? 3 : 6, 0, Math.PI * 2); ctx.fill();
    });
  } else if (index === 2) {
    // Cheonja Cannon & Daejanggunjeon Rocket Arrow
    ctx.save();
    ctx.rotate(-Math.PI / 7);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = isThumb ? 2.5 : 4;
    ctx.fillRect(-r * 0.65, -r * 0.16, r * 1.1, r * 0.32);
    ctx.strokeRect(-r * 0.65, -r * 0.16, r * 1.1, r * 0.32);
    // Bamboo rings (죽절)
    for (let b = -0.5; b <= 0.35; b += 0.2) {
      ctx.beginPath(); ctx.moveTo(r * b, -r * 0.2); ctx.lineTo(r * b, r * 0.2); ctx.stroke();
    }
    // Giant Arrow Tip protruding
    ctx.strokeStyle = '#2DD4BF';
    ctx.fillStyle = '#2DD4BF';
    ctx.beginPath();
    ctx.moveTo(r * 0.45, 0);
    ctx.lineTo(r * 0.85, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.92, 0);
    ctx.lineTo(r * 0.72, -r * 0.12);
    ctx.lineTo(r * 0.72, r * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (index === 3) {
    // Full Geobukseon Warship Silhouette
    ctx.fillStyle = 'rgba(212, 175, 55, 0.22)';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = isThumb ? 2.5 : 4;
    // Hull
    ctx.beginPath();
    ctx.moveTo(-r * 0.75, r * 0.08);
    ctx.lineTo(r * 0.75, r * 0.08);
    ctx.lineTo(r * 0.58, r * 0.38);
    ctx.lineTo(-r * 0.62, r * 0.38);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Arched Carapace
    ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
    ctx.strokeStyle = '#2DD4BF';
    ctx.beginPath();
    ctx.arc(0, r * 0.08, r * 0.58, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Dragon Prow
    ctx.strokeStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(r * 0.58, r * 0.05);
    ctx.lineTo(r * 0.78, -r * 0.32);
    ctx.lineTo(r * 0.9, -r * 0.28);
    ctx.stroke();
  } else if (index === 4) {
    // Twin-Dragon Command Sword & War Diary Scroll
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = isThumb ? 3 : 5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.55);
    ctx.lineTo(r * 0.55, -r * 0.55);
    ctx.stroke();
    // Hilt guard
    ctx.strokeStyle = '#2DD4BF';
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, r * 0.22);
    ctx.lineTo(-r * 0.22, r * 0.45);
    ctx.stroke();
    // Scroll frame
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
    ctx.lineWidth = isThumb ? 2 : 3;
    ctx.strokeRect(-r * 0.32, -r * 0.42, r * 0.64, r * 0.84);
  } else {
    // Crane Wing Tactical Arc (학익진)
    ctx.strokeStyle = '#2DD4BF';
    ctx.lineWidth = isThumb ? 3 : 5;
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.62, Math.PI * 1.12, Math.PI * 1.88, false);
    ctx.stroke();
    // Vanguard spearhead arrow
    ctx.strokeStyle = '#D4AF37';
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(0, r * 0.55);
    ctx.lineTo(0, -r * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.48);
    ctx.lineTo(-r * 0.12, -r * 0.24);
    ctx.lineTo(r * 0.12, -r * 0.24);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  if (!isThumb) {
    // Outer Gold Frame
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, w - 56, h - 56);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Top Header Telemetry
    ctx.fillStyle = '#2DD4BF';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`IRON DRAGON // ${chap.node} // ${chap.tag}`, w * 0.5, 92);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
    ctx.font = '18px serif';
    ctx.fillText('朝鮮三道水軍統制營 · 壬辰年(1592) 龜船 戰術 圖鑑', w * 0.5, 128);

    // Bottom Titles & Specs
    ctx.fillStyle = '#F0F6FC';
    ctx.font = 'bold 52px serif';
    ctx.fillText(ko.title, w * 0.5, h - 295);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(en.title.toUpperCase(), w * 0.5, h - 250);

    ctx.fillStyle = '#2DD4BF';
    ctx.font = '21px sans-serif';
    ctx.fillText(ko.subtitle, w * 0.5, h - 210);

    // Specs Box
    ctx.fillStyle = 'rgba(22, 27, 34, 0.88)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 2;
    ctx.fillRect(75, h - 175, w - 150, 95);
    ctx.strokeRect(75, h - 175, w - 150, 95);

    ctx.fillStyle = '#8B949E';
    ctx.font = '17px monospace';
    const spec1 = ko.specs && ko.specs[0] ? `${ko.specs[0].label}: ${ko.specs[0].val}` : '';
    const spec2 = ko.specs && ko.specs[1] ? `${ko.specs[1].label}: ${ko.specs[1].val}` : '';
    ctx.fillText(spec1, w * 0.5, h - 135);
    ctx.fillStyle = '#E5C158';
    ctx.fillText(spec2, w * 0.5, h - 103);

    ctx.fillStyle = '#8B949E';
    ctx.font = '14px monospace';
    ctx.fillText('AUTHENTICATED DIGITAL HERITAGE LEDGER · METADWIPA-BENCHMARKED ARCHIVE', w * 0.5, h - 52);
  }

  const url = canvas.toDataURL('image/png');
  cache[index] = url;
  return url;
}

/* -------------------------------------------------------------------------
   2. PROCEDURAL 3D GEOBUKSEON BUILDER (SHARED & CUSTOMIZABLE)
   Builds an authentic, cyber-traditional 3D Joseon Turtle Ship in Three.js
   ------------------------------------------------------------------------- */
function createCyberGeobukseonGroup(options = {}) {
  const group = new THREE.Group();

  const matWoodDark = new THREE.MeshStandardMaterial({
    color: 0x2a1e17,
    roughness: 0.55,
    metalness: 0.35
  });
  const matWoodDeck = new THREE.MeshStandardMaterial({
    color: 0x473325,
    roughness: 0.6,
    metalness: 0.25
  });
  const matIronCarapace = new THREE.MeshStandardMaterial({
    color: 0x1a242d,
    roughness: 0.3,
    metalness: 0.88
  });
  const matGold = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    roughness: 0.22,
    metalness: 0.92,
    emissive: 0x3a2a05,
    emissiveIntensity: 0.35
  });
  const matCyanGlow = new THREE.MeshBasicMaterial({
    color: 0x2DD4BF,
    transparent: true,
    opacity: 0.88
  });
  const matEmberGlow = new THREE.MeshBasicMaterial({
    color: 0xE06A3B,
    transparent: true,
    opacity: 0.9
  });
  const matBronze = new THREE.MeshStandardMaterial({
    color: 0x9c7a3c,
    roughness: 0.35,
    metalness: 0.85
  });

  // --- DECK 1: LOWER FLAT-BOTTOMED HULL (하층 본판 & 외판) ---
  const deck1Group = new THREE.Group();
  deck1Group.name = 'deck1';

  // Flat bottom base (평저선 저판)
  const bottomGeo = new THREE.BoxGeometry(2.6, 0.22, 0.95);
  const bottomMesh = new THREE.Mesh(bottomGeo, matWoodDark);
  bottomMesh.position.y = -0.42;
  deck1Group.add(bottomMesh);

  // Tapered Lower Hull Body
  const lowerHullGeo = new THREE.CylinderGeometry(0.72, 0.52, 2.95, 16, 1, false, 0, Math.PI);
  const lowerHull = new THREE.Mesh(lowerHullGeo, matWoodDark);
  lowerHull.rotation.z = Math.PI / 2;
  lowerHull.rotation.y = Math.PI / 2;
  lowerHull.scale.set(1.0, 0.72, 1.0);
  lowerHull.position.y = -0.15;
  deck1Group.add(lowerHull);

  // Gold Strakes / Cyber Hull Trim Lines
  const trimGeo = new THREE.BoxGeometry(2.98, 0.035, 1.16);
  const trimMesh = new THREE.Mesh(trimGeo, matGold);
  trimMesh.position.y = -0.15;
  deck1Group.add(trimMesh);

  // Internal Deck 1 Compartments (visible in X-Ray / Exploded view)
  for (let i = -0.9; i <= 0.9; i += 0.45) {
    const bulkheadGeo = new THREE.BoxGeometry(0.04, 0.28, 0.96);
    const bulkhead = new THREE.Mesh(bulkheadGeo, matGold);
    bulkhead.position.set(i, -0.25, 0);
    deck1Group.add(bulkhead);
  }
  // Glowing Cyan Reactor / Powder Magazine Core inside Deck 1
  const coreGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.24, 16);
  const coreMesh = new THREE.Mesh(coreGeo, matCyanGlow);
  coreMesh.position.set(0, -0.24, 0);
  deck1Group.add(coreMesh);

  group.add(deck1Group);

  // --- DECK 2: COMBAT & PROPULSION DECK (중층 전투·포갑판 & 노) ---
  const deck2Group = new THREE.Group();
  deck2Group.name = 'deck2';

  const combatBoxGeo = new THREE.BoxGeometry(2.85, 0.26, 1.18);
  const combatBox = new THREE.Mesh(combatBoxGeo, matWoodDeck);
  combatBox.position.y = 0.04;
  deck2Group.add(combatBox);

  // Side Shield Plates (방패판 / 현측 판옥) with Gold Rim
  const shieldLeftGeo = new THREE.BoxGeometry(2.9, 0.28, 0.05);
  const shieldLeft = new THREE.Mesh(shieldLeftGeo, matWoodDark);
  shieldLeft.position.set(0, 0.08, 0.6);
  deck2Group.add(shieldLeft);

  const shieldRight = shieldLeft.clone();
  shieldRight.position.set(0, 0.08, -0.6);
  deck2Group.add(shieldRight);

  // 6 Broadside Cannons per side (좌우 각 6포혈 천자·현자총통)
  const cannons = [];
  for (let c = 0; c < 6; c++) {
    const cx = -1.0 + c * 0.4;
    [-1, 1].forEach(side => {
      const barrelGeo = new THREE.CylinderGeometry(0.032, 0.04, 0.26, 10);
      const barrel = new THREE.Mesh(barrelGeo, matBronze);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(cx, 0.1, side * 0.64);
      deck2Group.add(barrel);
      cannons.push(barrel);

      // Glowing Port Rim
      const rimGeo = new THREE.RingGeometry(0.035, 0.052, 12);
      const rim = new THREE.Mesh(rimGeo, side > 0 ? matGold : matCyanGlow);
      rim.position.set(cx, 0.1, side * 0.635);
      if (side < 0) rim.rotation.y = Math.PI;
      deck2Group.add(rim);
    });
  }

  // 8 Oars per side (좌우 각 8노 = 16노)
  const oars = [];
  for (let o = 0; o < 8; o++) {
    const ox = -1.05 + o * 0.3;
    [-1, 1].forEach(side => {
      const oarPivot = new THREE.Group();
      oarPivot.position.set(ox, -0.04, side * 0.56);

      const oarGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.62, 6);
      const oarMesh = new THREE.Mesh(oarGeo, matGold);
      oarMesh.position.y = -0.25;
      oarMesh.rotation.x = side * 0.65;
      oarPivot.add(oarMesh);

      deck2Group.add(oarPivot);
      oars.push({ pivot: oarPivot, side, index: o });
    });
  }

  group.add(deck2Group);

  // --- DECK 3: ARCHED HEXAGONAL IRON SPIKE CARAPACE (상층 개판 & 철첨) ---
  const deck3Group = new THREE.Group();
  deck3Group.name = 'deck3';

  // Curved Carapace Shell
  const shellGeo = new THREE.SphereGeometry(0.75, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
  const shellMesh = new THREE.Mesh(shellGeo, matIronCarapace);
  shellMesh.scale.set(2.05, 0.56, 0.92);
  shellMesh.position.set(0, 0.14, 0);
  deck3Group.add(shellMesh);

  // Glowing Cyan Hexagonal Wireframe Overlay on Carapace
  const shellWireGeo = new THREE.SphereGeometry(0.754, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.47);
  const shellWireMat = new THREE.MeshBasicMaterial({
    color: 0x2DD4BF,
    wireframe: true,
    transparent: true,
    opacity: 0.38
  });
  const shellWire = new THREE.Mesh(shellWireGeo, shellWireMat);
  shellWire.scale.set(2.05, 0.56, 0.92);
  shellWire.position.set(0, 0.14, 0);
  deck3Group.add(shellWire);

  // Central Cross-Shaped Walkway (십자로 細路) in Antique Gold
  const spineLongGeo = new THREE.BoxGeometry(2.65, 0.04, 0.1);
  const spineLong = new THREE.Mesh(spineLongGeo, matGold);
  spineLong.position.set(0, 0.53, 0);
  deck3Group.add(spineLong);

  const spineCrossGeo = new THREE.BoxGeometry(0.12, 0.04, 1.15);
  const spineCross = new THREE.Mesh(spineCrossGeo, matGold);
  spineCross.position.set(0, 0.51, 0);
  deck3Group.add(spineCross);

  // Iron Spikes (철첨 / Cheolcheom) arrayed across the Carapace
  const spikeGeo = new THREE.ConeGeometry(0.018, 0.11, 5);
  for (let sx = -1.1; sx <= 1.1; sx += 0.22) {
    for (let sz = -0.48; sz <= 0.48; sz += 0.16) {
      if (Math.abs(sz) < 0.06) continue; // Leave central walkway clear
      const nx = sx / 1.45;
      const nz = sz / 0.65;
      const r2 = nx * nx + nz * nz;
      if (r2 > 0.88) continue;
      const sy = 0.16 + Math.sqrt(Math.max(0, 1 - r2)) * 0.39;
      const spike = new THREE.Mesh(spikeGeo, matGold);
      spike.position.set(sx, sy, sz);
      spike.rotation.x = sz * 0.55;
      spike.rotation.z = -sx * 0.18;
      deck3Group.add(spike);
    }
  }

  // --- YONGDU: DRAGON HEAD PROW (선수 용두) ---
  const dragonGroup = new THREE.Group();
  dragonGroup.position.set(1.48, 0.25, 0);

  // Dragon Neck
  const neckGeo = new THREE.CylinderGeometry(0.11, 0.15, 0.52, 10);
  const neck = new THREE.Mesh(neckGeo, matGold);
  neck.rotation.z = -Math.PI / 5;
  neck.position.set(0.08, 0.18, 0);
  dragonGroup.add(neck);

  // Dragon Skull & Snout
  const headGeo = new THREE.BoxGeometry(0.38, 0.22, 0.24);
  const head = new THREE.Mesh(headGeo, matGold);
  head.position.set(0.26, 0.38, 0);
  dragonGroup.add(head);

  // Lower Jaw (Open to breathe smoke/fire)
  const jawGeo = new THREE.BoxGeometry(0.32, 0.07, 0.2);
  const jaw = new THREE.Mesh(jawGeo, matBronze);
  jaw.rotation.z = -0.28;
  jaw.position.set(0.28, 0.24, 0);
  dragonGroup.add(jaw);

  // Glowing Cyan Dragon Eyes
  const eyeGeo = new THREE.SphereGeometry(0.032, 8, 8);
  [-1, 1].forEach(side => {
    const eye = new THREE.Mesh(eyeGeo, matCyanGlow);
    eye.position.set(0.28, 0.44, side * 0.125);
    dragonGroup.add(eye);

    // Swept Antler Horns (용각)
    const hornGeo = new THREE.ConeGeometry(0.028, 0.34, 6);
    const horn = new THREE.Mesh(hornGeo, matGold);
    horn.rotation.z = Math.PI * 0.68;
    horn.rotation.y = side * 0.25;
    horn.position.set(0.04, 0.52, side * 0.11);
    dragonGroup.add(horn);
  });

  // Internal Cannon Barrel inside Dragon Mouth
  const mouthCannonGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.28, 12);
  const mouthCannon = new THREE.Mesh(mouthCannonGeo, matCyanGlow);
  mouthCannon.rotation.z = Math.PI / 2;
  mouthCannon.position.set(0.35, 0.32, 0);
  dragonGroup.add(mouthCannon);

  // Lower Prow Demon Mask / Shock Ram (하단 도깨비방패 충각)
  const ramGeo = new THREE.ConeGeometry(0.16, 0.35, 6);
  const ram = new THREE.Mesh(ramGeo, matGold);
  ram.rotation.z = -Math.PI / 2;
  ram.position.set(0.12, -0.26, 0);
  dragonGroup.add(ram);

  deck2Group.add(dragonGroup);

  // --- GWIMI: TURTLE TAIL STERN (선미 귀미 & 치/키) ---
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-1.48, 0.18, 0);

  const tailArchGeo = new THREE.ConeGeometry(0.14, 0.55, 8);
  const tailArch = new THREE.Mesh(tailArchGeo, matGold);
  tailArch.rotation.z = Math.PI * 0.32;
  tailArch.position.set(-0.12, 0.18, 0);
  tailGroup.add(tailArch);

  // Command Banner Mast at Stern (삼도수군통제영 수자기)
  const flagPoleGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.85, 6);
  const flagPole = new THREE.Mesh(flagPoleGeo, matGold);
  flagPole.position.set(0.15, 0.52, 0);
  tailGroup.add(flagPole);

  const bannerGeo = new THREE.PlaneGeometry(0.32, 0.42);
  const bannerMat = new THREE.MeshBasicMaterial({
    color: 0xD4AF37,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(-0.02, 0.72, 0);
  tailGroup.add(banner);

  deck2Group.add(tailGroup);
  group.add(deck3Group);

  // --- CYBER WATER WAKE RING ---
  const wakeRingGeo = new THREE.RingGeometry(1.45, 1.52, 48);
  const wakeRingMat = new THREE.MeshBasicMaterial({
    color: 0x2DD4BF,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.32
  });
  const wakeRing = new THREE.Mesh(wakeRingGeo, wakeRingMat);
  wakeRing.rotation.x = Math.PI / 2;
  wakeRing.scale.set(1.25, 0.55, 1);
  wakeRing.position.y = -0.44;
  group.add(wakeRing);

  group.userData = {
    deck1Group,
    deck2Group,
    deck3Group,
    dragonGroup,
    oars,
    cannons,
    shellMesh,
    shellWire,
    wakeRing,
    materials: [matWoodDark, matWoodDeck, matIronCarapace]
  };

  return group;
}

/* -------------------------------------------------------------------------
   3. SPECIALIZED 3D NODE BUILDERS FOR THE 6 EPISODES
   ------------------------------------------------------------------------- */
function createNode3DSceneObject(nodeIndex) {
  const root = new THREE.Group();

  const matGold = new THREE.MeshStandardMaterial({
    color: 0xD4AF37, roughness: 0.22, metalness: 0.92, emissive: 0x2a1d00, emissiveIntensity: 0.3
  });
  const matIron = new THREE.MeshStandardMaterial({
    color: 0x1a242e, roughness: 0.3, metalness: 0.88
  });
  const matCyan = new THREE.MeshBasicMaterial({
    color: 0x2DD4BF, transparent: true, opacity: 0.9
  });
  const matCyanWire = new THREE.MeshBasicMaterial({
    color: 0x2DD4BF, wireframe: true, transparent: true, opacity: 0.38
  });
  const matEmber = new THREE.MeshBasicMaterial({
    color: 0xE06A3B, transparent: true, opacity: 0.92
  });
  const matBronze = new THREE.MeshStandardMaterial({
    color: 0xa47e3b, roughness: 0.3, metalness: 0.88
  });
  const matWood = new THREE.MeshStandardMaterial({
    color: 0x3b281c, roughness: 0.58, metalness: 0.25
  });

  if (nodeIndex === 0) {
    // NODE 01: CLOSE-UP SCULPTED YONGDU (DRAGON HEAD BOW) + SULFUR SMOKE PLASMA
    const dragon = new THREE.Group();

    // Armored Neck Base with Scales
    const neckGeo = new THREE.CylinderGeometry(0.42, 0.58, 1.35, 16);
    const neck = new THREE.Mesh(neckGeo, matIron);
    neck.rotation.z = -0.25;
    neck.position.set(-0.35, -0.45, 0);
    dragon.add(neck);

    const neckWire = new THREE.Mesh(neckGeo, matCyanWire);
    neckWire.rotation.z = -0.25;
    neckWire.scale.setScalar(1.02);
    neckWire.position.copy(neck.position);
    dragon.add(neckWire);

    // Golden Scale Rings along Neck
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(0.48 - i * 0.03, 0.035, 8, 20);
      const ring = new THREE.Mesh(ringGeo, matGold);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.y = 0.25;
      ring.position.set(-0.42 + i * 0.08, -0.75 + i * 0.25, 0);
      dragon.add(ring);
    }

    // Upper Cranium & Snout
    const craniumGeo = new THREE.BoxGeometry(0.95, 0.52, 0.68);
    const cranium = new THREE.Mesh(craniumGeo, matGold);
    cranium.position.set(0.05, 0.25, 0);
    dragon.add(cranium);

    const snoutGeo = new THREE.BoxGeometry(0.85, 0.34, 0.52);
    const snout = new THREE.Mesh(snoutGeo, matGold);
    snout.position.set(0.62, 0.22, 0);
    dragon.add(snout);

    // Lower Hinged Jaw
    const jawGeo = new THREE.BoxGeometry(0.88, 0.2, 0.48);
    const jaw = new THREE.Mesh(jawGeo, matBronze);
    jaw.rotation.z = -0.32;
    jaw.position.set(0.55, -0.18, 0);
    dragon.add(jaw);

    // Sharp Golden Fangs
    const fangGeo = new THREE.ConeGeometry(0.045, 0.18, 6);
    [-0.18, 0.18].forEach(fz => {
      const upperFang = new THREE.Mesh(fangGeo, matCyan);
      upperFang.rotation.x = Math.PI;
      upperFang.position.set(0.88, 0.02, fz);
      dragon.add(upperFang);

      const lowerFang = new THREE.Mesh(fangGeo, matGold);
      lowerFang.position.set(0.82, -0.18, fz);
      dragon.add(lowerFang);
    });

    // Glowing Cyber Eyes & Swept Antler Horns
    [-1, 1].forEach(side => {
      const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), matCyan);
      eyeSocket.position.set(0.28, 0.38, side * 0.35);
      dragon.add(eyeSocket);

      const hornGeo = new THREE.ConeGeometry(0.08, 1.15, 8);
      const horn = new THREE.Mesh(hornGeo, matGold);
      horn.rotation.z = Math.PI * 0.66;
      horn.rotation.y = side * 0.28;
      horn.position.set(-0.45, 0.68, side * 0.28);
      dragon.add(horn);

      // Flowing Mane Fins
      for (let m = 0; m < 3; m++) {
        const finGeo = new THREE.ConeGeometry(0.06, 0.48, 4);
        const fin = new THREE.Mesh(finGeo, m % 2 === 0 ? matGold : matCyan);
        fin.rotation.z = Math.PI * 0.58;
        fin.position.set(-0.48, 0.28 - m * 0.22, side * 0.36);
        dragon.add(fin);
      }
    });

    // Concealed Hyeonja Cannon Barrel inside Throat
    const throatCannonGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.9, 16);
    const throatCannon = new THREE.Mesh(throatCannonGeo, matIron);
    throatCannon.rotation.z = Math.PI / 2;
    throatCannon.position.set(0.45, 0.04, 0);
    dragon.add(throatCannon);

    const muzzleGlow = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.13, 16), matCyan);
    muzzleGlow.rotation.y = Math.PI / 2;
    muzzleGlow.position.set(0.91, 0.04, 0);
    dragon.add(muzzleGlow);

    // Sulfur Smoke & Plasma Breath Particles
    const breathGroup = new THREE.Group();
    for (let p = 0; p < 24; p++) {
      const pGeo = new THREE.SphereGeometry(0.04 + (p / 24) * 0.09, 8, 8);
      const pMesh = new THREE.Mesh(pGeo, p % 3 === 0 ? matEmber : matCyan);
      pMesh.position.set(0.95 + (p / 24) * 1.35, 0.02 + (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25);
      pMesh.userData = { baseOffset: p / 24, speed: 0.015 + Math.random() * 0.01 };
      breathGroup.add(pMesh);
    }
    dragon.add(breathGroup);
    root.userData.breathGroup = breathGroup;
    root.add(dragon);

  } else if (nodeIndex === 1) {
    // NODE 02: HEXAGONAL IRON SPIKE CARAPACE (개판과 철첨)
    const carapace = new THREE.Group();

    // Heavy Timber Sub-Arch (개판 목재 하부 프레임)
    const timberBaseGeo = new THREE.CylinderGeometry(1.45, 1.45, 2.2, 24, 1, false, -Math.PI * 0.35, Math.PI * 0.7);
    const timberBase = new THREE.Mesh(timberBaseGeo, matWood);
    timberBase.rotation.z = Math.PI / 2;
    timberBase.position.y = -0.95;
    carapace.add(timberBase);

    // Hexagonal Armor Tiles Array + Forged Iron Spikes (철첨)
    const hexRadius = 0.22;
    const hexTileGeo = new THREE.CylinderGeometry(hexRadius, hexRadius, 0.045, 6);
    const spikeGeo = new THREE.ConeGeometry(0.032, 0.24, 6);

    for (let row = -4; row <= 4; row++) {
      for (let col = -3; col <= 3; col++) {
        if (col === 0 || row === 0) continue; // Cross walkway
        const x = row * 0.24;
        const z = col * 0.32 + (Math.abs(row) % 2) * 0.12;
        if (Math.abs(z) > 1.05) continue;

        const archY = Math.cos((z / 1.25) * (Math.PI * 0.38)) * 0.55 - 0.25;
        const tiltX = Math.sin((z / 1.25) * (Math.PI * 0.38)) * 0.48;

        const tileGroup = new THREE.Group();
        tileGroup.position.set(x, archY, z);
        tileGroup.rotation.x = tiltX;

        const tile = new THREE.Mesh(hexTileGeo, (Math.abs(row + col) % 3 === 0) ? matGold : matIron);
        tileGroup.add(tile);

        const tileEdge = new THREE.Mesh(hexTileGeo, matCyanWire);
        tileEdge.scale.setScalar(1.03);
        tileGroup.add(tileEdge);

        const spike = new THREE.Mesh(spikeGeo, matGold);
        spike.position.y = 0.14;
        tileGroup.add(spike);

        carapace.add(tileGroup);
      }
    }

    // Central Cross-Shaped Tactical Walkway (십자로)
    const longWalk = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.06, 0.22), matGold);
    longWalk.position.set(0, 0.32, 0);
    carapace.add(longWalk);

    const crossWalk = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 2.05), matGold);
    crossWalk.position.set(0, 0.22, 0);
    carapace.add(crossWalk);

    // Holographic Energy Deflection Dome
    const domeGeo = new THREE.SphereGeometry(1.45, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const dome = new THREE.Mesh(domeGeo, matCyanWire);
    dome.scale.set(1.05, 0.55, 0.88);
    dome.position.y = -0.15;
    carapace.add(dome);

    root.add(carapace);

  } else if (nodeIndex === 2) {
    // NODE 03: CHEONJA-CHONGTONG CANNON & DAEJANGGUNJEON GIANT ROCKET-ARROW
    const artillery = new THREE.Group();

    // Heavy Naval Oak Gun Carriage (동차 / 포가)
    const carriageBase = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.18, 0.72), matWood);
    carriageBase.position.y = -0.42;
    artillery.add(carriageBase);

    [-0.3, 0.3].forEach(cz => {
      const cheek = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.32, 0.09), matWood);
      cheek.position.set(-0.08, -0.2, cz);
      artillery.add(cheek);

      // Bronze Wheels
      [-0.5, 0.45].forEach(wx => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 16), matGold);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, -0.48, cz * 1.25);
        artillery.add(wheel);
      });
    });

    // Cheonja-chongtong Bronze Barrel (천자총통 약통·모병·부리)
    const barrelGroup = new THREE.Group();
    barrelGroup.position.set(-0.15, 0.05, 0);
    barrelGroup.rotation.z = 0.08;

    const chamber = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.65, 20), matBronze);
    chamber.rotation.z = Math.PI / 2;
    chamber.position.x = -0.48;
    barrelGroup.add(chamber);

    const bore = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.15, 20), matBronze);
    bore.rotation.z = Math.PI / 2;
    bore.position.x = 0.35;
    barrelGroup.add(bore);

    // 8 Reinforcing Bamboo-Node Rings (죽절 / Jukjeol)
    for (let r = 0; r < 7; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.205 - r * 0.004, 0.025, 8, 24), matGold);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = -0.68 + r * 0.25;
      barrelGroup.add(ring);
    }

    // Daejanggunjeon (대장군전 — 30kg Iron-Finned Giant Timber Missile)
    const missileGroup = new THREE.Group();
    missileGroup.position.set(1.05, 0, 0);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.25, 12), matWood);
    shaft.rotation.z = Math.PI / 2;
    missileGroup.add(shaft);

    // Iron Warhead Cone (철촉)
    const warhead = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.32, 12), matGold);
    warhead.rotation.z = -Math.PI / 2;
    warhead.position.x = 0.75;
    missileGroup.add(warhead);

    // 3 Iron Stabilizer Fins (철우 / 쇠날개)
    for (let f = 0; f < 3; f++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.02), matCyan);
      fin.rotation.x = (f * Math.PI * 2) / 3;
      fin.position.x = -0.25;
      missileGroup.add(fin);
    }

    barrelGroup.add(missileGroup);
    artillery.add(barrelGroup);
    root.userData.barrelGroup = barrelGroup;
    root.userData.missileGroup = missileGroup;
    root.add(artillery);

  } else if (nodeIndex === 3) {
    // NODE 04: FULL 3-DECK GEOBUKSEON IRONCLAD (WITH X-RAY & EXPLODED VIEW)
    const ship = createCyberGeobukseonGroup();
    ship.scale.setScalar(0.92);
    root.userData.shipGroup = ship;
    root.add(ship);

  } else if (nodeIndex === 4) {
    // NODE 05: ADMIRAL YI'S TWIN-DRAGON COMMAND SWORD (쌍룡검) & NANJUNG ILGI WAR DIARY
    const relicSet = new THREE.Group();

    // Sword 1 & Sword 2 Crossed / Floating
    [-1, 1].forEach((dir, idx) => {
      const sword = new THREE.Group();
      sword.position.set(dir * 0.35, 0.05, idx === 0 ? 0.15 : -0.15);
      sword.rotation.z = dir * 0.38;

      // Steel Blade (197.5cm scale) with Engraved Gold Poetry Spine
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.15, 0.018), matIron);
      blade.position.y = 0.25;
      sword.add(blade);

      const spine = new THREE.Mesh(new THREE.BoxGeometry(0.025, 2.05, 0.022), idx === 0 ? matGold : matCyan);
      spine.position.y = 0.24;
      sword.add(spine);

      // Blade Point
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.2, 4), matGold);
      tip.position.y = 1.42;
      sword.add(tip);

      // Twin-Dragon Guard (코등이)
      const guard = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.032, 8, 16), matGold);
      guard.scale.set(1.2, 0.45, 1);
      guard.position.y = -0.82;
      sword.add(guard);

      // Ray-skin & Red Lacquer Grip
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.55, 12), matWood);
      grip.position.y = -1.12;
      sword.add(grip);

      const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), matGold);
      pommel.position.y = -1.42;
      sword.add(pommel);

      relicSet.add(sword);
    });

    // Floating Holographic Nanjung Ilgi (난중일기) Manuscript Scroll
    const scrollGroup = new THREE.Group();
    scrollGroup.position.set(0, -0.15, 0.38);
    scrollGroup.rotation.x = -0.18;

    const page = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.78, 0.02), matGold);
    scrollGroup.add(page);

    const innerPage = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.7, 0.025), matIron);
    scrollGroup.add(innerPage);

    // Vertical Calligraphy Columns (한문 행서 홀로그램 라인)
    for (let col = -0.42; col <= 0.42; col += 0.12) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.52, 0.03), col === 0 ? matEmber : matCyan);
      line.position.set(col, 0, 0);
      scrollGroup.add(line);
    }

    // Scroll Rollers
    [-0.58, 0.58].forEach(rx => {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.88, 12), matGold);
      roller.position.x = rx;
      scrollGroup.add(roller);
    });

    relicSet.add(scrollGroup);
    root.add(relicSet);

  } else {
    // NODE 06: HANSANDO CRANE WING FORMATION (학익진 3D 홀로그램 전술도)
    const table = new THREE.Group();
    table.rotation.x = 0.42;

    // Holographic Tactical Sea Disc
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.04, 48), matIron);
    table.add(disc);

    const gridRing1 = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.64, 48), matGold);
    gridRing1.rotation.x = -Math.PI / 2;
    gridRing1.position.y = 0.025;
    table.add(gridRing1);

    const gridRing2 = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.08, 48), matCyan);
    gridRing2.rotation.x = -Math.PI / 2;
    gridRing2.position.y = 0.025;
    table.add(gridRing2);

    // Semicircular Crane Wing Fleet (13 Panokseon Units forming the Crescent)
    for (let i = 0; i < 13; i++) {
      const angle = Math.PI * 0.15 + (i / 12) * Math.PI * 0.7;
      const rad = 1.15;
      const sx = Math.cos(angle) * rad;
      const sz = -Math.sin(angle) * rad + 0.25;

      const unit = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 4), matCyan);
      unit.rotation.x = Math.PI / 2;
      unit.position.set(sx, 0.08, sz);
      unit.lookAt(0, 0.08, 0.2);
      table.add(unit);

      // Concentric Firing Laser Vector toward Enemy Center
      const beamGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.9, 6);
      const beam = new THREE.Mesh(beamGeo, matGold);
      beam.position.set(sx * 0.55, 0.08, (sz + 0.2) * 0.5);
      beam.lookAt(0, 0.08, 0.2);
      beam.rotateX(Math.PI / 2);
      table.add(beam);
    }

    // 3 Vanguard Geobukseon Assault Units charging center
    [-0.22, 0, 0.22].forEach((gx, idx) => {
      const gbs = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.22), matGold);
      gbs.position.set(gx, 0.1, -0.35 + (idx === 1 ? 0.18 : 0));
      table.add(gbs);
    });

    // Enemy Fleet Cluster trapped in the Kill Zone (Red/Ember Nodes)
    for (let e = 0; e < 9; e++) {
      const ex = ( (e % 3) - 1 ) * 0.24 + (Math.random() - 0.5) * 0.06;
      const ez = 0.15 + Math.floor(e / 3) * 0.24;
      const enemy = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), matEmber);
      enemy.position.set(ex, 0.1, ez);
      table.add(enemy);
    }

    root.add(table);
  }

  return root;
}

/* -------------------------------------------------------------------------
   4. VIEW 1: THE GENESIS GATE 3D RENDERER (perahu3DContainer)
   Drives the Sculpted 3D Geobukseon Diorama with 3D Gimbal Tilt + GLB Drop
   ------------------------------------------------------------------------- */
let gateScene, gateCamera, gateRenderer, gateShipMesh = null;
let isGateInteracting = false;
let gatePrevMouseX = 0, gatePrevMouseY = 0;
let gateRotY = 0, gateRotX = 0;

function initGateThreeJS() {
  const container = document.getElementById('perahu3DContainer');
  const heroImg = document.getElementById('gateDioramaHeroImg');
  if (!container) return;

  // Interactive 3D Gimbal Drag & Hover on the Sculpted Geobukseon Portal Diorama
  container.addEventListener('pointerdown', (e) => {
    isGateInteracting = true;
    gatePrevMouseX = e.clientX;
    gatePrevMouseY = e.clientY;
  });
  window.addEventListener('pointerup', () => { isGateInteracting = false; });
  window.addEventListener('pointermove', (e) => {
    if (isGateInteracting) {
      const dx = e.clientX - gatePrevMouseX;
      const dy = e.clientY - gatePrevMouseY;
      gateRotY = Math.max(-35, Math.min(35, gateRotY + dx * 0.25));
      gateRotX = Math.max(-22, Math.min(22, gateRotX - dy * 0.2));
      gatePrevMouseX = e.clientX;
      gatePrevMouseY = e.clientY;
      if (gateShipMesh) {
        gateShipMesh.rotation.y += dx * 0.014;
      }
    }
  });

  // Support drag & drop .glb into portal (Method 1)
  if (THREE.GLTFLoader) {
    const loader = new THREE.GLTFLoader();
    container.addEventListener('dragover', (e) => { e.preventDefault(); container.classList.add('scale-105'); });
    container.addEventListener('dragleave', () => { container.classList.remove('scale-105'); });
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      container.classList.remove('scale-105');
      const file = e.dataTransfer.files[0];
      if (file && /\.(glb|gltf)$/i.test(file.name)) {
        const w = container.clientWidth || 360;
        const h = container.clientHeight || 320;
        if (!gateRenderer) {
          gateScene = new THREE.Scene();
          gateCamera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
          gateCamera.position.set(0, 0.65, 3.8);
          gateCamera.lookAt(0, 0, 0);
          gateRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
          gateRenderer.setSize(w, h);
          gateRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          if (heroImg) heroImg.classList.add('hidden');
          container.appendChild(gateRenderer.domElement);
          gateScene.add(new THREE.AmbientLight(0xffffff, 1.8));
          const tl = new THREE.PointLight(0x2DD4BF, 4.5, 18);
          tl.position.set(3.2, 2.8, 2.5);
          gateScene.add(tl);
        }
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (ev) => {
          loader.parse(ev.target.result, '', (gltf) => {
            if (gateShipMesh) gateScene.remove(gateShipMesh);
            gateShipMesh = gltf.scene;
            gateScene.add(gateShipMesh);
          });
        };
      }
    });
  }

  function animateGate() {
    requestAnimationFrame(animateGate);
    const t = Date.now() * 0.002;
    if (heroImg && !heroImg.classList.contains('hidden')) {
      if (!isGateInteracting) {
        gateRotY = Math.sin(t * 0.65) * 14;
        gateRotX = Math.cos(t * 0.5) * 6;
      }
      const floatY = Math.sin(t * 1.1) * 7;
      heroImg.style.transform = `translateY(${floatY}px) rotateX(${gateRotX}deg) rotateY(${gateRotY}deg) scale(1.03)`;
    }
    if (gateRenderer && gateScene && gateCamera) {
      if (gateShipMesh && !isGateInteracting) {
        gateShipMesh.rotation.y += 0.007;
      }
      gateRenderer.render(gateScene, gateCamera);
    }
  }
  animateGate();
}

/* -------------------------------------------------------------------------
   5. VIEW 2: LIVING REALM 3D INTERACTIVE CANVAS (realm3DContainer)
   ------------------------------------------------------------------------- */
let realmScene, realmCamera, realmRenderer, activeNodeGroup = null;
let realmAutoRotate = true;
let realmXRayMode = false;
let realmExplodeMode = false;
let realmFireTimer = 0;
let realmParticles = [];

let isRealmDragging = false;
let isRealmPanning = false;
let realmPrevX = 0, realmPrevY = 0;
let realmRotY = -0.45, realmRotX = 0.18;
let realmPanX = 0, realmPanY = 0;
let realmZoom = 3.6;

function initRealmThreeJS() {
  const container = document.getElementById('realm3DCanvasContainer');
  if (!container) return;

  const w = container.clientWidth || 680;
  const h = container.clientHeight || 500;

  realmScene = new THREE.Scene();
  realmCamera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  realmCamera.position.set(0, 0.4, realmZoom);

  realmRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  realmRenderer.setSize(w, h);
  realmRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(realmRenderer.domElement);

  realmScene.add(new THREE.AmbientLight(0xffffff, 1.65));

  const dirLight = new THREE.DirectionalLight(0xfff4d6, 2.2);
  dirLight.position.set(4, 6, 4);
  realmScene.add(dirLight);

  const cyanPoint = new THREE.PointLight(0x2DD4BF, 3.8, 15);
  cyanPoint.position.set(-3.5, 2.2, 3.0);
  realmScene.add(cyanPoint);

  const goldPoint = new THREE.PointLight(0xD4AF37, 3.5, 15);
  goldPoint.position.set(3.5, -2.0, 2.5);
  realmScene.add(goldPoint);

  // Subtle Cyber Hologram Pedestal Ring under the Relic
  const basePedestal = new THREE.Group();
  const pedRing1 = new THREE.Mesh(
    new THREE.RingGeometry(1.55, 1.6, 64),
    new THREE.MeshBasicMaterial({ color: 0xD4AF37, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
  );
  pedRing1.rotation.x = Math.PI / 2;
  pedRing1.position.y = -0.95;
  basePedestal.add(pedRing1);

  const pedRing2 = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 1.18, 48),
    new THREE.MeshBasicMaterial({ color: 0x2DD4BF, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
  );
  pedRing2.rotation.x = Math.PI / 2;
  pedRing2.position.y = -0.95;
  basePedestal.add(pedRing2);
  realmScene.add(basePedestal);

  // Mouse & Touch Orbit + Pan + Zoom Controls
  container.addEventListener('pointerdown', (e) => {
    isRealmDragging = true;
    isRealmPanning = e.shiftKey || e.button === 2;
    realmPrevX = e.clientX;
    realmPrevY = e.clientY;
  });

  window.addEventListener('pointerup', () => {
    isRealmDragging = false;
    isRealmPanning = false;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isRealmDragging) return;
    const dx = e.clientX - realmPrevX;
    const dy = e.clientY - realmPrevY;
    realmPrevX = e.clientX;
    realmPrevY = e.clientY;

    if (isRealmPanning) {
      realmPanX += dx * 0.004;
      realmPanY -= dy * 0.004;
    } else {
      realmRotY += dx * 0.01;
      realmRotX = Math.max(-0.85, Math.min(0.95, realmRotX + dy * 0.008));
    }
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    realmZoom = Math.max(1.8, Math.min(6.5, realmZoom + e.deltaY * 0.0025));
  }, { passive: false });

  loadRealmNode3D(0);

  function animateRealm() {
    requestAnimationFrame(animateRealm);
    const t = Date.now() * 0.002;

    if (activeNodeGroup) {
      if (realmAutoRotate && !isRealmDragging) {
        realmRotY += 0.006;
      }
      activeNodeGroup.rotation.y = realmRotY;
      activeNodeGroup.rotation.x = realmRotX;
      activeNodeGroup.position.x = realmPanX;
      activeNodeGroup.position.y = realmPanY + Math.sin(t) * 0.035;

      // Animate Dragon Breath (Node 0)
      if (activeNodeGroup.userData.breathGroup) {
        activeNodeGroup.userData.breathGroup.children.forEach((p, idx) => {
          p.position.x += p.userData.speed * (realmFireTimer > 0 ? 2.8 : 1.0);
          const prog = (p.position.x - 0.9) / 1.5;
          p.scale.setScalar(1 + prog * (realmFireTimer > 0 ? 2.4 : 1.2));
          if (p.position.x > 2.4) {
            p.position.x = 0.92;
          }
        });
      }

      // Animate Cannon Missile Recoil (Node 2)
      if (activeNodeGroup.userData.missileGroup && realmFireTimer > 0) {
        activeNodeGroup.userData.missileGroup.position.x = 1.05 + (1 - realmFireTimer / 40) * 2.2;
      } else if (activeNodeGroup.userData.missileGroup) {
        activeNodeGroup.userData.missileGroup.position.x = 1.05;
      }

      // Animate Full Geobukseon Oars & Exploded View (Node 3)
      if (activeNodeGroup.userData.shipGroup) {
        const sg = activeNodeGroup.userData.shipGroup;
        if (sg.userData.oars) {
          sg.userData.oars.forEach(o => {
            o.pivot.rotation.z = Math.sin(t * 2.4 + o.index * 0.4) * 0.25;
          });
        }
        // Smoothly interpolate Exploded View (3 Decks separating vertically)
        const targetD3 = realmExplodeMode ? 0.68 : 0;
        const targetD1 = realmExplodeMode ? -0.58 : 0;
        sg.userData.deck3Group.position.y += (targetD3 - sg.userData.deck3Group.position.y) * 0.1;
        sg.userData.deck1Group.position.y += (targetD1 - sg.userData.deck1Group.position.y) * 0.1;
      }
    }

    // Update Fire Burst Particles
    if (realmFireTimer > 0) realmFireTimer--;
    for (let i = realmParticles.length - 1; i >= 0; i--) {
      const fp = realmParticles[i];
      fp.mesh.position.add(fp.vel);
      fp.life -= 0.03;
      fp.mesh.material.opacity = Math.max(0, fp.life);
      fp.mesh.scale.multiplyScalar(1.03);
      if (fp.life <= 0) {
        realmScene.remove(fp.mesh);
        realmParticles.splice(i, 1);
      }
    }

    realmCamera.position.z += (realmZoom - realmCamera.position.z) * 0.12;
    realmRenderer.render(realmScene, realmCamera);
  }
  animateRealm();
}

function loadRealmNode3D(index) {
  if (!realmScene) return;
  if (activeNodeGroup) {
    realmScene.remove(activeNodeGroup);
  }
  activeNodeGroup = createNode3DSceneObject(index);
  realmRotX = index === 5 ? 0.28 : 0.16;
  realmPanX = 0;
  realmPanY = 0;
  applyRealmXRayState();
  realmScene.add(activeNodeGroup);
}

function applyRealmXRayState() {
  if (!activeNodeGroup) return;
  activeNodeGroup.traverse((child) => {
    if (child.isMesh && child.material && !child.material.wireframe) {
      child.material.transparent = true;
      child.material.opacity = realmXRayMode ? 0.35 : 0.98;
      child.material.needsUpdate = true;
    }
  });
}

function triggerRealmFireEffect() {
  if (!realmScene) return;
  realmFireTimer = 45;
  for (let i = 0; i < 32; i++) {
    const isTeal = i % 2 === 0;
    const mat = new THREE.MeshBasicMaterial({
      color: isTeal ? 0x2DD4BF : 0xE06A3B,
      transparent: true,
      opacity: 0.95
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8), mat);
    mesh.position.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.6);
    const vel = new THREE.Vector3(
      (Math.random() - 0.2) * 0.09,
      (Math.random() - 0.3) * 0.06,
      (Math.random() - 0.5) * 0.09
    );
    realmScene.add(mesh);
    realmParticles.push({ mesh, vel, life: 1.0 });
  }
}

/* -------------------------------------------------------------------------
   6. VIEW 2 MODAL 5: THREE.JS VR 360 SPHERICAL PANORAMA ENGINE
   Renders a 360° Hansando Night Sea Battle from the Geobukseon Deck
   ------------------------------------------------------------------------- */
let vrScene, vrCamera, vrRenderer, vrSphereMesh;
let vrIsUserInteracting = false;
let vrLon = 0, vrLat = 5;
let vrStartX = 0, vrStartY = 0, vrStartLon = 0, vrStartLat = 0;
let vrInitialized = false;

function buildProcedural360BattlePanorama() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // Night Sky & Deep Sea Equirectangular Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#04070b');
  skyGrad.addColorStop(0.45, '#0c1c24');
  skyGrad.addColorStop(0.5, '#193b42');
  skyGrad.addColorStop(0.55, '#0a1921');
  skyGrad.addColorStop(1, '#040609');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Stars & Milky Way
  for (let s = 0; s < 600; s++) {
    ctx.fillStyle = s % 5 === 0 ? '#D4AF37' : '#F0F6FC';
    ctx.globalAlpha = Math.random() * 0.8 + 0.2;
    ctx.fillRect(Math.random() * w, Math.random() * (h * 0.46), 2, 2);
  }
  ctx.globalAlpha = 1;

  // Golden Crescent Moon over Hansando
  ctx.fillStyle = '#E5C158';
  ctx.shadowBlur = 40;
  ctx.shadowColor = '#D4AF37';
  ctx.beginPath();
  ctx.arc(w * 0.28, h * 0.22, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Distant Hansando & Mireukdo Mountain Island Ridges along Horizon
  ctx.fillStyle = '#091118';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  for (let x = 0; x <= w; x += 32) {
    const mh = Math.sin(x * 0.006) * 45 + Math.cos(x * 0.015) * 28 + 35;
    ctx.lineTo(x, h * 0.5 - Math.max(5, mh));
  }
  ctx.lineTo(w, h * 0.5);
  ctx.closePath();
  ctx.fill();

  // Distant Burning Enemy Fleet & Cannon Flashes on the Horizon
  const battleSpots = [0.15, 0.35, 0.52, 0.68, 0.85];
  battleSpots.forEach(bx => {
    const px = w * bx;
    const py = h * 0.51;
    const fireGrad = ctx.createRadialGradient(px, py, 4, px, py, 65);
    fireGrad.addColorStop(0, 'rgba(255, 200, 90, 0.95)');
    fireGrad.addColorStop(0.4, 'rgba(224, 106, 59, 0.65)');
    fireGrad.addColorStop(1, 'rgba(224, 106, 59, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath(); ctx.arc(px, py, 65, 0, Math.PI * 2); ctx.fill();
  });

  // Overhead Hexagonal Carapace Roof Lattice (Top of Sphere)
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.28)';
  ctx.lineWidth = 3;
  for (let x = 0; x < w; x += 128) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h * 0.25); ctx.stroke();
  }

  // Water Ripples & Cyan Tactical Grid on the Sea Surface
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.22)';
  ctx.lineWidth = 1.5;
  for (let y = h * 0.54; y < h * 0.92; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Compass & Tactical HUD Markers in 360 Space
  const markers = [
    { x: w * 0.5, label: "▲ 선수 용두 (BOW: DRAGON HEAD ASSAULT VECTOR)" },
    { x: w * 0.75, label: "▶ 우현 학익진 화망 (STARBOARD CRANE WING ARC)" },
    { x: w * 0.25, label: "◀ 좌현 한산도 제승당 (PORT HANSANDO CITADEL)" },
    { x: w * 0.05, label: "▼ 선미 대장기 (STERN COMMAND BANNER)" }
  ];
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  markers.forEach(m => {
    ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
    ctx.fillRect(m.x - 240, h * 0.43, 480, 36);
    ctx.strokeStyle = '#2DD4BF';
    ctx.strokeRect(m.x - 240, h * 0.43, 480, 36);
    ctx.fillStyle = '#2DD4BF';
    ctx.fillText(m.label, m.x, h * 0.43 + 24);
  });

  return canvas;
}

function initVRThree() {
  const container = document.getElementById('vrThreeContainer');
  const loadingEl = document.getElementById('vrLoadingOverlay');
  if (!container) return;

  if (vrInitialized && vrRenderer) {
    onVRResize();
    return;
  }

  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;

  vrScene = new THREE.Scene();
  vrCamera = new THREE.PerspectiveCamera(75, w / h, 1, 1100);
  vrCamera.target = new THREE.Vector3(0, 0, 0);

  vrRenderer = new THREE.WebGLRenderer({ antialias: true });
  vrRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  vrRenderer.setSize(w, h);
  container.innerHTML = '';
  container.appendChild(vrRenderer.domElement);

  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  const panoCanvas = buildProcedural360BattlePanorama();
  const texture = new THREE.CanvasTexture(panoCanvas);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  vrSphereMesh = new THREE.Mesh(geometry, material);
  vrScene.add(vrSphereMesh);

  if (loadingEl) loadingEl.classList.add('hidden');
  vrInitialized = true;

  container.addEventListener('pointerdown', (e) => {
    vrIsUserInteracting = true;
    vrStartX = e.clientX;
    vrStartY = e.clientY;
    vrStartLon = vrLon;
    vrStartLat = vrLat;
  });

  window.addEventListener('pointermove', (e) => {
    if (!vrIsUserInteracting) return;
    vrLon = (vrStartX - e.clientX) * 0.15 + vrStartLon;
    vrLat = (e.clientY - vrStartY) * 0.15 + vrStartLat;
    vrLat = Math.max(-85, Math.min(85, vrLat));
  });

  window.addEventListener('pointerup', () => { vrIsUserInteracting = false; });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    vrCamera.fov = Math.max(35, Math.min(95, vrCamera.fov + e.deltaY * 0.05));
    vrCamera.updateProjectionMatrix();
  }, { passive: false });

  function animateVR() {
    requestAnimationFrame(animateVR);
    const modal = document.getElementById('vrModal');
    if (modal && !modal.classList.contains('pointer-events-none')) {
      if (!vrIsUserInteracting) {
        vrLon += 0.05;
      }
      const phi = THREE.MathUtils.degToRad(90 - vrLat);
      const theta = THREE.MathUtils.degToRad(vrLon);

      vrCamera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
      vrCamera.target.y = 500 * Math.cos(phi);
      vrCamera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

      vrCamera.lookAt(vrCamera.target);
      vrRenderer.render(vrScene, vrCamera);
    }
  }
  animateVR();
}

function onVRResize() {
  const container = document.getElementById('vrThreeContainer');
  if (!container || !vrCamera || !vrRenderer) return;
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;
  vrCamera.aspect = w / h;
  vrCamera.updateProjectionMatrix();
  vrRenderer.setSize(w, h);
}

/* -------------------------------------------------------------------------
   7. VIEW 3: 3D HANSANDO & MYEONGNYANG STRAIT TOPOGRAPHY (topo3dCanvas)
   ------------------------------------------------------------------------- */
let topoScene, topoCamera, topoRenderer, topoTerrainMesh, topoWireMesh, topoScienceMode = true;
let isTopoDragging = false, topoPrevX = 0, topoPrevY = 0;
let topoRotY = 0.35, topoRotX = 0.52, topoZoom = 4.2;

const TOPO_PIN_COORDS = {
  hansan: new THREE.Vector3(-0.95, 0.42, -0.55),
  gyeonnae: new THREE.Vector3(1.05, 0.32, -0.68),
  hagikjin: new THREE.Vector3(-0.15, 0.14, 0.18),
  geobuk: new THREE.Vector3(0.28, 0.18, -0.15),
  uldolmok: new THREE.Vector3(0.65, -0.12, 0.55)
};

function init3DTopography() {
  const container = document.getElementById('topo3dContainer');
  const canvas = document.getElementById('topo3dCanvas');
  if (!container || !canvas) return;

  const w = container.clientWidth || 460;
  const h = container.clientHeight || 310;

  topoScene = new THREE.Scene();
  topoCamera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);

  topoRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  topoRenderer.setSize(w, h);
  topoRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  topoScene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const pLight = new THREE.PointLight(0x2DD4BF, 3.0, 15);
  pLight.position.set(2, 4, 3);
  topoScene.add(pLight);

  const terrainGroup = new THREE.Group();

  // Procedural Strait Bathymetry & Island Elevation Geometry
  const planeGeo = new THREE.PlaneGeometry(3.4, 2.4, 44, 32);
  planeGeo.rotateX(-Math.PI / 2);
  const pos = planeGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Island ridges on left (-x, -z) and right (+x, -z), deep strait channel in center
    const islandLeft = Math.exp(-((x + 1.05) ** 2 + (z + 0.55) ** 2) * 2.2) * 0.65;
    const islandRight = Math.exp(-((x - 1.1) ** 2 + (z + 0.6) ** 2) * 2.4) * 0.55;
    const reefSouth = Math.exp(-((x - 0.8) ** 2 + (z - 0.7) ** 2) * 3.0) * 0.35;
    const channelTrench = -Math.exp(-(x * x * 1.2 + z * z * 0.8)) * 0.22;
    const ripple = Math.sin(x * 5) * Math.cos(z * 5) * 0.03;
    pos.setY(i, islandLeft + islandRight + reefSouth + channelTrench + ripple);
  }
  planeGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x132a32,
    roughness: 0.6,
    metalness: 0.4,
    side: THREE.DoubleSide
  });
  topoTerrainMesh = new THREE.Mesh(planeGeo, terrainMat);
  terrainGroup.add(topoTerrainMesh);

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xE06A3B,
    wireframe: true,
    transparent: true,
    opacity: 0.52
  });
  topoWireMesh = new THREE.Mesh(planeGeo, wireMat);
  topoWireMesh.position.y = 0.005;
  terrainGroup.add(topoWireMesh);

  // Sea Datum Plane
  const waterGeo = new THREE.PlaneGeometry(3.38, 2.38);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshBasicMaterial({
    color: 0x2DD4BF,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide
  });
  const waterPlane = new THREE.Mesh(waterGeo, waterMat);
  waterPlane.position.y = 0.02;
  terrainGroup.add(waterPlane);

  topoScene.add(terrainGroup);

  container.addEventListener('pointerdown', (e) => {
    isTopoDragging = true;
    topoPrevX = e.clientX;
    topoPrevY = e.clientY;
  });
  window.addEventListener('pointerup', () => { isTopoDragging = false; });
  window.addEventListener('pointermove', (e) => {
    if (!isTopoDragging) return;
    topoRotY += (e.clientX - topoPrevX) * 0.01;
    topoRotX = Math.max(0.2, Math.min(1.1, topoRotX + (e.clientY - topoPrevY) * 0.008));
    topoPrevX = e.clientX;
    topoPrevY = e.clientY;
  });
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    topoZoom = Math.max(2.4, Math.min(6.0, topoZoom + e.deltaY * 0.003));
  }, { passive: false });

  function animateTopo() {
    requestAnimationFrame(animateTopo);
    if (!isTopoDragging) {
      topoRotY += 0.0025;
    }
    terrainGroup.rotation.y = topoRotY;
    topoCamera.position.set(0, Math.sin(topoRotX) * topoZoom, Math.cos(topoRotX) * topoZoom);
    topoCamera.lookAt(0, 0, 0);

    topoRenderer.render(topoScene, topoCamera);
    updateTopoPinsOverlay(terrainGroup, container);
  }
  animateTopo();
}

function updateTopoPinsOverlay(terrainGroup, container) {
  if (!topoCamera || !container) return;
  const w = container.clientWidth;
  const h = container.clientHeight;

  Object.keys(TOPO_PIN_COORDS).forEach(key => {
    const pinEl = document.getElementById(`pin-${key}`);
    if (!pinEl) return;
    const worldPos = TOPO_PIN_COORDS[key].clone().applyEuler(terrainGroup.rotation);
    worldPos.project(topoCamera);

    if (worldPos.z > 1) {
      pinEl.classList.add('hidden');
      return;
    }
    pinEl.classList.remove('hidden');
    const sx = (worldPos.x * 0.5 + 0.5) * w;
    const sy = (-worldPos.y * 0.5 + 0.5) * h;
    pinEl.style.left = `${sx}px`;
    pinEl.style.top = `${sy}px`;
  });
}

function setTopoColorTheme(hexColor) {
  if (topoWireMesh && topoWireMesh.material) {
    topoWireMesh.material.color.set(hexColor);
  }
}

function reset3DCamera() {
  topoRotY = 0.35;
  topoRotX = 0.52;
  topoZoom = 4.2;
}
