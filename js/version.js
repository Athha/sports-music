console.log('version.js is executing');

export const version = '1.2.7-indexeddb';

export function displayVersion() {
    console.log('Displaying version:', version);
    const versionElement = document.getElementById('app-version');
    if (versionElement) {
        versionElement.textContent = version;
        console.log('Version displayed successfully');
    } else {
        console.error('Element with id "app-version" not found');
    }
}

console.log('version.js execution completed');
