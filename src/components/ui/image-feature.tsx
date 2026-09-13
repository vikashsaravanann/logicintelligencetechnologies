import BrandMesh from "@/components/ui/brand-mesh";
import SafeImage from "@/components/ui/safe-image";

export default function ImageFeature({
  src,
  alt,
  seed,
  caption,
}: {
  src?: string;
  alt: string;
  seed?: string;
  caption?: string;
}) {
  return (
    <figure className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
      {src ? (
        <SafeImage src={src} alt={alt} width={1200} height={720} className="w-full h-auto object-cover" />
      ) : (
        <BrandMesh seed={seed || alt} label={alt} />
      )}
      {caption ? <figcaption className="px-4 py-3 text-xs text-zinc-400">{caption}</figcaption> : null}
    </figure>
  );
}
