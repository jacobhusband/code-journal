/* exported data */

var data = {
  view: 'entry-form',
  entries: [],
  editing: null,
  nextEntryId: 1
};

pushLocalStorage();

window.addEventListener('beforeunload', addToLocalStorage);

function addToLocalStorage(event) {
  if (data) {
    localStorage.setItem('data', JSON.stringify(data));
  }
}

function pushLocalStorage() {
  data = JSON.parse(localStorage.getItem('data'));
}
