import { execSync } from 'child_process';
import { logger } from './logger';

export function pasteClipboard(): void {
  try {
    if (process.platform === 'darwin') {
      execSync(
        'osascript -e "tell application \"System Events\" to keystroke \"v\" using command down"'
      );
    } else if (process.platform === 'win32') {
      execSync(
        'powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys(\"^v\")"'
      );
    } else {
      execSync('xdotool key --clearmodifiers ctrl+v');
    }
  } catch (err) {
    logger.error(`autopaste error: ${err}`);
  }
}
