import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../data/propertyData';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-[#0B1325] text-[#E2E8F0] font-montserrat">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2541] border border-[rgba(212,175,55,0.3)] text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Buyer &amp; Client Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#FFFFFF] font-cinzel">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            Clear, straightforward answers regarding direct purchases, documentation, and property advisory.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#1C2541] border border-[rgba(212,175,55,0.2)] rounded-[4px] overflow-hidden shadow-lg transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#FFFFFF] font-cinzel">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#D4AF37] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed border-t border-[#2A3454] pt-3 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default FAQSection;
