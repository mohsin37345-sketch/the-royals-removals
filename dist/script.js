/* =============================================
   THE ROYALS REMOVALS — Multi-Step Form & UI JS
   ============================================= */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     UK POSTCODE AUTOCOMPLETE
  ───────────────────────────────────────────── */
  function initPostcodeAutocomplete(inputEl) {
    if (!inputEl) return;
    const wrapper = inputEl.parentElement;
    wrapper.style.position = 'relative';
    const dropdown = document.createElement('ul');
    dropdown.className = 'postcode-dropdown';
    wrapper.appendChild(dropdown);

    let debounceTimer = null, activeIndex = -1, results = [];

    function showDropdown(items) {
      results = items; activeIndex = -1; dropdown.innerHTML = '';
      if (!items.length) { dropdown.classList.remove('open'); return; }
      items.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'postcode-dropdown__item';
        const postcodePart = item.postcode ? `<span class="postcode-dropdown__code">${item.postcode}</span>` : '';
        li.innerHTML = `<span class="postcode-dropdown__address">${item.display}</span>${postcodePart}`;
        li.addEventListener('mousedown', (e) => { e.preventDefault(); selectItem(i); });
        dropdown.appendChild(li);
      });
      dropdown.classList.add('open');
    }
    function hideDropdown() { dropdown.classList.remove('open'); activeIndex = -1; }
    function selectItem(i) { const item = results[i]; if (!item) return; inputEl.value = item.display; hideDropdown(); }
    function highlightItem(newIndex) {
      const items = dropdown.querySelectorAll('.postcode-dropdown__item');
      items.forEach(el => el.classList.remove('active'));
      activeIndex = Math.max(-1, Math.min(newIndex, items.length - 1));
      if (activeIndex >= 0) { items[activeIndex].classList.add('active'); items[activeIndex].scrollIntoView({ block: 'nearest' }); }
    }

    async function fetchSuggestions(query) {
      if (!query) { hideDropdown(); return; }
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', UK')}&countrycodes=gb&format=json&addressdetails=1&limit=8&dedupe=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en-GB,en' } });
        if (!res.ok) { hideDropdown(); return; }
        const data = await res.json();
        if (!data.length) { hideDropdown(); return; }
        const mapped = data.map(item => {
          const a = item.address || {};
          const street = [a.house_number, a.road || a.pedestrian || a.footway].filter(Boolean).join(' ');
          const town = (a.town || a.city || a.village || a.suburb || a.county || '').toUpperCase();
          const postcode = a.postcode || '';
          return { display: [street, town, postcode].filter(Boolean).join(', '), postcode };
        }).filter(item => item.display.trim());
        const seen = new Set();
        showDropdown(mapped.filter(item => { if (seen.has(item.display)) return false; seen.add(item.display); return true; }));
      } catch (_) { hideDropdown(); }
    }

    inputEl.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const val = inputEl.value.trim();
      if (val.length < 2) { hideDropdown(); return; }
      debounceTimer = setTimeout(() => fetchSuggestions(val), 300);
    });
    inputEl.addEventListener('keydown', (e) => {
      if (!dropdown.classList.contains('open')) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); highlightItem(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlightItem(activeIndex - 1); }
      else if (e.key === 'Enter') { if (activeIndex >= 0) { e.preventDefault(); selectItem(activeIndex); } }
      else if (e.key === 'Escape') { hideDropdown(); }
    });
    document.addEventListener('click', (e) => { if (!wrapper.contains(e.target)) hideDropdown(); });
  }

  // Initialise autocomplete on all address fields
  initPostcodeAutocomplete(document.getElementById('pickupAddress'));
  initPostcodeAutocomplete(document.getElementById('deliveryAddress'));
  initPostcodeAutocomplete(document.getElementById('simpleAddress'));
  initPostcodeAutocomplete(document.getElementById('furniturePickupAddress'));
  initPostcodeAutocomplete(document.getElementById('furnitureDeliveryAddress'));
  initPostcodeAutocomplete(document.getElementById('pianoPickupAddress'));
  initPostcodeAutocomplete(document.getElementById('pianoDeliveryAddress'));
  initPostcodeAutocomplete(document.getElementById('studentFromAddress'));
  initPostcodeAutocomplete(document.getElementById('studentToAddress'));
  initPostcodeAutocomplete(document.getElementById('officePickupAddress'));
  initPostcodeAutocomplete(document.getElementById('officeDeliveryAddress'));
  initPostcodeAutocomplete(document.getElementById('packingPickupAddress'));
  initPostcodeAutocomplete(document.getElementById('packingDeliveryAddress'));
  initPostcodeAutocomplete(document.getElementById('equipPickupAddress'));
  initPostcodeAutocomplete(document.getElementById('equipDeliveryAddress'));
  initPostcodeAutocomplete(document.getElementById('storagePickupAddress'));
  initPostcodeAutocomplete(document.getElementById('storageDeliveryAddress'));
  initPostcodeAutocomplete(document.getElementById('clearPickupAddress'));
  initPostcodeAutocomplete(document.getElementById('clearDeliveryAddress'));
  initPostcodeAutocomplete(document.getElementById('commPickupAddress'));
  initPostcodeAutocomplete(document.getElementById('commDeliveryAddress'));

  /* ── NAVIGATION ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => { navbar.classList.toggle('nav--scrolled', window.scrollY > 20); });

  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (navBurger && navLinks) {
    navBurger.addEventListener('click', () => navLinks.classList.toggle('nav--open'));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('nav--open')));
  }

  document.querySelectorAll('.cta-scroll, a[href="#quote-form"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('quote-form');
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    });
  });

  /* ── FAQs ACCORDION ── */
  window.toggleFaq = function (el) {
    const isOpen = el.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
    if (!isOpen) el.classList.add('open');
  };

  /* ── INTERSECTION OBSERVER (Scroll Animations) ── */
  const revealEls = document.querySelectorAll('.feature-card, .service-card, .testimonial-card, .faq-item, .steps-timeline__item, .area-pill');
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

  /* ══════════════════════════════════════════════
     MULTI-STEP FORM LOGIC
     ══════════════════════════════════════════════
     Flows:
       House Removals:            [1, 2, 3, 'contact']
       Furniture & appliance:     [1, 'furniture-1', 'simple']
       All other services:        [1, 'simple']
  ────────────────────────────────────────────── */
  const form = document.getElementById('quoteForm');
  if (!form) return;

  const FLOW_HOUSE = [1, 2, 3, 'contact'];
  const FLOW_FURNITURE = [1, 'furniture-1', 'furniture-2', 'simple'];
  const FLOW_PIANO = [1, 'piano-1', 'piano-contact'];
  const FLOW_OFFICE = [1, 'office-1', 'office-2', 'office-contact'];
  const FLOW_PACKING = [1, 'packing-1', 'packing-2', 'packing-contact'];
  const FLOW_EQUIP = [1, 'equip-1', 'equip-2', 'equip-contact'];
  const FLOW_STORAGE = [1, 'storage-1', 'storage-2', 'storage-contact'];
  const FLOW_CLEAR = [1, 'clear-1', 'clear-2', 'clear-contact'];
  const FLOW_COMM = [1, 'comm-1', 'comm-2', 'comm-contact'];
  const FLOW_STUDENT = [1, 'student-1'];
  const FLOW_SIMPLE = [1, 'simple'];

  let stepFlow = FLOW_SIMPLE;
  let currentStepIndex = 0;
  const progressBar = document.getElementById('progressBar');

  function getSelectedService() {
    const checked = form.querySelector('input[name="service"]:checked');
    return checked ? checked.value : '';
  }

  function updateStepFlow() {
    const service = getSelectedService();
    document.body.classList.remove('flow-house', 'flow-furniture', 'flow-piano', 'flow-office', 'flow-packing', 'flow-equip', 'flow-storage', 'flow-clear', 'flow-comm', 'flow-student', 'flow-simple');

    if (service === 'House removals' || service === 'Man and van') {
      stepFlow = FLOW_HOUSE;
      document.body.classList.add('flow-house');
    } else if (service === 'Furniture & appliance delivery') {
      stepFlow = FLOW_FURNITURE;
      document.body.classList.add('flow-furniture');
    } else if (service === 'Piano delivery') {
      stepFlow = FLOW_PIANO;
      document.body.classList.add('flow-piano');
    } else if (service === 'Office removals') {
      stepFlow = FLOW_OFFICE;
      document.body.classList.add('flow-office');
    } else if (service === 'Packing services') {
      stepFlow = FLOW_PACKING;
      document.body.classList.add('flow-packing');
    } else if (service === 'Equipment & machinery') {
      stepFlow = FLOW_EQUIP;
      document.body.classList.add('flow-equip');
    } else if (service === 'Storage services') {
      stepFlow = FLOW_STORAGE;
      document.body.classList.add('flow-storage');
    } else if (service === 'Clearance') {
      stepFlow = FLOW_CLEAR;
      document.body.classList.add('flow-clear');
    } else if (service === 'Commercial removals') {
      stepFlow = FLOW_COMM;
      document.body.classList.add('flow-comm');
    } else if (service === 'Student removals') {
      stepFlow = FLOW_STUDENT;
      document.body.classList.add('flow-student');
    } else {
      stepFlow = FLOW_SIMPLE;
      document.body.classList.add('flow-simple');
    }
  }

  function getCurrentStepId() { return stepFlow[currentStepIndex]; }

  function getStepElementId(stepId) {
    if (stepId === 'contact') return 'step-contact';
    if (stepId === 'simple') return 'step-simple';
    if (stepId === 'furniture-1') return 'step-furniture-1';
    if (stepId === 'furniture-2') return 'step-furniture-2';
    if (stepId === 'piano-1') return 'step-piano-1';
    if (stepId === 'piano-contact') return 'step-piano-contact';
    if (stepId === 'office-1') return 'step-office-1';
    if (stepId === 'office-2') return 'step-office-2';
    if (stepId === 'office-contact') return 'step-office-contact';
    if (stepId === 'packing-1') return 'step-packing-1';
    if (stepId === 'packing-2') return 'step-packing-2';
    if (stepId === 'packing-contact') return 'step-packing-contact';
    if (stepId === 'equip-1') return 'step-equip-1';
    if (stepId === 'equip-2') return 'step-equip-2';
    if (stepId === 'equip-contact') return 'step-equip-contact';
    if (stepId === 'storage-1') return 'step-storage-1';
    if (stepId === 'storage-2') return 'step-storage-2';
    if (stepId === 'storage-contact') return 'step-storage-contact';
    if (stepId === 'clear-1') return 'step-clear-1';
    if (stepId === 'clear-2') return 'step-clear-2';
    if (stepId === 'clear-contact') return 'step-clear-contact';
    if (stepId === 'comm-1') return 'step-comm-1';
    if (stepId === 'comm-2') return 'step-comm-2';
    if (stepId === 'comm-contact') return 'step-comm-contact';
    if (stepId === 'student-1') return 'step-student-1';
    return 'step-' + stepId;
  }

  function setStep(index) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    const stepId = stepFlow[index];
    const targetStep = document.getElementById(getStepElementId(stepId));
    if (targetStep) targetStep.classList.add('active');
    currentStepIndex = index;
    updateProgress();
  }

  function updateProgress() {
    const totalSteps = stepFlow.length;
    const pct = ((currentStepIndex + 1) / totalSteps) * 100;
    if (progressBar) progressBar.style.width = pct + '%';

    const allProgressSteps = document.querySelectorAll('.form-progress__step');
    const visibleSteps = [];

    allProgressSteps.forEach(el => {
      const ds = el.getAttribute('data-step');
      if (ds === '1') { visibleSteps.push(el); }
      else if (stepFlow === FLOW_HOUSE && ['2', '3', 'contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_FURNITURE && ['furniture-1', 'furniture-2', 'furniture-contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_PIANO && ['piano-1', 'piano-contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_OFFICE && ['office-1', 'office-2', 'office-contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_PACKING && ['packing-1', 'packing-2', 'packing-contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_EQUIP && ['equip-1', 'equip-2', 'equip-contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_STORAGE && ['storage-1', 'storage-2', 'storage-contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_CLEAR && ['clear-1', 'clear-2', 'clear-contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_COMM && ['comm-1', 'comm-2', 'comm-contact'].includes(ds)) { visibleSteps.push(el); }
      else if (stepFlow === FLOW_STUDENT && ds === 'student-1') { visibleSteps.push(el); }
      else if (stepFlow === FLOW_SIMPLE && ds === 'simple') { visibleSteps.push(el); }
      el.classList.remove('active', 'done');
    });

    visibleSteps.forEach((el, i) => {
      if (i === currentStepIndex) el.classList.add('active');
      if (i < currentStepIndex) el.classList.add('done');
    });
  }

  function validate(stepId) {
    let errElId, valid = true;

    if (stepId === 1) {
      errElId = 'err-1';
      if (!form.querySelector('input[name="service"]:checked')) valid = false;
    } else if (stepId === 2) {
      errElId = 'err-2';
      const pa = (form.querySelector('#pickupAddress') || {}).value || '';
      const pt = (form.querySelector('#pickupPropertyType') || {}).value || '';
      const da = (form.querySelector('#deliveryAddress') || {}).value || '';
      const dt = (form.querySelector('#deliveryPropertyType') || {}).value || '';
      const dc = form.querySelector('input[name="dateChoice"]:checked');
      const hasDate = dc && dc.value === 'hasDate';
      const md = (form.querySelector('#moveDate') || {}).value || '';
      if (!pa.trim() || !pt || !da.trim() || !dt) valid = false;
      if (hasDate && !md) valid = false;
      // Validate additional services (at least one required)
      const additionalChecked = form.querySelectorAll('#additionalServicesGrid input[name="additionalServices"]:checked');
      const addSvcErr = document.getElementById('err-additional-services');
      if (additionalChecked.length === 0) { valid = false; if (addSvcErr) addSvcErr.classList.remove('hidden'); }
      else { if (addSvcErr) addSvcErr.classList.add('hidden'); }
    } else if (stepId === 3) {
      errElId = 'err-3';
      if (getTotalInventoryCount() === 0) valid = false;
    } else if (stepId === 'contact') {
      errElId = 'err-contact';
      const n = form.querySelector('#fullName').value.trim();
      const p = form.querySelector('#phone').value.trim();
      const e = form.querySelector('#email').value.trim();
      if (!n || !p || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) valid = false;
    } else if (stepId === 'simple') {
      errElId = 'err-simple';
      const n = form.querySelector('#simpleName').value.trim();
      const e = form.querySelector('#simpleEmail').value.trim();
      const p = form.querySelector('#simplePhone').value.trim();
      const a = form.querySelector('#simpleAddress').value.trim();
      if (!n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p || !a) valid = false;
    } else if (stepId === 'furniture-1') {
      errElId = 'err-furniture-1';
      const pa = (form.querySelector('#furniturePickupAddress') || {}).value || '';
      const pf = (form.querySelector('#furniturePickupFloor') || {}).value || '';
      const da = (form.querySelector('#furnitureDeliveryAddress') || {}).value || '';
      const df = (form.querySelector('#furnitureDeliveryFloor') || {}).value || '';
      if (!pa.trim() || !pf || !da.trim() || !df) valid = false;
      // Validate furniture additional services (at least one required)
      const fAddChecked = form.querySelectorAll('#furnitureAdditionalServicesGrid input[name="furnitureAdditionalServices"]:checked');
      const fAddErr = document.getElementById('err-furniture-additional-services');
      if (fAddChecked.length === 0) { valid = false; if (fAddErr) fAddErr.classList.remove('hidden'); }
      else { if (fAddErr) fAddErr.classList.add('hidden'); }
    } else if (stepId === 'furniture-2') {
      errElId = 'err-furniture-2';
      const count = Object.values(furnitureAddedItems).reduce((sum, qty) => sum + qty, 0);
      if (count === 0) valid = false;
    } else if (stepId === 'piano-1') {
      errElId = 'err-piano-1';
      const pianoChecked = form.querySelector('input[name="pianoType"]:checked');
      const pianoCustom = (form.querySelector('#pianoCustomType') || {}).value || '';
      const pianoCustomVisible = !document.getElementById('pianoCustomInput')?.classList.contains('hidden');
      if (!pianoChecked && !(pianoCustomVisible && pianoCustom.trim())) valid = false;
      const pa = (form.querySelector('#pianoPickupAddress') || {}).value || '';
      const pf = (form.querySelector('#pianoPickupFloor') || {}).value || '';
      const da = (form.querySelector('#pianoDeliveryAddress') || {}).value || '';
      const df = (form.querySelector('#pianoDeliveryFloor') || {}).value || '';
      if (!pa.trim() || !pf || !da.trim() || !df) valid = false;
    } else if (stepId === 'piano-contact') {
      errElId = 'err-piano-contact';
      const n = form.querySelector('#pianoName').value.trim();
      const e = form.querySelector('#pianoEmail').value.trim();
      const p = form.querySelector('#pianoPhone').value.trim();
      if (!n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p) valid = false;
    } else if (stepId === 'office-1') {
      errElId = 'err-office-1';
      const pa = (form.querySelector('#officePickupAddress') || {}).value || '';
      const pf = (form.querySelector('#officePickupFloor') || {}).value || '';
      const da = (form.querySelector('#officeDeliveryAddress') || {}).value || '';
      const df = (form.querySelector('#officeDeliveryFloor') || {}).value || '';
      if (!pa.trim() || !pf || !da.trim() || !df) valid = false;
    } else if (stepId === 'office-2') {
      errElId = 'err-office-2';
      const count = Object.values(officeAddedItems).reduce((sum, qty) => sum + qty, 0);
      if (count === 0) valid = false;
    } else if (stepId === 'office-contact') {
      errElId = 'err-office-contact';
      const n = form.querySelector('#officeName').value.trim();
      const e = form.querySelector('#officeEmail').value.trim();
      const p = form.querySelector('#officePhone').value.trim();
      if (!n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p) valid = false;
    } else if (stepId === 'packing-1') {
      errElId = 'err-packing-1';
      const pa = (form.querySelector('#packingPickupAddress') || {}).value || '';
      const pf = (form.querySelector('#packingPickupFloor') || {}).value || '';
      const da = (form.querySelector('#packingDeliveryAddress') || {}).value || '';
      const df = (form.querySelector('#packingDeliveryFloor') || {}).value || '';
      if (!pa.trim() || !pf || !da.trim() || !df) valid = false;
    } else if (stepId === 'packing-2') {
      errElId = 'err-packing-2';
      const count = Object.values(packingAddedItems).reduce((sum, qty) => sum + qty, 0);
      if (count === 0) valid = false;
    } else if (stepId === 'packing-contact') {
      errElId = 'err-packing-contact';
      const n = form.querySelector('#packingName').value.trim();
      const e = form.querySelector('#packingEmail').value.trim();
      const p = form.querySelector('#packingPhone').value.trim();
      if (!n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p) valid = false;
    } else if (stepId === 'equip-1') {
      errElId = 'err-equip-1';
      const pa = (form.querySelector('#equipPickupAddress') || {}).value || '';
      const pf = (form.querySelector('#equipPickupFloor') || {}).value || '';
      const da = (form.querySelector('#equipDeliveryAddress') || {}).value || '';
      const df = (form.querySelector('#equipDeliveryFloor') || {}).value || '';
      if (!pa.trim() || !pf || !da.trim() || !df) valid = false;
    } else if (stepId === 'equip-2') {
      errElId = 'err-equip-2';
      const count = Object.values(equipAddedItems).reduce((sum, qty) => sum + qty, 0);
      if (count === 0) valid = false;
    } else if (stepId === 'equip-contact') {
      errElId = 'err-equip-contact';
      const n = form.querySelector('#equipName').value.trim();
      const e = form.querySelector('#equipEmail').value.trim();
      const p = form.querySelector('#equipPhone').value.trim();
      if (!n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p) valid = false;
    } else if (stepId === 'storage-1') {
      errElId = 'err-storage-1';
      const pa = (form.querySelector('#storagePickupAddress') || {}).value || '';
      const pf = (form.querySelector('#storagePickupFloor') || {}).value || '';
      const da = (form.querySelector('#storageDeliveryAddress') || {}).value || '';
      const df = (form.querySelector('#storageDeliveryFloor') || {}).value || '';
      if (!pa.trim() || !pf || !da.trim() || !df) valid = false;
    } else if (stepId === 'storage-2') {
      errElId = 'err-storage-2';
      const count = Object.values(storageAddedItems).reduce((sum, qty) => sum + qty, 0);
      if (count === 0) valid = false;
    } else if (stepId === 'storage-contact') {
      errElId = 'err-storage-contact';
      const n = form.querySelector('#storageName').value.trim();
      const e = form.querySelector('#storageEmail').value.trim();
      const p = form.querySelector('#storagePhone').value.trim();
      if (!n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p) valid = false;
    } else if (stepId === 'clear-1') {
      errElId = 'err-clear-1';
      const pa = (form.querySelector('#clearPickupAddress') || {}).value || '';
      const pf = (form.querySelector('#clearPickupFloor') || {}).value || '';
      const da = (form.querySelector('#clearDeliveryAddress') || {}).value || '';
      const df = (form.querySelector('#clearDeliveryFloor') || {}).value || '';
      if (!pa.trim() || !pf || !da.trim() || !df) valid = false;
    } else if (stepId === 'clear-2') {
      errElId = 'err-clear-2';
      const count = Object.values(clearAddedItems).reduce((sum, qty) => sum + qty, 0);
      if (count === 0) valid = false;
    } else if (stepId === 'clear-contact') {
      errElId = 'err-clear-contact';
      const n = form.querySelector('#clearName').value.trim();
      const e = form.querySelector('#clearEmail').value.trim();
      const p = form.querySelector('#clearPhone').value.trim();
      if (!n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p) valid = false;
    } else if (stepId === 'comm-1') {
      errElId = 'err-comm-1';
      const pa = (form.querySelector('#commPickupAddress') || {}).value || '';
      const pf = (form.querySelector('#commPickupFloor') || {}).value || '';
      const da = (form.querySelector('#commDeliveryAddress') || {}).value || '';
      const df = (form.querySelector('#commDeliveryFloor') || {}).value || '';
      if (!pa.trim() || !pf || !da.trim() || !df) valid = false;
    } else if (stepId === 'comm-2') {
      errElId = 'err-comm-2';
      const count = Object.values(commAddedItems).reduce((sum, qty) => sum + qty, 0);
      if (count === 0) valid = false;
    } else if (stepId === 'comm-contact') {
      errElId = 'err-comm-contact';
      const n = form.querySelector('#commName').value.trim();
      const e = form.querySelector('#commEmail').value.trim();
      const p = form.querySelector('#commPhone').value.trim();
      if (!n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p) valid = false;
    } else if (stepId === 'student-1') {
      errElId = 'err-student-1';
      const from = (form.querySelector('#studentFromAddress') || {}).value || '';
      const to = (form.querySelector('#studentToAddress') || {}).value || '';
      const n = form.querySelector('#studentName').value.trim();
      const e = form.querySelector('#studentEmail').value.trim();
      const p = form.querySelector('#studentPhone').value.trim();
      if (!from.trim() || !to.trim() || !n || !e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || !p) valid = false;
    }

    const err = document.getElementById(errElId);
    if (err) err.classList.toggle('hidden', valid);
    return valid;
  }

  /* ── NEXT / BACK ── */
  form.querySelectorAll('.step-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validate(getCurrentStepId())) return;
      if (currentStepIndex < stepFlow.length - 1) { setStep(currentStepIndex + 1); scrollToForm(); }
    });
  });

  form.querySelectorAll('.step-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStepIndex > 0) {
        setStep(currentStepIndex - 1);
        scrollToForm();
        const sid = getCurrentStepId();
        const eid = sid === 'contact' ? 'err-contact' : sid === 'simple' ? 'err-simple' : sid === 'furniture-1' ? 'err-furniture-1' : sid === 'furniture-2' ? 'err-furniture-2' : sid === 'piano-1' ? 'err-piano-1' : sid === 'piano-contact' ? 'err-piano-contact' : sid === 'office-1' ? 'err-office-1' : sid === 'office-2' ? 'err-office-2' : sid === 'office-contact' ? 'err-office-contact' : sid === 'packing-1' ? 'err-packing-1' : sid === 'packing-2' ? 'err-packing-2' : sid === 'packing-contact' ? 'err-packing-contact' : sid === 'equip-1' ? 'err-equip-1' : sid === 'equip-2' ? 'err-equip-2' : sid === 'equip-contact' ? 'err-equip-contact' : sid === 'storage-1' ? 'err-storage-1' : sid === 'storage-2' ? 'err-storage-2' : sid === 'storage-contact' ? 'err-storage-contact' : sid === 'clear-1' ? 'err-clear-1' : sid === 'clear-2' ? 'err-clear-2' : sid === 'clear-contact' ? 'err-clear-contact' : sid === 'comm-1' ? 'err-comm-1' : sid === 'comm-2' ? 'err-comm-2' : sid === 'comm-contact' ? 'err-comm-contact' : sid === 'student-1' ? 'err-student-1' : 'err-' + sid;
        const err = document.getElementById(eid);
        if (err) err.classList.add('hidden');
      }
    });
  });

  /* ── SERVICE CARD AUTO-ADVANCE ── */
  form.querySelectorAll('.service-select-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateStepFlow();
      updateProgress();
      if (currentStepIndex === 0) {
        setTimeout(() => { if (validate(1)) setStep(1); scrollToForm(); }, 400);
      }
    });
  });

  /* ── FURNITURE: ADD EXTRA STOP ── */
  let extraStopCount = 0;
  const addExtraStopBtn = document.getElementById('addExtraStopBtn');
  const extraStopsContainer = document.getElementById('furnitureExtraStops');

  if (addExtraStopBtn && extraStopsContainer) {
    addExtraStopBtn.addEventListener('click', () => {
      extraStopCount++;
      const stopId = extraStopCount;
      const section = document.createElement('div');
      section.className = 'move-details__section extra-stop-section';
      section.setAttribute('data-stop-id', stopId);
      section.innerHTML = `
        <div class="extra-stop-section__header">
          <div class="extra-stop-section__title">
            <span class="move-details__section-icon">📍</span>
            Extra Stop ${stopId}
          </div>
          <button type="button" class="extra-stop-section__remove" title="Remove stop">✕</button>
        </div>
        <div class="move-details__fields">
          <div class="form-field">
            <label class="form-label">Enter postcode or address</label>
            <input type="text" class="form-input extra-stop-address" placeholder="e.g. B1 1AA or 10 Downing Street" autocomplete="off" />
          </div>
          <div class="form-field">
            <label class="form-label">Select floor</label>
            <select class="form-input form-select extra-stop-floor">
              <option value="" disabled selected>Select floor</option>
              <option value="Basement">Basement</option>
              <option value="Ground floor">Ground floor</option>
              <option value="Ground and 1st floor">Ground and 1st floor</option>
              <option value="1st floor">1st floor</option>
              <option value="2nd floor">2nd floor</option>
              <option value="3rd floor">3rd floor</option>
              <option value="4th floor">4th floor</option>
              <option value="5th floor">5th floor</option>
              <option value="6th floor">6th floor</option>
              <option value="Above 6th floor">Above 6th floor</option>
            </select>
          </div>
        </div>
        <label class="lift-checkbox hidden extra-stop-lift-wrap">
          <input type="checkbox" class="extra-stop-lift" />
          <span class="lift-checkbox__label">Lift Available</span>
        </label>
      `;
      extraStopsContainer.appendChild(section);

      // Init autocomplete on the new address field
      const newInput = section.querySelector('.extra-stop-address');
      initPostcodeAutocomplete(newInput);

      // Remove button
      section.querySelector('.extra-stop-section__remove').addEventListener('click', () => {
        section.remove();
      });

      // Lift checkbox toggle for extra stop
      const floorSel = section.querySelector('.extra-stop-floor');
      const liftWrap = section.querySelector('.extra-stop-lift-wrap');
      if (floorSel && liftWrap) {
        floorSel.addEventListener('change', () => {
          const val = floorSel.value;
          if (val && val !== 'Ground floor') {
            liftWrap.classList.remove('hidden');
          } else {
            liftWrap.classList.add('hidden');
            const cb = liftWrap.querySelector('input[type="checkbox"]');
            if (cb) cb.checked = false;
          }
        });
      }
    });
  }

  /* ── MOVE DATE TOGGLE (House Removals) ── */
  const moveDateField = document.getElementById('moveDateField');
  const moveDateConfirm = document.getElementById('moveDateConfirm');
  const moveDateText = document.getElementById('moveDateText');
  const moveDateInput = document.getElementById('moveDate');

  if (moveDateInput) {
    moveDateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  }

  form.querySelectorAll('input[name="dateChoice"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'hasDate') { 
        if (moveDateField) moveDateField.style.display = ''; 
        if (moveDateInput) {
          setTimeout(() => {
            try { moveDateInput.focus(); moveDateInput.showPicker(); } catch(e){}
          }, 50);
        }
      }
      else { 
        if (moveDateField) moveDateField.style.display = 'none'; 
        if (moveDateConfirm) moveDateConfirm.classList.add('hidden'); 
      }
    });
  });

  if (moveDateInput) {
    moveDateInput.addEventListener('change', () => {
      if (moveDateInput.value && moveDateConfirm && moveDateText) {
        const d = new Date(moveDateInput.value + 'T00:00:00');
        const day = d.getDate();
        const sfx = [1,21,31].includes(day) ? 'st' : [2,22].includes(day) ? 'nd' : [3,23].includes(day) ? 'rd' : 'th';
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        moveDateText.textContent = day + sfx + ' ' + months[d.getMonth()];
        moveDateConfirm.classList.remove('hidden');
      }
    });
  }

  /* ════════════════════════════════════════════
     INVENTORY SYSTEM (Step 3 — House Removals)
  ════════════════════════════════════════════ */
  const inventory = {};
  const PRESET_1BED = {
    'double-bed': { name: 'Double Bed & Mattress', qty: 1 },
    'single-wardrobe': { name: 'Single Wardrobe', qty: 1 },
    'chest-of-drawers': { name: 'Chest Of Drawers', qty: 1 },
    'bedside-table': { name: 'Bedside Table', qty: 2 },
    'two-seater-sofa': { name: 'Two Seater Sofa', qty: 1 },
    'coffee-table': { name: 'Coffee Table', qty: 1 },
    'small-tv': { name: 'Small Television TV (Less than 30")', qty: 1 },
    'tv-stand': { name: 'TV Stand', qty: 1 },
    'bookcase': { name: 'Bookcase', qty: 1 },
    'fridge-freezer': { name: 'Fridge Freezer', qty: 1 },
    'washing-machine': { name: 'Washing Machine', qty: 1 },
    'microwave-oven': { name: 'Microwave Oven', qty: 1 },
    'kitchen-table': { name: 'Kitchen Table', qty: 1 },
    'small-box': { name: 'Small Box', qty: 5 },
    'medium-box': { name: 'Medium Box', qty: 5 },
    'large-box': { name: 'Large Box', qty: 3 },
  };

  function getTotalInventoryCount() { return Object.values(inventory).reduce((sum, item) => sum + item.qty, 0); }
  function updateInventoryCount() { const c = document.getElementById('inventoryCount'); if (c) c.textContent = getTotalInventoryCount(); }

  function updateItemUI(itemId) {
    const itemEl = document.querySelector(`.inventory-item[data-item="${itemId}"]`);
    if (!itemEl) return;
    const ctl = itemEl.querySelector('.inventory-item__controls');
    const info = inventory[itemId];
    if (info && info.qty > 0) {
      itemEl.classList.add('has-qty');
      ctl.innerHTML = `<button type="button" class="inventory-item__edit" title="Edit">✏️</button>
        <div class="inventory-item__qty-wrap">
          <button type="button" class="inventory-item__qty-btn" data-action="decrease">−</button>
          <input type="number" class="inventory-item__qty-input" value="${info.qty}" min="0" max="99" />
          <button type="button" class="inventory-item__qty-btn" data-action="increase">+</button>
        </div>`;
      ctl.querySelector('[data-action="decrease"]').addEventListener('click', () => {
        const q = Math.max(0, (inventory[itemId]?.qty || 1) - 1);
        if (q === 0) delete inventory[itemId]; else inventory[itemId].qty = q;
        updateItemUI(itemId); updateInventoryCount(); updateInventorySummary();
      });
      ctl.querySelector('[data-action="increase"]').addEventListener('click', () => {
        inventory[itemId].qty = Math.min(99, (inventory[itemId]?.qty || 0) + 1);
        updateItemUI(itemId); updateInventoryCount(); updateInventorySummary();
      });
      ctl.querySelector('.inventory-item__qty-input').addEventListener('change', (e) => {
        let v = parseInt(e.target.value, 10); if (isNaN(v) || v < 0) v = 0; if (v > 99) v = 99;
        if (v === 0) delete inventory[itemId]; else inventory[itemId].qty = v;
        updateItemUI(itemId); updateInventoryCount(); updateInventorySummary();
      });
    } else {
      itemEl.classList.remove('has-qty');
      ctl.innerHTML = `<button type="button" class="inventory-item__add" title="Add item">＋</button>`;
      ctl.querySelector('.inventory-item__add').addEventListener('click', () => addItem(itemId));
    }
  }

  function addItem(itemId) {
    if (inventory[itemId]) { inventory[itemId].qty += 1; }
    else {
      const el = document.querySelector(`.inventory-item[data-item="${itemId}"]`);
      inventory[itemId] = { name: el ? el.querySelector('.inventory-item__name').textContent.trim() : itemId, qty: 1 };
    }
    updateItemUI(itemId); updateInventoryCount(); updateInventorySummary();
  }

  function updateInventorySummary() {
    const list = document.getElementById('inventorySummaryList');
    if (!list) return;
    const items = Object.entries(inventory).filter(([,v]) => v.qty > 0);
    list.innerHTML = items.length === 0
      ? '<div class="inventory-summary-item" style="color:var(--mid-grey);font-style:italic;">No items added yet</div>'
      : items.map(([,info]) => `<div class="inventory-summary-item"><span>${info.name}</span><span class="inventory-summary-item__qty">×${info.qty}</span></div>`).join('');
  }

  document.querySelectorAll('.inventory-room-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const room = tab.getAttribute('data-room');
      document.querySelectorAll('.inventory-room-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.inventory-panel').forEach(p => p.classList.remove('active'));
      const panel = document.querySelector(`.inventory-panel[data-room-panel="${room}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  document.querySelectorAll('.inventory-item__add').forEach(btn => {
    btn.addEventListener('click', () => addItem(btn.closest('.inventory-item').getAttribute('data-item')));
  });

  const presetToggleInput = document.getElementById('presetToggleInput');
  if (presetToggleInput) {
    presetToggleInput.addEventListener('change', () => {
      if (presetToggleInput.checked) {
        Object.entries(PRESET_1BED).forEach(([id, info]) => { inventory[id] = { name: info.name, qty: info.qty }; updateItemUI(id); });
      } else {
        Object.keys(PRESET_1BED).forEach(id => { delete inventory[id]; updateItemUI(id); });
      }
      updateInventoryCount(); updateInventorySummary();
    });
  }

  const summaryEl = document.getElementById('inventorySummary');
  if (summaryEl) {
    const hdr = summaryEl.querySelector('.inventory-summary__header');
    if (hdr) hdr.addEventListener('click', () => summaryEl.classList.toggle('open'));
  }

  const inventorySearchInput = document.getElementById('inventorySearch');
  const inventorySearchResults = document.getElementById('inventorySearchResults');
  if (inventorySearchInput && inventorySearchResults) {
    const allItems = [];
    document.querySelectorAll('.inventory-item').forEach(el => {
      allItems.push({ id: el.getAttribute('data-item'), name: el.querySelector('.inventory-item__name').textContent.trim() });
    });
    inventorySearchInput.addEventListener('input', () => {
      const q = inventorySearchInput.value.trim().toLowerCase();
      if (q.length < 2) { inventorySearchResults.classList.add('hidden'); return; }
      const matches = allItems.filter(i => i.name.toLowerCase().includes(q)).slice(0, 8);
      if (!matches.length) { inventorySearchResults.classList.add('hidden'); return; }
      inventorySearchResults.innerHTML = matches.map(i =>
        `<div class="inventory-search-result" data-search-item="${i.id}"><span>${i.name}</span><span class="inventory-search-result__add">+</span></div>`
      ).join('');
      inventorySearchResults.classList.remove('hidden');
      inventorySearchResults.querySelectorAll('.inventory-search-result').forEach(r => {
        r.addEventListener('click', () => {
          const id = r.getAttribute('data-search-item');
          addItem(id);
          inventorySearchInput.value = '';
          inventorySearchResults.classList.add('hidden');
          const itemEl = document.querySelector(`.inventory-item[data-item="${id}"]`);
          if (itemEl) {
            const panel = itemEl.closest('.inventory-panel');
            if (panel) {
              const room = panel.getAttribute('data-room-panel');
              document.querySelectorAll('.inventory-room-tab').forEach(t => t.classList.remove('active'));
              document.querySelectorAll('.inventory-panel').forEach(p => p.classList.remove('active'));
              const tab = document.querySelector(`.inventory-room-tab[data-room="${room}"]`);
              if (tab) tab.classList.add('active');
              panel.classList.add('active');
              itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
      });
    });
    document.addEventListener('click', (e) => {
      if (!inventorySearchInput.contains(e.target) && !inventorySearchResults.contains(e.target))
        inventorySearchResults.classList.add('hidden');
    });
  }

  const pickupPropertySelect = document.getElementById('pickupPropertyType');
  const deliveryPropertySelect = document.getElementById('deliveryPropertyType');

  /* ── Show/hide floor+lift based on property type (House Removals) ── */
  function setupPropertyFloorLift(propSelect, floorLiftWrapId) {
    if (!propSelect) return;
    const wrap = document.getElementById(floorLiftWrapId);
    if (!wrap) return;
    propSelect.addEventListener('change', () => {
      const val = propSelect.value;
      // Storage units don't need floor/lift info
      if (val === 'Storage') {
        wrap.style.display = 'none';
        const sel = wrap.querySelector('select');
        if (sel) { sel.selectedIndex = 0; }
        const cb = wrap.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = false;
        const liftWrap = wrap.querySelector('.lift-checkbox');
        if (liftWrap) liftWrap.classList.add('hidden');
      } else {
        wrap.style.display = '';
      }
    });
  }
  setupPropertyFloorLift(pickupPropertySelect, 'pickupFloorLiftWrap');
  setupPropertyFloorLift(deliveryPropertySelect, 'deliveryFloorLiftWrap');

  /* ── Show/hide lift checkbox based on floor selection ── */
  function setupFloorLiftToggle(floorSelectId, liftWrapId) {
    const floorSelect = document.getElementById(floorSelectId);
    const liftWrap = document.getElementById(liftWrapId);
    if (!floorSelect || !liftWrap) return;
    floorSelect.addEventListener('change', () => {
      const val = floorSelect.value;
      // Only show lift for upper floors (not ground floor or basement)
      if (val && val !== 'Ground floor') {
        liftWrap.classList.remove('hidden');
      } else {
        liftWrap.classList.add('hidden');
        const cb = liftWrap.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = false;
      }
    });
  }
  // House removals
  setupFloorLiftToggle('pickupFloor', 'pickupLiftCheckWrap');
  setupFloorLiftToggle('deliveryFloor', 'deliveryLiftCheckWrap');
  // Furniture
  setupFloorLiftToggle('furniturePickupFloor', 'furniturePickupLiftCheckWrap');
  setupFloorLiftToggle('furnitureDeliveryFloor', 'furnitureDeliveryLiftCheckWrap');
  // Piano
  setupFloorLiftToggle('pianoPickupFloor', 'pianoPickupLiftCheckWrap');
  setupFloorLiftToggle('pianoDeliveryFloor', 'pianoDeliveryLiftCheckWrap');
  // Office
  setupFloorLiftToggle('officePickupFloor', 'officePickupLiftCheckWrap');
  setupFloorLiftToggle('officeDeliveryFloor', 'officeDeliveryLiftCheckWrap');
  // Packing
  setupFloorLiftToggle('packingPickupFloor', 'packingPickupLiftCheckWrap');
  setupFloorLiftToggle('packingDeliveryFloor', 'packingDeliveryLiftCheckWrap');
  // Equipment
  setupFloorLiftToggle('equipPickupFloor', 'equipPickupLiftCheckWrap');
  setupFloorLiftToggle('equipDeliveryFloor', 'equipDeliveryLiftCheckWrap');
  // Storage
  setupFloorLiftToggle('storagePickupFloor', 'storagePickupLiftCheckWrap');
  setupFloorLiftToggle('storageDeliveryFloor', 'storageDeliveryLiftCheckWrap');
  // Clearance
  setupFloorLiftToggle('clearPickupFloor', 'clearPickupLiftCheckWrap');
  setupFloorLiftToggle('clearDeliveryFloor', 'clearDeliveryLiftCheckWrap');
  // Commercial
  setupFloorLiftToggle('commPickupFloor', 'commPickupLiftCheckWrap');
  setupFloorLiftToggle('commDeliveryFloor', 'commDeliveryLiftCheckWrap');

  if (pickupPropertySelect) {
    pickupPropertySelect.addEventListener('change', () => {
      const label = document.querySelector('.inventory-toggle__label');
      if (label && pickupPropertySelect.value) label.innerHTML = `Prefer to use our <strong>${pickupPropertySelect.value}</strong> inventory list?`;
    });
  }

  /* ════════════════════════════════════════════
     FURNITURE INVENTORY SYSTEM (Step 3 — Furniture)
  ════════════════════════════════════════════ */
  const furnitureAddedItems = {};
  const FURNITURE_CATEGORIES = [
    {
      id: 'sofas', name: 'Sofas', icon: '🛋️',
      items: ['Two Seater Sofa', 'Three Seater Sofa', 'Four Seater Sofa', 'L Shaped Sofa', 'Two Seater Reclining Sofa', 'Three Seater Reclining Sofa', 'Two Seater Sofa Bed', 'Three Seater Sofa Bed', 'Corner Sofa Bed']
    },
    {
      id: 'wardrobes', name: 'Wardrobes', icon: '🚪',
      items: ['Double Wardrobe', 'Single Wardrobe', 'Triple Wardrobe', 'Chest Of Drawers', 'Bookcase', 'Shelf', 'Flat Packed Wardrobe']
    },
    {
      id: 'boxes_bags', name: 'Boxes & Bags', icon: '📦',
      items: [{ n: 'Large Box', d: 'Approx. 50x50x50 cm' }, { n: 'Medium Box', d: 'Approx. 45x45x35 cm' }, { n: 'Small Box', d: 'Approx. 40x30x30 cm' }, { n: 'Large Bag' }, { n: 'Small Bag' }, { n: 'Suitcase' }, { n: 'Box Of Clothes' }]
    },
    {
      id: 'beds_mattresses', name: 'Beds & Mattresses', icon: '🛏️',
      items: ['Double Bed & Mattress', 'Kingsize Bed & Mattress', 'Single Bed & Mattress', 'Double Bed Frame', 'Kingsize Bed Frame', 'Single Bed Frame', 'Bunk Bed', 'Sofa Bed', 'Double Mattress', 'Kingsize Mattress', 'Single Mattress']
    },
    {
      id: 'tables', name: 'Tables', icon: '🍽️',
      items: ['Coffee Table', '4 Seater Dining Table & Chairs', '6 Seater Dining Table & Chairs', '4 Seater Dining Table', '6 Seater Dining Table', 'Office Desk', 'Bedside Table', 'Garden Table', 'Dressing Table', 'Small Desk']
    },
    {
      id: 'televisions', name: 'Televisions', icon: '📺',
      items: ['Large Television/TV (Greater than 40")', 'Medium Television/TV (30" to 40")', 'Small Television/TV (Less than 30")', 'TV Stand']
    },
    {
      id: 'appliances', name: 'Appliances', icon: '🧊',
      items: ['Fridge', 'Fridge Freezer', 'Tumble Dryer', 'Washing Machine']
    },
    {
      id: 'chairs', name: 'Chairs', icon: '🪑',
      items: ['Armchair', 'Office Chair', 'Dining Chair', 'Garden Chair', 'Desk Chair', 'Folding Chair', 'Rocking Chair', 'Sofa Chair']
    }
  ];

  function renderFurnitureApp() {
    const appEl = document.getElementById('furnitureInventoryApp');
    if (!appEl) return;
    
    let catsHtml = '';
    FURNITURE_CATEGORIES.forEach(cat => {
      const itemsHtml = cat.items.map(item => {
        const n = typeof item === 'string' ? item : item.n;
        const d = (typeof item === 'object' && item.d) ? `<span class="furniture-item-desc">${item.d}</span>` : '';
        return `<div class="furniture-item" data-fname="${n}">
                  <div>${n}${d}</div>
                  <div class="furniture-item-add" data-action="fadd" data-fname="${n}">+add</div>
                </div>`;
      }).join('');
      catsHtml += `
        <div class="furniture-category" data-fcat="${cat.id}">
          <button type="button" class="furniture-cat-btn">
            <span class="furniture-cat-icon">${cat.icon} ${cat.name}</span>
            <span>⋁</span>
          </button>
          <div class="furniture-cat-dropdown">${itemsHtml}</div>
        </div>`;
    });
    
    catsHtml += `
      <div class="furniture-category" data-fcat="custom">
        <button type="button" class="furniture-cat-btn">
          <span class="furniture-cat-icon">⊕ Add your own item</span>
          <span>⋁</span>
        </button>
        <div class="furniture-cat-dropdown">
          <div class="furniture-custom-item">
            <input type="text" id="fCustomName" class="form-input" placeholder="Item name..." autocomplete="off" />
            <button type="button" class="btn btn--gold" id="btnFCustomAdd">Add Item</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = `
      <div class="search-input-wrapper">
         <span class="search-icon">🔍</span>
         <input type="text" id="furnitureItemSearch" class="form-input" placeholder="Search for your item(s) e.g. Sofa" autocomplete="off" />
      </div>
      <div class="furniture-search-results hidden" id="furnitureSearchResults"></div>
      
      <p class="mb-sm text-mid">Or quickly add from our list of popular items below:</p>
      <div class="furniture-categories-grid">${catsHtml}</div>
      <div class="furniture-summary" id="furnitureSummaryApp" style="display:none;">
         <h4 class="furniture-summary__title">Your Items (<span id="furnitureTotalCount">0</span>)</h4>
         <div class="furniture-summary__list" id="furnitureSummaryListApp"></div>
      </div>
    `;
    
    bindFurnitureEvents();
  }

  function renderFurnitureSummary() {
    const listEl = document.getElementById('furnitureSummaryListApp');
    const wrapEl = document.getElementById('furnitureSummaryApp');
    const cntEl = document.getElementById('furnitureTotalCount');
    if (!listEl || !wrapEl || !cntEl) return;
    
    let total = 0; let html = '';
    Object.entries(furnitureAddedItems).forEach(([name, qty]) => {
      if (qty > 0) {
        total += qty;
        html += `
          <div class="furniture-summary-item">
            <span>${name}</span>
            <div class="inventory-item__qty-wrap">
              <button type="button" class="inventory-item__qty-btn" data-action="fdec" data-fname="${name}">−</button>
              <input type="number" class="inventory-item__qty-input" value="${qty}" readonly />
              <button type="button" class="inventory-item__qty-btn" data-action="finc" data-fname="${name}">+</button>
            </div>
          </div>
        `;
      }
    });
    listEl.innerHTML = html;
    cntEl.textContent = total;
    wrapEl.style.display = total > 0 ? 'block' : 'none';
  }

  function modifyFurnitureItem(name, delta) {
    if (!furnitureAddedItems[name]) furnitureAddedItems[name] = 0;
    furnitureAddedItems[name] += delta;
    if (furnitureAddedItems[name] <= 0) delete furnitureAddedItems[name];
    renderFurnitureSummary();
  }

  function bindFurnitureEvents() {
    document.querySelectorAll('.furniture-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.parentElement;
        const isOpen = cat.classList.contains('open');
        document.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        if (!isOpen) cat.classList.add('open');
      });
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.furniture-category')) {
        document.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
      }
    });

    document.getElementById('furnitureInventoryApp').addEventListener('click', (e) => {
      if (e.target.getAttribute('data-action') === 'fadd') {
        modifyFurnitureItem(e.target.getAttribute('data-fname'), 1);
        const oldText = e.target.textContent; e.target.textContent = '✓';
        setTimeout(() => e.target.textContent = oldText, 800);
      }
      else if (e.target.getAttribute('data-action') === 'fdec') modifyFurnitureItem(e.target.getAttribute('data-fname'), -1);
      else if (e.target.getAttribute('data-action') === 'finc') modifyFurnitureItem(e.target.getAttribute('data-fname'), 1);
    });

    const btnCustom = document.getElementById('btnFCustomAdd');
    const inputCustom = document.getElementById('fCustomName');
    if (btnCustom && inputCustom) {
      btnCustom.addEventListener('click', () => {
        const val = inputCustom.value.trim();
        if (val) {
          modifyFurnitureItem(val, 1);
          inputCustom.value = '';
          document.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        }
      });
    }

    const searchInput = document.getElementById('furnitureItemSearch');
    const searchResults = document.getElementById('furnitureSearchResults');
    if (searchInput && searchResults) {
      const allItems = [];
      FURNITURE_CATEGORIES.forEach(c => c.items.forEach(i => allItems.push(typeof i === 'string' ? i : i.n)));
      
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.classList.add('hidden'); return; }
        const matches = allItems.filter(item => item.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) { searchResults.classList.add('hidden'); return; }
        searchResults.innerHTML = matches.map(item => 
           `<div class="furniture-item" style="cursor:pointer;" data-action="fadd" data-fname="${item}">
              ${item} <span class="furniture-item-add" style="pointer-events:none;">+add</span>
            </div>`
        ).join('');
        searchResults.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-wrapper') && !e.target.closest('.furniture-search-results')) {
          searchResults.classList.add('hidden');
        }
      });
    }
  }

  /* ════════════════════════════════════════════
     OFFICE INVENTORY SYSTEM (Office Removals)
  ════════════════════════════════════════════ */
  const officeAddedItems = {};
  const OFFICE_CATEGORIES = [
    {
      id: 'office_furniture', name: 'Furniture', icon: '🛋️',
      items: ['Two Seater Sofa', 'Three Seater Sofa', 'Armchair', 'Coffee Table', 'Bookcase', 'Shelf Unit', 'Side Table', 'Reception Desk', 'Reception Chair', 'Waiting Room Chair']
    },
    {
      id: 'office_storage', name: 'Storage', icon: '🗄️',
      items: ['Filing Cabinet (2 Drawer)', 'Filing Cabinet (3 Drawer)', 'Filing Cabinet (4 Drawer)', 'Safe', 'Storage Cupboard', 'Locker', 'Archive Box', 'Plan Chest']
    },
    {
      id: 'office_equipment', name: 'Office Equipment', icon: '🖥️',
      items: ['Office Desk', 'Office Chair', 'Pedestal Desk', 'Corner Desk', 'Corner Desk With Pedestal', 'Standing Desk', 'Standing Desk - Electric', 'Stacking Chair', 'Board Room Table', 'Monitor', 'Computer / PC', 'Printer', 'Scanner', 'Shredder', 'Server Rack', 'Phone System', 'Whiteboard', 'Projector']
    },
    {
      id: 'office_kitchen', name: 'Kitchen', icon: '🍳',
      items: ['Fridge', 'Microwave', 'Kettle', 'Toaster', 'Water Cooler', 'Coffee Machine', 'Dishwasher', 'Bin']
    },
    {
      id: 'office_boxes', name: 'Boxes & Packaging', icon: '📦',
      items: ['Small Box', 'Medium Box', 'Large Box', 'Crate', 'IT Equipment Box', 'Wardrobe Box', 'Bubble Wrap Roll', 'Packing Tape Roll']
    }
  ];

  function renderOfficeApp() {
    const appEl = document.getElementById('officeInventoryApp');
    if (!appEl) return;

    let catsHtml = '';
    OFFICE_CATEGORIES.forEach(cat => {
      const itemsHtml = cat.items.map(item => {
        return `<div class="furniture-item" data-oname="${item}">
                  <div>${item}</div>
                  <div class="furniture-item-add" data-action="oadd" data-oname="${item}">+add</div>
                </div>`;
      }).join('');
      catsHtml += `
        <div class="furniture-category" data-ocat="${cat.id}">
          <button type="button" class="furniture-cat-btn">
            <span class="furniture-cat-icon">${cat.icon} ${cat.name}</span>
            <span>⋁</span>
          </button>
          <div class="furniture-cat-dropdown">${itemsHtml}</div>
        </div>`;
    });

    catsHtml += `
      <div class="furniture-category" data-ocat="custom">
        <button type="button" class="furniture-cat-btn">
          <span class="furniture-cat-icon">⊕ Add your own item</span>
          <span>⋁</span>
        </button>
        <div class="furniture-cat-dropdown">
          <div class="furniture-custom-item">
            <input type="text" id="oCustomName" class="form-input" placeholder="Item name..." autocomplete="off" />
            <button type="button" class="btn btn--gold" id="btnOCustomAdd">Add Item</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = `
      <div class="search-input-wrapper">
         <span class="search-icon">🔍</span>
         <input type="text" id="officeItemSearch" class="form-input" placeholder="Search for your item(s) e.g. Desk" autocomplete="off" />
      </div>
      <div class="furniture-search-results hidden" id="officeSearchResults"></div>
      
      <p class="mb-sm text-mid">Or quickly add from our list of popular items below:</p>
      <div class="furniture-categories-grid">${catsHtml}</div>
      <div class="furniture-summary" id="officeSummaryApp" style="display:none;">
         <h4 class="furniture-summary__title">Your Items (<span id="officeTotalCount">0</span>)</h4>
         <div class="furniture-summary__list" id="officeSummaryListApp"></div>
      </div>
    `;

    bindOfficeEvents();
  }

  function renderOfficeSummary() {
    const listEl = document.getElementById('officeSummaryListApp');
    const wrapEl = document.getElementById('officeSummaryApp');
    const cntEl = document.getElementById('officeTotalCount');
    if (!listEl || !wrapEl || !cntEl) return;

    let total = 0; let html = '';
    Object.entries(officeAddedItems).forEach(([name, qty]) => {
      if (qty > 0) {
        total += qty;
        html += `
          <div class="furniture-summary-item">
            <span>${name}</span>
            <div class="inventory-item__qty-wrap">
              <button type="button" class="inventory-item__qty-btn" data-action="odec" data-oname="${name}">−</button>
              <input type="number" class="inventory-item__qty-input" value="${qty}" readonly />
              <button type="button" class="inventory-item__qty-btn" data-action="oinc" data-oname="${name}">+</button>
            </div>
          </div>
        `;
      }
    });
    listEl.innerHTML = html;
    cntEl.textContent = total;
    wrapEl.style.display = total > 0 ? 'block' : 'none';
  }

  function modifyOfficeItem(name, delta) {
    if (!officeAddedItems[name]) officeAddedItems[name] = 0;
    officeAddedItems[name] += delta;
    if (officeAddedItems[name] <= 0) delete officeAddedItems[name];
    renderOfficeSummary();
  }

  function bindOfficeEvents() {
    const appEl = document.getElementById('officeInventoryApp');
    if (!appEl) return;

    appEl.querySelectorAll('.furniture-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.parentElement;
        const isOpen = cat.classList.contains('open');
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        if (!isOpen) cat.classList.add('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#officeInventoryApp .furniture-category')) {
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
      }
    });

    appEl.addEventListener('click', (e) => {
      if (e.target.getAttribute('data-action') === 'oadd') {
        modifyOfficeItem(e.target.getAttribute('data-oname'), 1);
        const oldText = e.target.textContent; e.target.textContent = '✓';
        setTimeout(() => e.target.textContent = oldText, 800);
      }
      else if (e.target.getAttribute('data-action') === 'odec') modifyOfficeItem(e.target.getAttribute('data-oname'), -1);
      else if (e.target.getAttribute('data-action') === 'oinc') modifyOfficeItem(e.target.getAttribute('data-oname'), 1);
    });

    const btnCustom = document.getElementById('btnOCustomAdd');
    const inputCustom = document.getElementById('oCustomName');
    if (btnCustom && inputCustom) {
      btnCustom.addEventListener('click', () => {
        const val = inputCustom.value.trim();
        if (val) {
          modifyOfficeItem(val, 1);
          inputCustom.value = '';
          appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        }
      });
    }

    const searchInput = document.getElementById('officeItemSearch');
    const searchResults = document.getElementById('officeSearchResults');
    if (searchInput && searchResults) {
      const allItems = [];
      OFFICE_CATEGORIES.forEach(c => c.items.forEach(i => allItems.push(i)));

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.classList.add('hidden'); return; }
        const matches = allItems.filter(item => item.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) { searchResults.classList.add('hidden'); return; }
        searchResults.innerHTML = matches.map(item =>
           `<div class="furniture-item" style="cursor:pointer;" data-action="oadd" data-oname="${item}">
              ${item} <span class="furniture-item-add" style="pointer-events:none;">+add</span>
            </div>`
        ).join('');
        searchResults.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#officeInventoryApp .search-input-wrapper') && !e.target.closest('#officeSearchResults')) {
          searchResults.classList.add('hidden');
        }
      });
    }
  }

  /* ════════════════════════════════════════════
     PACKING INVENTORY SYSTEM (Packing Services)
  ════════════════════════════════════════════ */
  const packingAddedItems = {};
  const PACKING_CATEGORIES = [
    {
      id: 'pack_sofas', name: 'Sofas', icon: '🛋️',
      items: ['2 Seater Sofa', '3 Seater Sofa', '4 Seater Sofa', 'Corner Sofa', 'Sofa Bed', 'Recliner Sofa', 'Chaise Longue', 'Futon', 'Loveseat']
    },
    {
      id: 'pack_wardrobes', name: 'Wardrobes', icon: '🚪',
      items: ['Single Wardrobe', 'Double Wardrobe', 'Triple Wardrobe', 'Sliding Door Wardrobe', 'Fitted Wardrobe', 'Chest of Drawers (Small)', 'Chest of Drawers (Large)', 'Bedside Table', 'Dressing Table']
    },
    {
      id: 'pack_boxes', name: 'Boxes & Bags', icon: '📦',
      items: ['Small Box', 'Medium Box', 'Large Box', 'Extra Large Box', 'Wardrobe Box', 'Suitcase (Small)', 'Suitcase (Large)', 'Bin Bag', 'Holdall / Duffel Bag', 'Rucksack']
    },
    {
      id: 'pack_beds', name: 'Beds & Mattresses', icon: '🛏️',
      items: ['Single Bed Frame', 'Double Bed Frame', 'King Size Bed Frame', 'Super King Bed Frame', 'Bunk Bed', 'Single Mattress', 'Double Mattress', 'King Size Mattress', 'Super King Mattress', 'Cot / Cot Bed']
    },
    {
      id: 'pack_tables', name: 'Tables', icon: '🍽️',
      items: ['Small Dining Table', 'Large Dining Table', 'Coffee Table', 'Side Table', 'Console Table', 'Desk', 'Folding Table', 'Nest of Tables', 'TV Stand']
    },
    {
      id: 'pack_tvs', name: 'Televisions', icon: '📺',
      items: ['TV (up to 32")', 'TV (32"-50")', 'TV (50"-65")', 'TV (65"+)', 'TV Stand / Unit', 'Soundbar', 'Home Cinema System']
    },
    {
      id: 'pack_appliances', name: 'Appliances', icon: '🏠',
      items: ['Washing Machine', 'Tumble Dryer', 'Dishwasher', 'Fridge', 'Freezer', 'Fridge Freezer', 'Cooker / Oven', 'Microwave', 'Vacuum Cleaner', 'Iron & Ironing Board']
    },
    {
      id: 'pack_chairs', name: 'Chairs', icon: '🪑',
      items: ['Armchair', 'Dining Chair', 'Office Chair', 'Rocking Chair', 'Bean Bag', 'Stool', 'Bench', 'High Chair']
    }
  ];

  function renderPackingApp() {
    const appEl = document.getElementById('packingInventoryApp');
    if (!appEl) return;

    let catsHtml = '';
    PACKING_CATEGORIES.forEach(cat => {
      const itemsHtml = cat.items.map(item => {
        return `<div class="furniture-item" data-pname="${item}">
                  <div>${item}</div>
                  <div class="furniture-item-add" data-action="padd" data-pname="${item}">+add</div>
                </div>`;
      }).join('');
      catsHtml += `
        <div class="furniture-category" data-pcat="${cat.id}">
          <button type="button" class="furniture-cat-btn">
            <span class="furniture-cat-icon">${cat.icon} ${cat.name}</span>
            <span>⋁</span>
          </button>
          <div class="furniture-cat-dropdown">${itemsHtml}</div>
        </div>`;
    });

    catsHtml += `
      <div class="furniture-category" data-pcat="custom">
        <button type="button" class="furniture-cat-btn">
          <span class="furniture-cat-icon">⊕ Add your own item</span>
          <span>⋁</span>
        </button>
        <div class="furniture-cat-dropdown">
          <div class="furniture-custom-item">
            <input type="text" id="pCustomName" class="form-input" placeholder="Item name..." autocomplete="off" />
            <button type="button" class="btn btn--gold" id="btnPCustomAdd">Add Item</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = `
      <div class="search-input-wrapper">
         <span class="search-icon">🔍</span>
         <input type="text" id="packingItemSearch" class="form-input" placeholder="Search for your item(s) e.g. Sofa" autocomplete="off" />
      </div>
      <div class="furniture-search-results hidden" id="packingSearchResults"></div>
      
      <p class="mb-sm text-mid">Or quickly add from our list of popular items below:</p>
      <div class="furniture-categories-grid">${catsHtml}</div>
      <div class="furniture-summary" id="packingSummaryApp" style="display:none;">
         <h4 class="furniture-summary__title">Your Items (<span id="packingTotalCount">0</span>)</h4>
         <div class="furniture-summary__list" id="packingSummaryListApp"></div>
      </div>
    `;

    bindPackingEvents();
  }

  function renderPackingSummary() {
    const listEl = document.getElementById('packingSummaryListApp');
    const wrapEl = document.getElementById('packingSummaryApp');
    const cntEl = document.getElementById('packingTotalCount');
    if (!listEl || !wrapEl || !cntEl) return;

    let total = 0; let html = '';
    Object.entries(packingAddedItems).forEach(([name, qty]) => {
      if (qty > 0) {
        total += qty;
        html += `
          <div class="furniture-summary-item">
            <span>${name}</span>
            <div class="inventory-item__qty-wrap">
              <button type="button" class="inventory-item__qty-btn" data-action="pdec" data-pname="${name}">−</button>
              <input type="number" class="inventory-item__qty-input" value="${qty}" readonly />
              <button type="button" class="inventory-item__qty-btn" data-action="pinc" data-pname="${name}">+</button>
            </div>
          </div>
        `;
      }
    });
    listEl.innerHTML = html;
    cntEl.textContent = total;
    wrapEl.style.display = total > 0 ? 'block' : 'none';
  }

  function modifyPackingItem(name, delta) {
    if (!packingAddedItems[name]) packingAddedItems[name] = 0;
    packingAddedItems[name] += delta;
    if (packingAddedItems[name] <= 0) delete packingAddedItems[name];
    renderPackingSummary();
  }

  function bindPackingEvents() {
    const appEl = document.getElementById('packingInventoryApp');
    if (!appEl) return;

    appEl.querySelectorAll('.furniture-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.parentElement;
        const isOpen = cat.classList.contains('open');
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        if (!isOpen) cat.classList.add('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#packingInventoryApp .furniture-category')) {
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
      }
    });

    appEl.addEventListener('click', (e) => {
      if (e.target.getAttribute('data-action') === 'padd') {
        modifyPackingItem(e.target.getAttribute('data-pname'), 1);
        const oldText = e.target.textContent; e.target.textContent = '✓';
        setTimeout(() => e.target.textContent = oldText, 800);
      }
      else if (e.target.getAttribute('data-action') === 'pdec') modifyPackingItem(e.target.getAttribute('data-pname'), -1);
      else if (e.target.getAttribute('data-action') === 'pinc') modifyPackingItem(e.target.getAttribute('data-pname'), 1);
    });

    const btnCustom = document.getElementById('btnPCustomAdd');
    const inputCustom = document.getElementById('pCustomName');
    if (btnCustom && inputCustom) {
      btnCustom.addEventListener('click', () => {
        const val = inputCustom.value.trim();
        if (val) {
          modifyPackingItem(val, 1);
          inputCustom.value = '';
          appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        }
      });
    }

    const searchInput = document.getElementById('packingItemSearch');
    const searchResults = document.getElementById('packingSearchResults');
    if (searchInput && searchResults) {
      const allItems = [];
      PACKING_CATEGORIES.forEach(c => c.items.forEach(i => allItems.push(i)));

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.classList.add('hidden'); return; }
        const matches = allItems.filter(item => item.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) { searchResults.classList.add('hidden'); return; }
        searchResults.innerHTML = matches.map(item =>
           `<div class="furniture-item" style="cursor:pointer;" data-action="padd" data-pname="${item}">
              ${item} <span class="furniture-item-add" style="pointer-events:none;">+add</span>
            </div>`
        ).join('');
        searchResults.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#packingInventoryApp .search-input-wrapper') && !e.target.closest('#packingSearchResults')) {
          searchResults.classList.add('hidden');
        }
      });
    }
  }

  /* ════════════════════════════════════════════
     EQUIPMENT INVENTORY SYSTEM (Equipment & Machinery)
  ════════════════════════════════════════════ */
  const equipAddedItems = {};
  const EQUIP_CATEGORIES = [
    {
      id: 'equip_industrial', name: 'Industrial Machinery', icon: '🏭',
      items: ['CNC Machine', 'Lathe', 'Milling Machine', 'Press Machine', 'Conveyor Belt', 'Compressor', 'Generator', 'Pump', 'Welding Machine', 'Industrial Fan']
    },
    {
      id: 'equip_gym', name: 'Gym Equipment', icon: '🏋️',
      items: ['Treadmill', 'Cross Trainer', 'Exercise Bike', 'Rowing Machine', 'Weight Bench', 'Squat Rack', 'Dumbbell Set', 'Cable Machine', 'Smith Machine', 'Leg Press']
    },
    {
      id: 'equip_construction', name: 'Construction Equipment', icon: '🔨',
      items: ['Cement Mixer', 'Scaffolding Set', 'Power Drill', 'Table Saw', 'Jackhammer', 'Wheelbarrow', 'Pressure Washer', 'Tile Cutter', 'Planer', 'Nail Gun']
    },
    {
      id: 'equip_workshop', name: 'Workshop Tools', icon: '🔧',
      items: ['Workbench', 'Tool Cabinet', 'Band Saw', 'Drill Press', 'Bench Grinder', 'Air Compressor', 'Sander', 'Router Table', 'Jigsaw', 'Circular Saw']
    },
    {
      id: 'equip_medical', name: 'Medical Equipment', icon: '🏥',
      items: ['Hospital Bed', 'Examination Table', 'Wheelchair', 'X-Ray Machine', 'Ultrasound Machine', 'Dental Chair', 'Steriliser', 'Patient Monitor', 'Oxygen Tank', 'Defibrillator']
    },
    {
      id: 'equip_catering', name: 'Catering Equipment', icon: '🍳',
      items: ['Commercial Oven', 'Deep Fryer', 'Prep Table (Steel)', 'Commercial Fridge', 'Commercial Freezer', 'Dishwasher (Commercial)', 'Bain-Marie', 'Ice Machine', 'Coffee Machine', 'Display Cabinet']
    },
    {
      id: 'equip_it', name: 'IT & AV Equipment', icon: '🖥️',
      items: ['Server Rack', 'UPS Unit', 'Network Switch', 'Projector', 'PA System', 'Stage Lighting', 'Sound Desk', 'Large Format Printer', 'Plotter', 'CCTV System']
    },
    {
      id: 'equip_warehouse', name: 'Warehouse Equipment', icon: '📦',
      items: ['Pallet Racking', 'Pallet Truck', 'Forklift', 'Shelving Unit (Heavy)', 'Cage Trolley', 'Platform Trolley', 'Packing Bench', 'Roll Cage', 'Picking Trolley', 'Goods Lift']
    }
  ];

  function renderEquipApp() {
    const appEl = document.getElementById('equipInventoryApp');
    if (!appEl) return;

    let catsHtml = '';
    EQUIP_CATEGORIES.forEach(cat => {
      const itemsHtml = cat.items.map(item => {
        return `<div class="furniture-item" data-ename="${item}">
                  <div>${item}</div>
                  <div class="furniture-item-add" data-action="eadd" data-ename="${item}">+add</div>
                </div>`;
      }).join('');
      catsHtml += `
        <div class="furniture-category" data-ecat="${cat.id}">
          <button type="button" class="furniture-cat-btn">
            <span class="furniture-cat-icon">${cat.icon} ${cat.name}</span>
            <span>⋁</span>
          </button>
          <div class="furniture-cat-dropdown">${itemsHtml}</div>
        </div>`;
    });

    catsHtml += `
      <div class="furniture-category" data-ecat="custom">
        <button type="button" class="furniture-cat-btn">
          <span class="furniture-cat-icon">⊕ Add your own item</span>
          <span>⋁</span>
        </button>
        <div class="furniture-cat-dropdown">
          <div class="furniture-custom-item">
            <input type="text" id="eCustomName" class="form-input" placeholder="Item name..." autocomplete="off" />
            <button type="button" class="btn btn--gold" id="btnECustomAdd">Add Item</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = `
      <div class="search-input-wrapper">
         <span class="search-icon">🔍</span>
         <input type="text" id="equipItemSearch" class="form-input" placeholder="Search for your item(s) e.g. Treadmill" autocomplete="off" />
      </div>
      <div class="furniture-search-results hidden" id="equipSearchResults"></div>
      
      <p class="mb-sm text-mid">Or quickly add from our list of popular items below:</p>
      <div class="furniture-categories-grid">${catsHtml}</div>
      <div class="furniture-summary" id="equipSummaryApp" style="display:none;">
         <h4 class="furniture-summary__title">Your Items (<span id="equipTotalCount">0</span>)</h4>
         <div class="furniture-summary__list" id="equipSummaryListApp"></div>
      </div>
    `;

    bindEquipEvents();
  }

  function renderEquipSummary() {
    const listEl = document.getElementById('equipSummaryListApp');
    const wrapEl = document.getElementById('equipSummaryApp');
    const cntEl = document.getElementById('equipTotalCount');
    if (!listEl || !wrapEl || !cntEl) return;

    let total = 0; let html = '';
    Object.entries(equipAddedItems).forEach(([name, qty]) => {
      if (qty > 0) {
        total += qty;
        html += `
          <div class="furniture-summary-item">
            <span>${name}</span>
            <div class="inventory-item__qty-wrap">
              <button type="button" class="inventory-item__qty-btn" data-action="edec" data-ename="${name}">−</button>
              <input type="number" class="inventory-item__qty-input" value="${qty}" readonly />
              <button type="button" class="inventory-item__qty-btn" data-action="einc" data-ename="${name}">+</button>
            </div>
          </div>
        `;
      }
    });
    listEl.innerHTML = html;
    cntEl.textContent = total;
    wrapEl.style.display = total > 0 ? 'block' : 'none';
  }

  function modifyEquipItem(name, delta) {
    if (!equipAddedItems[name]) equipAddedItems[name] = 0;
    equipAddedItems[name] += delta;
    if (equipAddedItems[name] <= 0) delete equipAddedItems[name];
    renderEquipSummary();
  }

  function bindEquipEvents() {
    const appEl = document.getElementById('equipInventoryApp');
    if (!appEl) return;

    appEl.querySelectorAll('.furniture-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.parentElement;
        const isOpen = cat.classList.contains('open');
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        if (!isOpen) cat.classList.add('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#equipInventoryApp .furniture-category')) {
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
      }
    });

    appEl.addEventListener('click', (e) => {
      if (e.target.getAttribute('data-action') === 'eadd') {
        modifyEquipItem(e.target.getAttribute('data-ename'), 1);
        const oldText = e.target.textContent; e.target.textContent = '✓';
        setTimeout(() => e.target.textContent = oldText, 800);
      }
      else if (e.target.getAttribute('data-action') === 'edec') modifyEquipItem(e.target.getAttribute('data-ename'), -1);
      else if (e.target.getAttribute('data-action') === 'einc') modifyEquipItem(e.target.getAttribute('data-ename'), 1);
    });

    const btnCustom = document.getElementById('btnECustomAdd');
    const inputCustom = document.getElementById('eCustomName');
    if (btnCustom && inputCustom) {
      btnCustom.addEventListener('click', () => {
        const val = inputCustom.value.trim();
        if (val) {
          modifyEquipItem(val, 1);
          inputCustom.value = '';
          appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        }
      });
    }

    const searchInput = document.getElementById('equipItemSearch');
    const searchResults = document.getElementById('equipSearchResults');
    if (searchInput && searchResults) {
      const allItems = [];
      EQUIP_CATEGORIES.forEach(c => c.items.forEach(i => allItems.push(i)));

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.classList.add('hidden'); return; }
        const matches = allItems.filter(item => item.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) { searchResults.classList.add('hidden'); return; }
        searchResults.innerHTML = matches.map(item =>
           `<div class="furniture-item" style="cursor:pointer;" data-action="eadd" data-ename="${item}">
              ${item} <span class="furniture-item-add" style="pointer-events:none;">+add</span>
            </div>`
        ).join('');
        searchResults.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#equipInventoryApp .search-input-wrapper') && !e.target.closest('#equipSearchResults')) {
          searchResults.classList.add('hidden');
        }
      });
    }
  }

  /* ════════════════════════════════════════════
     STORAGE INVENTORY SYSTEM (Storage Services)
  ════════════════════════════════════════════ */
  const storageAddedItems = {};
  const STORAGE_CATEGORIES = [
    {
      id: 'stor_furniture', name: 'Furniture', icon: '🛋️',
      items: ['2 Seater Sofa', '3 Seater Sofa', 'Corner Sofa', 'Armchair', 'Coffee Table', 'Dining Table', 'Dining Chair', 'Bookshelf', 'TV Stand', 'Desk', 'Office Chair', 'Console Table', 'Side Table']
    },
    {
      id: 'stor_boxes', name: 'Boxes & Bags', icon: '📦',
      items: ['Small Box', 'Medium Box', 'Large Box', 'Extra Large Box', 'Wardrobe Box', 'Suitcase (Small)', 'Suitcase (Large)', 'Bin Bag', 'Holdall / Duffel Bag', 'Rucksack', 'Document Box']
    },
    {
      id: 'stor_beds', name: 'Beds & Mattresses', icon: '🛏️',
      items: ['Single Bed Frame', 'Double Bed Frame', 'King Size Bed Frame', 'Super King Bed Frame', 'Bunk Bed', 'Single Mattress', 'Double Mattress', 'King Size Mattress', 'Wardrobe (Single)', 'Wardrobe (Double)', 'Chest of Drawers', 'Bedside Table', 'Dressing Table']
    },
    {
      id: 'stor_electronics', name: 'Electronics', icon: '📺',
      items: ['TV (up to 32")', 'TV (32"-50")', 'TV (50"-65")', 'TV (65"+)', 'Desktop Computer', 'Monitor', 'Laptop', 'Printer', 'Games Console', 'Sound System', 'Record Player']
    },
    {
      id: 'stor_appliances', name: 'Appliances', icon: '🏠',
      items: ['Washing Machine', 'Tumble Dryer', 'Dishwasher', 'Fridge', 'Freezer', 'Fridge Freezer', 'Cooker / Oven', 'Microwave', 'Vacuum Cleaner', 'Iron & Ironing Board', 'Dehumidifier', 'Fan / Heater']
    },
    {
      id: 'stor_garden', name: 'Garden & Outdoor', icon: '🌿',
      items: ['Lawnmower', 'Garden Table', 'Garden Chairs', 'Parasol', 'BBQ', 'Strimmer', 'Wheelbarrow', 'Pot Plants (Large)', 'Garden Tools Set', 'Hosepipe', 'Patio Heater']
    },
    {
      id: 'stor_sports', name: 'Sports Equipment', icon: '⚽',
      items: ['Bicycle', 'Treadmill', 'Exercise Bike', 'Golf Clubs', 'Ski Equipment', 'Surfboard', 'Kayak / Canoe', 'Weights Set', 'Yoga / Gym Mat', 'Camping Gear']
    },
    {
      id: 'stor_seasonal', name: 'Seasonal Items', icon: '🎄',
      items: ['Christmas Tree', 'Christmas Decorations Box', 'Suitcases', 'Ski Gear', 'Summer Furniture', 'Paddling Pool', 'Outdoor Games', 'Fans', 'Heaters', 'Holiday Decorations']
    }
  ];

  function renderStorageApp() {
    const appEl = document.getElementById('storageInventoryApp');
    if (!appEl) return;

    let catsHtml = '';
    STORAGE_CATEGORIES.forEach(cat => {
      const itemsHtml = cat.items.map(item => {
        return `<div class="furniture-item" data-sname="${item}">
                  <div>${item}</div>
                  <div class="furniture-item-add" data-action="sadd" data-sname="${item}">+add</div>
                </div>`;
      }).join('');
      catsHtml += `
        <div class="furniture-category" data-scat="${cat.id}">
          <button type="button" class="furniture-cat-btn">
            <span class="furniture-cat-icon">${cat.icon} ${cat.name}</span>
            <span>⋁</span>
          </button>
          <div class="furniture-cat-dropdown">${itemsHtml}</div>
        </div>`;
    });

    catsHtml += `
      <div class="furniture-category" data-scat="custom">
        <button type="button" class="furniture-cat-btn">
          <span class="furniture-cat-icon">⊕ Add your own item</span>
          <span>⋁</span>
        </button>
        <div class="furniture-cat-dropdown">
          <div class="furniture-custom-item">
            <input type="text" id="sCustomName" class="form-input" placeholder="Item name..." autocomplete="off" />
            <button type="button" class="btn btn--gold" id="btnSCustomAdd">Add Item</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = `
      <div class="search-input-wrapper">
         <span class="search-icon">🔍</span>
         <input type="text" id="storageItemSearch" class="form-input" placeholder="Search for your item(s) e.g. Sofa" autocomplete="off" />
      </div>
      <div class="furniture-search-results hidden" id="storageSearchResults"></div>
      
      <p class="mb-sm text-mid">Or quickly add from our list of popular items below:</p>
      <div class="furniture-categories-grid">${catsHtml}</div>
      <div class="furniture-summary" id="storageSummaryApp" style="display:none;">
         <h4 class="furniture-summary__title">Your Items (<span id="storageTotalCount">0</span>)</h4>
         <div class="furniture-summary__list" id="storageSummaryListApp"></div>
      </div>
    `;

    bindStorageEvents();
  }

  function renderStorageSummary() {
    const listEl = document.getElementById('storageSummaryListApp');
    const wrapEl = document.getElementById('storageSummaryApp');
    const cntEl = document.getElementById('storageTotalCount');
    if (!listEl || !wrapEl || !cntEl) return;

    let total = 0; let html = '';
    Object.entries(storageAddedItems).forEach(([name, qty]) => {
      if (qty > 0) {
        total += qty;
        html += `
          <div class="furniture-summary-item">
            <span>${name}</span>
            <div class="inventory-item__qty-wrap">
              <button type="button" class="inventory-item__qty-btn" data-action="sdec" data-sname="${name}">−</button>
              <input type="number" class="inventory-item__qty-input" value="${qty}" readonly />
              <button type="button" class="inventory-item__qty-btn" data-action="sinc" data-sname="${name}">+</button>
            </div>
          </div>
        `;
      }
    });
    listEl.innerHTML = html;
    cntEl.textContent = total;
    wrapEl.style.display = total > 0 ? 'block' : 'none';
  }

  function modifyStorageItem(name, delta) {
    if (!storageAddedItems[name]) storageAddedItems[name] = 0;
    storageAddedItems[name] += delta;
    if (storageAddedItems[name] <= 0) delete storageAddedItems[name];
    renderStorageSummary();
  }

  function bindStorageEvents() {
    const appEl = document.getElementById('storageInventoryApp');
    if (!appEl) return;

    appEl.querySelectorAll('.furniture-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.parentElement;
        const isOpen = cat.classList.contains('open');
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        if (!isOpen) cat.classList.add('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#storageInventoryApp .furniture-category')) {
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
      }
    });

    appEl.addEventListener('click', (e) => {
      if (e.target.getAttribute('data-action') === 'sadd') {
        modifyStorageItem(e.target.getAttribute('data-sname'), 1);
        const oldText = e.target.textContent; e.target.textContent = '✓';
        setTimeout(() => e.target.textContent = oldText, 800);
      }
      else if (e.target.getAttribute('data-action') === 'sdec') modifyStorageItem(e.target.getAttribute('data-sname'), -1);
      else if (e.target.getAttribute('data-action') === 'sinc') modifyStorageItem(e.target.getAttribute('data-sname'), 1);
    });

    const btnCustom = document.getElementById('btnSCustomAdd');
    const inputCustom = document.getElementById('sCustomName');
    if (btnCustom && inputCustom) {
      btnCustom.addEventListener('click', () => {
        const val = inputCustom.value.trim();
        if (val) {
          modifyStorageItem(val, 1);
          inputCustom.value = '';
          appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        }
      });
    }

    const searchInput = document.getElementById('storageItemSearch');
    const searchResults = document.getElementById('storageSearchResults');
    if (searchInput && searchResults) {
      const allItems = [];
      STORAGE_CATEGORIES.forEach(c => c.items.forEach(i => allItems.push(i)));

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.classList.add('hidden'); return; }
        const matches = allItems.filter(item => item.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) { searchResults.classList.add('hidden'); return; }
        searchResults.innerHTML = matches.map(item =>
           `<div class="furniture-item" style="cursor:pointer;" data-action="sadd" data-sname="${item}">
              ${item} <span class="furniture-item-add" style="pointer-events:none;">+add</span>
            </div>`
        ).join('');
        searchResults.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#storageInventoryApp .search-input-wrapper') && !e.target.closest('#storageSearchResults')) {
          searchResults.classList.add('hidden');
        }
      });
    }
  }

  /* ════════════════════════════════════════════
     CLEARANCE INVENTORY SYSTEM
  ════════════════════════════════════════════ */
  const clearAddedItems = {};
  const CLEAR_CATEGORIES = [
    {
      id: 'clr_furniture', name: 'Furniture', icon: '🛋️',
      items: ['Sofa', 'Armchair', 'Dining Table', 'Dining Chairs', 'Coffee Table', 'Wardrobe', 'Chest of Drawers', 'Bookshelf', 'Bed Frame', 'Mattress', 'Desk', 'TV Stand', 'Sideboard', 'Cabinet']
    },
    {
      id: 'clr_appliances', name: 'White Goods & Appliances', icon: '🧊',
      items: ['Washing Machine', 'Tumble Dryer', 'Dishwasher', 'Fridge', 'Freezer', 'Fridge Freezer', 'Cooker / Oven', 'Microwave', 'Vacuum Cleaner', 'Iron & Ironing Board']
    },
    {
      id: 'clr_rubbish', name: 'Rubbish & Waste', icon: '🗑️',
      items: ['Black Bin Bags (x5)', 'Black Bin Bags (x10)', 'Black Bin Bags (x20)', 'Rubble Bags', 'Mixed Waste Bags', 'Cardboard Boxes', 'Old Carpet', 'Old Flooring', 'General Rubbish', 'Loose Items']
    },
    {
      id: 'clr_garden', name: 'Garden Waste', icon: '🌿',
      items: ['Green Waste Bags', 'Tree Branches', 'Hedge Cuttings', 'Soil / Turf', 'Plant Pots', 'Old Decking', 'Garden Shed', 'Greenhouse Frame', 'Old Fencing', 'Hot Tub (Empty)']
    },
    {
      id: 'clr_electronics', name: 'Electronics & Electricals', icon: '📺',
      items: ['Television', 'Desktop Computer', 'Monitor', 'Laptop', 'Printer', 'Old Cables / Wires', 'Audio Equipment', 'Radiator', 'Light Fittings', 'Old Boiler']
    },
    {
      id: 'clr_textiles', name: 'Textiles & Soft Furnishings', icon: '🛏️',
      items: ['Curtains', 'Blinds', 'Rugs', 'Cushions / Pillows', 'Duvet / Bedding', 'Clothing Bags', 'Blankets / Throws', 'Towels', 'Old Fabric']
    },
    {
      id: 'clr_diy', name: 'DIY & Construction', icon: '🔨',
      items: ['Plasterboard', 'Timber / Wood', 'Tiles', 'Bricks / Rubble', 'Paint Tins', 'Old Doors', 'Old Windows', 'Bathroom Suite', 'Kitchen Units', 'Pipe / Copper']
    },
    {
      id: 'clr_misc', name: 'Miscellaneous', icon: '📦',
      items: ['Boxes of Mixed Items', 'Kids Toys', 'Exercise Equipment', 'Bicycle', 'Push Chair', 'Car Seats', 'Old Tools', 'Musical Instruments', 'Books / Magazines', 'Other']
    }
  ];

  function renderClearApp() {
    const appEl = document.getElementById('clearInventoryApp');
    if (!appEl) return;

    let catsHtml = '';
    CLEAR_CATEGORIES.forEach(cat => {
      const itemsHtml = cat.items.map(item => {
        return `<div class="furniture-item" data-cname="${item}">
                  <div>${item}</div>
                  <div class="furniture-item-add" data-action="cadd" data-cname="${item}">+add</div>
                </div>`;
      }).join('');
      catsHtml += `
        <div class="furniture-category" data-ccat="${cat.id}">
          <button type="button" class="furniture-cat-btn">
            <span class="furniture-cat-icon">${cat.icon} ${cat.name}</span>
            <span>⋁</span>
          </button>
          <div class="furniture-cat-dropdown">${itemsHtml}</div>
        </div>`;
    });

    catsHtml += `
      <div class="furniture-category" data-ccat="custom">
        <button type="button" class="furniture-cat-btn">
          <span class="furniture-cat-icon">⊕ Add your own item</span>
          <span>⋁</span>
        </button>
        <div class="furniture-cat-dropdown">
          <div class="furniture-custom-item">
            <input type="text" id="cCustomName" class="form-input" placeholder="Item name..." autocomplete="off" />
            <button type="button" class="btn btn--gold" id="btnCCustomAdd">Add Item</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = `
      <div class="search-input-wrapper">
         <span class="search-icon">🔍</span>
         <input type="text" id="clearItemSearch" class="form-input" placeholder="Search for your item(s) e.g. Sofa" autocomplete="off" />
      </div>
      <div class="furniture-search-results hidden" id="clearSearchResults"></div>
      
      <p class="mb-sm text-mid">Or quickly add from our list of popular items below:</p>
      <div class="furniture-categories-grid">${catsHtml}</div>
      <div class="furniture-summary" id="clearSummaryApp" style="display:none;">
         <h4 class="furniture-summary__title">Your Items (<span id="clearTotalCount">0</span>)</h4>
         <div class="furniture-summary__list" id="clearSummaryListApp"></div>
      </div>
    `;

    bindClearEvents();
  }

  function renderClearSummary() {
    const listEl = document.getElementById('clearSummaryListApp');
    const wrapEl = document.getElementById('clearSummaryApp');
    const cntEl = document.getElementById('clearTotalCount');
    if (!listEl || !wrapEl || !cntEl) return;

    let total = 0; let html = '';
    Object.entries(clearAddedItems).forEach(([name, qty]) => {
      if (qty > 0) {
        total += qty;
        html += `
          <div class="furniture-summary-item">
            <span>${name}</span>
            <div class="inventory-item__qty-wrap">
              <button type="button" class="inventory-item__qty-btn" data-action="cdec" data-cname="${name}">−</button>
              <input type="number" class="inventory-item__qty-input" value="${qty}" readonly />
              <button type="button" class="inventory-item__qty-btn" data-action="cinc" data-cname="${name}">+</button>
            </div>
          </div>
        `;
      }
    });
    listEl.innerHTML = html;
    cntEl.textContent = total;
    wrapEl.style.display = total > 0 ? 'block' : 'none';
  }

  function modifyClearItem(name, delta) {
    if (!clearAddedItems[name]) clearAddedItems[name] = 0;
    clearAddedItems[name] += delta;
    if (clearAddedItems[name] <= 0) delete clearAddedItems[name];
    renderClearSummary();
  }

  function bindClearEvents() {
    const appEl = document.getElementById('clearInventoryApp');
    if (!appEl) return;

    appEl.querySelectorAll('.furniture-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.parentElement;
        const isOpen = cat.classList.contains('open');
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        if (!isOpen) cat.classList.add('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#clearInventoryApp .furniture-category')) {
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
      }
    });

    appEl.addEventListener('click', (e) => {
      if (e.target.getAttribute('data-action') === 'cadd') {
        modifyClearItem(e.target.getAttribute('data-cname'), 1);
        const oldText = e.target.textContent; e.target.textContent = '✓';
        setTimeout(() => e.target.textContent = oldText, 800);
      }
      else if (e.target.getAttribute('data-action') === 'cdec') modifyClearItem(e.target.getAttribute('data-cname'), -1);
      else if (e.target.getAttribute('data-action') === 'cinc') modifyClearItem(e.target.getAttribute('data-cname'), 1);
    });

    const btnCustom = document.getElementById('btnCCustomAdd');
    const inputCustom = document.getElementById('cCustomName');
    if (btnCustom && inputCustom) {
      btnCustom.addEventListener('click', () => {
        const val = inputCustom.value.trim();
        if (val) {
          modifyClearItem(val, 1);
          inputCustom.value = '';
          appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        }
      });
    }

    const searchInput = document.getElementById('clearItemSearch');
    const searchResults = document.getElementById('clearSearchResults');
    if (searchInput && searchResults) {
      const allItems = [];
      CLEAR_CATEGORIES.forEach(c => c.items.forEach(i => allItems.push(i)));

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.classList.add('hidden'); return; }
        const matches = allItems.filter(item => item.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) { searchResults.classList.add('hidden'); return; }
        searchResults.innerHTML = matches.map(item =>
           `<div class="furniture-item" style="cursor:pointer;" data-action="cadd" data-cname="${item}">
              ${item} <span class="furniture-item-add" style="pointer-events:none;">+add</span>
            </div>`
        ).join('');
        searchResults.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#clearInventoryApp .search-input-wrapper') && !e.target.closest('#clearSearchResults')) {
          searchResults.classList.add('hidden');
        }
      });
    }
  }

  /* ════════════════════════════════════════════
     COMMERCIAL INVENTORY SYSTEM
  ════════════════════════════════════════════ */
  const commAddedItems = {};
  const COMM_CATEGORIES = [
    {
      id: 'com_desks', name: 'Desks & Workstations', icon: '🪑',
      items: ['Standard Office Desk', 'Corner Desk', 'Standing Desk', 'Executive Desk', 'Hot Desk Unit', 'Workbench', 'Reception Desk', 'Boardroom Table']
    },
    {
      id: 'com_chairs', name: 'Office Chairs', icon: '💺',
      items: ['Ergonomic Office Chair', 'Meeting Room Chair', 'Reception Seating', 'Executive Chair', 'Breakout Stool', 'Drafting Chair', 'Sofa (2 Seater)', 'Sofa (3 Seater)']
    },
    {
      id: 'com_storage', name: 'Storage & Filing', icon: '🗄️',
      items: ['Filing Cabinet (2 Drawer)', 'Filing Cabinet (4 Drawer)', 'Tambour Unit', 'Bookcase / Shelving', 'Pedestal Drawer', 'Storage Cupboard', 'Locker Unit', 'Safe']
    },
    {
      id: 'com_meeting', name: 'Meeting & Reception', icon: '🗣️',
      items: ['Conference Table', 'Whiteboard / Flipchart', 'Display Screen', 'Coffee Table', 'Podium / Lectern', 'Coat Stand', 'Magazine Rack', 'Display Cabinet']
    },
    {
      id: 'com_breakroom', name: 'Breakroom & Kitchen', icon: '☕',
      items: ['Café Table', 'Café Chair', 'Microwave', 'Fridge (Under Counter)', 'Fridge (Tall)', 'Dishwasher', 'Coffee Machine', 'Water Cooler', 'Vending Machine']
    },
    {
      id: 'com_it', name: 'IT & Electronics', icon: '💻',
      items: ['Desktop PC setup', 'Monitor (Single)', 'Monitor (Dual)', 'Printer (Desktop)', 'Photocopier (Freestanding)', 'Server Rack (Small)', 'Server Rack (Large)', 'Shredder', 'Telephone System']
    },
    {
      id: 'com_accents', name: 'Office Accents', icon: '🪴',
      items: ['Large Potted Plant', 'Small Potted Plant', 'Framed Artwork', 'Room Divider', 'Acoustic Panel', 'Lamp / Lighting', 'Waste Bin', 'Umbrella Stand']
    },
    {
      id: 'com_specialist', name: 'Specialist Equipment', icon: '🛠️',
      items: ['Pallet Truck', 'Trolley', 'Large Safe / Strongbox', 'Manufacturing Machine (Small)', 'Retail Display Unit', 'Mannequin', 'Medical Couch', 'Industrial Fan']
    }
  ];

  function renderCommApp() {
    const appEl = document.getElementById('commInventoryApp');
    if (!appEl) return;

    let catsHtml = '';
    COMM_CATEGORIES.forEach(cat => {
      const itemsHtml = cat.items.map(item => {
        return `<div class="furniture-item" data-coname="${item}">
                  <div>${item}</div>
                  <div class="furniture-item-add" data-action="coadd" data-coname="${item}">+add</div>
                </div>`;
      }).join('');
      catsHtml += `
        <div class="furniture-category" data-cocat="${cat.id}">
          <button type="button" class="furniture-cat-btn">
            <span class="furniture-cat-icon">${cat.icon} ${cat.name}</span>
            <span>⋁</span>
          </button>
          <div class="furniture-cat-dropdown">${itemsHtml}</div>
        </div>`;
    });

    catsHtml += `
      <div class="furniture-category" data-cocat="custom">
        <button type="button" class="furniture-cat-btn">
          <span class="furniture-cat-icon">⊕ Add your own item</span>
          <span>⋁</span>
        </button>
        <div class="furniture-cat-dropdown">
          <div class="furniture-custom-item">
            <input type="text" id="coCustomName" class="form-input" placeholder="Item name..." autocomplete="off" />
            <button type="button" class="btn btn--gold" id="btnCoCustomAdd">Add Item</button>
          </div>
        </div>
      </div>`;

    appEl.innerHTML = `
      <div class="search-input-wrapper">
         <span class="search-icon">🔍</span>
         <input type="text" id="commItemSearch" class="form-input" placeholder="Search for your item(s) e.g. Office Chair" autocomplete="off" />
      </div>
      <div class="furniture-search-results hidden" id="commSearchResults"></div>
      
      <p class="mb-sm text-mid">Or quickly add from our list of common commercial items below:</p>
      <div class="furniture-categories-grid">${catsHtml}</div>
      <div class="furniture-summary" id="commSummaryApp" style="display:none;">
         <h4 class="furniture-summary__title">Your Items (<span id="commTotalCount">0</span>)</h4>
         <div class="furniture-summary__list" id="commSummaryListApp"></div>
      </div>
    `;

    bindCommEvents();
  }

  function renderCommSummary() {
    const listEl = document.getElementById('commSummaryListApp');
    const wrapEl = document.getElementById('commSummaryApp');
    const cntEl = document.getElementById('commTotalCount');
    if (!listEl || !wrapEl || !cntEl) return;

    let total = 0; let html = '';
    Object.entries(commAddedItems).forEach(([name, qty]) => {
      if (qty > 0) {
        total += qty;
        html += `
          <div class="furniture-summary-item">
            <span>${name}</span>
            <div class="inventory-item__qty-wrap">
              <button type="button" class="inventory-item__qty-btn" data-action="codec" data-coname="${name}">−</button>
              <input type="number" class="inventory-item__qty-input" value="${qty}" readonly />
              <button type="button" class="inventory-item__qty-btn" data-action="coinc" data-coname="${name}">+</button>
            </div>
          </div>
        `;
      }
    });
    listEl.innerHTML = html;
    cntEl.textContent = total;
    wrapEl.style.display = total > 0 ? 'block' : 'none';
  }

  function modifyCommItem(name, delta) {
    if (!commAddedItems[name]) commAddedItems[name] = 0;
    commAddedItems[name] += delta;
    if (commAddedItems[name] <= 0) delete commAddedItems[name];
    renderCommSummary();
  }

  function bindCommEvents() {
    const appEl = document.getElementById('commInventoryApp');
    if (!appEl) return;

    appEl.querySelectorAll('.furniture-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.parentElement;
        const isOpen = cat.classList.contains('open');
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        if (!isOpen) cat.classList.add('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#commInventoryApp .furniture-category')) {
        appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
      }
    });

    appEl.addEventListener('click', (e) => {
      if (e.target.getAttribute('data-action') === 'coadd') {
        modifyCommItem(e.target.getAttribute('data-coname'), 1);
        const oldText = e.target.textContent; e.target.textContent = '✓';
        setTimeout(() => e.target.textContent = oldText, 800);
      }
      else if (e.target.getAttribute('data-action') === 'codec') modifyCommItem(e.target.getAttribute('data-coname'), -1);
      else if (e.target.getAttribute('data-action') === 'coinc') modifyCommItem(e.target.getAttribute('data-coname'), 1);
    });

    const btnCustom = document.getElementById('btnCoCustomAdd');
    const inputCustom = document.getElementById('coCustomName');
    if (btnCustom && inputCustom) {
      btnCustom.addEventListener('click', () => {
        const val = inputCustom.value.trim();
        if (val) {
          modifyCommItem(val, 1);
          inputCustom.value = '';
          appEl.querySelectorAll('.furniture-category').forEach(c => c.classList.remove('open'));
        }
      });
    }

    const searchInput = document.getElementById('commItemSearch');
    const searchResults = document.getElementById('commSearchResults');
    if (searchInput && searchResults) {
      const allItems = [];
      COMM_CATEGORIES.forEach(c => c.items.forEach(i => allItems.push(i)));

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.classList.add('hidden'); return; }
        const matches = allItems.filter(item => item.toLowerCase().includes(q)).slice(0, 8);
        if (!matches.length) { searchResults.classList.add('hidden'); return; }
        searchResults.innerHTML = matches.map(item =>
           `<div class="furniture-item" style="cursor:pointer;" data-action="coadd" data-coname="${item}">
              ${item} <span class="furniture-item-add" style="pointer-events:none;">+add</span>
            </div>`
        ).join('');
        searchResults.classList.remove('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#commInventoryApp .search-input-wrapper') && !e.target.closest('#commSearchResults')) {
          searchResults.classList.add('hidden');
        }
      });
    }
  }

  /* ── FORM SUBMIT ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const lastStepId = getCurrentStepId();
    if (!validate(lastStepId)) return;

    const isSimple = (lastStepId === 'simple');
    const isPianoContact = (lastStepId === 'piano-contact');
    const isOfficeContact = (lastStepId === 'office-contact');
    const isPackingContact = (lastStepId === 'packing-contact');
    const isEquipContact = (lastStepId === 'equip-contact');
    const isStorageContact = (lastStepId === 'storage-contact');
    const isClearContact = (lastStepId === 'clear-contact');
    const isCommContact = (lastStepId === 'comm-contact');
    const isStudent = (lastStepId === 'student-1');
    const submitBtn = document.getElementById(isStudent ? 'submitBtnStudent' : isPianoContact ? 'submitBtnPiano' : isOfficeContact ? 'submitBtnOffice' : isPackingContact ? 'submitBtnPacking' : isEquipContact ? 'submitBtnEquip' : isStorageContact ? 'submitBtnStorage' : isClearContact ? 'submitBtnClear' : isCommContact ? 'submitBtnComm' : isSimple ? 'submitBtnSimple' : 'submitBtn');
    const btnText = submitBtn.querySelector('.btn__text');
    const btnLoader = submitBtn.querySelector('.btn__loader');
    if (btnText) btnText.classList.add('hidden');
    if (btnLoader) { btnLoader.classList.remove('hidden'); btnLoader.style.display = 'inline'; }
    submitBtn.disabled = true;

    // Build payload
    const service = getSelectedService();
    const payload = {
      _subject: `New Quote Request: ${service}`,
      Service: service
    };

    // Gather filled fields from ALL steps in the current flow (not just active/done)
    const flowStepElements = stepFlow.map(sid => document.getElementById(getStepElementId(sid))).filter(Boolean);
    const allInputs = flowStepElements.flatMap(step => Array.from(step.querySelectorAll('input, select, textarea')));
    
    allInputs.forEach(el => {
      if (!el.name) return;
      // Skip radio buttons that are not checked
      if (el.type === 'radio' && !el.checked) return;
      // Only include checkboxes that are checked
      if (el.type === 'checkbox') {
         if (el.checked) payload[el.name] = 'Yes';
         return;
      }
      // Skip selects still on default placeholder
      if (el.tagName === 'SELECT' && (!el.value || el.selectedOptions[0]?.disabled)) return;
      // Skip empty values
      if (!el.value || !el.value.trim()) return;
      payload[el.name] = el.value;
    });

    // Build inventory string depending on service
    let inventoryText = '';
    const mergeInventory = (itemsObj) => Object.entries(itemsObj).filter(([k,v]) => v > 0).map(([k,v]) => `${v}x ${k}`).join(', ');
    // House removals inventory has different structure: { id: { name, qty } }
    const mergeHouseInventory = (inv) => Object.entries(inv).filter(([k,v]) => v.qty > 0).map(([k,v]) => `${v.qty}x ${v.name}`).join(', ');

    if (service === 'House removals' || service === 'Man and van') inventoryText = mergeHouseInventory(inventory);
    else if (service === 'Furniture & appliance delivery') inventoryText = mergeInventory(furnitureAddedItems);
    else if (service === 'Office removals') inventoryText = mergeInventory(officeAddedItems);
    else if (service === 'Packing services') inventoryText = mergeInventory(packingAddedItems);
    else if (service === 'Equipment & machinery') inventoryText = mergeInventory(equipAddedItems);
    else if (service === 'Storage services') inventoryText = mergeInventory(storageAddedItems);
    else if (service === 'Clearance') inventoryText = mergeInventory(clearAddedItems);
    else if (service === 'Commercial removals') inventoryText = mergeInventory(commAddedItems);

    if (inventoryText) {
       payload.Inventory_Items = inventoryText;
    }

    // Collect additional services checkboxes
    const addSvcName = (service === 'Furniture & appliance delivery') ? 'furnitureAdditionalServices' : 'additionalServices';
    const addSvcChecked = form.querySelectorAll('input[name="' + addSvcName + '"]:checked');
    if (addSvcChecked.length > 0) {
      payload.Additional_Services = Array.from(addSvcChecked).map(cb => cb.value).join(', ');
    }

    // Capture custom piano type if piano is selected but custom text is filled
    if (service === 'Piano delivery' && !payload.pianoType) {
       const pianoCustom = form.querySelector('#pianoCustomType');
       if (pianoCustom && pianoCustom.value) payload.pianoType = pianoCustom.value;
    }

    // Send to email and Make.com in parallel
    const emailPromise = fetch('https://formsubmit.co/ajax/theroyalsremovals@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    });

    // Make.com webhook for Slack forwarding & countdown reminders
    const MAKE_WEBHOOK = 'https://hook.eu1.make.com/838q63uv1gxtcvj5jypyqr9rjiadx36b';
    const makePayload = Object.assign({}, payload, {
      _inventoryText: inventoryText || ''
    });
    const makePromise = fetch(MAKE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(makePayload)
    }).catch(err => console.warn('Make.com notification failed:', err));

    Promise.all([emailPromise, makePromise])
    .then(() => {
      // Show success
      const currentStepEl = document.getElementById(getStepElementId(lastStepId));
      if (currentStepEl) currentStepEl.classList.remove('active');
      const progressWrap = document.querySelector('.form-progress');
      if (progressWrap) progressWrap.style.display = 'none';
      const formSubtitle = document.querySelector('.form-card__subtitle');
      if (formSubtitle) formSubtitle.style.display = 'none';
      const formTitle = document.querySelector('.form-card__title');
      if (formTitle) formTitle.innerHTML = 'Thank <span class="gold-text">You!</span>';
      const success = document.getElementById('step-success');
      success.classList.remove('hidden'); success.classList.add('active');
      if (progressBar) progressBar.style.width = '100%';
      document.querySelectorAll('.form-progress__step').forEach(el => el.classList.add('done'));
      scrollToForm();
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      submitBtn.disabled = false;
      if (btnText) btnText.classList.remove('hidden');
      if (btnLoader) btnLoader.classList.add('hidden');
      alert('There was a problem submitting your request. Please call us directly.');
    });
  });

  function scrollToForm() {
    const fw = document.getElementById('quote-form');
    if (fw) window.scrollTo({ top: fw.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  }



  /* ── INIT ── */
  updateStepFlow();
  setStep(0);
  updateInventorySummary();
  renderFurnitureApp();
  renderOfficeApp();
  renderPackingApp();
  renderEquipApp();
  renderStorageApp();
  renderClearApp();
  renderCommApp();

  /* ── PIANO: Custom type toggle ── */
  const btnCustomPiano = document.getElementById('btnAddCustomPiano');
  const pianoCustomWrap = document.getElementById('pianoCustomInput');
  if (btnCustomPiano && pianoCustomWrap) {
    btnCustomPiano.addEventListener('click', () => {
      const isHidden = pianoCustomWrap.classList.contains('hidden');
      pianoCustomWrap.classList.toggle('hidden');
      if (isHidden) {
        // Deselect radio buttons when using custom
        form.querySelectorAll('input[name="pianoType"]').forEach(r => r.checked = false);
        document.querySelectorAll('.piano-type-card').forEach(c => c.classList.remove('selected'));
        document.getElementById('pianoCustomType').focus();
      }
    });
  }
  // Deselect custom input when a radio piano type is selected
  form.querySelectorAll('input[name="pianoType"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (pianoCustomWrap) pianoCustomWrap.classList.add('hidden');
      const customInput = document.getElementById('pianoCustomType');
      if (customInput) customInput.value = '';
    });
  });

  /* ── QUICK CTA FORM WHATSAPP REDIRECT ── */
  document.querySelectorAll('.quick-cta-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get('name') || '';
      const email = fd.get('email') || '';
      const phone = fd.get('phone') || '';
      const date = fd.get('date') || '';
      
      let text = `New Call Back Request:\n`;
      if (name) text += `\nName: ${name}`;
      if (email) text += `\nEmail: ${email}`;
      if (phone) text += `\nPhone: ${phone}`;
      if (date) text += `\nDate: ${date}`;
      
      const url = `https://wa.me/447345624506?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  });

})();
