import React, { useState, useEffect } from 'react';
import { X, MapPin, ChevronLeft, ChevronRight, Phone, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../data/propertyData';
import { ProjectPhoto, ShowcaseProject } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getResponsiveImageDetails } from '../utils/imageUtils';

interface PropertyDetailModalProps {
  project: ShowcaseProject | null;
  onClose: () => void;
  onOpenLightbox: (photo: ProjectPhoto) => void;
  onEnquire: (projectName: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  project,
  onClose,
  onOpenLightbox,
  onEnquire,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const projTitle = project.name || project.title || 'Shree Sai Property';
  const rawPhotos = project.images && project.images.length > 0 ? project.images : [];
  const currentPhotos: ProjectPhoto[] = rawPhotos.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        id: `${project.id}-${idx}`,
        url: item,
        src: item,
        title: projTitle,
        alt: projTitle,
        category: project.id === 'boisar-property' ? 'boisar' : 'evershine_vasai',
        categoryLabel: `${projTitle} — ${project.location}`,
        description: `Location: ${project.location}`,
      };
    }
    return {
      ...item,
      id: item.id || `${project.id}-${idx}`,
      url: item.url || item.src || project.coverImage || '/3.png',
      src: item.src || item.url || project.coverImage || '/3.png',
      title: item.title || projTitle,
      alt: item.alt || item.title || projTitle,
    };
  });

  const currentPhoto: ProjectPhoto = currentPhotos[selectedPhotoIndex] || {
    id: project.id,
    url: project.coverImage || '/3.png',
    src: project.coverImage || '/3.png',
    title: projTitle,
    category: project.id === 'boisar-property' ? 'boisar' : 'evershine_vasai',
    categoryLabel: `${projTitle} — ${project.location}`,
    alt: projTitle,
    description: `Location: ${project.location}`,
  };

  const isSaiApartment = project.id === 'shree-sai-apartment';
  const whatsappUrl = isSaiApartment
    ? getWhatsAppUrl('SAI_APARTMENT')
    : getWhatsAppUrl('BOISAR_PROPERTY');

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : currentPhotos.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev < currentPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      id="property-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-modal-title"
    >
      <div
        id="property-detail-modal-container"
        className="relative card-hw bg-[#1C2541] text-[#E2E8F0] w-full max-w-4xl max-h-[95vh] sm:max-h-[92vh] rounded-[4px] border border-[rgba(212,175,55,0.2)] overflow-hidden flex flex-col shadow-2xl transition-colors font-montserrat"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#2A3454] bg-[#0B1325]">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] sm:text-xs font-bold text-[#D4AF37] tracking-wider uppercase font-montserrat">
              Direct Development Details
            </span>
            <h2
              id="property-modal-title"
              className="text-base sm:text-xl font-bold text-[#FFFFFF] tracking-tight mt-0.5 truncate font-cinzel"
            >
              {projTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-[#FFFFFF] transition-colors cursor-pointer rounded-[4px] hover:bg-[#1C2541] shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Photo Showcase */}
          <div className="relative aspect-[16/10] rounded-[4px] overflow-hidden group border border-[#2A3454] bg-[#0A0F1D]">
            {(() => {
              const img = getResponsiveImageDetails(currentPhoto.src, 1200);
              return (
                <img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes="(min-width: 1024px) 896px, 100vw"
                  width={img.width}
                  height={img.height}
                  alt={currentPhoto.alt || project.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => onOpenLightbox(currentPhoto)}
                  decoding="async"
                />
              );
            })()}

            {currentPhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-[4px] bg-[#0B1325]/90 text-[#E2E8F0] hover:text-[#D4AF37] transition-colors border border-[#2A3454] cursor-pointer shadow-md"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-[4px] bg-[#0B1325]/90 text-[#E2E8F0] hover:text-[#D4AF37] transition-colors border border-[#2A3454] cursor-pointer shadow-md"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                </button>
              </>
            )}

            <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-[#0B1325]/90 text-[#FFFFFF] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-[4px] text-[11px] sm:text-xs font-bold tracking-wide border border-[#2A3454] shadow-md max-w-[200px] truncate font-cinzel">
              {currentPhoto.title}
            </div>

            <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-[#0B1325]/95 text-[#D4AF37] border border-[rgba(212,175,55,0.4)] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[4px] text-[11px] sm:text-xs font-bold tracking-wide shadow-md font-montserrat">
              {selectedPhotoIndex + 1} / {currentPhotos.length}
            </div>
          </div>

          {/* Thumbnails Strip */}
          {currentPhotos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {currentPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-16 h-11 sm:w-20 sm:h-14 rounded-[4px] overflow-hidden shrink-0 border transition-all cursor-pointer ${
                    selectedPhotoIndex === idx
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]'
                      : 'border-[#2A3454] opacity-70 hover:opacity-100'
                  }`}
                >
                  {(() => {
                    const thumbImg = getResponsiveImageDetails(photo.src, 480);
                    return (
                      <img
                        src={thumbImg.src}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width={80}
                        height={56}
                      />
                    );
                  })()}
                </button>
              ))}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 bg-[#0B1325] p-4 sm:p-5 rounded-[4px] border border-[#2A3454]">
            <div>
              <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-montserrat">
                Location
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#FFFFFF] mt-1.5 flex items-center gap-1.5 font-montserrat">
                <MapPin className="w-4 h-4 text-[#D4AF37] stroke-[2] shrink-0" />
                <span>{project.location}</span>
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-montserrat">
                Availability
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#E2E8F0] mt-1.5 font-montserrat">
                Buy / Rent / Heavy Deposit
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-montserrat">
                Status
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#FFFFFF] mt-1.5 flex items-center gap-1.5 font-montserrat">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] stroke-[2] shrink-0" />
                <span>Available</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5 font-montserrat">
              Project Overview
            </p>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed font-normal font-montserrat">
              {project.description}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-3.5 sm:px-6 sm:py-4 bg-[#0B1325] border-t border-[#2A3454] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 font-montserrat">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5">
            <a
              href={BUSINESS_INFO.callUrl}
              className="px-4 py-2.5 rounded-[4px] border border-[rgba(212,175,55,0.3)] text-[#E2E8F0] hover:text-[#D4AF37] text-xs font-bold uppercase tracking-wider justify-center flex items-center gap-1.5 shadow-sm bg-[#1C2541]"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4AF37] stroke-[2]" />
              <span>Call Desk</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="justify-center px-4 py-2.5 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 shrink-0 fill-[#0C2340]" />
              <span>WhatsApp</span>
            </a>
          </div>

          <button
            onClick={() => {
              onClose();
              onEnquire(projTitle);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider text-center justify-center shadow-md cursor-pointer transition-all"
          >
            <span>Enquire for {projTitle}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;

