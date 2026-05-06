const scoreEl = document.getElementById('score');
const equationEl = document.getElementById('equation');

export function updateScore(n) { scoreEl.textContent = n; }
export function updateEquation(str) { equationEl.textContent = str; }
export function initEquation(str) { equationEl.textContent = str; }
