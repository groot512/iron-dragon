/* =========================================================================
   IRON DRAGON (거북선 / GEOBUKSEON) — CORE APPLICATION & INTERACTION ENGINE
   Benchmarking MetaDwipa.id Spatial Storytelling & Prismatic Monograph UX
   ========================================================================= */

let currentLang = 'ko';
let currentRealm = 'gate'; // 'gate' | 'realm' | 'science'
let currentChapterIndex = 0;
let currentPerspectiveIndex = 0;
let carouselOffset = 0;
let arCarouselOffset = 0;
let textSizeIndex = 1; // 0: sm, 1: normal, 2: lg

let bgmAudioEl = null;
let isAudioActive = true;
let audioUnlocked = false;
let webAudioFallback = null;

/* -------------------------------------------------------------------------
   1. INTERACTIVE STARDUST & CONSTELLATION PARTICLES CANVAS
   ------------------------------------------------------------------------- */
let particleCanvas, pCtx, particles = [];
let mousePos = { x: null, y: null, radius: 145 };

function initParticleCanvas() {
  particleCanvas = document.getElementById('ambientCanvas');
  if (!particleCanvas) return;
  pCtx = particleCanvas.getContext('2d');

  function resize() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    particles = [];
    const count = Math.min(Math.floor(window.innerWidth * 0.11), 150);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        radius: Math.random() * 2 + 0.6,
        color: Math.random() > 0.42 ? 'rgba(212, 175, 55, ' : 'rgba(45, 212, 191, ',
        opacity: Math.random() * 0.6 + 0.2,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mousePos.x = null;
    mousePos.y = null;
  });

  function renderParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.y > particleCanvas.height) p.y = 0;

      if (mousePos.x !== null) {
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mousePos.radius && dist > 0) {
          const force = (mousePos.radius - dist) / mousePos.radius;
          p.x -= (dx / dist) * force * 1.8;
          p.y -= (dy / dist) * force * 1.8;
        }
      }

      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      pCtx.fillStyle = p.color + p.opacity + ')';
      pCtx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist2 < 78) {
          pCtx.beginPath();
          pCtx.strokeStyle = `rgba(212, 175, 55, ${0.12 * (1 - dist2 / 78)})`;
          pCtx.lineWidth = 0.5;
          pCtx.moveTo(p.x, p.y);
          pCtx.lineTo(p2.x, p2.y);
          pCtx.stroke();
        }
      }
    }
    requestAnimationFrame(renderParticles);
  }
  renderParticles();
}

