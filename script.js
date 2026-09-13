(function() {
  // ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ==========
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // ========== ТАЙМЕР ==========
  const timerDisplay = document.getElementById('timerDisplay');
  const timerStart = document.getElementById('timerStart');
  const timerPause = document.getElementById('timerPause');
  const timerReset = document.getElementById('timerReset');
  const timerMinButtons = document.querySelectorAll('[data-timer-min]');

  let timerSeconds = 300;
  let timerInterval = null;
  let timerRunning = false;

  function formatTimer(sec) {
    if (sec < 0) sec = 0;
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    timerDisplay.textContent = formatTimer(timerSeconds);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerRunning = false;
  }

  function startTimer() {
    if (timerRunning) return;
    if (timerSeconds <= 0) return;
    timerRunning = true;
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
      }
      if (timerSeconds <= 0) {
        stopTimer();
        timerRunning = false;
        timerDisplay.textContent = "00:00";
        timerDisplay.style.color = '#ffb86b';
        setTimeout(() => timerDisplay.style.color = '', 800);
      }
    }, 1000);
  }

  function resetTimer() {
    stopTimer();
    timerSeconds = 300;
    updateTimerDisplay();
    timerRunning = false;
    timerDisplay.style.color = '';
  }

  timerStart.addEventListener('click', startTimer);
  timerPause.addEventListener('click', () => {
    if (timerRunning) {
      stopTimer();
      timerRunning = false;
    }
  });
  timerReset.addEventListener('click', resetTimer);

  timerMinButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.dataset.timerMin, 10);
      if (!isNaN(mins) && mins > 0) {
        stopTimer();
        timerSeconds = mins * 60;
        updateTimerDisplay();
        timerRunning = false;
        timerDisplay.style.color = '';
      }
    });
  });

  updateTimerDisplay();

  // ========== СЕКУНДОМЕР ==========
  const stopwatchDisplay = document.getElementById('stopwatchDisplay');
  const stopwatchStart = document.getElementById('stopwatchStart');
  const stopwatchPause = document.getElementById('stopwatchPause');
  const stopwatchReset = document.getElementById('stopwatchReset');

  let stopwatchMs = 0;
  let stopwatchInterval = null;
  let stopwatchRunning = false;
  let stopwatchStartTime = 0;
  let stopwatchElapsed = 0;

  function formatStopwatch(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  }

  function updateStopwatchDisplay() {
    stopwatchDisplay.textContent = formatStopwatch(stopwatchMs);
  }

  function stopStopwatch() {
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval);
      stopwatchInterval = null;
    }
    stopwatchRunning = false;
  }

  function startStopwatch() {
    if (stopwatchRunning) return;
    stopwatchRunning = true;
    stopwatchStartTime = Date.now() - stopwatchElapsed;
    stopwatchInterval = setInterval(() => {
      stopwatchMs = Date.now() - stopwatchStartTime;
      stopwatchElapsed = stopwatchMs;
      updateStopwatchDisplay();
    }, 20);
  }

  function pauseStopwatch() {
    if (stopwatchRunning) {
      stopStopwatch();
      stopwatchElapsed = stopwatchMs;
    }
  }

  function resetStopwatch() {
    stopStopwatch();
    stopwatchMs = 0;
    stopwatchElapsed = 0;
    stopwatchRunning = false;
    updateStopwatchDisplay();
  }

  stopwatchStart.addEventListener('click', startStopwatch);
  stopwatchPause.addEventListener('click', pauseStopwatch);
  stopwatchReset.addEventListener('click', resetStopwatch);

  resetStopwatch();

  // ========== ПРОВЕРКА НА ВЕЗЕНИЕ (КОЛЕСО) ==========
  const wheel = document.getElementById('wheel');
  const wheelLabels = document.getElementById('wheelLabels');
  const spinBtn = document.getElementById('spinWheelBtn');
  const spinsToVerdictSpan = document.getElementById('spinsToVerdict');
  const progressDots = document.querySelectorAll('#progressDots .progress-dot');
  const resultBox = document.getElementById('resultBox');
  const resultValue = document.getElementById('resultValue');
  const luckVerdict = document.getElementById('luckVerdict');
  const verdictPercent = document.getElementById('verdictPercent');
  const verdictLabel = document.getElementById('verdictLabel');
  const historyMsg = document.getElementById('historyMsg');

  const WHEEL_PERCENTS = [0, 10, 25, 50, 75, 90, 95, 100];

  let isSpinning = false;
  let currentRotation = 0;
  const spinHistory = [];
  let currentStreak = [];

  function formatResult(value) {
    if (value === 50) return '50';
    return `${value}%`;
  }

  function createWheelLabels() {
    wheelLabels.innerHTML = '';
    const sectorAngle = 360 / WHEEL_PERCENTS.length;

    WHEEL_PERCENTS.forEach((percent, index) => {
      const label = document.createElement('div');
      label.className = 'wheel-label';
      label.textContent = formatResult(percent);

      const angle = index * sectorAngle + sectorAngle / 2;
      const radiusPercent = 35;

      label.style.transform = `rotate(${angle}deg) translate(${radiusPercent * 1.7}px) rotate(-${angle}deg)`;

      wheelLabels.appendChild(label);
    });
  }

  createWheelLabels();

  function updateProgressUI() {
    const spinsInCurrentCycle = currentStreak.length;
    const remaining = 3 - spinsInCurrentCycle;
    spinsToVerdictSpan.textContent = remaining > 0 ? remaining : 0;

    progressDots.forEach((dot, i) => {
      if (i < spinsInCurrentCycle) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  function getVerdictLabel(percent) {
    if (percent >= 85) return '🔥 Невероятное везение!';
    if (percent >= 70) return '✨ Отличная удача!';
    if (percent >= 50) return '👍 Хороший результат';
    if (percent >= 30) return '😐 Средне, но жить можно';
    if (percent >= 15) return '😬 Не твой день...';
    return '💀 Полный провал';
  }

  function updateAfterSpin(luckPercent) {
    spinHistory.push(luckPercent);
    currentStreak.push(luckPercent);

    updateProgressUI();

    if (currentStreak.length >= 3) {
      const sum = currentStreak.reduce((acc, val) => acc + val, 0);
      const average = Math.round(sum / currentStreak.length);

      resultValue.textContent = formatResult(average);
      resultBox.classList.add('active', 'flash');
      setTimeout(() => resultBox.classList.remove('flash'), 1000);

      setTimeout(() => {
        verdictPercent.textContent = `${average}%`;
        verdictLabel.textContent = getVerdictLabel(average);
        luckVerdict.classList.add('show');

        setTimeout(() => {
          luckVerdict.classList.remove('show');
        }, 6000);
      }, 300);

      currentStreak = [];
      setTimeout(() => {
        updateProgressUI();
      }, 300);
    }

    const lastFive = spinHistory.slice(-5);
    let historyText = '📋 Последние: ' + lastFive.map(p => formatResult(p)).join(' · ');
    if (spinHistory.length > 5) {
      historyText += ` (всего ${spinHistory.length})`;
    }
    historyMsg.textContent = historyText;
  }

  function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.style.opacity = '0.7';

    luckVerdict.classList.remove('show');

    const sectorAngle = 360 / WHEEL_PERCENTS.length;
    const randomSectorIndex = Math.floor(Math.random() * WHEEL_PERCENTS.length);

    const sectorCenterAngle = randomSectorIndex * sectorAngle + sectorAngle / 2;
    const fullTurns = 3 + Math.floor(Math.random() * 4);
    const targetRotation = fullTurns * 360 + (360 - sectorCenterAngle);

    currentRotation += targetRotation;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    const luckPercent = WHEEL_PERCENTS[randomSectorIndex];

    setTimeout(() => {
      isSpinning = false;
      spinBtn.disabled = false;
      spinBtn.style.opacity = '1';
      updateAfterSpin(luckPercent);
    }, 4000);
  }

  spinBtn.addEventListener('click', spinWheel);

  updateProgressUI();

  window.addEventListener('resize', () => {
    clearTimeout(window._wheelResizeTimeout);
    window._wheelResizeTimeout = setTimeout(createWheelLabels, 150);
  });
})();