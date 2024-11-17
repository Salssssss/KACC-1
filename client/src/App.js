import Nav from './Nav';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import CreateProfile from './CreateProfile';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import SetPassword from './SetPassword';
import SelectSecurityQuestions from './SelectSecurityQuestions';
import ForgotPassword from './ForgotPassword';
import TopRightProfile from './TopRightProfile';
import AdminChartOfAcc from './AdminChartOfAcc';
import About from './About';
import CurrentUserChartOfAcc from './CurrentUserChartOfAcc';
import GeneralLedger from './GeneralLedger';
import CreateAccount from './CreateAccount';
import JournalEntries from './JournalEntries';
import EventLogs from './EventLogs';
import JournalFromLedger from './JournalFromLedger';
import TrialBalance from './TrialBalance';
import BalanceSheet from './BalanceSheet'; 
import IncomeStatement from './IncomeStatement';
import RetainedEarningsStatement from './RetainedEarningsStatement';



const ProtectedRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');
  const userTeamID = localStorage.getItem('userTeamID');

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};


function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    const loggedInStatus = localStorage.getItem('isLoggedIn');
  
  
  }, []);

  return (
    <Router>
      <Nav />
      {/* Conditionally render the profile only if the user is logged in */}
      {isLoggedIn && <TopRightProfile />}  {/* This will only render after login */}
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login Route */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* Forgot Passowrd route*/}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* About Route */}
        <Route path='/about' element={<About />} />
        
        {/* Create Account Route */}
        <Route path="/create-profile" element={<CreateProfile />} />

        {/* Forgot Passowrd route*/}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Create Profile Route */}
        <Route path="/create-profile" element={<CreateProfile />} />
        
        {/* Password Setup */}
        <Route path="/set-password" element={<SetPassword />} />

        {/* create account Setup */}
        <Route path="/create-account/:user_id" element={<CreateAccount />} />

        {/*Journal*/}
        <Route path ="/journal/:user_id" element={<JournalEntries />} />

        {/*JournalFromLedger*/}
        <Route path = "/journalentry/:journal_id" element={<JournalFromLedger/>}/>


        {/* Security Questions Setup Route */}
        <Route
          path="/select-security-questions"
          element={<SelectSecurityQuestions /> }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="administrator">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Chart of accounts by user (admin view) */}
        <Route 
          path="/chart-of-accounts/:userId" 
          element={<AdminChartOfAcc />} 
          />

        {/* Current User's Chart of Accounts */}
        <Route 
          path="/user-accounts" 
          element={<CurrentUserChartOfAcc />} 
          />

        {/* Ledger */}
        <Route path="/ledger/:accountId" element={<GeneralLedger />} /> {/* Route for ledger */}

       {/* Current User's Chart of Accounts */}
        <Route 
          path="/event-logs/:account_id" 
          element={<EventLogs />} 
        />

         {/*Viewing the Trial Balance*/}
         <Route
         path = "/trial-balance"
         element = {<TrialBalance/>}
         />

         {/*Viewing the Balance Sheet*/}
         <Route
         path = "/balance-sheet"
         element = {<BalanceSheet/>}
         />

         {/*Viewing the Income Statement*/}
         <Route
         path = "/income-statement"
         element = {<IncomeStatement/>}
         />

         {/*Viewing the Retained Earnings Statement*/}
         <Route
         path = "/retained-earnings"
         element = {<RetainedEarningsStatement/>}
         />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
