var $form = document.querySelector('form');
var $entryImage = document.querySelector('.entry-image');
var $photoUrl = document.querySelector('.photo-url');
var $ul = document.querySelector('ul.entry-list');
var $entryNav = document.querySelector('h5.entry-nav');
var $entryForm = document.querySelector('[data-view="entry-form"]');
var $entries = document.querySelector('[data-view="entries"]');
var $newButton = document.querySelector(
  '.new-button-container'
).firstElementChild;
var $newEntryText = $form.querySelector('h2');
var $deleteEntry = $form.querySelector('.delete-entry');
var $modalConfirmation = $entryForm.querySelector(
  '.confirmation-modal-container'
);
var $searchIcon = $entries.querySelector('.search-container');
var $searchBox = $entries.querySelector('#entry-search');
var $cardViewUl = document.querySelector('ul[data-view="small-entry"]');
var $listViewUl = document.querySelector('ul[data-view="large-entry"]');
var $cardViewButton = document.querySelector('button.card-view');
var $listViewButton = document.querySelector('button.list-view');

if (data.view === 'entry-form') {
  showEntryForm();
} else if (data.view === 'entries') {
  showEntries();
}

$searchBox.addEventListener('input', filterEntries);
$searchIcon.addEventListener('click', showSearchBox);
$form.addEventListener('submit', submitEntryForm);
$photoUrl.addEventListener('input', updateSrc);
$entryNav.addEventListener('click', showEntries);
$newButton.addEventListener('click', showEntryForm);
window.addEventListener('DOMContentLoaded', loadEntriesContent);
$entries.addEventListener('click', detectEntriesClicks);
$deleteEntry.addEventListener('click', showConfirmationModal);
$modalConfirmation.addEventListener('click', handleModalAction);
$cardViewButton.addEventListener('click', showCardView);
$listViewButton.addEventListener('click', showListView);

function showListView(event) {
  // add a hidden class to the card view ul
  // remove the hidden class from the list view ul
  swapViews($listViewUl, $cardViewUl);
  data.entriesView = 'large-entry';
}

function showCardView(event) {
  // add a hidden class to the list view ul
  // remove the hidden class from the card view ul
  swapViews($cardViewUl, $listViewUl);
  data.entriesView = 'small-entry';
}

function swapViews(show, hide) {
  var hideClasses = hide.className;
  var showClasses = show.className;
  var showClassesArray, hiddenIndex;

  if (!hideClasses.includes('hidden')) {
    hide.className = hideClasses + ' hidden';
  }
  if (showClasses.includes('hidden')) {
    showClassesArray = showClasses.split(' ');
    hiddenIndex = showClassesArray.indexOf('hidden');
    showClassesArray.splice(hiddenIndex, 1);
    show.className = showClassesArray.join(' ');
  }
}

function createSmallEntryElements(entry) {
  return elementCreator(
    'li',
    { class: 'row card-format', 'data-entry-id': entry.id },
    [
      elementCreator('div', { class: 'column-third' }, [
        elementCreator('img', {
          src: entry.url,
          alt: 'entry image',
          class: 'entry-image small-image'
        })
      ]),
      elementCreator(
        'div',
        { class: 'column-two-thirds flex-col space-between pos-rel ' },
        [
          elementCreator('div', { class: 'row mw-75pc' }, [
            elementCreator('h5', {
              class: 'small-title',
              innerText: entry.title
            }),
            elementCreator('img', {
              src: 'images/pencil.png',
              class: 'edit-icon small-edit'
            })
          ]),
          elementCreator('div', { class: 'small-notes-container' }, [
            elementCreator('p', {
              class: 'small-notes',
              innerText: entry.notes
            })
          ]),
          elementCreator('div', { class: 'tag-container small-tags row' }, [
            elementCreator('div', { class: 'tag-input-container' }, [
              elementCreator('span', {
                role: 'textbox',
                contenteditable: '',
                class: 'tag-input mini-span hidden'
              }),
              elementCreator('p', { innerText: 'Tag+', class: 'add tag mini' })
            ])
          ])
        ]
      )
    ]
  );
}

