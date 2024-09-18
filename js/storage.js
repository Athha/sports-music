console.log('storage.js is executing');

export function loadFromLocalStorage() {
    console.log('Loading data from local storage');
    const savedData = localStorage.getItem('programData');
    if (savedData) {
        console.log('Data found in local storage');
        try {
            const parsedData = JSON.parse(savedData);
            return Array.isArray(parsedData) ? parsedData : [];
        } catch (error) {
            console.error('Error parsing data from local storage:', error);
            return [];
        }
    } else {
        console.log('No data found in local storage');
        return [];
    }
}

export function saveToLocalStorage(programData) {
    console.log('Saving data to local storage', programData);
    if (!programData || !Array.isArray(programData)) {
        console.error('Invalid program data provided to saveToLocalStorage');
        return;
    }
    const dataToSave = programData.map(item => {
        if (item && item.audioFile) {
            return {
                ...item,
                audioFile: {
                    name: item.audioFile.name,
                    type: item.audioFile.type,
                    lastModified: item.audioFile.lastModified
                }
            };
        }
        return item;
    });
    localStorage.setItem('programData', JSON.stringify(dataToSave));
    console.log('Data saved to local storage');
}

console.log('storage.js execution completed');
