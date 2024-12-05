import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css scripts/about.css';

const About = () => {
    const [selectedCategory, setSelectedCategory] = useState('User Profiles');

    //Data for each category and its pages
    const categories = {
        'User Profiles': [
            {
                name: 'Create User Profile Page',
                description: 'This page allows new users to create a user profile by providing their details and selecting a role. Upon completion, a request will be sent to an admin to approve profile creation',
                link: '/create-profile',
            },
            {
                name: 'Login Page',
                description: 'The login page lets users securely log in to their accounts using their credentials.',
                link: '/login',
            },
            {
                name: 'Forgot Password Feature',
                description: 'If users forget their password, they can reset it via email using this feature.',
                link: '/forgot-password',
            },
            {
                name: 'User Dashboard Page',
                description: 'The user dashboard provides a personalized overview of the user’s activity and account.',
                link: '/dashboard',
            },
            {
                name: 'Emailing System',
                description: 'This feature handles notifications, password resets, and communication with administrators and other users in the system. Can be accessed from Chart of Accounts page',
            },
        ],
        'Account Monitoring': [
            {
                name: 'Chart of Accounts Page',
                description: 'Displays all accounts in a structured format, helping users monitor their financial structure.',
                link: '/user-accounts',
            },
            {
                name: 'Financial Dashboard (KPIs) Page',
                description: 'Provides visual insights into key financial performance indicators.',
                link: '/financial-dashboard',
            },
            {
                name: 'Account Events Page',
                description: 'Logs changes made to accounts, including before-and-after details and timestamps of account changes. Access the event logs for specific accounts from your chart of accounts page',
            },
        ],
        'Account Adjustment': [
            {
                name: 'Journal Entries Page',
                description: 'Allows users to create journal entries for transactions and tracks errors or pending approvals.',
                link: '/journal/:user_id',
            },
            {
                name: 'Ledger Entries for Accounts Page',
                description: 'Displays detailed ledger entries for individual accounts, including debits and credits. Access the general ledger, and ledgers for specific accounts through your chart of accounts page.',
            },
        ],
        'Financial Statements': [
            {
                name: 'Trial Balance',
                description: 'Lists all accounts with their debit and credit balances.',
                link: '/trial-balance',
            },
            {
                name: 'Income Statement',
                description: 'Summarizes revenue and expenses over a specific time period.',
                link: '/income-statement',
            },
            {
                name: 'Balance Sheet',
                description: 'Provides a snapshot of assets, liabilities, and equity at a specific point in time.',
                link: '/balance-sheet',
            },
            {
                name: 'Retained Earnings Statement',
                description: 'Tracks changes in retained earnings over a specific time period.',
                link: '/retained-earnings',
            },
        ],
    };

    return (
        <div className="about">
            <h2>About the System</h2>
            <p>Learn about the features and functionality of this accounting system, organized by category.</p>

            {/* Navbar for categories */}
            <div className="about-navbar">
                {Object.keys(categories).map((category) => (
                    <button
                        key={category}
                        className={`nav-button ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Content for the selected category */}
            <div className="about-content">
                <h3>{selectedCategory}</h3>
                {categories[selectedCategory].map((page) => (
                    <div key={page.name} className="about-page">
                        <h4>{page.name}</h4>
                        <p>{page.description}</p>
                        {page.image && (
                            <img
                                src={page.image}
                                alt={`${page.name}`}
                                className="about-page-image"
                            />
                        )}
                        {page.link && <Link to={page.link}>Go to {page.name}</Link>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default About;
