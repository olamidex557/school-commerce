import Image from "next/image";
import { ImageOff } from "lucide-react";

export function ProductImage({
  src,
  alt,
  priority = false,
}: Readonly<{ src: string | null; alt: string; priority?: boolean }>) {
  if (!src)
    return (
      <div
        className="flex aspect-square items-center justify-center bg-[var(--surface-strong)] text-[var(--muted)]"
        role="img"
        aria-label={`${alt} image unavailable`}
      >
        <ImageOff aria-hidden="true" size={30} />
      </div>
    );
  return (
    <div className="relative aspect-square overflow-hidden bg-[var(--surface-strong)]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 50vw, 50vw"
        className="object-cover transition duration-500 group-hover:scale-[1.035]"
      />
    </div>
  );
}
