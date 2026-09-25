'use client';

import KitchenKDS from '../../../src/components/catering/KitchenKDS';

export default function KitchenKDSPage() {
  return <KitchenKDS onBackToOrder={() => window.location.href = '/catering/order'} />;
}
