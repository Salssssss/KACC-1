document.addEventListener('DOMContentLoaded', function() {
    const calendarButton = document.getElementById('calendarButton');
    const calendar = document.getElementById('calendar');

    calendarButton.addEventListener('click', function() {
        if (calendar.style.display === 'none' || calendar.style.display === '') {
            calendar.style.display = 'block';
        } else {
            calendar.style.display = 'none';
        }
    });

    // Function to generate calendar content
    function generateCalendar() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const date = new Date();
        const month = date.getMonth();
        const year = date.getFullYear();

        let calendarHTML = '<table><tr>';
        days.forEach(day => {
            calendarHTML += `<th>${day}</th>`;
        });
        calendarHTML += '</tr><tr>';

        // Get the first day of the month
        const firstDay = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<td></td>';
        }

        // Get the number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            if ((day + firstDay - 1) % 7 === 0) {
                calendarHTML += '</tr><tr>';
            }
            calendarHTML += `<td>${day}</td>`;
        }
        calendarHTML += '</tr></table>';

        calendar.innerHTML = calendarHTML;
    }

    generateCalendar();
});
