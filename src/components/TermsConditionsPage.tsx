import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface TermsConditionsPageProps {
  onBackToHome: () => void;
  onOpenPrivacy: () => void;
}

export const TermsConditionsPage: React.FC<TermsConditionsPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-[#0B1325] text-[#E2E8F0] selection:bg-[#D4AF37]/30 font-montserrat flex flex-col">
      <Header onNavigate={() => onBackToHome()} onOpenRequirementModal={() => onBackToHome()} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8 w-full">
        <div>
          <button
            onClick={onBackToHome}
            className="px-3.5 py-1.5 bg-[#1C2541] hover:bg-[#D4AF37] hover:text-[#0C2340] border border-[rgba(212,175,55,0.3)] text-[#CBD5E1] rounded-[4px] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
        </div>

        <div className="bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-6 sm:p-10 rounded-[4px] shadow-2xl space-y-6">
          <div className="flex items-center gap-3 text-[#D4AF37]">
            <FileText className="w-6 h-6" />
            <h1 className="text-2xl sm:text-3xl font-bold font-cinzel text-white">Terms &amp; Conditions</h1>
          </div>
          <p className="text-xs text-[#94A3B8]">Last Updated: January 2026</p>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              Welcome to the official digital platform of SHREE SAI DEVELOPERS. By accessing or using this website, you agree to comply with and be bound by the following terms.
            </p>
            <h2 className="text-base font-bold text-white font-cinzel pt-2">Property Information &amp; Disclaimers</h2>
            <p>
              Project specifications, photographic renderings, floor layouts, and dimensions presented on this website are for informational purposes. Final terms, dimensions, and specifications are governed strictly by the executed registered agreements and approved municipal plans.
            </p>
            <h2 className="text-base font-bold text-white font-cinzel pt-2">Zero Brokerage</h2>
            <p>
              Direct transactions facilitated through this platform are free of third-party brokerage fees when dealing with Shree Sai Developers directly.
            </p>
          </div>
        </div>
      </main>

      <Footer onNavigate={() => onBackToHome()} onOpenRequirementModal={() => onBackToHome()} />
    </div>
  );
};
export default TermsConditionsPage;
