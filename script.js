
"use strict";

// ===================================
// 1. GET HTML ELEMENTS
// ===================================

const bookingForm = document.getElementById("bookingForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const purposeInput = document.getElementById("purpose");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const messageInput = document.getElementById("message");

const formMessage = document.getElementById("formMessage");
const appointmentList = document.getElementById("appointmentList");

// Confirmation popup elements
const confirmationModal =
    document.getElementById("confirmationModal");

const confirmationBookingId =
    document.getElementById("confirmationBookingId");

const closeConfirmation =
    document.getElementById("closeConfirmation");

const doneConfirmation =
    document.getElementById("doneConfirmation");


// ===================================
// 2. SET MINIMUM BOOKING DATE
// ===================================

function getTodayString() {
    const today = new Date();

    return (
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0")
    );
}

const todayString = getTodayString();

dateInput.min = todayString;


// ===================================
// 3. AVAILABLE TIME SLOTS
// ===================================

const availableTimes = [
    { value: "09:00", label: "09:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "14:00", label: "02:00 PM" },
    { value: "15:00", label: "03:00 PM" },
    { value: "16:00", label: "04:00 PM" }
];


// ===================================
// 4. LOAD SAVED APPOINTMENTS
// ===================================

let appointments = [];

try {
    const savedAppointments = JSON.parse(
        localStorage.getItem("slotMateAppointments") || "[]"
    );

    if (Array.isArray(savedAppointments)) {
        appointments = savedAppointments.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.email === "string" &&
            typeof item.phone === "string" &&
            typeof item.purpose === "string" &&
            typeof item.date === "string" &&
            typeof item.time === "string" &&
            typeof item.message === "string"
        );
    }
} catch (error) {
    console.error("Could not load saved appointments:", error);
}


// ===================================
// 5. SAVE APPOINTMENTS
// ===================================

function saveAppointments() {
    try {
        localStorage.setItem(
            "slotMateAppointments",
            JSON.stringify(appointments)
        );

        return true;
    } catch (error) {
        console.error("Could not save appointments:", error);
        return false;
    }
}


// ===================================
// 6. SHOW SUCCESS / ERROR MESSAGE
// ===================================

function showMessage(message, success) {
    formMessage.textContent = message;

    formMessage.style.color = success
        ? "#258653"
        : "#dc5454";
}


// ===================================
// 7. CHECK DUPLICATE BOOKING
// ===================================

function isSlotBooked(date, time) {
    return appointments.some(appointment =>
        appointment.date === date &&
        appointment.time === time
    );
}


// ===================================
// 8. SMART TIME SLOTS
// ===================================

function updateTimeSlots() {
    const selectedDate = dateInput.value;

    timeInput.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";

    if (!selectedDate) {
        placeholder.textContent = "Choose a date first";
        timeInput.appendChild(placeholder);
        return;
    }

    placeholder.textContent = "Choose an available time";
    timeInput.appendChild(placeholder);

    let availableCount = 0;

    availableTimes.forEach(function (slot) {
        const alreadyBooked = isSlotBooked(
            selectedDate,
            slot.value
        );

        if (!alreadyBooked) {
            const option = document.createElement("option");

            option.value = slot.value;
            option.textContent = slot.label;

            timeInput.appendChild(option);
            availableCount++;
        }
    });

    if (availableCount === 0) {
        placeholder.textContent =
            "No slots available for this date";
    }
}

dateInput.addEventListener("change", updateTimeSlots);


// ===================================
// 9. FORMAT DATE AND TIME
// ===================================

function formatDate(date) {
    const parts = date.split("-");

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const selectedDate = new Date(year, month - 1, day);

    return selectedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatTime(time) {
    const parts = time.split(":");

    let hours = Number(parts[0]);
    const minutes = parts[1];

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return hours + ":" + minutes + " " + period;
}


// ===================================
// 10. DISPLAY APPOINTMENTS
// ===================================

function displayAppointments() {
    appointmentList.replaceChildren();

    if (appointments.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const icon = document.createElement("div");
        icon.className = "empty-icon";
        icon.textContent = "🗓️";

        const heading = document.createElement("h3");
        heading.textContent = "Nothing on your calendar. Yet!";

        const paragraph = document.createElement("p");
        paragraph.textContent =
            "Your future self will thank you for planning ahead.";

        const link = document.createElement("a");
        link.href = "#booking";
        link.className = "secondary-button";
        link.textContent = "Book your first appointment";

        emptyState.append(icon, heading, paragraph, link);
        appointmentList.appendChild(emptyState);

        return;
    }

    const sortedAppointments = [...appointments].sort((a, b) =>
        (a.date + "T" + a.time).localeCompare(
            b.date + "T" + b.time
        )
    );

    sortedAppointments.forEach(appointment => {
        const card = document.createElement("article");
        card.className = "appointment-card";

        const details = document.createElement("div");
        details.className = "appointment-details";

        const heading = document.createElement("h3");
        heading.textContent = appointment.name;

        const type = document.createElement("p");
        type.textContent = appointment.purpose;

        const dateTime = document.createElement("p");
        dateTime.textContent =
            "📅 " + formatDate(appointment.date) +
            "  •  🕒 " + formatTime(appointment.time);

        const email = document.createElement("p");
        email.textContent = appointment.email;

        const bookingId = document.createElement("p");
        bookingId.textContent =
            "Booking ID: SM-" +
            appointment.id.replace(/-/g, "").slice(0, 8).toUpperCase();

        details.append(
            heading,
            type,
            dateTime,
            email,
            bookingId
        );

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "cancel-button";
        cancelButton.textContent = "Cancel appointment";

        cancelButton.addEventListener("click", function () {
            cancelAppointment(appointment.id);
        });

        card.append(details, cancelButton);
        appointmentList.appendChild(card);
    });
}


// ===================================
// 11. BOOK AN APPOINTMENT
// ===================================

bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const purpose = purposeInput.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const message = messageInput.value.trim();

    // Validate name
    if (!/[\p{L}]/u.test(name)) {
        showMessage("Please enter a valid name.", false);
        return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email address.", false);
        return;
    }

    // Validate Indian mobile number
    if (!/^[6-9]\d{9}$/.test(phone)) {
        showMessage(
            "Enter a valid 10-digit mobile number.",
            false
        );
        return;
    }

    // Validate date
    if (!date || date < getTodayString()) {
        showMessage(
            "Please select today or a future date.",
            false
        );
        return;
    }

    // Validate time
    if (!time) {
        showMessage("Please select a time slot.", false);
        return;
    }

    // Confirm selected time is one of the allowed slots
    const validTime = availableTimes.some(slot =>
        slot.value === time
    );

    if (!validTime) {
        showMessage("Please select a valid time slot.", false);
        updateTimeSlots();
        return;
    }

    // Check duplicate booking
    if (isSlotBooked(date, time)) {
        showMessage(
            "Oops! This slot is already booked. Choose another time.",
            false
        );

        updateTimeSlots();
        return;
    }

    // Create appointment
    const appointment = {
        id: crypto.randomUUID(),
        name: name,
        email: email,
        phone: phone,
        purpose: purpose,
        date: date,
        time: time,
        message: message
    };

    // Save appointment
    appointments.push(appointment);

    if (!saveAppointments()) {
        appointments.pop();

        showMessage(
            "Unable to save your booking. Please try again.",
            false
        );

        return;
    }

    // Refresh appointment list and time slots
    displayAppointments();
    updateTimeSlots();

    // Show success message
    showMessage(
        "Appointment booked successfully! 🎉",
        true
    );

    // Clear the form
    bookingForm.reset();
    dateInput.min = getTodayString();

    // Show animated confirmation popup
    showBookingConfirmation(appointment);
});


