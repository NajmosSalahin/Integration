import ContentLayout from '../components/ContentLayout';

export default function About() {
  return (
    <ContentLayout title="About">
      <div className="space-y-6 text-gray-400 leading-relaxed">
        <p>
          Integration was born from a simple idea: different styles can coexist under one identity.
          In a world where everyone is told to pick a lane, we believe the most interesting people
          are the ones who refuse to.
        </p>

        <p>
          Our designs draw from Japanese streetwear, minimalist aesthetics, and the raw energy of
          urban culture. Each piece is curated to stand on its own, but together they tell a
          coherent story — one of contrast, confidence, and deliberate contradiction.
        </p>

        <p>
          The name says it all. We integrate. High and low. Sharp and soft. Bold and subtle.
          Every design in our collection is a conversation between opposing forces, and the result
          is something that feels entirely new.
        </p>

        <div className="py-6 border-t border-b border-gray-800/50">
          <h2
            className="text-xl tracking-[0.15em] uppercase text-[#e8e8e8] mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            What We Stand For
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span>Quality over quantity. Every design earns its place.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span>No fast fashion. We produce with intention, not impulse.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">&#x2022;</span>
              <span>Transparency in process — from payment to delivery, you know exactly what to expect.</span>
            </li>
          </ul>
        </div>

        <p>
          Integration is for people who wear what they feel, not what they are told.
          Different styles. One identity.
        </p>
      </div>
    </ContentLayout>
  );
}
