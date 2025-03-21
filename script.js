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
    var name = document.querySelector(".NavBarName").textContent.split(" ");
    var isChecked = studentObj.firstName === name[0] && studentObj.lastName === name[1];

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

let angle = 0;
notificationBell.addEventListener("mouseenter", function() {
    popup.style.display = "block";

    requestAnimationFrame(rotateElement());
});

var listLinks = document.querySelectorAll(".linksListElems");

listLinks.forEach(function(li){
    li.addEventListener("mouseenter", function(){
        this.style.color = "blue";
        this.style.fontStyle = "italic";
    });
    
    li.addEventListener("mouseleave", function() {
        this.style.color = "black";
        this.style.fontStyle = "normal";
    });
})

function rotateElement()
{
    let angle = 0;
    let direction = 1;
    
    const interval = setInterval(() => {
        angle += direction * 10; 
        notificationBell.style.rotate = `${angle}deg`;

        if (angle >= 20 || angle <= -20) {
            direction *= -1; 
        }
    }, 100);

    setTimeout(() => {
        clearInterval(interval); 
        notificationBell.style.rotate = "0deg";
    }, 2000);
}

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
    const checkbox = row.querySelector(".checkbox"); 

    if (!checkbox.checked) {
        alert("Please select the student before deleting."); 
        return;
    }

    const studentName = row.children[2].textContent;

    document.getElementById("deleteText").textContent = `Are you sure you want to delete student "${studentName}"?`;

    studentToDelete = row;

    document.getElementById("deleteModal").style.display = "block";

    document.getElementById("confirmDelete").onclick = function () {
        studentToDelete.remove();
        closeModal();
    };
}

document.getElementById("cancelDelete").addEventListener("click", closeModal());

function closeModal() {
    document.getElementById("deleteModal").style.display = "none"; 
    studentToDelete = null; 
}

document.addEventListener("DOMContentLoaded", function () {
    var mainCheckBox = document.getElementById("mainCheckBox");

    mainCheckBox.addEventListener("change", function () {
        let checkboxes = document.querySelectorAll(".checkbox");
        checkboxes.forEach(checkbox => {
            checkbox.checked = mainCheckBox.checked;
        });
    });
});



function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => document.getElementById(id).innerHTML = data);
}