function initRelicAuraAndMist() {
  const canvas = document.getElementById('relicAuraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;

  function resizeAura() {
    const rect = canvas.getBoundingClientRect();
    w = canvas.width = rect.width || 600;
    h = canvas.height = rect.height || 480;
  }
  resizeAura();
  window.addEventListener('resize', resizeAura);

  const sparks = [];
  for (let i = 0; i < 42; i++) {
    sparks.push({
      x: Math.random() * 600,
      y: Math.random() * 480,
      speedY: Math.random() * 1.3 + 0.5,
      radius: Math.random() * 2 + 0.7,
      isTeal: Math.random() > 0.45,
      alpha: Math.random() * 0.75 + 0.2
    });
  }

  function renderAura() {
    ctx.clearRect(0, 0, w, h);
    sparks.forEach(s => {
      s.y -= s.speedY;
      if (s.y < h * 0.12) {
        s.y = h * 0.88;
        s.x = w * 0.5 + (Math.random() - 0.5) * (w * 0.65);
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.isTeal ? `rgba(45, 212, 191, ${s.alpha})` : `rgba(212, 175, 55, ${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(renderAura);
  }
  renderAura();
}

/* -------------------------------------------------------------------------
   2. AUDIO CONTROLLER (Tide_of_the_Iron_Dragon.mp3)
   ------------------------------------------------------------------------- */
function initAudioAutoplay() {
  bgmAudioEl = document.getElementById('bgmAudio');
  const autoplayNotice = document.getElementById('audioAutoplayNotice');
  if (!bgmAudioEl) return;

  bgmAudioEl.volume = 0.55;
  const playPromise = bgmAudioEl.play();

  if (playPromise !== undefined) {
    playPromise.then(() => {
      audioUnlocked = true;
      isAudioActive = true;
      updateAudioUI(true);
    }).catch(() => {
      if (autoplayNotice) {
        autoplayNotice.classList.remove('hidden');
        autoplayNotice.classList.add('flex');
      }
      const unlockOnGesture = () => {
        if (!audioUnlocked && isAudioActive) {
          bgmAudioEl.play().then(() => {
            audioUnlocked = true;
            updateAudioUI(true);
            hideAudioNotice();
          }).catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockOnGesture);
        window.removeEventListener('keydown', unlockOnGesture);
      };
      window.addEventListener('pointerdown', unlockOnGesture, { once: true });
      window.addEventListener('keydown', unlockOnGesture, { once: true });
    });
  }

  initStoryPlayerSync();
}

function unlockAudioByClick() {
  if (!bgmAudioEl) return;
  isAudioActive = true;
  bgmAudioEl.play().then(() => {
    audioUnlocked = true;
    updateAudioUI(true);
    hideAudioNotice();
    showToast("Tide of the Iron Dragon 사운드트랙이 활성화되었습니다.");
  }).catch(() => {
    hideAudioNotice();
  });
}

function hideAudioNotice() {
  const autoplayNotice = document.getElementById('audioAutoplayNotice');
  if (!autoplayNotice) return;
  autoplayNotice.classList.add('opacity-0');
  setTimeout(() => autoplayNotice.classList.add('hidden'), 400);
}

function toggleAudio() {
  hideAudioNotice();
  if (!bgmAudioEl) return;

  if (!bgmAudioEl.paused) {
    bgmAudioEl.pause();
    isAudioActive = false;
    updateAudioUI(false);
    showToast("배경음악이 일시정지되었습니다.");
  } else {
    isAudioActive = true;
    bgmAudioEl.play().then(() => {
      audioUnlocked = true;
      updateAudioUI(true);
      showToast("배경음악: Tide of the Iron Dragon 재생 중");
    }).catch(() => {
      showToast("화면을 클릭하여 오디오를 활성화하세요.");
    });
  }
}

function updateAudioUI(playing) {
  const speakerIcon = document.getElementById('speakerIcon');
  const soundWaves = document.getElementById('soundWaves');
  const eqBars = document.querySelectorAll('#audioEqualizerBars span');

  if (speakerIcon) {
    speakerIcon.innerHTML = playing
      ? '<path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-2.5-1.23L6.5 6H2v12h4.5l5 4V2z"/>'
      : '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
  }
  if (soundWaves) {
    soundWaves.querySelectorAll('span').forEach(s => {
      if (playing) s.classList.remove('bar-paused');
      else s.classList.add('bar-paused');
    });
  }
  eqBars.forEach((bar, idx) => {
    if (playing) {
      bar.classList.add('bg-teal-ethereal');
      bar.classList.remove('bg-slateCustom');
      bar.style.animation = `pulse ${0.4 + idx * 0.25}s infinite alternate`;
    } else {
      bar.classList.remove('bg-teal-ethereal');
      bar.classList.add('bg-slateCustom');
      bar.style.animation = 'none';
    }
  });
}

function setAudioDucking(isDucking) {
  if (!bgmAudioEl || bgmAudioEl.paused) return;
  bgmAudioEl.volume = isDucking ? 0.12 : 0.55;
}

/* -------------------------------------------------------------------------
   3. DEDICATED AUDIO STORY & OST MODAL SYNC
   ------------------------------------------------------------------------- */
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function initStoryPlayerSync() {
  if (!bgmAudioEl) return;
  bgmAudioEl.addEventListener('timeupdate', () => {
    const cur = bgmAudioEl.currentTime;
    const tot = bgmAudioEl.duration || 0;
    const slider = document.getElementById('storyProgressSlider');
    const curText = document.getElementById('storyCurrentTimeText');
    const durText = document.getElementById('storyDurationText');
    const microTimer = document.getElementById('audioTimer');

    if (slider && tot > 0) slider.value = (cur / tot) * 100;
    if (curText) curText.textContent = formatTime(cur);
    if (durText && tot > 0) durText.textContent = formatTime(tot);
    if (microTimer && tot > 0) microTimer.textContent = `${formatTime(cur)} / ${formatTime(tot)}`;
  });

  bgmAudioEl.addEventListener('play', () => {
    updateStoryModalUI(true);
    updateAudioUI(true);
  });
  bgmAudioEl.addEventListener('pause', () => {
    updateStoryModalUI(false);
    updateAudioUI(false);
  });
}

function updateStoryModalUI(playing) {
  const playIcon = document.getElementById('storyPlayIcon');
  const pauseIcon = document.getElementById('storyPauseIcon');
  const statusLabel = document.getElementById('storyPlaybackStatusLabel');
  const vinylRing = document.getElementById('storyVinylRing');
  const waveBars = document.querySelectorAll('#storyWaveformBars span, #waveContainer span');

  if (playing) {
    if (playIcon) playIcon.classList.add('hidden');
    if (pauseIcon) pauseIcon.classList.remove('hidden');
    if (statusLabel) statusLabel.textContent = '재생 중 (PLAYING)';
    if (vinylRing) vinylRing.classList.add('animate-spin-slow');
    waveBars.forEach((b, i) => {
      b.style.animation = `pulse ${0.35 + (i % 5) * 0.18}s infinite alternate`;
      b.classList.add('bg-teal-ethereal');
    });
  } else {
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    if (statusLabel) statusLabel.textContent = '일시정지 (PAUSED)';
    if (vinylRing) vinylRing.classList.remove('animate-spin-slow');
    waveBars.forEach(b => {
      b.style.animation = 'none';
      b.classList.remove('bg-teal-ethereal');
    });
  }
}

function toggleStoryAudioPlayback() {
  toggleAudio();
}

function seekStoryAudio(val) {
  if (!bgmAudioEl || !bgmAudioEl.duration) return;
  bgmAudioEl.currentTime = (val / 100) * bgmAudioEl.duration;
}

function skipStoryAudio(delta) {
  if (!bgmAudioEl) return;
  bgmAudioEl.currentTime = Math.max(0, Math.min(bgmAudioEl.duration || 0, bgmAudioEl.currentTime + delta));
}

function setStoryAudioVolume(val) {
  if (!bgmAudioEl) return;
  bgmAudioEl.volume = Math.max(0, Math.min(1, parseFloat(val)));
}

/* -------------------------------------------------------------------------
   4. CINEMATIC PORTAL TRANSITION & MULTI-REALM VIEW SWITCHER
   ------------------------------------------------------------------------- */
function triggerPortalTransition(targetRealm = 'realm') {
  const overlay = document.getElementById('cinematicOverlay');
  const warpRing = document.getElementById('warpRing');
  const dawnFlash = document.getElementById('dawnFlash');
  const progressBar = document.getElementById('progressBar');
  const transitionTitle = document.getElementById('transitionTitle');

  if (!overlay) {
    switchRealm(targetRealm);
    return;
  }

  overlay.classList.remove('pointer-events-none', 'opacity-0');
  overlay.classList.add('opacity-100');

  // Ensure BGM plays on portal click
  if (bgmAudioEl && bgmAudioEl.paused) {
    bgmAudioEl.play().catch(() => {});
  }

  setTimeout(() => {
    if (warpRing) warpRing.style.transform = 'scale(36)';
    if (dawnFlash) dawnFlash.classList.add('opacity-100');
    if (progressBar) progressBar.style.width = '100%';
  }, 100);

  setTimeout(() => {
    if (transitionTitle) {
      transitionTitle.innerHTML = '✦ Welcome to Living Realm: IRON DRAGON (거북선 1592)';
    }
  }, 950);

  setTimeout(() => {
    switchRealm(targetRealm);
    resetPortalTransition();
  }, 1550);
}

function resetPortalTransition() {
  const overlay = document.getElementById('cinematicOverlay');
  const warpRing = document.getElementById('warpRing');
  const dawnFlash = document.getElementById('dawnFlash');
  const progressBar = document.getElementById('progressBar');
  const transitionTitle = document.getElementById('transitionTitle');

  if (!overlay) return;
  overlay.classList.add('pointer-events-none', 'opacity-0');
  overlay.classList.remove('opacity-100');
  if (warpRing) warpRing.style.transform = 'scale(0)';
  if (dawnFlash) dawnFlash.classList.remove('opacity-100');
  if (progressBar) progressBar.style.width = '0%';
  if (transitionTitle) {
    transitionTitle.innerHTML = 'Connecting to Living Realm: IRON DRAGON (거북선 1592)...';
  }
}

function switchRealm(realmName) {
  currentRealm = realmName;
  const views = {
    gate: document.getElementById('view-gate'),
    realm: document.getElementById('view-realm'),
    science: document.getElementById('view-science')
  };

  Object.keys(views).forEach(k => {
    if (!views[k]) return;
    if (k === realmName) {
      views[k].classList.remove('hidden');
    } else {
      views[k].classList.add('hidden');
    }
  });

  // Update Top Realm Navigation Pills (Desktop & Mobile)
  ['gate', 'realm', 'science'].forEach(k => {
    const pill = document.getElementById(`navRealmBtn-${k}`);
    if (pill) {
      if (k === realmName) {
        pill.className = "px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold transition-all bg-gradient-to-r from-gold-antique to-teal-ethereal text-obsidian shadow-gold-glow cursor-pointer";
      } else {
        pill.className = "px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-medium text-slateCustom hover:text-offwhite transition-all cursor-pointer";
      }
    }
    const mobPill = document.getElementById(`navRealmMobile-${k}`);
    if (mobPill) {
      if (k === realmName) {
        mobPill.className = "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-gold-antique text-obsidian border border-gold-antique shadow-sm cursor-pointer";
      } else {
        mobPill.className = "px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-charcoal/80 text-slateCustom border border-white/15 cursor-pointer";
      }
    }
  });

  // Trigger resize so Three.js canvases fit their newly visible containers
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    if (realmName === 'science' && typeof topoRenderer !== 'undefined' && topoRenderer) {
      const c = document.getElementById('topo3dContainer');
      if (c && c.clientWidth > 0) {
        topoCamera.aspect = c.clientWidth / c.clientHeight;
        topoCamera.updateProjectionMatrix();
        topoRenderer.setSize(c.clientWidth, c.clientHeight);
      }
    }
  }, 60);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* -------------------------------------------------------------------------
   5. QUADRILINGUAL LANGUAGE ENGINE (KO, HAN, EN, ID)
   ------------------------------------------------------------------------- */
function setLanguage(lang) {
  if (!window.UI_TRANSLATIONS[lang]) return;
  currentLang = lang;

  ['ko', 'han', 'en', 'id'].forEach(l => {
    const btn = document.getElementById(`langBtn-${l}`);
    if (!btn) return;
    if (l === lang) {
      btn.className = "px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-bold transition-all bg-gold-antique text-obsidian shadow-sm cursor-pointer";
    } else {
      btn.className = "px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-semibold text-slateCustom hover:text-offwhite transition-all cursor-pointer";
    }
  });

  const ui = window.UI_TRANSLATIONS[lang];
  const mapText = {
    gateBadgeText: ui.gateBadge,
    gateTitlePrefix: ui.gateTitlePrefix,
    gateTitleHighlight: ui.gateTitleHighlight,
    gateTitleSuffix: ui.gateTitleSuffix,
    gateCtaPrefix: ui.gateCtaPrefix,
    gateCtaHighlight: ui.gateCtaHighlight,
    'navRealmBtn-gate': ui.navGate,
    'navRealmBtn-realm': ui.navRealm,
    'navRealmBtn-science': ui.navScience,
    headerRealmPrefix: ui.realmPrefix,
    headerRealmTitle: ui.realmTitle,
    audioLabel: ui.audio,
    autoSpinLabel: realmAutoRotate ? ui.autoSpinOn : ui.autoSpinOff,
    xrayModeLabel: realmXRayMode ? ui.xrayOn : ui.xrayOff,
    explodeModeLabel: realmExplodeMode ? ui.explodeOn : ui.explodeOff,
    fireActionLabel: ui.fireAction,
    hudRotateHint: ui.rotateHint,
    hudPanHint: ui.panHint,
    hudZoomHint: ui.zoomHint,
    relicSyncStatus: ui.relicReady,
    ttsLabel: ui.ttsBtn,
    relicBtnLabel: ui.relicBtn,
    scienceBtnText: ui.scienceBtn,
    dockTimelineTitle: ui.timelineTitle,
    dockInstruction: ui.timelineInstruction,
    synopsisHeaderLabel: ui.synopsisHeader,
    synopsisScrollHint: ui.scrollHint,
    monographMainHeader: ui.monographHeader,
    monographSubHeader: ui.monographSub,
    verifiedLabel: ui.verified,
    audioSectionTitle: ui.audioTitle,
    arBannerPre: ui.arPre,
    arBannerTitle: ui.arTitle,
    arBannerDesc: ui.arDesc,
    arLaunchBtnText: ui.arBtn,
    topoHudTitle: ui.hudTitle,
    perspectiveLabelSwitch: ui.switchLbl,
    labelModeMitos: ui.modeMyth,
    labelModeGeologi: ui.modeSci
  };

  Object.keys(mapText).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = mapText[id];
  });

  const gateDescEl = document.getElementById('gateDescParagraph');
  if (gateDescEl) gateDescEl.innerHTML = ui.gateDesc;

  updateTimelineDockLabels();
  renderChapterContent(currentChapterIndex);
  renderPerspectiveContent(currentPerspectiveIndex);

  showToast(`Language switched: ${lang.toUpperCase()}`);
}

/* -------------------------------------------------------------------------
   6. VIEW 2: 6-CHAPTER SELECTOR, HYBRID 3D VIEWPORT (METHOD 1 + METHOD 2)
   ------------------------------------------------------------------------- */
let currentRenderMode = 'glb'; // 'glb' (Method 1 <model-viewer> Default) | 'diorama' (Method 2) | 'anatomy' (Three.js X-Ray)
let customGlbBlobUrl = null;
let customGlbFileName = null;

// Interactive 3D Gimbal State for Method 2 AI Sculpted Diorama Turntable
let isDioramaDragging = false;
let isDioramaPanning = false;
let dioramaPrevX = 0, dioramaPrevY = 0;
let dioramaRotY = 0, dioramaRotX = 0;
let dioramaPanX = 0, dioramaPanY = 0;
let dioramaScale = 1.0;

function initDiorama3DTurntable() {
  const stage = document.getElementById('diorama3DStage');
  const gimbal = document.getElementById('dioramaGimbalCard');
  const lightOverlay = document.getElementById('dioramaLightOverlay');
  const viewerWrapper = document.getElementById('viewerWrapper');

  if (stage && gimbal) {
    stage.addEventListener('pointerdown', (e) => {
      isDioramaDragging = true;
      isDioramaPanning = e.shiftKey || e.button === 2;
      dioramaPrevX = e.clientX;
      dioramaPrevY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      isDioramaDragging = false;
      isDioramaPanning = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDioramaDragging) return;
      const dx = e.clientX - dioramaPrevX;
      const dy = e.clientY - dioramaPrevY;
      dioramaPrevX = e.clientX;
      dioramaPrevY = e.clientY;

      if (isDioramaPanning) {
        dioramaPanX = Math.max(-140, Math.min(140, dioramaPanX + dx));
        dioramaPanY = Math.max(-100, Math.min(100, dioramaPanY + dy));
      } else {
        dioramaRotY = Math.max(-38, Math.min(38, dioramaRotY + dx * 0.25));
        dioramaRotX = Math.max(-26, Math.min(26, dioramaRotX - dy * 0.2));
      }

      if (lightOverlay) {
        const lx = Math.max(10, Math.min(90, 50 + dioramaRotY * 1.1));
        const ly = Math.max(10, Math.min(90, 40 - dioramaRotX * 1.2));
        lightOverlay.style.background = `radial-gradient(circle at ${lx}% ${ly}%, rgba(212,175,55,0.34), rgba(45,212,191,0.14) 38%, transparent 68%)`;
      }
    });

    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      dioramaScale = Math.max(0.7, Math.min(1.65, dioramaScale - e.deltaY * 0.0012));
    }, { passive: false });

    function animateDioramaTurntable() {
      requestAnimationFrame(animateDioramaTurntable);
      if (currentRenderMode !== 'diorama') return;
      const t = Date.now() * 0.0018;
      if (realmAutoRotate && !isDioramaDragging) {
        dioramaRotY = Math.sin(t) * 16;
        dioramaRotX = Math.cos(t * 0.75) * 6.5;
        if (lightOverlay) {
          const lx = 50 + dioramaRotY * 1.2;
          const ly = 42 - dioramaRotX * 1.2;
          lightOverlay.style.background = `radial-gradient(circle at ${lx}% ${ly}%, rgba(212,175,55,0.30), rgba(45,212,191,0.12) 40%, transparent 68%)`;
        }
      }
      const floatY = Math.sin(t * 1.25) * 6;
      gimbal.style.transform = `translate3d(${dioramaPanX}px, ${dioramaPanY + floatY}px, 0px) rotateX(${dioramaRotX}deg) rotateY(${dioramaRotY}deg) scale(${dioramaScale})`;
    }
    animateDioramaTurntable();
  }

  // Method 1: Drag & Drop .glb / .gltf directly onto #viewerWrapper (Identical to MetaDwipa)
  if (viewerWrapper) {
    viewerWrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      viewerWrapper.classList.add('ring-2', 'ring-teal-ethereal');
    });
    viewerWrapper.addEventListener('dragleave', () => {
      viewerWrapper.classList.remove('ring-2', 'ring-teal-ethereal');
    });
    viewerWrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      viewerWrapper.classList.remove('ring-2', 'ring-teal-ethereal');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        loadCustomGlbFile(file);
      }
    });
  }
}

function triggerGlbUpload() {
  const input = document.getElementById('glbFileInput');
  if (input) input.click();
}

function handleFileInputChange(event) {
  const file = event.target && event.target.files && event.target.files[0];
  if (file) {
    loadCustomGlbFile(file);
  }
}

function loadCustomGlbFile(file) {
  if (!/\.(glb|gltf)$/i.test(file.name)) {
    showToast("지원 형식: .glb 또는 .gltf 3D 모델 파일을 선택해 주세요.");
    return;
  }
  if (customGlbBlobUrl) {
    URL.revokeObjectURL(customGlbBlobUrl);
  }
  customGlbBlobUrl = URL.createObjectURL(file);
  customGlbFileName = file.name;

  const mv = document.getElementById('relicViewer');
  if (mv) {
    mv.src = customGlbBlobUrl;
  }
  setRenderMode('glb');
  showToast(`로컬 3D 모델 로드 완료: ${file.name}`);
}

function updateDirectGlbButtons(targetSrc) {
  const btnGeo = document.getElementById('directGlbBtn-geobukseon');
  const btnCheon = document.getElementById('directGlbBtn-cheonja');
  const isCheonja = targetSrc && targetSrc.toLowerCase().includes('cheonja');

  const activeTeal = "px-2.5 sm:px-3 py-1 rounded-full bg-teal-ethereal text-obsidian border border-teal-ethereal text-[10px] font-mono font-bold transition-all shadow-teal-glow flex items-center space-x-1 cursor-pointer";
  const inactiveTeal = "px-2.5 sm:px-3 py-1 rounded-full bg-obsidian/85 hover:border-teal-ethereal text-teal-ethereal border border-teal-ethereal/45 text-[10px] font-mono font-semibold transition-all shadow-md flex items-center space-x-1 cursor-pointer";

  if (btnGeo) btnGeo.className = !isCheonja ? activeTeal : inactiveTeal;
  if (btnCheon) btnCheon.className = isCheonja ? activeTeal : inactiveTeal;
}

function switchDirectGlbModel(type) {
  customGlbBlobUrl = null;
  customGlbFileName = null;
  if (type === 'cheonja') {
    selectChapter(2); // NODE 03: 천자·현자총통과 대장군전 (cheonja_chongtong_gun.glb)
    setRenderMode('glb');
    showToast("천자총통 3D 모델 (cheonja_chongtong_gun.glb) 로드 완료");
  } else {
    selectChapter(3); // NODE 04: 거북선 3층 입체 본체 (bbd6136208bf4951abfdfa1c8d4fa103.glb)
    setRenderMode('glb');
    showToast("거북선 3D 모델 (bbd6136208bf4951abfdfa1c8d4fa103.glb) 로드 완료");
  }
}

function setRenderMode(mode) {
  if (mode !== 'glb' && mode !== 'diorama') mode = 'glb';
  currentRenderMode = mode;
  const stageDiorama = document.getElementById('diorama3DStage');
  const stageGlb = document.getElementById('relicViewer');
  const modeLabel = document.getElementById('modelSourceModeLabel');
  const statusEl = document.getElementById('relicSyncStatus');

  const btnGlb = document.getElementById('modeBtnGlb');
  const btnDiorama = document.getElementById('modeBtnDiorama');

  const activePillClass = "px-2.5 py-1 rounded-full bg-gold-antique text-obsidian border border-gold-antique text-[10px] font-mono font-bold transition-all shadow-md flex items-center space-x-1 cursor-pointer";
  const inactivePillClass = "px-2.5 py-1 rounded-full bg-obsidian/85 hover:border-gold-antique text-gold-muted border border-gold-antique/45 text-[10px] font-mono font-semibold transition-all shadow-md flex items-center space-x-1 cursor-pointer";

  if (btnGlb) btnGlb.className = mode === 'glb' ? activePillClass : inactivePillClass;
  if (btnDiorama) btnDiorama.className = mode === 'diorama' ? activePillClass : inactivePillClass;

  if (stageDiorama) stageDiorama.classList.toggle('hidden', mode !== 'diorama');
  if (stageGlb) stageGlb.classList.toggle('hidden', mode !== 'glb');

  const chap = window.CHAPTERS_DB[currentChapterIndex] || window.CHAPTERS_DB[0];

  if (mode === 'diorama') {
    if (modeLabel) modeLabel.textContent = 'Mode: AI 3D 디오라마';
    if (statusEl) statusEl.textContent = 'STATUS: SIAP / 디오라마 활성';
  } else {
    const mv = document.getElementById('relicViewer');
    const targetSrc = customGlbBlobUrl || chap.localModel || 'bbd6136208bf4951abfdfa1c8d4fa103.glb';
    if (mv) {
      if (mv.getAttribute('src') !== targetSrc) {
        mv.setAttribute('src', targetSrc);
      }
      if (chap.dioramaImg) {
        mv.setAttribute('poster', chap.dioramaImg);
      }
      if (chap.cameraOrbit) {
        mv.cameraOrbit = chap.cameraOrbit;
      }
    }
    updateDirectGlbButtons(targetSrc);
    const modelName = customGlbFileName || (targetSrc.includes('cheonja') ? '천자총통 3D (.GLB)' : '거북선 3D (.GLB)');
    if (modeLabel) modeLabel.textContent = `Mode: ${modelName}`;
    if (statusEl) statusEl.textContent = 'STATUS: SIAP / .GLB 3D 활성';
  }
}

function cycleRenderMode() {
  const next = currentRenderMode === 'glb' ? 'diorama' : 'glb';
  setRenderMode(next);
  const names = {
    glb: '실물 3D .GLB 모델 뷰어 모드 (거북선 / 천자총통)',
    diorama: 'AI 3D 조각 디오라마 턴테이블 모드'
  };
  showToast(names[next]);
}

function updateTimelineDockLabels() {
  window.CHAPTERS_DB.forEach((chap, idx) => {
    const data = chap[currentLang] || chap.ko;
    const tEl = document.getElementById(`nodeTitle-${idx}`);
    const sEl = document.getElementById(`nodeSubtitle-${idx}`);
    const thumbEl = document.getElementById(`nodeThumb-${idx}`);
    if (tEl) tEl.textContent = data.title;
    if (sEl) sEl.textContent = data.subtitle;
    if (thumbEl) thumbEl.src = chap.dioramaImg || generateRelicPosterDataURL(idx, true);
  });
}

function renderChapterContent(index) {
  const chap = window.CHAPTERS_DB[index];
  const data = chap[currentLang] || chap.ko;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('activeModelNode', `${chap.node} // ${chap.tag}`);
  setTxt('activeModelTitle', data.title);
  setTxt('activeModelSubtitle', data.subtitle);
  setTxt('chapterNumberLabel', data.chapterNum);
  setTxt('characterTitle', data.title);
  setTxt('characterSubtitle', `"${data.subtitle}"`);
  setTxt('poeticQuote', data.quote);
  setTxt('loreParagraph', data.lore);

  // Taxonomy Badges
  const taxEl = document.getElementById('taxonomyContainer');
  if (taxEl && data.taxonomy) {
    taxEl.innerHTML = data.taxonomy.map(item => `
      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gold-antique/10 text-gold-muted border border-gold-antique/30 uppercase tracking-wider">
        ${item}
      </span>
    `).join('');
  }

  // Technical Specs Grid inside Right Panel
  const specsEl = document.getElementById('specsGridContainer');
  if (specsEl && data.specs) {
    specsEl.innerHTML = data.specs.map(s => `
      <div class="p-2 rounded-lg bg-obsidian/60 border border-white/10 flex items-center justify-between text-[11px]">
        <span class="text-slateCustom font-mono">${s.label}</span>
        <span class="text-gold-muted font-semibold text-right">${s.val}</span>
      </div>
    `).join('');
  }

  // Update Relic Poster Download Modal
  const posterUrl = generateRelicPosterDataURL(index, false);
  setTxt('modalRelicName', `${data.title}`);
  setTxt('modalRelicId', `RELIC LEDGER: ${chap.node} (${chap.tag})`);
  setTxt('modalRelicDesc', data.lore);
  const modalImg = document.getElementById('modalRelicImage');
  if (modalImg) modalImg.src = posterUrl;
  const dlLink = document.getElementById('modalDownloadLink');
  if (dlLink) {
    dlLink.href = posterUrl;
    dlLink.download = `IRON_DRAGON_${chap.node.replace(/\s+/g, '_')}.png`;
  }
}

function selectChapter(index) {
  if (index < 0 || index >= window.CHAPTERS_DB.length) return;
  currentChapterIndex = index;
  const chap = window.CHAPTERS_DB[index];

  const visibleCount = getVisibleCardsCount();
  if (index < carouselOffset) {
    carouselOffset = index;
    updateCarouselPosition();
  } else if (index >= carouselOffset + visibleCount) {
    carouselOffset = index - visibleCount + 1;
    updateCarouselPosition();
  }

  // Update Layer A: Method 2 AI 3D Sculpted Diorama Image
  const dioramaImg = document.getElementById('activeDioramaImg');
  if (dioramaImg && chap.dioramaImg) {
    dioramaImg.style.opacity = '0.25';
    setTimeout(() => {
      dioramaImg.src = chap.dioramaImg;
      dioramaImg.style.opacity = '1';
    }, 110);
  }
  dioramaPanX = 0;
  dioramaPanY = 0;
  dioramaScale = 1.0;

  // Update Layer B: Method 1 Google <model-viewer> (bbd6136208bf4951abfdfa1c8d4fa103.glb & cheonja_chongtong_gun.glb)
  const mv = document.getElementById('relicViewer');
  const targetGlb = customGlbBlobUrl || chap.localModel || 'bbd6136208bf4951abfdfa1c8d4fa103.glb';
  if (mv) {
    if (mv.getAttribute('src') !== targetGlb) {
      mv.setAttribute('src', targetGlb);
    }
    if (chap.dioramaImg) {
      mv.setAttribute('poster', chap.dioramaImg);
    }
    if (chap.cameraOrbit) {
      mv.cameraOrbit = chap.cameraOrbit;
    }
  }
  updateDirectGlbButtons(targetGlb);

  renderChapterContent(index);

  // Switch between real GLB (for Nodes 0~3) and sculpted Diorama (for Nodes 4~5)
  setRenderMode(customGlbBlobUrl ? 'glb' : (chap.defaultMode || 'glb'));

  // Highlight active timeline node card
  const nodes = document.querySelectorAll('.timeline-node');
  nodes.forEach((node, i) => {
    const badge = node.querySelector('.node-badge');
    if (i === index) {
      node.className = "timeline-node group relative flex-[0_0_92.5%] sm:flex-[0_0_calc(46.25%-6px)] lg:flex-[0_0_calc(23.125%-9px)] text-left p-2 sm:p-2.5 rounded-xl border transition-all duration-300 bg-gold-antique/25 border-gold-antique shadow-gold-glow flex items-center space-x-2.5 cursor-pointer ml-1";
      if (badge) badge.className = "node-badge text-[9px] font-mono text-teal-ethereal font-bold block";
    } else {
      node.className = "timeline-node group relative flex-[0_0_92.5%] sm:flex-[0_0_calc(46.25%-6px)] lg:flex-[0_0_calc(23.125%-9px)] text-left p-2 sm:p-2.5 rounded-xl border transition-all duration-300 bg-charcoal/75 border-white/10 hover:border-gold-antique/50 hover:bg-charcoal flex items-center space-x-2.5 cursor-pointer";
      if (badge) badge.className = "node-badge text-[9px] font-mono text-slateCustom group-hover:text-teal-ethereal font-bold block";
    }
  });

  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetTtsUi();
    setAudioDucking(false);
  }
}

function getVisibleCardsCount() {
  if (window.innerWidth >= 1024) return 4;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

function updateCarouselPosition() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const card = track.querySelector('.timeline-node');
  if (!card) return;
  const gap = window.innerWidth >= 640 ? 12 : 10;
  const movePx = carouselOffset * (card.offsetWidth + gap);
  track.style.transform = `translateX(-${movePx}px)`;
}

function prevCardsCarousel() {
  if (carouselOffset > 0) {
    carouselOffset--;
    updateCarouselPosition();
  }
}

function nextCardsCarousel() {
  const maxOffset = Math.max(0, window.CHAPTERS_DB.length - getVisibleCardsCount());
  if (carouselOffset < maxOffset) {
    carouselOffset++;
    updateCarouselPosition();
  }
}

function toggleInspect360() {
  realmAutoRotate = !realmAutoRotate;
  const mv = document.getElementById('relicViewer');
  if (mv) {
    if (realmAutoRotate) mv.setAttribute('auto-rotate', '');
    else mv.removeAttribute('auto-rotate');
  }
  const ui = window.UI_TRANSLATIONS[currentLang];
  const lbl = document.getElementById('autoSpinLabel');
  if (lbl) lbl.textContent = realmAutoRotate ? ui.autoSpinOn : ui.autoSpinOff;
  showToast(realmAutoRotate ? ui.autoSpinOn : ui.autoSpinOff);
}

function toggleXRayMode() {
  realmXRayMode = !realmXRayMode;
  applyRealmXRayState();
  const ui = window.UI_TRANSLATIONS[currentLang];
  const lbl = document.getElementById('xrayModeLabel');
  if (lbl) lbl.textContent = realmXRayMode ? ui.xrayOn : ui.xrayOff;
  showToast(realmXRayMode ? ui.xrayOn : ui.xrayOff);
}

function toggleExplodeMode() {
  realmExplodeMode = !realmExplodeMode;
  if (currentChapterIndex !== 3 && realmExplodeMode) {
    selectChapter(3);
  }
  const ui = window.UI_TRANSLATIONS[currentLang];
  const lbl = document.getElementById('explodeModeLabel');
  if (lbl) lbl.textContent = realmExplodeMode ? ui.explodeOn : ui.explodeOff;
  showToast(realmExplodeMode ? "3층 구조 분해(Exploded View) 활성화" : "구조 결합 완료");
}

function triggerActionFire() {
  triggerRealmFireEffect();
  showToast("천자총통 함포 사격 및 용두 유황 화염 방사!");
}

/* -------------------------------------------------------------------------
   7. AI TTS NARRATOR (WEB SPEECH API WITH BGM DUCKING)
   ------------------------------------------------------------------------- */
function toggleTtsNarration() {
  if (!('speechSynthesis' in window)) {
    showToast("이 브라우저는 AI 음성 합성을 지원하지 않습니다.");
    return;
  }

  const ui = window.UI_TRANSLATIONS[currentLang];
  const ttsLabel = document.getElementById('ttsLabel');
  const ttsBtn = document.getElementById('ttsNarratorBtn');

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetTtsUi();
    setAudioDucking(false);
    showToast("AI 내레이션이 중지되었습니다.");
    return;
  }

  const chap = window.CHAPTERS_DB[currentChapterIndex];
  const data = chap[currentLang] || chap.ko;
  const text = `${data.title}. ${data.subtitle}. ${data.quote.replace(/"/g, '')} ${data.lore}`;

  const utter = new SpeechSynthesisUtterance(text);
  const langMap = { ko: 'ko-KR', han: 'ko-KR', en: 'en-US', id: 'id-ID' };
  utter.lang = langMap[currentLang] || 'ko-KR';
  utter.rate = 0.96;

  setAudioDucking(true);

  utter.onstart = () => {
    if (ttsLabel) ttsLabel.textContent = ui.ttsSpeaking;
    if (ttsBtn) ttsBtn.classList.add('border-teal-ethereal', 'bg-teal-ethereal/20');
  };

  const onEnd = () => {
    resetTtsUi();
    setAudioDucking(false);
  };
  utter.onend = onEnd;
  utter.onerror = onEnd;

  window.speechSynthesis.speak(utter);
}

function resetTtsUi() {
  const ui = window.UI_TRANSLATIONS[currentLang];
  const ttsLabel = document.getElementById('ttsLabel');
  const ttsBtn = document.getElementById('ttsNarratorBtn');
  if (ttsLabel) ttsLabel.textContent = ui.ttsBtn;
  if (ttsBtn) ttsBtn.classList.remove('border-teal-ethereal', 'bg-teal-ethereal/20');
}

/* -------------------------------------------------------------------------
   8. 4 IMMERSIVE MODALS (VIDEO BATTLE SIM, AUDIO STORY, WEBAR, VR 360)
   ------------------------------------------------------------------------- */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.classList.remove('opacity-100');
}

function launchImmersiveAction(type) {
  if (type === 'video') {
    openModal('videoModal');
    startBattleCinematicCanvas();
  } else if (type === 'audio') {
    openModal('audioStoryModal');
    if (bgmAudioEl && bgmAudioEl.paused) {
      bgmAudioEl.play().catch(() => {});
    }
    updateStoryModalUI(bgmAudioEl && !bgmAudioEl.paused);
  } else if (type === 'ar') {
    populateArGalleryCards();
    openModal('arModal');
  } else if (type === 'vr') {
    openModal('vrModal');
    setTimeout(() => initVRThree(), 80);
  }
}

function closeVideoModal() {
  closeModal('videoModal');
  stopBattleCinematicCanvas();
}

function closeVrModal() {
  closeModal('vrModal');
}

function closeAudioStoryModal() {
  closeModal('audioStoryModal');
}

/* --- CINEMATIC VIDEO MODAL: REAL-TIME HANSANDO BATTLE TACTICAL FILM --- */
let battleFilmAnimId = null;
let battleFilmTime = 0;

function startBattleCinematicCanvas() {
  const canvas = document.getElementById('battleCinematicCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  battleFilmTime = 0;

  const captions = [
    "1592년 7월 8일 — 견내량 협수로에 집결한 와키자카 야스하루의 왜군 함대 73척",
    "STAGE 01: 조선 척후 판옥선대의 위장 후퇴 — 한산도 앞 넓은 바다로 적을 유인하다",
    "STAGE 02: '학익진(鶴翼陣)을 펼쳐라!' — 56척의 조선 함대가 반원형 포위망으로 선회",
    "STAGE 03: 돌격선 거북선 선봉 돌진! 용두에서 유황 연막을 뿜으며 적 기함 대열 돌파!",
    "STAGE 04: 천자·지자·현자총통 대장군전 일제 사격 — 왜선 59척 격파, 한산도 대첩 완성!"
  ];

  function renderFilm() {
    battleFilmAnimId = requestAnimationFrame(renderFilm);
    battleFilmTime += 0.008;
    const w = canvas.width = canvas.clientWidth || 960;
    const h = canvas.height = canvas.clientHeight || 540;

    // Deep Sea Tactical Radar Backdrop
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.65);
    grad.addColorStop(0, '#0f2930');
    grad.addColorStop(1, '#060a0f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Tactical Grid & Range Rings
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.12)';
    ctx.lineWidth = 1;
    for (let r = 80; r < w * 0.6; r += 80) {
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.52, r, 0, Math.PI * 2); ctx.stroke();
    }

    // Hansando & Mireukdo Islands
    ctx.fillStyle = 'rgba(22, 38, 44, 0.9)';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w * 0.18, h * 0.25, 110, 55, -0.3, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('한산도 (HANSANDO)', w * 0.12, h * 0.25);

    ctx.fillStyle = 'rgba(22, 38, 44, 0.9)';
    ctx.beginPath();
    ctx.ellipse(w * 0.82, h * 0.22, 95, 48, 0.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#D4AF37';
    ctx.fillText('견내량 (GYEONNAERYANG)', w * 0.74, h * 0.22);

    // Crane Wing Semicircular Arc (15 Panokseon ships)
    const phase = (Math.sin(battleFilmTime * 0.7) + 1) * 0.5;
    for (let i = 0; i < 15; i++) {
      const a = Math.PI * 1.12 + (i / 14) * Math.PI * 0.76;
      const rad = Math.min(w, h) * 0.36;
      const sx = w * 0.5 + Math.cos(a) * rad;
      const sy = h * 0.58 + Math.sin(a) * rad * 0.75;

      ctx.fillStyle = '#2DD4BF';
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Cannon volley lines toward center
      if ( (Math.floor(battleFilmTime * 10) + i) % 5 === 0 ) {
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(w * 0.5 + (Math.random() - 0.5) * 90, h * 0.52 + (Math.random() - 0.5) * 60);
        ctx.stroke();
      }
    }

    // 3 Geobukseon Vanguard Ships charging into enemy center
    [-45, 0, 45].forEach((offsetX, idx) => {
      const gx = w * 0.5 + offsetX;
      const gy = h * 0.34 + phase * 110 + (idx === 1 ? 18 : 0);
      ctx.fillStyle = '#D4AF37';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#D4AF37';
      ctx.fillRect(gx - 8, gy - 14, 16, 28);
      ctx.shadowBlur = 0;
    });

    // Enemy Fleet Cluster in Center
    for (let e = 0; e < 12; e++) {
      const ex = w * 0.5 + Math.cos(e * 1.7 + battleFilmTime) * 65;
      const ey = h * 0.54 + Math.sin(e * 2.3 + battleFilmTime) * 42;
      ctx.fillStyle = '#E06A3B';
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtitle Banner
    const capIdx = Math.floor((battleFilmTime * 0.6) % captions.length);
    ctx.fillStyle = 'rgba(13, 17, 23, 0.88)';
    ctx.fillRect(w * 0.1, h - 68, w * 0.8, 46);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.strokeRect(w * 0.1, h - 68, w * 0.8, 46);
    ctx.fillStyle = '#F0F6FC';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(captions[capIdx], w * 0.5, h - 40);
  }
  renderFilm();
}

function stopBattleCinematicCanvas() {
  if (battleFilmAnimId) {
    cancelAnimationFrame(battleFilmAnimId);
    battleFilmAnimId = null;
  }
}

/* --- WEBAR MODAL & QR CARDS --- */
function populateArGalleryCards() {
  const track = document.getElementById('arCarouselTrack');
  if (!track) return;

  track.innerHTML = window.CHAPTERS_DB.map((chap, idx) => {
    const data = chap[currentLang] || chap.ko;
    const poster = generateRelicPosterDataURL(idx, false);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.href + '#node-' + idx)}&color=0D1117&bgcolor=FFFFFF`;
    return `
      <div class="ar-card-item flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] rounded-2xl glass-panel p-5 border-2 border-gold-antique shadow-gold-glow flex flex-col justify-between group">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono font-bold text-teal-ethereal">${chap.node}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-gold-antique/20 text-gold-muted border border-gold-antique/30">${chap.tag}</span>
        </div>
        <h4 class="font-display text-lg font-bold text-offwhite truncate mb-2">${data.title}</h4>
        <div class="relative w-full h-56 rounded-xl overflow-hidden bg-charcoal border border-teal-ethereal/40 mb-3 flex items-center justify-center">
          <img src="${poster}" alt="${data.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
          <div class="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white shadow-lg">
            <img src="${qrUrl}" alt="QR Code" class="w-14 h-14 object-contain">
          </div>
        </div>
        <p class="text-xs text-slateCustom line-clamp-2 mb-3">${data.subtitle}</p>
        <button onclick="selectChapter(${idx}); closeModal('arModal');" class="w-full py-2.5 rounded-xl bg-teal-ethereal text-obsidian text-xs font-mono font-bold shadow-teal-glow hover:opacity-90 transition-opacity cursor-pointer">
          3D 공간 캔버스에서 즉시 열기
        </button>
      </div>
    `;
  }).join('');
}

function prevArCarousel() {
  if (arCarouselOffset > 0) {
    arCarouselOffset--;
    updateArCarouselPosition();
  }
}

function nextArCarousel() {
  const visible = window.innerWidth >= 1024 ? 3 : (window.innerWidth >= 640 ? 2 : 1);
  const max = Math.max(0, window.CHAPTERS_DB.length - visible);
  if (arCarouselOffset < max) {
    arCarouselOffset++;
    updateArCarouselPosition();
  }
}

function updateArCarouselPosition() {
  const track = document.getElementById('arCarouselTrack');
  if (!track) return;
  const card = track.querySelector('.ar-card-item');
  if (!card) return;
  const movePx = arCarouselOffset * (card.offsetWidth + 24);
  track.style.transform = `translateX(-${movePx}px)`;
}

function openActiveSingleRelicAR() {
  closeModal('relicModal');
  const chap = window.CHAPTERS_DB[currentChapterIndex];
  const data = chap[currentLang] || chap.ko;
  const bEl = document.getElementById('singleArNodeBadge');
  const tEl = document.getElementById('singleArTitle');
  const sEl = document.getElementById('singleArSubtitle');
  const qEl = document.getElementById('singleArQrImage');

  if (bEl) bEl.textContent = `${chap.node} // AUGMENTED REALITY`;
  if (tEl) tEl.textContent = data.title;
  if (sEl) sEl.textContent = data.subtitle;
  if (qEl) {
    qEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(window.location.href + '#ar-node-' + currentChapterIndex)}&color=0D1117&bgcolor=FFFFFF`;
  }
  openModal('singleArModal');
}

/* -------------------------------------------------------------------------
   9. VIEW 3: PRISMATIC MONOGRAPH (4 PERSPECTIVES, TOPO PINS, THEME & RESIZER)
   ------------------------------------------------------------------------- */
function switchPerspective(index) {
  if (index < 0 || index >= window.PERSPECTIVES_DATA.length) return;
  currentPerspectiveIndex = index;
  renderPerspectiveContent(index);
}

function renderPerspectiveContent(index) {
  const p = window.PERSPECTIVES_DATA[index];
  const d = p[currentLang] || p.ko;

  // Update 4 Tab Buttons
  window.PERSPECTIVES_DATA.forEach((item, i) => {
    const btn = document.getElementById(`tabBtn-${i}`);
    const lbl = document.getElementById(`tabLabel-${i}`);
    const itemData = item[currentLang] || item.ko;
    if (lbl) lbl.textContent = itemData.tabLabel;
    if (!btn) return;
    if (i === index) {
      btn.className = "perspective-tab active-tab flex items-center justify-center space-x-2 py-3 px-3 rounded-xl border text-xs sm:text-[13px] font-mono font-semibold transition-all duration-300 cursor-pointer bg-gold-antique/15 text-gold-antique border-gold-antique shadow-gold-glow";
    } else {
      btn.className = "perspective-tab flex items-center justify-center space-x-2 py-3 px-3 rounded-xl border text-xs sm:text-[13px] font-mono font-semibold transition-all duration-300 cursor-pointer bg-transparent text-slateMuted border-borderCustom hover:text-pualam hover:bg-white/5";
    }
  });

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('perspectiveBadgeText', p.badge);
  setTxt('perspectiveMeta', p.meta);
  setTxt('manuscriptQuote', d.quote);
  setTxt('manuscriptSource', d.source);
  setTxt('perspectiveTitle', d.title);
  setTxt('narrativeBody', d.body);

  if (d.points) {
    d.points.forEach((pt, idx) => {
      const n = idx + 1;
      setTxt(`pointTag-${n}`, pt.tag);
      setTxt(`pointTitle-${n}`, pt.title);
      setTxt(`pointDesc-${n}`, pt.desc);
    });
  }

  setTopoColorTheme(p.color);
}

function inspectHotspot(key) {
  const hs = window.TOPO_HOTSPOTS[key];
  if (!hs) return;
  const d = hs[currentLang] || hs.ko;
  const box = document.getElementById('hotspotDetails');
  const tEl = document.getElementById('hsTitle');
  const dEl = document.getElementById('hsDesc');
  if (tEl) tEl.textContent = d.title;
  if (dEl) dEl.textContent = d.desc;
  if (box) box.classList.remove('hidden');
}

function closeHotspot() {
  const box = document.getElementById('hotspotDetails');
  if (box) box.classList.add('hidden');
}

function toggleVisualMode() {
  topoScienceMode = !topoScienceMode;
  const thumb = document.getElementById('modeToggleThumb');
  const layerLbl = document.getElementById('topoLayerLabel');
  if (topoScienceMode) {
    if (thumb) thumb.className = "w-5 h-5 rounded-full bg-volcanic-ember transition-transform duration-300 transform translate-x-6";
    if (layerLbl) layerLbl.textContent = "Mode: 해협 수심 등고선 & 학익진 탄도 벡터";
    setTopoColorTheme('#E06A3B');
  } else {
    if (thumb) thumb.className = "w-5 h-5 rounded-full bg-gold-antique transition-transform duration-300 transform translate-x-0";
    if (layerLbl) layerLbl.textContent = "Mode: 철갑신룡(鐵甲神龍) 신화 오라 필드";
    setTopoColorTheme('#D4AF37');
  }
}

function cycleTextSize() {
  textSizeIndex = (textSizeIndex + 1) % 3;
  document.body.classList.remove('text-size-sm', 'text-size-normal', 'text-size-lg');
  const classes = ['text-size-sm', 'text-size-normal', 'text-size-lg'];
  const names = ['작게 (A-)', '보통 (A)', '크게 (A+)'];
  document.body.classList.add(classes[textSizeIndex]);
  showToast(`텍스트 크기: ${names[textSizeIndex]}`);
}

function toggleThemeMode() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  if (isDark) {
    html.classList.remove('dark');
    showToast("라이트 모드(Light Monograph Theme) 전환");
  } else {
    html.classList.add('dark');
    showToast("다크 모드(Obsidian Cyber Theme) 전환");
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

function showToast(text) {
  const toast = document.getElementById('toastNotification');
  const msg = document.getElementById('toastMessage');
  if (!toast || !msg) return;

  msg.textContent = text;
  toast.classList.remove('translate-x-32', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-x-0', 'opacity-100');

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.add('translate-x-32', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-x-0', 'opacity-100');
  }, 3000);
}

/* -------------------------------------------------------------------------
   10. INITIALIZATION & KEYBOARD SHORTCUTS
   ------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof preloadDioramaImages === 'function') preloadDioramaImages();
  initParticleCanvas();
  initRelicAuraAndMist();
  initDiorama3DTurntable();
  initGateThreeJS();
  init3DTopography();
  initAudioAutoplay();

  setLanguage('ko');
  selectChapter(0);
  switchPerspective(0);

  // Check URL hash for direct view entry (e.g. #realm or #science)
  if (window.location.hash === '#realm') {
    switchRealm('realm');
  } else if (window.location.hash === '#science') {
    switchRealm('science');
  }

  window.addEventListener('keydown', (e) => {
    if (currentRealm === 'realm') {
      if (e.key === 'ArrowRight') selectChapter((currentChapterIndex + 1) % window.CHAPTERS_DB.length);
      if (e.key === 'ArrowLeft') selectChapter((currentChapterIndex - 1 + window.CHAPTERS_DB.length) % window.CHAPTERS_DB.length);
    }
    if (e.key === 'Escape') {
      ['relicModal', 'singleArModal', 'arModal', 'videoModal', 'vrModal', 'audioStoryModal', 'qrModal'].forEach(closeModal);
      stopBattleCinematicCanvas();
    }
  });
});
