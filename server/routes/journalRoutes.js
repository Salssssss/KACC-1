const express = require('express');
const router = express.Router();
const { getJournalEntries, 
        createJournalEntry, 
        approveJournalEntry, 
        rejectJournalEntry, 
        getJournalEntryByID, 
        filterJournalEntries, 
        searchJournalEntries, 
        attachSourceDocuments,
        getJournalDocument,
        addCommentToJournal,
        editJournalEntry, } 
        = require('../controllers/journalController');
const multer = require('multer'); //testing multer for uplaoding documents
const upload = multer({ storage: multer.memoryStorage() });

// Route for getting all journal entries (View all or filter by status - pending, approved, rejected)
router.get('/entries', async (req, res) => {
    try {
        // Allow filtering by status and date range
        const { status, dateFrom, dateTo } = req.query;  
        // Fetch journal entries with filtering
        const pool = req.app.get('dbPool')
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
  console.log(req.body); // Debugging: Check if entries is received correctly

  try {
      // Destructure the request body to get entries and other fields
      const { transactionDate, description, entries, createdBy } = req.body;

      // Access the database pool
      const pool = req.app.get('dbPool');

      // Pass entries directly to the createJournalEntry function
      const newJournalEntry = await createJournalEntry(pool, transactionDate, entries, description, createdBy);

      // Send the response with the created journal entry
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
      const pool = req.app.get('dbPool')
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
        const pool = req.app.get('dbPool')
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
        const { comment } = req.body;  // Comment for the rejection
        const pool = req.app.get('dbPool');
        const rejectedEntry = await rejectJournalEntry(pool, id, comment);  // Pass comment to controller
        res.status(200).json(rejectedEntry);
    } catch (error) {
        console.error('Error rejecting journal entry:', error);
        res.status(500).json({ message: 'Error rejecting journal entry' });
    }
});


// Route for filtering journal entries (Pending, approved, rejected) with date range
router.get('/search', async (req, res) => {
    const { query } = req.query;  // Capture the search query from the request

    try {
        const pool = req.app.get('dbPool');
        const searchResults = await searchJournalEntries(pool, query);
        res.status(200).json(searchResults);
    } catch (error) {
        console.error('Error searching journal entries:', error);
        res.status(500).json({ message: 'Error searching journal entries' });
    }
});


// Route for searching journal entries by account name, amount, or date
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;  // Search query (account name, amount, date)
        const pool = req.app.get('dbPool')
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

      const pool = req.app.get('dbPool')

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


  
  // Route for retrieving a document from a journal entry
  router.get('/entry/:id/document', async (req, res) => {
    try {
      const { id } = req.params;
      const pool = req.app.get('dbPool') 
  
      const document = await getJournalDocument(pool, id);

      if (!document) {
        return res.status(404).json({ message: 'Document not found for the specified journal entry' });
      }
  
      // Set the correct Content-Type and Content-Disposition headers
      const contentType = document.file_type || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.file_name || 'download'}"`);
      console.log(document.file_data);
      // Ensure file_data is a Buffer and send it in the response
      res.send(document.file_data);
    } catch (error) {
      console.error('Error retrieving document from journal entry:', error);
      res.status(500).json({ message: 'Error retrieving document from journal entry' });
    }
  });

router.get('/pending/count', async (req, res) => {
    const pool = req.app.get('dbPool');
    try {
      const result = await pool.query("SELECT COUNT(*) AS pendingCount FROM journal WHERE status = 'pending'");
      console.log(result);
  
      // Check if result.recordset has entries and return the pending count
      if (result && result.recordset && result.recordset.length > 0) {
        res.json(result.recordset[0]); // Return the first record in the recordset
      } else {
        res.json({ pendingCount: 0 }); // Default to 0 if no results are found
      }
    } catch (error) {
      console.error('Error fetching pending journal count:', error);
      res.status(500).json({ message: 'Error fetching pending journal count' });
    }
  });
  
  router.patch('/edit/:journalID', async (req, res) => {
    const { journalID } = req.params;
    const { transactionDate, description, entries, createdBy } = req.body;
    const pool = req.app.get('dbPool'); // Get the Azure SQL connection pool from the app

    try {
        // Call the editJournalEntry controller
        const result = await editJournalEntry(pool, journalID, transactionDate, entries, description, createdBy);

        console.log('Edit journal entry result:', result); // Debugging log

        if (result.status === 400) {
            return res.status(400).json({ message: result.message }); // Validation error
        } else if (result.status === 500) {
            return res.status(500).json({ message: result.message }); // Internal server error
        }

        res.status(200).json({ journalID: result.journalID, message: result.message }); // Success response
    } catch (error) {
        console.error('Error in edit journal route:', error);
        res.status(500).json({ message: 'Unexpected error occurred while editing the journal entry.' });
    }
});

  
  
  
  

module.exports = router;
