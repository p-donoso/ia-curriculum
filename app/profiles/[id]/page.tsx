import Workspace from '../../workspace';
export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Workspace profileId={id} />;
}
