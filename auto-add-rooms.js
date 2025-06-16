// Auto-add rooms script for Palmilla and Shellback Tavern
// This script will automatically add the rooms to Firebase with image URLs

// Room data with temporary placeholders - we'll upload images to Firebase Storage manually
const roomsToAdd = [
    {
        title: "Palmilla Newport Beach",
        description: "Upscale coastal restaurant and bar in Newport Beach with modern design, craft cocktails, and oceanside dining atmosphere featuring contemporary Mexican cuisine",
        latitude: 33.6189,
        longitude: -117.9298,
        // We'll use a placeholder and update this to use the drag & drop system
        needsImageUpload: "palmilla.jpg"
    },
    {
        title: "Shellback Tavern Manhattan Beach", 
        description: "Casual beachside tavern and sports bar in Manhattan Beach with laid-back atmosphere, craft beers, classic pub fare, and ocean views",
        latitude: 33.8847,
        longitude: -118.4109,
        needsImageUpload: "shellback.jpg"
    }
];

// Function to add room to Firebase
async function addRoomToFirebase(roomData) {
    try {
        const docRef = await db.collection('rooms').add(roomData);
        console.log('✅ Room added with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error adding room to Firebase:', error);
        throw error;
    }
}

// Function to show instructions for image upload
function showImageUploadInstructions(roomTitle, imageFile) {
    const message = `
🖼️ NEXT STEP FOR ${roomTitle.toUpperCase()}:

1. Drag "${imageFile}" from your Downloads folder onto the image upload zone
2. Fill in the form with this data (or click "Fill Form" button below)
3. Click "Add Room"

This will properly upload the image to Firebase Storage and link it to the room.
    `;
    
    if (typeof showStatus === 'function') {
        showStatus(`Ready to add ${roomTitle}! Please drag ${imageFile} to upload zone.`, 'info');
    }
    
    console.log(message);
    return message;
}

// Function to pre-fill form with room data
function fillFormWithRoomData(room) {
    document.getElementById('roomTitle').value = room.title;
    document.getElementById('roomDescription').value = room.description;
    document.getElementById('latitude').value = room.latitude;
    document.getElementById('longitude').value = room.longitude;
    
    // Scroll to top of form
    document.getElementById('addRoomForm').scrollIntoView({ behavior: 'smooth' });
    
    if (typeof showStatus === 'function') {
        showStatus(`Form filled for ${room.title}! Now drag ${room.needsImageUpload} to upload zone.`, 'success');
    }
}

// Main function to start the assisted room addition process
async function autoAddRooms() {
    console.log('🚀 Starting assisted room addition process...');
    
    if (typeof showStatus === 'function') {
        showStatus('Starting assisted room addition for Palmilla & Shellback...', 'info');
    }
    
    // Process first room
    const palmilla = roomsToAdd[0];
    console.log('\n📍 STEP 1: Adding Palmilla Newport Beach');
    showImageUploadInstructions(palmilla.title, palmilla.needsImageUpload);
    
    // Fill form with first room data
    fillFormWithRoomData(palmilla);
    
    // Add helper buttons
    addHelperButtons();
}

// Add helper buttons for each room
function addHelperButtons() {
    const formActions = document.querySelector('.form-actions');
    
    // Remove any existing helper buttons
    const existingHelpers = formActions.querySelectorAll('.helper-btn');
    existingHelpers.forEach(btn => btn.remove());
    
    // Add buttons for each room
    roomsToAdd.forEach((room, index) => {
        const helperBtn = document.createElement('button');
        helperBtn.type = 'button';
        helperBtn.className = 'btn-secondary helper-btn';
        helperBtn.innerHTML = `<i class="fas fa-fill"></i> Fill ${room.title.split(' ')[0]}`;
        helperBtn.onclick = () => fillFormWithRoomData(room);
        
        formActions.appendChild(helperBtn);
    });
}

// Add auto-add button to trigger the process
function addAutoAddButton() {
    const formActions = document.querySelector('.form-actions');
    if (formActions && !document.getElementById('autoAddBtn')) {
        const autoAddBtn = document.createElement('button');
        autoAddBtn.type = 'button';
        autoAddBtn.className = 'btn-primary';
        autoAddBtn.id = 'autoAddBtn';
        autoAddBtn.innerHTML = '<i class="fas fa-magic"></i> Add Palmilla & Shellback';
        autoAddBtn.addEventListener('click', autoAddRooms);
        
        // Insert at the beginning
        formActions.insertBefore(autoAddBtn, formActions.firstChild);
        
        console.log('🔘 Auto-add button added to the form');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addAutoAddButton, 500); // Small delay to ensure other scripts load first
    });
} else {
    setTimeout(addAutoAddButton, 500);
}

// Export for manual execution
window.autoAddRooms = autoAddRooms;
window.roomsToAdd = roomsToAdd; 