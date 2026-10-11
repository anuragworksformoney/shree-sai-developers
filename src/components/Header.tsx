import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BUSINESS_INFO } from '../data/propertyData';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  onOpenRequirementModal: (type: 'buy' | 'sell' | 'rent') => void;
  activeSection?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenRequirementModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Properties', sectionId: 'properties' },
    { label: 'Buy', action: 'buy' as const },
    { label: 'Sell', action: 'sell' as const },
    { label: 'Rent', action: 'rent' as const },
    { label: 'About', sectionId: 'about' },
    { label: 'Gallery', sectionId: 'gallery' },
    { label: 'Contact', sectionId: 'contact' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setMobileMenuOpen(false);
    if (item.action) {
      onOpenRequirementModal(item.action);
    } else if (item.sectionId) {
      onNavigate(item.sectionId);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-montserrat ${
        scrolled
          ? 'bg-[#070C18]/95 backdrop-blur-md border-b border-[rgba(212,175,55,0.2)] py-3 shadow-xl'
          : 'bg-gradient-to-b from-[#070C18]/90 via-[#070C18]/70 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-left cursor-pointer"
        >
          <Logo />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 center-nav text-xs font-semibold tracking-wider uppercase text-[#CBD5E1]">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer py-1"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Button & Contact */}
        <div className="hidden sm:flex items-center gap-3.5">
          <a
            href="tel:+919867478525"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E1] hover:text-[#D4AF37] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>+91 98674 78525</span>
          </a>
          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:text-[#20ba59] transition-colors"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
            <span className="hidden md:inline">WhatsApp</span>
          </a>
          <button
            onClick={() => onNavigate('contact')}
            className="btn-hw-primary text-xs py-2 px-4.5"
          >
            Contact Us
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#CBD5E1] hover:text-[#D4AF37] cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070C18]/98 border-b border-[rgba(212,175,55,0.2)] px-4 py-6 space-y-4 animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="text-left text-sm font-semibold tracking-wider uppercase text-[#E2E8F0] hover:text-[#D4AF37] py-2 border-b border-[#1C2541] cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            <a
              href="tel:+919867478525"
              className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]"
            >
              <Phone className="w-4 h-4" />
              <span>Call: +91 98674 78525</span>
            </a>
            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-[#25D366] hover:text-[#20ba59]"
            >
              <WhatsAppIcon className="w-4 h-4 fill-[#25D366]" />
              <span>WhatsApp: +91 98674 78525</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('contact');
              }}
              className="btn-hw-primary text-center text-xs py-2.5 w-full"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
