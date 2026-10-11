import { ShowcaseProject, ProjectPhoto } from '../types';

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'shree-sai-apartment',
    title: 'SHREE SAI APARTMENT',
    location: 'Evershine, Vasai',
    tagline: 'Residential Project in Evershine, Vasai',
    type: 'Residential Development',
    status: 'Available',
    mainImage: '/3.png',
    gallery: [
      '/3.png',
      '/5.png',
      '/6.png',
      '/7.png',
      '/8.png',
      '/9.png',
      '/10.png',
    ],
    brochureUrl: '/4.png',
    description:
      'Shree Sai Apartment is a residential development located in Evershine, Vasai. Available for Buy, Sell, and Rent inquiries directly from Shree Sai Developers.',
    highlights: [
      'Located in Evershine, Vasai',
      'Residential Apartments',
      'Convenient Access to Vasai Road Station & Local Markets',
      'Direct Consultation with Shree Sai Developers',
    ],
  },
  {
    id: 'boisar-property',
    title: 'BOISAR PROPERTY',
    location: 'Boisar',
    tagline: 'Residential Project in Boisar',
    type: 'Residential Development',
    status: 'Available',
    mainImage: '/1.png',
    gallery: ['/1.png', '/2.png'],
    description:
      'Residential development situated in Boisar. Available for Buy, Sell, and Rent inquiries directly from Shree Sai Developers.',
    highlights: [
      'Located in Boisar',
      'Residential Building',
      'Proximity to Boisar Railway Station & Industrial Corridor',
      'Direct Consultation with Shree Sai Developers',
    ],
  },
];

export const ALL_PROJECT_PHOTOS: ProjectPhoto[] = [
  {
    id: 'boisar-1',
    url: '/1.png',
    src: '/1.png',
    title: 'BOISAR PROPERTY',
    alt: 'Boisar Property - Shree Sai Developers',
    caption: 'Boisar',
    category: 'boisar',
    categoryLabel: 'Boisar Property — Boisar',
    description: 'Residential property development in Boisar by Shree Sai Developers.',
  },
  {
    id: 'boisar-2',
    url: '/2.png',
    src: '/2.png',
    title: 'BOISAR PROPERTY',
    alt: 'Boisar Property - Shree Sai Developers',
    caption: 'Boisar',
    category: 'boisar',
    categoryLabel: 'Boisar Property — Boisar',
    description: 'Residential building view in Boisar by Shree Sai Developers.',
  },
  {
    id: 'sai-3',
    url: '/3.png',
    src: '/3.png',
    title: 'SHREE SAI APARTMENT',
    alt: 'Shree Sai Apartment - Evershine, Vasai',
    caption: 'Evershine, Vasai',
    category: 'evershine_vasai',
    categoryLabel: 'Shree Sai Apartment — Evershine, Vasai',
    description: 'Main elevation of Shree Sai Apartment in Evershine, Vasai.',
  },
  {
    id: 'sai-5',
    url: '/5.png',
    src: '/5.png',
    title: 'SHREE SAI APARTMENT',
    alt: 'Shree Sai Apartment - Evershine, Vasai',
    caption: 'Evershine, Vasai',
    category: 'evershine_vasai',
    categoryLabel: 'Shree Sai Apartment — Evershine, Vasai',
    description: 'Exterior view of Shree Sai Apartment in Evershine, Vasai.',
  },
  {
    id: 'sai-6',
    url: '/6.png',
    src: '/6.png',
    title: 'SHREE SAI APARTMENT',
    alt: 'Shree Sai Apartment - Evershine, Vasai',
    caption: 'Evershine, Vasai',
    category: 'evershine_vasai',
    categoryLabel: 'Shree Sai Apartment — Evershine, Vasai',
    description: 'Building facade of Shree Sai Apartment in Evershine, Vasai.',
  },
  {
    id: 'sai-7',
    url: '/7.png',
    src: '/7.png',
    title: 'SHREE SAI APARTMENT',
    alt: 'Shree Sai Apartment - Evershine, Vasai',
    caption: 'Evershine, Vasai',
    category: 'evershine_vasai',
    categoryLabel: 'Shree Sai Apartment — Evershine, Vasai',
    description: 'Street perspective of Shree Sai Apartment in Evershine, Vasai.',
  },
  {
    id: 'sai-8',
    url: '/8.png',
    src: '/8.png',
    title: 'SHREE SAI APARTMENT',
    alt: 'Shree Sai Apartment - Evershine, Vasai',
    caption: 'Evershine, Vasai',
    category: 'evershine_vasai',
    categoryLabel: 'Shree Sai Apartment — Evershine, Vasai',
    description: 'Architectural view of Shree Sai Apartment in Evershine, Vasai.',
  },
  {
    id: 'sai-9',
    url: '/9.png',
    src: '/9.png',
    title: 'SHREE SAI APARTMENT',
    alt: 'Shree Sai Apartment - Evershine, Vasai',
    caption: 'Evershine, Vasai',
    category: 'evershine_vasai',
    categoryLabel: 'Shree Sai Apartment — Evershine, Vasai',
    description: 'Structural profile of Shree Sai Apartment in Evershine, Vasai.',
  },
  {
    id: 'sai-10',
    url: '/10.png',
    src: '/10.png',
    title: 'SHREE SAI APARTMENT',
    alt: 'Shree Sai Apartment - Evershine, Vasai',
    caption: 'Evershine, Vasai',
    category: 'evershine_vasai',
    categoryLabel: 'Shree Sai Apartment — Evershine, Vasai',
    description: 'Balcony and framing view of Shree Sai Apartment in Evershine, Vasai.',
  },
];

