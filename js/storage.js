export function saveToLocalStorage() {
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
}
