// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDXSHi1aSU8ShhufVEhL0x5SL1Jm4Fs6rc",
    authDomain: "store-names-1afa0.firebaseapp.com",
    projectId: "store-names-1afa0",
    storageBucket: "store-names-1afa0.firebasestorage.app",
    messagingSenderId: "370617677835",
    appId: "1:370617677835:web:082dac586526761458af0e",
    measurementId: "G-5HSPJBF5FY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variables
let currentUser = 'me'; // Default user

// Initialize the chat when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Determine current user based on page URL
    if (window.location.pathname.includes('user2.html')) {
        currentUser = 'them';
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load existing messages
    loadMessages();
});

// Set up event listeners
function setupEventListeners() {
    const textInput = document.getElementById('text');
    const sendBtn = document.querySelector('input[type="button"]');
    
    if (textInput && sendBtn) {
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (currentUser === 'me') {
                    coli();
                } else {
                    them();
                }
            }
        });
    }
}

// Send message as "me"
async function coli() {
    await sendMessage('me');
}

// Send message as "them"
async function them() {
    await sendMessage('them');
}

// Send message function
async function sendMessage(sender) {
    const textInput = document.getElementById('text');
    const messageText = textInput.value.trim();
    
    if (messageText === '') return;
    
    try {
        // Add message to Firestore with sender information
        await db.collection('messages').add({
            text: messageText,
            sender: sender,
            timestamp: new Date(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Clear input field
        textInput.value = '';
        
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

// Load messages from Firestore
function loadMessages() {
    db.collection('messages')
        .orderBy('createdAt', 'asc')
        .onSnapshot((snapshot) => {
            const messagesContainer = document.getElementById('main');
            const subMSection = document.getElementById('subM');
            
            // Clear only the message inputs, not the form
            const existingMessages = subMSection.querySelectorAll('input[type="text"].msg-input');
            existingMessages.forEach(msg => msg.remove());
            
            snapshot.forEach((doc) => {
                const msg = doc.data();
                displayMessage(msg);
            });
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
}

// Display message in the chat
function displayMessage(msg) {
    const subMSection = document.getElementById('subM');
    const time = msg.timestamp ? 
        new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
        new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.className = `msg-input ${msg.sender}`;
    messageInput.value = `${msg.text} [${time}]`;
    messageInput.readOnly = true;
    
    // Add to the top of the subM section (before the form)
    const form = subMSection.querySelector('form');
    subMSection.insertBefore(messageInput, form);
    
    // Add line breaks for spacing
    const br = document.createElement('br');
    subMSection.insertBefore(br, form);
}