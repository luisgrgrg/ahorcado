import { RoomScreen } from "@/components/room/room-screen";

export default async function RoomPage({ params }: { readonly params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <RoomScreen code={code} />;
}

