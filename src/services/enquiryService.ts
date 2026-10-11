import { EnquiryData } from '../types';

export async function submitEnquiry(data: EnquiryData): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: result.message || 'Enquiry submitted successfully.' };
    }
    return {
      success: false,
      message: result.error || 'Failed to submit enquiry. Please try connecting via WhatsApp.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Network connection issue. Please connect with our team via WhatsApp directly.',
    };
  }
}
