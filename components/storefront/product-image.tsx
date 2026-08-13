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
        className="flex aspect-square items-center justify-center rounded-2xl bg-[#e7ebe0] text-[#5b665f]"
        role="img"
        aria-label={`${alt} image unavailable`}
      >
        <ImageOff aria-hidden="true" size={30} />
      </div>
    );
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#e7ebe0]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover"
      />
    </div>
  );
}
