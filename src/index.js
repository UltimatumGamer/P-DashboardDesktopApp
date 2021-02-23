const { app, BrowserWindow, autoUpdater, dialog } = require('electron');
const contextMenu = require('electron-context-menu');
const path = require('path');
const Store = require('./Store');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

/*
app.setUserTasks([
  {
    program: process.execPath,
    arguments: "--new-tab",
    iconIndex: 0,
    title: 'Report Bug',
    description: 'Report a Bug via Pedda.Digital.'
  }
])
*/

// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-data',
  defaults: {
    windowBounds: { width: 800, height: 600 }
  }
});

/*
https://www.electronjs.org/docs/tutorial/updates
https://github.com/vercel/hazel
*/
const server = 'https://p-dashboarddesktopapp.vercel.app'
const url = `${server}/update/${process.platform}/${app.getVersion()}`


autoUpdater.setFeedURL({ url })

let updater = setInterval(() => {
  autoUpdater.checkForUpdates()
}, 10000)

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Neustarten', 'Später'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'Eine neue Version wurde heruntergeladen. Starte die Anwendung neu, um die Updates anzuwenden.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', message => {
  clearInterval(updater)
  console.error('There was a problem updating the application')
  console.error(message)
})

const createWindow = async () => {
  if (!store.get('position')) store.set('position', { x: 100, y: 100 })
  if (!store.get('windowBounds')) store.set('windowBounds', { width: 800, height: 600 })
  let { width, height } = store.get('windowBounds');
  let { x, y } = store.get('position');

  // Create the browser window.
  const win = new BrowserWindow({
    titleBarStyle: 'hidden',
    minWidth: 400,
    minHeight: 400,
    width: width,
    height: height,
    x: x,
    y: y,
    icon: __dirname + '/assets/app/icon/icon.ico',
  });


  contextMenu({
    prepend: (defaultActions, parameters, browserWindow) => [
      {
        label: 'Reset Window Size',
        click: () => {
          win.setPosition(100, 100)
          win.setFullScreen(false)
          win.setSize(800, 600)
          store.set('position', { x: 100, y: 100 });
          store.set('windowBounds', { width: 800, height: 600 });
        }

      },
      {
        label: 'Return to Start',
        click: () => {
          win.loadURL('https://dashboard.pedda.digital');
        }
      },
      {
        type: 'separator',
      },
      {
        role: 'zoomIn',
      },
      {
        role: 'zoomOut',
      },
      {
        type: 'separator',
      },
      {
        role: 'forceReload',
      },
,
      {
        label: 'Search Google for “{selection}”',
        // Only show it when right-clicking text
        visible: parameters.selectionText.trim().length > 0,
        click: () => {
          shell.openExternal(`https://google.com/search?q=${encodeURIComponent(parameters.selectionText)}`);
        }
      },
    ]
  });

  // and load the index.html of the app.
  win.removeMenu()
  win.loadURL('https://dashboard.pedda.digital');
  const ses = win.webContents.session
  if (store.get('AuthToken') != null) await ses.cookies.set({ url: 'https://dashboard.pedda.digital', name: 'AuthToken', value: store.get('AuthToken') });

  ses.cookies.on("changed", async () => {
    let authCookie = await ses.cookies.get({ url: 'https://dashboard.pedda.digital' })
    authCookie = authCookie.find(obj => { return obj.name === 'AuthToken' })
    if (authCookie != null) {
      store.set('AuthToken', authCookie.value)
    } else {
      store.delete('AuthToken')
    }

  })





  win.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = win.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
  });
  win.on('move', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let xy = win.getPosition();
    // Now that we have them, save them using the `set` method.
    store.set('position', { x: xy[0], y: xy[1] });
  });


  // Open the DevTools.
  //win.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
