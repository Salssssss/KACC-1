import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BalanceSheet() {
    const [balanceSheet, setBalanceSheet] = useState(null);
    const [totalAssets, setTotalAssets] = useState(0);
    const [totalLiabilities, setTotalLiabilities] = useState(0);
    const [totalEquity, setTotalEquity] = useState(0);
    const [isBalanced, setIsBalanced] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //Fetch balance sheet data from the backend
        const fetchBalanceSheet = async () => {
            try {
                const response = await axios.get('http://localhost:5000/statements/balance-sheet'); 
                const data = response.data; 
                
                setBalanceSheet(data.balanceSheet || { assets: [], liabilities: [], equity: [] });
                setTotalAssets(data.totalAssets || 0);
                setTotalLiabilities(data.totalLiabilities || 0);
                setTotalEquity(data.totalEquity || 0);
                setIsBalanced(data.balanced || false);
            } 
            catch (error) {
                console.error('Error fetching balance sheet:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBalanceSheet();
    }, []);

    //Function to convert the HTML table to CSV
    const htmlTableToCSV = (filename = 'balance_sheet.csv') => {
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

    if (!balanceSheet) {
        return <div>Error loading balance sheet data.</div>;
    }

    return (
        <div>
            <h1>Balance Sheet</h1>
            <table border="1">
                <thead>
                    <tr>
                        <th>Account Name</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colSpan="2"><strong>Assets</strong></td></tr>
                    {balanceSheet.assets?.map((asset) => (
                        <tr key={asset.account_id}>
                            <td>{asset.account_name}</td>
                            <td>{asset.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td><strong>Total Assets</strong></td>
                        <td>{totalAssets.toFixed(2)}</td>
                    </tr>
                    <tr><td colSpan="2"><strong>Liabilities</strong></td></tr>
                    {balanceSheet.liabilities?.map((liability) => (
                        <tr key={liability.account_id}>
                            <td>{liability.account_name}</td>
                            <td>{liability.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td><strong>Total Liabilities</strong></td>
                        <td>{totalLiabilities.toFixed(2)}</td>
                    </tr>
                    <tr><td colSpan="2"><strong>Equity</strong></td></tr>
                    {balanceSheet.equity?.map((equityItem) => (
                        <tr key={equityItem.account_id}>
                            <td>{equityItem.account_name}</td>
                            <td>{equityItem.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td><strong>Total Equity</strong></td>
                        <td>{totalEquity.toFixed(2)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2">
                            <strong>
                                <span style={{ color: isBalanced ? 'green' : 'red' }}>
                                    {isBalanced ? ' Balanced' : ' Imbalanced'}
                                </span>
                            </strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
            <button onClick={() => htmlTableToCSV()}>Download as CSV</button>
        </div>
    );
}

export default BalanceSheet;
