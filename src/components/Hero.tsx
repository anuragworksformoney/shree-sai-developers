import React, { useState, useEffect } from 'react';
import { ArrowRight, Phone } from 'lucide-react';

interface HeroProps {
  onSelectAction?: (action: 'buy' | 'sell' | 'rent') => void;
  onExploreProperties?: () => void;
  onExploreProjects?: () => void;
  onOpenContact?: () => void;
  onBookSiteVisit?: () => void;
  onOpenRequirementModal?: (action: 'buy' | 'sell' | 'rent') => void;
  onSearchSubmit?: (filters: { requirement: string; location: string; propertyType: string; budget: string }) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreProperties,
  onExploreProjects,
  onOpenContact,
  onBookSiteVisit,
}) => {
  const handleExplore = onExploreProjects || onExploreProperties;
  const handleContact = onBookSiteVisit || onOpenContact;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Subtle luxury parallax offset (desktop only)
  const textOffset = -Math.min(scrollY, 800) * 0.06;

  return (
    <section
      id="hero"
      className="relative w-full min-h-[100svh] sm:min-h-screen flex flex-col justify-end sm:justify-center pt-[72px] sm:pt-[100px] lg:pt-[110px] pb-8 sm:pb-[80px] lg:pb-[90px] overflow-hidden parallax-container"
      style={{
        backgroundAttachment: 'local',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      {/* 1. Full-Bleed Architectural Image Asset Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <picture>
          <source
            type="image/webp"
            srcSet="/optimized/3-480w.webp 480w, /optimized/3-800w.webp 800w, /optimized/3-1200w.webp 1200w, /optimized/3-full.webp 1448w"
            sizes="100vw"
          />
          <img
            src="/optimized/3-1200w.webp"
            alt="Evershine, Vasai - Shree Sai Apartment"
            className="w-full h-full object-cover object-[center_32%] sm:object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width={1448}
            height={1086}
          />
        </picture>
      </div>

      {/* 2. Measured Scrim System: Lighter at top to expose architecture, soft bottom contrast for crisp typography */}
      {/* Mobile-first directional scrim */}
      <div
        className="absolute inset-0 z-1 pointer-events-none sm:hidden"
        style={{
          background:
            'linear-gradient(to top, rgba(11, 19, 37, 0.97) 0%, rgba(11, 19, 37, 0.88) 38%, rgba(11, 19, 37, 0.45) 65%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Desktop refined architectural scrim: protects text contrast on the left while preserving building visibility on the right */}
      <div
        className="hidden sm:block absolute inset-0 z-1 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(11, 19, 37, 0.90) 0%, rgba(11, 19, 37, 0.74) 34%, rgba(11, 19, 37, 0.38) 65%, rgba(11, 19, 37, 0.12) 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="hidden sm:block absolute inset-0 z-1 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(11, 19, 37, 0.60) 0%, transparent 22%, transparent 72%, rgba(11, 19, 37, 0.82) 100%)',
        }}
        aria-hidden="true"
      />

      {/* 3. Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full">
        <div
          className="max-w-2xl lg:max-w-3xl"
          style={{
            transform: `translate3d(0, ${textOffset}px, 0)`,
            willChange: 'transform',
          }}
        >
          {/* Editorial Kicker */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3.5">
            <span className="w-6 sm:w-8 h-[2px] bg-[#D4AF37] shrink-0" aria-hidden="true" />
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-montserrat">
              Shree Sai Developers · Mumbai &amp; MMR
            </p>
          </div>

          {/* Main Heading */}
          <h1
            className="text-[1.5rem] leading-[1.2] sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[50px] font-bold tracking-tight uppercase font-cinzel text-balance"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              textShadow: '0 2px 8px rgba(0,0,0,0.65)',
            }}
          >
            <span className="text-[#FFFFFF]">Real Estate, </span>
            <span className="text-[#D4AF37]">Built With Purpose.</span>
          </h1>

          {/* Supporting Text */}
          <p
            className="mt-2.5 sm:mt-3.5 mb-5 sm:mb-7 text-xs sm:text-sm md:text-base lg:text-[17px] font-normal tracking-wide leading-relaxed max-w-xl font-montserrat text-[#CBD5E1]"
            style={{
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Trusted real-estate solutions for buying, selling, and renting across Mumbai &amp; MMR.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
            {/* Primary Action Button: Explore Properties */}
            <button
              onClick={handleExplore}
              className="w-full sm:w-auto h-12 px-6 sm:px-7 rounded-[4px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-lg cursor-pointer bg-[#D4AF37] hover:bg-[#E5C158] text-[#0C2340] border border-[#D4AF37] active:scale-[0.98]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              <span>Explore Properties</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#0C2340]" />
            </button>

            {/* Secondary Action Button: Request Callback */}
            <button
              onClick={handleContact}
              className="w-full sm:w-auto h-12 px-6 sm:px-7 rounded-[4px] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-sm cursor-pointer bg-[#0B1325]/70 hover:bg-[#1C2541] border border-[rgba(212,175,55,0.5)] hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#FFFFFF] active:scale-[0.98]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              <Phone className="w-4 h-4 stroke-[2.2] text-[#D4AF37]" />
              <span>Request Callback</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

