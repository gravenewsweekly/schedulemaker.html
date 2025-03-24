const apiKey = '$2a$10$NVGDrE/MbXNdUqAQZQYG2OU4sScUCCAksJ8pHLUfW5snje09AJXN6'; // Replace with your JSONBin API Key
const usersBinId = '67e1b4cf8a456b79667bd6c9'; // Replace with your Users Bin ID

// Helper function to interact with JSONBin
async function jsonBin(method, binId, data = null) {
    const headers = { 'X-Master-Key': apiKey, 'Content-Type': 'application/json' };
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, options);
    return res.json();
}

// Sign Up
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = { username, email, password, bio: '', status: 'online' };
    const users = (await jsonBin('GET', usersBinId)).record || [];
    users.push(user);
    await jsonBin('PUT', usersBinId, users);
    
    localStorage.setItem('currentUser', username);
    window.location.href = 'index.html';
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = (await jsonBin('GET', usersBinId)).record || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', user.username);
        window.location.href = 'index.html';
    } else {
        alert('Invalid credentials');
    }
});

// Load Homepage
window.onload = async () => {
    const username = localStorage.getItem('currentUser');
    if (username && document.getElementById('usernameDisplay')) {
        document.getElementById('usernameDisplay').textContent = username;
    }

    // Load profile data
    if (document.getElementById('viewUsername')) {
        const users = (await jsonBin('GET', usersBinId)).record || [];
        const user = users.find(u => u.username === username);
        if (user) {
            document.getElementById('viewUsername').textContent = user.username;
            document.getElementById('viewBio').textContent = user.bio;
            document.getElementById('viewStatus').textContent = user.status === 'online' ? '🟢 Online' : '🔴 Offline';
        }
    }

    // Load schedules
    if (document.getElementById('scheduleList')) {
        const schedules = (await jsonBin('GET', schedulesBinId)).record || [];
        const userSchedules = schedules.filter(s => s.username === username);
        document.getElementById('scheduleList').innerHTML = userSchedules.map(s => `<p>${s.subject} - ${s.time}</p>`).join('');
    }
};

// Logout
document.getElementById('logout')?.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

// Edit Profile
document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = localStorage.getItem('currentUser');
    const bio = document.getElementById('bio').value;
    const status = document.querySelector('input[name="status"]:checked').value;

    const users = (await jsonBin('GET', usersBinId)).record || [];
    const user = users.find(u => u.username === username);
    user.bio = bio;
    user.status = status;
    await jsonBin('PUT', usersBinId, users);
    alert('Profile updated!');
});

// Delete Account
document.getElementById('deleteAccount')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete your account?')) {
        const username = localStorage.getItem('currentUser');
        let users = (await jsonBin('GET', usersBinId)).record || [];
        users = users.filter(u => u.username !== username);
        await jsonBin('PUT', usersBinId, users);
        localStorage.removeItem('currentUser');
        window.location.href = 'signup.html';
    }
});

// Search Users
document.getElementById('searchInput')?.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    const users = (await jsonBin('GET', usersBinId)).record || [];
    const results = users.filter(u => u.username.toLowerCase().includes(query));
    document.getElementById('searchResults').innerHTML = results.map(u => `
        <p>${u.username} - ${u.status === 'online' ? '🟢' : '🔴'} 
        <button onclick="addFriend('${u.username}')">Add Friend</button>
        <button onclick="startChat('${u.username}')">Chat</button></p>
    `).join('');
});

// Add Friend (Simple simulation)
async function addFriend(friendUsername) {
    alert(`Friend request sent to ${friendUsername}`);
}

// Real-time Chat (Simple simulation)
async function startChat(username) {
    document.getElementById('chatBox').innerHTML = `
        <h3>Chat with ${username}</h3>
        <input type="text" id="chatInput" placeholder="Type a message">
        <button onclick="sendMessage('${username}')">Send</button>
    `;
}

function sendMessage(toUsername) {
    const message = document.getElementById('chatInput').value;
    alert(`Message to ${toUsername}: ${message}`);
    document.getElementById('chatInput').value = '';
}

// Save Schedule
document.getElementById('scheduleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = localStorage.getItem('currentUser');
    const subject = document.getElementById('subject').value;
    const time = document.getElementById('time').value;

    const schedules = (await jsonBin('GET', schedulesBinId)).record || [];
    schedules.push({ username, subject, time });
    await jsonBin('PUT', schedulesBinId, schedules);

    document.getElementById('scheduleList').innerHTML += `<p>${subject} - ${time}</p>`;
    e.target.reset();
});
