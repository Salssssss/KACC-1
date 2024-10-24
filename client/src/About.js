import React from 'react';

const About = () => {

    return (
        <div className='about'>
            <h1>Features</h1>
                <h2>Accountant User</h2>
                    <p>This tier account has the lowest clearance. Any features they have access to, so do the higher security accounts.</p>
                    <p>With this account, users have access to a Dashboard and Chart of Accounts page to manage finances. They may also create, manage, and submit their own journal entries for manager approval, or view manager journal entries. The accepted journal entries are displayed in the ledger, which will also show details like the account balance. They have access to an event log, which tracks the changes for each account, and they can send emails to Manager and Administrative accounts via the Chart of Accounts page.</p>
                <h2>Manage User</h2>
                    <p>This tier account has the second highest clearance. Any features they have access to, so do the higher security accounts.</p>
                    <p>With this account, users may view any user accounts as well as approving and viewing user journal entries.</p>
                <h2>Administrative User</h2>
                    <p>This tier account has the highest clearance.</p>
                    <p>With this account, users may add, edit, or deactivate accounts. They may also send emails from the Chart of Accounts page to all other users.</p>
        </div>
    );
};

export default About;