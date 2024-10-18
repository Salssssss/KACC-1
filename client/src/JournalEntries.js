import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JournalEntries = () => {
    //State hooks for managing journal entries, filters, search, etc.
    const [journalEntries, setJournalEntries] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [newEntry, setNewEntry] = useState({
      description: '',
      accounts: '',
      debits: [],
      credits: []
    });
    const [documents, setDocuments] = useState([]);
  
    //Fetch all journal entries on load, or based on filter changes
    useEffect(() => {
      const fetchJournalEntries = async () => {
        try {
          const response = await axios.get('http://localhost:5000/journal/entries', {
            params: { status: statusFilter }
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
      formData.append('description', newEntry.description);
      formData.append('accounts', newEntry.accounts);
      formData.append('debits', JSON.stringify(newEntry.debits));
      formData.append('credits', JSON.stringify(newEntry.credits));
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}]`, doc);
      });

      const response = await axios.post('http://localhost:5000/journal/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      //Add the new entry to the list of journal entries
      setJournalEntries([...journalEntries, response.data]);
      setNewEntry({ description: '', accounts: '', debits: [], credits: [] });
      setDocuments([]);
    } catch (error) {
      console.error('Error creating journal entry:', error);
    }
  };

};