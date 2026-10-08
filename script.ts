interface SwatchData {
  index: number;
  name: string;
}

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('slider') as HTMLDivElement | null;
  const dotsWrap = document.getElementById('sliderDots') as HTMLDivElement | null;
  const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
  const colorLabel = document.getElementById('activeColorLabel') as HTMLSpanElement | null;

  // Bail out cleanly if the markup this script depends on isn't present,
  // rather than throwing on the first null access below.
  if (!slider || !dotsWrap || !prevBtn || !nextBtn) return;

  const slides = Array.from(slider.children) as HTMLElement[];
  const swatches = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.swatch')
  );

  // build one dot per slide
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to colorway ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children) as HTMLButtonElement[];

  function goTo(index: number): void {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    slider!.scrollTo({ left: slides[clamped].offsetLeft, behavior: 'smooth' });
  }

  function currentIndex(): number {
    const scrollLeft = slider!.scrollLeft;
    let closest = 0;
    let minDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft - scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function getSwatchData(swatch: HTMLButtonElement): SwatchData {
    return {
      index: Number(swatch.dataset.index),
      name: swatch.dataset.name ?? '',
    };
  }

  function setActive(index: number): void {
    dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    swatches.forEach((s, i) => s.setAttribute('aria-current', i === index ? 'true' : 'false'));
    prevBtn!.disabled = index === 0;
    nextBtn!.disabled = index === slides.length - 1;
    if (colorLabel) colorLabel.textContent = swatches[index] ? getSwatchData(swatches[index]).name : '';
  }

  // slider swipe/scroll -> update dots + swatches
  let scrollTimeout: ReturnType<typeof setTimeout>;
  slider.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setActive(currentIndex()), 80);
    },
    { passive: true }
  );

  // arrows
  prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));

  // keyboard, when the slider itself is focused
  slider.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(currentIndex() + 1);
    if (e.key === 'ArrowLeft') goTo(currentIndex() - 1);
  });

  // swatch click -> move the slider to that colorway
  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      goTo(getSwatchData(swatch).index);
    });
  });

  setActive(0);
});



