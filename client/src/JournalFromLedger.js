import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // useParams for route parameters
import axios from 'axios';

const JournalFromLedger = () => {
    const { journal_id } = useParams(); // Get `journal_id` from route params
    const [journalEntry, setJournalEntry] = useState(null);
    console.log('journalid:', journal_id);
    
    useEffect(() => {
        const fetchJournalEntry = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/journal/entry/${journal_id}`, { withCredentials: true });
                setJournalEntry(response.data);
            } catch (error) {
                console.error('Error fetching journal entry:', error);
            }
        };

        fetchJournalEntry();
    }, [journal_id]);

    return (
        <div>
            {journalEntry ? (
                <div>
                    <h1>Journal Entry {journalEntry.entry_id}</h1>
                    <p><strong>Created at:</strong> {journalEntry.created_at}</p>
                    <p><strong>Transaction Date:</strong> {journalEntry.transaction_date}</p>
                    <p><strong>Description:</strong> {journalEntry.description}</p>
                    <p><strong>Data:</strong> {journalEntry.journal_data}</p>
                    <p><strong>Attached File:</strong> {journalEntry.file_name}</p>
                </div>
            ) : (
                <p>Loading journal entry...</p>
            )}
        </div>
    );
};

export default JournalFromLedger;
