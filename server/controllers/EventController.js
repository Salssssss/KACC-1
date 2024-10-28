const sql = require('mssql');

exports.getEventLogsByAccount = async (req, res) => {
    const { account_id } = req.params;
    //const userRole = req.user.role_name;
    //const userTeamID = req.user.team_id;

    //Check if the user is an admin or belongs to the team
    /*if (userRole !== 'administrator' && userTeamID !== parseInt(teamID)) {
        return res.status(403).json({ error: 'Access denied. You cannot view logs for other teams.' });
    }*/

    try {
        //SQL query to fetch event logs
        const query = `
          SELECT event_id, account_id, before_image, after_image, changed_by_user_id, event_time
          FROM account_events
          WHERE account_id = @account_id
        `;
    
        //Create a SQL request from the shared pool
        const request = new sql.Request(req.app.locals.pool);
        request.input('account_id', sql.Int, account_id);
    
        const result = await request.query(query);
    
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No event logs found for this account.' });
        }
    
        res.status(200).json(result.recordset);
    } 
    catch (error) {
        console.error('Error fetching event logs:', error);
        res.status(500).json({ error: 'Failed to fetch event logs.' });
    }
};
