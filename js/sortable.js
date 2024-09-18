import { programData, updateProgramData } from './app.js';

export function initSortable() {
    const el = document.getElementById('program-body');
    Sortable.create(el, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: function (evt) {
            const newIndex = evt.newIndex;
            const oldIndex = evt.oldIndex;
            
            const [movedItem] = programData.splice(oldIndex, 1);
            programData.splice(newIndex, 0, movedItem);
            
            updateProgramData(programData);
        }
    });
}
