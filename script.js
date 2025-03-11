class Student {
    constructor(data) {
        this.group = data.group || 'Select Group';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.gender = data.gender || 'Select Gender';
        this.birthday = data.birthday || '';
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    isAdult() {
        const birthDate = new Date(this.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
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