import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './JournalEntries.css';

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
  const [targetJournalID, setTargetJournalID] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);
  const [errorList, setErrorList] = useState([]);
  const [selectedError, setSelectedError] = useState(null);
  const [editEntry, setEditEntry] = useState(null); // Tracks the entry being edited

  
  const fetchErrors = async () => {
    try {
      setIsLoadingErrors(true);
      const response = await axios.get(`http://localhost:5000/errors/errors`);
      setErrorList(response.data);
    } catch (err) {
      setError('Failed to fetch errors.');
    } finally {
      setIsLoadingErrors(false);
    }
  };
  
  const handleActivateError = async (journalID, errorID) => {
    try {
      await axios.patch(`http://localhost:5000/errors/activate/${journalID}/errors/${errorID}`);

      alert('Error activated successfully.');
      fetchErrors(); // Refresh the error list
    } catch (err) {
      setError('Failed to activate error.');
    }
  };
  
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

  useEffect(() => {
    console.log("Extracted user_id:", user_id); // Debugging line to ensure user_id is correctly extracted
  
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
  
  const handleEditEntry = (entry) => {
    const journalData = entry.journal_data || {}; // Default to empty object if journal_data is undefined
    const entries = journalData.entries || []; // Default to empty array if entries are undefined
  
    console.log('Journal Data:', journalData); // Debugging log
    console.log('Entries:', entries); // Debugging log
  
    setEditEntry({
      ...entry,
      transactionDate: new Date(entry.transaction_date).toISOString().split('T')[0], // Ensure date format
      debits: entries
        .filter(e => e.type === 'debit')
        .map(e => ({
          account: { account_id: e.account_id },
          amount: e.amount.toString(),
        })),
      credits: entries
        .filter(e => e.type === 'credit')
        .map(e => ({
          account: { account_id: e.account_id },
          amount: e.amount.toString(),
        })),
    });
  };

  const submitEditEntry = async () => {
    if (!editEntry) {
      setError('No entry to edit. Please select an entry to edit.');
      return;
    }
  
    try {
      const entries = [
        ...editEntry.debits.map(debit => ({
          type: 'debit',
          account_id: debit.account.account_id,
          amount: parseFloat(debit.amount),
        })),
        ...editEntry.credits.map(credit => ({
          type: 'credit',
          account_id: credit.account.account_id,
          amount: parseFloat(credit.amount),
        })),
      ];
  
      const payload = {
        transactionDate: editEntry.transactionDate,
        entries,
        description: editEntry.description,
        createdBy: user_id, // Assuming `createdBy` is the current user
      };
  
      // Input validation
      if (!payload.transactionDate || !entries.length) {
        setError('Please fill out all fields and ensure debits and credits are added.');
        return;
      }
  
      const totalDebits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
      const totalCredits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
  
      if (totalDebits !== totalCredits) {
        setError('Total debits must equal total credits.');
        return;
      }
  
      const url = `http://localhost:5000/journal/edit/${editEntry.journal_id}`;
      const response = await axios.patch(url, payload);
  
      if (response.status === 200) {
        alert('Entry updated successfully!');
        setEditEntry(null); // Clear editEntry state
        fetchJournalEntries(); // Refresh entries
      } else {
        setError('Failed to update entry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting edit:', err);
      setError('Failed to update entry.');
    }
  };
  
  
  
  
  
 const handleSubmitNewEntry = async () => {
  try {
    const entries = [
      ...newEntry.debits.map(debit => ({
        type: 'debit',
        account_id: debit.account.account_id,
        amount: parseFloat(debit.amount),
      })),
      ...newEntry.credits.map(credit => ({
        type: 'credit',
        account_id: credit.account.account_id,
        amount: parseFloat(credit.amount),
      })),
    ];

    const payload = {
      transactionDate: newEntry.transactionDate,
      entries,
      description: newEntry.description,
      createdBy: user_id, // Assuming `createdBy` is the current user
    };

    // Input validation
    if (!payload.transactionDate || !entries.length) {
      setError('Please fill out all fields and ensure debits and credits are added.');
      return;
    }

    const totalDebits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
    const totalCredits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);

    if (totalDebits !== totalCredits) {
      setError('Total debits must equal total credits.');
      return;
    }

    const url = `http://localhost:5000/journal/create`;
    const response = await axios.post(url, payload);

    if (response.status === 201) {
      alert('Entry created successfully!');
      setNewEntry({ transactionDate: '', accounts: [], debits: [], credits: [], description: '', createdBy: user_id });
      fetchJournalEntries(); // Refresh entries
    } else {
      setError('Failed to create entry. Please try again.');
    }
  } catch (err) {
    console.error('Error submitting new entry:', err);
    setError('Failed to create entry.');
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
      .filter((entry) => entry.status === status)
      .map((entry) => (
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
                <button onClick={() => handleFileDownload(entry.journal_id, entry.file_name)}>
                  Download File
                </button>
              </>
            ) : (
              <p>No File Attached</p>
            )}
  
            <button onClick={() => setSelectedJournalID(entry.journal_id)}>Select for Upload</button>
  
            {/* Allow managers to approve/reject pending entries */}
            {status === 'pending' && userRole === 'manager' && (
              <>
                <button onClick={() => handleApprove(entry.journal_id)}>Approve</button>
                <input
                  type="text"
                  placeholder="Enter rejection message"
                  value={rejectionComments[entry.journal_id] || ''}
                  onChange={(e) =>
                    setRejectionComments((prev) => ({
                      ...prev,
                      [entry.journal_id]: e.target.value,
                    }))
                  }
                  style={{ marginRight: '10px', padding: '5px', width: '200px' }}
                />
                <button onClick={() => handleReject(entry.journal_id)}>Reject</button>
              </>
            )}
  
            {/* Allow managers to apply errors to any journal entry */}
            {userRole === 'manager' && (
              <button
                onClick={() => {
                  setTargetJournalID(entry.journal_id);
                  fetchErrors(); // Fetch errors dynamically
                  setIsErrorModalOpen(true);
                }}
              >
                Create Error
              </button>
            )}
  
            {/* Add Edit button for rejected entries */}
            {status === 'rejected' && (
              <button onClick={() => handleEditEntry(entry)}>Edit</button>
            )}
          </td>
        </tr>
      ));
  };
  
  
  
  
  
  
  
  return (
    <div style={{ textAlign: 'center', marginTop: '5%' }}>
      <h1>Journal Entries</h1>
  
      {/* Search Section */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by account name, amount, or date"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
  
      {/* Approved Entries Table */}
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
        <tbody>{renderEntriesByStatus('approved')}</tbody>
      </table>
  
      {/* Rejected Entries Table */}
      <h2>Rejected Entries</h2>
      <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Date</th>
            <th>Status</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{renderEntriesByStatus('rejected')}</tbody>
      </table>
  
      {/* Pending Entries Table */}
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
        <tbody>{renderEntriesByStatus('pending')}</tbody>
      </table>
  
{/* Create New or Edit Journal Entry Section */}
<div
  style={{
    border: '1px solid #ccc',
    padding: '20px',
    marginTop: '30px',
    width: '50%',
    margin: '0 auto',
    borderRadius: '8px',
  }}
>
  <h2>{editEntry ? "Edit Journal Entry" : "Create New Journal Entry"}</h2>

  <div style={{ marginBottom: '15px' }}>
    <input
      type="text"
      placeholder="Description"
      value={editEntry ? editEntry.description : newEntry.description}
      onChange={(e) => {
        const stateUpdater = editEntry ? setEditEntry : setNewEntry;
        stateUpdater((prev) => ({ ...prev, description: e.target.value }));
      }}
      style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
    />
    <input
      type="date"
      value={editEntry ? editEntry.transactionDate : newEntry.transactionDate}
      onChange={(e) => {
        const stateUpdater = editEntry ? setEditEntry : setNewEntry;
        stateUpdater((prev) => ({ ...prev, transactionDate: e.target.value }));
      }}
      style={{ width: '100%', padding: '8px' }}
    />
  </div>

  {editEntry && (
    <button
      onClick={() => setEditEntry(null)}
      style={{
        padding: "10px 20px",
        backgroundColor: "#FF5733",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "10px",
      }}
    >
      Cancel Edit
    </button>
  )}

  {/* Shared Debits Section */}
  <h3>Debits</h3>
  {(editEntry ? editEntry.debits : newEntry.debits).map((debit, index) => (
    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <select
        value={debit.account?.account_id || ''}
        onChange={(e) => {
          const selectedAccount = accounts.find(
            (acc) => acc.account_id === parseInt(e.target.value)
          );
          const stateUpdater = editEntry ? setEditEntry : setNewEntry;
          stateUpdater((prev) => {
            const updatedDebits = [...prev.debits];
            updatedDebits[index].account = selectedAccount;
            return { ...prev, debits: updatedDebits };
          });
        }}
        style={{ flex: '1', marginRight: '10px', padding: '8px' }}
      >
        <option value="">Select Account</option>
        {accounts.map((account) => (
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
          const stateUpdater = editEntry ? setEditEntry : setNewEntry;
          stateUpdater((prev) => {
            const updatedDebits = [...prev.debits];
            updatedDebits[index].amount = e.target.value;
            return { ...prev, debits: updatedDebits };
          });
        }}
        style={{ flex: '1', padding: '8px', marginRight: '10px' }}
      />
      <button
        onClick={() => {
          const stateUpdater = editEntry ? setEditEntry : setNewEntry;
          stateUpdater((prev) => {
            const updatedDebits = prev.debits.filter((_, i) => i !== index);
            return { ...prev, debits: updatedDebits };
          });
        }}
        style={{ padding: '5px 10px', cursor: 'pointer' }}
      >
        Remove
      </button>
    </div>
  ))}
  <button
    onClick={() => {
      const stateUpdater = editEntry ? setEditEntry : setNewEntry;
      stateUpdater((prev) => ({
        ...prev,
        debits: [...prev.debits, { account: {}, amount: '' }],
      }));
    }}
    style={{ marginBottom: '20px' }}
  >
    Add Debit
  </button>

  {/* Shared Credits Section */}
  <h3>Credits</h3>
  {(editEntry ? editEntry.credits : newEntry.credits).map((credit, index) => (
    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <select
        value={credit.account?.account_id || ''}
        onChange={(e) => {
          const selectedAccount = accounts.find(
            (acc) => acc.account_id === parseInt(e.target.value)
          );
          const stateUpdater = editEntry ? setEditEntry : setNewEntry;
          stateUpdater((prev) => {
            const updatedCredits = [...prev.credits];
            updatedCredits[index].account = selectedAccount;
            return { ...prev, credits: updatedCredits };
          });
        }}
        style={{ flex: '1', marginRight: '10px', padding: '8px' }}
      >
        <option value="">Select Account</option>
        {accounts.map((account) => (
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
          const stateUpdater = editEntry ? setEditEntry : setNewEntry;
          stateUpdater((prev) => {
            const updatedCredits = [...prev.credits];
            updatedCredits[index].amount = e.target.value;
            return { ...prev, credits: updatedCredits };
          });
        }}
        style={{ flex: '1', padding: '8px', marginRight: '10px' }}
      />
      <button
        onClick={() => {
          const stateUpdater = editEntry ? setEditEntry : setNewEntry;
          stateUpdater((prev) => {
            const updatedCredits = prev.credits.filter((_, i) => i !== index);
            return { ...prev, credits: updatedCredits };
          });
        }}
        style={{ padding: '5px 10px', cursor: 'pointer' }}
      >
        Remove
      </button>
    </div>
  ))}
  <button
    onClick={() => {
      const stateUpdater = editEntry ? setEditEntry : setNewEntry;
      stateUpdater((prev) => ({
        ...prev,
        credits: [...prev.credits, { account: {}, amount: '' }],
      }));
    }}
    style={{ marginBottom: '20px' }}
  >
    Add Credit
  </button>

  <button
    onClick={editEntry ? submitEditEntry : handleSubmitNewEntry}
    style={{
      padding: "10px 20px",
      backgroundColor: "#007BFF",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    }}
  >
    {editEntry ? "Update Entry" : "Create Entry"}
  </button>
</div>

  
      <h2>Upload Document to Selected Journal Entry</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload Document</button>
  
      {isErrorModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Select an Error</h3>
      {isLoadingErrors ? (
        <p>Loading errors...</p>
      ) : (
        <ul>
          {errorList.map((error) => (
            <li key={error.error_id}>
              <input
                type="radio"
                id={`error-${error.error_id}`}
                name="error"
                value={error.error_id}
                onChange={(e) => setSelectedError(e.target.value)}
              />
              <label htmlFor={`error-${error.error_id}`}>{error.description}</label>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => handleActivateError(targetJournalID, selectedError)}
        disabled={!selectedError}
      >
        Activate Error
      </button>
      <button className="cancel" onClick={() => setIsErrorModalOpen(false)}>
        Cancel
      </button>
    </div>
  </div>
)}

<h2>{editEntry ? "Edit Journal Entry" : "Create New Journal Entry"}</h2>
<div style={{ marginBottom: '15px' }}>
  <input
    type="text"
    placeholder="Description"
    value={editEntry ? editEntry.description : newEntry.description}
    onChange={(e) => {
      if (editEntry) {
        setEditEntry({ ...editEntry, description: e.target.value });
      } else {
        setNewEntry({ ...newEntry, description: e.target.value });
      }
    }}
    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
  />
  <input
    type="date"
    value={editEntry ? editEntry.transactionDate : newEntry.transactionDate}
    onChange={(e) => {
      if (editEntry) {
        setEditEntry({ ...editEntry, transactionDate: e.target.value });
      } else {
        setNewEntry({ ...newEntry, transactionDate: e.target.value });
      }
    }}
    style={{ width: '100%', padding: '8px' }}
  />
</div>
{editEntry && (
  <button
    onClick={() => setEditEntry(null)}
    style={{
      padding: "10px 20px",
      backgroundColor: "#FF5733",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginTop: "10px",
    }}
  >
    Cancel Edit
  </button>
)}


    </div>
  );
};




export default JournalEntries;
