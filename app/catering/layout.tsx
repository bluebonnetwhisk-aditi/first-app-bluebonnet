import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Desi Dabba Catering & KDS | Bluebonnet Whisk',
  description: 'Full-stack Vegetarian Catering Order Form, Real-Time Cost Estimator, and Kitchen Display System for bluebonnetwhisk.com',
};

export default function CateringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#1a1c20]">
      {children}
    </div>
  );
}
