const sql = require('mssql');

exports.resolveError = async (pool, activeErrorID, resolutionNotes) => {
    try {
        const request = new sql.Request(pool);
        request.input('activeErrorID', sql.Int, activeErrorID);
        request.input('resolutionNotes', sql.NVarChar, resolutionNotes);

        const query = `
            UPDATE ActiveErrors
            SET is_resolved = 1, resolution_notes = @resolutionNotes
            WHERE active_error_id = @activeErrorID
        `;

        await request.query(query);
        return { message: 'Error resolved successfully' };
    } catch (error) {
        console.error('Error resolving active error:', error);
        return { status: 500, message: 'Error resolving active error' };
    }
};

exports.getActiveErrors = async (pool) => {
    try {
        const request = new sql.Request(pool);
        

        const query = `
            SELECT ae.active_error_id, ae.journal_id, e.error_code, e.description, ae.is_resolved, ae.created_at
            FROM ActiveErrors ae
            JOIN Errors e ON ae.error_id = e.error_id
            JOIN Journal j ON ae.journal_id = j.journal_id
            WHERE  ae.is_resolved = 0
        `;

        const result = await request.query(query);

        // Return both the count and the details
        return {
            status: 200,
            count: result.recordset.length, // Total number of active errors
            errors: result.recordset, // Detailed list of active errors
        };
    } catch (error) {
        console.error('Error fetching active errors:', error);
        return { status: 500, message: 'Error fetching active errors' };
    }
};


exports.addActiveError = async (pool, journalID, errorID) => {
    try {
        const request = new sql.Request(pool);

        // Add input parameters
        request.input('journalID', sql.Int, journalID);
        request.input('errorID', sql.Int, errorID);

        // Check if the error already exists in ActiveErrors
        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM ActiveErrors
            WHERE journal_id = @journalID AND error_id = @errorID
        `;
        const checkResult = await request.query(checkQuery);

        if (checkResult.recordset[0].count > 0) {
            return { status: 400, message: 'Error already exists as active' };
        }

        // Insert the active error
        const insertQuery = `
            INSERT INTO ActiveErrors (journal_id, error_id, is_resolved)
            VALUES (@journalID, @errorID, 0)
        `;

        await request.query(insertQuery);

        return { status: 200, message: 'Active error added successfully' };
    } catch (error) {
        console.error('Error adding active error:', error);
        return { status: 500, message: 'Error adding active error', errorDetails: error.message };
    }
};


exports.addError = async (pool, errorCode, description) => {
    try {
        const request = new sql.Request(pool);
        request.input('errorCode', sql.NVarChar, errorCode);
        request.input('description', sql.NVarChar, description);

        const query = `
            INSERT INTO Errors (error_code, description)
            VALUES (@errorCode, @description)
        `;

        await request.query(query);
        return { message: 'Error type added successfully' };
    } catch (error) {
        console.error('Error adding error type:', error);
        return { status: 500, message: 'Error adding error type' };
    }
};

