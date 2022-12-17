const { ipcRenderer } = require("electron");

// ELEMENTS
const textarea = document.querySelector('#text');
const title = document.querySelector('#title');

ipcRenderer.on("set-file", (event, data) => {
  textarea.value = data.content;
  title.textContent = data.name +' | JS-NOTEPAD';
})

textarea.addEventListener('keyup', () => {
  handleChangeText();
})

function handleChangeText() {
  ipcRenderer.send("update-content", textarea.value);
}

