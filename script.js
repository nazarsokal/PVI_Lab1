class Student {
    constructor(id, StudentGroup, firstName, lastName, gender, birthday) {
        this.id = id || Date.now();
        this.StudentGroup = StudentGroup;
        this.firstName = firstName || '';
        this.lastName = lastName || '';
        this.gender = gender || 'Select Gender';
        this.birthday = birthday || '';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded. Running GetStudents...");
    document.getElementById("addStudentModal").style.display = "none";
    document.getElementById("loginModal").style.display = "none";
    updateUserSection();
    setupLoginForm();
    GetStudents();
});

function updateUserSection() {
    const userSection = document.getElementById("userSection");
    const isLoggedIn = sessionStorage.getItem("loggedInUser");
    if (isLoggedIn) {
        userSection.innerHTML = `<h2 class="NavBarName">${isLoggedIn}</h2>`;
    } else {
        userSection.innerHTML = `<button onclick="openLoginModal()">Login</button>`;
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        loginUser(username, password);
    });
}

function loginUser(username, password) {
    const student = students.find(s => 
        `${s.firstName.toLowerCase()}_${s.lastName.toLowerCase()}` === username.toLowerCase() &&
        s.birthday === password
    );
    if (student) {
        sessionStorage.setItem("loggedInUser", `${student.firstName} ${student.lastName}`);
        closeLoginModal();
        updateUserSection();
        alert("Login successful!");
    } else {
        alert("Invalid username or password.");
    }
}

function openLoginModal() {
    document.getElementById("loginModal").style.display = "block";
}

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("loginForm").reset();
}

function checkLogin(action) {
    if (!sessionStorage.getItem("loggedInUser")) {
        openLoginModal();
        return false;
    }
    return true;
}

function openPopup(rowIndex = null) {
    if (!checkLogin()) return;

    // Show the modal in the parent page
    const modal = document.getElementById('addStudentModal');
    if (!modal) {
        console.error('Modal with ID addStudentModal not found');
        return;
    }
    modal.style.display = 'flex';

    // Store the editing index on the modal
    modal.setAttribute('data-editing-index', rowIndex);

    // Access the iframe's content
    const iframe = document.getElementById('studentIframe');
    if (!iframe || !iframe.contentDocument) {
        console.error('Iframe or iframe content not accessible');
        return;
    }
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Log the rowIndex for debugging
    console.log('rowIndex:', rowIndex);

    if (rowIndex !== null) {
        // Editing mode: Populate the form with table data
        const table = document.querySelector('#tableStudents tbody');
        if (!table) {
            console.error('Table with ID tableStudents not found');
            return;
        }
        const row = table.rows[rowIndex];
        if (!row) {
            console.error(`Row at index ${rowIndex} not found`);
            return;
        }
        const cells = row.cells;

        // Populate form fields in the iframe
        iframeDoc.getElementById('StudentGroup').value = cells[1].textContent;
        const nameParts = cells[2].textContent.replaceAll('"', '').split(' ');
        iframeDoc.getElementById('first-name').value = nameParts[0];
        iframeDoc.getElementById('last-name').value = nameParts[1] || '';
        iframeDoc.getElementById('gender').value = cells[3].textContent;
        // Convert date format from DD.MM.YYYY to YYYY-MM-DD
        const dateParts = cells[4].textContent.split('.');
        if (dateParts.length === 3) {
            iframeDoc.getElementById('birthday').value = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
        console.log('Group from table:', cells[1].textContent);

        // Set student ID
        iframeDoc.getElementById('student-id').value = row.getAttribute('data-id') || '';
        
        // Update title to "Edit Student"
        iframeDoc.getElementById('title').textContent = 'Edit Student';
    } else {
        // Adding mode: Reset the form
        const form = iframeDoc.getElementById('add-student-form');
        if (form) {
            form.reset();
            iframeDoc.getElementById('student-id').value = ''; // Clear ID
            iframeDoc.getElementById('title').textContent = 'Add Student';
        } else {
            console.error('Form with ID add-student-form not found in iframe');
        }
    }
}


function closePopup() {
    document.getElementById('addStudentModal').style.display = 'none';
}

var i = 0;

function setValue(data) {
    if (!checkLogin()) return;
    console.log('Received form data in parent window:', data);

    const form = document.getElementById('addStudentModal');
    const editingIndex = form.getAttribute('data-editing-index');

    const studentObj = new Student(
        data['id'], data['StudentGroup'], data['firstName'],
        data['lastName'], data['gender'], data['birthday']
    );

    console.log("Student Object", JSON.stringify(studentObj));

    const url = editingIndex === "null" ? 'server/api/students/create' : 'server/api/students/update';
    const method = 'POST';

    fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(studentObj)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        //GetStudents(); // Refresh the table
    })
    .catch(error => console.error('Error:', error));  

    form.setAttribute('data-editing-index', "null");
    closePopup();
}


let students = [];

function GetStudents() {
    fetch('server/api/students/index')
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
        .then(jsonArray => {
            console.log(jsonArray);
            students = jsonArray.map(s => new Student(s.id, s.StudentGroup ,s.firstName, s.lastName, s.gender, s.birthday));
            console.log('Students loaded', students);
            InsertToTable(students);
    })
        .catch(error => console.error('Error: ', error));
}

function InsertToTable(studentList) {
    const table = document.getElementById('tableStudents');
    const tbody = table.querySelector("tbody");

    console.log('Students count', studentList.length);
    for (let index = 0; index < studentList.length; index++) {
        console.log(studentList[index]);
        if(studentList[index].firstName === "Nazar" || studentList[index].lastName === "Sokalchuk") {
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
        } else {
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
    if (!checkLogin()) return;
    var row = button.closest("tr");

    var studentData = {
        group: row.cells[1].textContent,
        firstName: row.cells[2].textContent.split(" ")[0],
        lastName: row.cells[2].textContent.split(" ")[1],
        gender: row.cells[3].textContent,
        birthday: row.cells[4].textContent.split(".").reverse().join("-")
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
    requestAnimationFrame(rotateElement);
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

function rotateElement() {
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
    if (!checkLogin()) return;
    var row = button.parentNode.parentNode;
    alert(`Editing ${row.cells[2].textContent}`);
}

let studentToDelete = null; 

function showDeleteConfirmation(button) {
    if (!checkLogin()) return;
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
        const ids = selectedRows.map(row => row.getAttribute('data-id'));
        console.log(ids);
    
        fetch('server/api/students/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ids })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text().then(text => text ? JSON.parse(text) : {});
        })
        .then(data => {
            console.log(data);
            // GetStudents(); // Refresh table after deletion
        })
        .catch(error => console.error('Error:', error));
        
        closeModal();
    };
    
}

document.getElementById("cancelDelete").addEventListener("click", closeModal);

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