'use strict';

let listGroupCount = 1;
const group = document.querySelector(`#listGroup${listGroupCount}`);
const moreSentenceBtn = document.querySelector(`.addsentence1`);

const createSentenceInput = group => {
  const count = group.querySelectorAll('input[type="text"]').length;
  const label = document.createElement('label');
  label.setAttribute('for', `sentence${count}`);
  label.textContent = `Sentence ${count}`;

  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', `sentence${count}`);

  const paragraph = document.createElement('p');
  paragraph.appendChild(label);
  paragraph.appendChild(input);

  const parent = moreSentenceBtn.parentElement;
  parent.insertBefore(paragraph, moreSentenceBtn);
};

moreSentenceBtn.addEventListener('click', () => createSentenceInput(group));