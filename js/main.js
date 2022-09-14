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

if (data.view === 'entry-form') {
  showEntryForm();
} else if (data.view === 'entries') {
  goToEntries();
}

$searchBox.addEventListener('input', filterEntries);
$searchIcon.addEventListener('click', showSearchBox);
$form.addEventListener('submit', submitEntryForm);
$photoUrl.addEventListener('input', updateSrc);
$entryNav.addEventListener('click', goToEntries);
$newButton.addEventListener('click', showEntryForm);
window.addEventListener('DOMContentLoaded', showEntries);
$ul.addEventListener('click', detectEntryClicks);
$deleteEntry.addEventListener('click', showConfirmationModal);
$modalConfirmation.addEventListener('click', handleModalAction);

function filterEntries(event) {
  var re = new RegExp(event.target.value, 'i');
  for (var i = 0; i < data.entries.length; i++) {
    if (!re.test(data.entries[i].title) || !re.test(data.entries[i].notes)) {
      // go through each li element id and if it does not match
      // the data entry id then give it a hidden class
      for (var j = 0; j < $ul.children.length; j++) {
        if (parseInt($ul.children[j].dataset.entryId) === data.entries[i].id) {
          $ul.children[j].className = 'hidden';
        }
      }
    }

    if (re.test(data.entries[i].title) || re.test(data.entries[i].notes)) {
      for (var k = 0; k < $ul.children.length; k++) {
        if (parseInt($ul.children[k].dataset.entryId) === data.entries[i].id) {
          $ul.children[k].className = 'row';
        }
      }
    }
  }
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
        data.entries.splice(i, 1);
        data.editing = null;
        goToEntries();
        if (!data.entries.length) {
          data.tags = [];
          data.nextEntryId = 1;
        }
      }
    }
  }
}

function showConfirmationModal(event) {
  $modalConfirmation.className = 'confirmation-modal-container';
}

function detectEntryClicks(event) {
  if (event.target.matches('.edit-icon')) {
    showEntryForm();
    var id = parseInt(event.target.closest('[data-entry-id]').dataset.entryId);

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
    var span = event.target.previousElementSibling;
    span.textContent = '';
    span.className = 'tag-input';
    event.target.className = 'hidden';
    span.focus();
    span.addEventListener('keypress', createTag);
    span.addEventListener('blur', checkEmptySpan);
  }
}

function checkEmptySpan(event) {
  if (event.target.textContent === '') {
    event.target.className = 'hidden';
    event.target.nextElementSibling.className = 'add tag';
  }
}

function createTag(event) {
  var tag;
  var tagParent = event.target.parentElement.parentElement;
  var randomColor = getDarkColor();
  var id = parseInt(event.target.closest('li').dataset.entryId);
  var tagExists = false;
  if (event.key === 'Enter') {
    event.preventDefault();
    event.target.className = 'tag-input hidden';
    tag = createTagElements(event.target.textContent);
    for (var tagInd = 0; tagInd < data.tags.length; tagInd++) {
      if (data.tags[tagInd].text === event.target.textContent) {
        tagExists = true;
        break;
      }
    }
    if (tagExists) {
      tag.style.backgroundColor = data.tags[tagInd].color;
    } else {
      tag.style.backgroundColor = randomColor;
      for (var i = 0; i < data.entries.length; i++) {
        if (data.entries[i].id === id) {
          data.entries[i].tags.push({
            color: randomColor,
            text: event.target.textContent
          });
          data.tags.push({
            color: randomColor,
            text: event.target.textContent
          });
          break;
        }
      }
    }

    tagParent.appendChild(tag);
    event.target.parentElement.lastElementChild.className = 'add tag';
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

function createTagElements(text) {
  return elementCreator('p', { innerText: text, class: 'tag' });
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

function goToEntries(event) {
  $entryForm.className = 'form-container hidden';
  $entries.className = '';
  data.view = 'entries';
  showEntries();
}

function showEntries() {
  var li = $ul.lastElementChild;
  var entryElement;
  var tagContainer;
  var $tag;

  while (li) {
    $ul.removeChild(li);
    li = $ul.lastElementChild;
  }

  data.entries.forEach(entry => {
    if (entry) {
      entryElement = createEntryElements(entry);
      if (entry.tags) {
        tagContainer = entryElement.querySelector('.tag-container');
        entry.tags.forEach(tag => {
          $tag = createTagElements(tag.text);
          $tag.style.backgroundColor = tag.color;
          tagContainer.appendChild($tag);
        });
      }
      $ul.appendChild(entryElement);
    }
  });
}

function submitEntryForm(event) {
  event.preventDefault();

  if (!data.editing) {
    var formDataObj = {};
    formDataObj.title = $form.elements.title.value;
    formDataObj.url = $form.elements.url.value;
    formDataObj.notes = $form.elements.notes.value;
    formDataObj.id = data.nextEntryId;
    formDataObj.tags = [];
    data.nextEntryId++;
    data.entries.unshift(formDataObj);
    $entryImage.setAttribute('src', 'images/placeholder-image-square.jpg');
  } else {
    data.editing.title = $form.elements.title.value;
    data.editing.url = $form.elements.url.value;
    data.editing.notes = $form.elements.notes.value;
  }

  $deleteEntry.className = 'delete-entry hidden';
  $form.reset();
  goToEntries();
}

// Sample image: https://uploads0.wikiart.org/00339/images/leonardo-da-vinci/mona-lisa-c-1503-1519.jpg
// Sample image 2: https://upload.wikimedia.org/wikipedia/en/7/7d/Harold_%28film%29.jpg
function updateSrc(event) {
  if (isValidUrl(event.target.value)) {
    $entryImage.setAttribute('src', event.target.value);
  }
}

// Grabbed a url validator off stackoverflow https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
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

function createEntryElements(entry) {
  var $li = elementCreator('li', { class: 'row', 'data-entry-id': entry.id }, [
    elementCreator('div', { class: 'column-half' }, [
      elementCreator('img', {
        class: 'entry-image image-shrink',
        src: entry.url,
        alt: `Entry Image ${entry.id}`
      })
    ]),
    elementCreator('div', { class: 'column-half pos-rel mh-330px of-hidden' }, [
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
          elementCreator('p', { innerText: 'Tag +', class: 'add tag' })
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
