import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RetainedEarningsStatement() {
    const [retainedEarningsData, setRetainedEarningsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRetainedEarningsData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/statements/retained-earnings');
                console.log('Retained Earnings Data:', response.data);
                const data = response.data;

                setRetainedEarningsData(data || null);
            } catch (error) {
                console.error('Error fetching retained earnings statement:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRetainedEarningsData();
    }, []);

    const updateRetainedEarnings = async () => {
        try {
            await axios.post('http://localhost:5000/statements/publish-earnings');
            alert('Retained earnings updated successfully.');
        } catch (error) {
            console.error('Error updating retained earnings:', error);
            alert('Failed to update retained earnings.');
        }
    };
    

    //Function to convert the HTML table to CSV
    const htmlTableToCSV = (filename = 'retained_earnings_statement.csv') => {
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

    if (!retainedEarningsData) {
        return <div>Error loading retained earnings statement data.</div>;
    }

    const { beginningRetainedEarnings, netIncome, dividends, retainedEarnings } = retainedEarningsData;

    //Convert values to floats and ensure defaults
    const beginningRetainedEarningsValue = parseFloat(beginningRetainedEarnings) || 0;
    const netIncomeValue = parseFloat(netIncome) || 0;
    const dividendsValue = parseFloat(dividends) || 0;
    const endingRetainedEarningsValue = parseFloat(retainedEarnings) || 0;
    
    return (
        <div>
            <h1>Retained Earnings Statement</h1>
            <table border="1">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Beginning Retained Earnings</td>
                        <td>{beginningRetainedEarningsValue.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Net Income</td>
                        <td>{netIncomeValue.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Less: Dividends</td>
                        <td>{dividendsValue.toFixed(2)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td><strong>Ending Retained Earnings</strong></td>
                        <td>
                            <strong>
                                <span style={{ color: retainedEarnings >= 0 ? 'green' : 'red' }}>
                                    {endingRetainedEarningsValue.toFixed(2)}
                                </span>
                            </strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <button onClick={() => htmlTableToCSV()}>Download as CSV</button>
            <button onClick={updateRetainedEarnings}>
    Publish Earnings
</button>

        </div>
    );
}

export default RetainedEarningsStatement;
