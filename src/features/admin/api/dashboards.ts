import { proxyGet } from '@/lib/api/proxy-fetch';
import type { DashboardSnapshot } from '../types';

export function getDashboard(
  key: 'overview' | 'attendance' | 'fees' | 'enrolment' | 'academics',
  campusId?: string,
): Promise<DashboardSnapshot> {
  return proxyGet(`/api/v1/reports/dashboards/${key}`, { campusId });
}
