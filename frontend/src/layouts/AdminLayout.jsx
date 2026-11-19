import { BarChart3, Building2, FileQuestion, LayoutDashboard, ListChecks, Settings, Users } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { paths } from '../utils/paths';

const navigation = [
  {
    items: [
      { to: paths.admin, label: 'Overview', icon: LayoutDashboard, end: true },
      { to: paths.adminUsers, label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Interview content',
    items: [
      { to: paths.adminCompanies, label: 'Companies', icon: Building2 },
      { to: paths.adminPatterns, label: 'Interview patterns', icon: ListChecks },
      { to: paths.adminQuestions, label: 'Questions', icon: FileQuestion },
    ],
  },
  {
    label: 'Insights',
    items: [{ to: paths.adminStatistics, label: 'Statistics', icon: BarChart3 }],
  },
  { label: 'Account', items: [{ to: paths.settings, label: 'Settings', icon: Settings }] },
];

export function AdminLayout() {
  return <AppShell navigation={navigation} homePath={paths.admin} badge="Admin" />;
}
