class Student {
    constructor(data) {
        this.group = data.group || 'Select Group';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.gender = data.gender || 'Select Gender';
        this.birthday = data.birthday || '';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("addStudentModal").style.display = "none";
});

function openPopup(rowIndex = null) {
    document.getElementById('addStudentModal').style.display = 'flex';
    document.getElementById('addStudentModal').setAttribute('data-editing-index', rowIndex);
    
    if (rowIndex !== null) {
        const row = document.querySelector(`#tableStudents tbody`).rows[rowIndex];
        const cells = row.cells;
        
        document.getElementById('group').value = cells[1].textContent;
        const nameParts = cells[2].textContent.split(" ");
        document.getElementById('first-name').value = nameParts[0];
        document.getElementById('last-name').value = nameParts[1];
        document.getElementById('gender').value = cells[3].textContent;
        document.getElementById('birthday').value = cells[4].textContent.split(".").reverse().join("-");
    } else {
        document.getElementById('add-student-form').reset();
    }
}

function closePopup() {
    document.getElementById('addStudentModal').style.display = 'none';
}

var i = 0;

function setValue(data) {
    console.log('Received form data in parent window:', data);

    const studentObj = new Student(data);
    const table = document.getElementById('tableStudents');
    const tbody = table.querySelector("tbody");
    const form = document.getElementById('addStudentModal');

    if (!form) {
        console.error('Form element not found!');
        return;
    }

    let editingIndex = form.getAttribute('data-editing-index');

    // Ensure editingIndex is a number
    editingIndex = editingIndex !== "null" && editingIndex !== null ? parseInt(editingIndex, 10) : null;

    if (editingIndex !== null && !isNaN(editingIndex) && tbody.rows[editingIndex]) {
        // Update existing row
        console.log(`Updating student at index ${editingIndex}`);
        const row = tbody.rows[editingIndex];
        row.cells[1].textContent = studentObj.group;
        row.cells[2].textContent = `${studentObj.firstName} ${studentObj.lastName}`;
        row.cells[3].textContent = studentObj.gender;
        row.cells[4].textContent = studentObj.birthday.split("-").reverse().join(".");
    } else {
        // Add new row
        console.log("Adding new student");

        // Ensure `i` is properly defined
        if (typeof i === "undefined") {
            window.i = tbody.rows.length; // Start from existing row count
        }

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="checkbox" class="checkbox" id="checkbox${i}"><label style="visibility: hidden;" for="checkbox${i}">lb</label></td>
            <td>${studentObj.group}</td>
            <td>${studentObj.firstName} ${studentObj.lastName}</td>
            <td>${studentObj.gender}</td>
            <td>${studentObj.birthday.split("-").reverse().join(".")}</td>
            <td><input type="radio" class="status" id="status${i}"><label style="visibility: hidden;" for="status${i}">lb</label></td>
            <td>
                <button class="bottomButtons" onclick="openPopup(${tbody.rows.length})">Edit</button>
                <button onclick="showDeleteConfirmation(this)" class="bottomButtons">X</button>
            </td>
        `;
        tbody.appendChild(newRow);
        i++;
    }

    // Reset editing index after action
    form.setAttribute('data-editing-index', "null");

    closePopup();
}



function updateStudent(row, data) {
    if (!row) return;

    row.cells[1].textContent = data.group;
    row.cells[2].textContent = `${data.firstName} ${data.lastName}`;
    row.cells[3].textContent = data.gender;
    row.cells[4].textContent = data.birthday.split("-").reverse().join(".");
}

function editStudent(button) {
    var row = button.closest("tr");

    var studentData = {
        group: row.cells[1].textContent,
        firstName: row.cells[2].textContent.split(" ")[0],
        lastName: row.cells[2].textContent.split(" ")[1],
        gender: row.cells[3].textContent,
        birthday: row.cells[4].textContent.split(".").reverse().join("-") // Convert back to YYYY-MM-DD
    };

    openPopup(studentData, row);
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
    const table = document.getElementById("tableStudents");
    const checkboxes = table.querySelectorAll(".checkbox:checked"); 
    const selectedRows = Array.from(checkboxes).map(checkbox => checkbox.closest("tr"));

    if (selectedRows.length === 0) {
        alert("Please select at least one student before deleting."); 
        return;
    }

    const studentNames = selectedRows.map(row => row.children[2].textContent).join(", ");

    document.getElementById("deleteText").textContent = `Are you sure you want to delete the selected students: "${studentNames}"?`;

    document.getElementById("deleteModal").style.display = "block";

    document.getElementById("confirmDelete").onclick = function () {
        selectedRows.forEach(row => row.remove());
        closeModal();
    };
}


document.getElementById("cancelDelete").addEventListener("click", closeModal());

function closeModal() {
    document.getElementById("deleteModal").style.display = "none"; 
    studentToDelete = null; 
}

function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => document.getElementById(id).innerHTML = data);
}

document.addEventListener("DOMContentLoaded", function () {
    const mainCheckBox = document.querySelector(".mainCheckBox");
    const tableBody = document.querySelector("#tableStudents tbody");

    function updateRowCheckboxes() {
        const rowCheckBoxes = tableBody.querySelectorAll(".checkbox");
        rowCheckBoxes.forEach(checkbox => {
            checkbox.checked = mainCheckBox.checked;
        });
    }

    mainCheckBox.addEventListener("change", updateRowCheckboxes);
});

