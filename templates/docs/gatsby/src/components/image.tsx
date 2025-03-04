import React from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Simple fallback image component that doesn't rely on allImageSharp
const Image = ({ src, alt, className }: ImageProps) => {
  return <img src={src} alt={alt} className={className} />;
};

export default Image;
