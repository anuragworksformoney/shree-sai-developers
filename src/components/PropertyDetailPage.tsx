import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  ArrowLeft,
  CalendarCheck,
  Send,
  Loader2,
  Share2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ManagedProperty, PropertyPhotoItem, ProjectPhoto } from '../types';
import { fetchPropertyById } from '../services/propertyService';
import { BUSINESS_INFO } from '../data/propertyData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getResponsiveImageDetails } from '../utils/imageUtils';

interface PropertyDetailPageProps {
  propertyId: string;
  onBack: () => void;
  onOpenLightbox: (photo: ProjectPhoto) => void;
  onEnquire: (property: { name: string; location: string; listingType: string }) => void;
  onBookSiteVisit: (property: { name: string; location: string }) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  propertyId,
  onBack,
  onOpenLightbox,
  onEnquire,
  onBookSiteVisit,
}) => {
  const [property, setProperty] = useState<ManagedProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPropertyById(propertyId)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setProperty(data);
          setActivePhotoIndex(0);
        } else {
          setError('The requested property could not be found or is currently unavailable.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading property details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1325] text-[#E2E8F0] flex items-center justify-center py-20 px-4 font-montserrat">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto stroke-[2]" />
          <p className="text-sm text-[#CBD5E1] font-normal tracking-wide">Loading property specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#0B1325] text-[#E2E8F0] flex items-center justify-center py-20 px-4 font-montserrat">
        <div className="max-w-md w-full text-center space-y-5 card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-8 rounded-[4px] shadow-2xl">
          <h2 className="text-xl font-bold text-[#FFFFFF] font-cinzel">
            Property Not Found
          </h2>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            {error || 'This listing may have been moved, sold, or is temporarily unlisted.'}
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Return to Properties</span>
          </button>
        </div>
      </div>
    );
  }

  const allPhotos: PropertyPhotoItem[] = property.images && property.images.length > 0
    ? property.images
    : [{ id: property.id, url: property.coverImage || '/3.png', title: property.name }];

  const currentPhoto = allPhotos[activePhotoIndex] || allPhotos[0];

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

  const handlePhotoClick = (item: PropertyPhotoItem) => {
    onOpenLightbox({
      id: item.id || property.id,
      url: item.url,
      src: item.url,
      title: item.title || property.name,
      category: property.id === 'boisar-property' ? 'boisar' : 'evershine_vasai',
      categoryLabel: `${property.name} — ${property.location}`,
      alt: item.title || property.name,
      description: `Location: ${property.location}`,
    });
  };

  // WhatsApp prefilled message
  const waMessage = `Hi Shree Sai Developers, I am interested in ${property.name}, located in ${property.location}. Please share more details and availability (Buy / Rent / Heavy Deposit).`;
  const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent(waMessage)}`;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${property.name} — Shree Sai Developers`,
          text: `Explore ${property.name} in ${property.location} by Shree Sai Developers.`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Status Styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Sold':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'Rented':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1325] text-[#E2E8F0] selection:bg-[#D4AF37]/30 font-montserrat">
      {/* Top Header / Breadcrumb Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0F1D]/95 backdrop-blur-md border-b border-[rgba(212,175,55,0.15)] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs text-[#E2E8F0] hover:text-[#D4AF37] transition-colors cursor-pointer py-1.5 font-bold uppercase tracking-wider"
            aria-label="Back to all properties"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span className="hidden sm:inline">Back to Properties</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C2541] hover:bg-[#2A3454] border border-[rgba(212,175,55,0.2)] text-[#E2E8F0] hover:text-[#D4AF37] rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
              title="Share listing"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] font-bold">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 stroke-[2]" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <a
              href={BUSINESS_INFO.callUrl}
              className="py-2 px-4 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            >
              <Phone className="w-3.5 h-3.5 stroke-[2] text-[#0C2340]" />
              <span>Call Desk</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Gallery & Description (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Metadata */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {property.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider uppercase bg-[#1C2541] text-[#D4AF37] border border-[rgba(212,175,55,0.4)]">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    Featured Project
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider uppercase bg-[#1C2541] text-[#D4AF37] border border-[rgba(212,175,55,0.4)]">
                  Available for Enquiry
                </span>
                <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wider uppercase bg-[#0B1325] text-[#CBD5E1] border border-[#2A3454]">
                  Status: Available
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#D4AF37] tracking-tight font-cinzel">
                {property.name}
              </h1>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#CBD5E1] font-semibold">
                <MapPin className="w-3.5 h-3.5 shrink-0 stroke-[2] text-[#D4AF37]" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Gallery Main Photo */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-[4px] overflow-hidden bg-[#0A0F1D] border border-[#2A3454] group shadow-xl">
                {(() => {
                  const img = getResponsiveImageDetails(currentPhoto.url, 1200);
                  return (
                    <img
                      src={img.src}
                      srcSet={img.srcSet}
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      width={img.width || 1448}
                      height={img.height || 1086}
                      alt={currentPhoto.title || property.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
                      onClick={() => handlePhotoClick(currentPhoto)}
                      decoding="async"
                    />
                  );
                })()}

                {/* Left/Right Photo Controls */}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-[4px] bg-[#0B1325]/90 text-[#E2E8F0] hover:text-[#D4AF37] transition-colors border border-[#2A3454] cursor-pointer shadow-md"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2]" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-[4px] bg-[#0B1325]/90 text-[#E2E8F0] hover:text-[#D4AF37] transition-colors border border-[#2A3454] cursor-pointer shadow-md"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2]" />
                    </button>
                  </>
                )}

                {/* Photo Badge & Caption */}
                <div className="absolute bottom-3 left-3 bg-[#0B1325]/90 text-white px-3 py-1 rounded-[4px] text-xs font-bold tracking-wide border border-[#2A3454] shadow-md font-cinzel">
                  {currentPhoto.title || property.name}
                </div>

                <div className="absolute bottom-3 right-3 bg-[#0B1325]/95 text-[#D4AF37] border border-[rgba(212,175,55,0.4)] px-2.5 py-1 rounded-[4px] text-xs font-bold tracking-wide shadow-md">
                  {activePhotoIndex + 1} / {allPhotos.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {allPhotos.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {allPhotos.map((photo, idx) => {
                    const thumbImg = getResponsiveImageDetails(photo.url, 480);
                    return (
                      <button
                        key={photo.id || idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-[4px] overflow-hidden shrink-0 border transition-all cursor-pointer ${
                          activePhotoIndex === idx
                            ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]'
                            : 'border-[#2A3454] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={thumbImg.src}
                          alt={photo.title || `Photo ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width={100}
                          height={64}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description Section */}
            {property.description && (
              <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-6 sm:p-8 rounded-[4px] space-y-3 shadow-2xl">
                <h3 className="text-xl font-bold text-[#D4AF37] tracking-tight font-cinzel">
                  Property Overview &amp; Specifications
                </h3>
                <div className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line font-normal">
                  {property.description}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions & Enquiry Panel (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Enquiry Card */}
              <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-6 rounded-[4px] space-y-5 shadow-2xl">
                <div className="border-b border-[#2A3454] pb-4">
                  <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-bold block">
                    Direct Advisory
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1 font-cinzel">
                    Enquire About This Property
                  </h3>
                  <p className="text-xs text-[#CBD5E1] mt-1 font-normal">
                    Direct representation by Shree Sai Developers. Verified development details with zero broker obligations.
                  </p>
                </div>

                {/* Quick Property Summary Pill */}
                <div className="bg-[#0B1325] p-4 rounded-[4px] border border-[#2A3454] space-y-2 text-xs">
                  <div className="flex justify-between items-center py-0.5 border-b border-[#2A3454]/40">
                    <span className="text-[#94A3B8]">Property:</span>
                    <span className="text-[#FFFFFF] font-bold">{property.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#2A3454]/40">
                    <span className="text-[#94A3B8]">Location:</span>
                    <span className="text-[#D4AF37] font-bold">{property.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-[#2A3454]/40">
                    <span className="text-[#94A3B8]">Availability:</span>
                    <span className="text-[#E2E8F0] font-semibold">Buy / Rent / Heavy Deposit</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#94A3B8]">Status:</span>
                    <span className="text-[#E2E8F0] font-semibold">Available</span>
                  </div>
                </div>

                {/* Primary Action: Enquire About This Property */}
                <button
                  type="button"
                  onClick={() =>
                    onEnquire({
                      name: property.name,
                      location: property.location,
                      listingType: 'Buy / Rent / Heavy Deposit',
                    })
                  }
                  className="w-full py-3 px-4 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Send className="w-4 h-4 stroke-[2] text-[#0C2340]" />
                  <span>Enquire About This Property</span>
                </button>

                {/* Secondary Action: WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-[4px] border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0C2340] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all group"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-[#D4AF37] group-hover:fill-[#0C2340]" />
                  <span>Connect on WhatsApp</span>
                </a>

                {/* Tertiary Action: Book a Site Visit */}
                <button
                  type="button"
                  onClick={() =>
                    onBookSiteVisit({
                      name: property.name,
                      location: property.location,
                    })
                  }
                  className="w-full py-3 px-4 rounded-[4px] border border-[#2A3454] text-[#E2E8F0] hover:border-[#D4AF37] hover:text-[#D4AF37] bg-[#0B1325] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <CalendarCheck className="w-4 h-4 text-[#D4AF37] stroke-[2]" />
                  <span>Book a Site Visit</span>
                </button>

                {/* Direct Phone Assistance */}
                <div className="pt-2 text-center border-t border-[#2A3454]">
                  <p className="text-[11px] text-[#94A3B8]">Speak with our property representative</p>
                  <a
                    href={BUSINESS_INFO.callUrl}
                    className="inline-block mt-1 text-sm font-bold text-[#D4AF37] hover:text-[#e5c158] tracking-wider"
                  >
                    {BUSINESS_INFO.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetailPage;

