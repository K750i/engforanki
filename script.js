'use strict';

let listGroupCount = 1;
const wordInput = document.querySelector('#word_entry');
const emptyField = document.querySelector('#emptyword');
const phoneticsInput = document.querySelector('#phonetic_entry');
const moreListBtn = document.querySelector('.addlist');
const moreSentenceBtn = document.querySelector('.addsentence');
const processBtn = document.querySelector('.process');
const sentenceField = document.querySelector('#list1_sentence1');
const resetBtn = document.querySelector('button[type="reset"]');

const formatPhonetics = () => {
  let text = phoneticsInput.value;
  if (!(text === '' || text.startsWith('/'))) {
    phoneticsInput.value = `/${text}/`;
  }
};

const processString = () => {
  if (!wordInput.validity.valid) return;

  // process main word section
  const wordFormatted = wordInput.value;
  const phoneticsFormatted = phoneticsInput.value
  const posFormatted = document.querySelector('#pos_entry').value;

  // process meanings section
  let meaningFormatted = '<ul>';
  const fieldset = document.querySelectorAll('fieldset[id^="listGroup"]');
  for (const group of fieldset) {
    const str = [];
    let meaning = group.querySelector('textarea[id*="meaning"]').value
    meaning = meaning.charAt(0).toLowerCase() + meaning.slice(1);
    if (meaning === '') continue;
    str.push(meaning);
    for (const input of group.querySelectorAll('textarea[id*="sentence"]')) {
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
  resetBtn.click();
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
  const minput = document.createElement('textarea');
  const slabel = document.createElement('label');
  const sinput = document.createElement('textarea');
  const mparagraph = document.createElement('p');
  const sparagraph = document.createElement('p');

  fieldset.setAttribute('id', `listGroup${listGroupCount}`);

  mlabel.setAttribute('for', `list${listGroupCount}_meaning`);
  minput.setAttribute('id', `list${listGroupCount}_meaning`);
  mparagraph.appendChild(mlabel).textContent = 'Meaning';
  mparagraph.appendChild(minput);

  slabel.setAttribute('for', `list${listGroupCount}_sentence1`);
  sinput.setAttribute('id', `list${listGroupCount}_sentence1`);
  sinput.addEventListener('keydown', detectKey);
  sparagraph.appendChild(slabel).textContent = 'Sentence 1';
  sparagraph.appendChild(sinput);

  const button = document.createElement('button');  // hidden button
  button.setAttribute('type', 'button');
  button.setAttribute('class', 'addsentence');
  button.addEventListener('click', e => createSentenceInput(e, fieldset));

  fieldset.appendChild(legend).textContent = `List ${listGroupCount}`;;
  fieldset.appendChild(mparagraph);
  fieldset.appendChild(sparagraph);
  fieldset.appendChild(button).textContent = 'more';

  document.querySelector('.meanings').insertBefore(fieldset, moreListBtn.parentElement);
  minput.focus();
};

const createSentenceInput = (elt, group) => {
  const count = group.querySelectorAll('textarea').length;
  const label = document.createElement('label');
  const idForSentenceInput = `list${group.id.slice(-1)}_sentence${count}`;
  label.setAttribute('for', idForSentenceInput);

  const input = document.createElement('textarea');
  input.setAttribute('id', idForSentenceInput);
  input.addEventListener('keydown', detectKey);

  const paragraph = document.createElement('p');
  paragraph.appendChild(label).textContent = `Sentence ${count}`;
  paragraph.appendChild(input);

  group.insertBefore(paragraph, group.querySelector('button.addsentence'));
};

const detectKey = e => {
  if (!e.shiftKey && e.key === 'Tab') {
    if (e.target.parentElement.matches('p:last-of-type')) {
      createSentenceInput(e.target, e.target.closest('fieldset'));
    }
  };
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

moreSentenceBtn.addEventListener('click', e => createSentenceInput(e.target, e.target.closest('fieldset')));
moreListBtn.addEventListener('click', createListGroup);
processBtn.addEventListener('click', processString);
sentenceField.addEventListener('keydown', detectKey);
phoneticsInput.addEventListener('blur', formatPhonetics);
resetBtn.addEventListener('click', () => wordInput.focus());