function detectEntriesClicks(event) {
  var id, grandpa, papa, tagText, span;
  if (event.target.matches('.edit-icon')) {
    showEntryForm();
    id = parseInt(event.target.closest('[data-entry-id]').dataset.entryId);

    for (var i = 0; i < data.entries.length; i++) {
      if (data.entries[i].id === id) {
        data.editing = data.entries[i];
        break;
      }
    }

    $form.elements.title.value = data.editing.title;
    $form.elements.url.value = data.editing.url;
    $form.elements.notes.value = data.editing.notes;
    $entryImage.setAttribute('src', data.editing.url);

    $newEntryText.textContent = 'Edit Entry';
    $deleteEntry.className = 'delete-entry';
  } else if (event.target.matches('.add')) {
    span = event.target.previousElementSibling;
    span.textContent = '';
    if (event.target.matches('.regular')) {
      span.className = 'tag-input';
      event.target.className = 'add tag regular hidden';
    } else if (event.target.matches('.mini')) {
      span.className = 'tag-input mini-span';
      event.target.className = 'add tag mini hidden';
    }

    span.focus();
    span.addEventListener('keypress', createTag);
    span.addEventListener('blur', checkEmptySpan);
  } else if (event.target.matches('span.del-tag')) {
    grandpa = event.target.parentElement.parentElement;
    papa = event.target.parentElement;
    id = parseInt(grandpa.closest('li').dataset.entryId);
    tagText = papa.textContent.slice(0, papa.textContent.length - 1);

    grandpa.removeChild(papa);
    removeTagFromData(id, tagText);
  } else if (event.target.matches('p.tag') && !event.target.matches('p.add')) {
    if (event.target.firstElementChild.className === 'del-tag hidden') {
      event.target.firstElementChild.className = 'del-tag';
    } else {
      event.target.firstElementChild.className = 'del-tag hidden';
    }
  }
}

function removeTagFromData(id, text) {
  for (var i = 0; i < data.entries.length; i++) {
    if (data.entries[i].id === id) {
      for (var j = 0; j < data.entries[i].tags.length; j++) {
        if (data.entries[i].tags[j].text === text) {
          data.entries[i].tags.splice(j, 1);
          break;
        }
      }
      break;
    }
  }
}

function filterEntries(event) {
  // Get the string from search and make a regular expression ignoring case
  var re = new RegExp(event.target.value, 'i');
  var words = event.target.value.split(' ');

  var tags, boolArr, entryId, dataId, title, notes;

  // Go through each data entry object

  for (var i = 0; i < data.entries.length; i++) {
    dataId = data.entries[i].id;
    title = data.entries[i].title;
    notes = data.entries[i].notes;
    tags = [];
    data.entries[i].tags.forEach(tag => {
      tags.push(tag.text);
    });
    boolArr = compareTagsAndWords(words, tags);
    boolArr = compareTitleAndNoteToWords(words, title, notes, boolArr);
    // If search string does not match a title or notes for a data entry object
    if (!re.test(data.entries[i].title) || !re.test(data.entries[i].notes)) {
      // Loop through each entry in the DOM
      for (var j = 0; j < $ul.children.length; j++) {
        entryId = parseInt($ul.children[j].dataset.entryId);
        if (entryId === dataId && boolArr.some(x => x - 1)) {
          // Hide that entry
          $ul.children[j].className = 'hidden';
        }
      }
    }

    // If search string matches a title or note for a data entry object
    if (
      re.test(data.entries[i].title) ||
      re.test(data.entries[i].notes) ||
      !boolArr.some(x => x - 1)
    ) {
      // Loop through each entry in the DOM
      for (var p = 0; p < $ul.children.length; p++) {
        entryId = parseInt($ul.children[p].dataset.entryId);
        // If the DOM entry matches the data entry
        if (entryId === dataId) {
          // Make the DOM entry visible
          $ul.children[p].className = 'row';
        }
      }
    }
  }
}

