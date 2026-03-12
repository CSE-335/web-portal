import Image from "next/image";

export default function WelcomeBanner() {
  return (
    <section className="mb-8 rounded-[20px] border border-white/10 bg-[#36407A]/90 px-6 py-6 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/images/llnl-stem-logo.png"
            alt="LLNL STEM Games logo"
            width={120}
            height={120}
            className="h-auto w-[80px] md:w-[96px]"
            priority
          />
          <div>
            <h1 className="text-2xl font-extrabold leading-tight md:text-4xl">
              Welcome to LLNL
              <br />
              STEM Games
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm font-semibold text-white/90 md:flex-row md:flex-wrap md:gap-6">
          <div className="flex items-center gap-2">🧠 Interactive learning</div>
          <div className="flex items-center gap-2">💾 Save your progress</div>
          <div className="flex items-center gap-2">📱 Play on any device</div>
        </div>
      </div>
    </section>
  );
}
