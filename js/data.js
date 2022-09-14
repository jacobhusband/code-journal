/* exported data */

var data = {
  view: 'entry-form',
  entries: [],
  editing: null,
  nextEntryId: 1,
  tags: []
};

if (localStorage.getItem('data')) {
  pushLocalStorage();
}

window.addEventListener('beforeunload', addToLocalStorage);

function addToLocalStorage(event) {
  localStorage.setItem('data', JSON.stringify(data));
}

function pushLocalStorage() {
  data = JSON.parse(localStorage.getItem('data'));
}
