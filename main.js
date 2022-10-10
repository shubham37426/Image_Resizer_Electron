const {app , BrowserWindow, Menu , ipcMain, shell} = require("electron");
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img')
const isMac = process.platform==='darwin'
process.env.NODE_ENV ='production';
const isDev = process.env.NODE_ENV !='production';
// Create main window
let mainWindow;
const createMainWindow = ()=>{
  mainWindow = new BrowserWindow({
        title:'Image Resizer',
        width:isDev?800: 500,
        height:isDev?500: 600,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js'),
        },
        
    })

    // open devtools for development environment
    if(isDev){
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile(path.join(__dirname , './renderer/index.html'));
    // url test
    // mainWindow.loadURL('https://www.electronjs.org/docs/latest/tutorial/quick-start');
}
const createAboutWindow = ()=>{
  const aboutWindow = new BrowserWindow({
      title:'Image Resizer',
      width:300,
      height:300,
      
  })
  // open devtools for development environment
  aboutWindow.loadFile(path.join(__dirname , './renderer/about.html'));
}

      // -------------------------------Menu
  //   const menutemplate = [
  //     {
  //        label: 'Edit',
  //        submenu: [
  //           {
  //              role: 'undo'
  //           },
  //           {
  //              role: 'redo'
  //           },
  //           {
  //              type: 'separator'
  //           },
  //           {
  //              role: 'cut'
  //           },
  //           {
  //              role: 'copy'
  //           },
  //           {
  //              role: 'paste'
  //           }
  //        ]
  //     },
      
  //     {
  //        label: 'View',
  //        submenu: [
  //           {
  //              role: 'reload'
  //           },
  //           {
  //              role: 'toggledevtools'
  //           },
  //           {
  //              type: 'separator'
  //           },
  //           {
  //              role: 'resetzoom'
  //           },
  //           {
  //              role: 'zoomin'
  //           },
  //           {
  //              role: 'zoomout'
  //           },
  //           {
  //              type: 'separator'
  //           },
  //           {
  //              role: 'togglefullscreen'
  //           }
  //        ]
  //     },
      
  //     {
  //        role: 'window',
  //        submenu: [
  //           {
  //              role: 'minimize'
  //           },
  //           {
  //              role: 'close'
  //           }
  //        ]
  //     },
      
  //     {
  //        role: 'help',
  //        submenu: [
  //           {
  //              label: 'Learn More'
  //           }
  //        ]
  //     }
  //  ]
  const menutemplate = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                label: 'About',
                click: createAboutWindow,
              },
            ],
          },
        ]
      : []),
  {
    role:'fileMenu',
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
]
//App is ready
app.whenReady().then(() => {
  createMainWindow()
//Implement Menu
const menu = Menu.buildFromTemplate(menutemplate)
Menu.setApplicationMenu(menu)

// Remove variable from memory
mainWindow.on('closed', () => (mainWindow = null));
})
// respond to ipcRenderer
ipcMain.on('image:resize' ,(e , options)=>{
  options.dest = path.join(os.homedir(), 'imageresizer')
  resizeImage(options)
})
async function resizeImage({imgPath, width , height ,dest}){
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // Get filename
    const filename = path.basename(imgPath);

    // Create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Write the file to the destination folder
    fs.writeFileSync(path.join(dest, filename), newPath);
    //send success alert
    mainWindow.webContents.send('image:done')
    // open dest folder
    shell.openPath(dest)
  } catch (error) {
    console.error();
  }
}

//  close application when all windows closed
  app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })
  //  Open a window if none are open (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
