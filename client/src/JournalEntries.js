import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const JournalEntries = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEntry, setNewEntry] = useState({ transactionDate: '', accounts: [], debits: [], credits: [], description: '', createdBy: 1 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJournalID, setSelectedJournalID] = useState(null);
  const [userRole, setUserRole] = useState('user'); // State to manage user role
  const [searchQuery, setSearchQuery] = useState('');
  const [accounts, setAccounts] = useState([]); // State to store accounts fetched by user_id
  const { user_id } = useParams(); // Extracting user_id from the URL
  const [rejectionComments, setRejectionComments] = useState({});

  useEffect(() => {
    console.log("Extracted user_id:", user_id); // Debugging line to ensure user_id is correctly extracted
  
    // Function to fetch journal entries by user_id
    const fetchJournalEntries = async () => {
      try {
        setLoading(true); // Set loading true before making any API calls
        const response = await axios.get(`http://localhost:5000/journal/entries`);
        setJournalEntries(response.data);
      } catch (err) {
        setError('Failed to fetch journal entries.');
      } finally {
        setLoading(false);
      }
    };

  
    // Function to fetch accounts by user_id
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/account/${user_id}/accounts`);
        setAccounts(response.data);
      } catch (err) {
        setError('Failed to fetch accounts.');
      }
    };
  
    if (user_id) {
      // Only call the API if user_id is available
      fetchJournalEntries();
      fetchAccounts();
    }
  
    // Fetch user role from local storage
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, [user_id]);
  

  const handleCreateEntry = async () => {
    if (!user_id) {
        setError('User ID is missing.');
        return;
    }

    try {
        const entries = [
            ...newEntry.debits.map(debit => ({
                type: "debit",
                account: debit.account.account_name,         // Directly access account_name
                account_number: debit.account.account_number, // Directly access account_number
                account_id: debit.account.account_id,                // Account ID for backend
                amount: parseFloat(debit.amount)
            })),
            ...newEntry.credits.map(credit => ({
                type: "credit",
                account: credit.account.account_name,         // Directly access account_name
                account_number: credit.account.account_number, // Directly access account_number
                account_id: credit.account.account_id,                // Account ID for backend
                amount: parseFloat(credit.amount)
            }))
        ];

        const formattedEntry = {
            transactionDate: newEntry.transactionDate,
            description: newEntry.description,
            createdBy: parseInt(user_id),
            entries: entries
        };

        const response = await axios.post('http://localhost:5000/journal/create', formattedEntry, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        setJournalEntries([...journalEntries, response.data]);
        setNewEntry({
            transactionDate: '',
            debits: [{ account: { id: '', account_name: '', account_number: '' }, amount: '' }],
            credits: [{ account: { id: '', account_name: '', account_number: '' }, amount: '' }],
            description: '',
            createdBy: parseInt(user_id)
        });
    } catch (err) {
        console.error('Error creating journal entry:', err);
        setError('Failed to create journal entry.');
    }
};




  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/journal/approve/${id}`);
      setJournalEntries(journalEntries.map(entry => {
        if (entry.journalID === id) {
          return { ...entry, status: 'approved' };
        }
        return entry;
      }));
    } catch (err) {
      setError('Failed to approve journal entry.');
    }
  };

  const handleReject = async (id) => {
    try {
      const comment = rejectionComments[id] || 'No comment provided'; // Use comment if available, else default message
      await axios.patch(`http://localhost:5000/journal/reject/${id}`, { comment });
      setJournalEntries(journalEntries.map(entry => {
        if (entry.journal_id === id) {
          return { ...entry, status: 'rejected', rejectionComment: comment };
        }
        return entry;
      }));
      setRejectionComments((prev) => ({ ...prev, [id]: '' })); // Clear the comment after rejection
    } catch (err) {
      setError('Failed to reject journal entry.');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedJournalID) {
      setError('Please select a journal entry and a file to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`http://localhost:5000/journal/entry/${selectedJournalID}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setError(null);
      alert('File uploaded successfully');
    } catch (err) {
      setError('Failed to upload document.');
    }
  };

  const handleFileDownload = async (id, fileName) => {
    console.log("id:", id, "filename", fileName)
    try {
      const response = await axios.get(`http://localhost:5000/journal/entry/${id}/document`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download document.');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/journal/search?query=${searchQuery}`);
      setJournalEntries(response.data);
    } catch (err) {
      setError('Failed to search journal entries.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const renderEntriesByStatus = (status) => {
    return journalEntries
      .filter(entry => entry.status === status)
      .map(entry => (
        <tr key={entry.journal_id}>
          <td>{entry.journal_id}</td>
          <td>{entry.description}</td>
          <td>{new Date(entry.transaction_date).toLocaleDateString()}</td>
          <td>{entry.status}</td>
  
          {/* Display comment only if the entry is "rejected" */}
          {status === 'rejected' && (
            <td>{entry.comment || 'No comment provided'}</td>
          )}
  
          {/* Actions column */}
          <td>
            {/* Display file info and buttons */}
            {entry.file_name ? (
              <>
                <p>File Attached: {entry.file_name}</p>
                <button onClick={() => handleFileDownload(entry.journal_id, entry.file_name)}>Download File</button>
              </>
            ) : (
              <p>No File Attached</p>
            )}
            <button onClick={() => setSelectedJournalID(entry.journal_id)}>Select for Upload</button>
  
            {/* Display Approve and Reject buttons for pending entries */}
            {status === 'pending' && userRole === 'manager' && (
              <>
                <button onClick={() => handleApprove(entry.journal_id)}>Approve</button>
                <input
                  type="text"
                  placeholder="Add rejection comment"
                  value={rejectionComments[entry.journal_id] || ''}
                  onChange={(e) =>
                    setRejectionComments((prev) => ({
                      ...prev,
                      [entry.journal_id]: e.target.value,
                    }))
                  }
                  style={{ marginRight: '10px', padding: '5px' }}
                />
                <button onClick={() => handleReject(entry.journal_id)}>Reject</button>
              </>
            )}
          </td>
        </tr>
      ));
  };
  
  
  
  
 return (
  <div style={{ textAlign: 'center', marginTop: '5%' }}>
    <h1>Journal Entries</h1>
    
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Search by account name, amount, or date"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>

    <h2>Approved Entries</h2>
    <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {renderEntriesByStatus('approved')}
      </tbody>
    </table>

    <h2>Rejected Entries</h2>
    <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Date</th>
          <th>Status</th>
          <th>Comment</th> {/* Comment column added for rejected entries */}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {renderEntriesByStatus('rejected')}
      </tbody>
    </table>

    <h2>Pending Entries</h2>
    <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {renderEntriesByStatus('pending')}
      </tbody>
    </table>


      <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '30px', width: '50%', margin: '0 auto', borderRadius: '8px' }}>
      <h2>Create New Journal Entry</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Description"
          value={newEntry.description}
          onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          type="date"
          value={newEntry.transactionDate}
          onChange={(e) => setNewEntry({ ...newEntry, transactionDate: e.target.value })}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

{/* Debits Section */}
<h3>Debits</h3>
{newEntry.debits.map((debit, index) => (
    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <select
            value={debit.account?.id || ""} // Use optional chaining to safely access id
            onChange={(e) => {
                const selectedAccount = accounts.find(acc => acc.account_id === parseInt(e.target.value));
                const updatedDebits = [...newEntry.debits];
                updatedDebits[index].account = selectedAccount; // Store the full account object
                setNewEntry({ ...newEntry, debits: updatedDebits });
            }}
            style={{ flex: '1', marginRight: '10px', padding: '8px' }}
        >
            <option value="">Select Account</option>
            {accounts.map(account => (
                <option key={account.account_id} value={account.account_id}>
                    {account.account_name}
                </option>
            ))}
        </select>
        <input
            type="number"
            placeholder="Amount"
            value={debit.amount}
            onChange={(e) => {
                const updatedDebits = [...newEntry.debits];
                updatedDebits[index].amount = e.target.value;
                setNewEntry({ ...newEntry, debits: updatedDebits });
            }}
            style={{ flex: '1', padding: '8px', marginRight: '10px' }}
        />
        <button
            onClick={() => {
                const updatedDebits = newEntry.debits.filter((_, i) => i !== index);
                setNewEntry({ ...newEntry, debits: updatedDebits });
            }}
            style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
            Remove
        </button>
    </div>
))}
<button onClick={() => setNewEntry({ ...newEntry, debits: [...newEntry.debits, { account: {}, amount: '' }] })} style={{ marginBottom: '20px' }}>Add Debit</button>

{/* Credits Section */}
<h3>Credits</h3>
{newEntry.credits.map((credit, index) => (
    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <select
            value={credit.account?.id || ""}
            onChange={(e) => {
                const selectedAccount = accounts.find(acc => acc.account_id === parseInt(e.target.value));
                const updatedCredits = [...newEntry.credits];
                updatedCredits[index].account = selectedAccount;
                setNewEntry({ ...newEntry, credits: updatedCredits });
            }}
            style={{ flex: '1', marginRight: '10px', padding: '8px' }}
        >
            <option value="">Select Account</option>
            {accounts.map(account => (
                <option key={account.account_id} value={account.account_id}>
                    {account.account_name}
                </option>
            ))}
        </select>
        <input
            type="number"
            placeholder="Amount"
            value={credit.amount}
            onChange={(e) => {
                const updatedCredits = [...newEntry.credits];
                updatedCredits[index].amount = e.target.value;
                setNewEntry({ ...newEntry, credits: updatedCredits });
            }}
            style={{ flex: '1', padding: '8px', marginRight: '10px' }}
        />
        <button
            onClick={() => {
                const updatedCredits = newEntry.credits.filter((_, i) => i !== index);
                setNewEntry({ ...newEntry, credits: updatedCredits });
            }}
            style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
            Remove
        </button>
    </div>
))}
<button onClick={() => setNewEntry({ ...newEntry, credits: [...newEntry.credits, { account: {}, amount: '' }] })} style={{ marginBottom: '20px' }}>Add Credit</button>

      <button onClick={handleCreateEntry} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Create Entry</button>
    </div>

      <h2>Upload Document to Selected Journal Entry</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload Document</button>
    </div>
  );
};

export default JournalEntries;
