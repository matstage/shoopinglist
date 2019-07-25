const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain, ipcRenderer} = electron;

//Set env
process.env.NODE_ENV = 'production';


let mainWindow;
let addWindow;


// Listen for the app to be ready
app.on('ready', function(){
    // Create the main window
    mainWindow = new BrowserWindow(
        {
            webPreferences: {nodeIntegration: true}
        }
    );
    // Load HTML file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Close all when closing main window
    mainWindow.on('closed', function(){
        app.quit();
    });


    //Build menu from Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
 });

    //Handle create  add Window
function createAddWindow(){
    // Create the new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {nodeIntegration: true}
    });

    // Load HTML file into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Set addWindow to null for garbage collection
    addWindow.on('close', function(){
        await(2);
        addWindow = null;
    });

    // Catch item add
    ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
        addWindow.close();
    });
}

const mainMenuTemplate = [

    {
        label:'File',
        submenu:[
            {
                label: 'Add item',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+A' : 'Ctrl+Shift+A',
                click(){
                    createAddWindow();
                }
            },
        {
            label: 'Remove Item'
        },
        {
            label: 'Clear Items',
            click(){
                mainWindow.webContents.send('item:clear');
            }
        },
        {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click(){
                 app.quit();
            }
        }
        ]

    }
];

// If mac, add empty object to window
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}
