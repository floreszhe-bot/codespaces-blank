
/* ========================================
   GAME SETTINGS
======================================== */

const GAME_TIME = 30;

const NORMAL_POINTS = 10;
const GOLDEN_POINTS = 25;

const GOLDEN_DROP_CHANCE = 0.15;


/* ========================================
   GET HTML ELEMENTS
======================================== */

const scoreElement = document.getElementById("score");

const highScoreElement = document.getElementById("highScore");

const timerElement = document.getElementById("timer");

const gameboard = document.getElementById("gameboard");

const startBtn = document.getElementById("startBtn");

const restartBtn = document.getElementById("restartBtn");

const soundBtn = document.getElementById("soundBtn");

const messageElement = document.getElementById("message");

const endScreen = document.getElementById("end-screen");

const finalScoreElement = document.getElementById("final-score");

const highScoreMessage = document.getElementById("high-score-message");

const startPrompt = document.getElementById("start-prompt");


/* ========================================
   GAME VARIABLES
======================================== */

let score = 0;

let timeLeft = GAME_TIME;

let gameRunning = false;

let timerInterval = null;

let currentDrop = null;


/* ========================================
   HIGH SCORE
======================================== */

// Load the saved high score from the browser.
//
// If no high score exists, use 0.

let highScore = Number(
  localStorage.getItem("waterDashHighScore")
) || 0;


// Sound starts enabled
let soundEnabled = true;


/* ========================================
   UPDATE SCORE DISPLAY
======================================== */

function updateScore() {

  scoreElement.textContent = score;

}


/* ========================================
   UPDATE HIGH SCORE DISPLAY
======================================== */

function updateHighScore() {

  highScoreElement.textContent = highScore;

}


/* ========================================
   UPDATE TIMER DISPLAY
======================================== */

function updateTimer() {

  timerElement.textContent = timeLeft;

}


/* ========================================
   SAVE HIGH SCORE
======================================== */

function saveHighScore() {

  // Only save if the current score
  // beats the previous high score.

  if (score > highScore) {

    highScore = score;

    // Save the score in the browser
    localStorage.setItem(
      "waterDashHighScore",
      highScore
    );

    updateHighScore();

    return true;

  }

  return false;

}


/* ========================================
   CREATE A WATER DROP
======================================== */

function createWaterDrop() {

  // Remove the previous drop
  if (currentDrop) {

    currentDrop.remove();

  }

  // Create a new button
  const drop = document.createElement("button");

  // Basic drop styling
  drop.classList.add("water-drop");

  // Decide if this is a golden drop
  const isGolden = Math.random() < GOLDEN_DROP_CHANCE;

  // Store the drop type
  drop.dataset.golden = isGolden ? "true" : "false";

  // Set the drop appearance and points
  if (isGolden) {

    drop.textContent = "🌟";

    drop.classList.add("golden-drop");

    drop.setAttribute(
      "aria-label",
      "Collect golden water drop for 25 points"
    );

  } else {

    drop.textContent = "💧";

    drop.setAttribute(
      "aria-label",
      "Collect water drop for 10 points"
    );

  }

  // Get gameboard dimensions
  const boardWidth = gameboard.clientWidth;

  const boardHeight = gameboard.clientHeight;

  // Size of the drop
  const dropSize = 48;

  // Generate random positions
  const randomX = Math.random() *
    (boardWidth - dropSize);

  const randomY = Math.random() *
    (boardHeight - dropSize);

  // Position the drop
  drop.style.left = `${randomX}px`;

  drop.style.top = `${randomY}px`;

  // Add click event
  drop.addEventListener("click", collectWater);

  // Add drop to the board
  gameboard.appendChild(drop);

  // Save the current drop
  currentDrop = drop;

}


/* ========================================
   COLLECT WATER
======================================== */

function collectWater() {

  // Stop if game is not running
  if (!gameRunning) {

    return;

  }

  // Check if the drop is golden
  const isGolden =
    currentDrop.dataset.golden === "true";

  // Add the appropriate points
  if (isGolden) {

    score += GOLDEN_POINTS;

    messageElement.textContent =
      "Golden drop! +25 points! 🌟";

    playGoldenSound();

  } else {

    score += NORMAL_POINTS;

    messageElement.textContent =
      "Nice catch! +10 points! 💧";

    playCollectSound();

  }

  // Update score
  updateScore();

  // Create a new drop
  createWaterDrop();

}


/* ========================================
   START THE GAME
======================================== */

function startGame() {

  // Prevent multiple timers
  if (gameRunning) {

    return;

  }

  // Reset game variables
  score = 0;

  timeLeft = GAME_TIME;

  gameRunning = true;

  // Update displays
  updateScore();

  updateTimer();

  // Hide start prompt
  startPrompt.classList.add("hidden");

  // Hide end screen
  endScreen.classList.add("hidden");

  // Update message
  messageElement.textContent =
    "Catch as many drops as you can!";

  // Disable start button
  startBtn.disabled = true;

  // Create first drop
  createWaterDrop();

  // Start countdown
  timerInterval = setInterval(
    countdown,
    1000
  );

}


