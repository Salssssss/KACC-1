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
const multer = require('multer'); //testing multer for uplaoding documents
const upload = multer({ storage: multer.memoryStorage() });

// Route for getting all journal entries (View all or filter by status - pending, approved, rejected)
router.get('/entries', async (req, res) => {
    try {
        // Allow filtering by status and date range
        const { status, dateFrom, dateTo } = req.query;  
        // Fetch journal entries with filtering
        const pool = req.app.locals.pool;
        const journalEntries = await getJournalEntries(pool, status, dateFrom, dateTo);  
        res.status(200).json(journalEntries);
    } 
    catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Error fetching journal entries' });
    }
});

// Route for creating a new journal entry (Accountant user functionality)
router.post('/create', async (req, res) => {
  console.log(req.body)
    try {
        // Journal entry data
        const { transactionDate, description, accounts, debits, credits, createdBy } = req.body;  

        const pool = req.app.locals.pool;
        const newJournalEntry = await createJournalEntry(pool, transactionDate, accounts, debits, credits, description, createdBy);
        res.status(201).json(newJournalEntry);
    } 
    catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ message: 'Error creating journal entry' });
    }
});

// Route for getting a single journal entry by ID (This is for the requirement where you click on a post reference in the ledger)
router.get('/entry/:id', async (req, res) => {
    try {
      const { id } = req.params; 
        const pool = req.app.locals.pool;
        const journalEntry = await getJournalEntryByID(pool, id);

        res.status(200).json(journalEntry);
    } 
    catch (error) {
        console.error('Error fetching journal entry:', error);
        res.status(500).json({ message: 'Error fetching journal entry' });
    }
});

// Route for approving a journal entry (Manager user functionality)
router.patch('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.app.locals.pool;
        const approvedEntry = await approveJournalEntry(pool, id);
        res.status(200).json(approvedEntry);
    } 
    catch (error) {
        console.error('Error approving journal entry:', error);
        res.status(500).json({ message: 'Error approving journal entry' });
    }
});

// Route for rejecting a journal entry (Manager user functionality with comment field)
router.patch('/reject/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;  // Must include a comment for the rejection
        const pool = req.app.locals.pool;
        const rejectedEntry = await rejectJournalEntry(pool, id, comment);
        res.status(200).json(rejectedEntry);
    } catch (error) {
        console.error('Error rejecting journal entry:', error);
        res.status(500).json({ message: 'Error rejecting journal entry' });
    }
});

// Route for filtering journal entries (Pending, approved, rejected) with date range
router.get('/filter', async (req, res) => {
    try {
        const { status, dateFrom, dateTo } = req.query;
        const pool = req.app.locals.pool;
        const filteredEntries = await filterJournalEntries(pool, status, dateFrom, dateTo);
        res.status(200).json(filteredEntries);
    } 
    catch (error) {
        console.error('Error filtering journal entries:', error);
        res.status(500).json({ message: 'Error filtering journal entries' });
    }
});

// Route for searching journal entries by account name, amount, or date
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;  // Search query (account name, amount, date)
        const pool = req.app.locals.pool;
        const searchResults = await searchJournalEntries(pool, query);
        res.status(200).json(searchResults);
    } 
    catch (error) {
        console.error('Error searching journal entries:', error);
        res.status(500).json({ message: 'Error searching journal entries' });
    }
});

// Route for attaching source documents to a journal entry
router.post('/entry/:id/documents', upload.single('file'), async (req, res) => {
  try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
          return res.status(400).json({ message: 'No document uploaded' });
      }

      const pool = req.app.locals.pool;

      const fileName = file.originalname; // Get the original file name
      const fileType = file.mimetype; // Get the file type (e.g., 'image/png', 'application/pdf')
      const fileData = file.buffer; // File buffer

      const updatedEntry = await attachSourceDocuments(pool, id, fileName, fileType, fileData);
      res.status(200).json(updatedEntry);
  } catch (error) {
      console.error('Error attaching documents:', error);
      res.status(500).json({ message: 'Error attaching documents' });
  }
});

module.exports = router;
