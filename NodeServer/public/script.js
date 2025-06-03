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

let students = [];
let socket = null;

document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOM fully loaded. Running GetStudents...");
    document.getElementById("addStudentModal").style.display = "none";
    document.getElementById("loginModal").style.display = "none";
    updateUserSection();
    setupLoginForm();
    await GetStudents();
    initializeSocket();
});

function initializeSocket() {
    socket = io("http://localhost:3000");
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        if (sessionStorage.getItem("loggedInUserId")) {
            socket.emit('register', sessionStorage.getItem("loggedInUserId"));
        }
    });
    socket.on('user status update', (data) => {
        const { userId, status } = data;
        console.log(`User ${userId} status updated to ${status}`);
        updateStudentStatus(userId, status);
    });
}

function updateStudentStatus(userId, status) {
    const table = document.getElementById("tableStudents");
    const row = table.querySelector(`tr[data-id="${userId}"]`);
    if (row) {
        const statusCell = row.cells[5];
        const statusIndicator = statusCell.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator ' + (status === 'online' ? 'status-online' : 'status-offline');
        }
    }
}

document.getElementById('MessagesLink').addEventListener("click", async function () {
    if (!checkLogin()) return;
    let studentFromSession = sessionStorage.getItem("loggedInUserName");
    const student = students.find(s => 
        s.firstName.toLowerCase() === studentFromSession.split(' ')[0].toLowerCase() &&
        s.lastName.toLowerCase() === studentFromSession.split(' ')[1].toLowerCase()
    );
    fetch('/Messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
    }).then(() => {
        window.location.href = '/message.html';
    });
});

function updateUserSection() {
    const userSection = document.getElementById("userSection");
    const isLoggedIn = sessionStorage.getItem("loggedInUserName");
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
        sessionStorage.setItem("loggedInUserId", student.id);
        sessionStorage.setItem("loggedInUserName", `${student.firstName} ${student.lastName}`);
        closeLoginModal();
        updateUserSection();
        if (socket) {
            socket.emit('register', student.id);
        }
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

function checkLogin() {
    if (!sessionStorage.getItem("loggedInUserName")) {
        openLoginModal();
        return false;
    }
    return true;
}

function openPopup(rowIndex = null) {
    if (!checkLogin()) return;
    const modal = document.getElementById('addStudentModal');
    if (!modal) {
        console.error('Modal with ID addStudentModal not found');
        return;
    }
    modal.style.display = 'flex';
    modal.setAttribute('data-editing-index', rowIndex);
    const iframe = document.getElementById('studentIframe');
    if (!iframe || !iframe.contentDocument) {
        console.error('Iframe or iframe content not accessible');
        return;
    }
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    console.log('rowIndex:', rowIndex);
    if (rowIndex !== null) {
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
        iframeDoc.getElementById('StudentGroup').value = cells[1].textContent;
        const nameParts = cells[2].textContent.replaceAll('"', '').split(' ');
        iframeDoc.getElementById('first-name').value = nameParts[0];
        iframeDoc.getElementById('last-name').value = nameParts[1] || '';
        iframeDoc.getElementById('gender').value = cells[3].textContent;
        const dateParts = cells[4].textContent.split('.');
        if (dateParts.length === 3) {
            iframeDoc.getElementById('birthday').value = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
        iframeDoc.getElementById('student-id').value = row.getAttribute('data-id') || '';
        iframeDoc.getElementById('title').textContent = 'Edit Student';
    } else {
        const form = iframeDoc.getElementById('add-student-form');
        if (form) {
            form.reset();
            iframeDoc.getElementById('student-id').value = '';
            iframeDoc.getElementById('title').textContent = 'Add Student';
        } else {
            console.error('Form with ID add-student-form not found in iframe');
        }
    }
}

function closePopup() {
    document.getElementById('addStudentModal').style.display = 'none';
}

async function setValue(data) {
    if (!checkLogin()) return;
    console.log('Received form data in parent window:', data);
    const form = document.getElementById('addStudentModal');
    const editingIndex = form.getAttribute('data-editing-index');
    const studentObj = new Student(
        data['id'], data['StudentGroup'], data['firstName'],
        data['lastName'], data['gender'], data['birthday']
    );
    console.log("Student Object", JSON.stringify(studentObj));
    const url = editingIndex === "null" ? 'http://localhost/server/api/students/create' : 'http://localhost/server/api/students/update';
    const method = 'POST';
    try {
        const response = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(studentObj)
        });
        if (response.status === 400) {
            const err = await response.json();
            alert(err.error || "This user already exists");
            throw new Error(err.error);
        }
        const result = await response.json();
        console.log('Server response:', result);
        if (editingIndex === "null") {
            // Adding new student
            students.push(studentObj);
        } else {
            // Updating existing student
            const table = document.querySelector('#tableStudents tbody');
            const rowIndex = parseInt(editingIndex);
            const globalIndex = currentStartIndex + rowIndex;
            students[globalIndex] = studentObj;
        }
        // Fetch updated statuses and re-render table
        const statusResponse = await fetch("http://localhost:3000/api/user-status");
        const userStatuses = await statusResponse.json();
        InsertToTable(students, userStatuses);
    } catch (error) {
        console.error('Error:', error);
    }
    form.setAttribute('data-editing-index', "null");
    closePopup();
}

