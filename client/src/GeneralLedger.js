import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const GeneralLedger = () => {
  const { accountId } = useParams();
  const [ledgerEntries, setLedgerEntries] = useState([]);

  useEffect(() => {
    const fetchLedgerEntries = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/account/${accountId}/ledger`, { withCredentials: true });
        setLedgerEntries(response.data);
      } catch (error) {
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
              <th>Ledger Will Go here</th>

            </tr>
          </thead>
          <tbody>
            {/*Table Body will go here */}
          </tbody>
        </table>
      ) : (
        <p>No ledger entries found for this account.</p>
      )}
    </div>
  );
};

export default GeneralLedger;