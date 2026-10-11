import React from 'react';
import { Train, Navigation, Building, GraduationCap } from 'lucide-react';

export const ConnectivitySection: React.FC = () => {
  const connectivityHighlights = [
    {
      icon: Train,
      title: 'Western Railway Link',
      desc: 'Regular train services connecting Vasai Road & Boisar stations to Mumbai suburban railway hubs.',
    },
    {
      icon: Navigation,
      title: 'Road Access',
      desc: 'Convenient road links to Western Express Highway (NH-48) and regional arterial roads.',
    },
    {
      icon: Building,
      title: 'Local Markets & Shopping',
      desc: 'Markets, supermarkets, financial services, and daily essentials within easy reach.',
    },
    {
      icon: GraduationCap,
      title: 'Schools & Colleges',
      desc: 'Educational institutions, schools, and medical facilities located in surrounding neighborhoods.',
    },
  ];

  return (
    <section className="py-20 bg-[#0B1325] text-[#E2E8F0] font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
            Location &amp; Access
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#FFFFFF] font-cinzel">
            Connectivity
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            Properties in Evershine, Vasai and Boisar with established commuter links.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {connectivityHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#141C33] border border-[#2A3454] p-5 rounded-[4px] space-y-3 hover:border-[#D4AF37]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-[3px] bg-[#0B1325] border border-[#2A3454] flex items-center justify-center text-[#D4AF37]">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <h3 className="text-sm font-bold text-[#FFFFFF] font-cinzel">{item.title}</h3>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default ConnectivitySection;
