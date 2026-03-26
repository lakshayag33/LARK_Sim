/* ═══════════════════════════════════════════
   LARK Emergency Detection – Logic
   ═══════════════════════════════════════════ */
(() => {
  'use strict';

  // ─── DOM refs ───
  const $ = id => document.getElementById(id);

  const hrSlider     = $('hrSlider');
  const motionSlider = $('motionSlider');
  const noiseSlider  = $('noiseSlider');
  const hrValue      = $('hrValue');
  const motionValue  = $('motionValue');
  const noiseValue   = $('noiseValue');
  const hrFill       = $('hrFill');
  const motionFill   = $('motionFill');
  const noiseFill    = $('noiseFill');

  const dashboard     = $('dashboard');
  const systemStatus  = $('systemStatus');
  const alertOverlay  = $('alertOverlay');
  const alertTitle    = $('alertTitle');
  const alertSubtitle = $('alertSubtitle');
  const countdownContainer = $('countdownContainer');
  const countdownNumber    = $('countdownNumber');
  const countdownProgress  = $('countdownProgress');
  const cancelBtn    = $('cancelBtn');
  const postCountdown = $('postCountdown');
  const actionList   = $('actionList');
  const nearbyDevices = $('nearbyDevices');
  const videoFeed    = $('videoFeed');
  const resetBtn     = $('resetBtn');

  const threatPrompt = $('threatPrompt');
  const safeBtn      = $('safeBtn');
  const notSafeBtn   = $('notSafeBtn');
  const threatTimerEl = $('threatTimer');

  // ─── State ───
  let activeScenario  = null; // 'cardiac' | 'accident' | 'threat' | null
  let countdownTimer  = null;
  let countdownSec    = 15;
  let audioCtx        = null;
  let alarmInterval   = null;
  let evalTimeout     = null;

  // ─── Audio (Web Audio API) ───
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function beep(freq = 880, duration = 0.15, type = 'square') {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) { /* ignore audio errors */ }
  }

  function startAlarm(freq = 880, interval = 500) {
    beep(freq, 0.15);
    alarmInterval = setInterval(() => beep(freq, 0.15), interval);
  }

  function stopAlarm() {
    if (alarmInterval) { clearInterval(alarmInterval); alarmInterval = null; }
  }

  // ─── Slider updates ───
  function updateDisplays() {
    const hr = +hrSlider.value;
    const motion = +motionSlider.value;
    const noise = +noiseSlider.value;

    hrValue.textContent = hr;
    motionValue.textContent = motion;
    noiseValue.textContent = noise;

    hrFill.style.width = `${(hr / 140) * 100}%`;
    motionFill.style.width = `${motion}%`;
    noiseFill.style.width = `${(noise / 120) * 100}%`;
  }

  hrSlider.addEventListener('input', () => { updateDisplays(); scheduleEval(); });
  motionSlider.addEventListener('input', () => { updateDisplays(); scheduleEval(); });
  noiseSlider.addEventListener('input', () => { updateDisplays(); scheduleEval(); });

  function scheduleEval() {
    clearTimeout(evalTimeout);
    evalTimeout = setTimeout(evaluateScenarios, 300);
  }

  // ─── Scenario evaluation ───
  function evaluateScenarios() {
    if (activeScenario) return; // one at a time

    const hr     = +hrSlider.value;
    const motion = +motionSlider.value;
    const noise  = +noiseSlider.value;

    // A. Cardiac Arrest: HR=0, motion high (fall)
    if (hr === 0 && motion >= 70) {
      triggerCardiac();
      return;
    }

    // B. Accident: motion high, HR abnormal, noise > 85
    if (motion >= 70 && (hr < 50 || hr > 120) && noise > 85) {
      triggerAccident();
      return;
    }

    // C. Physical Threat: HR > 120
    if (hr > 120) {
      triggerThreat();
      return;
    }
  }

  // ═══ SCENARIO A – Cardiac Arrest ═══
  function triggerCardiac() {
    activeScenario = 'cardiac';
    setStatusAlert();
    showAlertOverlay('cardiac', '🚨 CARDIAC ARREST', 'Heart rate flatlined · Fall detected');
    startAlarm(660, 400);
    startCountdown(() => {
      // Post-countdown actions
      stopAlarm();
      hideCountdown();
      showPostCardiac();
    });
  }

  function showPostCardiac() {
    actionList.innerHTML = '<div class="action-list-label">Actions Initiated</div>';
    addAction('📞', 'Calling emergency guardian…');
    addAction('🏥', 'Notifying nearest medical services…');
    addAction('📍', 'Sending GPS coordinates…');
    addAction('🔔', 'Broadcasting to nearby devices…');

    // Nearby devices
    nearbyDevices.innerHTML = `
      <h3>Nearby LARK Devices Alerted</h3>
      <div class="device-grid">
        <div class="device-item"><div class="device-icon">⌚</div><div class="device-label">Watch #A2</div></div>
        <div class="device-item"><div class="device-icon">📱</div><div class="device-label">Phone #B7</div></div>
        <div class="device-item"><div class="device-icon">⌚</div><div class="device-label">Watch #C1</div></div>
        <div class="device-item"><div class="device-icon">📱</div><div class="device-label">Phone #D4</div></div>
      </div>
      <div class="cpr-message">⚡ CARDIAC ARREST – PERFORM CPR IMMEDIATELY ⚡</div>
    `;
    nearbyDevices.classList.remove('hidden');
    videoFeed.classList.add('hidden');
    postCountdown.classList.remove('hidden');
    startAlarm(440, 600);
  }

  // ═══ SCENARIO B – Accident ═══
  function triggerAccident() {
    activeScenario = 'accident';
    setStatusAlert();
    showAlertOverlay('accident', '⚠️ ACCIDENT DETECTED', 'High impact · Abnormal vitals · Loud noise');
    startAlarm(770, 500);
    startCountdown(() => {
      stopAlarm();
      hideCountdown();
      showPostAccident();
    });
  }

  function showPostAccident() {
    actionList.innerHTML = '<div class="action-list-label">Actions Initiated</div>';
    addAction('🚔', 'Sending GPS to police…');
    addAction('🚑', 'Dispatching ambulance…');
    addAction('📞', 'Calling emergency guardian…');
    addAction('📹', 'Activating live camera feed…');

    nearbyDevices.classList.add('hidden');
    videoFeed.classList.remove('hidden');
    postCountdown.classList.remove('hidden');
    // Try to play the video
    const vid = $('simVideo');
    if (vid) vid.play().catch(() => {});
    startAlarm(550, 700);
  }

  // ═══ SCENARIO C – Physical Threat ═══
  const threatRingProgress = $('threatRingProgress');
  const threatUrgencyFill  = $('threatUrgencyFill');
  const threatUrgencyLabel = $('threatUrgencyLabel');
  const threatHRValue      = $('threatHRValue');
  const threatBox          = $('threatBox');
  const THREAT_CIRCUM      = 326.73;

  function triggerThreat() {
    activeScenario = 'threat';
    setStatusAlert();
    dashboard.classList.add('blurred');

    // Set live HR value
    threatHRValue.textContent = hrSlider.value;

    // Reset ring & bar
    threatRingProgress.style.strokeDashoffset = '0';
    threatRingProgress.classList.remove('urgent');
    threatUrgencyFill.style.width = '0%';
    threatUrgencyLabel.textContent = 'Awaiting your response…';
    threatUrgencyLabel.classList.remove('urgent');
    threatTimerEl.textContent = '15';
    threatTimerEl.classList.remove('urgent');
    threatBox.classList.remove('shake');

    // Show prompt
    threatPrompt.classList.remove('hidden');
    beep(600, 0.2);

    // Start countdown with ring
    let sec = 15;
    countdownTimer = setInterval(() => {
      sec--;
      threatTimerEl.textContent = sec;

      // Drive the ring
      threatRingProgress.style.strokeDashoffset =
        `${THREAT_CIRCUM * (1 - sec / 15)}`;

      // Drive the urgency bar
      threatUrgencyFill.style.width = `${((15 - sec) / 15) * 100}%`;

      // Update HR readout live
      threatHRValue.textContent = hrSlider.value;

      // Urgency escalation
      if (sec <= 5) {
        beep(800, 0.1);
        threatRingProgress.classList.add('urgent');
        threatTimerEl.classList.add('urgent');
        threatUrgencyLabel.textContent = '⚠ Escalating soon — respond now!';
        threatUrgencyLabel.classList.add('urgent');
        // Shake every tick in last 5s
        threatBox.classList.remove('shake');
        void threatBox.offsetWidth; // reflow to retrigger animation
        threatBox.classList.add('shake');
      } else if (sec <= 10) {
        beep(600, 0.08);
        threatUrgencyLabel.textContent = 'Time is running out…';
      }

      if (sec <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        threatPrompt.classList.add('hidden');
        escalateThreat();
      }
    }, 1000);
  }

  // Button handlers
  safeBtn.addEventListener('click', () => {
    clearInterval(countdownTimer);
    countdownTimer = null;
    threatPrompt.classList.add('hidden');
    resetSystem();
  });

  notSafeBtn.addEventListener('click', () => {
    clearInterval(countdownTimer);
    countdownTimer = null;
    threatPrompt.classList.add('hidden');
    escalateThreat();
  });

  // Keyboard shortcuts (S = safe, H = help)
  document.addEventListener('keydown', (e) => {
    if (activeScenario !== 'threat' || threatPrompt.classList.contains('hidden')) return;
    if (e.key === 's' || e.key === 'S') {
      safeBtn.click();
    } else if (e.key === 'h' || e.key === 'H') {
      notSafeBtn.click();
    }
  });

  function escalateThreat() {
    showAlertOverlay('threat', '🛡️ THREAT RESPONSE', 'No response received · Escalating emergency');
    startAlarm(550, 500);
    startCountdown(() => {
      stopAlarm();
      hideCountdown();
      showPostThreat();
    });
  }

  function showPostThreat() {
    actionList.innerHTML = '<div class="action-list-label">Actions Initiated</div>';
    addAction('🚔', 'Alerting local police…');
    addAction('📞', 'Calling emergency guardian…');
    addAction('📍', 'Sending live GPS location…');
    addAction('📹', 'Activating live camera feed…');

    nearbyDevices.classList.add('hidden');
    videoFeed.classList.remove('hidden');
    postCountdown.classList.remove('hidden');
    const vid = $('simVideo');
    if (vid) vid.play().catch(() => {});
    startAlarm(440, 700);
  }

  // ─── Shared helpers ───
  function showAlertOverlay(type, title, subtitle) {
    dashboard.classList.add('blurred');
    alertOverlay.className = `alert-overlay ${type} flash`;
    alertTitle.textContent = title;
    alertSubtitle.textContent = subtitle;
    cancelBtn.style.display = '';
    countdownContainer.style.display = '';
    postCountdown.classList.add('hidden');
    alertOverlay.classList.remove('hidden');
  }

  function startCountdown(onComplete) {
    countdownSec = 15;
    countdownNumber.textContent = countdownSec;
    countdownProgress.style.strokeDashoffset = '0';

    const circumference = 326.73;
    countdownTimer = setInterval(() => {
      countdownSec--;
      countdownNumber.textContent = countdownSec;
      countdownProgress.style.strokeDashoffset =
        `${circumference * (1 - countdownSec / 15)}`;

      if (countdownSec <= 5) beep(880, 0.08);

      if (countdownSec <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        onComplete();
      }
    }, 1000);
  }

  function hideCountdown() {
    countdownContainer.style.display = 'none';
  }

  function addAction(icon, text) {
    const div = document.createElement('div');
    div.className = 'action-item';
    div.innerHTML = `<span class="action-icon">${icon}</span><span>${text}</span>`;
    actionList.appendChild(div);
  }

  function setStatusAlert() {
    systemStatus.classList.add('alert-active');
    systemStatus.innerHTML = '<span class="dot"></span> ALERT ACTIVE';
  }

  // ─── Cancel & Reset ───
  cancelBtn.addEventListener('click', () => {
    clearInterval(countdownTimer);
    countdownTimer = null;
    stopAlarm();
    resetSystem();
  });

  resetBtn.addEventListener('click', () => {
    stopAlarm();
    resetSystem();
  });

  function resetSystem() {
    activeScenario = null;
    clearInterval(countdownTimer);
    countdownTimer = null;
    stopAlarm();

    // Hide overlays
    alertOverlay.classList.add('hidden');
    alertOverlay.classList.remove('flash');
    threatPrompt.classList.add('hidden');

    // Reset overlay internals
    postCountdown.classList.add('hidden');
    nearbyDevices.classList.add('hidden');
    videoFeed.classList.add('hidden');
    actionList.innerHTML = '';
    cancelBtn.style.display = '';
    countdownContainer.style.display = '';

    // Un-blur dashboard
    dashboard.classList.remove('blurred');

    // Reset sliders to defaults
    setSliders(72, 20, 40);

    // Reset status badge
    systemStatus.classList.remove('alert-active');
    systemStatus.innerHTML = '<span class="dot"></span> Monitoring';

    // Pause video
    const vid = $('simVideo');
    if (vid) { vid.pause(); vid.currentTime = 0; }
  }

  // ─── Quick Scenario Buttons ───
  function setSliders(hr, motion, noise) {
    hrSlider.value = hr;
    motionSlider.value = motion;
    noiseSlider.value = noise;
    updateDisplays();
  }

  $('scenCardiac').addEventListener('click', () => {
    if (activeScenario) return;
    setSliders(0, 85, 40);
    triggerCardiac();
  });

  $('scenAccident').addEventListener('click', () => {
    if (activeScenario) return;
    setSliders(130, 90, 100);
    triggerAccident();
  });

  $('scenThreat').addEventListener('click', () => {
    if (activeScenario) return;
    setSliders(130, 20, 40);
    triggerThreat();
  });

  // ─── Init ───
  updateDisplays();
})();
