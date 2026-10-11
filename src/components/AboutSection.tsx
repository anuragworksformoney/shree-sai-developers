import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onContactClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  return (
    <section id="about" className="py-20 bg-[#0B1325] text-[#E2E8F0] font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Showcase Block */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-[4px] overflow-hidden border border-[rgba(212,175,55,0.2)] shadow-xl">
              <img
                src="/5.png"
                alt="Shree Sai Apartment"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* About Editorial Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
                About Us
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold text-[#FFFFFF] font-cinzel leading-tight">
                SHREE SAI DEVELOPERS
              </h2>
              <p className="text-xs font-semibold text-[#CBD5E1] tracking-wider uppercase">
                BUILDERS &amp; DEVELOPERS &bull; MUMBAI &amp; MMR
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              Shree Sai Developers is a builder and developer firm operating in Mumbai and MMR, with focused residential developments in Evershine, Vasai and Boisar.
            </p>

            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              We specialize in the development, sale, and leasing of residential properties, providing personal attention and clear communication to all our clients.
            </p>

            <div className="pt-2">
              <button
                onClick={onContactClick}
                className="btn-hw-primary inline-flex items-center gap-2"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutSection;