// ===================================
// 12. BOOKING CONFIRMATION POPUP
// ===================================

function showBookingConfirmation(booking) {
    if (
        !confirmationModal ||
        !confirmationBookingId ||
        !closeConfirmation ||
        !doneConfirmation
    ) {
        console.error(
            "Confirmation popup HTML is missing. Check index.html."
        );
        return;
    }

    const readableId =
        "SM-" +
        booking.id.replace(/-/g, "").slice(0, 8).toUpperCase();

    confirmationBookingId.textContent = readableId;

    confirmationModal.classList.add("show");
    confirmationModal.setAttribute("aria-hidden", "false");

    doneConfirmation.focus();
}

function hideBookingConfirmation() {
    if (!confirmationModal) {
        return;
    }

    confirmationModal.classList.remove("show");
    confirmationModal.setAttribute("aria-hidden", "true");
}

if (closeConfirmation) {
    closeConfirmation.addEventListener(
        "click",
        hideBookingConfirmation
    );
}

if (doneConfirmation) {
    doneConfirmation.addEventListener(
        "click",
        hideBookingConfirmation
    );
}

if (confirmationModal) {
    confirmationModal.addEventListener("click", function (event) {
        if (event.target === confirmationModal) {
            hideBookingConfirmation();
        }
    });
}

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        confirmationModal &&
        confirmationModal.classList.contains("show")
    ) {
        hideBookingConfirmation();
    }
});


// ===================================
// 13. CANCEL AN APPOINTMENT
// ===================================

function cancelAppointment(id) {
    const confirmed = window.confirm(
        "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
        return;
    }

    const previousAppointments = appointments;

    appointments = appointments.filter(appointment =>
        appointment.id !== id
    );

    if (!saveAppointments()) {
        appointments = previousAppointments;

        showMessage(
            "Unable to cancel the appointment. Please try again.",
            false
        );

        return;
    }

    displayAppointments();
    updateTimeSlots();

    showMessage(
        "Appointment cancelled. The time slot is available again.",
        true
    );
}


// ===================================
// 14. INITIALIZE THE WEBSITE
// ===================================

displayAppointments();
updateTimeSlots();
