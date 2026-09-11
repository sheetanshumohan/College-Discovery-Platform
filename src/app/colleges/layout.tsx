import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Colleges & Universities — CollegeFinder',
  description:
    'Search, filter, and discover over 100+ accredited US universities by tuition fees, location, national rankings, and student ratings.',
};

export default function CollegesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