function compareTagsAndWords(words, tags) {
  var boolArr = Array(words.length).fill(0);
  var searchStrWord, tagWord;

  for (var k = 0; k < words.length; k++) {
    searchStrWord = new RegExp(words[k], 'i');
    // Loop through each word in the search bar
    for (var n = 0; n < tags.length; n++) {
      tagWord = tags[n];
      // If the search bar matches the tag text
      if (searchStrWord.test(tagWord)) {
        // Set the bool array to true
        boolArr[k] = 1;
        // Go to the next word to compare to tag
        break;
      }
    }
  }
  return boolArr;
}

function compareTitleAndNoteToWords(words, title, note, boolArr) {
  var searchStrWord;

  for (var k = 0; k < words.length; k++) {
    searchStrWord = new RegExp(words[k], 'i');
    // Loop through each word in the search bar
    if (searchStrWord.test(title) || searchStrWord.test(note)) {
      boolArr[k] = 1;
    }
  }
  return boolArr;
}

function showSearchBox(event) {
  $searchBox.className = '';
  $searchBox.focus();
}

function handleModalAction(event) {
  if (event.target.matches('.cancel')) {
    $modalConfirmation.className = 'confirmation-modal-container hidden';
  } else if (event.target.matches('.confirm')) {
    $modalConfirmation.className = 'confirmation-modal-container hidden';
    for (var i = 0; i < data.entries.length; i++) {
      if (data.entries[i].id === data.editing.id) {
        removeEntry(data.entries[i].id);
        data.entries.splice(i, 1);
        data.editing = null;
        showEntries();
        if (!data.entries.length) {
          data.tags = [];
          data.nextEntryId = 1;
        }
        break;
      }
    }
  }
}

function removeEntry(id) {
  for (var i = 0; i < $ul.children.length; i++) {
    if (parseInt($ul.children[i].dataset.entryId) === id) {
      $ul.removeChild($ul.children[i]);
      break;
    }
  }
}

function showConfirmationModal(event) {
  $modalConfirmation.className = 'confirmation-modal-container';
}

function checkEmptySpan(event) {
  if (event.target.textContent === '') {
    if (event.target.className === 'tag-input mini-span') {
      event.target.className = 'tag-input mini-span hidden';
      event.target.nextElementSibling.className = 'add tag mini';
    } else if (event.target.className === 'tag-input') {
      event.target.className = 'tag-input hidden';
      event.target.nextElementSibling.className = 'add tag';
    }
  }
}

function createTag(event) {
  var tag, tagMini, randomColor, tagContainers, id;
  var tagExists = false;
  if (event.key === 'Enter') {
    id = parseInt(event.target.closest('li').dataset.entryId);
    randomColor = getDarkColor();
    tagContainers = $entries.querySelectorAll('.tag-container');
    event.preventDefault();
    if (event.target.className === 'tag-input') {
      event.target.className = 'tag-input hidden';
    } else if (event.target.className === 'tag-input mini-span') {
      event.target.className = 'tag-input mini-span hidden';
    }
    tag = createTagElements(event.target.textContent);
    tagMini = createTagElements(event.target.textContent, 'mini');
    for (var tagInd = 0; tagInd < data.tags.length; tagInd++) {
      if (data.tags[tagInd].text === event.target.textContent) {
        tagExists = true;
        break;
      }
    }
    if (tagExists) {
      tag.style.backgroundColor = data.tags[tagInd].color;
      tagMini.style.backgroundColor = data.tags[tagInd].color;
    } else {
      tag.style.backgroundColor = randomColor;
      tagMini.style.backgroundColor = randomColor;
    }

    for (var i = 0; i < data.entries.length; i++) {
      if (data.entries[i].id === id) {
        if (!tagExists) {
          data.entries[i].tags.push({
            color: randomColor,
            text: event.target.textContent
          });
          data.tags.push({
            color: randomColor,
            text: event.target.textContent
          });
        } else {
          data.entries[i].tags.push({
            color: data.tags[tagInd].color,
            text: event.target.textContent
          });
        }
        break;
      }
    }

    tagContainers[0].appendChild(tag);
    tagContainers[1].appendChild(tagMini);

    if (
      event.target.parentElement.lastElementChild.className ===
      'add tag mini hidden'
    ) {
      event.target.parentElement.lastElementChild.className = 'add tag mini';
    } else if (
      event.target.parentElement.lastElementChild.className ===
      'add tag regular hidden'
    ) {
      event.target.parentElement.lastElementChild.className = 'add tag regular';
    }
    event.target.nextElementSibling.click();
  }
}

