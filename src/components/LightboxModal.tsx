import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ProjectPhoto } from '../types';
import { ALL_PROJECT_PHOTOS, OFFICIAL_BROCHURE } from '../data/propertyData';
import { getResponsiveImageDetails } from '../utils/imageUtils';

interface LightboxModalProps {
  currentPhoto: ProjectPhoto | null;
  onClose: () => void;
  onSelectPhoto?: (photo: ProjectPhoto) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  currentPhoto,
  onClose,
  onSelectPhoto,
}) => {
  const allPhotos: ProjectPhoto[] = [...ALL_PROJECT_PHOTOS, OFFICIAL_BROCHURE];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        navigatePhotos(-1);
      } else if (e.key === 'ArrowRight') {
        navigatePhotos(1);
      }
    };

    if (currentPhoto) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPhoto, onClose]);

  if (!currentPhoto) return null;

  const currentIndex = allPhotos.findIndex((p) => p.id === currentPhoto.id);

  const navigatePhotos = (step: number) => {
    let nextIndex = currentIndex + step;
    if (nextIndex < 0) nextIndex = allPhotos.length - 1;
    if (nextIndex >= allPhotos.length) nextIndex = 0;
    if (onSelectPhoto) {
      onSelectPhoto(allPhotos[nextIndex]);
    }
  };

  return (
    <div
      id="lightbox-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1325]/95 backdrop-blur-md animate-in fade-in duration-200 font-montserrat"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Controls Bar */}
      <div
        className="absolute top-0 left-0 right-0 p-3.5 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-[#0B1325] via-[#0B1325]/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="px-2.5 sm:px-3 py-1 rounded-[4px] bg-[#1C2541] text-[#D4AF37] border border-[rgba(212,175,55,0.3)] text-[11px] sm:text-xs font-bold tracking-wide shrink-0">
            {currentIndex + 1} / {allPhotos.length}
          </span>
          <div className="min-w-0">
            <h4 className="text-[#FFFFFF] text-xs sm:text-base font-bold tracking-tight truncate max-w-[160px] sm:max-w-none font-cinzel">
              {currentPhoto.title}
            </h4>
            <p className="text-[#CBD5E1] text-[10px] sm:text-xs truncate max-w-[160px] sm:max-w-none">
              {currentPhoto.categoryLabel || currentPhoto.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={currentPhoto.src || currentPhoto.url || '#'}
            download={`${currentPhoto.id || 'photo'}.png`}
            className="p-2 sm:p-2.5 rounded-[4px] bg-[#1C2541] hover:bg-[#D4AF37] text-[#E2E8F0] hover:text-[#0C2340] border border-[rgba(212,175,55,0.2)] transition-colors"
            title="Download full resolution photo"
          >
            <Download className="w-4 h-4 stroke-[2]" />
          </a>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-[4px] bg-[#1C2541] hover:bg-[#D4AF37] text-[#E2E8F0] hover:text-[#0C2340] border border-[rgba(212,175,55,0.2)] transition-colors cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-6xl max-h-[75vh] sm:max-h-[80vh] mx-auto p-2 sm:p-4 flex items-center justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {(() => {
          const img = getResponsiveImageDetails(currentPhoto.src || currentPhoto.url || '', 'full');
          return (
            <img
              src={img.src}
              srcSet={img.srcSet}
              sizes="(min-width: 1200px) 1152px, 100vw"
              width={img.width}
              height={img.height}
              alt={currentPhoto.alt}
              referrerPolicy="no-referrer"
              className="max-h-[65vh] sm:max-h-[75vh] max-w-full object-contain rounded-[4px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border border-[rgba(212,175,55,0.2)]"
              decoding="async"
            />
          );
        })()}

        {/* Previous Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigatePhotos(-1);
          }}
          className="absolute left-1 sm:left-4 p-2 sm:p-3 rounded-[4px] bg-[#0B1325]/85 hover:bg-[#D4AF37] text-[#E2E8F0] hover:text-[#0C2340] transition-all border border-[rgba(212,175,55,0.3)] cursor-pointer shadow-md"
          aria-label="Previous photograph"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
        </button>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigatePhotos(1);
          }}
          className="absolute right-1 sm:right-4 p-2 sm:p-3 rounded-[4px] bg-[#0B1325]/85 hover:bg-[#D4AF37] text-[#E2E8F0] hover:text-[#0C2340] transition-all border border-[rgba(212,175,55,0.3)] cursor-pointer shadow-md"
          aria-label="Next photograph"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div
        className="hidden sm:flex absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0B1325] to-transparent justify-center gap-2 overflow-x-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {allPhotos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => onSelectPhoto(photo)}
            className={`w-14 h-10 rounded-[3px] overflow-hidden shrink-0 border transition-all cursor-pointer ${
              currentIndex === idx
                ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] scale-105'
                : 'border-[rgba(212,175,55,0.2)] opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={photo.src || photo.url}
              alt={photo.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default LightboxModal;

