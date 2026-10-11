import React from 'react';
import { MapPin, Home, PhoneCall, CheckCircle } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      title: 'Strategic Locations',
      description: 'Residential projects situated in accessible locations across Evershine, Vasai and Boisar.',
      icon: MapPin,
    },
    {
      title: 'Full-Service Solutions',
      description: 'End-to-end assistance across Buy, Sell, and Rent requirements in Mumbai & MMR.',
      icon: Home,
    },
    {
      title: 'Site Visits',
      description: 'Accompanied on-ground visits to inspect project locations and building layouts.',
      icon: CheckCircle,
    },
    {
      title: 'Direct Accessibility',
      description: 'Prompt communication and direct consultation with our principal team.',
      icon: PhoneCall,
    },
  ];

  return (
    <section className="py-20 bg-[#070C18] text-[#E2E8F0] font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
            Why Choose Us
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#FFFFFF] font-cinzel">
            Shree Sai Developers
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            Dedicated builder and developer services for homebuyers and property owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-6 rounded-[4px] space-y-4 hover:border-[rgba(212,175,55,0.4)] transition-colors shadow-md"
              >
                <div className="w-12 h-12 rounded-[3px] bg-[#0B1325] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FFFFFF] font-cinzel">{item.title}</h3>
                  <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default WhyChooseUs;
