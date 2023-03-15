'use strict';

let listGroupCount = 1;
const group = document.querySelector(`#listGroup${listGroupCount}`);
const moreListBtn = document.querySelector('.addlist');
const moreSentenceBtn = document.querySelector('.addsentence');
const processBtn = document.querySelector('.process');
const sentenceField = document.querySelector('#sentence1');

const processString = () => {
  // process main word section
  const wordFormatted = document.querySelector('#word_entry').value;
  const phoneticsFormatted = `/${document.querySelector('#phonetic_entry').value}/`;
  const posFormatted = document.querySelector('#pos_entry').value;

  // process meanings section
  let meaningFormatted = '<ul>';
  const fieldset = document.querySelectorAll('fieldset[id^="listGroup"]');
  for (const group of fieldset) {
    const str = [];
    const meaning = group.querySelector('#meaning').value
    if (meaning === '') continue;
    str.push(meaning);
    for (const input of group.querySelectorAll('input[id^="sentence"]')) {
      if (input.value) str.push(input.value);
    }
    meaningFormatted += makeList(str);
  }
  meaningFormatted = meaningFormatted + '</ul>';

  // process notes section
  let notesFormatted = document.querySelector('#note_entry').value;
  notesFormatted = notesFormatted.replaceAll(wordFormatted, `<b>${wordFormatted}</b>`);

  const info = {
    Word: wordFormatted,
    Phonetics: phoneticsFormatted,
    'Parts of Speech': posFormatted,
    Meaning: meaningFormatted,
    Notes: notesFormatted
  };
  addToAnki(info);
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
  sinput.addEventListener('keydown', detectKey);
  sinput.addEventListener('blur', addField);
  sparagraph.appendChild(slabel).textContent = 'Sentence 1';
  sparagraph.appendChild(sinput);

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.setAttribute('class', 'addsentence');
  button.addEventListener('click', e => createSentenceInput(e, fieldset));

  fieldset.appendChild(legend).textContent = `List ${listGroupCount}`;;
  fieldset.appendChild(mparagraph);
  fieldset.appendChild(sparagraph);
  fieldset.appendChild(button).textContent = 'more';

  document.querySelector('.meanings').insertBefore(fieldset, moreListBtn.parentElement);
};

const createSentenceInput = (e, group) => {
  const count = group.querySelectorAll('input[type="text"]').length;
  const label = document.createElement('label');
  label.setAttribute('for', `sentence${count}`);

  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', `sentence${count}`);
  input.addEventListener('keydown', detectKey);
  input.addEventListener('blur', addField);

  const paragraph = document.createElement('p');
  paragraph.appendChild(label).textContent = `Sentence ${count}`;
  paragraph.appendChild(input);

  const parent = e.target.parentElement;
  parent.insertBefore(paragraph, e.target);
  input.focus();
};

let lastKeyPressed;
const detectKey = e => lastKeyPressed = e.key;

const addField = e => {
  if (lastKeyPressed === 'Tab') {
    e.currentTarget.parentElement.nextElementSibling.click()
    lastKeyPressed = null;
  }
};

const addToAnki = info => {
  fetch("http://127.0.0.1:8765", {
    method: "post",
    body: JSON.stringify({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: 'English',
          modelName: 'English Vocab',
          fields: info,
          options: {
            "allowDuplicate": false,
            "duplicateScope": "deck",
            "duplicateScopeOptions": {
              "deckName": "English",
              "checkChildren": false,
              "checkAllModels": false
            }
          },
        }
      }
    })
  }).then((response) => {
    console.log(response)
  });
};

moreSentenceBtn.addEventListener('click', e => createSentenceInput(e, group));
moreListBtn.addEventListener('click', createListGroup);
processBtn.addEventListener('click', processString);
sentenceField.addEventListener('keydown', detectKey);
sentenceField.addEventListener('blur', addField);