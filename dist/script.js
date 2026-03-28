/* =============================================
   THE ROYAL REMOVALS — Multi-Step Form & UI JS
   ============================================= */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     UK POSTCODE AUTOCOMPLETE
     Uses free postcodes.io API — no key needed
  ───────────────────────────────────────────── */
  function initPostcodeAutocomplete(inputEl) {
    if (!inputEl) return;

    // Create dropdown container
    const wrapper = inputEl.parentElement;
    wrapper.style.position = 'relative';

    const dropdown = document.createElement('ul');
    dropdown.className = 'postcode-dropdown';
    wrapper.appendChild(dropdown);

    let debounceTimer = null;
    let activeIndex = -1;
    let results = [];

    function showDropdown(items) {
      results = items;
      activeIndex = -1;
      dropdown.innerHTML = '';

      if (!items.length) { dropdown.classList.remove('open'); return; }

      items.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'postcode-dropdown__item';
        // item.display = full one-liner, item.postcode = bold part
        const postcodePart = item.postcode ? `<span class="postcode-dropdown__code">${item.postcode}</span>` : '';
        li.innerHTML = `<span class="postcode-dropdown__address">${item.display}</span>${postcodePart}`;
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          selectItem(i);
        });
        dropdown.appendChild(li);
      });

      dropdown.classList.add('open');
    }

    function hideDropdown() {
      dropdown.classList.remove('open');
      activeIndex = -1;
    }

    function selectItem(i) {
      const item = results[i];
      if (!item) return;
      inputEl.value = item.display;
      hideDropdown();
      // Clear any validation error
      const errEl = inputEl.closest('.form-step')?.querySelector('.form-step__error');
      if (errEl) errEl.classList.add('hidden');
    }

    function highlightItem(newIndex) {
      const items = dropdown.querySelectorAll('.postcode-dropdown__item');
      items.forEach(el => el.classList.remove('active'));
      activeIndex = Math.max(-1, Math.min(newIndex, items.length - 1));
      if (activeIndex >= 0) {
        items[activeIndex].classList.add('active');
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }

    async function fetchSuggestions(query) {
      if (!query) { hideDropdown(); return; }

      try {
        // Nominatim (OpenStreetMap) — free, no API key, returns full UK addresses
        const url = `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query + ', UK')}` +
          `&countrycodes=gb&format=json&addressdetails=1&limit=8&dedupe=1`;

        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en-GB,en' }
        });
        if (!res.ok) { hideDropdown(); return; }
        const data = await res.json();

        if (!data.length) { hideDropdown(); return; }

        const mapped = data.map(item => {
          const a = item.address || {};
          // Build address parts in the style: "3 Beardwood Brow, BLACKBURN, BB2 7AX"
          const street = [
            a.house_number,
            a.road || a.pedestrian || a.footway
          ].filter(Boolean).join(' ');

          const town = (
            a.town || a.city || a.village ||
            a.suburb || a.county || ''
          ).toUpperCase();

          const postcode = a.postcode || '';

          const parts = [street, town, postcode].filter(Boolean);
          return {
            display: parts.join(', '),
            postcode
          };
        }).filter(item => item.display.trim());

        // De-duplicate by display string
        const seen = new Set();
        const unique = mapped.filter(item => {
          if (seen.has(item.display)) return false;
          seen.add(item.display);
          return true;
        });

        showDropdown(unique);
      } catch (_) {
        hideDropdown();
      }
    }

    // Input handler with debounce
    inputEl.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const val = inputEl.value.trim();
      if (val.length < 2) { hideDropdown(); return; }
      debounceTimer = setTimeout(() => fetchSuggestions(val), 300);
    });

    // Keyboard navigation
    inputEl.addEventListener('keydown', (e) => {
      if (!dropdown.classList.contains('open')) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightItem(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightItem(activeIndex - 1);
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0) {
          e.preventDefault();
          selectItem(activeIndex);
        }
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    });

    // Hide on outside click
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) hideDropdown();
    });
  }

  // Initialise on both postcode fields
  initPostcodeAutocomplete(document.getElementById('fromPostcode'));
  initPostcodeAutocomplete(document.getElementById('toPostcode'));

  /* ── NAVIGATION SCROLL EFFECT ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('nav--scrolled', window.scrollY > 20);
  });

  /* ── MOBILE NAV TOGGLE ── */
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (navBurger && navLinks) {
    navBurger.addEventListener('click', () => {
      navLinks.classList.toggle('nav--open');
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('nav--open'));
    });
  }

  /* ── SMOOTH SCROLL FOR CTA BUTTONS ── */
  document.querySelectorAll('.cta-scroll, a[href="#quote-form"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('quote-form');
      if (target) {
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── MULTI-STEP FORM LOGIC ── */
  const form = document.getElementById('quoteForm');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 5;

  const progressBar = document.getElementById('progressBar');
  const progressStepEls = document.querySelectorAll('.form-progress__step');

  function setStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));

    // Show target step
    const targetStep = document.getElementById('step-' + step);
    if (targetStep) {
      targetStep.classList.add('active');
    }

    currentStep = step;
    updateProgress();
  }

  function updateProgress() {
    // Update progress bar width
    const pct = (currentStep / totalSteps) * 100;
    if (progressBar) progressBar.style.width = pct + '%';

    // Update step indicators
    progressStepEls.forEach((el, i) => {
      const stepNum = i + 1;
      el.classList.remove('active', 'done');
      if (stepNum === currentStep) el.classList.add('active');
      if (stepNum < currentStep) el.classList.add('done');
    });
  }

  function validate(step) {
    const err = document.getElementById('err-' + step);
    let valid = true;

    if (step === 1) {
      const checked = form.querySelector('input[name="property"]:checked');
      if (!checked) { valid = false; }
    } else if (step === 2) {
      const val = form.querySelector('#fromPostcode').value.trim();
      if (!val) { valid = false; }
    } else if (step === 3) {
      const val = form.querySelector('#toPostcode').value.trim();
      if (!val) { valid = false; }
    } else if (step === 4) {
      const val = form.querySelector('#moveDate').value.trim();
      if (!val) { valid = false; }
    } else if (step === 5) {
      const name = form.querySelector('#fullName').value.trim();
      const phone = form.querySelector('#phone').value.trim();
      const email = form.querySelector('#email').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || !phone || !email || !emailRegex.test(email)) {
        valid = false;
      }
    }

    if (err) {
      err.classList.toggle('hidden', valid);
    }
    return valid;
  }

  /* ── NEXT BUTTONS ── */
  form.querySelectorAll('.step-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validate(currentStep)) return;
      if (currentStep < totalSteps) {
        setStep(currentStep + 1);
        scrollToForm();
      }
    });
  });

  /* ── BACK BUTTONS ── */
  form.querySelectorAll('.step-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        setStep(currentStep - 1);
        scrollToForm();
        // Hide error on going back
        const err = document.getElementById('err-' + currentStep);
        if (err) err.classList.add('hidden');
      }
    });
  });

  /* ── PILL OPTION AUTO-ADVANCE ── */
  form.querySelectorAll('.pill-option input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      // Auto advance after brief delay on property selection
      if (currentStep === 1) {
        setTimeout(() => {
          if (validate(1)) setStep(2);
        }, 350);
      }
    });
  });

  /* ── FORM SUBMIT ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(5)) return;

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn__text');
    const btnLoader = submitBtn.querySelector('.btn__loader');

    // Show loading state
    if (btnText) btnText.classList.add('hidden');
    if (btnLoader) {
      btnLoader.classList.remove('hidden');
      btnLoader.style.display = 'inline';
    }
    submitBtn.disabled = true;

    // Simulate submission (replace with real API call)
    setTimeout(() => {
      // Hide step 5
      document.getElementById('step-5').classList.remove('active');

      // Show success
      const success = document.getElementById('step-success');
      success.classList.remove('hidden');
      success.classList.add('active');

      // Update progress to full
      if (progressBar) progressBar.style.width = '100%';
      progressStepEls.forEach(el => el.classList.add('done'));

      scrollToForm();
    }, 1500);
  });

  function scrollToForm() {
    const formWrap = document.getElementById('quote-form');
    if (formWrap) {
      const offset = 90;
      const top = formWrap.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // Set date input min to today
  const moveDateInput = document.getElementById('moveDate');
  if (moveDateInput) {
    const today = new Date().toISOString().split('T')[0];
    moveDateInput.setAttribute('min', today);
  }

  /* ── FAQs ACCORDION ── */
  window.toggleFaq = function (el) {
    const isOpen = el.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) el.classList.add('open');
  };

  /* ── INTERSECTION OBSERVER — SUBTLE REVEAL ── */
  const revealEls = document.querySelectorAll(
    '.feature-card, .service-card, .testimonial-card, .faq-item, .steps-timeline__item, .area-pill'
  );
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`;
      observer.observe(el);
    });
  }

  /* ── INIT ── */
  setStep(1);

})();
