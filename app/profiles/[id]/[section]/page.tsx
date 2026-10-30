import SectionPage from '../../../[section]/page';
export default async function ProfileSectionPage({ params }: { params: Promise<{ id: string; section: string }> }) {
  const { id, section } = await params;
  return <SectionPage params={Promise.resolve({ section })} profileId={id} />;
}
