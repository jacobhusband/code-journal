/* exported data */

window.addEventListener('beforeunload', addToLocalStorage);
window.addEventListener('pagehide', addToLocalStorage);

function addToLocalStorage(event) {
  localStorage.setItem('data', JSON.stringify(data));
}

var badData = false;
var grabbedData = JSON.parse(localStorage.getItem('data'));

var data = {
  view: 'entry-form',
  entries: [],
  editing: null,
  nextEntryId: 1,
  tags: [],
  entriesView: 'large-entry'
};

for (var key in grabbedData) {
  if (
    data[key] === undefined ||
    Object.keys(data).length !== Object.keys(grabbedData).length
  ) {
    badData = true;
    break;
  }
}

if (!badData) {
  data = grabbedData;
}
