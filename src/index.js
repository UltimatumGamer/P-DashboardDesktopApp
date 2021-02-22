const { app, BrowserWindow, autoUpdater, dialog } = require('electron');
const path = require('path');
const Store = require('./Store');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-data',
  defaults: {
 
  }
});

/*
https://www.electronjs.org/docs/tutorial/updates
https://github.com/vercel/hazel
*/
const server = 'https://p-dashboarddesktopapp.vercel.app'
const url = `${server}/update/${process.platform}/${app.getVersion()}`


autoUpdater.setFeedURL({ url })

setInterval(() => {
  autoUpdater.checkForUpdates()
}, 10000)

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Starte die Anwendung neu, um die Updates anzuwenden.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', message => {
  console.error('There was a problem updating the application')
  console.error(message)
})


const createWindow = async () => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  win.removeMenu()
  win.loadURL('https://dashboard.pedda.digital');
  const ses = win.webContents.session
  if (store.get('AuthToken') != null) await ses.cookies.set({ url: 'https://dashboard.pedda.digital', name: 'AuthToken', value: store.get('AuthToken') });

  ses.cookies.on("changed", async () => {
    let authCookie = await ses.cookies.get({ url: 'https://dashboard.pedda.digital' })
    authCookie = authCookie.find(obj => { return obj.name === 'AuthToken' })
    console.log(authCookie != null)
    if (authCookie != null) {
      store.set('AuthToken', authCookie.value)
    } else {
      store.delete('AuthToken')
    }
  })

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
