document.addEventListener('DOMContentLoaded', function() {
    const benchGrid = document.getElementById('benchGrid');
    const timetableGrid = document.getElementById('timetableGrid');
    let draggedElement = null;
    let dragSource = null;

    function initializeDragAndDrop() {
        const draggables = document.querySelectorAll('.module-slot');
        const droppables = document.querySelectorAll('.droppable, .bench-slot');

        draggables.forEach(draggable => {
            draggable.draggable = true;
            draggable.addEventListener('dragstart', handleDragStart);
            draggable.addEventListener('dragend', handleDragEnd);
        });

        droppables.forEach(droppable => {
            droppable.addEventListener('dragover', handleDragOver);
            droppable.addEventListener('dragleave', handleDragLeave);
            droppable.addEventListener('drop', handleDrop);
        });
    }

    function handleDragStart(e) {
        draggedElement = this;
        dragSource = this.closest('#benchGrid') ? 'bench' : 'timetable';
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.querySelector('span').textContent);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedElement = null;
        dragSource = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (!draggedElement) return;

        const moduleCode = e.dataTransfer.getData('text/plain');
        const targetIsBench = this.closest('#benchGrid') !== null;
        const sourceIsBench = dragSource === 'bench';

        if (targetIsBench) {
            handleBenchDrop(this, moduleCode);
        } else {
            handleTimetableDrop(this, moduleCode);
        }

        if (sourceIsBench) {
            const benchSlot = draggedElement.parentNode;
            benchSlot.innerHTML = '';
            rearrangeBenchSlots();
        } else {
            const emptySlot = createEmptySlot(false);
            draggedElement.parentNode.replaceChild(emptySlot, draggedElement);
        }

        initializeDragAndDrop();
    }

    function handleBenchDrop(targetSlot, moduleCode) {
        const newSlot = createModuleSlot(moduleCode, true);
        const emptyBenchSlot = findEmptyBenchSlot();
        
        if (emptyBenchSlot) {
            emptyBenchSlot.innerHTML = '';
            emptyBenchSlot.appendChild(newSlot);
            rearrangeBenchSlots();
        }
    }

    function handleTimetableDrop(targetSlot, moduleCode) {
        const newSlot = createModuleSlot(moduleCode, false);
        targetSlot.parentNode.replaceChild(newSlot, targetSlot);
    }

    function createModuleSlot(moduleCode, forBench) {
        const slot = document.createElement('div');
        slot.className = `border rounded mb-2 border-2 border-dark position-relative module-slot ${forBench ? 'draggable' : 'droppable'}`;
        slot.style.height = '48px';
        slot.draggable = true;
        
        slot.innerHTML = `
            <span class="ps-2 pt-2 d-inline-block" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: calc(100% - 24px);">${moduleCode}</span>
            <button class="btn-close ${forBench ? 'float-end m-1' : ''}" style="position: absolute; right: 8px; top: 12px; font-size: 0.7em;"></button>
        `;

        const closeBtn = slot.querySelector('.btn-close');
        closeBtn.addEventListener('click', handleCloseClick);

        return slot;
    }

    function createEmptySlot(forBench) {
        const slot = document.createElement('div');
        slot.className = 'border rounded mb-2 droppable';
        slot.style.height = '48px';
        return slot;
    }

    function findEmptyBenchSlot() {
        const benchSlots = benchGrid.querySelectorAll('.bench-slot');
        for (let slot of benchSlots) {
            if (!slot.querySelector('.module-slot')) {
                return slot;
            }
        }
        return null;
    }

    function rearrangeBenchSlots() {
        const benchSlots = Array.from(benchGrid.querySelectorAll('.bench-slot'));
        const modules = benchSlots
            .map(slot => slot.querySelector('.module-slot'))
            .filter(Boolean);
        
        benchSlots.forEach(slot => {
            slot.innerHTML = '';
        });
        
        modules.forEach((module, index) => {
            benchSlots[index].appendChild(module);
        });

        for (let i = modules.length; i < benchSlots.length; i++) {
            if (!benchSlots[i].querySelector('.module-slot')) {
                benchSlots[i].innerHTML = '';
            }
        }
    }

    function handleCloseClick(e) {
        e.stopPropagation();
        const moduleSlot = this.closest('.module-slot');
        const isBench = moduleSlot.closest('#benchGrid') !== null;
        
        if (isBench) {
            moduleSlot.parentNode.innerHTML = '';
            rearrangeBenchSlots();
        } else {
            const emptySlot = createEmptySlot(false);
            moduleSlot.parentNode.replaceChild(emptySlot, moduleSlot);
        }
        
        initializeDragAndDrop();
    }

    // Clear buttons functionality
    document.getElementById('clearTimetable').addEventListener('click', function() {
        const timetableSlots = document.querySelectorAll('#timetableGrid .module-slot');
        timetableSlots.forEach(slot => {
            const emptySlot = createEmptySlot(false);
            slot.parentNode.replaceChild(emptySlot, slot);
        });
        initializeDragAndDrop();
    });

    document.getElementById('clearBench').addEventListener('click', function() {
        const benchSlots = document.querySelectorAll('#benchGrid .bench-slot');
        benchSlots.forEach(slot => {
            slot.innerHTML = '';
        });
        initializeDragAndDrop();
    });

    document.getElementById('clearAll').addEventListener('click', function() {
        document.getElementById('clearTimetable').click();
        document.getElementById('clearBench').click();
    });

    // Initialize all module slots and close buttons
    document.querySelectorAll('.btn-close').forEach(button => {
        button.addEventListener('click', handleCloseClick);
    });

    // Initial drag and drop setup
    initializeDragAndDrop();
});
