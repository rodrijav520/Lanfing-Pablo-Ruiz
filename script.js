/* ==========================================================================
   PsicoPablo — Pablo Ruiz · Landing Page JavaScript
   v5 — Brand Guidelines 2026
   Funcionalidades: Loading screen, scroll animations, navbar,
                    calendario de agendamiento, FAQ
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================================================
     1. LOADING SCREEN — Animación de piezas que se ensamblan
        Total: ~1.5s (rápido). Fallback de 2.5s si algo falla.
     ======================================================================== */
  const loadingScreen = document.querySelector('.loading-screen');

  function hideLoading() {
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      loadingScreen.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  document.body.style.overflow = 'hidden';

  // Mínimo: 1.5s para que la animación se complete
  const minLoadingTime = 1500;
  const startTime = performance.now();

  function tryHideLoading() {
    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, minLoadingTime - elapsed);
    setTimeout(hideLoading, remaining);
  }

  if (document.readyState === 'complete') {
    tryHideLoading();
  } else {
    window.addEventListener('load', tryHideLoading);
  }

  // Fallback duro: si algo falla, ocultar a los 2.5s
  setTimeout(hideLoading, 2500);

  /* ========================================================================
     2. NAVBAR — Scroll behavior + Mobile menu
     ======================================================================== */
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  const mobileOverlay = document.querySelector('.nav-mobile-overlay');

  function handleNavbarScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Mobile menu toggle
  function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ========================================================================
     3. SMOOTH SCROLL para anchor links
     ======================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ========================================================================
     4. SCROLL REVEAL ANIMATIONS (Intersection Observer)
     ======================================================================== */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  /* ========================================================================
     5. FAQ ACCORDION
     ======================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const inner = item.querySelector('.faq-answer-inner');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Cerrar todos
      faqItems.forEach(other => {
        other.classList.remove('active');
        other.querySelector('.faq-answer').style.maxHeight = '0';
        const btn = other.querySelector('.faq-question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      // Abrir el clickeado (si no estaba abierto)
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = inner.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ========================================================================
     6. CALENDARIO DE AGENDAMIENTO
     ======================================================================== */

  // Horarios disponibles según brief:
  // Martes, Jueves, Viernes: 4pm - 7pm (slots de 1 hora: 4:00, 5:00, 6:00)
  // Sábado: 8am - 5pm (slots: 8:00, 9:00, 10:00, 11:00, 1:00, 2:00, 3:00, 4:00)
  // Domingo: 8am - 12pm (slots: 8:00, 9:00, 10:00, 11:00)
  // Lunes y Miércoles: NO disponible

  const SCHEDULE = {
    0: ['08:00', '09:00', '10:00', '11:00'],
    1: [],
    2: ['16:00', '17:00', '18:00'],
    3: [],
    4: ['16:00', '17:00', '18:00'],
    5: ['16:00', '17:00', '18:00'],
    6: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
  };

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // State
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = null;
  let selectedTime = null;

  function getBookedSlots() {
    try {
      const stored = localStorage.getItem('pabloRuiz_bookings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  function saveBooking(booking) {
    const bookings = getBookedSlots();
    bookings.push(booking);
    localStorage.setItem('pabloRuiz_bookings', JSON.stringify(bookings));
  }

  function isSlotBooked(dateStr, time) {
    const bookings = getBookedSlots();
    return bookings.some(b => b.date === dateStr && b.time === time);
  }

  // DOM elements del calendario
  const calendarMonthTitle = document.getElementById('calendar-month-title');
  const calendarDays = document.getElementById('calendar-days');
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  const timeSlotsContainer = document.getElementById('time-slots-container');
  const calendarRightTitle = document.querySelector('.calendar-right-title');
  const calendarRightSubtitle = document.querySelector('.calendar-right-subtitle');
  const bookingForm = document.getElementById('booking-form');
  const bookingSuccess = document.getElementById('booking-success');
  const timeSlotsWrapper = document.getElementById('time-slots-wrapper');

  function renderCalendar() {
    if (!calendarMonthTitle || !calendarDays) return;

    calendarMonthTitle.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    if (prevMonthBtn) prevMonthBtn.disabled = isCurrentMonth;

    const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    const currentDate = new Date(currentYear, currentMonth, 1);
    if (nextMonthBtn) nextMonthBtn.disabled = currentDate >= maxDate;

    calendarDays.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('button');
      empty.className = 'calendar-day empty';
      empty.disabled = true;
      calendarDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement('button');
      btn.textContent = day;
      btn.className = 'calendar-day';

      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const hasSlots = SCHEDULE[dayOfWeek] && SCHEDULE[dayOfWeek].length > 0;

      if (isToday) btn.classList.add('today');

      if (isPast) {
        btn.classList.add('past');
        btn.disabled = true;
      } else if (!hasSlots) {
        btn.classList.add('weekend');
        btn.disabled = true;
      } else {
        btn.classList.add('available');
        btn.addEventListener('click', () => selectDate(date, btn));
      }

      if (selectedDate && date.getTime() === selectedDate.getTime()) {
        btn.classList.add('selected');
      }

      calendarDays.appendChild(btn);
    }
  }

  function selectDate(date, btnElement) {
    selectedDate = date;
    selectedTime = null;

    document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
    btnElement.classList.add('selected');

    showTimeSlots(date);

    if (bookingForm) bookingForm.classList.remove('active');
    if (bookingSuccess) bookingSuccess.classList.remove('active');
    if (timeSlotsWrapper) timeSlotsWrapper.style.display = 'block';
  }

  function showTimeSlots(date) {
    if (!timeSlotsContainer) return;

    const dayOfWeek = date.getDay();
    const slots = SCHEDULE[dayOfWeek] || [];
    const dateStr = formatDateStr(date);

    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    if (calendarRightTitle) {
      calendarRightTitle.textContent = `${dayNames[dayOfWeek].charAt(0).toUpperCase() + dayNames[dayOfWeek].slice(1)} ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
    }
    if (calendarRightSubtitle) {
      calendarRightSubtitle.textContent = 'Seleccioná un horario disponible';
    }

    timeSlotsContainer.innerHTML = '';

    if (slots.length === 0) {
      timeSlotsContainer.innerHTML = `
        <div class="no-slots-message">
          <span class="icon">&#128197;</span>
          <p>No hay horarios disponibles este día.</p>
        </div>
      `;
      return;
    }

    const availableSlots = slots.filter(slot => !isSlotBooked(dateStr, slot));

    if (availableSlots.length === 0) {
      timeSlotsContainer.innerHTML = `
        <div class="no-slots-message">
          <span class="icon">&#128197;</span>
          <p>Todos los horarios de este día ya están reservados.</p>
        </div>
      `;
      return;
    }

    availableSlots.forEach(slot => {
      const btn = document.createElement('button');
      btn.className = 'time-slot';
      btn.textContent = formatTime(slot);
      btn.addEventListener('click', () => selectTimeSlot(slot, btn));
      timeSlotsContainer.appendChild(btn);
    });
  }

  function selectTimeSlot(time, btnElement) {
    selectedTime = time;

    document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
    btnElement.classList.add('selected');

    showBookingForm();
  }

  function showBookingForm() {
    if (!bookingForm || !selectedDate || !selectedTime) return;

    if (timeSlotsWrapper) timeSlotsWrapper.style.display = 'none';
    bookingForm.classList.add('active');
    if (bookingSuccess) bookingSuccess.classList.remove('active');

    const summaryDate = document.querySelector('.booking-summary-date');
    const summaryTime = document.querySelector('.booking-summary-time');
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    if (summaryDate) {
      summaryDate.textContent = `${dayNames[selectedDate.getDay()]} ${selectedDate.getDate()} de ${MONTH_NAMES[selectedDate.getMonth()]}, ${currentYear}`;
    }
    if (summaryTime) {
      summaryTime.textContent = formatTime(selectedTime);
    }
  }

  const backBtn = document.querySelector('.booking-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      bookingForm.classList.remove('active');
      if (timeSlotsWrapper) timeSlotsWrapper.style.display = 'block';
    });
  }

  const confirmBtn = document.getElementById('confirm-booking');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const name = document.getElementById('booking-name').value.trim();
      const email = document.getElementById('booking-email').value.trim();
      const phone = document.getElementById('booking-phone').value.trim();
      const type = document.getElementById('booking-type').value;

      if (!name || !email || !phone) {
        alert('Por favor, completá todos los campos obligatorios.');
        return;
      }

      if (!validateEmail(email)) {
        alert('Por favor, ingresá un email válido.');
        return;
      }

      const booking = {
        date: formatDateStr(selectedDate),
        time: selectedTime,
        name,
        email,
        phone,
        type,
        createdAt: new Date().toISOString()
      };

      saveBooking(booking);
      showBookingSuccess(booking);

      document.getElementById('booking-name').value = '';
      document.getElementById('booking-email').value = '';
      document.getElementById('booking-phone').value = '';
      document.getElementById('booking-type').value = 'primera-vez';
    });
  }

  function showBookingSuccess(booking) {
    if (!bookingSuccess) return;

    bookingForm.classList.remove('active');
    bookingSuccess.classList.add('active');

    const successDate = document.getElementById('success-date');
    const successTime = document.getElementById('success-time');
    const successName = document.getElementById('success-name');

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    if (successDate) {
      successDate.textContent = `${dayNames[selectedDate.getDay()]} ${selectedDate.getDate()} de ${MONTH_NAMES[selectedDate.getMonth()]}`;
    }
    if (successTime) successTime.textContent = formatTime(selectedTime);
    if (successName) successName.textContent = booking.name;

    renderCalendar();
  }

  const newBookingBtn = document.getElementById('new-booking');
  if (newBookingBtn) {
    newBookingBtn.addEventListener('click', () => {
      selectedDate = null;
      selectedTime = null;
      bookingSuccess.classList.remove('active');
      if (timeSlotsWrapper) timeSlotsWrapper.style.display = 'block';

      if (timeSlotsContainer) {
        timeSlotsContainer.innerHTML = `
          <div class="no-slots-message">
            <span class="icon">&#128197;</span>
            <p>Seleccioná un día en el calendario para ver los horarios disponibles.</p>
          </div>
        `;
      }

      if (calendarRightTitle) calendarRightTitle.textContent = 'Horarios disponibles';
      if (calendarRightSubtitle) calendarRightSubtitle.textContent = 'Elegí un día para ver las opciones';

      document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));

      renderCalendar();
    });
  }

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      selectedDate = null;
      renderCalendar();
      resetRightPanel();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      selectedDate = null;
      renderCalendar();
      resetRightPanel();
    });
  }

  function resetRightPanel() {
    if (bookingForm) bookingForm.classList.remove('active');
    if (bookingSuccess) bookingSuccess.classList.remove('active');
    if (timeSlotsWrapper) timeSlotsWrapper.style.display = 'block';

    if (timeSlotsContainer) {
      timeSlotsContainer.innerHTML = `
        <div class="no-slots-message">
          <span class="icon">&#128197;</span>
          <p>Seleccioná un día en el calendario para ver los horarios disponibles.</p>
        </div>
      `;
    }

    if (calendarRightTitle) calendarRightTitle.textContent = 'Horarios disponibles';
    if (calendarRightSubtitle) calendarRightSubtitle.textContent = 'Elegí un día para ver las opciones';
  }

  // Helpers
  function formatDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${minutes} ${suffix}`;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Inicializar calendario
  renderCalendar();

});
