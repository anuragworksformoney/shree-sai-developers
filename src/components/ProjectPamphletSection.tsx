import React from 'react';
import { Eye, Download, FileText } from 'lucide-react';
import { OFFICIAL_BROCHURE } from '../data/propertyData';
import { ProjectPhoto } from '../types';

interface ProjectPamphletSectionProps {
  onOpenLightbox: (photo: ProjectPhoto) => void;
}

export const ProjectPamphletSection: React.FC<ProjectPamphletSectionProps> = ({
  onOpenLightbox,
}) => {
  return (
    <section
      id="brochure"
      className="py-10 sm:py-20 lg:py-24 bg-[#0B1325] text-[#E2E8F0] border-b border-[rgba(212,175,55,0.15)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:card-hw sm:bg-[#1C2541] sm:rounded-[4px] sm:border sm:border-[rgba(212,175,55,0.15)] p-0 sm:p-10 lg:p-14 sm:shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-3.5 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2 text-[#D4AF37] text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] font-montserrat">
                  <span className="w-6 sm:w-8 h-[2px] bg-[#D4AF37]" aria-hidden="true" />
                  <FileText className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Official Publication</span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#D4AF37] tracking-tight leading-tight font-cinzel text-balance">
                  Official Project Brochure
                </h2>

                <p className="text-xs sm:text-sm font-semibold text-[#CBD5E1] tracking-wider uppercase font-montserrat">
                  Shree Sai Apartment — Evershine, Vasai
                </p>
              </div>

              <p className="text-sm text-[#CBD5E1] font-light leading-relaxed font-montserrat">
                Review the official publication document for Shree Sai Apartment. Access complete verified project documentation, architectural elevation, and verified developer records in high resolution.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-montserrat">
                <button
                  onClick={() => onOpenLightbox(OFFICIAL_BROCHURE)}
                  className="min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] active:scale-[0.98] text-[#0C2340] font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all duration-200"
                >
                  <Eye className="w-4 h-4 stroke-[2.5] text-[#0C2340]" />
                  <span className="text-[#0C2340]">VIEW BROCHURE</span>
                </button>

                <a
                  href="/4.png"
                  download="Shree_Sai_Apartment_Brochure.png"
                  className="min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-[4px] border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0C2340] active:scale-[0.98] font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-200 group"
                >
                  <Download className="w-4 h-4 stroke-[2.5] text-[#D4AF37] group-hover:text-[#0C2340] transition-colors" />
                  <span>DOWNLOAD DOCUMENT</span>
                </a>
              </div>
            </div>

            {/* Right Document Preview */}
            <div className="lg:col-span-6 w-full">
              <div
                onClick={() => onOpenLightbox(OFFICIAL_BROCHURE)}
                className="relative rounded-[4px] p-2 bg-[#0B1325] border border-[#2A3454] group cursor-pointer w-full max-w-sm sm:max-w-md mx-auto shadow-2xl"
              >
                <img
                  src="/optimized/4-800w.webp"
                  srcSet="/optimized/4-480w.webp 480w, /optimized/4-800w.webp 800w, /optimized/4-1200w.webp 1200w"
                  sizes="(min-width: 640px) 448px, 100vw"
                  width={1254}
                  height={1254}
                  alt="Official Project Brochure for Shree Sai Apartment"
                  className="w-full h-auto object-contain rounded-[2px] group-hover:scale-101 transition-transform duration-300 block"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-[#0B1325]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-xs rounded-[4px]">
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-[4px] bg-[#D4AF37] text-[#0C2340] font-bold text-xs uppercase tracking-wider shadow-lg font-montserrat">
                    <Eye className="w-4 h-4 stroke-[2.5] text-[#0C2340]" />
                    <span className="text-[#0C2340]">EXPAND BROCHURE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectPamphletSection;

