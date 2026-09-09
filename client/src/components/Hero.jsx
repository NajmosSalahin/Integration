export default function Hero() {
  return (
    <section className="relative">
      <img
        src="/banner.collage.jpg"
        alt="Integration"
        className="w-full h-[250px] lg:h-[400px] object-cover"
      />
      <div className="absolute inset-0 flex items-center px-6 lg:px-12">
        <div>
          <p
            className="text-white/50 text-xs tracking-[0.3em] uppercase mb-1"
            style={{ fontFamily: "var(--font-utility)" }}
          >
            Simple. Comfortable. Everyday.
          </p>
          <h1
            className="text-white/70 text-3xl sm:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            INTEGRATION
          </h1>
          <p
            className="text-white/50 text-lg mt-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Different Styles, One Identity
          </p>
        </div>
      </div>
    </section>
  );
}
