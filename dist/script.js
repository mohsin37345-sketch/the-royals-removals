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
  const FLOW_FURNITURE = [1, 'furniture-1', 'simple'];
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
    document.body.classList.remove('flow-house', 'flow-furniture', 'flow-simple');

    if (service === 'Home removals') {
      stepFlow = FLOW_HOUSE;
      document.body.classList.add('flow-house');
    } else if (service === 'Furniture & appliance delivery') {
      stepFlow = FLOW_FURNITURE;
      document.body.classList.add('flow-furniture');
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
      else if (stepFlow === FLOW_FURNITURE && ['furniture-1', 'furniture-contact'].includes(ds)) { visibleSteps.push(el); }
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
        const eid = sid === 'contact' ? 'err-contact' : sid === 'simple' ? 'err-simple' : sid === 'furniture-1' ? 'err-furniture-1' : 'err-' + sid;
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
              <option value="Ground floor">Ground floor</option>
              <option value="1st floor">1st floor</option>
              <option value="2nd floor">2nd floor</option>
              <option value="3rd floor">3rd floor</option>
              <option value="4th floor or above">4th floor or above</option>
              <option value="Basement">Basement</option>
            </select>
          </div>
        </div>
      `;
      extraStopsContainer.appendChild(section);

      // Init autocomplete on the new address field
      const newInput = section.querySelector('.extra-stop-address');
      initPostcodeAutocomplete(newInput);

      // Remove button
      section.querySelector('.extra-stop-section__remove').addEventListener('click', () => {
        section.remove();
      });
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
      if (radio.value === 'hasDate') { if (moveDateField) moveDateField.style.display = ''; }
      else { if (moveDateField) moveDateField.style.display = 'none'; if (moveDateConfirm) moveDateConfirm.classList.add('hidden'); }
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
  if (pickupPropertySelect) {
    pickupPropertySelect.addEventListener('change', () => {
      const label = document.querySelector('.inventory-toggle__label');
      if (label && pickupPropertySelect.value) label.innerHTML = `Prefer to use our <strong>${pickupPropertySelect.value}</strong> inventory list?`;
    });
  }

  /* ── FORM SUBMIT ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const lastStepId = getCurrentStepId();
    if (!validate(lastStepId)) return;

    const isSimple = (lastStepId === 'simple');
    const submitBtn = document.getElementById(isSimple ? 'submitBtnSimple' : 'submitBtn');
    const btnText = submitBtn.querySelector('.btn__text');
    const btnLoader = submitBtn.querySelector('.btn__loader');
    if (btnText) btnText.classList.add('hidden');
    if (btnLoader) { btnLoader.classList.remove('hidden'); btnLoader.style.display = 'inline'; }
    submitBtn.disabled = true;

    setTimeout(() => {
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
    }, 1500);
  });

  function scrollToForm() {
    const fw = document.getElementById('quote-form');
    if (fw) window.scrollTo({ top: fw.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  }

  /* ── FAQs ACCORDION ── */
  window.toggleFaq = function (el) {
    const isOpen = el.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
    if (!isOpen) el.classList.add('open');
  };

  /* ── INTERSECTION OBSERVER ── */
  const revealEls = document.querySelectorAll('.feature-card, .service-card, .testimonial-card, .faq-item, .steps-timeline__item, .area-pill');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    revealEls.forEach((el, i) => {
      el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`;
      observer.observe(el);
    });
  }

  /* ── INIT ── */
  updateStepFlow();
  setStep(0);
  updateInventorySummary();

})();
