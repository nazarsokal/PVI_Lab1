function openWindow() {
    // Open the addStudent.html file in a new window
    var newWindow = window.open("addStudents.html", null, "height=600,width=500,status=yes,toolbar=no,menubar=no,location=no");
}

function setValue(data) {
    // This function can be used to receive form data from the new window
    console.log('Received form data in parent window:', data);
    // Example: Update a field in the parent window with the submitted data
    document.getElementById('value').value = JSON.stringify(data); // For demo purposes
}