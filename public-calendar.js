document.addEventListener('DOMContentLoaded', function() {
    loadPublicEvents();
});

function loadPublicEvents() {
    db.ref('events').orderByChild('timestamp').once('value')
        .then((snapshot) => {
            const eventsContainer = document.getElementById('publicEventsList');
            eventsContainer.innerHTML = '';
            
            if (!snapshot.exists()) {
                eventsContainer.innerHTML = `
                    <div class="no-events-public">
                        📅 Все още няма предстоящи събития.<br>
                        Провери отново скоро за актуализации!
                    </div>
                `;
                return;
            }
            
            const now = new Date().getTime();
            let hasUpcomingEvents = false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            snapshot.forEach((childSnapshot) => {
                const event = childSnapshot.val();
                const eventDate = new Date(event.timestamp);
                
                // Only show future events and events from today
                if (eventDate.getTime() >= today.getTime()) {
                    hasUpcomingEvents = true;
                    const eventCard = createPublicEventCard(event, eventDate);
                    eventsContainer.appendChild(eventCard);
                }
            });
            
            if (!hasUpcomingEvents) {
                eventsContainer.innerHTML = `
                    <div class="no-events-public">
                        📅 Няма предстоящи събития.<br>
                        Следващото събирание на клуба ще бъде обявено скоро!
                    </div>
                `;
            }
        })
        .catch((error) => {
            console.error('Error loading public events:', error);
            document.getElementById('publicEventsList').innerHTML = 
                '<div class="no-events-public">Грешка при зареждане на събитията.</div>';
        });
}

function createPublicEventCard(event, eventDate) {
    const eventDiv = document.createElement('div');
    
    const isToday = eventDate.toDateString() === new Date().toDateString();
    const isUpcoming = eventDate.getTime() > new Date().getTime();
    
    eventDiv.className = `public-event-card ${isToday ? 'today' : isUpcoming ? 'upcoming' : ''}`;
    
    const dateString = isToday ? 
        `🎯 Днес • ${eventDate.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}` :
        eventDate.toLocaleDateString('bg-BG', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    
    eventDiv.innerHTML = `
        <div class="public-event-date">
            <strong>${dateString}</strong>
        </div>
        <h3 class="public-event-title">${event.title}</h3>
        ${event.description ? `<p class="public-event-description">${event.description}</p>` : ''}
        <p class="public-event-location">📍 ${event.location}</p>
    `;
    
    return eventDiv;
}