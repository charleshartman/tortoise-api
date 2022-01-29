// script.js

"use strict";

document.addEventListener('DOMContentLoaded', () => {
  let root = document.querySelector('#root');
  let intro = document.createElement('p');
  intro.classList.add('textualContent');
  intro.textContent = 'is coming soonish.';

  root.appendChild(intro);
});

