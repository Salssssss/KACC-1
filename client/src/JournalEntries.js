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
  const { user_id } = useParams(); // Extracting user_id from the URL

  useEffect(() => {
    console.log("Extracted user_id:", user_id); // Debugging line to ensure user_id is correctly extracted

    const fetchJournalEntries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/journal/entries');
        setJournalEntries(response.data);
      } catch (err) {
        setError('Failed to fetch journal entries.');
      } finally {
        setLoading(false);
      }
    };

    fetchJournalEntries();

    // Fetch user role from local storage
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, [user_id]); // Adding user_id as a dependency

  const handleCreateEntry = async () => {
    console.log('user', user_id);
    if (!user_id) {
      setError('User ID is missing.');
      return;
    }
    try {
      // Assuming debits and credits are entered as comma-separated values
      const formattedEntry = {
        ...newEntry,
        debits: newEntry.debits.map(Number),
        credits: newEntry.credits.map(Number),
        createdBy: parseInt(user_id),
      };

      console.log("New Entry before submission:", formattedEntry); // Debugging line to check formattedEntry

      const response = await axios.post('http://localhost:5000/journal/create', formattedEntry, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setJournalEntries([...journalEntries, response.data]);
      setNewEntry({ transactionDate: '', accounts: [], debits: [], credits: [], description: '', createdBy: parseInt(user_id) });
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

  const handleReject = async (id, comment) => {
    try {
      await axios.patch(`http://localhost:5000/journal/reject/${id}`, { comment });
      setJournalEntries(journalEntries.map(entry => {
        if (entry.journalID === id) {
          return { ...entry, status: 'rejected', rejectionComment: comment };
        }
        return entry;
      }));
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
    try {
      const response = await axios.get(`http://localhost:5000/journal/entry/${id}/documents`, {
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
          <td>
            {entry.file_name ? (
              <>
                <p>File Attached: {entry.file_name}</p>
                <button onClick={() => handleFileDownload(entry.journal_id, entry.file_name)}>Download File</button>
              </>
            ) : (
              <p>No File Attached</p>
            )}
            {status === 'pending' && userRole === 'manager' && (
              <>
                <button onClick={() => handleApprove(entry.journal_id)}>Approve</button>
                <button onClick={() => handleReject(entry.journal_id, 'Rejected due to insufficient details')}>Reject</button>
              </>
            )}
            <button onClick={() => setSelectedJournalID(entry.journal_id)}>Select for Upload</button>
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

      <h2>Create New Journal Entry</h2>
      <input
        type="text"
        placeholder="Description"
        value={newEntry.description}
        onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
      />
      <input
        type="date"
        value={newEntry.transactionDate}
        onChange={(e) => setNewEntry({ ...newEntry, transactionDate: e.target.value })}
      />
      <input
        type="text"
        placeholder="Accounts (comma-separated)"
        value={newEntry.accounts}
        onChange={(e) => setNewEntry({ ...newEntry, accounts: e.target.value.split(',') })}
      />
      <input
        type="text"
        placeholder="Debits (comma-separated)"
        value={newEntry.debits}
        onChange={(e) => setNewEntry({ ...newEntry, debits: e.target.value.split(',') })}
      />
      <input
        type="text"
        placeholder="Credits (comma-separated)"
        value={newEntry.credits}
        onChange={(e) => setNewEntry({ ...newEntry, credits: e.target.value.split(',') })}
      />
      <button onClick={handleCreateEntry}>Create Entry</button>

      <h2>Upload Document to Selected Journal Entry</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload Document</button>
    </div>
  );
};

export default JournalEntries;
