import React, { useState, useEffect } from 'react';
import { SHOWCASE_PROJECTS, generateProjectWhatsAppUrl } from '../data/propertyData';
import { ShowcaseProject, ProjectPhoto, ManagedProperty } from '../types';
import { fetchPublishedProperties } from '../services/propertyService';
import { ArrowUpRight, MapPin, Eye, ChevronRight } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getResponsiveImageDetails } from '../utils/imageUtils';

interface FeaturedProjectsProps {
  onOpenLightbox: (photo: ProjectPhoto) => void;
  onOpenDetails: (project: ShowcaseProject) => void;
  onOpenManagedDetail?: (propertyId: string) => void;
  onEnquireProject?: (projectName: string, location?: string) => void;
  onViewGallery?: () => void;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
  onOpenLightbox,
  onOpenDetails,
  onOpenManagedDetail,
  onEnquireProject,
}) => {
  const [dynamicProperties, setDynamicProperties] = useState<ManagedProperty[]>([]);

  useEffect(() => {
    fetchPublishedProperties().then((props) => {
      if (Array.isArray(props) && props.length > 0) {
        setDynamicProperties(props);
      }
    });
  }, []);

  // Map dynamic property to ShowcaseProject format if needed for modal
  const handlePropertyClick = (prop: ManagedProperty) => {
    if (onOpenManagedDetail) {
      onOpenManagedDetail(prop.id);
      return;
    }

    const matchedShowcase = SHOWCASE_PROJECTS.find((p) => p.id === prop.id);
    if (matchedShowcase) {
      onOpenDetails(matchedShowcase);
      return;
    }

    // Fallback showcase structure
    const fallbackShowcase: ShowcaseProject = {
      id: prop.id,
      name: prop.name,
      location: prop.location,
      tagline: `${prop.name} — ${prop.location}`,
      status: 'Available',
      description: prop.description,
      coverImage: prop.coverImage || '/3.png',
      images: (prop.images || []).map((img, idx) => ({
        id: img.id || `${prop.id}-${idx}`,
        title: img.title || prop.name,
        category: prop.id === 'boisar-property' ? 'boisar' : 'evershine_vasai',
        categoryLabel: `${prop.name} — ${prop.location}`,
        url: img.url,
        src: img.url,
        alt: img.title || prop.name,
        description: `Location: ${prop.location}`,
      })),
      highlights: ['Direct Developer Representation', 'Available for Buy / Rent / Heavy Deposit'],
      configurations: ['Residential Space'],
    };
    onOpenDetails(fallbackShowcase);
  };

  // Filter out any unwanted dummy test entities and normalize properties
  const validDynamicProperties = dynamicProperties.filter(
    (p) => !p.id.toLowerCase().includes('integration-test')
  );

  // Render dynamic properties if loaded, otherwise fallback to SHOWCASE_PROJECTS
  const displayProperties: Array<{
    id: string;
    name: string;
    location: string;
    description: string;
    coverImage: string;
    listingType?: string;
    status?: string;
    featured?: boolean;
    photoCount: number;
    coverPhotoItem: ProjectPhoto;
    rawProp?: ManagedProperty;
    showcaseProp?: ShowcaseProject;
    indexNumber: string;
    kicker: string;
  }> =
    validDynamicProperties.length > 0
      ? validDynamicProperties.map((prop, idx) => {
          const isSai = prop.id === 'shree-sai-apartment' || (prop.name || '').toLowerCase().includes('sai');
          const matchedShowcase = SHOWCASE_PROJECTS.find((p) => p.id === prop.id);
          const projectPhotos = matchedShowcase?.images || [];

          const rawFirstPhoto = projectPhotos[0];
          const firstPhotoUrl =
            typeof rawFirstPhoto === 'string'
              ? rawFirstPhoto
              : (rawFirstPhoto?.src || rawFirstPhoto?.url);
          const coverSrc = prop.coverImage || firstPhotoUrl || '/3.png';
          const coverPhotoItem: ProjectPhoto =
            typeof rawFirstPhoto === 'object' && rawFirstPhoto !== null
              ? {
                  ...rawFirstPhoto,
                  url: rawFirstPhoto.url || rawFirstPhoto.src || coverSrc,
                  src: rawFirstPhoto.src || rawFirstPhoto.url || coverSrc,
                }
              : {
                  id: prop.id,
                  url: coverSrc,
                  src: coverSrc,
                  title: isSai ? 'Shree Sai Apartment' : prop.name,
                  category: isSai ? 'evershine_vasai' : 'boisar',
                  categoryLabel: isSai ? 'Shree Sai Apartment — Evershine, Vasai' : `${prop.name} — ${prop.location}`,
                  alt: isSai ? 'Shree Sai Apartment' : prop.name,
                  description: isSai ? 'Evershine, Vasai' : prop.location,
                };

          return {
            id: prop.id,
            name: isSai ? 'Shree Sai Apartment' : prop.name,
            location: isSai ? 'Evershine, Vasai' : prop.location,
            description: isSai
              ? 'Residential development located in Evershine, Vasai by Shree Sai Developers.'
              : prop.description || 'Residential development located in Boisar offered directly by Shree Sai Developers.',
            coverImage: coverSrc,
            listingType: prop.listingType,
            status: prop.status || 'Available',
            featured: prop.featured,
            photoCount:
              projectPhotos.length > 0
                ? projectPhotos.length
                : prop.images && prop.images.length > 0
                ? prop.images.length
                : 1,
            coverPhotoItem,
            rawProp: prop,
            showcaseProp: matchedShowcase,
            indexNumber: `0${idx + 1}`,
            kicker: isSai ? 'Flagship Development' : 'Suburban Corridor',
          };
        })
      : SHOWCASE_PROJECTS.map((project, idx) => {
          const projName = project.name || project.title || 'Shree Sai Development';
          const isSai = project.id === 'shree-sai-apartment' || projName.toLowerCase().includes('sai');
          const projectPhotos = project.images || (project.gallery ? project.gallery.map((g) => ({ url: g, src: g, title: projName })) : []);
          const rawCover = project.coverImage || project.mainImage || '/3.png';
          const firstPhoto = projectPhotos[0];
          const firstPhotoUrl = typeof firstPhoto === 'string' ? firstPhoto : (firstPhoto?.src || firstPhoto?.url);
          const coverImg = rawCover || firstPhotoUrl || '/3.png';

          const coverPhotoItem: ProjectPhoto =
            typeof firstPhoto === 'object' && firstPhoto !== null
              ? {
                  ...firstPhoto,
                  url: firstPhoto.url || firstPhoto.src || coverImg,
                  src: firstPhoto.src || firstPhoto.url || coverImg,
                }
              : {
                  id: project.id,
                  url: coverImg,
                  src: coverImg,
                  title: isSai ? 'Shree Sai Apartment' : projName,
                  category: isSai ? 'evershine_vasai' : 'boisar',
                  categoryLabel: isSai ? 'Shree Sai Apartment — Evershine, Vasai' : `${projName} — ${project.location}`,
                  alt: isSai ? 'Shree Sai Apartment' : projName,
                  description: isSai ? 'Evershine, Vasai' : project.location,
                };

          return {
            id: project.id,
            name: isSai ? 'Shree Sai Apartment' : projName,
            location: isSai ? 'Evershine, Vasai' : project.location,
            description: isSai
              ? 'Residential development located in Evershine, Vasai by Shree Sai Developers.'
              : 'Residential development located in Boisar offered directly by Shree Sai Developers.',
            coverImage: coverImg,
            photoCount: projectPhotos.length > 0 ? projectPhotos.length : 1,
            coverPhotoItem,
            showcaseProp: project,
            status: 'Available',
            indexNumber: `0${idx + 1}`,
            kicker: isSai ? 'Flagship MMR Development' : 'Suburban Growth Corridor',
          };
        });

  return (
    <section id="properties" className="py-10 sm:py-20 lg:py-24 bg-[#0B1325] text-[#E2E8F0] border-b border-[rgba(212,175,55,0.15)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-6 pb-6 sm:pb-12 border-b border-[rgba(212,175,55,0.15)] reveal-on-scroll">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 sm:w-8 h-[2px] bg-[#D4AF37]" aria-hidden="true" />
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-montserrat">
                Verified Developments
              </p>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#D4AF37] tracking-tight font-cinzel">
              Featured Properties
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-md leading-relaxed font-montserrat">
            Direct developer portfolio built with structural integrity and clear marketable titles across Mumbai and the MMR region.
          </p>
        </div>

        {/* Property Compositions: Mobile uses asymmetric full-bleed layout without standard card containers */}
        <div className="pt-6 sm:pt-14 space-y-10 sm:space-y-16">
          {displayProperties.map((project, idx) => {
            const isReversed = idx % 2 === 1;
            const isEven = idx % 2 === 0;

            const handleMainAction = () => {
              if (project.rawProp) {
                handlePropertyClick(project.rawProp);
              } else if (project.showcaseProp) {
                onOpenDetails(project.showcaseProp);
              }
            };

            const whatsappUrl = generateProjectWhatsAppUrl(project.name, project.location);

            return (
              <div
                key={project.id}
                id={`property-${project.id}`}
                className="reveal-on-scroll pb-10 sm:pb-0 border-b border-[rgba(212,175,55,0.15)] last:border-b-0 sm:border-b-0 sm:card-hw sm:card-hw-interactive sm:bg-[#1C2541] sm:border sm:border-[rgba(212,175,55,0.15)] sm:shadow-2xl sm:rounded-[4px] sm:p-6 lg:p-8"
              >
                {/* Desktop and Tablet: Refined 12-column grid layout */}
                {/* Mobile: Asymmetric full-bleed image approach without card container */}
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center ${
                    isReversed ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Property Photograph Container: Breaks out full-bleed on mobile (-mx-4) */}
                  <div
                    className={`lg:col-span-7 -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full relative overflow-hidden group cursor-pointer sm:rounded-[4px] sm:border sm:border-[#2A3454] sm:hover:border-[#D4AF37] transition-colors ${
                      isReversed ? 'lg:order-2' : 'lg:order-1'
                    }`}
                    onClick={handleMainAction}
                  >
                    {/* Image Aspect Box: High-impact 16:11 on mobile, 16:10 on desktop */}
                    <div className="aspect-[16/11] sm:aspect-[16/10] w-full overflow-hidden bg-[#0A0F1D] relative">
                      {(() => {
                        const img = getResponsiveImageDetails(project.coverImage, 800);
                        return (
                          <img
                            src={img.src}
                            srcSet={img.srcSet}
                            sizes="(min-width: 1024px) 58vw, 100vw"
                            width={img.width || 1448}
                            height={img.height || 1086}
                            alt={`${project.name} in ${project.location}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                            loading="lazy"
                            decoding="async"
                          />
                        );
                      })()}

                      {/* Asymmetric Mobile Gradient Scrims: Seamless contrast overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: isEven
                            ? 'linear-gradient(to top, rgba(11, 19, 37, 0.95) 0%, rgba(11, 19, 37, 0.4) 40%, transparent 75%)'
                            : 'linear-gradient(to top, rgba(11, 19, 37, 0.95) 0%, rgba(11, 19, 37, 0.3) 35%, transparent 70%)',
                        }}
                        aria-hidden="true"
                      />

                      {/* Asymmetric Corner Accent Badge on Photo (Mobile & Desktop) */}
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-[3px] bg-[#0B1325]/90 backdrop-blur-md border border-[rgba(212,175,55,0.4)] shadow-md flex items-center gap-1.5 font-montserrat">
                          <span className="text-[#D4AF37] font-bold text-[11px] tabular-nums tracking-wider">
                            {project.indexNumber}
                          </span>
                          <span className="text-[#CBD5E1] text-[10px] uppercase tracking-wider font-medium">
                            {project.kicker}
                          </span>
                        </div>
                      </div>

                      {/* Photo Count Affordance Trigger (High hitbox $\ge 44px$) */}
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLightbox(project.coverPhotoItem);
                          }}
                          className="min-h-[44px] px-3.5 py-2 rounded-[3px] bg-[#0B1325]/92 text-[#E2E8F0] hover:text-[#D4AF37] active:bg-[#0B1325] text-xs font-semibold tracking-wide backdrop-blur-md border border-[rgba(212,175,55,0.35)] flex items-center gap-2 cursor-pointer transition-colors shadow-lg font-montserrat"
                          aria-label={`View all ${project.photoCount} photos of ${project.name}`}
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2] text-[#D4AF37]" />
                          <span className="tabular-nums">{project.photoCount} Photos</span>
                          <span className="text-[10px] text-[#94A3B8] hidden xs:inline">· View</span>
                        </button>
                      </div>

                      {/* Bottom-Left Overlaid Quick Location Kicker (Mobile Only) */}
                      <div className="sm:hidden absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-[11px] font-semibold text-[#D4AF37] tracking-wider uppercase font-montserrat">
                        <MapPin className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                        <span className="truncate max-w-[200px]">{project.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details: On mobile, flows naturally without card boundary or decorative vertical lines */}
                  <div
                    className={`lg:col-span-5 space-y-3.5 sm:space-y-4 px-1 sm:px-0 ${
                      isReversed ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    {/* Location & Title */}
                    <div className="space-y-1">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] tracking-wider uppercase font-montserrat">
                        <MapPin className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                        <span>{project.location}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight font-cinzel text-balance leading-snug">
                        {project.name}
                      </h3>

                      {/* Unboxed Metadata Line (Zero-Pill discipline) */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#CBD5E1] font-montserrat pt-0.5">
                        <span className="text-[#D4AF37] font-semibold">{project.status || 'Available'}</span>
                        <span className="text-[#D4AF37]/50" aria-hidden="true">·</span>
                        <span className="text-[#E2E8F0]">Buy / Rent / Heavy Deposit</span>
                        <span className="text-[#D4AF37]/50" aria-hidden="true">·</span>
                        <span className="text-[#CBD5E1]">Direct Developer</span>
                      </div>
                    </div>

                    {/* Description: Tailored for legibility with zero text clipping */}
                    <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed font-montserrat">
                      {project.description}
                    </p>

                    {/* Mobile Thumb Action Area: 48px Touch Target, Full-Width Primary CTA + Quick WhatsApp */}
                    <div className="pt-2 sm:pt-4 flex flex-col xs:flex-row items-stretch gap-2.5 font-montserrat">
                      {/* Primary View Property CTA */}
                      <button
                        type="button"
                        onClick={handleMainAction}
                        className="flex-1 min-h-[48px] h-12 px-5 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] active:scale-[0.98] text-[#0C2340] font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 group whitespace-nowrap"
                      >
                        <span className="text-[#0C2340]">View Property Details</span>
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5] text-[#0C2340] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>

                      {/* WhatsApp Enquiry Direct Action */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[48px] h-12 px-4 rounded-[4px] border border-[rgba(212,175,55,0.4)] hover:border-[#D4AF37] hover:bg-[#0B1325] active:scale-[0.98] text-[#E2E8F0] hover:text-[#D4AF37] font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
                        aria-label={`Enquire about ${project.name} on WhatsApp`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-[#25D366] shrink-0" />
                        <span className="xs:hidden sm:inline">WhatsApp</span>
                        <span className="hidden xs:inline sm:hidden">Chat</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;



