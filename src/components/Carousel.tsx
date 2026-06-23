import { useCallback, useEffect, useRef, useState } from 'react';

interface CarouselProps {
  images: string[];
  title: string;
}

export default function Carousel({ images, title }: CarouselProps) {
  const total = images.length;
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total],
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 5000);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden mb-6 bg-neutral shadow-2xl"
      style={{ height: '18rem' }}
    >
      <div
        className="flex h-full"
        style={{
          transition: 'transform 0.5s ease-in-out',
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {images.map((img, i) => (
          <div
            key={img}
            className="w-full flex-shrink-0 flex items-center justify-center h-full"
          >
            <img
              src={img}
              alt={`${title} — image ${i + 1}`}
              className="w-full object-contain max-h-72"
            />
          </div>
        ))}
      </div>

      <button
        className="absolute left-3 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-100/70 hover:bg-base-100 border-0 shadow"
        aria-label="Previous image"
        onClick={() => {
          goTo(current - 1);
          resetTimer();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-100/70 hover:bg-base-100 border-0 shadow"
        aria-label="Next image"
        onClick={() => {
          goTo(current + 1);
          resetTimer();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, i) => {
          const activeDot = i === current;
          return (
            <button
              key={img}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeDot ? 'bg-primary w-4' : 'bg-base-content/30 w-2'
              }`}
              aria-label={`Go to image ${i + 1}`}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
