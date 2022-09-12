var $form = document.querySelector('form');
var $photoUrl = $form.querySelector('.photo-url');
var $entryImage = document.querySelector('.entry-image');
var formDataObj = {};

$photoUrl.addEventListener('input', updateSrc);

$form.addEventListener('submit', submitEntryForm);

function updateSrc(event) {
  $entryImage.setAttribute('src', event.target.value);
}

function submitEntryForm(event) {
  event.preventDefault();

  formDataObj.title = $form.elements.title.value;
  formDataObj.url = $form.elements.url.value;
  formDataObj.notes = $form.elements.notes.value;
  formDataObj.id = data.nextEntryId;
  data.nextEntryId++;
  data.entries.push(formDataObj);
  $entryImage.setAttribute('src', 'images/placeholder-image-square.jpg');
  $form.reset();
}
