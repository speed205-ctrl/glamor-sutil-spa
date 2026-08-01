/**
 * Glamor Sutil - Minimalist Cosmetics SPA Logic
 * Features: SPA Navigation, LocalStorage Cart, WhatsApp Checkout
 */

// Configuration Constants
const WHATSAPP_PHONE = "584245050383"; // Venezuelan phone number +58 424-5050383
const BRAND_NAME = "Glamor Sutil";
const FREE_SHIPPING_THRESHOLD = 150;

// State Variables
let cart = JSON.parse(localStorage.getItem('genesis_cart')) || [];
let activeCategoryFilter = "all";

// DOM Elements
const productGrid = document.getElementById('product-grid-container');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartBadge = document.getElementById('cart-badge');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartSidebar = document.getElementById('cart-sidebar');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const floatingCartBtn = document.getElementById('floating-cart-btn');
const floatingCartBadge = document.getElementById('floating-cart-badge');

const cartToggleBtn = document.getElementById('cart-toggle-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');

// ==========================================================================
// 1. INITIALIZATION & ROUTING (SPA)
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Await Supabase dynamic database loading
  if (typeof window.initializeProductsDatabase === 'function') {
    await window.initializeProductsDatabase();
  }
  initRouter();
  renderProducts();
  setupCartEvents();
  setupMediaVideoEvents();
  updateCartBadge();
  renderCart();
  setupCategoryFilters();
  setupModalEvents();
});

// SPA Router
function initRouter() {
  const handleRouting = () => {
    let hash = window.location.hash || '#home';
    
    // Support category sub-filters from link hashes (e.g. #home?category=Vestidos)
    let categoryFilter = 'all';
    if (hash.includes('?category=')) {
      const parts = hash.split('?category=');
      hash = parts[0];
      categoryFilter = decodeURIComponent(parts[1]);
    }

    // Hide all sections
    const sections = document.querySelectorAll('.spa-section');
    sections.forEach(section => {
      section.classList.remove('active-section');
    });

    // Show active section
    const activeSection = document.querySelector(hash);
    if (activeSection) {
      activeSection.classList.add('active-section');
    } else {
      // Fallback
      document.querySelector('#home').classList.add('active-section');
      hash = '#home';
    }

    // Apply category filter if we went to home
    if (hash === '#home') {
      activeCategoryFilter = categoryFilter;
      updateFilterButtons();
      renderProducts();
    }

    // Update Desktop Navigation link states
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close drawers on navigate
    closeDrawers();
    
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to hash change
  window.addEventListener('hashchange', handleRouting);
  
  // Run once on load
  handleRouting();

  // Click on logo or navigation links inside drawers
  const drawerLinks = document.querySelectorAll('.drawer-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawers();
    });
  });
}

// Drawers Toggle Controls
function openDrawer(drawer) {
  drawerOverlay.classList.add('active');
  drawer.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevents background scroll
}

function closeDrawers() {
  drawerOverlay.classList.remove('active');
  mobileDrawer.classList.remove('active');
  cartSidebar.classList.remove('active');
  document.body.style.overflow = '';
}

function setupCartEvents() {
  // Opening & closing drawers
  cartToggleBtn.addEventListener('click', () => openDrawer(cartSidebar));
  if (floatingCartBtn) {
    floatingCartBtn.addEventListener('click', () => openDrawer(cartSidebar));
  }
  closeCartBtn.addEventListener('click', closeDrawers);
  menuToggleBtn.addEventListener('click', () => openDrawer(mobileDrawer));
  closeMenuBtn.addEventListener('click', closeDrawers);
  drawerOverlay.addEventListener('click', closeDrawers);

  // Cart actions inside grid (using event delegation for performance)
  if (productGrid) {
    productGrid.addEventListener('click', (e) => {
      // Add To Cart Button Click
      if (e.target.classList.contains('add-to-cart-btn')) {
        const productId = parseInt(e.target.dataset.id);
        addToCart(productId);
      }
    });
  }

  // Cart actions inside Drawer (controls quantity)
  cartItemsContainer.addEventListener('click', (e) => {
    const itemId = parseInt(e.target.dataset.id);

    if (e.target.classList.contains('qty-plus')) {
      changeQuantity(itemId, 1);
    } else if (e.target.classList.contains('qty-minus')) {
      changeQuantity(itemId, -1);
    } else if (e.target.classList.contains('remove-item-btn')) {
      removeFromCart(itemId);
    }
  });

  // WhatsApp checkout submission
  whatsappCheckoutBtn.addEventListener('click', sendCartWhatsApp);
}

