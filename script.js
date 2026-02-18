let selectedClass = ""; // salvestab, millise klassi kasutaja valis

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

// --- REGISTREERIMINE ---
function register() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Täida kõik väljad!");
        return;
    }

    let users = getUsers();

    if (users.find(u => u.username === username)) {
        alert("Kasutajanimi juba olemas!");
        return;
    }

    users.push({ username, password });
    saveUsers(users);

    alert("Kasutaja loodud!");
}

// --- LOGIN ---
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let users = getUsers();
    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("loggedInUser", username);
        // Näita klassi valiku ekraani
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("classSelectSection").style.display = "block";
    } else {
        alert("Vale kasutajanimi või parool!");
    }
}

// --- KLASSI VALIK ---
function selectClass() {
    let cls = document.getElementById("userClass").value;
    if (!cls) {
        alert("Palun vali klass!");
        return;
    }
    selectedClass = cls;
    localStorage.setItem("userClass", selectedClass);
    showCalendar();
}

// --- LOGOUT ---
function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userClass");
    location.reload();
}

// --- NÄITA KALENDRIT ---
function showCalendar() {
    document.getElementById("classSelectSection").style.display = "none";
    document.getElementById("calendarSection").style.display = "block";

    document.getElementById("currentUser").innerText =
        "Sisselogitud: " + localStorage.getItem("loggedInUser") +
        " | Klass: " + localStorage.getItem("userClass");

    displayBookings();
}

// --- FORMATEERI KUUPÄEV ja 24h kellaaeg ---
function formatDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return "";
    let d = new Date(dateStr + "T" + timeStr);
    return d.toLocaleString("et-EE", { hour12: false });
}

// --- KONTROLLI TOPPEKIMIST ---
function isDoubleBooking(room, date, start, end) {
    let bookings = getBookings();
    return bookings.find(b =>
        b.room === room &&
        b.date === date &&
        !(b.end <= start || b.start >= end)
    );
}

// --- LISAME BRONEERINGU ---
function addBooking() {
    let room = document.getElementById("room").value;
    let date = document.getElementById("date").value;
    let start = document.getElementById("start").value;
    let end = document.getElementById("end").value;
    let title = document.getElementById("title").value;
    let user = localStorage.getItem("loggedInUser");
    let cls = localStorage.getItem("userClass");

    if (!date || !start || !end || !title) {
        alert("Täida kõik väljad!");
        return;
    }

    if (isDoubleBooking(room, date, start, end)) {
        alert("See ruum on sellel ajal juba broneeritud!");
        return;
    }

    let bookings = getBookings();

    bookings.push({
        room,
        date,
        start,
        end,
        title,
        user,
        cls // salvestame ka klassi
    });

    saveBookings(bookings);
    displayBookings();
}

// --- NÄITAME BRONEERINGUID ---
function displayBookings() {
    let list = document.getElementById("bookingList");
    list.innerHTML = "";

    let bookings = getBookings();

    // Filtreeri ainult valitud klassi broneeringud
    let cls = localStorage.getItem("userClass");
    bookings = bookings.filter(b => b.cls === cls);

    bookings.sort((a, b) =>
        new Date(a.date + "T" + a.start) -
        new Date(b.date + "T" + b.start)
    );

    let now = new Date();
    let current = null;
    let next = null;

    bookings.forEach(b => {
        let startDate = new Date(b.date + "T" + b.start);
        let endDate = new Date(b.date + "T" + b.end);

        if (startDate <= now && endDate >= now) current = b;
        if (startDate > now && !next) next = b;

        let li = document.createElement("li");
        li.innerText =
            `Ruum: ${b.room} | ` +
            `Algus: ${formatDateTime(b.date, b.start)} | ` +
            `Lõpp: ${formatDateTime(b.date, b.end)} | ` +
            `Põhjus: ${b.title} | ` +
            `Kasutaja: ${b.user}`;
        list.appendChild(li);
    });

    document.getElementById("currentBooking").innerText =
        current ? `🔴 Hetkel: ${current.room} - ${current.title} (${formatDateTime(current.date, current.start)} - ${formatDateTime(current.date, current.end)})`
                : "Hetkel ei toimu broneeringut";

    document.getElementById("nextBooking").innerText =
        next ? `🟢 Järgmine: ${next.room} - ${next.title} (${formatDateTime(next.date, next.start)} - ${formatDateTime(next.date, next.end)})`
             : "Järgmine broneering puudub";
}

// --- WINDOW ONLOAD ---
window.onload = function() {
    if (localStorage.getItem("loggedInUser")) {
        if (localStorage.getItem("userClass")) {
            showCalendar();
        } else {
            document.getElementById("loginSection").style.display = "none";
            document.getElementById("classSelectSection").style.display = "block";
        }
    }
};
