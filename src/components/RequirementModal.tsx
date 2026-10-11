import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitEnquiry } from '../services/enquiryService';
import { validatePhone, validateName } from '../utils/validation';
import { WhatsAppIcon } from './WhatsAppIcon';

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'buy' | 'sell' | 'rent';
  initialLocation?: string;
  initialPropertyInterest?: string;
}

export const RequirementModal: React.FC<RequirementModalProps> = ({
  isOpen,
  onClose,
  initialType = 'buy',
  initialLocation = 'Evershine, Vasai',
  initialPropertyInterest = '',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState<string>(initialType.toUpperCase());
  const [location, setLocation] = useState(initialLocation);
  const [message, setMessage] = useState(initialPropertyInterest ? `Interest in ${initialPropertyInterest}` : '');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setServiceType(initialType.toUpperCase());
      setLocation(initialLocation || 'Evershine, Vasai');
      setMessage(initialPropertyInterest ? `Interest in ${initialPropertyInterest}` : '');
      setStatus(null);
    }
  }, [isOpen, initialType, initialLocation, initialPropertyInterest]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!validateName(name)) {
      setStatus({ type: 'error', message: 'Please enter a valid full name.' });
      return;
    }

    if (!validatePhone(phone)) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-digit Indian mobile number.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitEnquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        serviceType,
        location,
        message: message.trim(),
        propertyInterest: initialPropertyInterest || undefined,
      });

      if (res.success) {
        setStatus({
          type: 'success',
          message: 'Your requirement has been transmitted directly to our builder desk. We will connect shortly.',
        });
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setStatus({ type: 'error', message: res.message || 'Submission failed.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network connection issue.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-lg w-full bg-[#1C2541] border border-[rgba(212,175,55,0.3)] rounded-[4px] p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
            Official Consultation
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] font-cinzel mt-1">
            {serviceType === 'BUY' ? 'Buy Property' : serviceType === 'SELL' ? 'Sell Property' : 'Rent / Lease'}
          </h3>
          <p className="text-xs text-[#CBD5E1] mt-0.5">
            Connect directly with Shree Sai Developers. Verified listings &bull; Zero brokerage.
          </p>
        </div>

        {status && (
          <div
            className={`p-3 rounded-[4px] text-xs flex items-start gap-2 ${
              status.type === 'success'
                ? 'bg-[#141C33] border border-[#D4AF37] text-white'
                : 'bg-rose-950/70 border border-rose-500 text-rose-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Ramesh Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
              >
                <option value="Evershine, Vasai">Evershine, Vasai</option>
                <option value="Boisar">Boisar</option>
                <option value="Mumbai & MMR">Other MMR Location</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">
                Service
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
              >
                <option value="BUY">Buy Property</option>
                <option value="SELL">Sell Property</option>
                <option value="RENT">Rent / Lease</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">
              Specific Requirement / Note
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Budget, configuration (1BHK/2BHK), preferred possession timeline..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Requirement</span>
              </>
            )}
          </button>

          <div className="pt-2 border-t border-[#2A3454]/60 text-center">
            <a
              href="https://wa.me/919867478525?text=Hello%20Shree%20Sai%20Developers%2C%20I%20have%20an%20enquiry%20regarding%20property%20opportunities."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-[#25D366] hover:text-[#20ba59] font-semibold transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] shrink-0" />
              <span>Or connect directly on WhatsApp (+91 98674 78525)</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RequirementModal;