// Set up category filters (chips on Home and collections cards)
function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategoryFilter = btn.dataset.category;
      updateFilterButtons();
      renderProducts();
    });
  });

  // Category Cards in "#collections" section
  const collectionCards = document.querySelectorAll('.collection-card');
  collectionCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.targetCategory;
      window.location.hash = `#home?category=${encodeURIComponent(category)}`;
    });
  });
}

function updateFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    if (btn.dataset.category === activeCategoryFilter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// ==========================================================================
// 2. PRODUCTS RENDERING & CATEGORIZATION
// ==========================================================================

function getCategoryByProductId(id) {
  // Read category name from Supabase DB product object if loaded
  const prod = PRODUCTS.find(p => p.id === id);
  if (prod && prod.category) return prod.category;

  // Fallback for local products
  if ([2, 7, 9, 10, 11, 12, 13].includes(id)) return "Rostro";
  if ([1, 3, 4, 5].includes(id)) return "Labios";
  if ([6, 8, 14].includes(id)) return "Ojos";
  return "all";
}

function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = '';

  const filteredProducts = PRODUCTS.filter(prod => {
    if (activeCategoryFilter === "all") return true;
    return getCategoryByProductId(prod.id) === activeCategoryFilter;
  });

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `<p class="no-products-msg">No se encontraron productos en esta categoría.</p>`;
    return;
  }

  filteredProducts.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-media-container" data-media-type="${prod.mediaType}">
        ${prod.mediaType === 'video' 
          ? `<video src="${prod.src}#t=0.1" loop muted playsinline preload="auto"></video>
             <span class="video-play-indicator">Video</span>` 
          : `<img src="${prod.src}" alt="${prod.name}" loading="lazy">`
        }
      </div>
      <div class="product-details">
        <div class="product-name-price">
          <h3 class="product-name">${prod.name}</h3>
          <span class="product-price">$${prod.price.toFixed(2)} USD</span>
        </div>
        <p class="product-description-snippet">${prod.description}</p>
        
        <div class="product-actions">
          <button class="add-to-cart-btn" data-id="${prod.id}">Añadir al carrito</button>
          <a href="#" class="order-dm-link" data-id="${prod.id}">Pedir por DM</a>
        </div>
      </div>
    `;

    // Dynamic DM action assignment for this card
    const dmLink = card.querySelector('.order-dm-link');
    dmLink.addEventListener('click', (e) => {
      e.preventDefault();
      sendIndividualDM(prod.name);
    });

    // Make card clickable for details modal (ignoring buttons clicks)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.product-actions')) {
        return;
      }
      openProductModal(prod);
    });

    productGrid.appendChild(card);
  });

  // Re-initialize dynamic media listeners for newly generated items
  setupMediaVideoEvents();
}

// ==========================================================================
// 3. MEDIA CONTROLLER (HOVER AND TAP ON VIDEOS)
// ==========================================================================

function setupMediaVideoEvents() {
  const containers = document.querySelectorAll('.product-media-container[data-media-type="video"]');
  
  containers.forEach(container => {
    const video = container.querySelector('video');
    if (!video) return;

    // Desktop hover controls
    container.addEventListener('mouseenter', () => {
      video.play().catch(error => {
        // Silent failure if browser restricts play
        console.log("Autoplay check:", error);
      });
    });

    container.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0.1; // reset to first preview frame
    });

    // Mobile / desktop tap/click toggle
    container.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0.1;
      }
    });
  });
}

// ==========================================================================
// 4. CART LOGIC & STORAGE MANAGEMENT
// ==========================================================================

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  // Check if item of same ID exists
  const existingItemIndex = cart.findIndex(item => item.id === id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      mediaType: product.mediaType,
      src: product.src
    });
  }

  saveCart();
  
  // Trigger bounce animation on floating cart button
  if (floatingCartBtn) {
    floatingCartBtn.classList.remove('bounce');
    void floatingCartBtn.offsetWidth; // Trigger reflow to restart CSS animation
    floatingCartBtn.classList.add('bounce');
  }
}

function changeQuantity(id, delta) {
  const index = cart.findIndex(item => item.id === id);
  if (index === -1) return;

  cart[index].quantity += delta;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem('genesis_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalItems;
  if (floatingCartBadge) floatingCartBadge.textContent = totalItems;
}

function renderCart() {
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<div class="cart-empty-message">Tu carrito está vacío.</div>`;
    cartSubtotal.textContent = "$0.00 USD";
    return;
  }

  let subtotalVal = 0;

  cart.forEach(item => {
    subtotalVal += item.price * item.quantity;
    
    const itemNode = document.createElement('div');
    itemNode.className = 'cart-item';
    itemNode.innerHTML = `
      <div class="cart-item-media">
        ${item.mediaType === 'video' 
          ? `<video src="${item.src}#t=0.1" muted playsinline></video>` 
          : `<img src="${item.src}" alt="${item.name}">`
        }
      </div>
      <div class="cart-item-details">
        <div>
          <div class="cart-item-title-row">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)} USD</span>
          </div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-selector">
            <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
          </div>
          <button class="remove-item-btn" data-id="${item.id}">Eliminar</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(itemNode);
  });

  cartSubtotal.textContent = `$${subtotalVal.toFixed(2)} USD`;
}

// ==========================================================================
// 5. WHATSAPP CHECKOUT BUILDERS
// ==========================================================================

// Complete Cart WhatsApp Checkout
function sendCartWhatsApp() {
  if (cart.length === 0) return;

  let message = `¡Hola ${BRAND_NAME}! Me interesa encargar los siguientes artículos de la web:\n`;
  
  cart.forEach(item => {
    message += `- ${item.quantity}x ${item.name}\n`;
  });
  
  message += `¿Están disponibles?`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}

// Individual "Pedir por DM" WhatsApp Checkout
function sendIndividualDM(name) {
  const message = `¡Hola ${BRAND_NAME}! Me interesa el artículo ${name}. ¿Está disponible?`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}

// ==========================================================================
// 6. PRODUCT DETAIL MODAL CONTROLLER
// ==========================================================================

function setupModalEvents() {
  const modal = document.getElementById('product-detail-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  
  if (modal && closeBtn) {
    // Close button click
    closeBtn.addEventListener('click', closeProductModal);
    
    // Overlay click (outside container)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProductModal();
      }
    });

    // Keyboard ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeProductModal();
      }
    });
  }
}

function openProductModal(prod) {
  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;

  // Populate info
  document.getElementById('modal-product-name').textContent = prod.name;
  document.getElementById('modal-product-price').textContent = `$${prod.price.toFixed(2)} USD`;
  document.getElementById('modal-product-category').textContent = getCategoryByProductId(prod.id).toUpperCase();
  document.getElementById('modal-product-description').textContent = prod.description;

  // Populate media
  const mediaContainer = document.getElementById('modal-media-container');
  if (mediaContainer) {
    mediaContainer.innerHTML = prod.mediaType === 'video' 
      ? `<video src="${prod.src}#t=0.1" loop autoplay muted playsinline controls style="width:100%; height:100%; object-fit:cover; border-radius:4px;"></video>` 
      : `<img src="${prod.src}" alt="${prod.name}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`;
  }

  // Set action buttons event handlers
  const addToCartBtn = document.getElementById('modal-add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.onclick = () => {
      addToCart(prod.id);
      closeProductModal();
    };
  }

  const dmLink = document.getElementById('modal-order-dm-link');
  if (dmLink) {
    dmLink.onclick = (e) => {
      e.preventDefault();
      sendIndividualDM(prod.name);
    };
  }

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scroll
}

function closeProductModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    // Stop any playing video
    const video = modal.querySelector('video');
    if (video) video.pause();
  }
  // Restore body scroll
  document.body.style.overflow = '';
}
