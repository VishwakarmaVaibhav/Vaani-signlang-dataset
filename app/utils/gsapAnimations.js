import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Reusable fade-up animation
export const fadeUp = (target, delay = 0) => {
  gsap.from(target, {
    y: 40,
    opacity: 0,
    duration: 1,
    delay,
    ease: "power3.out",
  });
};

// Reusable scroll animation
export const scrollFade = (target) => {
  gsap.from(target, {
    y: 40,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
      trigger: target,
      start: "top 85%",
    },
  });
};
