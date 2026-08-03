import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesGrid from './components/FeaturesGrid';
import RoleShowcase from './components/RoleShowcase';
import AiDemoSimulator from './components/AiDemoSimulator';
import RoiCalculator from './components/RoiCalculator';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import Footer from './components/Footer';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import BusinessOwnerDashboard from './pages/BusinessOwnerDashboard';
import UploadInvoiceFullPage from './pages/UploadInvoiceFullPage';
import CreateInvoiceFullPage from './pages/CreateInvoiceFullPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'signup' | 'login' | 'dashboard' | 'upload_invoice' | 'create_invoice'
  const [loginRole, setLoginRole] = useState(null);
  const [ownerId, setOwnerId] = useState('');
  const [ownerPass, setOwnerPass] = useState('');
  const [dashboardCompanyName, setDashboardCompanyName] = useState('Metro Superstore Ltd');
  const [dashboardOwnerName, setDashboardOwnerName] = useState('Business Owner');

  const handleOpenSignup = () => {
    setCurrentPage('signup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = (role = null, generatedId = '', generatedPass = '', compName = '', userEmail = '') => {
    setLoginRole(role);
    setOwnerId(generatedId);
    setOwnerPass(generatedPass);
    if (compName) setDashboardCompanyName(compName);
    if (userEmail) setDashboardOwnerName(userEmail);
    setCurrentPage('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDashboard = (role = 'owner', compName = '', userEmail = '') => {
    if (compName) setDashboardCompanyName(compName);
    if (userEmail) setDashboardOwnerName(userEmail);
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'dashboard') {
    return (
      <BusinessOwnerDashboard
        companyName={dashboardCompanyName}
        ownerName={dashboardOwnerName}
        onLogout={handleBackToLanding}
        onOpenUploadPage={() => setCurrentPage('upload_invoice')}
        onOpenBillingPage={() => setCurrentPage('create_invoice')}
      />
    );
  }

  if (currentPage === 'upload_invoice') {
    return (
      <UploadInvoiceFullPage
        onBack={handleBackToDashboard}
        onInvoiceSaved={handleBackToDashboard}
      />
    );
  }

  if (currentPage === 'create_invoice') {
    return (
      <CreateInvoiceFullPage
        onBack={handleBackToDashboard}
        onInvoiceCreated={handleBackToDashboard}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <SignupPage
        onBack={handleBackToLanding}
        onNavigateToLogin={(role, genId, genPass, compName, userEmail) => handleOpenLogin(role, genId, genPass, compName, userEmail)}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onBack={handleBackToLanding}
        initialRole={loginRole}
        initialOwnerId={ownerId}
        initialOwnerPass={ownerPass}
        onNavigateToDashboard={handleOpenDashboard}
      />
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#FFFFFF', overflowX: 'hidden' }}>
      <Navbar
        onOpenModal={(type) => {
          if (type === 'login') handleOpenLogin();
          else if (type === 'dashboard') handleOpenDashboard();
          else handleOpenSignup();
        }}
      />
      <main>
        <HeroSection
          onOpenModal={(type) => {
            if (type === 'login') handleOpenLogin();
            else if (type === 'dashboard') handleOpenDashboard();
            else handleOpenSignup();
          }}
        />
        <FeaturesGrid />
        <RoleShowcase
          onOpenModal={() => handleOpenLogin()}
        />
        <AiDemoSimulator />
        <RoiCalculator />
        <PricingSection
          onOpenModal={(type) => {
            if (type === 'login') handleOpenLogin();
            else if (type === 'dashboard') handleOpenDashboard();
            else handleOpenSignup();
          }}
        />
        <Footer
          onOpenModal={(type) => {
            if (type === 'login') handleOpenLogin();
            else if (type === 'dashboard') handleOpenDashboard();
            else handleOpenSignup();
          }}
        />
      </main>
    </div>
  );
}
