document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const nameInputsContainer = document.querySelector('.name-inputs');
    const addNameButton = document.getElementById('add-name');
    const spinWheelButton = document.getElementById('spin-wheel');
    const wheel = document.getElementById('wheel');
    const resultElement = document.getElementById('result');
    const fireworkContainer = document.getElementById('firework-container');
    const recordButton = document.getElementById('record-button');
    const downloadLink = document.getElementById('download-link');
    
    // Recording variables
    let mediaRecorder;
    let recordedChunks = [];
    let isRecording = false;
    
    // Colors for wheel sections
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC249', '#EA5F89',
        '#00BFFF', '#FFA07A', '#20B2AA', '#DDA0DD'
    ];
    
    // Add event listeners
    addNameButton.addEventListener('click', addNameInput);
    spinWheelButton.addEventListener('click', spinWheel);
    
    // Add event listener to the first remove button
    document.querySelector('.remove-name').addEventListener('click', function() {
        if (document.querySelectorAll('.name-input-row').length > 1) {
            this.parentElement.remove();
        }
    });
    
    // Function to add a new name input
    function addNameInput() {
        const inputRow = document.createElement('div');
        inputRow.className = 'name-input-row';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'name-input';
        input.placeholder = 'Enter a name';
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-name';
        removeButton.title = 'Remove name';
        removeButton.textContent = '×';
        
        removeButton.addEventListener('click', function() {
            if (document.querySelectorAll('.name-input-row').length > 1) {
                inputRow.remove();
            }
        });
        
        inputRow.appendChild(input);
        inputRow.appendChild(removeButton);
        nameInputsContainer.appendChild(inputRow);
    }
    
    // Function to collect names from inputs
    function getNames() {
        const inputs = document.querySelectorAll('.name-input');
        const names = [];
        
        inputs.forEach(input => {
            const name = input.value.trim();
            if (name) {
                names.push(name);
            }
        });
        
        return names;
    }
    
    // Function to create wheel sections
    function createWheel(names) {
        wheel.innerHTML = '';
        
        if (names.length === 0) {
            resultElement.textContent = 'Please enter at least one name';
            return false;
        }
        
        const sectionAngle = 360 / names.length;
        
        names.forEach((name, index) => {
            const section = document.createElement('div');
            section.className = 'wheel-section';
            
            // Set rotation and background color
            const rotation = index * sectionAngle;
            section.style.transform = `rotate(${rotation}deg)`;
            section.style.backgroundColor = colors[index % colors.length];
            
            // Create and position the name label
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            
            // Adjust text rotation based on section angle
            nameSpan.style.transform = `rotate(${90 - sectionAngle / 2}deg)`;
            
            // Make font size larger for wheels with fewer names
            if (names.length <= 12) {
                nameSpan.style.fontSize = `${Math.max(14, Math.min(24, 300 / names.length))}px`;
                nameSpan.style.fontWeight = 'bold';
            }
            
            section.appendChild(nameSpan);
            wheel.appendChild(section);
        });
        
        return true;
    }
    
    // Function to create fireworks
    function createFireworks() {
        fireworkContainer.innerHTML = '';
        
        // Create multiple firework bursts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                
                // Random position for the firework
                const posX = Math.random() * window.innerWidth;
                const posY = Math.random() * window.innerHeight * 0.5;
                firework.style.left = `${posX}px`;
                firework.style.top = `${posY}px`;
                
                // Create particles for the firework
                const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
                
                for (let j = 0; j < 30; j++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    
                    // Random direction for the particle
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 50 + Math.random() * 50;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    
                    particle.style.setProperty('--x', `${x}px`);
                    particle.style.setProperty('--y', `${y}px`);
                    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    firework.appendChild(particle);
                }
                
                fireworkContainer.appendChild(firework);
                
                // Remove the firework after animation completes
                setTimeout(() => {
                    firework.remove();
                }, 1000);
            }, i * 300);
        }
    }
    
    // Function to handle video recording
    function setupRecording() {
        recordButton.addEventListener('click', function() {
            if (isRecording) {
                // Stop recording
                mediaRecorder.stop();
                recordButton.textContent = 'Record Spin';
                recordButton.classList.remove('recording');
                isRecording = false;
            } else {
                // Start recording
                const wheelContainer = document.querySelector('.wheel-container');
                const resultContainer = document.querySelector('.result-container');
                
                const stream = wheelContainer.parentElement.captureStream ? 
                    wheelContainer.parentElement.captureStream(30) : 
                    wheelContainer.parentElement.mozCaptureStream ? 
                        wheelContainer.parentElement.mozCaptureStream(30) : null;
                
                if (!stream) {
                    alert('Recording is not supported in your browser. Try using Chrome or Firefox.');
                    return;
                }
                
                recordedChunks = [];
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                
                mediaRecorder.ondataavailable = function(e) {
                    if (e.data.size > 0) {
                        recordedChunks.push(e.data);
                    }
                };
                
                mediaRecorder.onstop = function() {
                    const blob = new Blob(recordedChunks, { type: 'video/mp4' });
                    const url = URL.createObjectURL(blob);
                    
                    downloadLink.href = url;
                    downloadLink.download = 'roulette-spin.mp4';
                    downloadLink.textContent = 'Download Video';
                    downloadLink.style.display = 'inline-block';
                };
                
                mediaRecorder.start();
                recordButton.textContent = 'Stop Recording';
                recordButton.classList.add('recording');
                isRecording = true;
                
                // Auto-spin the wheel when recording starts
                spinWheel();
            }
        });
    }
    
    // Function to spin the wheel
    function spinWheel() {
        const names = getNames();
        
        if (!createWheel(names)) {
            return;
        }
        
        // Clear any existing fireworks
        fireworkContainer.innerHTML = '';
        
        // Hide download link from previous recording
        downloadLink.style.display = 'none';
        
        // Disable the spin button during animation
        spinWheelButton.disabled = true;
        resultElement.textContent = 'Spinning...';
        
        // Calculate a random spin between 5 and 10 full rotations plus a random section
        const spinDegree = 1800 + Math.floor(Math.random() * 1800);
        wheel.style.setProperty('--spin-degree', `${spinDegree}deg`);
        
        // Remove any existing spinning class and force reflow
        wheel.classList.remove('spinning');
        void wheel.offsetWidth; // Force reflow
        
        // Add the spinning class to start animation
        wheel.classList.add('spinning');
        
        // Calculate the winning index based on final position
        setTimeout(() => {
            const finalRotation = spinDegree % 360;
            const sectionAngle = 360 / names.length;
            const winningIndex = names.length - 1 - Math.floor(finalRotation / sectionAngle);
            const adjustedIndex = winningIndex % names.length;
            
            resultElement.textContent = `Winner: ${names[adjustedIndex]}`;
            spinWheelButton.disabled = false;
            
            // Create fireworks animation
            createFireworks();
        }, 5000); // Match this with the CSS animation duration
    }
    
    // Initialize recording functionality
    setupRecording();
});
