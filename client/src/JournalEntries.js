import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JournalEntries = () => {
    //Needed user info
    //const userID = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('userRole');
    const userTeamID = localStorage.getItem('userTeamID');
    
    //State hooks for managing journal entries, filters, search, etc.
    const [journalEntries, setJournalEntries] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [newEntry, setNewEntry] = useState({
    //Remember to add a state hook for documents as well 
      account: '',
      description: '',
      debits: [],
      credits: []
    });

    
    //Fetch all journal entries on load, or based on filter changes
    useEffect(() => {
      const fetchJournalEntries = async () => {
        try {
          const response = await axios.get('http://localhost:5000/journal/entries', {
            params: { status: statusFilter, userTeamID: userTeamID }
          });
          setJournalEntries(response.data);
        } catch (error) {
          console.error('Error fetching journal entries:', error);
        }
      };
  
      fetchJournalEntries();
    }, [statusFilter]);

    //Function for handling new journal entry creation
    const handleCreateEntry = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('account', newEntry.account);
      formData.append('description', newEntry.description);
      formData.append('debits', JSON.stringify(newEntry.debits));
      formData.append('credits', JSON.stringify(newEntry.credits));
      //add formData for documents later

      const response = await axios.post('http://localhost:5000/journal/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      //Add the new entry to the list of journal entries
      setJournalEntries([...journalEntries, response.data]);
      setNewEntry({ description: '', debits: [], credits: [] });
      //setDocuments will go here later
    } catch (error) {
      console.error('Error creating journal entry:', error);
    }
  }; 

  //Function for approving a journal entry
  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/journal/approve/${id}`);
      setJournalEntries(journalEntries.map(entry => {
        if (entry.id === id) {
          return { ...entry, status: 'approved' };
        } else {
          return entry;
        }
      }));
    } catch (error) {
      console.error('Error approving journal entry:', error);
    }
  }; 

  //Function for rejecting a journal entry
  const handleReject = async (id, comment) => {
    try {
      await axios.patch(`http://localhost:5000/journal/reject/${id}`, { comment });

      setJournalEntries(prevEntries => {
        return prevEntries.map(entry => {
          if (entry.id === id) {
          return { ...entry, status: 'rejected' };
        }
        return entry;
      });
    });
    } catch (error) {
      console.error('Error rejecting journal entry:', error);
    }
  };

  //Filtering and search logic
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/journal/search', {
        params: { query: searchQuery }
      });
      setJournalEntries(response.data);
    } catch (error) {
      console.error('Error searching journal entries:', error);
    }
  };

  return (
    <div>
      <h1>Journal Entries for Team {userTeamID}</h1>

      {/* Filter by status */}
      <label>Status Filter: </label>
      <select value={statusFilter} onChange={handleFilterChange}>
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by account name, amount, or date"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: '400px' }} // Adjust the width as needed
      />
      <button onClick={handleSearch}>Search</button>

      {/* Table of journal entries */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Account</th>
            <th>Description</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {journalEntries.map(entry => (
            <tr key={entry.id}>
              <td>{entry.id}</td>
              <td>{entry.account}</td>
              <td>{entry.description}</td>
              <td>{entry.status}</td>
              <td>{entry.date}</td>
              <td>
                {entry.status === 'pending' && userRole === 'manager' && (
                  <>
                    <button onClick={() => handleApprove(entry.id)}>Approve</button>
                    <button onClick={() => handleReject(entry.id, 'Some reason')}>Reject</button>
                  </>
                )}
                {entry.status === 'rejected' && <p>Rejection Comment: {entry.comment}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form for creating a new journal entry */}
      <h2>Create New Journal Entry</h2>
      <form onSubmit={handleCreateEntry}>
      <input
          type="text"
          placeholder="Account"
          value={newEntry.account}
          onChange={(e) => setNewEntry({ ...newEntry, account: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newEntry.description}
          onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
          required
        />
        {/* Debit/Credit inputs */}
        <input
          type="text"
          placeholder="Debits (comma-separated)"
          value={newEntry.debits}
          onChange={(e) => setNewEntry({ ...newEntry, debits: e.target.value.split(',').map(Number) })}
          required
        />
        <input
          type="text"
          placeholder="Credits (comma-separated)"
          value={newEntry.credits}
          onChange={(e) => setNewEntry({ ...newEntry, credits: e.target.value.split(',').map(Number) })}
          required
        />
        {/* Need an input field here later for our documents */}
        <button type="submit">Create Entry</button>
      </form>
    </div>
  );

};

export default JournalEntries;
