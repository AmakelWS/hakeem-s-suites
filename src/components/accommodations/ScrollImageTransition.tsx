"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ScrollImage = {
  src: string;
  alt: string;
  caption: string;
};

type ScrollImageTransitionProps = {
  images: ScrollImage[];
  title: string;
  description: string;
};

export function ScrollImageTransition({ images, title, description }: ScrollImageTransitionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const centered = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!centered) {
          return;
        }

        const index = Number(centered.target.getAttribute("data-index"));
        if (!Number.isNaN(index)) {
          setActiveIndex(index);
        }
      },
      {
        rootMargin: "-42% 0px -42% 0px",
        threshold: [0.15, 0.35, 0.6, 0.85]
      }
    );

    stepRefs.current.forEach((step) => {
      if (step) {
        observer.observe(step);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-b border-stoneBorder bg-parchment-light px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="scroll-gallery-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <span className="text-xs font-medium uppercase tracking-editorial text-terracotta">
            scroll gallery
          </span>
          <h2 id="scroll-gallery-heading" className="mt-2 font-serif text-4xl font-light text-charcoal sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
            {description}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="sticky top-28 h-[62vh] min-h-[420px] overflow-hidden border border-stoneBorder bg-parchment shadow-warm">
            {images.map((image, index) => (
              <Image
                key={image.src}
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className={`object-cover transition-opacity duration-700 ease-out ${
                  activeIndex === index ? "opacity-100" : "opacity-0"
                }`}
                priority={index === 0}
              />
            ))}
          </div>

          <div className="grid gap-6">
            {images.map((image, index) => (
              <div
                key={image.src}
                ref={(node) => {
                  stepRefs.current[index] = node;
                }}
                data-index={index}
                className="flex min-h-[42vh] items-center border-t border-stoneBorder py-10"
              >
                <div>
                  <span className="font-mono text-xs text-terracotta">
                    0{index + 1}.
                  </span>
                  <h3 className="mt-3 font-serif text-3xl font-light text-charcoal">
                    {image.caption}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                    {image.alt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
