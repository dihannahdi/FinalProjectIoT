// FAQ JavaScript - Simon Says IoT
// Handles search, filtering, collapsible items, dan dynamic content loading

document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ functionality
    initializeFAQ();
    loadDynamicContent();
    setupEventListeners();
});

function initializeFAQ() {
    // Setup collapsible FAQ items
    setupCollapsibleItems();
    
    // Setup category filtering
    setupCategoryFiltering();
    
    // Setup search functionality
    setupSearchFunctionality();
    
    // Add smooth scrolling
    setupSmoothScrolling();
}

function setupCollapsibleItems() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = this.classList.contains('active');
            
            // Close all other open items (accordion style)
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.parentElement.querySelector('.faq-answer').classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
}

function setupCategoryFiltering() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const faqSections = document.querySelectorAll('.faq-section');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter sections
            faqSections.forEach(section => {
                if (category === 'all') {
                    section.classList.remove('hidden');
                } else {
                    if (section.dataset.category === category) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                }
            });
            
            // Update search placeholder
            updateSearchPlaceholder(category);
        });
    });
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value.toLowerCase());
        }, 300); // Debounce search
    });
    
    // Clear search on escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            performSearch('');
        }
    });
}

function performSearch(searchTerm) {
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSections = document.querySelectorAll('.faq-section');
    let hasVisibleItems = false;
    
    if (!searchTerm) {
        // Show all items when search is empty
        faqItems.forEach(item => item.classList.remove('hidden'));
        faqSections.forEach(section => section.classList.remove('hidden'));
        return;
    }
    
    faqSections.forEach(section => {
        let sectionHasVisibleItems = false;
        const items = section.querySelectorAll('.faq-item');
        
        items.forEach(item => {
            const question = item.querySelector('h4').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.classList.remove('hidden');
                sectionHasVisibleItems = true;
                hasVisibleItems = true;
                
                // Highlight search terms
                highlightSearchTerms(item, searchTerm);
            } else {
                item.classList.add('hidden');
            }
        });
        
        // Show/hide section based on whether it has visible items
        if (sectionHasVisibleItems) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
    
    // Show no results message if needed
    showNoResults(!hasVisibleItems);
}

function highlightSearchTerms(item, searchTerm) {
    // Simple highlighting implementation
    const question = item.querySelector('h4');
    const originalText = question.textContent;
    
    if (originalText.toLowerCase().includes(searchTerm)) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlightedText = originalText.replace(regex, '<mark style="background: #ffd700; padding: 2px 4px; border-radius: 3px;">$1</mark>');
        question.innerHTML = highlightedText;
    }
}

function showNoResults(show) {
    let noResultsDiv = document.getElementById('noResults');
    
    if (show && !noResultsDiv) {
        noResultsDiv = document.createElement('div');
        noResultsDiv.id = 'noResults';
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; background: rgba(255,255,255,0.9); border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #764ba2; margin-bottom: 15px;">🔍 Tidak ada hasil ditemukan</h3>
                <p>Coba kata kunci yang berbeda atau lihat semua kategori.</p>
                <button onclick="clearSearch()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 20px; cursor: pointer;">Lihat Semua</button>
            </div>
        `;
        document.querySelector('.faq-content').appendChild(noResultsDiv);
    } else if (!show && noResultsDiv) {
        noResultsDiv.remove();
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    performSearch('');
}

function updateSearchPlaceholder(category) {
    const searchInput = document.getElementById('searchInput');
    const placeholders = {
        'all': '🔍 Cari pertanyaan...',
        'konsep': '🔍 Cari di konsep...',
        'arsitektur': '🔍 Cari di arsitektur...',
        'hardware': '🔍 Cari di hardware...',
        'software': '🔍 Cari di software...',
        'fitur': '🔍 Cari di fitur...',
        'deployment': '🔍 Cari di deployment...',
        'tantangan': '🔍 Cari di tantangan...'
    };
    
    searchInput.placeholder = placeholders[category] || placeholders['all'];
}

function setupSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    });
    
    // Back to top functionality
    let backToTopButton = createBackToTopButton();
    handleBackToTopVisibility(backToTopButton);
}

function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'back-to-top';
    button.title = 'Kembali ke atas';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
    return button;
}

function handleBackToTopVisibility(button) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0) scale(1)';
        } else {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px) scale(1)';
        }
    });
}

// Add loading animation
function addLoadingAnimation() {
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;">
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #764ba2; font-weight: 600;">Loading FAQ...</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loader);
    
    // Remove loader after content is loaded
    setTimeout(() => {
        loader.remove();
    }, 1000);
}

// Initialize loading animation
addLoadingAnimation();

function loadDynamicContent() {
    // Add the remaining FAQ content that was summarized in the HTML
    const allFAQData = [
        // Arsitektur (continuing from 12-20)
        {
            category: 'arsitektur',
            number: 12,
            question: 'Mengapa memilih Node.js untuk backend server?',
            answer: `<p><strong>Node.js advantages:</strong></p>
                    <ul>
                        <li><strong>Event-driven architecture</strong> - Perfect untuk real-time applications</li>
                        <li><strong>Non-blocking I/O</strong> - Handle multiple concurrent connections efficiently</li>
                        <li><strong>JavaScript ecosystem</strong> - Consistent language across frontend/backend</li>
                        <li><strong>Socket.IO native support</strong> - Excellent WebSocket implementation</li>
                        <li><strong>Fast development</strong> - Rich npm ecosystem untuk rapid prototyping</li>
                        <li><strong>Cloud-friendly</strong> - Easy deployment ke Azure App Service</li>
                        <li><strong>Scalability</strong> - Handle thousands of concurrent connections</li>
                    </ul>`
        },
        // Add more FAQ items as needed
    ];
    
    // For now, we'll use the existing content and just make it interactive
    setupCollapsibleItems();
}

// Analytics tracking (optional)
function trackFAQUsage() {
    // Track which questions are most viewed
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Track click events (could send to analytics service)
            console.log(`FAQ item ${index + 1} clicked`);
        });
    });
}

// Initialize analytics if needed
// trackFAQUsage(); 