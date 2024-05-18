document.getElementById('reset-button').addEventListener('click', async function() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const password = document.getElementById('new-password').value;
    const messageElement = document.getElementById('message');

    if (!password) {
        messageElement.textContent = 'Please enter a new password.';
        messageElement.style.color = 'red';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/matjarcom/api/v1/customer-reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.textContent = 'Password has been successfully reset.';
            messageElement.style.color = 'green';
        } else {
            messageElement.textContent = data.message || 'Error resetting password.';
            messageElement.style.color = 'red';
        }
    } catch (error) {
        messageElement.textContent = 'An error occurred. Please try again later.';
        messageElement.style.color = 'red';
    }
});
