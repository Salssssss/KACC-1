import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const GeneralLedger = () => {
  const { accountId } = useParams();
  const [ledgerEntries, setLedgerEntries] = useState([]);

  useEffect(() => {
    const fetchLedgerEntries = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/account/${accountId}/ledger`, { withCredentials: true });
        setLedgerEntries(response.data);
      } 
      catch (error) {
        console.error('Error fetching ledger entries: ', error);
      }
    };

    fetchLedgerEntries();
    
  }, [accountId]);
  
  return (
    <div>
      <h1>General Ledger for Account {accountId}</h1>
      {ledgerEntries.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance After</th>
              <th>Journal Entry</th>
            </tr>
          </thead>
          <tbody>
          {ledgerEntries.map((entry) => (
              <tr key={entry.entry_id}>
                <td>{entry.entry_date}</td> 
                <td>{entry.description}</td>
                <td>{entry.debit}</td> 
                <td>{entry.credit}</td> 
                <td>{entry.balance_after}</td> 
                <td>
                <Link to={`/journalentry/${entry.journal_id}`}>View Journal Entry</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No ledger entries found for this account.</p>
      )}
    </div>
  );
};

export default GeneralLedger;
