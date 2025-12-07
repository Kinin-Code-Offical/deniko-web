import Image from "next/image";

interface ImageComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function ImageComponent({
  src,
  alt,
  width = 300,
  height = 200,
}: ImageComponentProps) {
  return (
    <div className="image-container">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-md object-cover"
      />
    </div>
  );
}
