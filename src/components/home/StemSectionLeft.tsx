import PlaceholderCard from "./PlaceholderCard";

type StemSectionLeftProps = {
  title: string;
};

export default function StemSectionLeft({ title }: StemSectionLeftProps) {
  return (
    <section className="mt-8 px-4 md:mt-10 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
        <div className="flex flex-col gap-4 lg:w-[42%]">
          <h2 className="text-4xl leading-none font-extrabold text-white md:text-[48px]">
            {title}
          </h2>
          <PlaceholderCard className="h-[200px] md:h-[280px] lg:h-[309px]" />
        </div>

        <div className="lg:flex-1">
          <PlaceholderCard className="h-[250px] md:h-[340px] lg:h-[406px]" />
        </div>
      </div>
    </section>
  );
}
