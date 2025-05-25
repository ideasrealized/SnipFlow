import { Tray, Menu, BrowserWindow, app, ipcMain, nativeImage } from 'electron';
import { join } from 'path';

interface TrayOptions {
  main: BrowserWindow;
  overlay: BrowserWindow;
}

export function createTray({ main, overlay }: TrayOptions): Tray {
  const iconBase = join(__dirname, '../assets/tray');
  let iconPath: string;
  if (process.platform === 'darwin') {
    iconPath = join(iconBase, 'iconTemplate.png');
  } else if (process.platform === 'win32' || process.platform === 'linux') {
    iconPath = join(iconBase, 'iconWin.png');
  } else {
    iconPath = join(iconBase, 'icon.png');
  }

  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);
  tray.setToolTip('SnipFlow');

  const toggleOverlay = () => {
    if (overlay.isVisible()) {
      overlay.hide();
    } else {
      overlay.showInactive();
    }
  };

  const showMenu = () => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Show SnipFlow',
        click: () => {
          main.show();
          main.focus();
        },
      },
      {
        label: overlay.isVisible() ? 'Hide Overlay' : 'Show Overlay',
        click: toggleOverlay,
      },
      {
        label: 'Settings…',
        click: () => {
          main.webContents.send('nav:openSettings');
        },
      },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]);
    tray.popUpContextMenu(menu);
  };

  tray.on('click', event => {
    if (process.platform === 'darwin' && event.ctrlKey) {
      showMenu();
    } else {
      toggleOverlay();
    }
  });
  tray.on('right-click', showMenu);

  ipcMain.handle('tray:toggleOverlay', () => toggleOverlay());

  app.on('quit', () => {
    tray.destroy();
  });

  return tray;
} 