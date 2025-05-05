console.log('storage.js is executing');

const DB_NAME = 'sportsMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'programData';
const FILE_STORE_NAME = 'audioFiles';

// IndexedDBの初期化
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
                db.createObjectStore(FILE_STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

// ファイルをBlobとして保存
async function saveFileToIndexedDB(file) {
    console.log('saveFileToIndexedDB: 開始', {
        name: file.name,
        type: file.type,
        size: file.size
    });
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FILE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(FILE_STORE_NAME);
        const fileId = Date.now().toString();
        
        // ファイルをBlobとして保存
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                console.log('saveFileToIndexedDB: ファイル読み込み完了', {
                    fileId,
                    dataSize: e.target.result.byteLength
                });
                const request = store.put({
                    id: fileId,
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                });

                request.onsuccess = () => {
                    console.log('saveFileToIndexedDB: 保存成功', fileId);
                    resolve(fileId);
                };
                request.onerror = () => {
                    console.error('saveFileToIndexedDB: 保存エラー', request.error);
                    reject(request.error);
                };
            } catch (error) {
                console.error('saveFileToIndexedDB: 処理エラー', error);
                reject(error);
            }
        };
        reader.onerror = () => {
            console.error('saveFileToIndexedDB: ファイル読み込みエラー', reader.error);
            reject(reader.error);
        };
        reader.readAsArrayBuffer(file);
    });
}

// ファイルをBlobとして読み込み
async function loadFileFromIndexedDB(fileId) {
    console.log('loadFileFromIndexedDB: 開始', fileId);
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([FILE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(FILE_STORE_NAME);
        const request = store.get(fileId);

        request.onsuccess = () => {
            if (request.result) {
                console.log('loadFileFromIndexedDB: データ取得成功', {
                    fileId,
                    name: request.result.name,
                    type: request.result.type,
                    dataSize: request.result.data.byteLength
                });
                const blob = new Blob([request.result.data], { type: request.result.type });
                const file = new File([blob], request.result.name, { type: request.result.type });
                console.log('loadFileFromIndexedDB: ファイル復元完了', {
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                resolve(file);
            } else {
                console.log('loadFileFromIndexedDB: データなし', fileId);
                resolve(null);
            }
        };
        request.onerror = () => {
            console.error('loadFileFromIndexedDB: エラー', request.error);
            reject(request.error);
        };
    });
}

export async function saveToLocalStorage(programData) {
    console.log('Saving data to IndexedDB', programData);
    if (!programData || !Array.isArray(programData)) {
        console.error('Invalid program data provided to saveToLocalStorage');
        return;
    }

    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // 既存のデータをクリア
        await new Promise((resolve, reject) => {
            const clearRequest = store.clear();
            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject(clearRequest.error);
        });

        // 新しいデータを保存
        const savePromises = programData.map(async (item) => {
            if (item && item.audioFile && item.audioFile instanceof File) {
                const fileId = await saveFileToIndexedDB(item.audioFile);
                return {
                    ...item,
                    audioFileId: fileId
                };
            }
            return item;
        });

        const processedData = await Promise.all(savePromises);
        await new Promise((resolve, reject) => {
            const request = store.add({ data: processedData });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log('Data saved to IndexedDB');
    } catch (error) {
        console.error('Error saving to IndexedDB:', error);
    }
}

export async function loadFromLocalStorage() {
    console.log('Loading data from IndexedDB');
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        const result = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (result.length > 0) {
            const programData = result[0].data;
            
            // ファイルデータを復元
            const processedData = await Promise.all(programData.map(async (item) => {
                if (item.audioFileId) {
                    const file = await loadFileFromIndexedDB(item.audioFileId);
                    if (file) {
                        return {
                            ...item,
                            audioFile: file
                        };
                    }
                }
                return item;
            }));

            return processedData;
        }
        return [];
    } catch (error) {
        console.error('Error loading from IndexedDB:', error);
        return [];
    }
}

// プログラムデータをエクスポート用に変換
export async function prepareForExport(programData) {
    if (!programData || !Array.isArray(programData)) {
        console.error('Invalid program data provided to prepareForExport');
        return null;
    }

    try {
        const exportData = await Promise.all(programData.map(async (item) => {
            if (item && item.audioFile && item.audioFile instanceof File) {
                const fileData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve({
                        name: item.audioFile.name,
                        type: item.audioFile.type,
                        data: e.target.result
                    });
                    reader.readAsArrayBuffer(item.audioFile);
                });

                return {
                    ...item,
                    audioFile: fileData
                };
            }
            return item;
        }));

        return exportData;
    } catch (error) {
        console.error('Error preparing data for export:', error);
        return null;
    }
}

// インポートしたデータを復元
export async function restoreFromImport(importData) {
    console.log('restoreFromImport: 開始', importData);
    if (!importData || !Array.isArray(importData)) {
        console.error('Invalid import data provided to restoreFromImport');
        return null;
    }

    try {
        const restoredData = await Promise.all(importData.map(async (item, index) => {
            console.log(`restoreFromImport: 項目${index}の処理開始`, item);
            if (item && item.audioFile && item.audioFile.data) {
                console.log(`restoreFromImport: 項目${index}のファイルデータ`, {
                    name: item.audioFile.name,
                    type: item.audioFile.type,
                    dataSize: item.audioFile.data.byteLength
                });
                const blob = new Blob([item.audioFile.data], { type: item.audioFile.type });
                const file = new File([blob], item.audioFile.name, { type: item.audioFile.type });
                console.log(`restoreFromImport: 項目${index}のファイル復元完了`, {
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                return {
                    ...item,
                    audioFile: file
                };
            }
            console.log(`restoreFromImport: 項目${index}にファイルデータなし`);
            return item;
        }));

        console.log('restoreFromImport: 全データの復元完了', restoredData);
        return restoredData;
    } catch (error) {
        console.error('Error restoring data from import:', error);
        return null;
    }
}

console.log('storage.js execution completed');
