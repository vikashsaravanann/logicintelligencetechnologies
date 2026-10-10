import { notFound } from 'next/navigation';

// The VoiceShield ROI Calculator has been retired along with VoiceShield.
// This route returns 410 Gone.
export default function ROICalculatorRetired() {
  notFound();
}
