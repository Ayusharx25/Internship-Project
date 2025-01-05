// script.js

const startBtn = document.getElementById('start-btn');
const dateTimeInput = document.getElementById('date-time');
const countdownContainer = document.getElementById('countdown');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const messageEl = document.getElementById('message');

let countdownInterval;

startBtn.addEventListener('click', () => {
  const targetDate = new Date(dateTimeInput.value);
  if (isNaN(targetDate)) {
    alert('Please select a valid date and time!');
    return;
  }

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    updateCountdown(targetDate);
  }, 1000);

  messageEl.classList.add('hidden');
});

function updateCountdown(targetDate) {
  const now = new Date();
  const timeDifference = targetDate - now;

  if (timeDifference <= 0) {
    clearInterval(countdownInterval);
    countdownContainer.innerHTML = '<p>00 Days</p><p>00 Hours</p><p>00 Minutes</p><p>00 Seconds</p>';
    messageEl.classList.remove('hidden');
    return;
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  daysEl.textContent = formatNumber(days);
  hoursEl.textContent = formatNumber(hours);
  minutesEl.textContent = formatNumber(minutes);
  secondsEl.textContent = formatNumber(seconds);
}

function formatNumber(num) {
  return num < 10 ? `0${num}` : num;
}
