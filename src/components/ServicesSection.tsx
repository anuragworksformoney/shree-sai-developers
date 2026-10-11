import React from 'react';
import { Home, Key, ArrowRight, HandCoins } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (type: 'buy' | 'sell' | 'rent') => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const services = [
    {
      type: 'buy' as const,
      title: 'BUY',
      subtitle: 'Residential Properties',
      icon: Home,
      description:
        'Explore residential developments in Evershine, Vasai and Boisar. Connect directly with Shree Sai Developers for purchasing opportunities across Mumbai & MMR.',
    },
    {
      type: 'sell' as const,
      title: 'SELL',
      subtitle: 'Property Sales & Marketing',
      icon: Key,
      description:
        'Assisting property owners in marketing and selling residential properties across Mumbai and MMR with clear documentation and direct handling.',
    },
    {
      type: 'rent' as const,
      title: 'RENT',
      subtitle: 'Rental & Heavy Deposit',
      icon: HandCoins,
      description:
        'Residential leasing and heavy deposit arrangements in Vasai and Boisar for individuals and families seeking quality accommodation.',
    },
  ];

  return (
    <section id="services" className="py-20 bg-[#070C18] text-[#E2E8F0] font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
            Services
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#FFFFFF] font-cinzel">
            BUY &bull; SELL &bull; RENT
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            Comprehensive property solutions across Mumbai &amp; MMR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.type}
                className="bg-[#1C2541] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.4)] p-6 sm:p-8 rounded-[4px] flex flex-col justify-between shadow-lg transition-colors"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-[3px] bg-[#0B1325] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#FFFFFF] font-cinzel">
                      {srv.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#D4AF37] mt-0.5 uppercase tracking-wider">
                      {srv.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => onSelectService(srv.type)}
                    className="w-full py-2.5 px-4 bg-[#0B1325] hover:bg-[#D4AF37] hover:text-[#0C2340] text-[#D4AF37] border border-[#D4AF37] rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Inquire for {srv.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default ServicesSection;
