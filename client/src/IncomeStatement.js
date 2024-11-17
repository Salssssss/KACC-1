import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PrintPage from './PrintButton';

function IncomeStatement() {
    const [incomeStatement, setIncomeStatement] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [netIncome, setNetIncome] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncomeStatement = async () => {
            try {
                const response = await axios.get('http://localhost:5000/statements/income-statement');
                const data = response.data;
                setIncomeStatement(data.incomeStatement || { revenue: [], expenses: [] });
                setTotalRevenue(data.totalRevenue || 0);
                setTotalExpenses(data.totalExpenses || 0);
                setNetIncome(data.netIncome || 0);
            } catch (error) {
                console.error('Error fetching income statement:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIncomeStatement();
    }, []);

    //Function to convert the HTML table to CSV
    const htmlTableToCSV = (filename = 'income_statement.csv') => {
        const tables = document.querySelectorAll('table');
        let csvContent = '';

        tables.forEach((table) => {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                const rowContent = Array.from(cells).map(cell => `"${cell.innerText.replace(/"/g, '""')}"`).join(",");
                csvContent += rowContent + "\n";
            });
            csvContent += '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!incomeStatement) {
        return <div>Error loading income statement data.</div>;
    }

    return (
        <div>
            <h1>Income Statement</h1>
            <table border="1">
                <thead>
                    <tr>
                        <th>Account Name</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colSpan="2"><strong>Revenue</strong></td></tr>
                    {incomeStatement.revenue?.map((revenueItem) => (
                        <tr key={revenueItem.account_id}>
                            <td>{revenueItem.account_name}</td>
                            <td>{revenueItem.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td><strong>Total Revenue</strong></td>
                        <td>{totalRevenue.toFixed(2)}</td>
                    </tr>
                    <tr><td colSpan="2"><strong>Expenses</strong></td></tr>
                    {incomeStatement.expenses?.map((expenseItem) => (
                        <tr key={expenseItem.account_id}>
                            <td>{expenseItem.account_name}</td>
                            <td>{expenseItem.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td><strong>Total Expenses</strong></td>
                        <td>{totalExpenses.toFixed(2)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Net Income</strong></td>
                        <td>
                            <strong>
                                <span style={{ color: netIncome >= 0 ? 'green' : 'red' }}>
                                    {netIncome.toFixed(2)}
                                </span>
                            </strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <button className="csv-button" onClick={() => htmlTableToCSV()}>Download as CSV</button>
            <PrintPage />
        </div>
    );
}

export default IncomeStatement;
