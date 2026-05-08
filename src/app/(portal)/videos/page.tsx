import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth";
import { videos as fallbackVideos } from "@/server/content";

export default async function VideosPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: dbVideos } = await supabase.from("videos").select("*").order("order_index");
  const { data: progress } = await supabase.from("video_progress").select("video_id,is_complete,watched_percent").eq("user_id", user.id);

  const progressMap = new Map(progress?.map((p) => [p.video_id, p]) ?? []);
  const list = dbVideos?.length
    ? dbVideos
    : fallbackVideos.map((v, i) => ({ id: `fallback-${i}`, ...v }));

  return (
    <div>
      <h1 className="text-3xl font-semibold">Bibliotheque videos</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((video: any) => {
          const stat = progressMap.get(video.id);
          const status = stat?.is_complete ? "Vue" : stat ? "En cours" : "A voir";
          return (
            <Link key={video.slug} href={`/videos/${video.slug}`} className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{video.title}</h2>
              <p className="text-sm text-dark/70">{video.description}</p>
              <p className="mt-2 text-sm">Statut: {status}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