function getDarkColor() {
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += Math.floor(Math.random() * 10);
  }
  return color;
}

function createTagElements(text, mini) {
  var el;
  if (mini === 'mini') {
    el = elementCreator(
      'p',
      { innerText: text, class: 'tag created-tag mini' },
      [elementCreator('span', { class: 'del-tag hidden', innerText: 'x' })]
    );
  } else {
    el = elementCreator(
      'p',
      { innerText: text, class: 'tag created-tag regular' },
      [elementCreator('span', { class: 'del-tag hidden', innerText: 'x' })]
    );
  }
  return el;
}

function showEntryForm(event) {
  $form.reset();
  data.editing = null;
  $entryImage.setAttribute('src', 'images/placeholder-image-square.jpg');
  $entryForm.className = 'form-container';
  $entries.className = 'hidden';
  data.view = 'entry-form';
  $newEntryText.textContent = 'New Entry';
}

function showEntries(event) {
  $entryForm.className = 'form-container hidden';
  $entries.className = '';
  data.view = 'entries';
}

function loadEntriesContent() {
  createAndAddEntries($listViewUl, createLargeEntryElements);
  createAndAddEntries($cardViewUl, createSmallEntryElements);

  if (data.entriesView === 'large-entry') {
    $listViewUl.classList.remove('hidden');
  } else if (data.entriesView === 'small-entry') {
    $cardViewUl.classList.remove('hidden');
  }
}

function createAndAddEntries(parent, createEntryElements) {
  var entryElement;
  var tagContainer;
  var tagElement;

  data.entries.forEach(entry => {
    entryElement = createEntryElements(entry);
    if (entry.tags) {
      tagContainer = entryElement.querySelector('.tag-container');
      entry.tags.forEach(tag => {
        if (parent.dataset.view === 'large-entry') {
          tagElement = createTagElements(tag.text);
        } else if (parent.dataset.view === 'small-entry') {
          tagElement = createTagElements(tag.text, 'mini');
        }
        tagElement.style.backgroundColor = tag.color;
        tagContainer.appendChild(tagElement);
      });
    }
    parent.appendChild(entryElement);
  });
}

function submitEntryForm(event) {
  event.preventDefault();
  var smallEntry, largeEntry, domInd;

  if (!data.editing) {
    var formDataObj = {};
    formDataObj.title = $form.elements.title.value;
    formDataObj.url = $form.elements.url.value;
    formDataObj.notes = $form.elements.notes.value;
    formDataObj.id = data.nextEntryId;
    formDataObj.tags = [];
    data.nextEntryId++;
    data.entries.unshift(formDataObj);
    [largeEntry, smallEntry] = createNewestEntry();
    addNewestEntry(largeEntry, smallEntry);
  } else {
    data.editing.title = $form.elements.title.value;
    data.editing.url = $form.elements.url.value;
    data.editing.notes = $form.elements.notes.value;
    domInd = findDOMElement($listViewUl);
    modifyDOMEntry($listViewUl, domInd);
    domInd = findDOMElement($cardViewUl);
    modifyDOMEntry($cardViewUl, domInd);
  }

  $deleteEntry.className = 'delete-entry hidden';
  $form.reset();
  showEntries();
}

