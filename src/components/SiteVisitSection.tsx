import React from 'react';
import { Phone, ArrowRight } from 'lucide-react';

interface SiteVisitSectionProps {
  onBookSiteVisit: () => void;
}

export const SiteVisitSection: React.FC<SiteVisitSectionProps> = ({ onBookSiteVisit }) => {
  return (
    <section className="py-16 bg-[#070C18] text-[#E2E8F0] font-montserrat border-y border-[rgba(212,175,55,0.15)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
          Site Visits
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] font-cinzel">
          Schedule a Site Visit
        </h2>
        <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl mx-auto leading-relaxed">
          Visit our residential developments in Evershine, Vasai or Boisar in person. Contact our team to arrange a convenient inspection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onBookSiteVisit}
            className="w-full sm:w-auto btn-hw-primary flex items-center justify-center gap-2 text-xs py-2.5 px-6"
          >
            <span>Book Visit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="tel:+919867478525"
            className="w-full sm:w-auto btn-hw-outline flex items-center justify-center gap-2 text-xs py-2.5 px-6"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Call +91 98674 78525</span>
          </a>
        </div>
      </div>
    </section>
  );
};
export default SiteVisitSection;