async function GetStudents() {
    try {
        const response = await fetch('http://localhost/server/api/students/index');
        console.log('Response status:', response.status);
        if (!response.ok) {
            alert(`HTTP error! Status: ${response.status}`);
            return;
        }
        const jsonArray = await response.json();
        students = jsonArray.map(s => new Student(s.id, s.StudentGroup, s.firstName, s.lastName, s.gender, s.birthday));
        console.log('Students loaded', students);
        const statusResponse = await fetch("http://localhost:3000/api/user-status");
        const userStatuses = await statusResponse.json();
        console.log('Initial user statuses:', userStatuses);
        InsertToTable(students, userStatuses);
    } catch (error) {
        console.error('Error: ', error);
    }
}

let currentStartIndex = 0;
const pageSize = 5;

function InsertToTable(studentList, userStatuses = {}) {
    const table = document.getElementById('tableStudents');
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = '';
    const visibleStudents = studentList.slice(currentStartIndex, currentStartIndex + pageSize);
    console.log('Students count', studentList.length);
    for (let index = 0; index < visibleStudents.length; index++) {
        const student = visibleStudents[index];
        const status = userStatuses[student.id] || 'offline';
        const row = document.createElement("tr");
        row.setAttribute('data-id', student.id);
        row.innerHTML = `
            <td><input type="checkbox" class="checkbox"></td>
            <td>${student.StudentGroup}</td>
            <td${student.firstName === "Nazar" && student.lastName === "Sokalchuk" ? ' style="color: blue;"' : ''}>
                ${student.firstName === "Nazar" && student.lastName === "Sokalchuk" ? `"${student.firstName} ${student.lastName}"` : `${student.firstName} ${student.lastName}`}
            </td>
            <td>${student.gender}</td>
            <td>${student.birthday.split("-").reverse().join(".")}</td>
            <td><span class="status-indicator ${status === 'online' ? 'status-online' : 'status-offline'}"></span></td>
            <td>
                <button class="bottomButtons" onclick="openPopup(${index})">Edit</button>
                <button onclick="showDeleteConfirmation(this)" class="bottomButtons">X</button>
            </td>
        `;
        tbody.appendChild(row);
    }
}

function nextPage() {
    if (currentStartIndex + pageSize < students.length) {
        currentStartIndex += pageSize;
        InsertToTable(students);
    }
}

function prevPage() {
    if (currentStartIndex - pageSize >= 0) {
        currentStartIndex -= pageSize;
        InsertToTable(students);
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
    if (!checkLogin()) return;
    let studentFromSession = sessionStorage.getItem("loggedInUserName");
    const student = students.find(s => 
        s.firstName.toLowerCase() === studentFromSession.split(' ')[0].toLowerCase() &&
        s.lastName.toLowerCase() === studentFromSession.split(' ')[1].toLowerCase()
    );
    fetch('/Messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
    }).then(() => {
        window.location.href = '/message.html';
    });
});

let angle = 0;
notificationBell.addEventListener("mouseenter", function() {
    if (!checkLogin()) return;
    popup.style.display = "block";
    requestAnimationFrame(rotateElement);
});

var listLinks = document.querySelectorAll(".linksListElems");

listLinks.forEach(function(li) {
    li.addEventListener("mouseenter", function() {
        this.style.color = "blue";
        this.style.fontStyle = "italic";
    });
    li.addEventListener("mouseleave", function() {
        this.style.color = "black";
        this.style.fontStyle = "normal";
    });
});

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

userLogo.addEventListener("click", function() {
    if (userSettPopup.style.display === "block") {
        userSettPopup.style.display = "none";
    } else {
        userSettPopup.style.display = "block";
    }
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
    document.getElementById("confirmDelete").onclick = async function () {
        const ids = selectedRows.map(row => row.getAttribute('data-id'));
        console.log('Deleting student IDs:', ids);
        try {
            const response = await fetch('http://localhost/server/api/students/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ids })
            });
            if (!response.ok) {
                alert('Network response was not ok');
                return;
            }
            const data = await response.text().then(text => text ? JSON.parse(text) : {});
            console.log('Delete response:', data);
            // Remove deleted students from the students array
            students = students.filter(student => !ids.includes(student.id));
            // Fetch updated statuses and re-render table
            const statusResponse = await fetch("http://localhost:3000/api/user-status");
            const userStatuses = await statusResponse.json();
            InsertToTable(students, userStatuses);
        } catch (error) {
            console.error('Error:', error);
        }
        closeModal();
    };
}

document.getElementById("cancelDelete").addEventListener("click", closeModal);

function closeModal() {
    document.getElementById("deleteModal").style.display = "none"; 
    studentToDelete = null; 
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