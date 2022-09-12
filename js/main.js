var $form = document.querySelector('form');
var $photoUrl = $form.querySelector('.photo-url');
var $entryImage = document.querySelector('.entry-image');

$photoUrl.addEventListener('input', updateSrc);

// sample image: data:image/jpeg;base64,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

function updateSrc(event) {
  $entryImage.setAttribute('src', event.target.value);
}
