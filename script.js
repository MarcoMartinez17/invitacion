/* ============================================
   INVITACIÓN XV AÑOS — JAVASCRIPT
   Countdown, Music, RSVP, Animations
   ============================================ */

(function () {
  'use strict';

  /* ---------- CONFIGURATION ---------- */
  const CONFIG = {
    // Fecha del evento: 01 de Agosto de 2026 a las 12:00 PM (mediodía), zona horaria CST (UTC-6)
    eventDate: new Date('2026-08-01T12:00:00-06:00'),

    // Duración de la imagen hero visible (en milisegundos)
    heroImageDuration: 7000,

    // URL del Google Apps Script para confirmaciones
    // INSTRUCCIÓN: Pega aquí la URL de tu Apps Script publicado
    // Ver INSTRUCCIONES_GOOGLE_SHEETS.md para obtenerla
    rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbw9Yb8K_xF5RuGnROI4QNQtZnvVFS4rdnAVvcHGZaKi02Lw-l4WLdtV0I6U59CK3iDY/exec',

    // Porcentaje del slider para confirmar (0-1)
    confirmThreshold: 0.75,

    // Cantidad de mariposas flotantes
    floatingButterflyCount: 6,

    // Cantidad de confetti al confirmar
    confettiCount: 60,

    // WhatsApp Guestbook config
    waPhoneNumber: '5219141186609', // REPLACE WITH MAYLI'S PHONE
    waPrefilledMessage: '¡Hola Mayli! Te escribo para desearte en tus XV años...',
  };

  /* ---------- DOM REFERENCES ---------- */
  const DOM = {
    cover: document.getElementById('cover'),
    btnOpen: document.getElementById('btn-open'),
    invitation: document.getElementById('invitation'),
    audioPlayer: document.getElementById('audio-player'),
    btnPlay: document.getElementById('btn-play'),
    playIcon: document.getElementById('play-icon'),
    pauseIcon: document.getElementById('pause-icon'),
    heroFrame: document.getElementById('hero-frame'),
    heroTimerBar: document.getElementById('hero-timer-bar'),
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    guestName: document.getElementById('guest-name'),
    guestPasses: document.getElementById('guest-passes'),
    rsvpSlider: document.getElementById('rsvp-slider'),
    rsvpHandle: document.getElementById('rsvp-handle'),
    rsvpText: document.getElementById('rsvp-text'),
    rsvpSliderContainer: document.getElementById('rsvp-slider-container'),
    rsvpSuccess: document.getElementById('rsvp-success'),
    confettiContainer: document.getElementById('confetti-container'),
    envelopeRain: document.getElementById('envelope-rain'),
    btnWaPrefilled: document.getElementById('btn-wa-prefilled'),
    btnWaCustom: document.getElementById('btn-wa-custom'),
  };

  /* ---------- STATE ---------- */
  let isPlaying = false;
  let isDragging = false;
  let dragStartX = 0;
  let handleStartLeft = 0;
  let countdownInterval = null;
  let heroTimerTimeout = null;
  let guestId = '';
  let guestPasses = 2;

  /* =============================================
     1. COVER / OPEN INVITATION
     ============================================= */
  function initCover() {
    DOM.btnOpen.addEventListener('click', openInvitation);
  }

  function openInvitation() {
    DOM.cover.classList.add('closing');
    DOM.invitation.classList.remove('hidden');

    // Start music after a short delay
    setTimeout(function () {
      tryPlayMusic();
    }, 600);

    // Remove cover from DOM after animation
    setTimeout(function () {
      DOM.cover.style.display = 'none';
    }, 1200);

    // Start hero image timer
    startHeroTimer();

    // Init scroll reveals after a beat
    setTimeout(initScrollReveal, 300);
  }

  /* =============================================
     2. HERO IMAGE FADE
     ============================================= */
  function startHeroTimer() {
    if (!DOM.heroFrame) return;

    heroTimerTimeout = setTimeout(function () {
      DOM.heroFrame.classList.add('fading');

      // Generate butterfly particles as image fades
      generateHeroButterflies();
    }, CONFIG.heroImageDuration);
  }

  function generateHeroButterflies() {
    var frameRect = DOM.heroFrame.getBoundingClientRect();
    var centerX = frameRect.left + frameRect.width / 2;
    var centerY = frameRect.top + frameRect.height / 2;

    for (var i = 0; i < 12; i++) {
      (function (index) {
        setTimeout(function () {
          createFlyingButterfly(centerX, centerY);
        }, index * 150);
      })(i);
    }
  }

  function createFlyingButterfly(startX, startY) {
    var el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';
    el.style.zIndex = '100';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 2s cubic-bezier(0.32, 0.72, 0, 1)';
    el.style.opacity = '0.7';

    var size = 15 + Math.random() * 20;
    var colors = ['#D4B8E0', '#9B72AA', '#C8A951', '#E8D48B'];
    var color = colors[Math.floor(Math.random() * colors.length)];

    el.innerHTML = '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" fill="' + color + '">' +
      '<path d="M50 42C38 25 8 8 5 35C2 60 32 52 50 50" opacity=".8"/>' +
      '<path d="M50 58C32 58 8 65 10 82C12 95 42 78 50 58" opacity=".6"/>' +
      '<path d="M50 42C62 25 92 8 95 35C98 60 68 52 50 50" opacity=".8"/>' +
      '<path d="M50 58C68 58 92 65 90 82C88 95 58 78 50 58" opacity=".6"/>' +
      '<ellipse cx="50" cy="50" rx="3" ry="14" opacity=".9"/>' +
      '</svg>';

    document.body.appendChild(el);

    // Fly away to random direction
    requestAnimationFrame(function () {
      var angle = Math.random() * Math.PI * 2;
      var distance = 200 + Math.random() * 300;
      var endX = startX + Math.cos(angle) * distance;
      var endY = startY + Math.sin(angle) * distance - 150;

      el.style.left = endX + 'px';
      el.style.top = endY + 'px';
      el.style.opacity = '0';
      el.style.transform = 'rotate(' + (Math.random() * 360 - 180) + 'deg) scale(0.3)';
    });

    // Clean up
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2500);
  }

  /* =============================================
     3. MUSIC PLAYER
     ============================================= */
  function initMusicPlayer() {
    DOM.btnPlay.addEventListener('click', toggleMusic);
  }

  function tryPlayMusic() {
    if (!DOM.audioPlayer) return;
    var playPromise = DOM.audioPlayer.play();
    if (playPromise !== undefined) {
      playPromise.then(function () {
        isPlaying = true;
        updatePlayButton();
      }).catch(function () {
        // Autoplay blocked — user will click play manually
        isPlaying = false;
        updatePlayButton();
      });
    }
  }

  function toggleMusic() {
    if (!DOM.audioPlayer) return;
    if (isPlaying) {
      DOM.audioPlayer.pause();
      isPlaying = false;
    } else {
      DOM.audioPlayer.play().then(function () {
        isPlaying = true;
        updatePlayButton();
      }).catch(function () {
        // Playback failed
      });
    }
    updatePlayButton();
  }

  function updatePlayButton() {
    if (isPlaying) {
      DOM.playIcon.style.display = 'none';
      DOM.pauseIcon.style.display = 'block';
      DOM.btnPlay.classList.add('playing');
    } else {
      DOM.playIcon.style.display = 'block';
      DOM.pauseIcon.style.display = 'none';
      DOM.btnPlay.classList.remove('playing');
    }
  }

  /* =============================================
     4. COUNTDOWN TIMER
     ============================================= */
  function initCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  function updateCountdown() {
    var now = new Date();
    var diff = CONFIG.eventDate.getTime() - now.getTime();

    if (diff <= 0) {
      DOM.days.textContent = '00';
      DOM.hours.textContent = '00';
      DOM.minutes.textContent = '00';
      DOM.seconds.textContent = '00';
      clearInterval(countdownInterval);
      return;
    }

    var d = Math.floor(diff / (1000 * 60 * 60 * 24));
    var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var s = Math.floor((diff % (1000 * 60)) / 1000);

    var newDays = padZero(d);
    var newHours = padZero(h);
    var newMinutes = padZero(m);
    var newSeconds = padZero(s);

    // Add tick animation on change
    animateIfChanged(DOM.seconds, newSeconds);
    animateIfChanged(DOM.minutes, newMinutes);
    animateIfChanged(DOM.hours, newHours);
    animateIfChanged(DOM.days, newDays);
  }

  function animateIfChanged(element, newValue) {
    if (element.textContent !== newValue) {
      element.textContent = newValue;
      element.classList.add('tick');
      setTimeout(function () {
        element.classList.remove('tick');
      }, 300);
    }
  }

  function padZero(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /* =============================================
     5. URL PARAMETERS (Guest personalization)
     ============================================= */
  function initURLParams() {
    var params = new URLSearchParams(window.location.search);

    var id = params.get('id');
    var pases = params.get('pases');

    if (id) {
      guestId = id;
      // Convert hyphenated ID to readable name
      var name = id.replace(/-/g, ' ').replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
      DOM.guestName.textContent = name;
    }

    if (pases) {
      guestPasses = parseInt(pases, 10) || 2;
      DOM.guestPasses.textContent = guestPasses;
    }
  }

  /* =============================================
     6. RSVP INTERACTIVE SLIDER
     ============================================= */
  function initRSVP() {
    var handle = DOM.rsvpHandle;
    var slider = DOM.rsvpSlider;

    if (!handle || !slider) return;

    // Check if guest already confirmed (localStorage)
    if (checkAlreadyConfirmed()) return;

    // Touch events
    handle.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    // Mouse events
    handle.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    // Keyboard fallback (Enter key to confirm)
    handle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        confirmAttendance();
      }
    });
  }

  /**
   * Checks if this guest already confirmed attendance.
   * Uses localStorage keyed by guest ID.
   * Returns true if already confirmed, false otherwise.
   */
  function checkAlreadyConfirmed() {
    if (!guestId) return false;

    var storageKey = 'rsvp_confirmed_' + guestId;
    var confirmed = localStorage.getItem(storageKey);

    if (confirmed) {
      // Show the confirmed state immediately (no animation)
      showConfirmedState();
      return true;
    }

    return false;
  }

  /**
   * Shows the "already confirmed" UI without animation.
   */
  function showConfirmedState() {
    DOM.rsvpSlider.classList.add('confirmed');
    DOM.rsvpSliderContainer.classList.add('hidden');
    DOM.rsvpSuccess.classList.remove('hidden');
  }

  function onDragStart(e) {
    e.preventDefault();
    isDragging = true;

    var clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    dragStartX = clientX;
    handleStartLeft = DOM.rsvpHandle.offsetLeft;

    DOM.rsvpHandle.style.transition = 'none';
    DOM.rsvpHandle.style.cursor = 'grabbing';
  }

  function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    var clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    var diff = clientX - dragStartX;
    var maxLeft = DOM.rsvpSlider.offsetWidth - DOM.rsvpHandle.offsetWidth - 8;
    var newLeft = Math.max(4, Math.min(handleStartLeft + diff, maxLeft));

    DOM.rsvpHandle.style.left = newLeft + 'px';

    // Calculate progress (0 to 1)
    var progress = (newLeft - 4) / (maxLeft - 4);
    progress = Math.max(0, Math.min(1, progress));

    // Update slider visual fill
    DOM.rsvpSlider.style.setProperty('--slider-progress', progress);

    // Fade out instruction text
    DOM.rsvpText.style.opacity = Math.max(0, 1 - progress * 1.8);

    // Update ARIA
    DOM.rsvpHandle.setAttribute('aria-valuenow', Math.round(progress * 100));
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    DOM.rsvpHandle.style.cursor = 'grab';

    var maxLeft = DOM.rsvpSlider.offsetWidth - DOM.rsvpHandle.offsetWidth - 8;
    var currentLeft = DOM.rsvpHandle.offsetLeft;
    var progress = (currentLeft - 4) / (maxLeft - 4);

    if (progress >= CONFIG.confirmThreshold) {
      // Snap to end — CONFIRMED
      DOM.rsvpHandle.style.transition = 'left 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
      DOM.rsvpHandle.style.left = maxLeft + 'px';
      DOM.rsvpSlider.style.setProperty('--slider-progress', '1');
      DOM.rsvpText.style.opacity = '0';

      setTimeout(confirmAttendance, 400);
    } else {
      // Snap back to start
      DOM.rsvpHandle.style.transition = 'left 0.5s cubic-bezier(0.32, 0.72, 0, 1)';
      DOM.rsvpHandle.style.left = '4px';
      DOM.rsvpSlider.style.setProperty('--slider-progress', '0');
      DOM.rsvpText.style.opacity = '1';
      DOM.rsvpHandle.setAttribute('aria-valuenow', '0');
    }
  }

  function confirmAttendance() {
    // Prevent double confirmation
    if (DOM.rsvpSlider.classList.contains('confirmed')) return;

    // Visual success state
    DOM.rsvpSlider.classList.add('confirmed');

    // Show success message
    setTimeout(function () {
      DOM.rsvpSliderContainer.classList.add('hidden');
      DOM.rsvpSuccess.classList.remove('hidden');

      // Trigger confetti celebration
      triggerConfetti();
    }, 600);

    // Save confirmation to localStorage so it persists across visits
    saveConfirmation();

    // Send data silently via fetch
    sendRSVP();
  }

  /**
   * Saves the confirmation state to localStorage.
   */
  function saveConfirmation() {
    if (!guestId) return;
    var storageKey = 'rsvp_confirmed_' + guestId;
    localStorage.setItem(storageKey, JSON.stringify({
      confirmed: true,
      date: new Date().toISOString(),
      nombre: DOM.guestName.textContent,
      pases: guestPasses
    }));
  }

  function sendRSVP() {
    var data = {
      id: guestId || 'invitado-general',
      nombre: DOM.guestName.textContent,
      pases: guestPasses,
      respuesta: 'Confirmado',
      fecha_confirmacion: new Date().toISOString(),
    };

    // Google Apps Script redirige con 302 que fetch() no puede seguir con CORS.
    // Solución: usar 'no-cors' mode que envía los datos correctamente.
    // La respuesta será opaca (no legible), pero los datos SÍ llegan al Sheet.
    fetch(CONFIG.rsvpEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data),
    })
      .then(function () {
        console.log('RSVP enviado a Google Sheets');
      })
      .catch(function (error) {
        console.warn('Error de red al enviar RSVP:', error);
        // La confirmación visual se muestra de todas formas.
        // Los datos se pueden reenviar después si es necesario.
      });
  }

  /* =============================================
     7. CONFETTI CELEBRATION
     ============================================= */
  function triggerConfetti() {
    DOM.confettiContainer.classList.remove('hidden');

    var colors = ['#D4B8E0', '#9B72AA', '#C8A951', '#E8D48B', '#7B5091', '#F5ECD7'];
    var shapes = ['circle', 'square', 'butterfly-conf'];

    for (var i = 0; i < CONFIG.confettiCount; i++) {
      var piece = document.createElement('div');
      var shape = shapes[Math.floor(Math.random() * shapes.length)];
      piece.className = 'confetti-piece ' + shape;

      var color = colors[Math.floor(Math.random() * colors.length)];
      var size = 6 + Math.random() * 10;
      var leftPos = Math.random() * 100;
      var duration = 2 + Math.random() * 3;
      var delay = Math.random() * 1.5;
      var rotation = 360 + Math.random() * 720;
      var travel = 60 + Math.random() * 40; // vh

      piece.style.left = leftPos + '%';
      piece.style.width = size + 'px';
      piece.style.height = size + 'px';
      piece.style.setProperty('--conf-duration', duration + 's');
      piece.style.setProperty('--conf-delay', delay + 's');
      piece.style.setProperty('--conf-rot', rotation + 'deg');
      piece.style.setProperty('--conf-travel', travel + 'vh');

      if (shape === 'butterfly-conf') {
        piece.innerHTML = '<svg viewBox="0 0 100 100" fill="' + color + '" width="' + size + '" height="' + size + '">' +
          '<path d="M50 42C38 25 8 8 5 35C2 60 32 52 50 50" opacity=".8"/>' +
          '<path d="M50 58C32 58 8 65 10 82C12 95 42 78 50 58" opacity=".6"/>' +
          '<path d="M50 42C62 25 92 8 95 35C98 60 68 52 50 50" opacity=".8"/>' +
          '<path d="M50 58C68 58 92 65 90 82C88 95 58 78 50 58" opacity=".6"/>' +
          '</svg>';
      } else {
        piece.style.backgroundColor = color;
      }

      DOM.confettiContainer.appendChild(piece);
    }

    // Clean up confetti after animation
    setTimeout(function () {
      DOM.confettiContainer.innerHTML = '';
      DOM.confettiContainer.classList.add('hidden');
    }, 6000);
  }

  /* =============================================
     8. SCROLL REVEAL
     ============================================= */
  function initScrollReveal() {
    var revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -60px 0px',
          threshold: 0.15,
        }
      );

      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: reveal all immediately
      revealElements.forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  }

  /* =============================================
     9. FLOATING BUTTERFLIES (lightweight ambient decoration)
     Gentle sway only — no complex flight paths, no SVG wing-flap.
     Appended to &lt;main&gt; as position:absolute for zero compositing cost.
     ============================================= */
  function initFloatingButterflies() {
    var container = DOM.invitation || document.body;
    var colors = ['#D4B8E0', '#B896C9', '#9B72AA', '#dcd3ff', '#e6e6fa'];

    // More butterflies is fine now — each one is just a tiny static SVG
    // with a simple 3-stop CSS animation (no animateTransform)
    var count = 8;

    for (var i = 0; i < count; i++) {
      var bf = document.createElement('div');
      bf.className = 'floating-butterfly';

      var color = colors[Math.floor(Math.random() * colors.length)];
      var size = 12 + Math.random() * 10;       // 12-22px (small)
      var startLeft = 5 + Math.random() * 90;    // 5%-95% horizontal
      var startTop = 3 + Math.random() * 94;     // spread across full page
      var duration = 12 + Math.random() * 10;    // 12-22s (slow)
      var delay = Math.random() * 10;
      var opacity = 0.10 + Math.random() * 0.15; // 0.10-0.25 (very subtle)

      bf.style.left = startLeft + '%';
      bf.style.top = startTop + '%';
      bf.style.setProperty('--bf-size', size + 'px');
      bf.style.setProperty('--bf-duration', duration + 's');
      bf.style.setProperty('--bf-delay', delay + 's');
      bf.style.setProperty('--bf-opacity', String(opacity));

      // Gentle sway parameters — tiny random drift
      bf.style.setProperty('--bf-sway-x', (Math.random() * 12 - 6) + 'px');
      bf.style.setProperty('--bf-sway-y', (Math.random() * 10 - 8) + 'px');
      bf.style.setProperty('--bf-sway-rot', (Math.random() * 6 - 3) + 'deg');

      // Static butterfly SVG — no animateTransform, no wing flap
      bf.innerHTML = '<svg viewBox="0 0 100 100" fill="' + color + '">' +
        '<path d="M50 42C38 25 8 8 5 35C2 60 32 52 50 50" opacity=".7"/>' +
        '<path d="M50 58C32 58 8 65 10 82C12 95 42 78 50 58" opacity=".5"/>' +
        '<path d="M50 42C62 25 92 8 95 35C98 60 68 52 50 50" opacity=".7"/>' +
        '<path d="M50 58C68 58 92 65 90 82C88 95 58 78 50 58" opacity=".5"/>' +
        '<ellipse cx="50" cy="50" rx="3" ry="14" opacity=".8"/>' +
        '</svg>';

      container.appendChild(bf);
    }
  }

  /* =============================================
     10. ENVELOPE RAIN (gifts section)
     ============================================= */
  function initEnvelopeRain() {
    if (!DOM.envelopeRain) return;

    var envelopeSVG = '<svg viewBox="0 0 32 32" width="24" height="24" fill="none">' +
      '<rect x="3" y="9" width="26" height="17" rx="2" stroke="#C8A951" stroke-width="1.5" fill="#FFF8E7"/>' +
      '<path d="M3 11l13 9 13-9" stroke="#C8A951" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    for (var i = 0; i < 8; i++) {
      var envelope = document.createElement('div');
      envelope.className = 'envelope-particle';
      envelope.innerHTML = envelopeSVG;

      var leftPos = 5 + Math.random() * 90;
      var duration = 2.5 + Math.random() * 2;
      var delay = Math.random() * 3;
      var rotStart = -20 + Math.random() * 40;
      var rotEnd = -25 + Math.random() * 50;

      envelope.style.left = leftPos + '%';
      envelope.style.setProperty('--fall-duration', duration + 's');
      envelope.style.setProperty('--fall-delay', delay + 's');
      envelope.style.setProperty('--env-rot-start', rotStart + 'deg');
      envelope.style.setProperty('--env-rot-end', rotEnd + 'deg');

      DOM.envelopeRain.appendChild(envelope);
    }
  }

  /* =============================================
     GUESTBOOK / BUZON DE DESEOS
     ============================================= */
  function initGuestbook() {
    if (DOM.btnWaPrefilled) {
      DOM.btnWaPrefilled.addEventListener('click', function () {
        var url = 'https://api.whatsapp.com/send?phone=' + CONFIG.waPhoneNumber + '&text=' + encodeURIComponent(CONFIG.waPrefilledMessage);
        window.open(url, '_blank');
      });
    }

    if (DOM.btnWaCustom) {
      DOM.btnWaCustom.addEventListener('click', function () {
        var url = 'https://api.whatsapp.com/send?phone=' + CONFIG.waPhoneNumber;
        window.open(url, '_blank');
      });
    }
  }

  /* =============================================
     11. IMAGE PROTECTION (block right-click / long-press)
     ============================================= */
  function initImageProtection() {
    // --- 1. Block all .img-shield elements (dresscode, swimsuit, guestbook) ---
    var shields = document.querySelectorAll('.img-shield, .hero-img-shield');
    shields.forEach(function (shield) {
      // Block right-click / long-press menu
      shield.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
      // Non-passive touchstart to allow preventDefault — kills long-press callout
      shield.addEventListener('touchstart', function (e) {
        e.stopPropagation();
      }, { passive: false });
      shield.addEventListener('touchend', function (e) {
        e.stopPropagation();
      }, { passive: false });
    });

    // --- 2. Block context menu on ALL img elements ---
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
      img.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
      });
    });

    // --- 3. Global document-level fallback ---
    document.addEventListener('contextmenu', function (e) {
      var t = e.target;
      if (
        t.tagName === 'IMG' ||
        t.classList.contains('img-shield') ||
        t.classList.contains('hero-img-shield') ||
        t.classList.contains('hero-bg-img') ||
        t.closest('.img-shield-wrap') ||
        t.closest('#hero-frame')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }

  /* =============================================
     INITIALIZATION
     ============================================= */
  function init() {
    initCover();
    initMusicPlayer();
    initCountdown();
    initURLParams();
    initRSVP();
    initEnvelopeRain();
    initGuestbook();
    initImageProtection();

    // Floating butterflies start after invitation opens
    DOM.btnOpen.addEventListener('click', function () {
      setTimeout(initFloatingButterflies, 1500);
    }, { once: true });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
