'use strict';

let listGroupCount = 1;
let partofspeech = [];
const wordInput = document.querySelector('#word_entry');
const emptyField = document.querySelector('#emptyword');
const phoneticsInput = document.querySelector('#phonetic_entry');
const posInput = document.querySelector('#pos_entry');
const posOpt = document.querySelector('#pos_opt');
const nounInput = document.querySelector('#noun');
const adjInput = document.querySelector('#adjective');
const verbInput = document.querySelector('#verb');
const adverbInput = document.querySelector('#adverb');
const phraseInput = document.querySelector('#phrase');
const moreListBtn = document.querySelector('.addlist');
const moreSentenceBtn = document.querySelector('.addsentence');
const processBtn = document.querySelector('.process');
const meaningField = document.querySelector('#list1_meaning');
const sentenceField = document.querySelector('#list1_sentence1');
const resetBtn = document.querySelector('button[type="reset"]');
const type = ['n', 'v', 'adj', 'adv'];

function formatWord() {
  this.value = this.value.replaceAll('·', '');
}

function formatPhonetics() {
  let text = this.value;

  if (text === '') return;
  if (text.startsWith('[') || text.startsWith('/')) {
    // assume text surrounded with delimiters, remove it
    text = text.slice(1, -1);
  }

  this.value = `/${text}/`;
}

function formatMeaning() {
  const phrase = this.value;
  const indexOfSpace = phrase.indexOf(' ');
  const prefix = phrase.substring(0, indexOfSpace);

  if (type.includes(prefix)) {
    this.value = `<sub>${prefix}</sub> ${phrase.slice(indexOfSpace + 1)}`;
  }

  if (this.value.endsWith('.') || this.value.endsWith(':')) {
    this.value = this.value.slice(0, -1);
  }
}

function formatSentence() {
  const originalText = this.value;
  let formattedText = originalText.trim();

  if (formattedText.charAt(0) == '"' && formattedText.charAt(formattedText.length - 1)) {
    formattedText = formattedText.substring(1, formattedText.length - 1);
  }

  if (formattedText.charAt(formattedText.length - 1) == '.') {
    formattedText = formattedText.substring(0, formattedText.length - 1);
  }

  this.value = formattedText;
}

function processPosOpt() {
  if (posInput.value === '') return;

  const suffix = `(${[...this.selectedOptions].map((elt) => elt.value).join('•')})`;
  const index =
    posInput.value.indexOf('(') !== -1
      ? posInput.value.indexOf('(')
      : posInput.value.length;
  posInput.value = posInput.value.slice(0, index).trim() + ' ' + suffix;
}

const processString = () => {
  if (!wordInput.validity.valid) return;

  // process main word section
  const wordFormatted = wordInput.value;
  const phoneticsFormatted = phoneticsInput.value;
  const posFormatted = posInput.value;

  // process meanings section
  let meaningFormatted = '<ul>';
  const fieldset = document.querySelectorAll('fieldset[id^="listGroup"]');
  for (const group of fieldset) {
    const str = [];
    let meaning = group.querySelector('textarea[id*="meaning"]').value;
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
    Notes: notesFormatted,
  };
  addToAnki(info);
  resetBtn.click();
};

const makeList = (str) => {
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
  minput.addEventListener('blur', formatMeaning);
  mparagraph.appendChild(mlabel).textContent = 'Meaning';
  mparagraph.appendChild(minput);

  slabel.setAttribute('for', `list${listGroupCount}_sentence1`);
  sinput.setAttribute('id', `list${listGroupCount}_sentence1`);
  sinput.addEventListener('keydown', detectKey);
  sinput.addEventListener('blur', formatSentence);
  sparagraph.appendChild(slabel).textContent = 'Sentence 1';
  sparagraph.appendChild(sinput);

  const button = document.createElement('button'); // hidden button
  button.setAttribute('type', 'button');
  button.setAttribute('class', 'addsentence');
  button.addEventListener('click', (e) => createSentenceInput(e, fieldset));

  fieldset.appendChild(legend).textContent = `List ${listGroupCount}`;
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
  input.addEventListener('blur', formatSentence);

  const paragraph = document.createElement('p');
  paragraph.appendChild(label).textContent = `Sentence ${count}`;
  paragraph.appendChild(input);

  group.insertBefore(paragraph, group.querySelector('button.addsentence'));
};

const detectKey = (e) => {
  if (!e.shiftKey && e.key === 'Tab') {
    if (e.target.parentElement.matches('p:last-of-type')) {
      createSentenceInput(e.target, e.target.closest('fieldset'));
    }
  }
};

const buildPartofspeech = (e) => {
  if (e.target.checked) {
    partofspeech.push(e.target.value);
  } else {
    partofspeech = partofspeech.filter((v) => v !== e.target.value);
  }
  posInput.value = partofspeech.join(', ');
};

const addToAnki = (info) => {
  fetch('http://127.0.0.1:8765', {
    method: 'post',
    body: JSON.stringify({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: 'English',
          modelName: 'English Vocab',
          tags: posInput.value.includes('phrase') ? ['phrase'] : '',
          fields: info,
          options: {
            allowDuplicate: false,
            duplicateScope: 'deck',
            duplicateScopeOptions: {
              deckName: 'English',
              checkChildren: false,
              checkAllModels: false,
            },
          },
        },
      },
    }),
  }).then((response) => {
    console.log(response);
  });
};

const resetForm = () => {
  posOpt.value = '';
  partofspeech = [];
  wordInput.focus();
};

moreSentenceBtn.addEventListener('click', (e) =>
  createSentenceInput(e.target, e.target.closest('fieldset'))
);
moreListBtn.addEventListener('click', createListGroup);
processBtn.addEventListener('click', processString);
meaningField.addEventListener('blur', formatMeaning);
sentenceField.addEventListener('keydown', detectKey);
sentenceField.addEventListener('blur', formatSentence);
wordInput.addEventListener('blur', formatWord);
phoneticsInput.addEventListener('blur', formatPhonetics);
posInput.addEventListener('blur', (e) => (e.target.value = e.target.value.toLowerCase()));
resetBtn.addEventListener('click', resetForm);
posOpt.addEventListener('change', processPosOpt);
nounInput.addEventListener('change', buildPartofspeech);
adjInput.addEventListener('change', buildPartofspeech);
verbInput.addEventListener('change', buildPartofspeech);
adverbInput.addEventListener('change', buildPartofspeech);
phraseInput.addEventListener('change', buildPartofspeech);

resetForm();
