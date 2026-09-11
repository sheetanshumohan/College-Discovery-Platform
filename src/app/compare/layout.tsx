import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Colleges Side-by-Side — CollegeFinder',
  description:
    'Evaluate tuition fees, national rankings, average salary packages, placement rates, and admissions criteria across top universities side-by-side.',
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
