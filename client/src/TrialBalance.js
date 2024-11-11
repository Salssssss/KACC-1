import React, { useEffect, useState } from 'react';

function TrialBalance() {
    const [trialBalance, setTrialBalance] = useState([]);
    const [totalDebits, setTotalDebits] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [isBalanced, setIsBalanced] = useState(false);

    useEffect(() => {
        //Fetch trial balance data from the backend
        const fetchTrialBalance = async () => {
            try {
                const response = await axios.get('http://localhost:5000/statements/trial-balance'); 
                const data = await response.json();
                setTrialBalance(data.trialBalance);
                setTotalDebits(data.totalDebits);
                setTotalCredits(data.totalCredits);
                setIsBalanced(data.balanced);
            } 
            catch (error) {
                console.error('Error fetching trial balance:', error);
            }
        };
        fetchTrialBalance();
    }, 
    []);

    //Function to convert the HTML table to CSV
    const htmlTableToCSV = (filename = 'trial_balance.csv') => {
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

    return (
        <div>
            <h1>Trial Balance</h1>
            <table border="1">
                <thead>
                    <tr>
                        <th>Account ID</th>
                        <th>Account Name</th>
                        <th>Total Debits</th>
                        <th>Total Credits</th>
                    </tr>
                </thead>
                <tbody>
                    {trialBalance.map((account) => (
                        <tr key={account.account_id}>
                            <td>{account.account_id}</td>
                            <td>{account.account_name}</td>
                            <td>{account.total_debits.toFixed(2)}</td>
                            <td>{account.total_credits.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2"><strong>Totals</strong></td>
                        <td>{totalDebits.toFixed(2)}</td>
                        <td>{totalCredits.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colSpan="4">
                            <strong>Balanced: {isBalanced ? "Yes" : "No"}</strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <button onClick={() => htmlTableToCSV()}>Download as CSV</button>
        </div>
    );
}

export default TrialBalance;
