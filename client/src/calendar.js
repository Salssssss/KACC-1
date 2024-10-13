// calendar.js

export function generateCalendarHTML() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    const today = date.getDate();

    // Add month and year at the top
    let calendarHTML = `<div class="calendar-header">
                            <span class="calendar-month">${monthNames[month]}</span>
                            <span class="calendar-year">${year}</span>
                        </div>`;

    calendarHTML += '<table><thead><tr>';
    days.forEach(day => {
        calendarHTML += `<th>${day}</th>`;
    });
    calendarHTML += '</tr></thead><tbody><tr>';

    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<td></td>';
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        if ((day + firstDay - 1) % 7 === 0 && day !== 1) {
            calendarHTML += '</tr><tr>';
        }

        if (day === today) {
            calendarHTML += `<td class="today">${day}</td>`; // Highlight today's date
        } else {
            calendarHTML += `<td>${day}</td>`;
        }
    }
    calendarHTML += '</tr></tbody></table>';
    return { __html: calendarHTML };
}
