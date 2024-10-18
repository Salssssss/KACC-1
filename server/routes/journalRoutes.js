const express = require('express');
const router = express.Router(); 
const { getJournalEntries, 
        createJournalEntry, 
        approveJournalEntry, 
        rejectJournalEntry, 
        getJournalEntryByID, 
        filterJournalEntries, 
        searchJournalEntries, 
        attachSourceDocuments } 
        = require('../controllers/journalController');


//Route for getting all journal entries (View all or filter by status - pending, approved, rejected)
router.get('/entries', async (req, res) => {
    try {
      //Allow filtering by status and date range
      const { status, dateFrom, dateTo } = req.query;  
      //Fetch journal entries with filtering
      const journalEntries = await getJournalEntries(status, dateFrom, dateTo);  
      res.status(200).json(journalEntries);
    } 
    catch (error) {
      console.error('Error fetching journal entries:', error);
      res.status(500).json({ message: 'Error fetching journal entries' });
    }
  });

//Route for creating a new journal entry (Accountant user functionality)
router.post('/create', upload.array('documents'), async (req, res) => {
    try {
      //Journal entry data
      const { description, accounts, debits, credits } = req.body;  
      //Attach source documents
      const documents = req.files; 
  
      //Validate if debits equal credits
      //Not sure if the route is the best place to check it, might move this to the front end or controller instead
      //Compare the sum of values the debits and credits arrays. If not eqal, send message. If equal, perform function.
      if (debits.reduce((sum, d) => sum + parseFloat(d), 0) !== credits.reduce((sum, c) => sum + parseFloat(c), 0)) {
        return res.status(400).json({ message: 'Debits must equal credits' });
      }
  
      const newJournalEntry = await createJournalEntry(description, accounts, debits, credits, documents);
      res.status(201).json(newJournalEntry);
    } 
    catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(500).json({ message: 'Error creating journal entry' });
    }
  });

//Route for getting a single journal entry by ID (This is for the requirement where you click on a post reference in the ledger)
router.get('/entry/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const journalEntry = await getJournalEntryByID(id);
      res.status(200).json(journalEntry);
    } 
    catch (error) {
      console.error('Error fetching journal entry:', error);
      res.status(500).json({ message: 'Error fetching journal entry' });
    }
  });

//Route for approving a journal entry (Manager user functionality)
//Patch because we're only updating the entry status.
//If we still use seperate tables for approved, pending, and rejected entries then we'd want to use put
router.patch('/approve/:id', async (req, res) => {
    try {
      const { journalID } = req.params;
      const approvedEntry = await approveJournalEntry(journalID);
      res.status(200).json(approvedEntry);
    } 
    catch (error) {
      console.error('Error approving journal entry:', error);
      res.status(500).json({ message: 'Error approving journal entry' });
    }
  });

//Route for rejecting a journal entry (Manager user functionality with comment field)
router.patch('/reject/:id', async (req, res) => {
    try {
      const { journalID } = req.params;
      //Must include a comment for the rejection
      //This comment will be passed from the front end, and inserted into DB table in controller function
      const { comment } = req.body;  
      const rejectedEntry = await rejectJournalEntry(journalID, comment);
      res.status(200).json(rejectedEntry);
    } catch (error) {
      console.error('Error rejecting journal entry:', error);
      res.status(500).json({ message: 'Error rejecting journal entry' });
    }
  });

//Route for filtering journal entries (Pending, approved, rejected) with date range
router.get('/filter', async (req, res) => {
    try {
      const { status, dateFrom, dateTo } = req.query;
      const filteredEntries = await filterJournalEntries(status, dateFrom, dateTo);
      res.status(200).json(filteredEntries);
    } 
    catch (error) {
      console.error('Error filtering journal entries:', error);
      res.status(500).json({ message: 'Error filtering journal entries' });
    }
  });

//Route for searching journal entries by account name, amount, or date
//Not sure if we need a route for this, I saw it was handled all in the HTML for the search bar in the COA page
router.get('/search', async (req, res) => {
    try {
      //Search query (account name, amount, date)
      const { query } = req.query;  
      const searchResults = await searchJournalEntries(query);
      res.status(200).json(searchResults);
    } 
    catch (error) {
      console.error('Error searching journal entries:', error);
      res.status(500).json({ message: 'Error searching journal entries' });
    }
  });

//Route for attaching source documents to a journal entry
//Still need to find a module that can handle document uploads
//This route might work, it might not, I figured if there are multiple documents we'd be uploading an array
router.post('/entry/:id/documents', upload.array('documents'), async (req, res) => {
    try {
      const { id } = req.params;
      //Uploaded documents would be files
      const documents = req.files;  
  
      const updatedEntry = await attachSourceDocuments(id, documents);
      res.status(200).json(updatedEntry);
    } 
    catch (error) {
      console.error('Error attaching documents:', error);
      res.status(500).json({ message: 'Error attaching documents' });
    }
  });
  
  module.exports = router;