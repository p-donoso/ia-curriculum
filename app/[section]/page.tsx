import { notFound } from 'next/navigation';
import SectionPageClient from '../components/section-page';
import { sections } from '../../lib/profiles/sections';

export default async function SectionPage({
  params,
  profileId,
}: {
  params: Promise<{ section: string }>;
  profileId?: string;
}) {
  const { section } = await params;
  if (!sections[section]) notFound();
  return <SectionPageClient section={section} profileId={profileId} />;
}
