import SectionPage from '../../../[section]/page';

export default async function ProfileSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SectionPage params={Promise.resolve({ section: 'settings' })} profileId={id} />;
}
