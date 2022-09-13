var $form = document.querySelector('form');
var $entryImage = document.querySelector('.entry-image');
var $photoUrl = document.querySelector('.photo-url');
var $ul = document.querySelector('ul.entry-list');

$form.addEventListener('submit', submitEntryForm);
$photoUrl.addEventListener('input', updateSrc);

var entry = createEntryElements({
  title: 'Mona Lisa',
  url: 'https://uploads0.wikiart.org/00339/images/leonardo-da-vinci/mona-lisa-c-1503-1519.jpg',
  notes: 'Hiba Diba Hoppa Hoopa'
});

$ul.appendChild(entry);

function submitEntryForm(event) {
  event.preventDefault();
  var formDataObj = {};

  formDataObj.title = $form.elements.title.value;
  formDataObj.url = $form.elements.url.value;
  formDataObj.notes = $form.elements.notes.value;
  formDataObj.id = data.nextEntryId;
  data.nextEntryId++;
  data.entries.unshift(formDataObj);
  $entryImage.setAttribute('src', 'images/placeholder-image-square.jpg');
  $form.reset();
}

// Sample image: https://uploads0.wikiart.org/00339/images/leonardo-da-vinci/mona-lisa-c-1503-1519.jpg
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
  var $li = elementCreator('li', { class: 'row' }, [
    elementCreator('div', { class: 'column-half' }, [
      elementCreator('img', {
        class: 'entry-image image-shrink',
        src: entry.url,
        alt: `Entry Image ${entry.id}`
      })
    ]),
    elementCreator('div', { class: 'column-half' }, [
      elementCreator('h3', { innerText: entry.title }),
      elementCreator('p', {
        innerText: entry.notes
      })
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
