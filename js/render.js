import { programData } from './app.js';
import { handleFileSelect, toggleMusic } from './audioUtils.js';
import { addProgram, addSection, deleteProgram, updateProgram } from './programUtils.js';
import { handleOrderPaste } from './pasteUtils.js';

export function renderProgramTable() {
    const tableBody = document.querySelector('#program-table tbody');
    tableBody.innerHTML = '';
    
    programData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', index);
        
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
            row.innerHTML = `
                <td class="order-column">
                    <span class="drag-handle">≡</span>
                    <input type="text" value="${item.order || ''}" onchange="updateProgram(${index}, 'order', this.value)" 
                           onpaste="handleOrderPaste(event, ${index})" placeholder="順" class="order-input" maxlength="2">
                </td>
                <td>
                    <input type="text" value="${item.program}" onchange="updateProgram(${index}, 'program', this.value)" placeholder="プログラム">
                </td>
                <td>
                    <input type="text" value="${item.memo}" onchange="updateProgram(${index}, 'memo', this.value)" placeholder="メモ">
                </td>
                <td>
                    <input type="file" id="file-${index}" onchange="handleFileSelect(event, ${index})" accept="audio/*" style="display: none;">
                    <button onclick="document.getElementById('file-${index}').click()">音楽選択</button>
                    <span id="file-name-${index}">${item.audioFile ? item.audioFile.name : ''}</span>
                </td>
                <td id="status-${index}"></td>
                <td>
                    <button onclick="toggleMusic(${index})">▶ 再生</button>
                </td>
                <td>
                    <span class="add-program" onclick="addProgram(${index})">＋</span>
                    <span class="add-section" onclick="addSection(${index})">＊</span>
                    <span class="delete-program" onclick="deleteProgram(${index})">✖</span>
                </td>
            `;
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