/* ========================================
   COUNTDOWN TIMER
======================================== */

function countdown() {

  timeLeft--;

  updateTimer();

  // End game when time reaches zero
  if (timeLeft <= 0) {

    endGame();

  }

}


/* ========================================
   END THE GAME
======================================== */

function endGame() {

  // Stop the game
  gameRunning = false;

  // Stop the timer
  clearInterval(timerInterval);

  timerInterval = null;

  // Remove the water drop
  if (currentDrop) {

    currentDrop.remove();

    currentDrop = null;

  }

  // Save the high score
  const isNewHighScore = saveHighScore();

  // Enable start button
  startBtn.disabled = false;

  // Update message
  messageElement.textContent =
    "Time's up! Great work!";

  // Show final score
  finalScoreElement.textContent =
    `You collected ${score} points!`;

  // Show high score message
  if (isNewHighScore && score > 0) {

    highScoreMessage.textContent =
      "🎉 New high score! You did amazing!";

  } else {

    highScoreMessage.textContent =
      `Your best score is ${highScore} points.`;

  }

  // Show end screen
  endScreen.classList.remove("hidden");

}


/* ========================================
   RESTART THE GAME
======================================== */

function restartGame() {

  // Stop any existing timer
  clearInterval(timerInterval);

  timerInterval = null;

  // Stop game
  gameRunning = false;

  // Remove existing drop
  if (currentDrop) {

    currentDrop.remove();

    currentDrop = null;

  }

  // Reset variables
  score = 0;

  timeLeft = GAME_TIME;

  // Update displays
  updateScore();

  updateTimer();

  // Hide end screen
  endScreen.classList.add("hidden");

  // Show start prompt
  startPrompt.classList.remove("hidden");

  // Update message
  messageElement.textContent =
    "Press Start Game to begin!";

  // Enable start button
  startBtn.disabled = false;

}


/* ========================================
   SOUND EFFECTS
======================================== */

// Create an AudioContext only when needed.
// Browsers generally allow audio after a user action.

let audioContext = null;


function getAudioContext() {

  if (!audioContext) {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {

      return null;

    }

    audioContext = new AudioContextClass();

  }

  // Resume if the browser suspended the context
  if (audioContext.state === "suspended") {

    audioContext.resume();

  }

  return audioContext;

}


/* ========================================
   PLAY A SIMPLE SOUND
======================================== */

function playTone(
  frequency,
  duration,
  type = "sine",
  volume = 0.08
) {

  // Do nothing if sound is muted
  if (!soundEnabled) {

    return;

  }

  const context = getAudioContext();

  if (!context) {

    return;

  }

  const oscillator = context.createOscillator();

  const gainNode = context.createGain();

  // Choose sound wave
  oscillator.type = type;

  // Choose pitch
  oscillator.frequency.setValueAtTime(
    frequency,
    context.currentTime
  );

  // Start quietly
  gainNode.gain.setValueAtTime(
    0.0001,
    context.currentTime
  );

  // Fade in quickly
  gainNode.gain.exponentialRampToValueAtTime(
    volume,
    context.currentTime + 0.01
  );

  // Fade out
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    context.currentTime + duration
  );

  // Connect the sound nodes
  oscillator.connect(gainNode);

  gainNode.connect(context.destination);

  // Play and stop
  oscillator.start();

  oscillator.stop(
    context.currentTime + duration
  );

}


/* ========================================
   NORMAL DROP SOUND
======================================== */

function playCollectSound() {

  playTone(
    600,
    0.12,
    "sine",
    0.06
  );

}


/* ========================================
   GOLDEN DROP SOUND
======================================== */

function playGoldenSound() {

  // Two tones create a special sound
  playTone(
    700,
    0.12,
    "sine",
    0.07
  );

  setTimeout(() => {

    playTone(
      1000,
      0.18,
      "sine",
      0.07
    );

  }, 100);

}


/* ========================================
   SOUND TOGGLE
======================================== */

function toggleSound() {

  soundEnabled = !soundEnabled;

  // Update the button text
  if (soundEnabled) {

    soundBtn.textContent = "🔊 Sound On";

    soundBtn.classList.remove("muted");

    soundBtn.setAttribute(
      "aria-pressed",
      "false"
    );

  } else {

    soundBtn.textContent = "🔇 Sound Off";

    soundBtn.classList.add("muted");

    soundBtn.setAttribute(
      "aria-pressed",
      "true"
    );

  }

}


/* ========================================
   BUTTON EVENTS
======================================== */

startBtn.addEventListener(
  "click",
  startGame
);

restartBtn.addEventListener(
  "click",
  restartGame
);

soundBtn.addEventListener(
  "click",
  toggleSound
);


/* ========================================
   INITIAL DISPLAY
======================================== */

updateScore();

updateHighScore();

updateTimer();