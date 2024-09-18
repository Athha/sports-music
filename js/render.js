import { programData } from '/sports-music/js/app.js';
import { handleFileSelect, toggleMusic } from '/sports-music/js/audioUtils.js';
import { addProgram, addSection, deleteProgram, updateProgram } from '/sports-music/js/programUtils.js';
import { handleOrderPaste } from '/sports-music/js/pasteUtils.js';

export function renderProgramTable() {
    const tableBody = document.querySelector('#program-table tbody');
    tableBody.innerHTML = '';
    
    programData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', index);
        row.setAttribute('data-is-section', item.isSection);
        
        if (item.isSection) {
            row.innerHTML = `
                <td class="order-column">
                    <span class="drag-handle">≡</span>
                </td>
                <td colspan="5">
                    <input type="text" value="${item.program}" onchange="updateProgram(${index}, 'program', this.value)" placeholder="セクション名">
                </td>
                <td>
                    <span class="add-program" onclick="addProgram(${index})">＋</span>
                    <span class="delete-program" onclick="deleteProgram(${index})">✖</span>
                </td>
            `;
        } else {
            // ... 通常のプログラム行の HTML （変更なし）
        }
        
        tableBody.appendChild(row);
    });
    
    updateAudioStatus();
}

function updateAudioStatus() {
    programData.forEach((item, index) => {
        if (!item.isSection) {
            if (item.audioFile) {
                updateStatus(index, 'local');
            } else {
                updateStatus(index, 'not-found');
            }
        }
    });
}

function updateStatus(index, status) {
    const statusElement = document.getElementById(`status-${index}`);
    if (statusElement) {
        if (status === 'local') {
            statusElement.textContent = 'ローカル';
            statusElement.className = 'status-local';
        } else if (status === 'not-found') {
            statusElement.textContent = '未選択';
            statusElement.className = 'status-not-found';
        } else if (status === 'reselect') {
            statusElement.textContent = '要再選択';
            statusElement.className = 'status-reselect';
        }
    }
}

// グローバルスコープに関数を公開
window.updateProgram = (index, field, value) => updateProgram(index, field, value);
window.addProgram = (index) => addProgram(index);
window.addSection = (index) => addSection(index);
window.deleteProgram = (index) => deleteProgram(index);
window.handleFileSelect = (event, index) => handleFileSelect(event, index);
window.toggleMusic = (index) => toggleMusic(index);
window.handleOrderPaste = (event, index) => handleOrderPaste(event, index);