function findDOMElement(ulParentElement) {
  for (var i = 0; i < ulParentElement.children.length; i++) {
    if (
      parseInt(ulParentElement.children[i].dataset.entryId) === data.editing.id
    ) {
      return i;
    }
  }
}

function modifyDOMEntry(parentElement, i) {
  var title, notes;
  if (parentElement === $listViewUl) {
    parentElement.children[i]
      .querySelector('img.entry-image')
      .setAttribute('src', data.editing.url);
    title =
      parentElement.children[i].firstElementChild.nextElementSibling
        .firstElementChild;
    title.textContent = data.editing.title;
    notes =
      parentElement.children[i].firstElementChild.nextElementSibling
        .lastElementChild;
    notes.textContent = data.editing.notes;
  } else if (parentElement === $cardViewUl) {
    parentElement.children[i]
      .querySelector('img.entry-image')
      .setAttribute('src', data.editing.url);
    parentElement.children[
      i
    ].firstElementChild.nextElementSibling.firstElementChild.firstElementChild.textContent =
      data.editing.title;

    parentElement.children[
      i
    ].lastElementChild.firstElementChild.nextElementSibling.firstElementChild.textContent =
      data.editing.notes;
  }
}

function addNewestEntry(largeEntry, smallEntry) {
  $listViewUl.prepend(largeEntry);
  $cardViewUl.prepend(smallEntry);
}

function createNewestEntry() {
  return [
    createLargeEntryElements(data.entries[0]),
    createSmallEntryElements(data.entries[0])
  ];
}

function updateSrc(event) {
  if (isValidUrl(event.target.value)) {
    $entryImage.setAttribute('src', event.target.value);
  }
}

function isValidUrl(urlString) {
  var urlPattern = new RegExp(
    '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$',
    'i'
  );
  return !!urlPattern.test(urlString);
}

function createLargeEntryElements(entry) {
  var $li = elementCreator('li', { class: 'row', 'data-entry-id': entry.id }, [
    elementCreator('div', { class: 'column-half' }, [
      elementCreator('img', {
        class: 'entry-image image-shrink',
        src: entry.url,
        alt: `Entry Image ${entry.id}`
      })
    ]),
    elementCreator('div', { class: 'column-half pos-rel mh-330px of-scroll' }, [
      elementCreator('h3', { innerText: entry.title }),
      elementCreator('img', {
        src: 'images/pencil.png',
        class: 'edit-icon'
      }),
      elementCreator('p', {
        innerText: entry.notes
      })
    ]),
    elementCreator('div', { class: 'column-full' }, [
      elementCreator('div', { class: 'tag-container row' }, [
        elementCreator('div', { class: 'tag-input-container' }, [
          elementCreator('span', {
            role: 'textbox',
            contenteditable: '',
            class: 'tag-input hidden'
          }),
          elementCreator('p', { innerText: 'Tag +', class: 'add tag regular' })
        ])
      ])
    ])
  ]);
  return $li;
}

function elementCreator(tagname, attributes, children = []) {
  var element = document.createElement(tagname);
  if (attributes) {
    for (var attribute in attributes) {
      if (attribute === 'innerText') {
        element.textContent = attributes[attribute];
      } else if (attribute === 'src') {
        if (
          isValidUrl(attributes[attribute]) ||
          attributes[attribute] === 'images/pencil.png'
        ) {
          element.setAttribute(attribute, attributes[attribute]);
        } else {
          element.setAttribute(
            attribute,
            'images/placeholder-image-square.jpg'
          );
        }
      } else {
        element.setAttribute(attribute, attributes[attribute]);
      }
    }
  }
  if (children.length) {
    children.forEach(child => {
      element.appendChild(child);
    });
  }
  return element;
}
