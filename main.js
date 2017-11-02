const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const xml2js = require('xml2js');
const helper = require("./core/helper");
const DataStore = require("nedb");
const ejse = require('ejs-electron')

const db = new DataStore({ filename: 'database/data.db', autoload: true });

let mainController;
// init main window
let mainWindow;

app.on("ready", createMainWindow);

// Menutup aplikasi jika semua jendela ditutup
app.on('window-all-closed', () => {
    app.quit()
})

// ketika aplikasi aktif, maka window tidak terduplikat
app.on('activate', () => {
    // jika mainWindow tidak aktif, maka buat window
    if (mainWindow === null) {
        createWindow()
    }
    // jika masih aktif, do nothing :)
})

function createMainWindow(){
    // membuat browser window
    mainWindow = new BrowserWindow({
        icon: __dirname + '/assets/images/icon.ico', // path icon
        width: 800, // lebar window
        height: 500, // tinggi window
        webPreferences: {
            devTools: true,
            webSecurity: false
        }
    });

    // load view
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/views/app.ejs'),
        protocol: 'file:',
        slashes: true 
    }));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.setMenu(null);
    mainWindow.toggleDevTools();
   
    mainController = new helper.Controller(mainWindow);

    ipcMain.on("front:firstLoads", (e, r) => {
        fs.readdir(mainController.currentPath, (err, res) => {
            db.findOne({type: 'config'}, (err, config) => {
                mainController.setTheme(config.theme);
                mainController.readDir();
                mainController.setShowHidden(config.showHidden);
            });
        });
    });

    ipcMain.on("front:changeDir", (e, r) => {
        mainController.changeDir(r);
        mainController.readDir();
    });

    ipcMain.on("front:execFile", (e, path) => {
        mainController.execCmd(`"${path}"`);
    });

    ipcMain.on("front:backDir", () => {
        mainController.backDir();
    });

    ipcMain.on("front:nextDir", () => {
        mainController.nextDir();
    });
    
}

