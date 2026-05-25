const state = {
    activeColumnIndex: 0,
    isRunning: false,
    intervalTime: 1000,
    intensity: 1.0,
    currentSize: '30px',
    currentColor: '#dc2626',
    rowCount: 3,
    columns: 7,
    circles: [],
    circleConfigs: {},
    timerId: null
};

function createGrid() {
    const matrix = document.getElementById('lights-display-matrix');
    matrix.innerHTML = '';
    state.circles = [];
    
    for (let row = 0; row < state.rowCount; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'light-row';
        rowDiv.dataset.row = row;
        
        for (let col = 0; col < state.columns; col++) {
            const circle = document.createElement('div');
            circle.className = 'light-circle';
            circle.dataset.row = row;
            circle.dataset.col = col;
            
            const size = getStoredSize(row, col);
            const color = getStoredColor(row, col);
            
            circle.style.width = size;
            circle.style.height = size;
            circle.style.backgroundColor = color;
            
            circle.addEventListener('click', () => openPopup(circle, row, col));
            
            rowDiv.appendChild(circle);
            state.circles.push(circle);
        }
        
        matrix.appendChild(rowDiv);
    }
}

function tickRipple() {
    state.activeColumnIndex = (state.activeColumnIndex + 1) % state.columns;
    
    state.circles.forEach(circle => {
        const col = parseInt(circle.dataset.col);
        if (col === state.activeColumnIndex) {
            circle.style.opacity = state.intensity.toString();
        } else {
            circle.style.opacity = '0.1';
        }
    });
}

function startAnimation() {
    if (state.isRunning) return;
    
    state.isRunning = true;
    state.activeColumnIndex = 0;
    state.circles.forEach(c => c.style.opacity = '0.1');
    
    state.timerId = setInterval(tickRipple, state.intervalTime);
    document.getElementById('start-stop-btn').textContent = 'Stop';
    document.getElementById('start-stop-btn').style.backgroundColor = '#dc2626';
}

function stopAnimation() {
    if (!state.isRunning) return;
    
    state.isRunning = false;
    clearInterval(state.timerId);
    state.timerId = null;
    state.circles.forEach(c => c.style.opacity = '0.1');
    
    document.getElementById('start-stop-btn').textContent = 'Start';
    document.getElementById('start-stop-btn').style.backgroundColor = '#16a34a';
}

function toggleAnimation() {
    if (state.isRunning) {
        stopAnimation();
    } else {
        startAnimation();
    }
}

function updateInterval() {
    const input = document.getElementById('interval-input');
    const numInput = document.getElementById('interval-number');
    let newTime = parseInt(input.value);
    if (isNaN(newTime)) newTime = 1000;
    newTime = Math.max(100, Math.min(2000, newTime));
    state.intervalTime = newTime;
    input.value = newTime;
    numInput.value = newTime;
    document.getElementById('interval-value').textContent = newTime;
    
    if (state.isRunning) {
        clearInterval(state.timerId);
        state.timerId = setInterval(tickRipple, state.intervalTime);
    }
}

function updateIntensity() {
    const input = document.getElementById('intensity-input');
    const numInput = document.getElementById('intensity-number');
    let newIntensity = parseInt(input.value);
    if (isNaN(newIntensity)) newIntensity = 100;
    newIntensity = Math.max(30, Math.min(100, newIntensity));
    state.intensity = newIntensity / 100;
    input.value = newIntensity;
    numInput.value = (newIntensity / 100).toFixed(1);
    document.getElementById('intensity-value').textContent = (newIntensity / 100).toFixed(1);
}

function applyGlobalColor() {
    const color = document.getElementById('color-select').value;
    state.currentColor = color;
    state.circles.forEach(circle => {
        circle.style.backgroundColor = color;
        storeCircleConfig(circle.dataset.row, circle.dataset.col, 'color', color);
    });
}

