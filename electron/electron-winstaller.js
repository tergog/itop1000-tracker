const electronInstaller = require('electron-winstaller');

// NB: Use this syntax within an async function, Node does not have support for
//     top-level await as of Node 12.
async function createInstaller() {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: './itop1000_tracker-win32-x64',
      outputDirectory: './win32-installers',
      authors: 'ITOP1000 (Exabait)',
      exe: 'itop1000_tracker.exe'
    });
    console.log('It worked!');
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }
}

createInstaller();

