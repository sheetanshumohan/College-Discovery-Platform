import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Saved Colleges — CollegeFinder',
  description:
    'Review and manage your curated shortlist of target colleges and universities.',
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
