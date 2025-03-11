class Student {
    constructor(data) {
        this.group = data.group || 'Select Group';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.gender = data.gender || 'Select Gender';
        this.birthday = data.birthday || '';
    }
}

function openWindow() {
    var newWindow = window.open("addStudents.html", null, "height=300,width=400,status=yes,toolbar=no,menubar=no,location=no");
}

function setValue(data) {
    console.log('Received form data in parent window:', data);

    const studentObj = new Student(data);

    var table = document.getElementById('mainTable');
    if (!table) {
        console.error('Table with ID "mainTable" not found.');
        return;
    }

    var table = document.getElementById('tableStudents');
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${studentObj.group}</td>
            <td>${studentObj.firstName + " " + studentObj.lastName}</td>
            <td>${studentObj.gender}</td>
            <td>${studentObj.birthday.split("-").reverse().join(".")}</td>
            <td><input type="radio"></td>
            <td>
            <button>Edit</button>
            <button>X</button>
            </td>
        `;
    table.appendChild(newRow);
}

function editRow(button) {
    var row = button.parentNode.parentNode;
    alert(`Editing ${row.cells[2].textContent}`);
}

function deleteRow(button) {
    var row = button.parentNode.parentNode;
    if (confirm(`Delete ${row.cells[2].textContent}?`)) {
        row.remove();
    }
}

// function changeImage()
// {
//     alert("HH");
//     document.querySelector(".notificationLogo").src  = "images/bell.png";

//     window.location.href = "messages.html";
// }

function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => document.getElementById(id).innerHTML = data);
}


document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header", "header.html");
    loadComponent("footer", "footer.html");
});

document.addEventListener("DOMContentLoaded", function () {
    const bellIcon = document.getElementById("notificationBell");
    
    // Default image
    const defaultSrc = "images/notification.png";
    const newSrc = "images/bell.png";

    // Retrieve stored image from sessionStorage (if exists)
    const savedImage = sessionStorage.getItem("bellIconSrc") || defaultSrc;
    bellIcon.src = savedImage;

    // Function to change the image and redirect
    bellIcon.addEventListener("click", function () {
        bellIcon.src = newSrc; // Change image
        sessionStorage.setItem("bellIconSrc", newSrc); // Save in sessionStorage

        window.location.href = "/messages.html"; // Redirect
    });
});

