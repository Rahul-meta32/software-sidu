import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — attach to any element ref to trigger
 * a CSS class when it enters the viewport.
 *
 * @param {string} animClass  – CSS class to add (default: 'revealed')
 * @param {number} threshold  – 0–1 how much of element must be visible (default: 0.12)
 * @param {string} rootMargin – IntersectionObserver rootMargin (default: '0px 0px -60px 0px')
 */
const useScrollReveal = (animClass = 'revealed', threshold = 0.12, rootMargin = '0px 0px -60px 0px') => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(animClass);
          observer.unobserve(el); // animate only once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animClass, threshold, rootMargin]);

  return ref;
};

export default useScrollReveal;
