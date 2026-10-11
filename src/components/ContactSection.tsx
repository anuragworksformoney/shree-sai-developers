import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitEnquiry } from '../services/enquiryService';
import { validatePhone, validateName } from '../utils/validation';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BUSINESS_INFO } from '../data/propertyData';

interface ContactSectionProps {
  initialSubject?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ initialSubject = '' }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState('Buy');
  const [location, setLocation] = useState('Evershine, Vasai');
  const [message, setMessage] = useState(initialSubject ? `Inquiring about ${initialSubject}` : '');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!validateName(name)) {
      setStatus({ type: 'error', message: 'Please enter your full name.' });
      return;
    }

    if (!validatePhone(phone)) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-digit mobile number.' });
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
        propertyInterest: initialSubject || undefined,
      });

      if (res.success) {
        setStatus({
          type: 'success',
          message: 'Thank you! Your inquiry has been submitted. We will contact you soon.',
        });
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        setStatus({
          type: 'error',
          message: res.message || 'Failed to submit inquiry. Please call us directly.',
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Network issue. Please connect with us directly via phone or WhatsApp.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#070C18] text-[#E2E8F0] font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
            Contact
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#FFFFFF] font-cinzel">
            Get in Touch
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            Contact Shree Sai Developers directly for property inquiries, site visits, or consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-6 sm:p-8 rounded-[4px] space-y-6 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-[#FFFFFF] font-cinzel">SHREE SAI DEVELOPERS</h3>
                <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider mt-0.5">
                  BUILDERS &amp; DEVELOPERS
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#CBD5E1]">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Phone:</p>
                    <p className="mt-0.5">
                      <a href="tel:+919867478525" className="hover:text-[#D4AF37] transition-colors">
                        +91 98674 78525
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Email:</p>
                    <p className="mt-0.5">
                      <a href="mailto:shreesaideveloper.in@gmail.com" className="hover:text-[#D4AF37] transition-colors">
                        shreesaideveloper.in@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Service Area:</p>
                    <p className="text-[#94A3B8] mt-0.5">
                      Evershine, Vasai &bull; Boisar &bull; Mumbai &amp; MMR
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={BUSINESS_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-6 sm:p-8 rounded-[4px] shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#FFFFFF] font-cinzel">Send an Inquiry</h3>
                <p className="text-xs text-[#CBD5E1] mt-0.5">
                  Fill out the form below and we will get back to you promptly.
                </p>
              </div>

              {status && (
                <div
                  className={`p-3.5 rounded-[4px] text-xs flex items-start gap-2.5 ${
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 Mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 uppercase tracking-wider">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 uppercase tracking-wider">
                      Service
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                    >
                      <option value="Buy">Buy</option>
                      <option value="Sell">Sell</option>
                      <option value="Rent">Rent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 uppercase tracking-wider">
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    <option value="Evershine, Vasai">Evershine, Vasai</option>
                    <option value="Boisar">Boisar</option>
                    <option value="Mumbai & MMR">Mumbai &amp; MMR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter your message or requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#0C2340]" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 stroke-[2]" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ContactSection;
