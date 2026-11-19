import { FileText, House, History, LayoutDashboard, PlayCircle, Settings } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { paths } from '../utils/paths';

const navigation = [
  {
    items: [
      { to: paths.start, label: 'Home', icon: House },
      { to: paths.dashboard, label: 'Dashboard', icon: LayoutDashboard },
      { to: paths.resume, label: 'Resume', icon: FileText },
      { to: paths.newInterview, label: 'New interview', icon: PlayCircle },
      { to: paths.interviewHistory, label: 'History', icon: History, end: true },
    ],
  },
  { label: 'Account', items: [{ to: paths.settings, label: 'Settings', icon: Settings }] },
];

export function CandidateLayout() {
  return <AppShell navigation={navigation} homePath={paths.start} />;
}
