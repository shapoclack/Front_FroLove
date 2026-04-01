const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const list = document.getElementById('notes-list');
const btnSubscribe = document.getElementById('btn-subscribe');
const btnUnsubscribe = document.getElementById('btn-unsubscribe');
const toastContainer = document.getElementById('toast-container');

// Socket.io Init
const socket = io();

socket.on('taskAdded', (taskText) => {
    const toast = document.createElement('div');
    toast.style.cssText = 'background: var(--input-bg); padding: 16px; border-radius: 12px; border-left: 4px solid var(--accent); color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); animation: slideIn 0.3s ease; margin-top: 10px;';
    toast.innerHTML = `<strong>Новая заметка от друга:</strong> ${taskText}`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
});

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    list.innerHTML = notes.map(note => `<li>${note}</li>`).join('');
}

function addNote(text) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.push(text);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
    
    // Эмитим событие на сервер
    socket.emit('newTask', text);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
        addNote(text);
        input.value = '';
    }
});

loadNotes();

// Service Worker & Push Logic
let swRegistration = null;
const publicVapidKey = 'BCYcj53z0Osid1xFOFgkAZ4LLigrNR-zPvWtWAVnRtPsJ24QX0qxFHQO59JC0GUr8Qi0mcbY0ppP5kFsle4anE4';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            swRegistration = await navigator.serviceWorker.register('./sw.js');
            console.log('ServiceWorker зарегистрирован:', swRegistration.scope);
            checkSubscription();
        } catch (err) {
            console.error('Ошибка регистрации SW:', err);
        }
    });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function checkSubscription() {
    if (!swRegistration) return;
    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
        if(btnSubscribe) btnSubscribe.style.display = 'none';
        if(btnUnsubscribe) btnUnsubscribe.style.display = 'inline-block';
    } else {
        if(btnSubscribe) btnSubscribe.style.display = 'inline-block';
        if(btnUnsubscribe) btnUnsubscribe.style.display = 'none';
    }
}

async function subscribeToPush() {
    if (!swRegistration) return;
    try {
        const subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
        
        await fetch('/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: { 'Content-Type': 'application/json' }
        });
        checkSubscription();
    } catch (e) {
        console.error('Ошибка подписки:', e);
    }
}

async function unsubscribeFromPush() {
    if (!swRegistration) return;
    try {
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
            await fetch('/unsubscribe', {
                method: 'POST',
                body: JSON.stringify({ endpoint: subscription.endpoint }),
                headers: { 'Content-Type': 'application/json' }
            });
            await subscription.unsubscribe();
        }
        checkSubscription();
    } catch (e) {
        console.error('Ошибка отписки:', e);
    }
}

if(btnSubscribe) btnSubscribe.addEventListener('click', subscribeToPush);
if(btnUnsubscribe) btnUnsubscribe.addEventListener('click', unsubscribeFromPush);
