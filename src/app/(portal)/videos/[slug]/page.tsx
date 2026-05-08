import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/server/auth";

type Props = { params: { slug: string } };

export default async function VideoPlayerPage({ params }: Props) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: video } = await supabase.from("videos").select("*").eq("slug", params.slug).maybeSingle();
  const { data: progress } = await supabase
    .from("video_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("video_id", video?.id ?? "")
    .maybeSingle();

  if (!video) return <div>Video introuvable.</div>;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">{video.title}</h1>
      <div className="aspect-video rounded-xl bg-black">
        <iframe
          title={video.title}
          className="h-full w-full rounded-xl"
          src={`https://iframe.mediadelivery.net/embed/${env.BUNNY_LIBRARY_ID ?? ""}/${video.bunny_video_id}`}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
          allowFullScreen
        />
      </div>
      <form action="/api/videos/progress" method="post" className="rounded-xl bg-white p-5 shadow-sm">
        <input type="hidden" name="videoId" value={video.id} />
        <label className="block text-sm">Progression (%)</label>
        <input className="mt-2 w-full rounded border p-2" type="number" min={0} max={100} name="watchedPercent" defaultValue={progress?.watched_percent ?? 0} />
        <label className="mt-3 block text-sm">Notes personnelles</label>
        <textarea className="mt-2 min-h-24 w-full rounded border p-2" name="personalNote" defaultValue={progress?.personal_note ?? ""} />
        <button className="mt-3 rounded bg-sage px-4 py-2 text-white" type="submit">Sauvegarder</button>
      </form>
    </div>
  );
}
