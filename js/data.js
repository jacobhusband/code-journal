/* exported data */

var data = {
  view: 'entry-form',
  entries: [],
  editing: null,
  nextEntryId: 1
};

var $form = document.querySelector('form');
var $photoUrl = $form.querySelector('.photo-url');
var $entryImage = document.querySelector('.entry-image');

pushLocalStorage();

$photoUrl.addEventListener('input', updateSrc);

$form.addEventListener('submit', submitEntryForm);

window.addEventListener('beforeunload', addToLocalStorage);

// Sample image: https://uploads0.wikiart.org/00339/images/leonardo-da-vinci/mona-lisa-c-1503-1519.jpg
function updateSrc(event) {
  if (isValidUrl(event.target.value)) {
    $entryImage.setAttribute('src', event.target.value);
  }
}

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

function addToLocalStorage(event) {
  localStorage.setItem('data', JSON.stringify(data));
}

function pushLocalStorage() {
  data = JSON.parse(localStorage.getItem('data'));
}
