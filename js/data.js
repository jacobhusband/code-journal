/* exported data */

var data = {
  view: 'entry-form',
  entries: [],
  editing: null,
  nextEntryId: 1
};

var $form = document.querySelector('form');
var $entryImage = document.querySelector('.entry-image');

pushLocalStorage();

$form.addEventListener('submit', submitEntryForm);

window.addEventListener('beforeunload', addToLocalStorage);

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

function addToLocalStorage(event) {
  if (data) {
    localStorage.setItem('data', JSON.stringify(data));
  }
}

function pushLocalStorage() {
  data = JSON.parse(localStorage.getItem('data'));
}
