import React, { useState } from 'react';
import { Eye, MapPin } from 'lucide-react';
import { ALL_PROJECT_PHOTOS } from '../data/propertyData';
import { ProjectPhoto } from '../types';
import { getResponsiveImageDetails } from '../utils/imageUtils';

interface GallerySectionProps {
  onOpenLightbox: (photo: ProjectPhoto) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenLightbox }) => {
  const [filter, setFilter] = useState<'all' | 'vasai' | 'boisar'>('all');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Exactly 9 real supplied property photographs (brochure 4.png is kept separate in official publication section)
  const photos = ALL_PROJECT_PHOTOS.filter((p) => p.id !== 'sai-brochure');

  const filteredPhotos = photos.filter((p) => {
    if (filter === 'vasai') return p.category === 'evershine_vasai';
    if (filter === 'boisar') return p.category === 'boisar';
    return true;
  });

  return (
    <section
      id="gallery"
      className="py-12 sm:py-20 lg:py-24 bg-[#0B1325] text-[#E2E8F0] border-b border-[rgba(212,175,55,0.15)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 sm:pb-12 border-b border-[rgba(212,175,55,0.15)]">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 sm:w-8 h-[2px] bg-[#D4AF37]" aria-hidden="true" />
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-montserrat">
                Actual On-Ground Imagery
              </p>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#D4AF37] tracking-tight font-cinzel">
              Project Gallery
            </h2>
          </div>

          {/* Luxury Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 font-montserrat pt-2 md:pt-0">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'vasai', label: 'Shree Sai Apartment (Vasai)' },
              { id: 'boisar', label: 'Boisar Property' },
            ].map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as 'all' | 'vasai' | 'boisar')}
                  className={`px-3.5 py-1.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#0C2340] border-[#D4AF37] shadow-sm font-bold'
                      : 'bg-[#1C2541] text-[#CBD5E1] border-[rgba(212,175,55,0.2)] hover:border-[#D4AF37] hover:text-[#FFFFFF]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid: Elegant Dark Luxury Cards with Complete Uncropped Photograph Presentation */}
        <div className="pt-8 sm:pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPhotos.map((photo) => {
            const isFailed = failedImages.has(photo.id);
            const isBoisar = photo.category === 'boisar';
            const locationLabel = isBoisar ? 'BOISAR' : 'EVERSHINE, VASAI';

            return (
              <div
                key={photo.id}
                className="card-hw card-hw-interactive bg-[#1C2541] border border-[rgba(212,175,55,0.15)] rounded-[4px] p-3 sm:p-4 shadow-xl overflow-hidden group cursor-pointer flex flex-col justify-between"
                onClick={() => !isFailed && onOpenLightbox(photo)}
              >
                {/* Complete Image Presentation Container (Preserves full original photo without cropping or distorting) */}
                <div className="relative w-full h-[280px] sm:h-[300px] md:h-[320px] lg:h-[330px] rounded-[2px] bg-[#070C18] border border-[#2A3454] flex items-center justify-center p-2 overflow-hidden">
                  {isFailed ? (
                    <div className="w-full h-full flex items-center justify-center text-xs font-montserrat text-[#94A3B8] uppercase tracking-wider">
                      Photo Coming Soon
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const img = getResponsiveImageDetails(photo.src, 480);
                        return (
                          <img
                            src={img.src}
                            srcSet={img.srcSet}
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            width={img.width || 1448}
                            height={img.height || 1086}
                            alt={photo.alt}
                            onError={() =>
                              setFailedImages((prev) => new Set(prev).add(photo.id))
                            }
                            className="max-w-full max-h-full w-auto h-auto object-contain mx-auto my-auto block transition-opacity duration-300"
                            loading="lazy"
                            decoding="async"
                          />
                        );
                      })()}

                      {/* Accurate Location Label */}
                      <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-[3px] bg-[#0B1325]/90 border border-[rgba(212,175,55,0.35)] backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                        <MapPin className="w-3 h-3 text-[#D4AF37] stroke-[2]" />
                        <span className="text-[10px] font-bold text-[#E2E8F0] tracking-wider uppercase font-montserrat">
                          {locationLabel}
                        </span>
                      </div>

                      {/* Expand Overlay Indicator */}
                      <div className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-[4px] bg-[#0B1325]/90 border border-[rgba(212,175,55,0.4)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Eye className="w-4 h-4 text-[#D4AF37] stroke-[2]" />
                      </div>
                    </>
                  )}
                </div>

                {/* Details Caption: Exact Requested Title & Description */}
                <div className="pt-3.5 pb-1 flex flex-col justify-between font-montserrat">
                  <h3 className="text-sm sm:text-base font-bold text-[#FFFFFF] group-hover:text-[#D4AF37] transition-colors truncate font-cinzel">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-[#CBD5E1] mt-1 font-light line-clamp-2">
                    {photo.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;

