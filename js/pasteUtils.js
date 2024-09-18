import { programData, updateProgramData } from './app.js';

export function handleOrderPaste(event, index) {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const rows = pastedData.trim().split('\n');
    
    const newData = rows.map(row => {
        const [order, program, memo] = row.split('\t');
        return { 
            order: order ? order.trim() : '', 
            program: program ? program.trim() : '', 
            memo: memo ? memo.trim() : '' 
        };
    });

    // 既存のデータを更新または新しいデータを追加
    newData.forEach((item, i) => {
        const currentIndex = index + i;
        if (currentIndex < programData.length) {
            // 既存のデータを更新
            if (!programData[currentIndex].isSection) {
                programData[currentIndex].order = item.order || programData[currentIndex].order;
                programData[currentIndex].program = item.program || programData[currentIndex].program;
                programData[currentIndex].memo = item.memo || programData[currentIndex].memo;
            }
        } else {
            // 新しいデータを追加
            programData.push({
                order: item.order || '',
                program: item.program || '',
                memo: item.memo || '',
                audioFile: null,
                isSection: false
            });
        }
    });

    updateProgramData(programData);
}
