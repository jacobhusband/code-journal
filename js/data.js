/* exported data */

var data = {
  view: 'entry-form',
  entries: [],
  editing: null,
  nextEntryId: 1,
  tags: [],
  entriesView: 'large-entry'
};

var dataInside = JSON.parse(localStorage.getItem('data'));

if (
  dataInside.view &&
  dataInside.entriesView &&
  typeof dataInside.entries === 'object'
) {
  getLocalStorage();
}

window.addEventListener('beforeunload', addToLocalStorage);

function addToLocalStorage(event) {
  localStorage.setItem('data', JSON.stringify(data));
}

function getLocalStorage() {
  data = JSON.parse(localStorage.getItem('data'));
}
