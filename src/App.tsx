import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedProjects } from './components/FeaturedProjects';
import ServicesSection from './components/ServicesSection';
import AboutSection from './components/AboutSection';
import WhyChooseUs from './components/WhyChooseUs';
import ConnectivitySection from './components/ConnectivitySection';
import { GallerySection } from './components/GallerySection';
import { ProjectPamphletSection } from './components/ProjectPamphletSection';
import SiteVisitSection from './components/SiteVisitSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { LightboxModal } from './components/LightboxModal';
import RequirementModal from './components/RequirementModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsConditionsPage from './components/TermsConditionsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProjectPhoto, ShowcaseProject } from './types';
import { useScrollReveal } from './utils/useScrollReveal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  useScrollReveal();

  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'terms' | 'admin' | 'property-detail'>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const hash = window.location.hash.toLowerCase();
      if (pathname === '/admin' || hash === '#admin' || hash === '#/admin') return 'admin';
      if (hash.startsWith('#/properties/') || hash.startsWith('#properties/')) return 'property-detail';
      if (pathname === '/privacy' || hash === '#privacy' || hash === '#/privacy') return 'privacy';
      if (pathname === '/terms' || hash === '#terms' || hash === '#/terms') return 'terms';
    }
    return 'home';
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/#\/?properties\/([^/?#]+)/i);
      if (match && match[1]) return decodeURIComponent(match[1]);
    }
    return null;
  });

  const [activeSection, setActiveSection] = useState<string>('hero');
  const [lightboxPhoto, setLightboxPhoto] = useState<ProjectPhoto | null>(null);
  const [selectedDetailProject, setSelectedDetailProject] = useState<ShowcaseProject | null>(null);
  const [requirementModalConfig, setRequirementModalConfig] = useState<{
    isOpen: boolean;
    type: 'buy' | 'sell' | 'rent';
    location?: string;
    propertyInterest?: string;
  }>({
    isOpen: false,
    type: 'buy',
    location: '',
    propertyInterest: '',
  });
  const [contactSubject, setContactSubject] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const hash = window.location.hash;
      const lowerHash = hash.toLowerCase();

      if (pathname === '/admin' || lowerHash === '#admin' || lowerHash === '#/admin') {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      const propMatch = hash.match(/#\/?properties\/([^/?#]+)/i);
      if (propMatch && propMatch[1]) {
        setSelectedPropertyId(decodeURIComponent(propMatch[1]));
        setCurrentView('property-detail');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (pathname === '/privacy' || lowerHash === '#privacy' || lowerHash === '#/privacy') {
        setCurrentView('privacy');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (pathname === '/terms' || lowerHash === '#terms' || lowerHash === '#/terms') {
        setCurrentView('terms');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setCurrentView('home');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Admin Access shortcut for preview & administration: Ctrl + Shift + A or Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.hash = '#/admin';
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenLegalPage = (page: 'privacy' | 'terms') => {
    window.location.hash = `#${page}`;
    setCurrentView(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.pushState(null, '', '/');
    }
    window.location.hash = '';
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      handleBackToHome();
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleOpenRequirementModal = (type: 'buy' | 'sell' | 'rent') => {
    setRequirementModalConfig({
      isOpen: true,
      type,
      location: 'Evershine, Vasai',
    });
  };

  const handleEnquireProject = (projectName: string) => {
    setContactSubject(projectName);
    scrollToSection('contact');
    setToastMessage(`Inquiring about ${projectName}. Please submit your details below.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onBackToWebsite={handleBackToHome}
        onViewPropertyDetail={(id) => {
          window.location.hash = `#/properties/${id}`;
        }}
      />
    );
  }

  if (currentView === 'property-detail') {
    return (
      <>
        <PropertyDetailPage
          propertyId={selectedPropertyId || 'shree-sai-apartment'}
          onBack={handleBackToHome}
          onOpenLightbox={(photo) => setLightboxPhoto(photo)}
          onEnquire={(prop) => {
            const raw = (prop.listingType || '').toLowerCase();
            const validMode: 'buy' | 'sell' | 'rent' = raw.includes('sell')
              ? 'sell'
              : raw.includes('rent')
              ? 'rent'
              : 'buy';
            setRequirementModalConfig({
              isOpen: true,
              type: validMode,
              location: prop.location,
              propertyInterest: prop.name,
            });
          }}
          onBookSiteVisit={(prop) => {
            setRequirementModalConfig({
              isOpen: true,
              type: 'buy',
              location: prop.location,
              propertyInterest: `${prop.name} (Site Visit)`,
            });
          }}
        />

        <LightboxModal
          currentPhoto={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
          onSelectPhoto={(photo) => setLightboxPhoto(photo)}
        />

        <RequirementModal
          isOpen={requirementModalConfig.isOpen}
          initialType={requirementModalConfig.type}
          initialLocation={requirementModalConfig.location}
          initialPropertyInterest={requirementModalConfig.propertyInterest}
          onClose={() =>
            setRequirementModalConfig((prev) => ({ ...prev, isOpen: false }))
          }
        />
      </>
    );
  }

  if (currentView === 'privacy') {
    return (
      <PrivacyPolicyPage
        onBackToHome={handleBackToHome}
        onOpenTerms={() => handleOpenLegalPage('terms')}
      />
    );
  }

  if (currentView === 'terms') {
    return (
      <TermsConditionsPage
        onBackToHome={handleBackToHome}
        onOpenPrivacy={() => handleOpenLegalPage('privacy')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1325] text-[#E2E8F0] flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#FFFFFF] transition-colors duration-300 font-montserrat">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 left-5 sm:left-auto sm:w-96 z-50 p-4 bg-[#1C2541] text-[#E2E8F0] shadow-2xl rounded-xs border border-[rgba(212,175,55,0.25)] flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5 stroke-[2]" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#D4AF37] tracking-wide uppercase font-cinzel">Property Advisory</p>
            <p className="text-xs text-[#CBD5E1] mt-0.5">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1.5 text-[#94A3B8] hover:text-[#FFFFFF] cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      )}

      {/* 1. Elite Header */}
      <Header
        onNavigate={scrollToSection}
        onOpenRequirementModal={handleOpenRequirementModal}
        activeSection={activeSection}
      />

      {/* 2. Hero Section */}
      <Hero
        onExploreProjects={() => scrollToSection('properties')}
        onBookSiteVisit={() => scrollToSection('contact')}
        onOpenRequirementModal={handleOpenRequirementModal}
      />

      {/* Main Architectural Showcase Container */}
      <main className="flex-1 space-y-0">
        {/* 3. Featured Properties */}
        <FeaturedProjects
          onOpenLightbox={(photo) => setLightboxPhoto(photo)}
          onOpenDetails={(project) => setSelectedDetailProject(project)}
          onOpenManagedDetail={(propertyId) => {
            window.location.hash = `#/properties/${propertyId}`;
          }}
          onEnquireProject={handleEnquireProject}
        />

        {/* 4. Buy / Sell / Rent */}
        <div className="reveal-on-scroll">
          <ServicesSection
            onSelectService={handleOpenRequirementModal}
          />
        </div>

        {/* 5. About Shree Sai Developers */}
        <div className="reveal-on-scroll">
          <AboutSection
            onContactClick={() => scrollToSection('contact')}
          />
        </div>

        {/* 6. Why Shree Sai (4 Pillars) */}
        <div className="reveal-on-scroll">
          <WhyChooseUs />
        </div>

        {/* 6b. Connectivity & Infrastructure */}
        <div className="reveal-on-scroll">
          <ConnectivitySection />
        </div>

        {/* 7. Architectural Property Gallery */}
        <GallerySection
          onOpenLightbox={(photo) => setLightboxPhoto(photo)}
        />

        {/* 8. Dedicated Official Project Brochure Section */}
        <div className="reveal-on-scroll">
          <ProjectPamphletSection
            onOpenLightbox={(photo) => setLightboxPhoto(photo)}
          />
        </div>

        {/* 9. Consultation CTA Section */}
        <div className="reveal-on-scroll">
          <SiteVisitSection
            onBookSiteVisit={() => scrollToSection('contact')}
          />
        </div>

        {/* 10. Frequently Asked Questions */}
        <div className="reveal-on-scroll">
          <FAQSection />
        </div>

        {/* 11. Official Contact & Consultation Desk */}
        <div className="reveal-on-scroll">
          <ContactSection
            initialSubject={contactSubject}
          />
        </div>
      </main>

      {/* 12. Architectural Baseline Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenRequirementModal={handleOpenRequirementModal}
        onOpenLegalPage={handleOpenLegalPage}
      />

      {/* Floating Call & WhatsApp Desk */}
      <FloatingActions />

      {/* Fullscreen Photo Lightbox Modal */}
      <LightboxModal
        currentPhoto={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        onSelectPhoto={(photo) => setLightboxPhoto(photo)}
      />

      {/* Requirement Modal */}
      <RequirementModal
        isOpen={requirementModalConfig.isOpen}
        initialType={requirementModalConfig.type}
        initialLocation={requirementModalConfig.location}
        initialPropertyInterest={requirementModalConfig.propertyInterest}
        onClose={() =>
          setRequirementModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* Legacy Project Detail Modal */}
      <PropertyDetailModal
        project={selectedDetailProject}
        onClose={() => setSelectedDetailProject(null)}
        onOpenLightbox={(photo) => setLightboxPhoto(photo)}
        onEnquire={handleEnquireProject}
      />
    </div>
  );
}
