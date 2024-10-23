const sql = require('mssql');

const getEventLogsByTeam = async (req, res) => {
    const { teamID } = req.params;
    const userRole = req.user.role_name;
    const userTeamID = req.user.team_id;

    //Check if the user is an admin or belongs to the team
    if (userRole !== 'administrator' && userTeamID !== teamID) {
        return res.status(403).json({ error: 'Access denied. You cannot view logs for other teams.' });
    }

    try {
        //SQL query to fetch event logs
        const query = `
          SELECT event_id, account_id, before_image, after_image, changed_by_user_id, event_time
          FROM account_events
          WHERE account_id IN (
            SELECT account_id FROM accounts WHERE team_id = @teamID
          )
        `;
    
        //Pass the teamID into query through a sql request object for more security
        const request = new sql.Request();
        request.input('teamID', sql.Int, teamID);
    
        const result = await request.query(query);
    
        //Useless comment, but why do we need three equal signs in javascript if statements???
        //This entire language just feels cluttered
        if (result.recordset.length === 0) {
          return res.status(404).json({ error: 'No event logs found for this team.' });
        }
    
        res.status(200).json(result.recordset);
      } 
      catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch event logs.' });
      }
}