function applyGlobalSize() {
    const size = document.getElementById('size-select').value;
    state.currentSize = size;
    state.circles.forEach(circle => {
        circle.style.width = size;
        circle.style.height = size;
        storeCircleConfig(circle.dataset.row, circle.dataset.col, 'size', size);
    });
}

function updateRowCount() {
    const newCount = parseInt(document.getElementById('row-count').value);
    if (newCount >= 1 && newCount <= 7) {
        state.rowCount = newCount;
        createGrid();
    }
}

function openPopup(circle, row, col) {
    const existingPopup = document.querySelector('.light-popup');
    if (existingPopup) existingPopup.remove();
    
    const rect = circle.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'light-popup';
    popup.style.left = (rect.left + rect.width + 10) + 'px';
    popup.style.top = rect.top + 'px';
    
    let currentColor = circle.style.backgroundColor || '#dc2626';
    if (currentColor.startsWith('rgb')) {
        currentColor = rgbToHex(currentColor);
    }
    
    popup.innerHTML = `
        <h4>Light (${parseInt(row) + 1}, ${parseInt(col) + 1})</h4>
        <div class="popup-control">
            <label>Color:</label>
            <input type="color" id="popup-color" value="${currentColor}">
        </div>
        <div class="popup-control">
            <label>Size:</label>
            <select id="popup-size">
                <option value="20px">Small</option>
                <option value="30px" selected>Medium</option>
                <option value="40px">Large</option>
            </select>
        </div>
        <button id="apply-popup">Apply</button>
    `;
    
    document.body.appendChild(popup);
    
    document.getElementById('apply-popup').addEventListener('click', () => {
        const newColor = document.getElementById('popup-color').value;
        const newSize = document.getElementById('popup-size').value;
        
        circle.style.backgroundColor = newColor;
        circle.style.width = newSize;
        circle.style.height = newSize;
        
        storeCircleConfig(row, col, 'color', newColor);
        storeCircleConfig(row, col, 'size', newSize);
        
        popup.remove();
    });
}

function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (result && result.length >= 3) {
        return "#" + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1);
    }
    return '#dc2626';
}

function storeCircleConfig(row, col, prop, value) {
    const key = `${row}-${col}`;
    if (!state.circleConfigs[key]) state.circleConfigs[key] = {};
    state.circleConfigs[key][prop] = value;
}

function getStoredColor(row, col) {
    const key = `${row}-${col}`;
    return state.circleConfigs?.[key]?.color || state.currentColor;
}

function getStoredSize(row, col) {
    const key = `${row}-${col}`;
    return state.circleConfigs?.[key]?.size || state.currentSize;
}

document.addEventListener('DOMContentLoaded', () => {
    createGrid();
    
    document.getElementById('start-stop-btn').addEventListener('click', toggleAnimation);
    
    const intervalInput = document.getElementById('interval-input');
    const intervalNumber = document.getElementById('interval-number');
    intervalInput.addEventListener('input', updateInterval);
    intervalNumber.addEventListener('input', () => {
        const val = parseInt(intervalNumber.value);
        if (!isNaN(val)) {
            intervalInput.value = Math.max(100, Math.min(2000, val));
            updateInterval();
        }
    });
    
    const intensityInput = document.getElementById('intensity-input');
    const intensityNumber = document.getElementById('intensity-number');
    intensityInput.addEventListener('input', updateIntensity);
    intensityNumber.addEventListener('input', () => {
        const val = parseFloat(intensityNumber.value);
        if (!isNaN(val)) {
            const clamped = Math.max(0.3, Math.min(1.0, val));
            intensityInput.value = Math.round(clamped * 100);
            updateIntensity();
        }
    });
    
    document.getElementById('color-select').addEventListener('change', applyGlobalColor);
    document.getElementById('size-select').addEventListener('change', applyGlobalSize);
    document.getElementById('row-count').addEventListener('change', updateRowCount);
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.light-circle') && !e.target.closest('.light-popup')) {
            const popup = document.querySelector('.light-popup');
            if (popup) popup.remove();
        }
    });
});