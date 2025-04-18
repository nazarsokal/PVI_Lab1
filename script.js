class Student {
    constructor(id, StudentGroup, firstName, lastName, gender, birthday) {
        this.id = id || Date.now(); // Генеруємо унікальний ID, якщо його немає
        this.StudentGroup = StudentGroup || 'Select Group';
        this.firstName = firstName || '';
        this.lastName = lastName || '';
        this.gender = gender || 'Select Gender';
        this.birthday = birthday || '';
    }
}

// Очікуємо завантаження документа
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded. Running GetStudents...");
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

    const studentObj = new Student(data['id'], data['StudentGroup'] ,data['firstName'] ,data['lastName'],data['gender'],data['birthday']);
    const form = document.getElementById('addStudentModal');

    console.log("New Student");
    console.log(JSON.stringify(studentObj));

    fetch('server/api/students/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(studentObj)
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error: ', error));  

    form.setAttribute('data-editing-index', "null");
    closePopup();

    // // Вивід зміненого JSON-об'єкта в консоль
    // // console.log("Updated Student List:");
    // let studentList = [];
    // document.querySelectorAll("#tableStudents tbody tr").forEach(row => {
    //     studentList.push({
    //         id: row.getAttribute("data-id"),
    //         group: row.cells[1].textContent,
    //         firstName: row.cells[2].textContent.split(" ")[0],
    //         lastName: row.cells[2].textContent.split(" ")[1],
    //         gender: row.cells[3].textContent,
    //         birthday: row.cells[4].textContent.split(".").reverse().join("-")
    //     });
    // });
    // // console.log(JSON.stringify(studentList, null, 2));


}
let studensts = [];

function GetStudents()
{
    fetch('server/api/students/index')
    .then(response => {
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Return the parsed JSON body
        return response.json();
    })
        .then(jsonArray => {
            console.log(jsonArray);
            studensts = jsonArray.map(s => new Student(s.id, s.StudentGroup ,s.firstName, s.lastName, s.gender, s.birthday));
            console.log('Students loaded', studensts);

            InsertToTable(studensts);
    })
        .catch(error => console.error('Error: ', error));
}

function InsertToTable(studentList)
{
    const table = document.getElementById('tableStudents');
    const tbody = table.querySelector("tbody");

    console.log('Students count', studentList.length);
    for (let index = 0; index < studentList.length; index++) {
        console.log(studentList[index]);
        if(studentList[index].firstName === "Nazar" || studentList[index].lastName === "Sokalchuk")
        {
            const newRow = document.createElement("tr");
            newRow.setAttribute('data-id', studentList[index].id);
            newRow.innerHTML = `
                <td><input type="checkbox" class="checkbox"></td>
                <td>${studentList[index].StudentGroup}</td>
                <td style="color: blue;">"${studentList[index].firstName} ${studentList[index].lastName}"</td>
                <td>${studentList[index].gender}</td>
                <td>${studentList[index].birthday.split("-").reverse().join(".")}</td>
                <td><input type="radio" class="status" id="status${i}"><label style="visibility: hidden;" for="status${i}">lb</label></td>
                <td>
                    <button class="bottomButtons" onclick="openPopup(${tbody.rows.length})">Edit</button>
                    <button onclick="showDeleteConfirmation(this)" class="bottomButtons">X</button>
                </td>
            `;
            tbody.appendChild(newRow);   
        }
        else
        {
            const newRow = document.createElement("tr");
            newRow.setAttribute('data-id', studentList[index].id);
            newRow.innerHTML = `
                <td><input type="checkbox" class="checkbox"></td>
                <td>${studentList[index].StudentGroup}</td>
                <td>${studentList[index].firstName} ${studentList[index].lastName}</td>
                <td>${studentList[index].gender}</td>
                <td>${studentList[index].birthday.split("-").reverse().join(".")}</td>
                <td><input type="radio" class="status" id="status${i}"><label style="visibility: hidden;" for="status${i}">lb</label></td>
                <td>
                    <button class="bottomButtons" onclick="openPopup(${tbody.rows.length})">Edit</button>
                    <button onclick="showDeleteConfirmation(this)" class="bottomButtons">X</button>
                </td>
            `;
            tbody.appendChild(newRow);
        }   
    }
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
    GetStudents();
    function updateRowCheckboxes() {
        const rowCheckBoxes = tableBody.querySelectorAll(".checkbox");
        rowCheckBoxes.forEach(checkbox => {
            checkbox.checked = mainCheckBox.checked;
        });
    }

    mainCheckBox.addEventListener("change", updateRowCheckboxes);
});


