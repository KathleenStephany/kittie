const slides = Array.from(document.querySelectorAll('.gallery__slide'));
const prevBtn = document.querySelector('.gallery__control--prev');
const nextBtn = document.querySelector('.gallery__control--next');

if (slides.length > 0 && prevBtn && nextBtn) {
  let activeIndex = slides.findIndex((slide) => slide.dataset.active === 'true');

  if (activeIndex < 0) {
    activeIndex = 0;
    slides[0].dataset.active = 'true';
  }

  const showSlide = (index) => {
    slides[activeIndex].dataset.active = 'false';
    activeIndex = (index + slides.length) % slides.length;
    slides[activeIndex].dataset.active = 'true';
  };

  prevBtn.addEventListener('click', () => {
    showSlide(activeIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    showSlide(activeIndex + 1);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      showSlide(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      showSlide(activeIndex + 1);
    }
  });
}
