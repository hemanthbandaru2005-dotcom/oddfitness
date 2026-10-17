/**
 * ODD FITNESS - Multi-Page Application Logic
 * Pages: index.html | workouts.html | nutrition.html | collaborations.html
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initStrengthCalculator();
  initWorkoutLibrary();
  initNutritionLab();
  initCollabForm();
  initCollabModal();
  initClientPortal();
  syncWorkoutsPublicPage();
  syncNutritionPublicPage();
  syncCollabsPublicPage();
});

// 1. Navigation & Active Page Handling
function initNavbar() {
  const header = document.querySelector('.main-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Highlight current page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update header right login button state (Strictly KEEP as "LOGIN")
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  const headerLoginText = document.getElementById('headerLoginText');
  const isLoggedIn = sessionStorage.getItem('odd_client_logged_in') === 'true';
  const creds = getStoredCreds();

  if (headerLoginBtn && headerLoginText) {
    headerLoginText.textContent = 'LOGIN';
    if (isLoggedIn) {
      headerLoginBtn.classList.add('active-user');
      headerLoginBtn.title = `Logged in as ${creds.username} (Click to open Management Portal)`;
    } else {
      headerLoginBtn.classList.remove('active-user');
      headerLoginBtn.title = 'Client Login / Portal Access';
    }
  }

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('mobile-open');
      menuToggle.textContent = isOpen ? '✕' : '☰';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    const closeNav = () => {
      navMenu.classList.remove('mobile-open');
      if (menuToggle) menuToggle.textContent = '☰';
      document.body.style.overflow = '';
    };

    navLinks.forEach(link => {
      link.addEventListener('click', closeNav);
    });

    const mobileNavLoginBtn = document.getElementById('mobileNavLoginBtn');
    if (mobileNavLoginBtn) {
      mobileNavLoginBtn.addEventListener('click', closeNav);
    }
  }
}

// 2. Workout Library Modal & Filter System
const workoutsData = {
  'strength': {
    title: 'STRENGTH & ENDURANCE',
    subtitle: 'Olympic Powerlifting & Gymnastic Rings',
    target: 'Chest, Upper Back, Delts, Triceps, Grip',
    level: 'Advanced Athlete',
    scheme: '5 Sets × 5-8 Heavy Reps (RPE 8-9)',
    equipment: 'Eleiko Olympic Barbell, Chalk, Wooden Rings',
    cues: [
      'Retract and depress scapula prior to unrack to stabilize glenohumeral joint.',
      'Brace core using Valsalva maneuver; drive floor away through midfoot.',
      'Lock out with strict hip and glute contraction at top of movement.'
    ]
  },
  'cycle': {
    title: 'INDOOR CYCLE',
    subtitle: 'High-Cadence Rhythm & Anaerobic Sprints',
    target: 'Quadriceps, Hamstrings, Calves, Cardiovascular Engine',
    level: 'All Fitness Levels',
    scheme: '45 Mins: 8x (30s Max Cadence Sprint / 60s Recovery)',
    equipment: 'Wattbike Commercial Smart Trainer, SPD Cleats',
    cues: [
      'Maintain flat spine and neutral pelvis without bouncing in the saddle.',
      'Pull pedals through bottom stroke to engage hamstrings actively.',
      'Keep cadence between 105-120 RPM during high-intensity intervals.'
    ]
  },
  'intensity': {
    title: 'HIGH INTENSITY (HIIT)',
    subtitle: 'Metabolic Conditioning & Rotational Core',
    target: 'Rectus Abdominis, Obliques, Shoulders, Heart Rate Zones',
    level: 'Intermediate - Advanced',
    scheme: 'Tabata Protocol: 8 Rounds (20s Max Effort / 10s Rest)',
    equipment: 'Assault AirBike, Medicine Balls, Kettlebells',
    cues: [
      'Drive heart rate into 85-95% Max HR zone in initial 15 seconds.',
      'Avoid hyperextending lumbar spine during rotational slams.',
      'Breathe rhythmically during work intervals to avoid premature fatigue.'
    ]
  },
  'mind': {
    title: 'MIND & BODY MOBILITY',
    subtitle: 'Ashtanga Flow, Fascia Release & Breathwork',
    target: 'Hip Flexors, Thoracic Spine, Hamstrings, Nervous System',
    level: 'All Levels / Active Recovery',
    scheme: '50 Mins Flow + 10 Mins Diaphragmatic Breathwork',
    equipment: 'High-Density Foam Roller, Yoga Mat, Mobility Bands',
    cues: [
      'Synchronize movement to slow nasal inhalation and prolonged exhalations.',
      'Relax jaw, neck, and shoulders to de-escalate sympathetic tone.',
      'Hold deep end-range hip opening stretches for 90-120 seconds.'
    ]
  },
  'crossfit': {
    title: 'CROSSFIT WORKOUT',
    subtitle: 'Heavy Battle Ropes & Explosive Olympic Complexes',
    target: 'Posterior Chain, Traps, Forearms, Core Bracing',
    level: 'Beast Mode / High Work Capacity',
    scheme: '5 Rounds For Time: 40 Waves + 10 Power Cleans + 20 Box Jumps',
    equipment: '50mm Heavy Manila Ropes, 20kg Barbell, Bumper Plates',
    cues: [
      'Adopt an athletic quarter-squat stance with anchored heels.',
      'Generate rope undulations through shoulder and lat drive, not wrist flick.',
      'Explosive triple extension (ankles, knees, hips) on Olympic cleans.'
    ]
  },
  'whole': {
    title: 'WHOLE BODY CONDITIONING',
    subtitle: 'Kinetic Chain Synergy & Functional Movement',
    target: 'Full Body Kinetic Chain, Core Stabilizers, Latissimus',
    level: 'Beginner to Intermediate',
    scheme: '4 Sets × 12 Reps per station (Circuit Format)',
    equipment: 'Competition Kettlebells, TRX Suspension, Resistance Bands',
    cues: [
      'Maintain continuous tension on cables and bands throughout negative tempo.',
      'Hinge deeply at hips during kettlebell swings; avoid squatting movement.',
      'Contract pelvic floor and lower transversus abdominis on every exhale.'
    ]
  }
};

function initWorkoutLibrary() {
  const cards = document.querySelectorAll('.program-card');
  const modal = document.getElementById('workoutModal');
  const modalClose = modal?.querySelector('.modal-close-btn');
  const modalContent = document.getElementById('modalWorkoutContent');
  const searchInput = document.getElementById('workoutSearchInput');
  const filterBtns = document.querySelectorAll('.filter-tab-btn');

  if (cards.length === 0) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-workout');
      let item = workoutsData[key];
      if (!item) {
        const stored = getStoredWorkouts();
        const found = stored.find(w => w.id === key);
        if (found) {
          item = {
            title: found.title,
            subtitle: found.subtitle,
            target: found.target,
            level: found.level,
            scheme: found.scheme,
            equipment: found.equipment || 'Olympic Barbell, Dumbbells & Platform',
            cues: Array.isArray(found.cues) ? found.cues : (found.cues ? found.cues.split('\n') : ['Focus on strict controlled biomechanics.'])
          };
        }
      }
      if (item && modal && modalContent) {
        const cuesArray = Array.isArray(item.cues) ? item.cues : (item.cues ? item.cues.split('\n') : ['Focus on controlled execution.']);
        modalContent.innerHTML = `
          <div style="margin-bottom: 0.2rem;">
            <span class="modal-item-subtitle">${item.subtitle}</span>
            <h3 class="modal-item-title">${item.title}</h3>
          </div>
          <div class="modal-meta-grid">
            <div class="modal-meta-cell">
              <span class="modal-meta-label">Target Muscle Groups</span>
              <span class="modal-meta-val">${item.target}</span>
            </div>
            <div class="modal-meta-cell">
              <span class="modal-meta-label">Recommended Level</span>
              <span class="modal-meta-val highlight">${item.level}</span>
            </div>
            <div class="modal-meta-cell">
              <span class="modal-meta-label">Prescribed Scheme</span>
              <span class="modal-meta-val">${item.scheme}</span>
            </div>
            <div class="modal-meta-cell">
              <span class="modal-meta-label">Required Equipment</span>
              <span class="modal-meta-val">${item.equipment}</span>
            </div>
          </div>
          <div class="modal-cues-section">
            <h4 class="modal-cues-title">BIOMECHANICAL EXECUTION CUES</h4>
            <ul class="modal-cues-list">
              ${cuesArray.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
          <button class="btn-hero-red" onclick="addToMyRoutine('${item.title}')" style="width: 100%; justify-content: center; font-size: 1.05rem; padding: 0.85rem;">
            <span>ADD TO MY TRAINING SPLIT ↗</span>
          </button>
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Unified filter and search coordination
  const applyFilters = () => {
    const activeBtn = document.querySelector('.filter-tab-btn.active');
    const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let visibleCount = 0;
    cards.forEach(card => {
      const cat = (card.getAttribute('data-category') || '').toLowerCase();
      const text = card.textContent.toLowerCase();

      const matchesCat = (filter === 'all' || cat.includes(filter));
      const matchesSearch = (!q || text.includes(q));

      if (matchesCat && matchesSearch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    let emptyMsg = document.getElementById('noWorkoutsMsg');
    const grid = document.querySelector('.programs-grid');
    if (visibleCount === 0) {
      if (!emptyMsg && grid) {
        emptyMsg = document.createElement('div');
        emptyMsg.id = 'noWorkoutsMsg';
        emptyMsg.style.cssText = 'grid-column: 1 / -1; padding: 2.5rem 1.5rem; text-align: center; color: #94a3b8; font-size: 0.95rem; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; margin: 1rem 0;';
        emptyMsg.innerHTML = '<span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🔍</span>No workouts match this filter.<br><button id="resetWorkoutBtn" style="margin-top: 1rem; background: var(--primary-red); color: #fff; padding: 0.55rem 1.2rem; border-radius: 4px; font-weight: 700; cursor: pointer; border: none;">VIEW ALL WORKOUTS</button>';
        grid.appendChild(emptyMsg);
        document.getElementById('resetWorkoutBtn')?.addEventListener('click', () => {
          const allBtn = document.querySelector('.filter-tab-btn[data-filter="all"]');
          if (allBtn) {
            filterBtns.forEach(b => b.classList.remove('active'));
            allBtn.classList.add('active');
          }
          if (searchInput) searchInput.value = '';
          applyFilters();
        });
      }
      if (emptyMsg) emptyMsg.style.display = 'block';
    } else if (emptyMsg) {
      emptyMsg.style.display = 'none';
    }
  };

  // Filter tabs
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
}

window.addToMyRoutine = function(title) {
  const modal = document.getElementById('workoutModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  showToast(`Added ${title} to your personal split!`);
};

// 3. Nutrition Lab (3-in-1 Dedicated Calculators: BMI, Protein, Calories)
function initNutritionLab() {
  const labBox = document.getElementById('nutritionLab');
  if (!labBox) return;

  const tabButtons = labBox.querySelectorAll('.nutrition-tab-btn');
  const panels = {
    bmi: document.getElementById('panelBmi'),
    protein: document.getElementById('panelProtein'),
    calories: document.getElementById('panelCalories')
  };

  // Tab Switching Handler
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      Object.keys(panels).forEach(key => {
        const panel = panels[key];
        if (panel) {
          if (key === targetTab) {
            panel.style.display = 'block';
            panel.classList.add('active');
          } else {
            panel.style.display = 'none';
            panel.classList.remove('active');
          }
        }
      });

      // Recalculate target tab immediately
      if (targetTab === 'bmi') calculateBmi();
      else if (targetTab === 'protein') calculateProtein();
      else if (targetTab === 'calories') calculateCalories();
    });
  });

  // --- 1. BMI CALCULATOR LOGIC ---
  const bmiWeightInput = document.getElementById('bmiWeight');
  const bmiHeightInput = document.getElementById('bmiHeight');
  const bmiGenderSelect = document.getElementById('bmiGender');
  const bmiAgeInput = document.getElementById('bmiAge');
  const calcBmiBtn = document.getElementById('calcBmiBtn');

  const bmiScoreVal = document.getElementById('bmiScoreVal');
  const bmiStatusPill = document.getElementById('bmiStatusPill');
  const bmiPointer = document.getElementById('bmiPointer');
  const pointerText = document.getElementById('pointerText');
  const bmiHealthyWeight = document.getElementById('bmiHealthyWeight');
  const bmiEstFat = document.getElementById('bmiEstFat');
  const bmiPonderal = document.getElementById('bmiPonderal');

  function calculateBmi() {
    const w = parseFloat(bmiWeightInput?.value) || 74;
    const h = parseFloat(bmiHeightInput?.value) || 175;
    const gender = bmiGenderSelect?.value || 'male';
    const age = parseFloat(bmiAgeInput?.value) || 25;

    const hM = h / 100;
    const bmi = w / (hM * hM);
    const bmiFixed = Math.round(bmi * 10) / 10;

    if (bmiScoreVal) bmiScoreVal.textContent = bmiFixed.toFixed(1);
    if (pointerText) pointerText.textContent = bmiFixed.toFixed(1);

    // Pointer Gauge Placement (range 15 - 35)
    if (bmiPointer) {
      const pct = Math.min(94, Math.max(6, ((bmi - 15) / (35 - 15)) * 100));
      bmiPointer.style.left = `${pct}%`;
    }

    // Status Category & Pill Styling
    if (bmiStatusPill) {
      bmiStatusPill.className = 'bmi-status-pill';
      if (bmi < 18.5) {
        bmiStatusPill.classList.add('under');
        bmiStatusPill.textContent = 'UNDERWEIGHT (< 18.5)';
      } else if (bmi < 25) {
        bmiStatusPill.classList.add('normal');
        bmiStatusPill.textContent = 'NORMAL WEIGHT (HEALTHY)';
      } else if (bmi < 30) {
        bmiStatusPill.classList.add('over');
        bmiStatusPill.textContent = 'OVERWEIGHT (HIGH MASS)';
      } else {
        bmiStatusPill.classList.add('obese');
        bmiStatusPill.textContent = 'OBESE (ELEVATED ADIPOSITY)';
      }
    }

    // Healthy weight range (BMI 18.5 - 24.9)
    if (bmiHealthyWeight) {
      const minW = Math.round((18.5 * hM * hM) * 10) / 10;
      const maxW = Math.round((24.9 * hM * hM) * 10) / 10;
      bmiHealthyWeight.innerHTML = `${minW} – ${maxW} <span class="unit">KG</span>`;
    }

    // Deurenberg Body Fat Formula
    if (bmiEstFat) {
      const genderCoeff = gender === 'male' ? 16.2 : 5.4;
      let estFat = (1.20 * bmi) + (0.23 * age) - genderCoeff;
      estFat = Math.min(48, Math.max(7, Math.round(estFat * 10) / 10));
      bmiEstFat.innerHTML = `~${estFat.toFixed(1)} <span class="unit">%</span>`;
    }

    // Ponderal Density Index (kg/m3)
    if (bmiPonderal) {
      const pi = Math.round((w / (hM * hM * hM)) * 10) / 10;
      bmiPonderal.innerHTML = `${pi.toFixed(1)} <span class="unit">KG/M³</span>`;
    }
  }

  if (calcBmiBtn) {
    calcBmiBtn.addEventListener('click', () => {
      calculateBmi();
      showToast('BMI Metrics Computed!');
    });
  }
  [bmiWeightInput, bmiHeightInput, bmiGenderSelect, bmiAgeInput].forEach(inp => {
    inp?.addEventListener('input', calculateBmi);
  });

  // --- 2. PROTEIN CALCULATOR LOGIC ---
  const proWeightInput = document.getElementById('proWeight');
  const proGoalSelect = document.getElementById('proGoal');
  const proIntensitySelect = document.getElementById('proIntensity');
  const proDietTypeSelect = document.getElementById('proDietType');
  const calcProBtn = document.getElementById('calcProBtn');

  const proDailyGrams = document.getElementById('proDailyGrams');
  const proRatioTag = document.getElementById('proRatioTag');
  const split3Meals = document.getElementById('split3Meals');
  const split4Meals = document.getElementById('split4Meals');
  const split5Meals = document.getElementById('split5Meals');
  const eqChicken = document.getElementById('eqChicken');
  const eqEggs = document.getElementById('eqEggs');
  const eqBeef = document.getElementById('eqBeef');
  const eqWhey = document.getElementById('eqWhey');

  function calculateProtein() {
    const w = parseFloat(proWeightInput?.value) || 75;
    const goal = proGoalSelect?.value || 'hypertrophy';
    const intensity = proIntensitySelect?.value || 'elite';

    let ratio = 2.0;
    if (goal === 'hypertrophy') ratio = 2.2;
    else if (goal === 'strength') ratio = 2.0;
    else if (goal === 'cut') ratio = 2.4;
    else if (goal === 'endurance') ratio = 1.6;
    else if (goal === 'maintain') ratio = 1.4;

    if (intensity === 'elite') ratio += 0.1;
    else if (intensity === 'light') ratio -= 0.1;

    ratio = Math.round(ratio * 10) / 10;
    const totalGrams = Math.round(w * ratio);
    const totalCals = totalGrams * 4;

    if (proDailyGrams) proDailyGrams.textContent = totalGrams;
    if (proRatioTag) proRatioTag.textContent = `${ratio}g per kg body weight • ${totalCals} kcal from protein`;

    if (split3Meals) split3Meals.textContent = `${Math.round(totalGrams / 3)}g`;
    if (split4Meals) split4Meals.textContent = `${Math.round(totalGrams / 4)}g`;
    if (split5Meals) split5Meals.textContent = `${Math.round(totalGrams / 5)}g`;

    // Whole Food Equivalents (Chicken 31g/100g, Eggs 6.3g/ea, Beef 26g/100g, Whey 25g/scoop)
    if (eqChicken) eqChicken.textContent = `~${Math.round((totalGrams / 31) * 100)}g`;
    if (eqEggs) eqEggs.textContent = `~${Math.round(totalGrams / 6.3)} Eggs`;
    if (eqBeef) eqBeef.textContent = `~${Math.round((totalGrams / 26) * 100)}g`;
    if (eqWhey) eqWhey.textContent = `~${(totalGrams / 25).toFixed(1)} Scoops`;
  }

  if (calcProBtn) {
    calcProBtn.addEventListener('click', () => {
      calculateProtein();
      showToast('Protein Target Computed!');
    });
  }
  [proWeightInput, proGoalSelect, proIntensitySelect, proDietTypeSelect].forEach(inp => {
    inp?.addEventListener('input', calculateProtein);
  });

  // --- 3. CALORIES & TDEE CALCULATOR LOGIC ---
  const calWeightInput = document.getElementById('calWeight');
  const calHeightInput = document.getElementById('calHeight');
  const calAgeInput = document.getElementById('calAge');
  const calActivitySelect = document.getElementById('calActivity');
  const calGoalSelect = document.getElementById('calGoal');
  const calcCalBtn = document.getElementById('calcCalBtn');

  const calTargetVal = document.getElementById('calTargetVal');
  const calDeltaBadge = document.getElementById('calDeltaBadge');
  const calTdeeVal = document.getElementById('calTdeeVal');
  const calBmrVal = document.getElementById('calBmrVal');
  const calWeeklyVal = document.getElementById('calWeeklyVal');

  const calSplitPro = document.getElementById('calSplitPro');
  const calSplitProCals = document.getElementById('calSplitProCals');
  const calSplitCarb = document.getElementById('calSplitCarb');
  const calSplitCarbCals = document.getElementById('calSplitCarbCals');
  const calSplitFat = document.getElementById('calSplitFat');
  const calSplitFatCals = document.getElementById('calSplitFatCals');

  function calculateCalories() {
    const w = parseFloat(calWeightInput?.value) || 75;
    const h = parseFloat(calHeightInput?.value) || 175;
    const age = parseFloat(calAgeInput?.value) || 25;
    const actMult = parseFloat(calActivitySelect?.value) || 1.55;
    const direction = calGoalSelect?.value || 'surplus';

    // Mifflin-St Jeor BMR Equation
    const bmr = Math.round((10 * w) + (6.25 * h) - (5 * age) + 5);
    const tdee = Math.round(bmr * actMult);

    let delta = 0;
    let badgeText = '0 kcal Neutral';
    let weeklyTrend = '0 kcal / week';

    if (direction === 'surplus') {
      delta = 350;
      badgeText = '+350 kcal Surplus (Clean Bulk)';
      weeklyTrend = '+2,450 kcal / week';
    } else if (direction === 'cut') {
      delta = -500;
      badgeText = '-500 kcal Deficit (Fat Strip)';
      weeklyTrend = '-3,500 kcal / week (~0.45kg fat loss)';
    } else {
      delta = 0;
      badgeText = '0 kcal (Recomposition / Maintenance)';
      weeklyTrend = '0 kcal / week (Weight Stability)';
    }

    const targetCalories = Math.max(1200, tdee + delta);

    if (calTargetVal) calTargetVal.textContent = targetCalories.toLocaleString();
    if (calTdeeVal) calTdeeVal.textContent = tdee.toLocaleString();
    if (calBmrVal) calBmrVal.textContent = bmr.toLocaleString();
    if (calDeltaBadge) calDeltaBadge.textContent = badgeText;
    if (calWeeklyVal) calWeeklyVal.textContent = weeklyTrend;

    // Macro distribution: 25% protein, 50% carbs, 25% fats
    const proG = Math.round((targetCalories * 0.25) / 4);
    const carbG = Math.round((targetCalories * 0.50) / 4);
    const fatG = Math.round((targetCalories * 0.25) / 9);

    if (calSplitPro) calSplitPro.innerHTML = `${proG} <span class="unit">g</span>`;
    if (calSplitProCals) calSplitProCals.textContent = `${proG * 4} kcal`;
    if (calSplitCarb) calSplitCarb.innerHTML = `${carbG} <span class="unit">g</span>`;
    if (calSplitCarbCals) calSplitCarbCals.textContent = `${carbG * 4} kcal`;
    if (calSplitFat) calSplitFat.innerHTML = `${fatG} <span class="unit">g</span>`;
    if (calSplitFatCals) calSplitFatCals.textContent = `${fatG * 9} kcal`;
  }

  if (calcCalBtn) {
    calcCalBtn.addEventListener('click', () => {
      calculateCalories();
      showToast('Energy Needs Computed!');
    });
  }
  [calWeightInput, calHeightInput, calAgeInput, calActivitySelect, calGoalSelect].forEach(inp => {
    inp?.addEventListener('input', calculateCalories);
  });

  // Initial Calculation Run for all three
  calculateBmi();
  calculateProtein();
  calculateCalories();
}

window.downloadDietBlueprint = function(name) {
  showToast(`Downloading ${name} protocol (PDF)...`);
  setTimeout(() => {
    showToast(`PDF ready! Check your downloads.`);
  }, 900);
};

// 4. Collaborations Inquiry Form
function initCollabForm() {
  const form = document.getElementById('collabInquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('collabName').value;
    const brand = document.getElementById('collabBrand').value;
    const type = document.getElementById('collabType').value;

    showToast(`Partnership inquiry submitted for ${brand || name}!`);
    alert(`Thank you, ${name}!\n\nYour collaboration proposal for ${brand || 'your brand'} (${type}) has been transmitted to the Odd Fitness Partnerships Board. Our team will review your deck within 24-48 business hours.`);
    form.reset();
  });
}

// 5. Toast Notifications
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" fill="var(--primary-red)" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// 5. Strength 1-Rep Max & Training Zones Calculator
function initStrengthCalculator() {
  const calcBtn = document.getElementById('calcStrengthBtn');
  const weightInput = document.getElementById('strengthWeight');
  const repsInput = document.getElementById('strengthReps');
  const res1RM = document.getElementById('res1RM');
  const res90 = document.getElementById('res90');
  const res80 = document.getElementById('res80');
  const res70 = document.getElementById('res70');

  if (!calcBtn || !weightInput || !repsInput) return;

  const update = () => {
    const w = parseFloat(weightInput.value) || 100;
    const r = Math.min(10, Math.max(1, parseInt(repsInput.value) || 5));
    // Epley Gold Standard Formula: 1RM = w * (1 + r / 30)
    const oneRM = r === 1 ? w : Math.round((w * (1 + r / 30)) * 10) / 10;
    const p90 = Math.round((oneRM * 0.9) * 10) / 10;
    const p80 = Math.round((oneRM * 0.8) * 10) / 10;
    const p70 = Math.round((oneRM * 0.7) * 10) / 10;

    if (res1RM) res1RM.innerHTML = `${oneRM.toFixed(1)} <span class="unit">KG</span>`;
    if (res90) res90.innerHTML = `${p90.toFixed(1)} <span class="unit">KG</span>`;
    if (res80) res80.innerHTML = `${p80.toFixed(1)} <span class="unit">KG</span>`;
    if (res70) res70.innerHTML = `${p70.toFixed(1)} <span class="unit">KG</span>`;
  };

  calcBtn.addEventListener('click', () => {
    update();
    showToast('Strength Matrix Recalculated!');
  });
  weightInput.addEventListener('input', update);
  repsInput.addEventListener('input', update);
}

// 6. Collaboration Showcase Interactive Modal
function initCollabModal() {
  const modal = document.getElementById('collabModal');
  const modalClose = document.getElementById('collabModalClose');
  const modalBody = document.getElementById('collabModalBody');
  const collabCards = document.querySelectorAll('.collab-card');

  if (!modal || !modalBody) return;

  const collabData = {
    'raawr': {
      brand: 'RAAWR OFFICIAL',
      category: 'ATHLETIC STREETWEAR & APPAREL',
      product: 'Signature Minimalist Oversized Gym Tee',
      img: 'assets/images/collab-raawr.jpg',
      code: 'SAIF',
      codeLabel: 'EXCLUSIVE PROMO CODE',
      link: 'https://raawr.in',
      linkText: 'Visit raawr.in',
      handle: '@raawr.official',
      desc: 'Heavyweight premium cotton training apparel crafted for effortless breathability, unrestricted range of motion, and a sharp athletic street aesthetic. Built to endure intense gym training sessions while maintaining structured drape.'
    },
    'coitonic': {
      brand: 'COITONIC',
      category: 'PERFORMANCE SPORTSWEAR',
      product: 'Elite Compression Tee & Athletic Cap',
      img: 'assets/images/collab-coitonic.png',
      code: 'Saif05',
      codeLabel: 'EXCLUSIVE PROMO CODE',
      link: 'https://coitonic.com',
      linkText: 'Visit coitonic.com',
      handle: '@coitonic',
      desc: 'Engineered moisture-wicking compression fits designed to enhance muscle support, biomechanical mobility, and temperature control during heavy sessions. Featuring aerodynamic seams and anti-chafing construction.'
    },
    'gymelt': {
      brand: 'GYMELT',
      category: 'FUNCTIONAL PROTEIN TREATS',
      product: 'Belgian Chocolate Ice Cream & Protein Shake',
      img: 'assets/images/collab-gymelt.png',
      code: '35G PROTEIN',
      codeLabel: 'PROTEIN RATIO',
      link: 'https://instagram.com/gymelt_official',
      linkText: 'Follow @gymelt_official',
      handle: '@gymelt_official',
      desc: 'Guilt-free athlete indulgence formulated with 35g protein per tub, low calories, zero added sugars, and rich fiber for clean post-workout muscle recovery and cravings satisfaction.'
    },
    'slovic': {
      brand: 'SLOVIC FITNESS',
      category: 'STRENGTH & HOME RIGS',
      product: 'Doorway Pull-Up & Bodyweight Anchor Bar',
      img: 'assets/images/collab-slovic.png',
      code: 'HOME RIG',
      codeLabel: 'RIG TYPE',
      link: 'https://instagram.com/slovicfitness',
      linkText: 'Follow @slovicfitness',
      handle: '@slovicfitness',
      desc: 'Heavy-duty calisthenics door rig engineered with ergonomic grip padding, high weight tolerance, and zero-drill rapid installation for elite home bodyweight workouts.'
    },
    'zsk-oats': {
      brand: 'ZSK NUTS (SAFA)',
      category: 'PERFORMANCE NUTRITION',
      product: 'High Protein Dark Chocolate Oats (22g Protein)',
      img: 'assets/images/collab-zsk-oats.png',
      code: '22G PROTEIN',
      codeLabel: 'PROTEIN / SERVING',
      link: 'https://zsknuts.com',
      linkText: 'Visit zsknuts.com',
      handle: '@safadryfruitsandspices',
      desc: 'Clean athletic breakfast formula packed with complex carbohydrates, dietary fiber, and 22g high-grade protein per serving for sustained training energy.'
    },
    'zsk-bundle': {
      brand: 'SAFA & ZSK NUTS',
      category: 'SUPERFOODS & RECOVERY',
      product: 'Athlete Bundle: Shilajit, Oats & Nut Butters',
      img: 'assets/images/collab-zsk-products.jpg',
      code: 'ATHLETE HAUL',
      codeLabel: 'POWER BUNDLE',
      link: 'https://safadryfruitsandspices.com',
      linkText: 'Visit safadryfruitsandspices.com',
      handle: '@zsknuts',
      desc: 'All-in-one power haul featuring 1kg High Protein Oats, pure Himalayan Shilajit Gold Resin, crunchy Almond Peanut Butter, and calibrated gym shaker.'
    },
    'cleancrate': {
      brand: 'THE CLEAN CRATE',
      category: 'CLEAN FUNCTIONAL FOODS',
      product: 'Quick-To-Prepare Oats (Mocha Rush & Thai Mango)',
      img: 'assets/images/collab-cleancrate.png',
      code: '25G+ PROTEIN',
      codeLabel: 'PROTEIN / 100G',
      link: 'https://instagram.com/thecleancratefoods',
      linkText: 'Follow @thecleancratefoods',
      handle: '@thecleancratefoods',
      desc: 'Wholesome natural oat blend infused with 25g+ protein per 100g, dried fruits, super seeds, zero refined sugars, and curated meal shaker for instant fuel on the go.'
    }
  };

  const openModal = (id) => {
    let item = collabData[id];
    if (!item && typeof getStoredCollabs === 'function') {
      const stored = getStoredCollabs();
      item = stored.find(c => c.id === id);
    }
    if (!item) return;

    modalBody.innerHTML = `
      <div class="collab-modal-grid">
        <div class="collab-modal-img-frame">
          <img src="${item.img}" alt="${item.brand} Collaboration">
        </div>
        <div class="collab-modal-info">
          <span class="collab-modal-cat">${item.category}</span>
          <h2 class="collab-modal-title">${item.brand}</h2>
          <div class="collab-modal-product">${item.product}</div>
          <p class="collab-modal-desc">${item.desc}</p>
          
          <div class="collab-modal-code-card">
            <div class="collab-modal-code-meta">
              <span class="collab-modal-code-lbl">${item.codeLabel || 'PROMO CODE'}</span>
              <span class="collab-modal-code-val">${item.code || 'OFFICIAL'}</span>
            </div>
            <button class="btn-copy-code" type="button" onclick="navigator.clipboard.writeText('${item.code || ''}'); showToast('Copied: ${item.code || ''}');">
              COPY CODE
            </button>
          </div>

          <div class="collab-modal-links-row">
            <a href="${item.link || '#'}" target="_blank" rel="noopener" class="collab-modal-btn primary">
              ${item.linkText || 'Visit Brand'} ↗
            </a>
            <span class="collab-handle-text">${item.handle || '@oddfitness'}</span>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.openCollabModal = openModal;

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  collabCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') return;
      const id = card.getAttribute('data-collab-id');
      if (id) openModal(id);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ==========================================================================
// 7. CLIENT PORTAL & ADMINISTRATIVE MANAGEMENT
// ==========================================================================

const DEFAULT_CREDS = { username: 'Admin', password: 'odd2026' };

function getStoredCreds() {
  const raw = localStorage.getItem('odd_client_creds');
  if (!raw) {
    localStorage.setItem('odd_client_creds', JSON.stringify(DEFAULT_CREDS));
    return DEFAULT_CREDS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_CREDS;
  }
}

const DEFAULT_WORKOUTS = [
  {
    id: 'strength',
    title: 'STRENGTH & ENDURANCE',
    subtitle: 'Olympic Powerlifting & Gymnastic Rings',
    category: 'strength',
    target: 'Chest, Upper Back, Delts, Triceps, Grip',
    level: 'Advanced Athlete',
    scheme: '5 Sets × 5-8 Heavy Reps (RPE 8-9)',
    equipment: 'Eleiko Olympic Barbell, Chalk, Wooden Rings',
    image: 'assets/images/strength-endurance.jpg',
    cues: 'Retract and depress scapula prior to unrack to stabilize glenohumeral joint.\nBrace core using Valsalva maneuver; drive floor away through midfoot.\nLock out with strict hip and glute contraction at top of movement.'
  },
  {
    id: 'cycle',
    title: 'INDOOR CYCLE',
    subtitle: 'High-Cadence Rhythm & Anaerobic Sprints',
    category: 'cardio',
    target: 'Quadriceps, Hamstrings, Calves, Cardiovascular Engine',
    level: 'All Fitness Levels',
    scheme: '45 Mins: 8x (30s Max Cadence Sprint / 60s Recovery)',
    equipment: 'Wattbike Commercial Smart Trainer, SPD Cleats',
    image: 'assets/images/indoor-cycle.jpg',
    cues: 'Maintain flat spine and neutral pelvis without bouncing in the saddle.\nPull pedals through bottom stroke to engage hamstrings actively.\nKeep cadence between 105-120 RPM during high-intensity intervals.'
  },
  {
    id: 'intensity',
    title: 'HIGH INTENSITY (HIIT)',
    subtitle: 'Metabolic Conditioning & Rotational Core',
    category: 'crossfit',
    target: 'Rectus Abdominis, Obliques, Shoulders, Heart Rate Zones',
    level: 'Intermediate - Advanced',
    scheme: 'Tabata Protocol: 8 Rounds (20s Max Effort / 10s Rest)',
    equipment: 'Assault AirBike, Medicine Balls, Kettlebells',
    image: 'assets/images/high-intensity.jpg',
    cues: 'Drive heart rate into 85-95% Max HR zone in initial 15 seconds.\nAvoid hyperextending lumbar spine during rotational slams.\nBreathe rhythmically during work intervals to avoid premature fatigue.'
  },
  {
    id: 'mind',
    title: 'MIND & BODY MOBILITY',
    subtitle: 'Ashtanga Flow, Fascia Release & Breathwork',
    category: 'mobility',
    target: 'Hip Flexors, Thoracic Spine, Hamstrings, Nervous System',
    level: 'All Levels / Active Recovery',
    scheme: '50 Mins Flow + 10 Mins Diaphragmatic Breathwork',
    equipment: 'High-Density Foam Roller, Yoga Mat, Mobility Bands',
    image: 'assets/images/mind-body.jpg',
    cues: 'Synchronize movement to slow nasal inhalation and prolonged exhalations.\nRelax jaw, neck, and shoulders to de-escalate sympathetic tone.\nHold deep end-range hip opening stretches for 90-120 seconds.'
  },
  {
    id: 'crossfit',
    title: 'CROSSFIT WORKOUT',
    subtitle: 'Heavy Battle Ropes & Explosive Olympic Complexes',
    category: 'crossfit',
    target: 'Posterior Chain, Traps, Forearms, Core Bracing',
    level: 'Beast Mode / High Work Capacity',
    scheme: '5 Rounds For Time: 40 Waves + 10 Power Cleans + 20 Box Jumps',
    equipment: '50mm Heavy Manila Ropes, 20kg Barbell, Bumper Plates',
    image: 'assets/images/crossfit-workout.jpg',
    cues: 'Adopt an athletic quarter-squat stance with anchored heels.\nGenerate rope undulations through shoulder and lat drive, not wrist flick.\nExplosive triple extension (ankles, knees, hips) on Olympic cleans.'
  },
  {
    id: 'whole',
    title: 'WHOLE BODY CONDITIONING',
    subtitle: 'Kinetic Chain Synergy & Functional Movement',
    category: 'strength',
    target: 'Full Body Kinetic Chain, Core Stabilizers, Latissimus',
    level: 'Beginner to Intermediate',
    scheme: '4 Sets × 12 Reps per station (Circuit Format)',
    equipment: 'Competition Kettlebells, TRX Suspension, Resistance Bands',
    image: 'assets/images/whole-body.jpg',
    cues: 'Maintain continuous tension on cables and bands throughout negative tempo.\nHinge deeply at hips during kettlebell swings; avoid squatting movement.\nContract pelvic floor and lower transversus abdominis on every exhale.'
  }
];

function sanitizeWorkoutImage(img) {
  if (!img) return 'assets/images/strength-endurance.jpg';
  if (img.includes('mind-mobility')) return 'assets/images/mind-body.jpg';
  if (img.includes('crossfit.jpg')) return 'assets/images/crossfit-workout.jpg';
  return img;
}

function getStoredWorkouts() {
  const raw = localStorage.getItem('odd_workouts_data');
  if (!raw) {
    try {
      localStorage.setItem('odd_workouts_data', JSON.stringify(DEFAULT_WORKOUTS));
    } catch (e) {}
    return DEFAULT_WORKOUTS;
  }
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      try {
        localStorage.setItem('odd_workouts_data', JSON.stringify(DEFAULT_WORKOUTS));
      } catch (e) {}
      return DEFAULT_WORKOUTS;
    }
    // Sanitize any broken legacy image paths
    const cleaned = list.map(item => ({
      ...item,
      image: sanitizeWorkoutImage(item.image)
    }));
    try {
      localStorage.setItem('odd_workouts_data', JSON.stringify(cleaned));
    } catch (e) {}
    return cleaned;
  } catch (e) {
    try {
      localStorage.setItem('odd_workouts_data', JSON.stringify(DEFAULT_WORKOUTS));
    } catch (e) {}
    return DEFAULT_WORKOUTS;
  }
}

const DEFAULT_NUTRITION = [
  {
    id: 'titan',
    name: 'THE MASS TITAN',
    pill: 'HYPERTROPHY BULK',
    desc: 'Engineered for clean mass accretion with minimal visceral fat gain. Sustained energy for double sessions.',
    breakfast: '4 Pasture Eggs, Oats, Blueberries & Almonds',
    lunch: '220g Sirloin Steak, Sweet Potato, Asparagus',
    snack: 'Whey Isolate, Cream of Rice & Honey',
    dinner: '250g Grilled Salmon, Quinoa, Mixed Greens',
    image: 'assets/images/nutrition-diet.jpg'
  },
  {
    id: 'stripper',
    name: 'METABOLIC STRIPPER',
    pill: 'FAT-SHRED PROTOCOL',
    desc: 'High satiety, single-digit body fat target. Preserves lean tissue while mobilizing stubborn fat stores.',
    breakfast: '5 Egg White Omelet, Spinach, Half Avocado',
    lunch: '200g Lean Chicken Breast, Broccoli, Olive Oil',
    snack: 'Odd Fitness Casein Shake & Chia Seeds',
    dinner: '220g White Fish / Cod, Cauliflower Rice, Greens',
    image: 'assets/images/collab-zsk-oats.png'
  },
  {
    id: 'vegan',
    name: 'VEGAN GLADIATOR',
    pill: 'PLANT ATHLETE',
    desc: '100% plant-based complete amino acid profile for clean stamina, zero bloating, and rapid systemic recovery.',
    breakfast: 'Tofu Scramble, Sprouted Toast, Avocado',
    lunch: 'Tempeh Bowl, Black Beans, Brown Rice, Tahini',
    snack: 'Hemp & Pea Protein Shake with Peanut Butter',
    dinner: 'Red Lentil Dahl, Roasted Veggies, Pumpkin Seeds',
    image: 'assets/images/collab-cleancrate.png'
  }
];

function sanitizeNutritionImage(img) {
  if (!img || img.includes('nutrition-main')) return 'assets/images/nutrition-diet.jpg';
  return img;
}

function getStoredNutrition() {
  const raw = localStorage.getItem('odd_nutrition_data');
  if (!raw) {
    try {
      localStorage.setItem('odd_nutrition_data', JSON.stringify(DEFAULT_NUTRITION));
    } catch (e) {}
    return DEFAULT_NUTRITION;
  }
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      try {
        localStorage.setItem('odd_nutrition_data', JSON.stringify(DEFAULT_NUTRITION));
      } catch (e) {}
      return DEFAULT_NUTRITION;
    }
    const cleaned = list.map((item, idx) => ({
      ...item,
      image: sanitizeNutritionImage(item.image || DEFAULT_NUTRITION[idx % DEFAULT_NUTRITION.length]?.image)
    }));
    try {
      localStorage.setItem('odd_nutrition_data', JSON.stringify(cleaned));
    } catch (e) {}
    return cleaned;
  } catch (e) {
    try {
      localStorage.setItem('odd_nutrition_data', JSON.stringify(DEFAULT_NUTRITION));
    } catch (e) {}
    return DEFAULT_NUTRITION;
  }
}

const DEFAULT_COLLABS = [
  {
    id: 'raawr',
    brand: 'RAAWR OFFICIAL',
    category: 'ATHLETIC STREETWEAR & APPAREL',
    product: 'Signature Minimalist Oversized Gym Tee',
    img: 'assets/images/collab-raawr.jpg',
    code: 'SAIF',
    codeLabel: 'EXCLUSIVE PROMO CODE',
    link: 'https://raawr.in',
    linkText: 'Visit raawr.in',
    handle: '@raawr.official',
    desc: 'Heavyweight premium cotton training apparel crafted for effortless breathability, unrestricted range of motion, and a sharp athletic street aesthetic.'
  },
  {
    id: 'coitonic',
    brand: 'COITONIC',
    category: 'PERFORMANCE SPORTSWEAR',
    product: 'Elite Compression Tee & Athletic Cap',
    img: 'assets/images/collab-coitonic.png',
    code: 'Saif05',
    codeLabel: 'EXCLUSIVE PROMO CODE',
    link: 'https://coitonic.com',
    linkText: 'Visit coitonic.com',
    handle: '@coitonic',
    desc: 'Engineered moisture-wicking compression fits designed to enhance muscle support, biomechanical mobility, and temperature control during heavy sessions.'
  },
  {
    id: 'gymelt',
    brand: 'GYMELT',
    category: 'FUNCTIONAL PROTEIN TREATS',
    product: 'Belgian Chocolate Ice Cream & Protein Shake',
    img: 'assets/images/collab-gymelt.png',
    code: '35G PROTEIN',
    codeLabel: 'PROTEIN RATIO',
    link: 'https://instagram.com/gymelt_official',
    linkText: 'Follow @gymelt_official',
    handle: '@gymelt_official',
    desc: 'Guilt-free athlete indulgence formulated with 35g protein per tub, low calories, zero added sugars, and rich fiber for clean post-workout muscle recovery.'
  },
  {
    id: 'slovic',
    brand: 'SLOVIC FITNESS',
    category: 'STRENGTH & HOME RIGS',
    product: 'Doorway Pull-Up & Bodyweight Anchor Bar',
    img: 'assets/images/collab-slovic.png',
    code: 'HOME RIG',
    codeLabel: 'RIG TYPE',
    link: 'https://instagram.com/slovicfitness',
    linkText: 'Follow @slovicfitness',
    handle: '@slovicfitness',
    desc: 'Heavy-duty calisthenics door rig engineered with ergonomic grip padding, high weight tolerance, and zero-drill rapid installation for elite home bodyweight workouts.'
  },
  {
    id: 'zsk-oats',
    brand: 'ZSK NUTS (SAFA)',
    category: 'PERFORMANCE NUTRITION',
    product: 'High Protein Dark Chocolate Oats (22g Protein)',
    img: 'assets/images/collab-zsk-oats.png',
    code: '22G PROTEIN',
    codeLabel: 'PROTEIN / SERVING',
    link: 'https://zsknuts.com',
    linkText: 'Visit zsknuts.com',
    handle: '@safadryfruitsandspices',
    desc: 'Clean athletic breakfast formula packed with complex carbohydrates, dietary fiber, and 22g high-grade protein per serving for sustained training energy.'
  },
  {
    id: 'zsk-bundle',
    brand: 'SAFA & ZSK NUTS',
    category: 'SUPERFOODS & RECOVERY',
    product: 'Athlete Bundle: Shilajit, Oats & Nut Butters',
    img: 'assets/images/collab-zsk-products.jpg',
    code: 'ATHLETE HAUL',
    codeLabel: 'POWER BUNDLE',
    link: 'https://safadryfruitsandspices.com',
    linkText: 'Visit safadryfruitsandspices.com',
    handle: '@zsknuts',
    desc: 'All-in-one power haul featuring 1kg High Protein Oats, pure Himalayan Shilajit Gold Resin, crunchy Almond Peanut Butter, and calibrated gym shaker.'
  },
  {
    id: 'cleancrate',
    brand: 'THE CLEAN CRATE',
    category: 'CLEAN FUNCTIONAL FOODS',
    product: 'Quick-To-Prepare Oats (Mocha Rush & Thai Mango)',
    img: 'assets/images/collab-cleancrate.png',
    code: '25G+ PROTEIN',
    codeLabel: 'PROTEIN / 100G',
    link: 'https://instagram.com/thecleancratefoods',
    linkText: 'Follow @thecleancratefoods',
    handle: '@thecleancratefoods',
    desc: 'Wholesome natural oat blend infused with 25g+ protein per 100g, dried fruits, super seeds, zero refined sugars, and curated meal shaker for instant fuel on the go.'
  }
];

function getStoredCollabs() {
  const raw = localStorage.getItem('odd_collabs_data');
  if (!raw) {
    localStorage.setItem('odd_collabs_data', JSON.stringify(DEFAULT_COLLABS));
    return DEFAULT_COLLABS;
  }
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem('odd_collabs_data', JSON.stringify(DEFAULT_COLLABS));
      return DEFAULT_COLLABS;
    }
    return list;
  } catch (e) {
    localStorage.setItem('odd_collabs_data', JSON.stringify(DEFAULT_COLLABS));
    return DEFAULT_COLLABS;
  }
}

function compressImageFile(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function initClientPortal() {
  const loginSection = document.getElementById('portalLoginSection');
  const dashSection = document.getElementById('portalDashboardSection');
  const loginForm = document.getElementById('portalLoginForm');
  const userInput = document.getElementById('portalUser');
  const passwordInput = document.getElementById('portalPassword');
  const quickCreds = document.getElementById('quickCredsPill');
  const btnOneClickLogin = document.getElementById('btnOneClickLogin');
  const logoutBtn = document.getElementById('portalLogoutBtn');

  // Eye toggle on login form password input
  const toggleLoginPassBtn = document.getElementById('toggleLoginPasswordBtn');
  const loginEyeIcon = document.getElementById('loginPasswordEyeIcon');

  if (toggleLoginPassBtn && passwordInput) {
    toggleLoginPassBtn.addEventListener('click', () => {
      const isPass = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPass ? 'text' : 'password');
      if (loginEyeIcon) loginEyeIcon.textContent = isPass ? '🔒' : '👁️';
    });
  }

  // Eye toggle on new password input (Security tab)
  const secNewPassInput = document.getElementById('secNewPassword');
  const toggleNewPassBtn = document.getElementById('toggleNewPasswordBtn');
  const newPassEyeIcon = document.getElementById('newPasswordEyeIcon');

  if (toggleNewPassBtn && secNewPassInput) {
    toggleNewPassBtn.addEventListener('click', () => {
      const isPass = secNewPassInput.getAttribute('type') === 'password';
      secNewPassInput.setAttribute('type', isPass ? 'text' : 'password');
      if (newPassEyeIcon) newPassEyeIcon.textContent = isPass ? '🔒' : '👁️';
    });
  }

  // Stored password reveal on demand ("and the pass word should be appered")
  const dispCurrentPass = document.getElementById('dispCurrentPassword');
  const btnRevealStoredPassword = document.getElementById('btnRevealStoredPassword');
  const revealBtnText = document.getElementById('revealBtnText');
  let isPasswordRevealed = false;

  function updateStoredPasswordDisplay() {
    const creds = getStoredCreds();
    if (!dispCurrentPass) return;
    if (isPasswordRevealed) {
      dispCurrentPass.textContent = creds.password;
      dispCurrentPass.classList.remove('password-masked');
      if (revealBtnText) revealBtnText.textContent = 'HIDE PASSWORD 🔒';
    } else {
      dispCurrentPass.textContent = '••••••••';
      dispCurrentPass.classList.add('password-masked');
      if (revealBtnText) revealBtnText.textContent = 'SHOW PASSWORD 👁️';
    }
  }

  if (btnRevealStoredPassword) {
    btnRevealStoredPassword.addEventListener('click', () => {
      isPasswordRevealed = !isPasswordRevealed;
      updateStoredPasswordDisplay();
      if (isPasswordRevealed) {
        showToast('Active password revealed!');
      }
    });
  }

  // Quick one-click instant login button
  if (btnOneClickLogin) {
    btnOneClickLogin.addEventListener('click', () => {
      const creds = getStoredCreds();
      if (userInput) userInput.value = creds.username;
      if (passwordInput) passwordInput.value = creds.password;
      sessionStorage.setItem('odd_client_logged_in', 'true');
      localStorage.setItem('odd_client_logged_in', 'true');
      showToast(`Welcome back, ${creds.username}!`);
      renderPortalDashboard();
    });
  }

  // Quick creds pill click
  if (quickCreds && userInput && passwordInput) {
    quickCreds.addEventListener('click', () => {
      const creds = getStoredCreds();
      userInput.value = creds.username;
      passwordInput.value = creds.password;
      sessionStorage.setItem('odd_client_logged_in', 'true');
      localStorage.setItem('odd_client_logged_in', 'true');
      showToast('Autofilled credentials & access granted!');
      renderPortalDashboard();
    });
  }

  // Login form handler
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredUser = (userInput?.value || '').trim();
      const enteredPass = passwordInput?.value || '';
      const currentCreds = getStoredCreds();

      if (
        enteredUser.toLowerCase() === currentCreds.username.toLowerCase() &&
        enteredPass === currentCreds.password
      ) {
        sessionStorage.setItem('odd_client_logged_in', 'true');
        localStorage.setItem('odd_client_logged_in', 'true');
        showToast(`Access granted! Welcome, ${currentCreds.username}`);
        renderPortalDashboard();
      } else {
        alert(`Authentication Error!\n\nInvalid Client Name or Password.\nHint: Use "${currentCreds.username}" with current password "${currentCreds.password}".`);
      }
    });
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('odd_client_logged_in');
      localStorage.removeItem('odd_client_logged_in');
      showToast('Logged out of Client Portal.');
      renderPortalDashboard();
    });
  }

  // Render dashboard state
  function renderPortalDashboard() {
    if (!loginSection || !dashSection) return;
    const isLoggedIn = sessionStorage.getItem('odd_client_logged_in') === 'true' ||
                       localStorage.getItem('odd_client_logged_in') === 'true';
    const creds = getStoredCreds();

    if (loginSection) loginSection.style.display = 'none';
    if (dashSection) dashSection.style.display = 'block';

    // Update welcome & credential reviews
    const dashClientTitle = document.getElementById('dashClientNameTitle');
    const dispCurrentName = document.getElementById('dispCurrentName');
    const secClientNameInput = document.getElementById('secClientName');

    if (dashClientTitle) dashClientTitle.textContent = creds.username.toUpperCase();
    if (dispCurrentName) dispCurrentName.textContent = creds.username;
    if (secClientNameInput) secClientNameInput.value = creds.username;
    updateStoredPasswordDisplay();

    // Render management items
    renderPortalWorkouts();
    renderPortalNutrition();
    renderPortalCollabs();

    // Refresh header login state (Strictly KEEP button as "LOGIN")
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const headerLoginText = document.getElementById('headerLoginText');
    if (headerLoginBtn && headerLoginText) {
      headerLoginText.textContent = 'LOGIN';
    }
  }

  // Portal Nav Tabs
  const tabBtns = document.querySelectorAll('.portal-tab-btn');
  const tabPanels = document.querySelectorAll('.portal-tab-panel');
  function switchPortalTab(targetId) {
    tabBtns.forEach(b => {
      if (b.getAttribute('data-tab') === targetId) {
        b.classList.add('active');
        try {
          b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } catch (_) {}
      } else {
        b.classList.remove('active');
      }
    });
    tabPanels.forEach(p => {
      if (p.id === targetId) p.classList.add('active');
      else p.classList.remove('active');
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      switchPortalTab(targetId);
    });
  });

  // Stat pills click shortcuts
  const statPills = document.querySelectorAll('.portal-stat-pill');
  const targetTabs = ['tabWorkouts', 'tabNutrition', 'tabCollabs', 'tabSecurity'];
  statPills.forEach((pill, idx) => {
    pill.style.cursor = 'pointer';
    pill.title = 'Click to jump to this section';
    pill.addEventListener('click', () => {
      if (targetTabs[idx]) switchPortalTab(targetTabs[idx]);
    });
  });

  // Custom file upload button triggers
  document.querySelectorAll('.custom-file-upload-btn').forEach(lbl => {
    lbl.addEventListener('click', (e) => {
      const forId = lbl.getAttribute('for');
      if (forId) {
        const inp = document.getElementById(forId);
        if (inp && e.target !== inp) {
          inp.click();
        }
      }
    });
  });

  // Security Form (Change Name & Password)
  const secForm = document.getElementById('securityUpdateForm');
  if (secForm) {
    secForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('secClientName')?.value.trim();
      const newPass = document.getElementById('secNewPassword')?.value;
      const confirmPass = document.getElementById('secConfirmPassword')?.value;

      if (!newName) {
        alert('Please enter a valid Client Name.');
        return;
      }
      if (newPass !== confirmPass) {
        alert('Passwords do not match! Please verify both new password fields.');
        return;
      }
      if (newPass.length < 4) {
        alert('Password must be at least 4 characters.');
        return;
      }

      // Save updated credentials
      const updatedCreds = { username: newName, password: newPass };
      localStorage.setItem('odd_client_creds', JSON.stringify(updatedCreds));

      // Update UI displays
      const dashClientTitle = document.getElementById('dashClientNameTitle');
      const dispCurrentName = document.getElementById('dispCurrentName');
      if (dashClientTitle) dashClientTitle.textContent = newName.toUpperCase();
      if (dispCurrentName) dispCurrentName.textContent = newName;
      updateStoredPasswordDisplay();

      // Reset password fields
      const p1 = document.getElementById('secNewPassword');
      const p2 = document.getElementById('secConfirmPassword');
      if (p1) p1.value = '';
      if (p2) p2.value = '';

      showToast(`Credentials updated! Client: ${newName}`);
      alert(`Success! Security Credentials Updated.\n\nClient Name: ${newName}\nPassword: ${newPass}\n\nYou can click "SHOW PASSWORD" in your active credentials card at any time to verify.`);
    });
  }

  // --- WORKOUTS MANAGEMENT ---
  const toggleAddWorkoutBtn = document.getElementById('toggleAddWorkoutBtn');
  const addWorkoutBox = document.getElementById('addWorkoutBox');
  const cancelWorkoutBtn = document.getElementById('cancelWorkoutBtn');
  const addWorkoutForm = document.getElementById('addWorkoutForm');

  // Workout Image Upload & Live Preview Controls
  const workoutImgFileInput = document.getElementById('workoutImgFile');
  const workoutImgUrlInput = document.getElementById('workoutImgUrl');
  const workoutImgPresetSelect = document.getElementById('workoutImgPreset');
  const workoutImgPreviewBox = document.getElementById('workoutImgPreviewBox');
  const workoutPreviewImg = document.getElementById('workoutPreviewImg');
  const workoutFileNameSpan = document.getElementById('workoutFileName');
  const btnClearWorkoutImg = document.getElementById('btnClearWorkoutImg');
  let selectedWorkoutImageData = '';

  function setWorkoutPreview(src, name) {
    selectedWorkoutImageData = src;
    if (workoutPreviewImg) workoutPreviewImg.src = src;
    if (workoutImgPreviewBox) workoutImgPreviewBox.style.display = 'block';
    if (workoutFileNameSpan) workoutFileNameSpan.textContent = name || 'Photo Attached';
  }

  function clearWorkoutPreview() {
    selectedWorkoutImageData = '';
    if (workoutPreviewImg) workoutPreviewImg.src = '';
    if (workoutImgPreviewBox) workoutImgPreviewBox.style.display = 'none';
    if (workoutFileNameSpan) workoutFileNameSpan.textContent = 'No file selected (or enter URL / choose preset below)';
    if (workoutImgFileInput) workoutImgFileInput.value = '';
    if (workoutImgUrlInput) workoutImgUrlInput.value = '';
    if (workoutImgPresetSelect) workoutImgPresetSelect.value = '';
  }

  if (workoutImgFileInput) {
    workoutImgFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        showToast(`Processing photo: ${file.name}...`);
        const compressed = await compressImageFile(file);
        setWorkoutPreview(compressed, file.name);
        showToast(`Photo attached: ${file.name}`);
      }
    });
  }

  if (workoutImgUrlInput) {
    workoutImgUrlInput.addEventListener('input', () => {
      const val = workoutImgUrlInput.value.trim();
      if (val) {
        setWorkoutPreview(val, 'URL: ' + val.substring(0, 24) + '...');
      }
    });
  }

  if (workoutImgPresetSelect) {
    workoutImgPresetSelect.addEventListener('change', () => {
      const val = workoutImgPresetSelect.value;
      if (val) {
        setWorkoutPreview(val, workoutImgPresetSelect.options[workoutImgPresetSelect.selectedIndex].text);
      }
    });
  }

  if (btnClearWorkoutImg) {
    btnClearWorkoutImg.addEventListener('click', clearWorkoutPreview);
  }

  if (toggleAddWorkoutBtn && addWorkoutBox) {
    toggleAddWorkoutBtn.addEventListener('click', () => {
      const isHidden = addWorkoutBox.style.display === 'none';
      addWorkoutBox.style.display = isHidden ? 'block' : 'none';
      toggleAddWorkoutBtn.innerHTML = isHidden ? '<span>✕</span> CLOSE FORM' : '<span>+</span> ADD NEW WORKOUT';
    });
  }
  if (cancelWorkoutBtn && addWorkoutBox && toggleAddWorkoutBtn) {
    cancelWorkoutBtn.addEventListener('click', () => {
      addWorkoutBox.style.display = 'none';
      toggleAddWorkoutBtn.innerHTML = '<span>+</span> ADD NEW WORKOUT';
      addWorkoutForm.reset();
      const editWorkoutIdInput = document.getElementById('editWorkoutId');
      if (editWorkoutIdInput) editWorkoutIdInput.value = '';
      const workoutFormTitle = document.getElementById('workoutFormTitle');
      if (workoutFormTitle) workoutFormTitle.textContent = 'Create New Workout';
      const btnSaveWorkout = document.getElementById('btnSaveWorkout');
      if (btnSaveWorkout) btnSaveWorkout.innerHTML = 'SAVE WORKOUT';
      clearWorkoutPreview();
    });
  }

  if (addWorkoutForm) {
    addWorkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('editWorkoutId')?.value;
      const title = document.getElementById('workoutTitle')?.value.trim();
      const subtitle = document.getElementById('workoutSubtitle')?.value.trim() || 'Custom Athletic Discipline';
      const category = document.getElementById('workoutCategory')?.value || 'strength';
      const target = document.getElementById('workoutTarget')?.value.trim() || 'Full Body, Core Bracing';
      const level = document.getElementById('workoutLevel')?.value || 'All Levels';
      const scheme = document.getElementById('workoutScheme')?.value.trim() || '4 Sets × 8-10 Reps';
      const cuesRaw = document.getElementById('workoutCues')?.value.trim() || 'Focus on controlled eccentric phase.';
      const cues = cuesRaw.split('\n').map(c => c.trim()).filter(Boolean);
      const image = selectedWorkoutImageData ||
                    document.getElementById('workoutImgUrl')?.value.trim() ||
                    document.getElementById('workoutImgPreset')?.value ||
                    'assets/images/strength-endurance.jpg';

      const list = getStoredWorkouts();
      if (editId) {
        const idx = list.findIndex(w => w.id === editId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            title,
            subtitle,
            category,
            target,
            level,
            scheme,
            cues,
            image
          };
          try {
            localStorage.setItem('odd_workouts_data', JSON.stringify(list));
          } catch (err) {
            console.warn('Storage error', err);
          }
          showToast(`Updated workout: ${title}`);
        }
      } else {
        const newWorkout = {
          id: 'custom-' + Date.now(),
          title,
          subtitle,
          category,
          target,
          level,
          scheme,
          equipment: 'Barbell, Dumbbells & Core Platform',
          image,
          cues
        };
        list.unshift(newWorkout);
        try {
          localStorage.setItem('odd_workouts_data', JSON.stringify(list));
        } catch (err) {
          console.warn('Storage error', err);
        }
        showToast(`Added workout: ${title}`);
      }

      addWorkoutForm.reset();
      clearWorkoutPreview();
      const editWorkoutIdInput = document.getElementById('editWorkoutId');
      if (editWorkoutIdInput) editWorkoutIdInput.value = '';
      const workoutFormTitle = document.getElementById('workoutFormTitle');
      if (workoutFormTitle) workoutFormTitle.textContent = 'Create New Workout';
      const btnSaveWorkout = document.getElementById('btnSaveWorkout');
      if (btnSaveWorkout) btnSaveWorkout.innerHTML = 'SAVE WORKOUT';

      if (addWorkoutBox) addWorkoutBox.style.display = 'none';
      if (toggleAddWorkoutBtn) toggleAddWorkoutBtn.innerHTML = '<span>+</span> ADD NEW WORKOUT';

      renderPortalWorkouts();
      syncWorkoutsPublicPage();
    });
  }

  function renderPortalWorkouts() {
    const container = document.getElementById('portalWorkoutsList');
    const countBadge = document.getElementById('statWorkoutsCount');
    if (!container) return;

    const list = getStoredWorkouts();
    if (countBadge) countBadge.textContent = list.length;

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 2rem;">No workouts configured. Click "+ ADD NEW WORKOUT" to create one.</div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="portal-showcase-row" data-workout-id="${item.id}">
        <div class="portal-showcase-meta">
          <img src="${item.image || 'assets/images/strength-endurance.jpg'}" alt="${item.title}" class="portal-workout-thumb" onerror="this.onerror=null;this.src='assets/images/strength-endurance.jpg';">
          <div class="item-texts">
            <span class="item-cat-tag">${item.category} • ${item.level}</span>
            <h4 class="item-name-heading">${item.title}</h4>
            <div style="color: #cbd5e1; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">${item.subtitle}</div>
            <p class="item-sub-desc">Target: ${item.target} • Scheme: ${item.scheme}</p>
          </div>
        </div>
        <div class="portal-item-actions">
          <button type="button" class="btn-edit-item" onclick="editWorkout('${item.id}')">
            <span>✏️</span> EDIT
          </button>
          <button type="button" class="btn-delete-item" onclick="deleteWorkout('${item.id}')">
            <span>🗑️</span> DELETE
          </button>
        </div>
      </div>
    `).join('');
  }

  window.editWorkout = function(id) {
    const list = getStoredWorkouts();
    const item = list.find(w => w.id === id);
    if (!item) return;

    if (addWorkoutBox) addWorkoutBox.style.display = 'block';
    if (toggleAddWorkoutBtn) toggleAddWorkoutBtn.innerHTML = '<span>✕</span> CLOSE FORM';

    const editIdInput = document.getElementById('editWorkoutId');
    if (editIdInput) editIdInput.value = item.id;

    const titleEl = document.getElementById('workoutFormTitle');
    if (titleEl) titleEl.textContent = `Edit Workout: ${item.title}`;

    const saveBtn = document.getElementById('btnSaveWorkout');
    if (saveBtn) saveBtn.innerHTML = '<span>💾</span> UPDATE WORKOUT';

    if (document.getElementById('workoutTitle')) document.getElementById('workoutTitle').value = item.title || '';
    if (document.getElementById('workoutSubtitle')) document.getElementById('workoutSubtitle').value = item.subtitle || '';
    if (document.getElementById('workoutCategory')) document.getElementById('workoutCategory').value = item.category || 'strength';
    if (document.getElementById('workoutTarget')) document.getElementById('workoutTarget').value = item.target || '';
    if (document.getElementById('workoutLevel')) document.getElementById('workoutLevel').value = item.level || 'All Levels';
    if (document.getElementById('workoutScheme')) document.getElementById('workoutScheme').value = item.scheme || '';
    if (document.getElementById('workoutCues')) {
      const cuesText = Array.isArray(item.cues) ? item.cues.join('\n') : (item.cues || '');
      document.getElementById('workoutCues').value = cuesText;
    }

    if (item.image) {
      setWorkoutPreview(item.image, item.title);
    } else {
      clearWorkoutPreview();
    }

    addWorkoutBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Editing workout: ${item.title}`);
  };

  window.deleteWorkout = function(id) {
    if (!confirm('Are you sure you want to delete this workout from the library?')) return;
    let list = getStoredWorkouts();
    list = list.filter(w => w.id !== id);
    localStorage.setItem('odd_workouts_data', JSON.stringify(list));
    renderPortalWorkouts();
    syncWorkoutsPublicPage();
    showToast('Workout removed.');
  };

  // --- NUTRITION MANAGEMENT ---
  const toggleAddDietBtn = document.getElementById('toggleAddDietBtn');
  const addDietBox = document.getElementById('addDietBox');
  const cancelDietBtn = document.getElementById('cancelDietBtn');
  const addDietForm = document.getElementById('addDietForm');

  // Nutrition Photo / Guide Upload Option ("udolde button") & Live Preview Controls
  const dietImgFileInput = document.getElementById('dietImgFile');
  const dietImgUrlInput = document.getElementById('dietImgUrl');
  const dietImgPresetSelect = document.getElementById('dietImgPreset');
  const dietImgPreviewBox = document.getElementById('dietImgPreviewBox');
  const dietPreviewImg = document.getElementById('dietPreviewImg');
  const dietFileNameSpan = document.getElementById('dietFileName');
  const btnClearDietImg = document.getElementById('btnClearDietImg');
  let selectedDietImageData = '';

  function setDietPreview(src, name) {
    selectedDietImageData = src;
    if (dietPreviewImg) dietPreviewImg.src = src;
    if (dietImgPreviewBox) dietImgPreviewBox.style.display = 'block';
    if (dietFileNameSpan) dietFileNameSpan.textContent = name || 'Meal Photo Attached';
  }

  function clearDietPreview() {
    selectedDietImageData = '';
    if (dietPreviewImg) dietPreviewImg.src = '';
    if (dietImgPreviewBox) dietImgPreviewBox.style.display = 'none';
    if (dietFileNameSpan) dietFileNameSpan.textContent = 'No file selected (or enter URL / choose preset below)';
    if (dietImgFileInput) dietImgFileInput.value = '';
    if (dietImgUrlInput) dietImgUrlInput.value = '';
    if (dietImgPresetSelect) dietImgPresetSelect.value = '';
  }

  if (dietImgFileInput) {
    dietImgFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        showToast(`Processing meal photo: ${file.name}...`);
        const compressed = await compressImageFile(file);
        setDietPreview(compressed, file.name);
        showToast(`Meal photo attached: ${file.name}`);
      }
    });
  }

  if (dietImgUrlInput) {
    dietImgUrlInput.addEventListener('input', () => {
      const val = dietImgUrlInput.value.trim();
      if (val) {
        setDietPreview(val, 'URL: ' + val.substring(0, 24) + '...');
      }
    });
  }

  if (dietImgPresetSelect) {
    dietImgPresetSelect.addEventListener('change', () => {
      const val = dietImgPresetSelect.value;
      if (val) {
        setDietPreview(val, dietImgPresetSelect.options[dietImgPresetSelect.selectedIndex].text);
      }
    });
  }

  if (btnClearDietImg) {
    btnClearDietImg.addEventListener('click', clearDietPreview);
  }

  if (toggleAddDietBtn && addDietBox) {
    toggleAddDietBtn.addEventListener('click', () => {
      const isHidden = addDietBox.style.display === 'none';
      addDietBox.style.display = isHidden ? 'block' : 'none';
      toggleAddDietBtn.innerHTML = isHidden ? '<span>✕</span> CLOSE FORM' : '<span>+</span> ADD NEW BLUEPRINT';
    });
  }
  if (cancelDietBtn && addDietBox && toggleAddDietBtn) {
    cancelDietBtn.addEventListener('click', () => {
      addDietBox.style.display = 'none';
      toggleAddDietBtn.innerHTML = '<span>+</span> ADD NEW BLUEPRINT';
      addDietForm.reset();
      const editDietIdInput = document.getElementById('editDietId');
      if (editDietIdInput) editDietIdInput.value = '';
      const dietFormTitle = document.getElementById('dietFormTitle');
      if (dietFormTitle) dietFormTitle.textContent = 'Create New Nutrition Blueprint';
      const btnSaveDiet = document.getElementById('btnSaveDiet');
      if (btnSaveDiet) btnSaveDiet.innerHTML = 'SAVE BLUEPRINT';
      clearDietPreview();
    });
  }

  if (addDietForm) {
    addDietForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('editDietId')?.value;
      const name = document.getElementById('dietName')?.value.trim();
      const pill = document.getElementById('dietPill')?.value.trim() || 'CUSTOM PROTOCOL';
      const desc = document.getElementById('dietDesc')?.value.trim();
      const breakfast = document.getElementById('dietBreakfast')?.value.trim() || '4 Egg Whites, Oats & Berries';
      const lunch = document.getElementById('dietLunch')?.value.trim() || '200g Lean Protein with Brown Rice';
      const snack = document.getElementById('dietSnack')?.value.trim() || 'Whey Isolate & Almonds';
      const dinner = document.getElementById('dietDinner')?.value.trim() || 'Steamed Salmon with Asparagus';
      const image = selectedDietImageData ||
                    document.getElementById('dietImgUrl')?.value.trim() ||
                    document.getElementById('dietImgPreset')?.value ||
                    'assets/images/nutrition-diet.jpg';

      const list = getStoredNutrition();
      if (editId) {
        const idx = list.findIndex(n => n.id === editId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            name,
            pill,
            desc,
            breakfast,
            lunch,
            snack,
            dinner,
            image
          };
          try {
            localStorage.setItem('odd_nutrition_data', JSON.stringify(list));
          } catch (err) {
            console.warn('Storage error', err);
          }
          showToast(`Updated blueprint: ${name}`);
        }
      } else {
        const newDiet = {
          id: 'diet-' + Date.now(),
          name,
          pill,
          desc,
          breakfast,
          lunch,
          snack,
          dinner,
          image
        };
        list.unshift(newDiet);
        try {
          localStorage.setItem('odd_nutrition_data', JSON.stringify(list));
        } catch (err) {
          console.warn('Storage error', err);
        }
        showToast(`Added blueprint: ${name}`);
      }

      addDietForm.reset();
      clearDietPreview();
      const editDietIdInput = document.getElementById('editDietId');
      if (editDietIdInput) editDietIdInput.value = '';
      const dietFormTitle = document.getElementById('dietFormTitle');
      if (dietFormTitle) dietFormTitle.textContent = 'Create New Nutrition Blueprint';
      const btnSaveDiet = document.getElementById('btnSaveDiet');
      if (btnSaveDiet) btnSaveDiet.innerHTML = 'SAVE BLUEPRINT';

      if (addDietBox) addDietBox.style.display = 'none';
      if (toggleAddDietBtn) toggleAddDietBtn.innerHTML = '<span>+</span> ADD NEW BLUEPRINT';

      renderPortalNutrition();
      syncNutritionPublicPage();
    });
  }

  function renderPortalNutrition() {
    const container = document.getElementById('portalDietList');
    const countBadge = document.getElementById('statNutritionCount');
    if (!container) return;

    const list = getStoredNutrition();
    if (countBadge) countBadge.textContent = list.length;

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 2rem;">No nutrition blueprints saved. Click "+ ADD NEW BLUEPRINT" to create one.</div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="portal-showcase-row" data-diet-id="${item.id}">
        <div class="portal-showcase-meta">
          <img src="${item.image || 'assets/images/nutrition-diet.jpg'}" alt="${item.name}" class="portal-diet-thumb" onerror="this.onerror=null;this.src='assets/images/nutrition-diet.jpg';">
          <div class="item-texts">
            <span class="item-cat-tag">${item.pill}</span>
            <h4 class="item-name-heading">${item.name}</h4>
            <p class="item-sub-desc">${item.desc}</p>
            <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 0.35rem; line-height: 1.4;">
              🍳 <strong>Breakfast:</strong> ${item.breakfast} &bull; 🥩 <strong>Lunch:</strong> ${item.lunch}
            </div>
          </div>
        </div>
        <div class="portal-item-actions">
          <button type="button" class="btn-edit-item" onclick="editNutrition('${item.id}')">
            <span>✏️</span> EDIT
          </button>
          <button type="button" class="btn-delete-item" onclick="deleteNutrition('${item.id}')">
            <span>🗑️</span> DELETE
          </button>
        </div>
      </div>
    `).join('');
  }

  window.editNutrition = function(id) {
    const list = getStoredNutrition();
    const item = list.find(n => n.id === id);
    if (!item) return;

    if (addDietBox) addDietBox.style.display = 'block';
    if (toggleAddDietBtn) toggleAddDietBtn.innerHTML = '<span>✕</span> CLOSE FORM';

    const editIdInput = document.getElementById('editDietId');
    if (editIdInput) editIdInput.value = item.id;

    const titleEl = document.getElementById('dietFormTitle');
    if (titleEl) titleEl.textContent = `Edit Blueprint: ${item.name}`;

    const saveBtn = document.getElementById('btnSaveDiet');
    if (saveBtn) saveBtn.innerHTML = '<span>💾</span> UPDATE BLUEPRINT';

    if (document.getElementById('dietName')) document.getElementById('dietName').value = item.name || '';
    if (document.getElementById('dietPill')) document.getElementById('dietPill').value = item.pill || '';
    if (document.getElementById('dietDesc')) document.getElementById('dietDesc').value = item.desc || '';
    if (document.getElementById('dietBreakfast')) document.getElementById('dietBreakfast').value = item.breakfast || '';
    if (document.getElementById('dietLunch')) document.getElementById('dietLunch').value = item.lunch || '';
    if (document.getElementById('dietSnack')) document.getElementById('dietSnack').value = item.snack || '';
    if (document.getElementById('dietDinner')) document.getElementById('dietDinner').value = item.dinner || '';

    if (item.image) {
      setDietPreview(item.image, item.name);
    } else {
      clearDietPreview();
    }

    addDietBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Editing blueprint: ${item.name}`);
  };

  window.deleteNutrition = function(id) {
    if (!confirm('Are you sure you want to delete this nutrition blueprint?')) return;
    let list = getStoredNutrition();
    list = list.filter(n => n.id !== id);
    localStorage.setItem('odd_nutrition_data', JSON.stringify(list));
    renderPortalNutrition();
    syncNutritionPublicPage();
    showToast('Nutrition blueprint deleted.');
  };

  // --- COLLABORATIONS MANAGEMENT ---
  const toggleAddCollabBtn = document.getElementById('toggleAddCollabBtn');
  const addCollabBox = document.getElementById('addCollabBox');
  const cancelCollabBtn = document.getElementById('cancelCollabBtn');
  const addCollabForm = document.getElementById('addCollabForm');

  // Collaboration Image Upload & Live Preview Controls
  const collabImgFileInput = document.getElementById('collabImgFile');
  const collabImgUrlInput = document.getElementById('collabImgUrl');
  const collabImgPresetSelect = document.getElementById('collabImgPreset');
  const collabImgPreviewBox = document.getElementById('collabImgPreviewBox');
  const collabPreviewImg = document.getElementById('collabPreviewImg');
  const collabFileNameSpan = document.getElementById('collabFileName');
  const btnClearCollabImg = document.getElementById('btnClearCollabImg');
  let selectedCollabImageData = '';

  function setCollabPreview(src, name) {
    selectedCollabImageData = src;
    if (collabPreviewImg) collabPreviewImg.src = src;
    if (collabImgPreviewBox) collabImgPreviewBox.style.display = 'block';
    if (collabFileNameSpan) collabFileNameSpan.textContent = name || 'Showcase Photo Attached';
  }

  function clearCollabPreview() {
    selectedCollabImageData = '';
    if (collabPreviewImg) collabPreviewImg.src = '';
    if (collabImgPreviewBox) collabImgPreviewBox.style.display = 'none';
    if (collabFileNameSpan) collabFileNameSpan.textContent = 'No file chosen (or enter URL / choose existing showcase below)';
    if (collabImgFileInput) collabImgFileInput.value = '';
    if (collabImgUrlInput) collabImgUrlInput.value = '';
    if (collabImgPresetSelect) collabImgPresetSelect.value = '';
  }

  if (collabImgFileInput) {
    collabImgFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        showToast(`Processing showcase photo: ${file.name}...`);
        const compressed = await compressImageFile(file);
        setCollabPreview(compressed, file.name);
        showToast(`Showcase photo attached: ${file.name}`);
      }
    });
  }

  if (collabImgUrlInput) {
    collabImgUrlInput.addEventListener('input', () => {
      const val = collabImgUrlInput.value.trim();
      if (val) {
        setCollabPreview(val, 'URL: ' + val.substring(0, 24) + '...');
      }
    });
  }

  if (collabImgPresetSelect) {
    collabImgPresetSelect.addEventListener('change', () => {
      const val = collabImgPresetSelect.value;
      if (val) {
        setCollabPreview(val, collabImgPresetSelect.options[collabImgPresetSelect.selectedIndex].text);
      }
    });
  }

  if (btnClearCollabImg) {
    btnClearCollabImg.addEventListener('click', clearCollabPreview);
  }

  if (toggleAddCollabBtn && addCollabBox) {
    toggleAddCollabBtn.addEventListener('click', () => {
      const isHidden = addCollabBox.style.display === 'none';
      addCollabBox.style.display = isHidden ? 'block' : 'none';
      toggleAddCollabBtn.innerHTML = isHidden ? '<span>✕</span> CLOSE FORM' : '<span>+</span> ADD NEW COLLABORATION';
    });
  }
  if (cancelCollabBtn && addCollabBox && toggleAddCollabBtn) {
    cancelCollabBtn.addEventListener('click', () => {
      addCollabBox.style.display = 'none';
      toggleAddCollabBtn.innerHTML = '<span>+</span> ADD NEW COLLABORATION';
      addCollabForm.reset();
      const editCollabIdInput = document.getElementById('editCollabId');
      if (editCollabIdInput) editCollabIdInput.value = '';
      const collabFormTitle = document.getElementById('collabFormTitle');
      if (collabFormTitle) collabFormTitle.textContent = 'Create New Collaboration Showcase';
      const btnSaveCollab = document.getElementById('btnSaveCollab');
      if (btnSaveCollab) btnSaveCollab.innerHTML = 'SAVE COLLABORATION';
      clearCollabPreview();
    });
  }

  if (addCollabForm) {
    addCollabForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('editCollabId')?.value;
      const brand = document.getElementById('collabBrandName')?.value.trim();
      const category = document.getElementById('collabCategory')?.value.trim() || 'OFFICIAL PARTNER';
      const product = document.getElementById('collabProduct')?.value.trim();
      const code = document.getElementById('collabCode')?.value.trim() || 'ODD2026';
      const link = document.getElementById('collabStoreLink')?.value.trim() || 'https://odds-fitness.surge.sh';
      const handle = document.getElementById('collabHandle')?.value.trim() || '@oddfitness';
      const img = selectedCollabImageData ||
                  document.getElementById('collabImgUrl')?.value.trim() ||
                  document.getElementById('collabImgPreset')?.value ||
                  'assets/images/collab-raawr.jpg';
      const desc = document.getElementById('collabDesc')?.value.trim();

      const list = getStoredCollabs();
      if (editId) {
        const idx = list.findIndex(c => c.id === editId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            brand,
            category,
            product,
            code,
            link,
            handle,
            img,
            desc
          };
          try {
            localStorage.setItem('odd_collabs_data', JSON.stringify(list));
          } catch (err) {
            console.warn('Storage error', err);
          }
          showToast(`Updated collaboration: ${brand}`);
        }
      } else {
        const newCollab = {
          id: 'collab-' + Date.now(),
          brand,
          category,
          product,
          code,
          codeLabel: 'EXCLUSIVE PROMO CODE',
          link,
          linkText: `Visit ${brand}`,
          handle,
          img,
          desc
        };
        list.unshift(newCollab);
        try {
          localStorage.setItem('odd_collabs_data', JSON.stringify(list));
        } catch (err) {
          console.warn('Storage error', err);
        }
        showToast(`Added collaboration: ${brand}`);
      }

      addCollabForm.reset();
      clearCollabPreview();
      const editCollabIdInput = document.getElementById('editCollabId');
      if (editCollabIdInput) editCollabIdInput.value = '';
      const collabFormTitle = document.getElementById('collabFormTitle');
      if (collabFormTitle) collabFormTitle.textContent = 'Create New Collaboration Showcase';
      const btnSaveCollab = document.getElementById('btnSaveCollab');
      if (btnSaveCollab) btnSaveCollab.innerHTML = 'SAVE COLLABORATION';

      if (addCollabBox) addCollabBox.style.display = 'none';
      if (toggleAddCollabBtn) toggleAddCollabBtn.innerHTML = '<span>+</span> ADD NEW COLLABORATION';

      renderPortalCollabs();
      syncCollabsPublicPage();
    });
  }

  function renderPortalCollabs() {
    const container = document.getElementById('portalCollabsList');
    const countBadge = document.getElementById('statCollabsCount');
    if (!container) return;

    const list = getStoredCollabs();
    if (countBadge) countBadge.textContent = list.length;

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 2rem;">No collaborations saved. Click "+ ADD NEW COLLABORATION" to create one.</div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="portal-showcase-row" data-collab-id="${item.id}">
        <div class="portal-showcase-meta">
          <img src="${item.img || 'assets/images/collab-raawr.jpg'}" alt="${item.brand} Showcase" class="portal-collab-thumb" onerror="this.onerror=null;this.src='assets/images/collab-raawr.jpg';">
          <div class="item-texts">
            <span class="item-cat-tag">${item.category} • CODE: ${item.code || 'N/A'}</span>
            <h4 class="item-name-heading">${item.brand}</h4>
            <div style="color: #cbd5e1; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">${item.product}</div>
            <p class="item-sub-desc">${item.desc}</p>
            <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 0.35rem;">
              <span>🔗 ${item.link || 'Official Store'}</span> • <span>${item.handle || '@oddfitness'}</span>
            </div>
          </div>
        </div>
        <div class="portal-item-actions">
          <button type="button" class="btn-preview-item" onclick="openCollabModal('${item.id}')">
            <span>👁️</span> PREVIEW
          </button>
          <button type="button" class="btn-edit-item" onclick="editCollab('${item.id}')">
            <span>✏️</span> EDIT
          </button>
          <button type="button" class="btn-delete-item" onclick="deleteCollab('${item.id}')">
            <span>🗑️</span> DELETE
          </button>
        </div>
      </div>
    `).join('');
  }

  window.editCollab = function(id) {
    const list = getStoredCollabs();
    const item = list.find(c => c.id === id);
    if (!item) return;

    if (addCollabBox) addCollabBox.style.display = 'block';
    if (toggleAddCollabBtn) toggleAddCollabBtn.innerHTML = '<span>✕</span> CLOSE FORM';

    const editIdInput = document.getElementById('editCollabId');
    if (editIdInput) editIdInput.value = item.id;

    const titleEl = document.getElementById('collabFormTitle');
    if (titleEl) titleEl.textContent = `Edit Collaboration: ${item.brand}`;

    const saveBtn = document.getElementById('btnSaveCollab');
    if (saveBtn) saveBtn.innerHTML = '<span>💾</span> UPDATE COLLABORATION';

    if (document.getElementById('collabBrandName')) document.getElementById('collabBrandName').value = item.brand || '';
    if (document.getElementById('collabCategory')) document.getElementById('collabCategory').value = item.category || '';
    if (document.getElementById('collabProduct')) document.getElementById('collabProduct').value = item.product || '';
    if (document.getElementById('collabCode')) document.getElementById('collabCode').value = item.code || '';
    if (document.getElementById('collabStoreLink')) document.getElementById('collabStoreLink').value = item.link || '';
    if (document.getElementById('collabHandle')) document.getElementById('collabHandle').value = item.handle || '';
    if (document.getElementById('collabDesc')) document.getElementById('collabDesc').value = item.desc || '';

    if (item.img) {
      setCollabPreview(item.img, item.brand);
    } else {
      clearCollabPreview();
    }

    addCollabBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`Editing collaboration: ${item.brand}`);
  };

  window.deleteCollab = function(id) {
    if (!confirm('Are you sure you want to delete this brand collaboration?')) return;
    let list = getStoredCollabs();
    list = list.filter(c => c.id !== id);
    localStorage.setItem('odd_collabs_data', JSON.stringify(list));
    renderPortalCollabs();
    syncCollabsPublicPage();
    showToast('Collaboration deleted.');
  };

  // Initial Run on portal.html
  if (loginSection || dashSection) {
    renderPortalDashboard();
  }
}

// 8. Dynamic Synchronization with Public Pages
function syncWorkoutsPublicPage() {
  const grid = document.getElementById('workoutsGrid');
  if (!grid) return;
  const list = getStoredWorkouts();
  if (list.length === 0) return;

  grid.innerHTML = list.map(item => `
    <div class="program-card" data-workout="${item.id}" data-category="${item.category}">
      <img src="${item.image || 'assets/images/strength-endurance.jpg'}" alt="${item.title}" class="program-card-img" loading="lazy" onerror="this.onerror=null;this.src='assets/images/strength-endurance.jpg';">
      <div class="program-card-overlay">
        <div class="program-card-content">
          <h3 class="program-card-title">${item.title}</h3>
          <span class="program-card-arrow">↗</span>
          <div class="program-card-details-peek">${item.subtitle}</div>
        </div>
      </div>
    </div>
  `).join('');

  // Re-initialize modal click bindings for workouts
  initWorkoutLibrary();
}

function syncNutritionPublicPage() {
  const grid = document.getElementById('dietBlueprintsGrid');
  if (!grid) return;
  const list = getStoredNutrition();
  if (list.length === 0) return;

  grid.innerHTML = list.map((item, idx) => `
    <div class="blueprint-card" ${idx === 1 ? 'style="border-color: var(--primary-red); background: linear-gradient(180deg, #1c222c 0%, #141820 100%);"' : ''}>
      <span class="blueprint-pill" ${idx === 1 ? 'style="background: var(--primary-red); color: #fff;"' : ''}>${item.pill}</span>
      <h4 class="blueprint-name">${item.name}</h4>
      <p class="blueprint-desc">${item.desc}</p>
      <ul class="blueprint-meals-list">
        <li>🍳 <strong>Breakfast:</strong> ${item.breakfast}</li>
        <li>🥩 <strong>Lunch:</strong> ${item.lunch}</li>
        <li>⚡ <strong>Pre/Post:</strong> ${item.snack}</li>
        <li>🍗 <strong>Dinner:</strong> ${item.dinner}</li>
      </ul>
      <button class="btn-download-blueprint" onclick="downloadDietBlueprint('${item.name.replace(/'/g, "\\'")}')" ${idx === 1 ? 'style="background: var(--primary-red); border-color: var(--primary-red);"' : ''}>
        DOWNLOAD PDF BLUEPRINT ↗
      </button>
    </div>
  `).join('');
}

function syncCollabsPublicPage() {
  const grid = document.getElementById('collabsGridShowcase');
  if (!grid) return;
  const list = getStoredCollabs();
  if (list.length === 0) return;

  const positions = {
    'raawr': 'center top',
    'coitonic': 'center top',
    'gymelt': 'center bottom',
    'slovic': 'center center',
    'zsk-oats': 'center 10%',
    'zsk-bundle': '70% center',
    'cleancrate': 'center center'
  };

  grid.innerHTML = list.map(item => `
    <div class="collab-card" data-collab-id="${item.id}">
      <div class="collab-card-img-wrap">
        <img src="${item.img || 'assets/images/collab-raawr.jpg'}" alt="${item.brand} Collaboration" style="object-position: ${positions[item.id] || 'center center'};" loading="lazy" onerror="this.onerror=null;this.src='assets/images/collab-raawr.jpg';">
      </div>
      <div class="collab-card-body">
        <span class="collab-cat-pill">${item.category}</span>
        <h3 class="collab-brand-name">${item.brand}</h3>
        <div class="collab-product-highlight">${item.product}</div>
        <p class="collab-desc-text">${item.desc}</p>
        <div class="collab-footer-meta">
          <span class="collab-tag-code">${item.code ? (item.code.includes('PROTEIN') || item.code.includes('HAUL') || item.code.includes('RIG') ? item.code : 'CODE: ' + item.code) : 'OFFICIAL'}</span>
          <div class="collab-links-group">
            ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener" class="collab-link-btn">🔗 Link</a>` : ''}
            <span class="collab-handle-text">${item.handle || '@oddfitness'}</span>
          </div>
        </div>
        <button class="btn-open-collab" type="button">VIEW COLLABORATION <span>&rarr;</span></button>
      </div>
    </div>
  `).join('');

  // Re-bind modal triggers
  initCollabModal();
}
