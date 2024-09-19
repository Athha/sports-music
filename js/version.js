console.log('version.js is executing');

const APP_VERSION = "1.2.1";

export function displayVersion() {
    console.log('Displaying version:', APP_VERSION);
    const versionElement = document.getElementById('app-version');
    if (versionElement) {
        versionElement.textContent = APP_VERSION;
        console.log('Version displayed successfully');
    } else {
        console.error('Element with id "app-version" not found');
    }
}

console.log('version.js execution completed');
