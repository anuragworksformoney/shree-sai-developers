import React from 'react';
import { Logo } from './Logo';
import { BUSINESS_INFO } from '../data/propertyData';
import { Phone, Mail, MapPin } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenRequirementModal: (action: 'buy' | 'sell' | 'rent') => void;
  onOpenLegalPage?: (page: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenRequirementModal,
  onOpenLegalPage,
}) => {
  const navItems = [
    { label: 'Properties', sectionId: 'properties' },
    { label: 'Buy', action: 'buy' as const },
    { label: 'Sell', action: 'sell' as const },
    { label: 'Rent', action: 'rent' as const },
    { label: 'About', sectionId: 'about' },
    { label: 'Gallery', sectionId: 'gallery' },
    { label: 'Contact', sectionId: 'contact' },
    { label: 'FAQ', sectionId: 'faq' },
  ];

  return (
    <footer className="w-full bg-[#070C18] text-[#E2E8F0] border-t border-[rgba(212,175,55,0.15)] font-montserrat">
      {/* ==================================================
          MOBILE FOOTER (Screens < 768px: 375px, 390px, 430px)
          Full-width, clean, left-aligned, premium minimal layout
          ================================================== */}
      <div className="block md:hidden w-full px-5 py-10 pb-28 text-left">
        <div className="space-y-8">
          {/* 1. Brand Wordmark & Developer Descriptor */}
          <div className="space-y-2">
            <Logo variant="footer" />
            <p className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase font-cinzel">
              BUILDERS &amp; DEVELOPERS
            </p>
          </div>

          {/* 2. Quick Navigation */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-cinzel">
              QUICK NAVIGATION
            </p>
            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              {navItems.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      if (item.action) {
                        onOpenRequirementModal(item.action);
                      } else if (item.sectionId) {
                        onNavigate(item.sectionId);
                      }
                    }}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left font-medium uppercase tracking-wider text-[11px] py-1 block"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Advisory Desk */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-cinzel">
              ADVISORY DESK
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={BUSINESS_INFO.callUrl}
                  className="text-[#E2E8F0] hover:text-[#D4AF37] transition-colors"
                >
                  +91 98674 78525
                </a>
              </div>

              <div className="flex items-center gap-3">
                <WhatsAppIcon className="w-4 h-4 fill-[#25D366] shrink-0" />
                <a
                  href={BUSINESS_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E2E8F0] hover:text-[#25D366] transition-colors"
                >
                  WhatsApp
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="text-[#E2E8F0] hover:text-[#D4AF37] transition-colors break-all"
                >
                  shreesaideveloper.in@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-3 text-[#94A3B8]">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Evershine, Vasai · Boisar · Mumbai &amp; MMR</span>
              </div>
            </div>
          </div>

          {/* 4. Subtle Divider & Bottom Block */}
          <div className="border-t border-[rgba(212,175,55,0.15)] pt-6 space-y-4 text-left text-[11px] text-[#94A3B8] uppercase tracking-wider font-montserrat">
            <div className="space-y-2">
              <p>© {new Date().getFullYear()} SHREE SAI DEVELOPERS</p>
              <div className="flex items-center gap-3 text-[11px]">
                <button
                  onClick={() => onOpenLegalPage?.('privacy')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
                <span className="text-[#475569]">•</span>
                <button
                  onClick={() => onOpenLegalPage?.('terms')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  Terms
                </button>
              </div>
            </div>

            <div className="pt-2">
              <p className="tracking-wider leading-relaxed text-[11px]">
                WEBSITE DESIGN &amp; DEVELOPMENT BY{' '}
                <span className="text-[#D4AF37] font-semibold block">
                  CORE WEB STUDIOS
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          DESKTOP & TABLET FOOTER (Screens >= 768px: 768px, 1280px)
          Desktop footer remains exactly as it currently is
          ================================================== */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 space-y-12 sm:space-y-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Brand & Wordmark */}
          <div className="lg:col-span-5 space-y-4">
            <Logo variant="footer" />
            <p className="text-xs sm:text-sm text-[#CBD5E1] font-light leading-relaxed max-w-sm">
              SHREE SAI DEVELOPERS is an established builder and developer firm providing verified on-ground residential developments, transaction advisory, and property solutions across Mumbai &amp; MMR.
            </p>
            <div className="space-y-1 pt-1 select-none">
              <p className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase font-cinzel">
                BUILDERS &amp; DEVELOPERS
              </p>
              <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-montserrat">
                MUMBAI &amp; MMR • BUY • SELL • RENT
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 space-y-3.5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-cinzel">
              Quick Navigation
            </p>
            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              {navItems.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      if (item.action) {
                        onOpenRequirementModal(item.action);
                      } else if (item.sectionId) {
                        onNavigate(item.sectionId);
                      }
                    }}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left font-medium uppercase tracking-wider text-[11px]"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-3.5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-cinzel">
              Advisory Desk
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={BUSINESS_INFO.callUrl}
                  className="text-[#E2E8F0] hover:text-[#D4AF37] transition-colors"
                >
                  +91 98674 78525
                </a>
              </div>

              <div className="flex items-center gap-3">
                <WhatsAppIcon className="w-4 h-4 fill-[#25D366] shrink-0" />
                <a
                  href={BUSINESS_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E2E8F0] hover:text-[#25D366] transition-colors"
                >
                  +91 98674 78525 (WhatsApp)
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="text-[#E2E8F0] hover:text-[#D4AF37] transition-colors break-all"
                >
                  shreesaideveloper.in@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-3 text-[#94A3B8]">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Evershine, Vasai · Boisar · Mumbai &amp; MMR</span>
              </div>
            </div>
          </div>

        </div>

        {/* Legal & Architectural Baseline Credit */}
        <div className="pt-8 border-t border-[rgba(212,175,55,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#94A3B8] uppercase tracking-wider font-montserrat">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span>© {new Date().getFullYear()} SHREE SAI DEVELOPERS</span>
            <span>•</span>
            <button
              onClick={() => onOpenLegalPage?.('privacy')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegalPage?.('terms')}
              className="hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              Terms
            </button>
          </div>

          <div>
            <p className="tracking-wider">
              WEBSITE DESIGN &amp; DEVELOPMENT BY{' '}
              <span className="text-[#D4AF37] font-semibold">
                CORE WEB STUDIOS
              </span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
