// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔧 Form handler loaded");
    
    const joinForm = document.getElementById('joinForm');
    
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            console.log("🔧 Form submitted - starting process");
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Изпращане...';
            submitBtn.disabled = true;
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                class: document.getElementById('class').value,
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString(),
                status: 'new'
            };

            console.log("🔧 Sending to Firebase:", formData);

            // Add to Realtime Database
            db.ref('applications').push(formData)
                .then(() => {
                    console.log("✅ Success! Data saved to Firebase");
                    document.getElementById('formMessage').innerHTML = 
                        '<div class="success-message">✅ Кандидатстването е изпратено успешно! Ще се свържем с теб скоро.</div>';
                    joinForm.reset();
                })
                .catch((error) => {
                    console.error('❌ Firebase error: ', error);
                    document.getElementById('formMessage').innerHTML = 
                        '<div class="error-message">❌ Възникна грешка. Моля, опитай отново или ни изпрати имейл директно.</div>';
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    console.log("🔧 Form process completed");
                });
        });
    } else {
        console.error("❌ ERROR: Form not found!");
    }
});