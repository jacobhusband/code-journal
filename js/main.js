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

function detectEntryClicks(event) {
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
    span.className = 'tag-input';
    event.target.className = 'hidden';
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
  var tags, reWord, searchWord, tagMatch;

  // Go through each data entry object

  for (var i = 0; i < data.entries.length; i++) {
    // If search string does not match a title or notes for a data entry object
    if (!re.test(data.entries[i].title) || !re.test(data.entries[i].notes)) {
      // Loop through each entry in the DOM
      for (var j = 0; j < $ul.children.length; j++) {
        tagMatch = false;
        // Loop through each tag in the DOM
        tags = $ul.children[j].querySelectorAll('p.created-tag');
        for (var k = 0; k < tags.length; k++) {
          // Loop through each word in the search bar
          for (var n = 0; n < words.length; n++) {
            reWord = new RegExp(words[n]);
            searchWord = tags[k].textContent.slice(
              0,
              tags[k].textContent.length - 1
            );
            if (reWord.test(searchWord)) {
              tagMatch = true;
              break;
            }
          }
          if (tagMatch) {
            break;
          }
        }
        // If the DOM entry matches the data entry
        if (
          parseInt($ul.children[j].dataset.entryId) === data.entries[i].id &&
          !tagMatch
        ) {
          // Hide that entry
          $ul.children[j].className = 'hidden';
        }
      }
    }

    // If search string matches a title or note for a data entry object
    if (re.test(data.entries[i].title) || re.test(data.entries[i].notes)) {
      // Loop through each entry in the DOM
      for (var p = 0; p < $ul.children.length; p++) {
        // If the DOM entry matches the data entry
        if (parseInt($ul.children[p].dataset.entryId) === data.entries[i].id) {
          // Make the DOM entry visible
          $ul.children[p].className = 'row';
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
  return elementCreator('p', { innerText: text, class: 'tag created-tag' }, [
    elementCreator('span', { class: 'del-tag hidden', innerText: 'x' })
  ]);
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
