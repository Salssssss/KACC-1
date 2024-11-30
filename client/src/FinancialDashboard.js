//Chart.js documentation: https://www.chartjs.org/docs/latest/getting-started/usage.html 
//Additional guide: https://www.youtube.com/watch?v=6q5d3Z1-5kQ 
import React, { useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import './FinancialDashboard.css';

//Register all chart.js components (scales, controllers, plugins, etc)
//Spread syntax again to include every single component more concisely 
//I was getting the bug: "linear" is not a regitered scale. This line fixed that
Chart.register(...registerables);

let barChartInstance = null;
let pieChartInstance = null;

/**
 * Renders a bar chart.
 * @param {string} elementId - The ID of the canvas element to render the chart in.
 * @param {Array<string>} labels - Array of labels for the x-axis.
 * @param {Array<number>} data - Array of data values corresponding to each label.
 * @param {string} title - The title of the chart.
 */
function renderBarChart(elementId, labels, data, title) {
    const ctx = document.getElementById(elementId).getContext('2d');

    //Destroy previous instance if it exists
    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: title,
                    data: data,
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
}

/**
 * Renders a pie chart.
 * @param {string} elementId - The ID of the canvas element to render the chart in.
 * @param {Array<string>} labels - Array of labels for each pie section.
 * @param {Array<number>} data - Array of values for each pie section.
 */
function renderPieChart(elementId, labels, data) {
    const ctx = document.getElementById(elementId).getContext('2d');

    //Destroy previous instance if it exists
    if (pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        //One of the requirements says to display using three color codes:
                        '#4caf50',  //Green
                        '#ffeb3b',  //Yellow
                        '#f44336'], //Red
                },
            ],
        },
        options: {
            responsive: true,
        },
    });
}

const FinancialDashboard = () => {
    useEffect(() => {
        //Bar Chart
        //Can modify later to dynamically load ratio data
        renderBarChart('barChartCanvas', ['Jan', 'Feb', 'Mar'], [50, 75, 100], 'Revenue');
        
        //Pie Chart
        //Can modify later to dynamically load the ratio data
        renderPieChart('pieChartCanvas', ['Operating Division', 'Capital Solutions', 'Hedge Fund Strategies'], [60, 30, 10]);
    }, []);

    return (
        <div className="dashboard-container">
            <h2>Financial Reporting Dashboard</h2>

            {/* I copied the names of the charts from the image we're using as a reference for now */}
            <div className="charts-container">
                
                {/* Pie Chart */}
                <div className="pie-chart">
                    <h3>Revenue by Division</h3>
                    <canvas id="pieChartCanvas"></canvas>
                </div>

                {/* Bar Chart */}
                <div className="bar-chart">
                    <h3>Revenue vs Operating Margin</h3>
                    <canvas id="barChartCanvas"></canvas>
                </div>
            </div>

            {/* Financial Data Table */}
            <div className="data-table">
                <h3>Expense Breakdown</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Expense Type</th>
                            <th>Total</th>
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Business Development</td>
                            <td>26,532,658.76</td>
                            <td>3,880,016.25</td>
                            <td>2,208,623.42</td>
                            <td>1,775,833.29</td>
                            {/* We can add more rows with actual data later, just trying to visualize for now by using the reference image*/}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialDashboard;
