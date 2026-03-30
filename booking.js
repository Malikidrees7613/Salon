document.addEventListener('DOMContentLoaded', () => {
    // State
    const bookingState = {
        services: [],
        price: 0,
        artisan: null,
        date: null,
        displayDate: null,
        time: null
    };

    // DOM Elements
    const elements = {
        artisans: document.querySelectorAll('.artisan-card'),
        times: document.querySelectorAll('.time-btn'),
        
        summaryServicesList: document.getElementById('summary-services-list'),
        summaryArtisan: document.getElementById('summary-artisan'),
        summarySchedule: document.getElementById('summary-schedule'),
        summaryTotal: document.getElementById('summary-total')
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    // Update Summary UI
    const updateSummary = () => {
        // Services List
        if (bookingState.services && bookingState.services.length > 0) {
            elements.summaryServicesList.innerHTML = bookingState.services.map(s => 
                `<div class="flex justify-between items-baseline mb-1"><h5 class="font-accent text-xl italic text-charcoal">${s.name}</h5><span class="font-body text-sm text-charcoal/80">${s.price}</span></div>`
            ).join('');
            
            elements.summaryServicesList.innerHTML += `<a href="services.html" class="text-xs font-body tracking-wider text-rosegold hover:text-charcoal transition-colors underline uppercase mt-4 block">Edit Selection</a>`;
        } else {
            elements.summaryServicesList.innerHTML = `<h5 class="font-accent text-xl italic text-charcoal/50">None Selected</h5><a href="services.html" class="text-xs font-body tracking-wider text-rosegold underline uppercase mt-2 block">Choose from Menu</a>`;
        }

        // Artisan
        if (bookingState.artisan) {
            elements.summaryArtisan.textContent = bookingState.artisan;
        } else {
            elements.summaryArtisan.textContent = "None Selected";
        }

        // Schedule (Date + Time)
        if (bookingState.displayDate && bookingState.time) {
            elements.summarySchedule.textContent = `${bookingState.displayDate}, ${currentDisplayYear} at ${bookingState.time}`;
        } else if (bookingState.displayDate) {
            elements.summarySchedule.textContent = `${bookingState.displayDate}, ${currentDisplayYear} (Time TBD)`;
        } else if (bookingState.time) {
            elements.summarySchedule.textContent = `Time: ${bookingState.time} (Date TBD)`;
        } else {
            elements.summarySchedule.textContent = "None Selected";
        }

        // Total
        elements.summaryTotal.textContent = formatCurrency(bookingState.price);
    };

    // Load Services from LocalStorage
    try {
        const stored = localStorage.getItem('aura_booking_services');
        if (stored) {
            bookingState.services = JSON.parse(stored);
            bookingState.price = bookingState.services.reduce((acc, curr) => acc + curr.price, 0);
        }
    } catch(e) {}
    
    // Initialize UI
    updateSummary();

    // Event Listeners: Artisans
    elements.artisans.forEach(card => {
        card.addEventListener('click', () => {
            elements.artisans.forEach(c => {
                const imgContainer = c.querySelector('div.w-48');
                imgContainer.classList.remove('border-rosegold', 'border-[3px]');
                imgContainer.classList.add('border-rosegold/20', 'border');
            });
            const imgContainer = card.querySelector('div.w-48');
            imgContainer.classList.remove('border-rosegold/20', 'border');
            imgContainer.classList.add('border-rosegold', 'border-[3px]');
            
            bookingState.artisan = card.getAttribute('data-artisan');
            updateSummary();
        });
    });

    // Event Listeners: Times
    elements.times.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.times.forEach(b => {
                b.classList.remove('bg-rosegold', 'text-white', 'shadow-lg', 'shadow-rosegold/20');
            });
            
            const target = e.target;
            target.classList.add('bg-rosegold', 'text-white', 'shadow-lg', 'shadow-rosegold/20');
            
            bookingState.time = target.getAttribute('data-time');
            updateSummary();
        });
    });

    // ==========================================
    // Dynamic Calendar
    // ==========================================
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const calendarPrev = document.getElementById('calendar-prev');
    const calendarNext = document.getElementById('calendar-next');
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let currentDate = new Date();
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let currentDisplayMonth = currentDate.getMonth(); 
    let currentDisplayYear = currentDate.getFullYear();

    const renderCalendar = () => {
        if(!calendarGrid) return;
        calendarGrid.innerHTML = '';
        
        const firstDay = new Date(currentDisplayYear, currentDisplayMonth, 1).getDay();
        const daysInMonth = new Date(currentDisplayYear, currentDisplayMonth + 1, 0).getDate();
        
        calendarMonthYear.textContent = `${monthNames[currentDisplayMonth]} ${currentDisplayYear}`;
        
        // Disable back button if viewing current month
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const targetMonthStart = new Date(currentDisplayYear, currentDisplayMonth, 1);
        
        if (targetMonthStart <= currentMonthStart) {
            calendarPrev.classList.add('opacity-30', 'cursor-not-allowed');
            calendarPrev.classList.remove('hover:text-rosegold');
        } else {
            calendarPrev.classList.remove('opacity-30', 'cursor-not-allowed');
            calendarPrev.classList.add('hover:text-rosegold');
        }

        // Blank spots
        for (let i = 0; i < firstDay; i++) {
            const blank = document.createElement('div');
            calendarGrid.appendChild(blank);
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            dayDiv.className = 'font-body text-sm rounded-full transition-colors flex items-center justify-center h-10 w-10 mx-auto';
            
            const cellDate = new Date(currentDisplayYear, currentDisplayMonth, i);
            const dateString = `${currentDisplayYear}-${currentDisplayMonth + 1}-${i}`;
            
            if (cellDate < today) {
                dayDiv.classList.add('text-charcoal/20', 'cursor-not-allowed');
            } else {
                dayDiv.classList.add('cursor-pointer', 'hover:bg-rosegold/10');
                
                if (bookingState.date === dateString) {
                    dayDiv.classList.remove('hover:bg-rosegold/10');
                    dayDiv.classList.add('bg-rosegold', 'text-white', 'shadow-md', 'shadow-rosegold/20');
                }

                dayDiv.addEventListener('click', () => {
                    bookingState.date = dateString;
                    bookingState.displayDate = `${monthNames[currentDisplayMonth]} ${i}`;
                    renderCalendar();
                    updateSummary();
                });
            }
            calendarGrid.appendChild(dayDiv);
        }
    };
    
    if (calendarPrev) {
        calendarPrev.addEventListener('click', () => {
            const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const targetMonthStart = new Date(currentDisplayYear, currentDisplayMonth - 1, 1);
            
            if (targetMonthStart >= currentMonthStart) {
                currentDisplayMonth--;
                if (currentDisplayMonth < 0) {
                    currentDisplayMonth = 11;
                    currentDisplayYear--;
                }
                renderCalendar();
            }
        });
    }

    if (calendarNext) {
        calendarNext.addEventListener('click', () => {
            currentDisplayMonth++;
            if (currentDisplayMonth > 11) {
                currentDisplayMonth = 0;
                currentDisplayYear++;
            }
            renderCalendar();
        });
    }

    // Initialize calendar
    renderCalendar();

    // ==========================================
    // Form Submission & Confirmation
    // ==========================================
    const bookingForm = document.getElementById('booking-form');
    const successView = document.getElementById('booking-success');
    const confirmNumEl = document.getElementById('confirmation-number');
    const bookAnotherBtn = document.getElementById('book-another');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate that they selected everything
            if (bookingState.services.length === 0) { alert("Please select a Ritual from the Menu."); window.location.href="services.html"; return; }
            if (!bookingState.artisan) { alert("Please choose an Artisan."); return; }
            if (!bookingState.date) { alert("Please select a Date."); return; }
            if (!bookingState.time) { alert("Please select a Time Slot."); return; }
            
            const nameInput = document.getElementById('booking-name').value;
            if(!nameInput) { alert("Please enter your Full Name."); return; }

            // Generate Confirmation Number
            const confNumber = 'AURA-' + Math.floor(100000 + Math.random() * 900000);
            
            // Hide Form and Title
            bookingForm.classList.add('hidden');
            const titleEl = bookingForm.previousElementSibling;
            if(titleEl && titleEl.tagName === 'H3') titleEl.classList.add('hidden');
            
            // Show Success screen
            confirmNumEl.textContent = confNumber;
            successView.classList.remove('hidden');
            
            // Clear LocalStorage Cart
            localStorage.removeItem('aura_booking_services');

            successView.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    if (bookAnotherBtn) {
        bookAnotherBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // ==========================================
    // Stepper Stickiness and Scroll Spy
    // ==========================================
    const stepper = document.getElementById('booking-stepper');
    const stepperInner = document.getElementById('stepper-inner');
    const componentSections = [
        { id: 'specialist-section', element: document.getElementById('specialist-section') },
        { id: 'schedule-section', element: document.getElementById('schedule-section') },
        { id: 'confirmation-section', element: document.getElementById('confirmation-section') }
    ];
    const stepIndicators = document.querySelectorAll('.step-indicator');

    stepIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const targetId = indicator.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl && stepper) {
                const offset = 88 + stepper.offsetHeight;
                const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    window.addEventListener('scroll', () => {
        if (!stepper || !stepperInner) return;
        
        if (window.scrollY > window.innerHeight * 0.5) {
            stepper.classList.add('shadow-sm', 'border-rosegold/10');
            stepperInner.classList.replace('py-8', 'py-4');
            stepperInner.classList.replace('md:py-12', 'md:py-4');
        } else {
            stepper.classList.remove('shadow-sm', 'border-rosegold/10');
            stepperInner.classList.replace('py-4', 'py-8');
            stepperInner.classList.replace('md:py-4', 'md:py-12');
        }

        let activeSectionId = null;
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        componentSections.forEach(sec => {
            if (!sec.element) return;
            const top = sec.element.offsetTop;
            const bottom = top + sec.element.offsetHeight;
            if (scrollPosition >= top && scrollPosition <= bottom) {
                activeSectionId = sec.id;
            }
        });

        if (activeSectionId) {
            stepIndicators.forEach(indicator => {
                const bubble = indicator.querySelector('.step-bubble');
                const text = indicator.querySelector('.step-text');
                
                if (indicator.getAttribute('data-target') === activeSectionId) {
                    bubble.classList.remove('border-rosegold/30', 'text-charcoal/40', 'bg-transparent');
                    bubble.classList.add('border-rosegold', 'bg-rosegold', 'text-white');
                    text.classList.remove('text-charcoal/40');
                    text.classList.add('text-rosegold');
                } else {
                    bubble.classList.add('border-rosegold/30', 'text-charcoal/40', 'bg-transparent');
                    bubble.classList.remove('border-rosegold', 'bg-rosegold', 'text-white');
                    text.classList.add('text-charcoal/40');
                    text.classList.remove('text-rosegold');
                }
            });
        }
    });

    window.dispatchEvent(new Event('scroll'));
});
