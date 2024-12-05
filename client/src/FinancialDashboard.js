import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import './FinancialDashboard.css';

Chart.register(...registerables);

let barChartInstance = null;
let pieChartInstance = null;

const FinancialDashboard = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [divisionData, setDivisionData] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [headers, setHeaders] = useState([]); // For dynamic table headers
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const revenueResponse = await axios.get('http://localhost:5000/api/revenue');
                const divisionResponse = await axios.get('http://localhost:5000/api/division-revenue');
                const expenseResponse = await axios.get('http://localhost:5000/api/expenses');

                setRevenueData(revenueResponse.data);
                setDivisionData(divisionResponse.data);

                // Calculate the last 3 months dynamically
                const now = new Date();
                const monthNames = [
                    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
                    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
                ];
                const prevMonths = [
                    monthNames[(now.getMonth() - 2 + 12) % 12], // 2 months ago
                    monthNames[(now.getMonth() - 1 + 12) % 12], // 1 month ago
                    monthNames[now.getMonth()]                 // Current month
                ];
                setHeaders(prevMonths); // Set dynamic headers

                // Filter expenses to include only the last 3 months
                const filteredExpenses = expenseResponse.data.map(expense => ({
                    type: expense.type,
                    total: expense.total,
                    months: prevMonths.map(month => ({
                        month,
                        value: expense[month],
                    })),
                }));

                setExpenses(filteredExpenses);
                setLoading(false);

                // Render charts after data is loaded
                renderBarChart(
                    'barChartCanvas',
                    revenueResponse.data.map((item) => item.month),
                    revenueResponse.data.map((item) => item.revenue),
                    'Revenue'
                );

                renderPieChart(
                    'pieChartCanvas',
                    divisionResponse.data.map((item) => item.division),
                    divisionResponse.data.map((item) => item.value)
                );
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderBarChart = (elementId, labels, data, title) => {
        const ctx = document.getElementById(elementId).getContext('2d');
        if (barChartInstance) barChartInstance.destroy();

        barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: title,
                        data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    };

    const renderPieChart = (elementId, labels, data) => {
        const ctx = document.getElementById(elementId).getContext('2d');
        if (pieChartInstance) pieChartInstance.destroy();

        pieChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: ['#4caf50', '#ffeb3b', '#f44336'],
                    },
                ],
            },
            options: {
                responsive: true,
            },
        });
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="dashboard-container">
            <h2>Financial Reporting Dashboard</h2>

            <div className="charts-container">
                <div className="pie-chart">
                    <h3>Revenue by Division</h3>
                    <canvas id="pieChartCanvas"></canvas>
                </div>

                <div className="bar-chart">
                    <h3>Revenue vs Operating Margin</h3>
                    <canvas id="barChartCanvas"></canvas>
                </div>
            </div>

            <div className="data-table">
                <h3>Expense Breakdown (Last 3 Months)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Expense Type</th>
                            <th>Total</th>
                            {headers.map((month, index) => (
                                <th key={index}>{month.toUpperCase()}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense, index) => (
                            <tr key={index}>
                                <td>{expense.type}</td>
                                <td>{expense.total}</td>
                                {expense.months.map((monthData, idx) => (
                                    <td key={idx}>{monthData.value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialDashboard;
