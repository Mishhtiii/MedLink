document.addEventListener('DOMContentLoaded', function() {
    const emergencyForm = document.getElementById('emergencyForm');

    emergencyForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(emergencyForm);
        const emergencyData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            emergencyType: formData.get('emergencyType'),
            description: formData.get('description')
        };

        console.log('Emergency request submitted:', emergencyData);

        
        alert('Emergency request submitted successfully! Help is on the way.');

        
        emergencyForm.reset();
    });
});