export const OFFICIAL_BROCHURE: ProjectPhoto = {
  id: 'sai-brochure',
  url: '/4.png',
  src: '/4.png',
  title: 'Official Project Brochure — Shree Sai Apartment',
  alt: 'Official Project Brochure — Shree Sai Apartment, Evershine, Vasai',
  caption: 'Evershine, Vasai',
  category: 'evershine_vasai',
  categoryLabel: 'Shree Sai Apartment — Evershine, Vasai',
  description: 'Official verified brochure for Shree Sai Apartment, Evershine, Vasai.',
};

export const GALLERY_PHOTOS: ProjectPhoto[] = ALL_PROJECT_PHOTOS;

export const PREFERRED_LOCATIONS: string[] = [
  'Vasai',
  'Evershine, Vasai',
  'Boisar',
  'Virar',
  'Nalasopara',
  'Palghar',
  'Mumbai & MMR',
  'Other Location',
];

export const FAQ_ITEMS = [
  {
    question: 'Where are Shree Sai Developers projects located?',
    answer:
      'Our primary residential projects are located in Evershine, Vasai and Boisar, serving clients across Mumbai and the Mumbai Metropolitan Region (MMR).',
  },
  {
    question: 'What services do Shree Sai Developers offer?',
    answer:
      'We offer property solutions across Buy, Sell, and Rent for residential developments in Vasai, Boisar, and across MMR.',
  },
  {
    question: 'How can I schedule a site visit?',
    answer:
      'You can schedule a site visit by contacting us by phone at +91 98674 78525, messaging on WhatsApp, or submitting the contact form on this website.',
  },
  {
    question: 'How can I reach your office?',
    answer:
      'You can contact our team directly at +91 98674 78525 or email us at shreesaideveloper.in@gmail.com.',
  },
];

export const BUSINESS_INFO = {
  name: 'Shree Sai Developers',
  phone: '+91 98674 78525',
  phoneDisplay: '+91 98674 78525',
  whatsappRaw: '919867478525',
  callUrl: 'tel:+919867478525',
  whatsappUrl: 'https://wa.me/919867478525',
  email: 'shreesaideveloper.in@gmail.com',
  address: 'Evershine, Vasai · Boisar · Mumbai & MMR',
};

export function generateProjectWhatsAppUrl(projectName: string, location?: string): string {
  const text = `Hi Shree Sai Developers, I would like to inquire about ${projectName}${location ? ` located in ${location}` : ''}. Please share more details and availability.`;
  return `https://wa.me/919867478525?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppUrl(type?: 'SAI_APARTMENT' | 'BOISAR_PROPERTY' | string): string {
  let text = 'Hi Shree Sai Developers, I would like to enquire about your properties.';
  if (type === 'SAI_APARTMENT') {
    text = 'Hi Shree Sai Developers, I am interested in Shree Sai Apartment, Evershine, Vasai. Please share more details and availability.';
  } else if (type === 'BOISAR_PROPERTY') {
    text = 'Hi Shree Sai Developers, I am interested in your Boisar Property. Please share more details and availability.';
  } else if (type) {
    text = `Hi Shree Sai Developers, I am interested in ${type}. Please share details.`;
  }
  return `https://wa.me/919867478525?text=${encodeURIComponent(text)}`;
}

