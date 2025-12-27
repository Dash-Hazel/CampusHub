// Calendar functionality - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔧 Calendar handler loaded");
    loadEvents();
    
    // Add event form submission
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewEvent();
        });
    }
});

function loadEvents() {
    console.log("🔧 Loading events...");
    
    if (typeof db === 'undefined') {
        console.error("❌ Firebase not initialized");
        return;
    }

    db.ref('events').orderByChild('timestamp').once('value')
        .then((snapshot) => {
            console.log("🔧 Events found:", snapshot.exists());
            const eventsContainer = document.getElementById('adminEventsList'); // ← FIXED ID
            eventsContainer.innerHTML = '';
            
            if (!snapshot.exists()) {
                eventsContainer.innerHTML = '<div class="no-events">Все още няма събития</div>';
                return;
            }
            
            const now = new Date().getTime();
            let hasEvents = false;
            
            snapshot.forEach((childSnapshot) => {
                const event = childSnapshot.val();
                const eventDate = new Date(event.timestamp);
                const eventId = childSnapshot.key;
                
                // Show all events in admin (both past and future)
                hasEvents = true;
                const eventCard = createEventCard(event, eventDate, eventId);
                eventsContainer.appendChild(eventCard);
            });
            
            if (!hasEvents) {
                eventsContainer.innerHTML = '<div class="no-events">Все още няма събития</div>';
            }
        })
        .catch((error) => {
            console.error('Error loading events:', error);
            document.getElementById('adminEventsList').innerHTML = // ← FIXED ID
                '<div class="no-events">Грешка при зареждане на събитията.</div>';
        });
}

function createEventCard(event, eventDate, eventId) {
    const eventDiv = document.createElement('div');
    const isUpcoming = eventDate.getTime() > new Date().getTime();
    
    eventDiv.className = `admin-event-card ${isUpcoming ? 'upcoming' : 'past'}`;
    
    const dateString = eventDate.toLocaleDateString('bg-BG', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    eventDiv.innerHTML = `
        <button class="delete-event-btn" onclick="deleteEvent('${eventId}')">✕</button>
        <div class="admin-event-date">
            <strong>${dateString}</strong>
        </div>
        <h3 class="admin-event-title">${event.title}</h3>
        ${event.description ? `<p class="admin-event-description">${event.description}</p>` : ''}
        <p class="admin-event-location">📍 ${event.location}</p>
    `;
    
    return eventDiv;
}

function addNewEvent() {
    console.log("🔧 Adding new event...");
    
    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    
    console.log("🔧 Event data:", { title, date, time, location });
    
    if (!title || !date || !time || !location) {
        alert('Моля, попълнете всички задължителни полета');
        return;
    }
    
    // Combine date and time into timestamp
    const dateTimeString = `${date}T${time}`;
    const timestamp = new Date(dateTimeString).getTime();
    
    if (isNaN(timestamp)) {
        alert('Невалидна дата или час');
        return;
    }
    
    const eventData = {
        title: title,
        description: description,
        location: location,
        timestamp: timestamp,
        created: new Date().getTime()
    };
    
    const submitBtn = document.querySelector('#eventForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Добавяне...';
    submitBtn.disabled = true;
    
    db.ref('events').push(eventData)
        .then((ref) => {
            console.log("✅ Event added with ID:", ref.key);
            showEventMessage('✅ Събитието е добавено успешно!', 'success');
            document.getElementById('eventForm').reset();
            loadEvents(); // Reload events to show the new one
        })
        .catch((error) => {
            console.error('❌ Error adding event:', error);
            showEventMessage('❌ Грешка при добавяне на събитието: ' + error.message, 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

function deleteEvent(eventId) {
    if (confirm('Сигурни ли сте, че искате да изтриете това събитие?')) {
        db.ref('events/' + eventId).remove()
            .then(() => {
                showEventMessage('✅ Събитието е изтрито успешно!', 'success');
                loadEvents();
            })
            .catch((error) => {
                console.error('Error deleting event:', error);
                showEventMessage('❌ Грешка при изтриване на събитието', 'error');
            });
    }
}

function showEventMessage(message, type) {
    const messageDiv = document.getElementById('eventMessage');
    if (messageDiv) {
        messageDiv.innerHTML = `<div class="${type === 'success' ? 'success-message' : 'error-message'}">${message}</div>`;
        
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.innerHTML = '';
            }, 3000);
        }
    }
}