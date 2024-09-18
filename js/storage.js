console.log('storage.js is executing');

export function loadFromLocalStorage() {
    console.log('Loading data from local storage');
    const savedData = localStorage.getItem('programData');
    if (savedData) {
        console.log('Data found in local storage');
        const parsedData = JSON.parse(savedData);
        // audioFileのメタデータを実際のFileオブジェクトに変換する処理は省略
        return parsedData;
    } else {
        console.log('No data found in local storage');
        return [];
    }
}

export function saveToLocalStorage(programData) {
    console.log('Saving data to local storage', programData);
    const dataToSave = programData.map(item => {
        if (item.audioFile) {
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
