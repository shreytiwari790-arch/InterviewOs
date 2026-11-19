import { LottieSvg } from 'lottie-react';
import animationData from '../../assets/animations/interview.json';

// Loaded lazily by AuthLayout so the animation engine stays out of the main bundle.
export default function InterviewAnimation({ className }) {
  return <LottieSvg src={animationData} autoplay loop className={className} aria-hidden="true" />;
}
