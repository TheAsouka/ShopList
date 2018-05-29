const electron = require("electron");
const url = require("url");
const path = require("path");

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for the app to be ready
app.on("ready", function(){
    //Create new window
    mainWindow = new BrowserWindow({});

    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainwindow.html"),
        protocol: "file:",
        slashes: true
    }));

    //Quit all the apps when closed
    mainWindow.on("close", function(){
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert the menu
    Menu.setApplicationMenu(mainMenu);
    
});



//Handle create add window
function createAddWindow(){
    //Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 300,
        title: "Add shopist item"
    });

    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addwindow.html"),
        protocol: "file:",
        slashes: true
}));

    // Garbage collection handle
    addWindow.on("closed", function(){
        addWindow = null;
    });

}

// Catch item:add
ipcMain.on('item:add', function(e, item){
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Add Item",
                click(){
                    createAddWindow();
                }
            },
            {
                label: "Clear Items",
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: "Quit",
                
                // Permits to close w/ a shortcut
                /* if process.platform is darwin:
                    use "Cmd+Q" as shortcut
                   else:
                    use "Ctrl+Q" 
                WHAT THE FUCK IS THIS NOTATION , truc de hipster obligé.
                */
                accelerator: process.platform == 'darwin' ? "Command+Q" : "Ctrl+Q", //That notation
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// if mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//add developer tools if not in prod
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: process.platform == 'darwin' ? "Command+I" : "Ctrl+I",
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