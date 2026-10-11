import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
  onOpenTerms: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBackToHome, onOpenTerms }) => {
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
            <Shield className="w-6 h-6" />
            <h1 className="text-2xl sm:text-3xl font-bold font-cinzel text-white">Privacy Policy</h1>
          </div>
          <p className="text-xs text-[#94A3B8]">Last Updated: January 2026</p>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              SHREE SAI DEVELOPERS respects your privacy. We collect personal contact information (such as name, phone number, and email address) exclusively to respond to property inquiries, schedule site visits, and provide direct developer consultation.
            </p>
            <h2 className="text-base font-bold text-white font-cinzel pt-2">Data Collection &amp; Use</h2>
            <p>
              Information submitted via our inquiry or contact forms is processed directly by our authorized developer desk. We do not sell, rent, or trade your personal information to third-party marketing companies.
            </p>
            <h2 className="text-base font-bold text-white font-cinzel pt-2">Contact &amp; Grievance</h2>
            <p>
              If you have any questions or wish to update or delete your submitted information, contact us at: <a href="mailto:shreesaideveloper.in@gmail.com" className="text-[#D4AF37] underline">shreesaideveloper.in@gmail.com</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer onNavigate={() => onBackToHome()} onOpenRequirementModal={() => onBackToHome()} />
    </div>
  );
};
export default PrivacyPolicyPage;
