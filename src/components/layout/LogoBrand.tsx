import Image from "next/image";
import { BRAND_TEXT_SHADOW } from "@/constants/layout";

type LogoBrandProps = {
  children: React.ReactNode;
  size?: "sm" | "lg";
};

export default function LogoBrand({ children, size = "sm" }: LogoBrandProps) {
  let imgClass: string;
  let textClass: string;

  // Small and large variants
  if(size === "lg") {
    imgClass = "h-auto w-[90px] object-contain md:w-[139px]";
    textClass = "text-center text-xl font-extrabold leading-tight md:text-[24px]";
  } else {
    imgClass = "h-9 w-10 rounded-sm object-contain md:h-[52px] md:w-[60px]";
    textClass = "hidden text-center text-sm font-extrabold leading-tight sm:block md:text-[20px]";
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <Image
        src="/images/llnl-stem-logo.png"
        alt="LLNL STEM Games Logo"
        width={139}
        height={139}
        className={imgClass}
      />
      <span
        className={textClass}
        style={{ textShadow: BRAND_TEXT_SHADOW, color: 'white' }}
      >
        {children}
      </span>
    </div>
  );
}
