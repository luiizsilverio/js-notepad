const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

app.disableHardwareAcceleration(); // desativa o hardware acceleration, evitando log de erros

const isMac = process.plataform === "darwin";
let file = {}

let mainWindow = null;

// JANELA PRINCIPAL
async function createWindow() {
	mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
	});

  await mainWindow.loadURL(path.join(__dirname, "src", "pages", "editor", "index.html"));

  createNewFile();

  ipcMain.on('update-content', (event, data) => {
    file.content = data;
  })
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (!isMac) app.quit();
})

app.on("activate", () => {
  // Necessário para Mac
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})

// TEMPLATE MENU
const templateMenu = [
  {
    label: 'Arquivo',
    submenu: [
      {
        label: '➕ Novo',
        accelerator: 'Ctrl+N',
        click() {
          createNewFile();
        }
      },
      {
        label: '📂 Abrir',
        accelerator: 'Alt+A',
        click() {
          openFile();
        }
      },
      {
        label: '💾 Salvar',
        accelerator: 'Ctrl+S',
        click() {
          saveFile();
        }
      },
      {
        label: '💾 Salvar como',
        accelerator: 'Ctrl+Shift+S',
        click() {
          saveFileAs();
        }
      },
      {
        label: '😔 Fechar',
        accelerator: 'Ctrl+F',
        role: 'close'
      }
    ]
  },
  {
    label: 'Editar',
    submenu: [
      {
        label: '↩ Desfazer',
        role: 'undo'
      },
      {
        label: '↪ Refazer',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Copiar',
        role: 'copy'
      },
      {
        label: 'Recortar',
        role: 'cut'
      },
      {
        label: 'Colar',
        role: 'paste'
      }
    ]
  },
  {
    label: 'Exibir',
    submenu: [
      {
        label: '🤓 Painel do Desenvolvedor',
        role: 'toggleDevTools'
      },
      {
        label: '❓ Ajuda',
        click() {
          shell.openExternal('https://github.com/luiizsilverio/js-notepad');
        }
      }
    ]
  }
]

// MENU
const menu = Menu.buildFromTemplate(templateMenu);

Menu.setApplicationMenu(menu);

// CRIAR NOVO ARQUIVO
function createNewFile() {
  file = {
    name: 'novo-arquivo.txt',
    content: '',
    saved: false,
    path: path.join(app.getPath('documents'), 'novo-arquivo.txt')
  }

  // mainWindow.webContents.send('set-file', file);
  mainWindow.send('set-file', file);
}

// SALVAR COMO
async function saveFileAs() {
  let dialogFile = await dialog.showSaveDialog({
    defaultPath: file.path,
    center: true,
  })

  if (dialogFile.canceled) return false;
  if (!dialogFile.filePath) return false;

  salvaArquivo(dialogFile.filePath);
}

function salvaArquivo(filePath) {
  try {
    fs.writeFile(filePath, file.content, (err) => {
      if (err) throw err;

      file.path = filePath;
      file.saved = true;
      file.name = path.basename(filePath);
    })

    mainWindow.send('set-file', file);

  } catch(err) {
    console.log(err);
  }
}

function saveFile() {
  if (file.saved) {
    return salvaArquivo(file.path);
  }

  return saveFileAs();
}

async function openFile() {
  let dialogFile = await dialog.showOpenDialog({
    defaultPath: file.path,
    center: true,
  })

  if (dialogFile.canceled) return false;

  file = {
    name: path.basename(dialogFile.filePaths[0]),
    content: leArquivo(dialogFile.filePaths[0]),
    saved: true,
    path: dialogFile.filePaths[0]
  }

  mainWindow.send('set-file', file);
}

function leArquivo(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  }
  catch (err) {
    console.log(err);
    return '';
  }
}
