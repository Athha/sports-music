import { programData, updateProgramData } from '/sports-music/js/app.js';

export function exportProgramData() {
    const dataToExport = JSON.stringify(programData, null, 2);
    const blob = new Blob([dataToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'program_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importProgramData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                updateProgramData(importedData);
                alert('プログラムデータを正常にインポートしました。');
            } catch (error) {
                console.error('データのインポート中にエラーが発生しました:', error);
                alert('データのインポートに失敗しました。ファイルが正しい形式であることを確認してください。');
            }
        };
        reader.readAsText(file);
    }
}
