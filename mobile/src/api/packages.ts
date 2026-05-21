import { get, post } from './client';

import type { Package, PackagePurchase } from '@/types/models';

export const packagesApi = {
  list(opts: { featured?: boolean } = {}) {
    return get<Package[]>('/packages', opts.featured ? { featured: 1 } : undefined);
  },
  show(code: string) {
    return get<Package>(`/packages/${code}`);
  },
  myPurchases() {
    return get<PackagePurchase[]>('/package-purchases');
  },
  purchase(packageId: number) {
    return post<PackagePurchase>('/package-purchases', { package_id: packageId });
  },
};
