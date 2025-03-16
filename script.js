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
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const left = (screenWidth - 400) / 2;
    const top = (screenHeight - 600) / 2;

    var newWindow = window.open("addStudents.html", null, `height=600,width=400,top=${top},left=${left},status=yes,toolbar=no,menubar=no,location=center`);
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
    var isChecked = studentObj.firstName === "James" && studentObj.lastName === "Bond";

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td><input type="checkbox" class="checkbox"></td>
        <td>${studentObj.group}</td>
        <td>${studentObj.firstName} ${studentObj.lastName}</td> 
        <td>${studentObj.gender}</td>
        <td>${studentObj.birthday.split("-").reverse().join(".")}</td>
        <td><input type="radio" class="status"></td>
        <td>
            <button>Edit</button>
            <button onclick="showDeleteConfirmation(this)">X</button>
        </td>
    `;

    table.querySelector("tbody").appendChild(newRow);

    if (isChecked) {
        newRow.querySelector(".status").checked = true; 
    }

}

let notificationBell = document.getElementById("notificationBell");
let popup = document.getElementById("popup");

const defaultSrc = "images/notification.png";
const newSrc = "images/bell.png";

const savedImage = sessionStorage.getItem("bellIconSrc") || defaultSrc;
notificationBell.src = savedImage;

notificationBell.addEventListener("click", function () {
    notificationBell.src = newSrc;
    sessionStorage.setItem("bellIconSrc", newSrc); 

    window.location.href = "/messages.html";
});

notificationBell.addEventListener("mouseenter", function() {
    popup.style.display = "block";
});

document.querySelector(".navbar-right").addEventListener("mouseleave", function() {
    popup.style.display = "none";
});

let userLogo = document.getElementById("userLogo");
let userSettPopup = document.getElementById("popupUser");

userLogo.addEventListener("mouseenter", function() {
    userSettPopup.style.display = "block";
});

document.querySelector(".navbar-right").addEventListener("mouseleave", function() {
    userSettPopup.style.display = "none";
});

function editRow(button) {
    var row = button.parentNode.parentNode;
    alert(`Editing ${row.cells[2].textContent}`);
}

let studentToDelete = null; 

function showDeleteConfirmation(button) {
    const row = button.closest("tr");
    const studentName = row.children[2].textContent; 

    document.getElementById("deleteText").textContent = `Are you sure you want to delete student "${studentName}"?`;

    studentToDelete = row;

    document.getElementById("deleteModal").style.display = "block";

    document.getElementById("confirmDelete").addEventListener("click", function () {
        studentToDelete.remove();
        closeModal();
    });
}

function closeModal() {
    document.getElementById("deleteModal").style.display = "none"; 
    studentToDelete = null; 
}


var mainCheckBox = document.getElementById("mainCheckBox").addEventListener("change", function() {
    document.querySelectorAll(".checkbox").forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});

function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => document.getElementById(id).innerHTML = data);
}

