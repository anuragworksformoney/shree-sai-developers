export type ServiceType = 'buy' | 'sell' | 'rent';

export type PropertyType = 'Apartment / Flat' | 'Independent House / Villa' | 'Residential Plot' | 'Commercial Shop / Office' | 'Builder Floor';

export type BHKType = '1 RK' | '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK' | 'Commercial Space';

export interface ProjectPhoto {
  id?: string;
  url?: string;
  src?: string;
  title: string;
  caption?: string;
  category?: 'evershine_vasai' | 'boisar' | string;
  categoryLabel?: string;
  alt?: string;
  description?: string;
  stage?: 'Completed Elevation' | 'Entrance & Signboard' | 'Building Facade' | 'Street View' | 'Site Progress' | 'Structural Framing' | 'Foundation Stage' | string;
}

export interface ShowcaseProject {
  id: string;
  name?: string;
  title?: string;
  location: string;
  tagline: string;
  type?: string;
  status: 'Ready to Move / Completed' | 'Under Construction' | 'Collector Approved' | 'Available' | string;
  description: string;
  coverImage?: string;
  mainImage?: string;
  images?: (ProjectPhoto | string)[];
  gallery?: string[];
  brochureUrl?: string;
  highlights: string[];
  configurations?: string[];
}

export interface EnquiryData {
  name: string;
  phone: string;
  email?: string;
  service?: ServiceType | string;
  serviceType?: string;
  location?: string;
  message?: string;
  propertyInterest?: string;
  [key: string]: any;
}

export interface BuyFormData {
  name: string;
  phone: string;
  email: string;
  preferredLocation: string;
  propertyType: string;
  bhk: string;
  budget: string;
  additionalRequirements: string;
}

export interface SellFormData {
  ownerName: string;
  phone: string;
  email: string;
  propertyLocation: string;
  propertyType: string;
  bhk: string;
  approximateArea: string;
  expectedPrice: string;
  additionalDetails: string;
}

export interface RentFormData {
  name: string;
  phone: string;
  email: string;
  preferredLocation: string;
  propertyType: string;
  bhk: string;
  monthlyBudget: string;
  additionalRequirements: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  service: ServiceType;
  message: string;
}

export type ListingType = 'Buy' | 'Sell' | 'Rent' | 'Heavy Deposit' | 'Buy / Rent / Heavy Deposit';

export type PropertyStatus = 'Available' | 'Sold' | 'Rented' | 'Unavailable';

export interface PropertyPhotoItem {
  id: string;
  url: string;
  title?: string;
  isCover?: boolean;
}

export interface ManagedProperty {
  id: string;
  name: string;
  location: string;
  listingType: ListingType;
  description: string;
  coverImage: string;
  images: PropertyPhotoItem[];
  status: PropertyStatus;
  featured: boolean;
  published: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  email: string;
  role: 'admin';
}

export type ClientProjectStatus =
  | 'Planning'
  | 'In Progress'
  | 'Under Review'
  | 'On Hold'
  | 'Completed';

export interface ClientProject {
  id: string;
  clientName: string;
  projectName: string;
  projectType: string;
  startDate: string;
  expectedCompletionDate: string;
  status: ClientProjectStatus;
  url: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type FollowupStatus =
  | 'New'
  | 'In Contact'
  | 'Site Visit Scheduled'
  | 'Converted'
  | 'Closed'
  | string;

export interface FollowupRecord {
  id: string;
  name: string;
  fullName?: string;
  phone: string;
  email: string;
  requirement: string;
  location: string;
  preferredLocation?: string;
  propertyType: string;
  bhk?: string;
  budget?: string;
  message?: string;
  source?: string;
  status: FollowupStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

