'use strict';

let listGroupCount = 1;
const group = document.querySelector(`#listGroup${listGroupCount}`);
const moreListBtn = document.querySelector('.addlist');
const moreSentenceBtn = document.querySelector('.addsentence');
const processBtn = document.querySelector('.process');

const processString = () => {
  let result = '<ul>';
  const fieldset = document.querySelectorAll('fieldset');
  for (const group of fieldset) {
    const str = [];
    str.push(group.querySelector('#meaning').value);
    for (const input of group.querySelectorAll('input[id^="sentence"]')) {
      if (input.value) str.push(input.value);
    }
    result += makeList(str);
  }
  result = result + '</ul>';
  console.log(result);
};

const makeList = str => {
  let result = '<li>' + str[0];

  for (let sentence of str.slice(1)) {
    result += `<br><i>${sentence}</i><br>`;
  }
  return result + '</li><br>';
};

const createListGroup = () => {
  ++listGroupCount;
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  const mlabel = document.createElement('label');
  const minput = document.createElement('input');
  const slabel = document.createElement('label');
  const sinput = document.createElement('input');
  const mparagraph = document.createElement('p');
  const sparagraph = document.createElement('p');

  fieldset.setAttribute('id', `listGroup${listGroupCount}`);

  mlabel.setAttribute('for', 'meaning');
  minput.setAttribute('id', 'meaning');
  minput.setAttribute('type', 'text');
  mparagraph.appendChild(mlabel).textContent = 'Meaning';
  mparagraph.appendChild(minput);

  slabel.setAttribute('for', 'sentence1');
  sinput.setAttribute('id', 'sentence1');
  sinput.setAttribute('type', 'text');
  sparagraph.appendChild(slabel).textContent = 'Sentence 1';
  sparagraph.appendChild(sinput);

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.setAttribute('class', 'addsentence');
  button.addEventListener('click', e => createSentenceInput(e, fieldset));

  fieldset.appendChild(legend).textContent = `List${listGroupCount}`;;
  fieldset.appendChild(mparagraph);
  fieldset.appendChild(sparagraph);
  fieldset.appendChild(button).textContent = '⌄';

  document.body.insertBefore(fieldset, moreListBtn.parentElement);
};

const createSentenceInput = (e, group) => {
  const count = group.querySelectorAll('input[type="text"]').length;
  const label = document.createElement('label');
  label.setAttribute('for', `sentence${count}`);

  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', `sentence${count}`);

  const paragraph = document.createElement('p');
  paragraph.appendChild(label).textContent = `Sentence ${count}`;
  paragraph.appendChild(input);

  const parent = e.target.parentElement;
  parent.insertBefore(paragraph, e.target);
};

moreSentenceBtn.addEventListener('click', e => createSentenceInput(e, group));
moreListBtn.addEventListener('click', createListGroup);
processBtn.addEventListener('click', processString);