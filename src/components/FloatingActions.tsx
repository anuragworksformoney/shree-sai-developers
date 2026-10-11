import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BUSINESS_INFO } from '../data/propertyData';

export const FloatingActions: React.FC = () => {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const heroEl = document.getElementById('hero');

    const updateVisibility = () => {
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        // The hero is considered scrolled past when its bottom edge reaches or passes the top navbar region
        const isPastHero = rect.bottom <= 80;
        setShowWhatsApp(isPastHero);
      } else {
        setShowWhatsApp(window.scrollY > 400);
      }
      setShowScrollTop(window.scrollY > 400);
    };

    // Initial check on mount
    updateVisibility();

    // IntersectionObserver tied to the actual hero landing section
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && heroEl) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.target === heroEl) {
              updateVisibility();
            }
          }
        },
        {
          root: null,
          threshold: [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1],
          rootMargin: '-80px 0px 0px 0px',
        }
      );
      observer.observe(heroEl);
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-40 flex flex-col items-center gap-2.5 select-none pointer-events-none font-montserrat">
      {/* Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] bg-[#1C2541] hover:bg-[#D4AF37] text-[#E2E8F0] hover:text-[#0C2340] flex items-center justify-center shadow-lg transition-all border border-[rgba(212,175,55,0.3)] cursor-pointer"
          title="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2]" />
        </button>
      )}

      {/* Official WhatsApp Floating Button (#25D366) */}
      {showWhatsApp && (
        <a
          href={BUSINESS_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="pointer-events-auto group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-[4px] bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl transition-all duration-200 cursor-pointer animate-in fade-in"
          title="WhatsApp Advisory"
        >
          <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 fill-white" />
          <span className="hidden sm:inline-block absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap bg-[#1C2541] text-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 shadow-xl border border-[rgba(212,175,55,0.3)] rounded-[4px]">
            WhatsApp Advisory
          </span>
        </a>
      )}
    </div>
  );
};

export default FloatingActions;

