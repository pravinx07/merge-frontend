import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Stats } from '../components/Stats';
import { HowItWorks } from '../components/HowItWorks';
import { Community } from '../components/Community';
import { RoleCategories } from '../components/RoleCategories';
import { CTABanner } from '../components/CTABanner';
import { Footer } from '../components/Footer';

import { Pricing } from '../components/Pricing';

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-300 selection:bg-brand-cyan/30 font-sans">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Community />
      <RoleCategories />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default LandingPage;
