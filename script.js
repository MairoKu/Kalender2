function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getBookings() {
    return JSON.parse(localStorage.getItem("bookings")) || [];
}

function saveBookings(bookings) {
    localStorage.setItem("bookings", JSON.stringify(bookings));
}

function register() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let users = getUsers();
    if (users.find(u => u.username === username)) {
        alert("Kasutajanimi juba olemas!");
        return;
    }

    users.push({username, password});
    saveUsers(users);
    alert("Kasutaja loodud!");
}

function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let users = getUsers();
    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("loggedInUser", username);
        showCalendar();
    } else {
        alert("Vale kasutajanimi või parool");
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    location.reload();
}

function showCalendar() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("calendarSection").style.display = "block";
    document.getElementById("currentUser").innerText =
        "Sisselogitud: " + localStorage.getItem("loggedInUser");
    displayBookings();
}

function formatDateTime(dateStr, timeStr) {
    let date = new Date(dateStr + "T" + timeStr);
    return date.toLocaleString("et-EE");
}

function isDoubleBooking(room, date, start, end) {
    let bookings = getBookings();
    return bookings.find(b =>
        b.room === room &&
        b.date === date &&
        !(b.end <= start || b.start >= end)
    );
}

function addBooking() {
    let room = document.getElementById("room").value;
    let date = document.getElementById("date").value;
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let title = document.getElementById("title").value;
    let user = localStorage.getItem("loggedInUser");

    if (isDoubleBooking(room, date, start, end)) {
        alert("See ruum on sellel ajal juba broneeritud!");
        return;
    }

    let bookings = getBookings();
    bookings.push({room, date, start, end, title, user});
    saveBookings(bookings);

    displayBookings();
}

function displayBookings() {
    let list = document.getElementById("bookingList");
    list.innerHTML = "";

    let bookings = getBookings();
    bookings.sort((a,b) => new Date(a.date+"T"+a.start) - new Date(b.date+"T"+b.start));

    let now = new Date();
    let current = null;
    let next = null;

    bookings.forEach(b => {
        let startDate = new Date(b.date + "T" + b.start);
        let endDate = new Date(b.date + "T" + b.end);

        if (startDate <= now && endDate >= now) {
            current = b;
        }

        if (startDate > now && !next) {
            next = b;
        }

        let li = document.createElement("li");
        li.innerText =
            b.room + " | " +
            formatDateTime(b.date, b.start) + " - " +
            b.end +
            " | " + b.title +
            " | Kasutaja: " + b.user;
        list.appendChild(li);
    });

    document.getElementById("currentBooking").innerText =
        current ?
        "🔴 Hetkel: " + current.room + " - " + current.title :
        "Hetkel ei toimu broneeringut";

    document.getElementById("nextBooking").innerText =
        next ?
        "🟢 Järgmine: " + next.room + " - " + next.title :
        "Järgmine broneering puudub";
}

window.onload = function() {
    if (localStorage.getItem("loggedInUser")) {
        showCalendar();
    }
};
