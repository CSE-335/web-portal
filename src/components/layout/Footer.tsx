import Link from "next/link";

const footerLinks = [
  { label: "ALL GAMES", href: "/games" },
  { label: "ABOUT US", href: "/about" },
  { label: "CONTACT US", href: "/contact" },
  { label: "PRIVACY", href: "/privacy" },
  { label: "PARTNER", href: "/partner" },
];

export default function Footer() {
  return (
    <footer
      className="mt-2 flex w-full flex-col items-center gap-5 px-4 pt-10 pb-8"
      style={{ background: "#343C61" }}
    >
      <img
        src="/images/llnl-stem-logo.png"
        alt="LLNL STEM Games Logo"
        className="h-auto w-[100px] object-contain"
      />

      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm font-medium text-[#FBE7E7] transition-colors hover:text-white md:text-base"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <p className="max-w-4xl text-center text-[13px] font-normal leading-relaxed text-white md:text-[15px]">
        Welcome to Lawrence Livermore National Laboratory STEM game web portal.
        Enjoy our library of educational STEM games which could be played on
        phones, tablets, and PC with no downloads necessary. If you&apos;re
        struggling with the concepts, ensure to use the AI features for
        assistance.
      </p>
    </footer>
  );
}