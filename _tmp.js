
    // --- FIREBASE FIRESTORE CONFIGURATION ---
    const firebaseConfig = {
      apiKey: "AIzaSyD2PC-U5tSOHfpSv4DK27LS1QKTzD3avmE",
      authDomain: "framer-327a4.firebaseapp.com",
      projectId: "framer-327a4",
      storageBucket: "framer-327a4.firebasestorage.app",
      messagingSenderId: "470071342956",
      appId: "1:470071342956:web:4f87311b3c4be31a1c6549"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Auto-initialize CMS Customization and render to DOM on startup
    if (window.initCms) {
      window.initCms().then(() => {
        if (window.applyCmsAll) window.applyCmsAll();
      }).catch(err => console.error("CMS startup init error:", err));
    }

    // --- INTELLIGENT SMART PREVIEW SCANNER ---
    window.renderSmartPreview = (productId, frameSrc, bgSrc, productName) => {
      const containers = document.querySelectorAll(`.smart-preview-${productId}`);
      if (!containers.length) return;

      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";

      frameImg.onload = () => {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";

        bgImg.onload = () => {
          const imgW = frameImg.naturalWidth;
          const imgH = frameImg.naturalHeight;

          // 1. Scan the Frame to find the physical bounding box
          const scanCanvas = document.createElement('canvas');
          scanCanvas.width = imgW;
          scanCanvas.height = imgH;
          const ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(frameImg, 0, 0);

          let minX = imgW, minY = imgH, maxX = 0, maxY = 0;
          let hasPixels = false;

          try {
            const data = ctx.getImageData(0, 0, imgW, imgH).data;
            for (let y = 0; y < imgH; y++) {
              for (let x = 0; x < imgW; x++) {
                // Check for non-transparent pixels
                if (data[(y * imgW + x) * 4 + 3] > 10) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                  hasPixels = true;
                }
              }
            }
          } catch (e) {
            console.warn("CORS issue scanning frame bounds.");
          }

          if (!hasPixels) { minX = 0; minY = 0; maxX = imgW; maxY = imgH; }

          // Add a tiny inward safety buffer to tuck background seamlessly behind the frame edge
          const bufferX = (maxX - minX) * 0.005;
          const bufferY = (maxY - minY) * 0.005;
          minX += bufferX; minY += bufferY; maxX -= bufferX; maxY -= bufferY;

          const w = maxX - minX;
          const h = maxY - minY;

          // 2. Generate a Flat Composite Image on a new Canvas
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = imgW;
          finalCanvas.height = imgH;
          const finalCtx = finalCanvas.getContext('2d');

          // Draw background perfectly stretched into the bounding box (forces fill, prevents gaps/bleeding)
          finalCtx.drawImage(bgImg, minX, minY, w, h);
          // Draw the frame cleanly over it
          finalCtx.drawImage(frameImg, 0, 0, imgW, imgH);

          // Export as a single flat image
          const compositeUrl = finalCanvas.toDataURL('image/png');

          // 3. Inject the flattened image into all UI containers
          // This makes it 100% immune to CSS letterboxing, flexbox collapsing, or aspect-ratio bugs!
          containers.forEach(container => {
            container.classList.remove('p-4'); // Clean up loader padding
            const altText = productName ? `${productName} Picture Frame Preview` : "Bespoke Custom Dimension Picture Frame Preview";
            container.innerHTML = `<img src="${compositeUrl}" alt="${altText}" title="${productName || 'Bespoke Custom Frame'}" loading="lazy" class="w-full h-full object-contain pointer-events-none drop-shadow-md" style="padding:0 !important; margin:0 !important; border:none !important; background:transparent !important; box-shadow:none !important;">`;
          });
        };
        bgImg.src = bgSrc;
      };
      frameImg.src = frameSrc;
    };
    // --- ZOOM & OPACITY LOGIC ---
    function updateElementTransform(el) {
      let flipX = el.dataset.scaleX ? parseFloat(el.dataset.scaleX) : 1;
      let flipY = el.dataset.scaleY ? parseFloat(el.dataset.scaleY) : 1;
      let zoom = el.dataset.zoom ? parseFloat(el.dataset.zoom) : 1;

      let transformStr = `scaleX(${flipX * zoom}) scaleY(${flipY * zoom})`;
      const innerImg = el.querySelector('img') || el.querySelector('svg');

      if (innerImg) innerImg.style.transform = transformStr;
      else el.style.transform = transformStr;
    }

    document.getElementById('item-opacity').addEventListener('input', e => {
      if (selectedItem) {
        selectedItem.style.opacity = e.target.value / 100;
        selectedItem.dataset.opacity = e.target.value;
      }
    });
    document.getElementById('item-opacity').addEventListener('change', recordState);

    document.getElementById('item-zoom').addEventListener('input', e => {
      if (selectedItem) {
        selectedItem.dataset.zoom = e.target.value;
        updateElementTransform(selectedItem);
      }
    });
    document.getElementById('item-zoom').addEventListener('change', recordState);

    // Ensure inputs update when selecting an item
    const originalSelectElement = selectElement;
    selectElement = function (el, type) {
      originalSelectElement(el, type);
      if (el) {
        document.getElementById('item-opacity').value = el.dataset.opacity || 100;
        document.getElementById('item-zoom').value = el.dataset.zoom || 1;
      }
    };


    // --- DYNAMIC PRICING LOGIC ---
    function calculateCanvasCost() {
      let total = 0;
      let breakdown = [];

      // Base cost of a blank frame (adjust if needed)
      const baseCost = 0;

      const items = document.querySelectorAll('#artwork-layer .canvas-item');
      items.forEach(item => {
        const cost = parseFloat(item.dataset.cost) || 0;
        const name = item.dataset.itemName || "Custom Element";
        if (cost > 0) {
          total += cost;
          breakdown.push({ name, cost });
        }
      });

      return { total: total + baseCost, breakdown };
    }

    function getCurrentCustomizationSummary() {
      const config = window.activeFrameConfiguration || {};
      const decor = Array.from(document.querySelectorAll('#artwork-layer .canvas-item')).filter(item => item.dataset.frameRole !== 'frame' && item.dataset.frameRole !== 'artwork' && (parseFloat(item.dataset.cost) || 0) >= 0 && item.dataset.itemName).map(item => ({ name: item.dataset.itemName, price: parseFloat(item.dataset.cost) || 0 }));
      return { product: config.productName || document.getElementById('editor-project-title').innerText, frame: config.productName || 'Custom Frame', size: config.size ? { width: config.size.width, height: config.size.height, name: config.size.name || `${config.size.width} × ${config.size.height}` } : null, colour: config.colour || null, thickness: config.dynamicThickness ? config.thickness || 100 : null, decor, quantity: 1, pricing: calculateCanvasCost() };
    }
    function renderCheckoutCustomizationSummary() {
      const container = document.getElementById('checkout-customization-summary'); if (!container) return;
      const summaries = window.isDirectBuyCheckout ? [getCurrentCustomizationSummary()] : cartItems.map(item => item.customization || { product: item.title, frame: 'Custom frame', decor: [], quantity: 1, pricing: { total: parseFloat(item.cost) || 0, breakdown: [{ name: item.title, cost: parseFloat(item.cost) || 0 }] } });
      container.innerHTML = `<p class="font-black text-slate uppercase tracking-wider text-[10px] mb-3">Order customization summary</p>${summaries.map(summary => `<div class="border-t border-sand/40 pt-2 mt-2"><div class="flex justify-between font-extrabold text-charcoal"><span>${summary.product}</span><span>${window.appCurrency || '$'}${summary.pricing.total.toFixed(2)}</span></div><div class="text-slate leading-relaxed mt-1">Frame: ${summary.frame}${summary.size ? ` · Size: ${summary.size.name}` : ''}${summary.colour ? ` · Colour: ${summary.colour.name}` : ''}${summary.thickness ? ` · Thickness: ${summary.thickness}%` : ''}<br>Decor: ${summary.decor.length ? summary.decor.map(d => d.name).join(', ') : 'None'} · Quantity: ${summary.quantity}</div></div>`).join('')}`;
    }

    window.showPricePreview = () => {
      const pricing = calculateCanvasCost();

      let breakdownHtml = pricing.breakdown.length > 0
        ? pricing.breakdown.map(item => `<div class="flex justify-between items-center py-2 border-b border-sand/40"><span class="text-xs font-bold text-slate">${item.name}</span><span class="text-xs font-black text-charcoal">${window.appCurrency || '$'}${item.cost.toFixed(2)}</span></div>`).join('')
        : `<div class="text-center py-4 text-xs font-bold text-slate">No priced assets added yet.</div>`;

      const modalHtml = `
            <div id="price-preview-modal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm transition-opacity">
                <div class="glass-panel p-8 rounded-3xl border-2 border-flame/40 shadow-2xl w-full max-w-sm">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-extrabold text-charcoal">Design Cost Estimate</h3>
                        <button onclick="document.getElementById('price-preview-modal').remove()" class="text-slate hover:text-flame transition"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <div class="max-h-48 overflow-y-auto no-scrollbar mb-4 bg-white rounded-xl border border-sand p-4 shadow-inner">
                        ${breakdownHtml}
                    </div>
                    <div class="flex justify-between items-center pt-4 border-t border-sand/60">
                        <span class="text-sm font-bold text-slate uppercase tracking-wider">Total</span>
                        <span class="text-2xl font-black text-flame">${window.appCurrency || '$'}${pricing.total.toFixed(2)}</span>
                    </div>
                    <button onclick="document.getElementById('price-preview-modal').remove()" class="mt-6 w-full btn-solid-orange py-3 rounded-xl text-cream font-extrabold text-sm shadow-md">Continue Designing</button>
                </div>
            </div>
        `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      lucide.createIcons();
    };

    // Update your proceedToCheckout function to use the dynamic cost instead of static $85
    const originalProceed = proceedToCheckout;
    proceedToCheckout = function (isDirectBuy = false) {
      if (!isDirectBuy && cartItems.length === 0) {
        showToast("Your cart is empty!");
        return;
      }

      const dynamicCost = calculateCanvasCost().total;

      // Temporarily override the hardcoded 85 before proceeding
      setTimeout(() => {
        const total = isDirectBuy ? dynamicCost : cartItems.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const totalEl = document.getElementById('chk-total');
        if (totalEl) totalEl.innerText = `${window.appCurrency || '$'}${total.toFixed(2)}`;
        renderCheckoutCustomizationSummary();
      }, 1300); // 1300ms matches the timeout in your existing transition

      originalProceed(isDirectBuy);
    };
    // --- CLOUDINARY CONFIGURATION ---
    const CLOUDINARY_CLOUD_NAME = "dudxkkgjy";
    const CLOUDINARY_UPLOAD_PRESET = "framecraft_uploads";

    async function uploadToCloudinary(file) {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const fd = new FormData();

      if (file instanceof Blob && !file.name) {
        fd.append("file", file, "upload.jpg");
      } else {
        fd.append("file", file);
      }

      fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(url, { method: "POST", body: fd });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Cloudinary upload failed");
      }
      const data = await response.json();
      return data.secure_url;
    }

    lucide.createIcons();



    // --- CONTACT FORM HANDLER ---
    window.hideGlobalLoader = () => {
      const barsContainer = document.getElementById('bars-container');
      const loaderContainer = document.getElementById('loader-container');
      const bars = document.querySelectorAll('.bar');

      loaderContainer.classList.add('fade-out');
      bars.forEach((bar, i) => {
        bar.style.transition = `transform 0.5s cubic-bezier(0.77, 0, 0.175, 1) ${i * 0.05}s`;
        bar.style.transform = 'translate3d(0, 100%, 0)';
      });

      setTimeout(() => {
        barsContainer.style.display = 'none';
        barsContainer.classList.remove('active');
      }, 800);
    };

    window.playGlobalLoader = (text, callback, autoHide = true) => {
      const barsContainer = document.getElementById('bars-container');
      const loaderContainer = document.getElementById('loader-container');
      const progress = document.getElementById('loading-progress');
      const textEl = document.getElementById('loading-text-el');
      const bars = document.querySelectorAll('.bar');

      if (textEl) textEl.innerText = text;
      progress.style.transition = 'none';
      progress.style.width = '0%';

      barsContainer.style.display = 'flex';
      barsContainer.classList.add('active');
      loaderContainer.style.display = 'flex';
      loaderContainer.classList.remove('fade-out');

      bars.forEach(bar => {
        bar.style.transition = 'none';
        bar.style.transform = 'translate3d(0, -100%, 0)';
      });

      void barsContainer.offsetWidth;

      bars.forEach((bar, i) => {
        bar.style.transition = `transform 0.5s cubic-bezier(0.77, 0, 0.175, 1) ${i * 0.05}s`;
        bar.style.transform = 'translate3d(0, 0, 0)';
      });

      // TIMED EXTENSION: Creep up the progress bar smoothly over 3.2 seconds
      setTimeout(() => {
        progress.style.transition = 'width 3.2s cubic-bezier(0.25, 1, 0.5, 1)';
        progress.style.width = '100%';

        if (callback) callback();

        // Wait for full duration before dropping the curtain
        if (autoHide) {
          setTimeout(() => {
            window.hideGlobalLoader();
          }, 3300);
        }
      }, 200);
    };

    document.addEventListener("DOMContentLoaded", () => {
      const barsContainer = document.getElementById('bars-container');
      const loaderContainer = document.getElementById('loader-container');
      const heroImage = document.getElementById('hero-image');
      const loadingProgress = document.getElementById('loading-progress');
      const bars = document.querySelectorAll('.bar');

      barsContainer.classList.add('active');
      bars.forEach(bar => {
        bar.style.transform = 'translate3d(0, 0, 0)';
      });

      let progress = 0;
      let lastTime = performance.now();
      const totalDuration = 3500; // Total 3.5 seconds load time

      function updateProgress(currentTime) {
        const deltaTime = currentTime - lastTime;
        progress += (deltaTime / totalDuration) * 90;
        lastTime = currentTime;

        if (progress <= 90) {
          loadingProgress.style.width = `${progress}%`;
          requestAnimationFrame(updateProgress);
        }
      }
      requestAnimationFrame(updateProgress);

      const startTime = Date.now();
      const imageLoadPromise = new Promise(resolve => {
        // Safety timeout to prevent loader from hanging indefinitely
        const safetyTimeout = setTimeout(() => {
          console.warn("Hero image load safety timeout reached.");
          resolve();
        }, 5000);

        const onDone = () => {
          clearTimeout(safetyTimeout);
          resolve();
        };

        if (!heroImage) {
          onDone();
        } else if (heroImage.complete && heroImage.naturalHeight !== 0) {
          onDone();
        } else {
          heroImage.onload = onDone;
          heroImage.onerror = onDone;
        }
      });

      imageLoadPromise.then(() => {
        const remainingTime = Math.max(0, totalDuration - (Date.now() - startTime));
        setTimeout(() => {
          loadingProgress.style.transition = 'width 0.6s ease-out';
          loadingProgress.style.width = '100%';

          setTimeout(() => {
            if (heroImage) heroImage.classList.add('visible');
            window.hideGlobalLoader();
          }, 600);
        }, remainingTime);
      });
    });

    // --- GLOBAL VARIABLES ---
    let siteSettings = {};
    let taxSettings = { rate: 0, label: 'Tax' };
    let productTemplates = [];
    let uploadedProductImages = [];

    // Global variable for categories and active sales tracking
    let globalCategories = [];

    // --- ADMIN: Dynamic Sub-Tab Switching Logic ---
    window.switchAdminSubTab = (parent, tab) => {
      document.querySelectorAll(`[id^="tab-${parent}-"]`).forEach(btn => {
        btn.classList.replace('bg-charcoal', 'bg-editorbg');
        btn.classList.replace('text-cream', 'text-slate');
      });
      document.querySelectorAll(`[id^="view-${parent}-"]`).forEach(view => {
        view.classList.add('hidden');
      });

      const activeBtn = document.getElementById(`tab-${parent}-${tab}`);
      const activeView = document.getElementById(`view-${parent}-${tab}`);
      if (activeBtn) {
        activeBtn.classList.replace('bg-editorbg', 'bg-charcoal');
        activeBtn.classList.replace('text-slate', 'text-cream');
      }
      if (activeView) activeView.classList.remove('hidden');

      // Specific Loaders for Tabs
      if (parent === 'products') {
        if (tab === 'manage-product') loadAdminManageProductsTable();
        if (tab === 'manage-elements') loadAdminManageElementsTable();
        if (tab === 'manage-category') loadCategoriesTable();
        if (tab === 'add-product') populateProductCategoryDropdown();
      }
      if (parent === 'sales') {
        if (tab === 'product') populateSalesProductsDropdown();
        if (tab === 'category') populateSalesCategoryDropdown();
        if (tab === 'manage') loadAdminManageSales();
      }
      if (parent === 'customers' && tab === 'contact') loadCustomersForContact();
    };

    // --- ADMIN: Toggle Primary Admin Section ---
    async function toggleAdminSection(section) {
      // Hide all sections and reset button styles
      const sections = ['dashboard', 'orders', 'products', 'sales', 'pages', 'customers', 'settings'];

      sections.forEach(sec => {
        const el = document.getElementById(`admin-${sec}-section`);
        if (el) el.classList.add('hidden');

        const btn = document.getElementById(`btn-adm-${sec}`);
        if (btn) {
          btn.classList.remove('bg-charcoal', 'text-cream', 'shadow-md');
          btn.classList.add('hover:bg-sand/30', 'text-slate');
        }
      });

      const selectedSection = document.getElementById(`admin-${section}-section`);
      if (selectedSection) selectedSection.classList.remove('hidden');

      const activeBtn = document.getElementById(`btn-adm-${section}`);
      if (activeBtn) {
        activeBtn.classList.remove('hover:bg-sand/30', 'text-slate');
        activeBtn.classList.add('bg-charcoal', 'text-cream', 'shadow-md');
      }

      // Loaders mapping
      if (section === 'dashboard') {
        await window.fetchGlobalOrders();
        renderFinanceDashboard();
        // Calculate Total Customers for Dashboard
        const userSnap = await db.collection('users').where('role', '==', 'user').get();
        document.getElementById('finance-total-customers').innerText = userSnap.size;
      }
      if (section === 'orders') {
        await window.fetchGlobalOrders();
        renderAdminOrders();
        if (typeof renderAdminTracking === 'function') renderAdminTracking();
      }
      if (section === 'products') await loadProductTemplates();
      if (section === 'sales') {
        await window.populateSalesCategoryDropdown();
        // Ensure products are loaded before populating the product dropdown
        if (productTemplates.length === 0) await loadProductTemplates();
        window.populateSalesProductsDropdown();
      }
      if (section === 'customers') await loadCustomers();
      if (section === 'settings') await loadSettings();
      if (section === 'pages') await loadDynamicPagesTable();
    }

    // --- ADMIN: Render Main Orders Table (With Filters) ---
    window.renderAdminOrders = () => {
      const tbody = document.getElementById('admin-orders-table-body');
      if (!tbody) return;

      const dateFilter = document.getElementById('admin-order-date-filter')?.value;
      const statusFilter = document.getElementById('admin-order-status-filter')?.value || 'ALL';
      const searchFilter = document.getElementById('admin-order-search')?.value.toLowerCase() || '';

      let filteredOrders = globalOrders.filter(o => {
        let match = true;
        if (searchFilter && (!o.id || !o.id.toLowerCase().includes(searchFilter))) match = false;
        if (statusFilter !== 'ALL' && o.status !== statusFilter) match = false;
        if (dateFilter) {
          const filterDateObj = new Date(dateFilter).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          if (o.date !== filterDateObj) match = false;
        }
        return match;
      });

      if (filteredOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-slate font-bold">No orders found matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = filteredOrders.map(o => {
        const itemName = (o.orderedProducts && o.orderedProducts.length > 0) ? o.orderedProducts[0].title : 'Custom Frame';
        let safeTotal = typeof o.total === 'string' ? parseFloat(o.total.replace(/[^0-9.]/g, '')) || 0 : (typeof o.total === 'number' ? o.total : 0);
        let badgeColor = o.status === 'Delivered' ? 'text-green-600 bg-green-50' : (o.status === 'Canceled' ? 'text-red-600 bg-red-50' : 'text-slate bg-sand/30');

        return `
        <tr class="hover:bg-sand/10 transition border-b border-sand/30">
          <td class="px-6 py-4 font-black">${o.id || 'N/A'}</td>
          <td class="px-6 py-4">${itemName}</td>
          <td class="px-6 py-4 text-slate text-xs">${o.date || 'N/A'}</td>
          <td class="px-6 py-4"><span class="px-2 py-1 rounded font-bold text-[10px] uppercase ${badgeColor}">${o.status}</span></td>
          <td class="px-6 py-4 font-bold text-flame">${window.appCurrency || '$'}${safeTotal.toFixed(2)}</td>
          <td class="px-6 py-4 text-right">
            <button onclick="viewOrderDetails('${o.id}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition">View Details</button>
          </td>
        </tr>
        `;
      }).join('');
    };

    // --- ADMIN: Categories Logic ---
    window.loadCategoriesData = async () => {
      try {
        const snap = await db.collection('categories').orderBy('createdAt', 'desc').get();
        globalCategories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error("Error fetching categories:", e);
      }
    };

    // --- Initialize Category Slider Logic ---
    window.initCategorySlider = () => {
      const categoryContainer = document.getElementById('category-container');
      const prevBtn = document.getElementById('cat-prev');
      const nextBtn = document.getElementById('cat-next');
      const dotsContainer = document.getElementById('cat-dots');

      if (categoryContainer && dotsContainer) {
        const items = categoryContainer.children;
        const itemCount = items.length;

        dotsContainer.innerHTML = ''; // clear existing dots
        if (itemCount === 0) return;

        // Create dots
        for (let i = 0; i < itemCount; i++) {
          const dot = document.createElement('button');
          dot.className = `h-1.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-primary' : 'w-2 bg-outline-variant'}`;
          dot.onclick = () => {
            const itemWidth = items[0].offsetWidth + 24; // item + gap
            categoryContainer.scrollTo({
              left: i * itemWidth,
              behavior: 'smooth'
            });
          };
          dotsContainer.appendChild(dot);
        }

        // Scroll buttons
        if (prevBtn) {
          prevBtn.onclick = () => {
            const itemWidth = items[0].offsetWidth + 24;
            categoryContainer.scrollBy({ left: -itemWidth, behavior: 'smooth' });
          };
        }
        if (nextBtn) {
          nextBtn.onclick = () => {
            const itemWidth = items[0].offsetWidth + 24;
            categoryContainer.scrollBy({ left: itemWidth, behavior: 'smooth' });
          };
        }

        // Update dots on scroll
        categoryContainer.onscroll = () => {
          const itemWidth = items[0].offsetWidth + 24;
          const activeIndex = Math.round(categoryContainer.scrollLeft / itemWidth);

          Array.from(dotsContainer.children).forEach((dot, idx) => {
            if (idx === activeIndex) {
              dot.classList.add('w-8', 'bg-primary');
              dot.classList.remove('w-2', 'bg-outline-variant');
            } else {
              dot.classList.remove('w-8', 'bg-primary');
              dot.classList.add('w-2', 'bg-outline-variant');
            }
          });
        };
      }
    };

    // --- Load dynamic categories to landing page ---
    window.renderLandingCategories = async () => {
      if (globalCategories.length === 0) {
        await window.loadCategoriesData();
      }
      const container = document.getElementById('category-container');
      if (!container) return;

      if (globalCategories.length === 0) {
        // Just load the standard template to preview logic, until categories are created in backend
        container.innerHTML = `
          <div class="flex-shrink-0 w-[280px] aspect-[3/4] relative group/item cursor-pointer snap-start rounded overflow-hidden" onclick="window.handlePathRouting('/products')">
            <img class="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2Z56hWbglhhjBkYHbO029KjLJl2wTaF6sN2ba7dhj0otMGeCJnLACMszysO4-Rr--EsUh4FsQVyujgopw6tDxgOrnf9cnuiuhby7xhLzWZia72ZIDdu3nnWGCkSHYO7hipZzJtmBc0IUrcPB5U3rekz4otnmfOnvaL-FM3zQHUWbK8Y1V2Ft_CShsE8zz-hXNFIYxZff13JWHCOAnC0U_4N0H5oDiv0iqqtp4ANv98d5Akhbig0YS">
            <div class="absolute inset-0 bg-primary/0 group-hover/item:bg-primary/80 transition-all duration-500 flex flex-col justify-end p-8">
              <div class="opacity-0 group-hover/item:opacity-100 transform translate-y-4 group-hover/item:translate-y-0 transition-all duration-500">
                <h4 class="text-on-primary font-headline-md text-2xl mb-2">Art Prints</h4>
                <p class="text-on-primary/80 text-label-sm mb-6">Explore our exclusive collection.</p>
                <button class="bg-on-primary text-primary px-4 py-2 text-label-sm font-label-sm rounded font-bold">View Products</button>
              </div>
            </div>
          </div>
        `;
        window.initCategorySlider();
        return;
      }

      container.innerHTML = globalCategories.map(c => `
        <div class="flex-shrink-0 w-[280px] aspect-[3/4] relative group/item cursor-pointer snap-start rounded overflow-hidden" onclick="window.handlePathRouting('/products')">
          <img class="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" src="${c.imageURL || 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=400&h=400'}" alt="${c.name}">
          <div class="absolute inset-0 bg-primary/0 group-hover/item:bg-primary/80 transition-all duration-500 flex flex-col justify-end p-8">
            <div class="opacity-0 group-hover/item:opacity-100 transform translate-y-4 group-hover/item:translate-y-0 transition-all duration-500">
              <h4 class="text-on-primary font-headline-md text-2xl mb-2">${c.name}</h4>
              <p class="text-on-primary/80 text-label-sm mb-6">${c.desc || 'Explore our exclusive collection.'}</p>
              <button class="bg-on-primary text-primary px-4 py-2 text-label-sm font-label-sm rounded font-bold">View Products</button>
            </div>
          </div>
        </div>
      `).join('');

      window.initCategorySlider();
    };

    window.populateProductCategoryDropdown = async () => {
      await loadCategoriesData();
      const select = document.getElementById('product-category');
      if (!select) return;
      select.innerHTML = '<option value="">No Category</option>' + globalCategories.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');
    };

    window.populateSalesCategoryDropdown = async () => {
      await loadCategoriesData();
      const select = document.getElementById('sales-category-select');
      if (!select) return;
      select.innerHTML = '<option value="">-- Choose Category --</option>' + globalCategories.map(c => `
        <option value="${c.id}">${c.name}</option>
      `).join('');
    };

    window.handleAdminCategoryAdd = async (e) => {
      e.preventDefault();
      const name = document.getElementById('cat-name').value;
      const desc = document.getElementById('cat-desc').value;
      const file = document.getElementById('cat-image').files[0];

      const btn = e.target.querySelector('button[type="submit"]');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin inline-block"></i> Creating...`;
      btn.disabled = true;

      try {
        let imgUrl = '';
        if (file) {
          showToast("Uploading Cover Photo...");
          imgUrl = await uploadToCloudinary(file);
        }
        await db.collection('categories').add({ name, desc, imageURL: imgUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        showToast("Category Added Successfully!");
        e.target.reset();
        document.getElementById('cat-file-name').innerText = "Browse Image";

        // Refresh the underlying data AND update the table UI
        await loadCategoriesData();
        if (document.getElementById('admin-manage-categories-table-body')) {
          window.loadCategoriesTable();
        }
      } catch (error) {
        showToast("Error adding category: " + error.message);
      } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        lucide.createIcons();
      }
    };

    window.loadCategoriesTable = async () => {
      await loadCategoriesData();
      const tbody = document.getElementById('admin-manage-categories-table-body');
      if (!tbody) return;

      if (globalCategories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate font-bold">No categories exist yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = globalCategories.map(c => `
        <tr class="hover:bg-sand/10 transition border-b border-sand/30">
          <td class="px-6 py-4">
            ${c.imageURL ? `<img src="${c.imageURL}" class="w-12 h-12 object-cover rounded-lg border border-sand shadow-sm">` : `<div class="w-12 h-12 bg-editorbg border border-sand rounded-lg flex items-center justify-center text-slate"><i data-lucide="image" class="w-5 h-5"></i></div>`}
          </td>
          <td class="px-6 py-4 font-bold text-charcoal">${c.name}</td>
          <td class="px-6 py-4 text-xs text-slate max-w-xs truncate">${c.desc || 'No description'}</td>
          <td class="px-6 py-4 text-right">
            <button onclick="deleteCategory('${c.id}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-600 transition">Delete</button>
          </td>
        </tr>
      `).join('');
      lucide.createIcons();
    };

    window.deleteCategory = async (id) => {
      if (confirm("Are you sure you want to delete this category? This will NOT delete the associated products.")) {
        try {
          await db.collection('categories').doc(id).delete();
          showToast("Category deleted.");
          loadCategoriesTable();
        } catch (e) {
          showToast("Error deleting: " + e.message);
        }
      }
    };

    // --- ADMIN: Product & Elements Tables with Out of Stock Logic ---
    window.loadAdminManageProductsTable = async () => {
      const tbody = document.getElementById('admin-manage-products-table-body');
      if (!tbody) return;

      try {
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
        productTemplates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (globalCategories.length === 0) await loadCategoriesData();

        tbody.innerHTML = productTemplates.map(p => {
          const cat = globalCategories.find(c => c.id === p.categoryId);
          const catName = cat ? cat.name : 'Uncategorized';
          const displayImg = (Array.isArray(p.galleryImages) && p.galleryImages[0]) ||
                             (Array.isArray(p.images) && p.images[0]) ||
                             p.frameImage ||
                             'https://via.placeholder.com/150?text=No+Image';

          let statusBadge = p.outOfStock ? `<span class="px-2 py-1 rounded bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider block mb-1">Out of Stock</span>` : `<span class="px-2 py-1 rounded bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-wider block mb-1">In Stock</span>`;
          let priceString = p.saleActive ? `<span class="line-through text-slate text-xs">${window.appCurrency || '$'}${p.price.toFixed(2)}</span> <span class="text-flame font-bold">${window.appCurrency || '$'}${p.salePrice.toFixed(2)}</span>` : `<span class="text-flame font-bold">${window.appCurrency || '$'}${p.price.toFixed(2)}</span>`;

          return `
          <tr class="hover:bg-sand/10 transition border-b border-sand/30">
            <td class="px-6 py-4"><img src="${displayImg}" class="w-12 h-12 object-contain rounded border border-sand bg-white p-1"></td>
            <td class="px-6 py-4 font-bold text-charcoal">${p.name}</td>
            <td class="px-6 py-4 text-xs font-semibold text-slate uppercase">${catName}</td>
            <td class="px-6 py-4">${statusBadge} ${priceString}</td>
            <td class="px-6 py-4 text-right">
              <button onclick="toggleProductStock('${p.id}', ${!!p.outOfStock})" class="px-3 py-1.5 ${p.outOfStock ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'} border rounded-lg text-xs font-bold transition mr-1 mb-1 sm:mb-0 w-24">
                ${p.outOfStock ? 'Mark In Stock' : 'Mark OOS'}
              </button>
              <button onclick="switchAdminSubTab('products', 'add-product'); editProduct('${p.id}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mr-1">Edit</button>
              <button onclick="deleteProduct('${p.id}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-600 transition">Delete</button>
            </td>
          </tr>
        `;
        }).join('');

        if (productTemplates.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" class="px-6 py-8 text-center text-slate font-bold">No products found. Add a product above!</td>
            </tr>
          `;
        }

        if (window.lucide) lucide.createIcons();
      } catch (e) {
        console.error("Error loading manage products table:", e);
      }
    };

    window.toggleProductStock = async (id, currentOos) => {
      const newState = !currentOos;
      if (confirm(`Mark this product as ${newState ? 'Out of Stock' : 'In Stock'}?`)) {
        try {
          await db.collection('products').doc(id).update({ outOfStock: newState });
          showToast(`Product is now ${newState ? 'Out of Stock' : 'In Stock'}`);
          await loadProductTemplates();
          window.loadAdminManageProductsTable();
        } catch (e) {
          showToast("Error updating stock: " + e.message);
        }
      }
    };

    window.loadAdminManageElementsTable = async () => {
      const tbody = document.getElementById('admin-manage-elements-table-body');
      if (!tbody) return;
      const snapshot = await db.collection('assets').orderBy('createdAt', 'desc').get();
      const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(a => a.category !== 'frames');

      if (assets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate font-bold">No assets found.</td></tr>`;
        return;
      }

      tbody.innerHTML = assets.map(a => {
        let statusBadge = a.outOfStock ? `<span class="px-2 py-1 rounded bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider block mb-1">Out of Stock</span>` : `<span class="px-2 py-1 rounded bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-wider block mb-1">In Stock</span>`;
        let priceString = a.saleActive ? `<span class="line-through text-slate text-xs">${window.appCurrency || '$'}${a.cost}</span> <span class="text-flame font-bold">${window.appCurrency || '$'}${a.salePrice}</span>` : `<span class="text-flame font-bold">${window.appCurrency || '$'}${a.cost || 0}</span>`;

        return `
        <tr class="hover:bg-sand/10 transition border-b border-sand/30">
          <td class="px-6 py-4"><img src="${a.imageURL}" class="w-10 h-10 object-contain rounded border border-sand bg-white p-1"></td>
          <td class="px-6 py-4 font-bold uppercase text-[10px] text-slate">${a.category}</td>
          <td class="px-6 py-4">${statusBadge} ${priceString}</td>
          <td class="px-6 py-4 text-right">
            <button onclick="toggleElementStock('${a.id}', ${!!a.outOfStock})" class="px-3 py-1.5 ${a.outOfStock ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'} border rounded-lg text-xs font-bold transition mr-1 mb-1 sm:mb-0 w-24">
              ${a.outOfStock ? 'Mark In Stock' : 'Mark OOS'}
            </button>
            <button onclick="editAdminAssetCost('${a.id}', ${a.cost || 0})" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mr-1">Edit Price</button>
            <button onclick="deleteAdminAsset('${a.id}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-600 transition">Delete</button>
          </td>
        </tr>
      `}).join('');
      lucide.createIcons();
    };

    window.toggleElementStock = async (id, currentOos) => {
      const newState = !currentOos;
      if (confirm(`Mark this asset as ${newState ? 'Out of Stock' : 'In Stock'}?`)) {
        try {
          await db.collection('assets').doc(id).update({ outOfStock: newState });
          showToast(`Asset is now ${newState ? 'Out of Stock' : 'In Stock'}`);
          loadAdminManageElementsTable();
        } catch (e) {
          showToast("Error updating stock: " + e.message);
        }
      }
    };

    // --- ADMIN: Sales Management Logic ---
    window.populateSalesProductsDropdown = () => {
      const select = document.getElementById('sales-product-select');
      if (!select) return;
      select.innerHTML = '<option value="">-- Choose Product --</option>' + productTemplates.map(p => `
        <option value="${p.id}">${p.name} - ${window.appCurrency || '$'}${p.price}</option>
      `).join('');
    };

    window.applyCategorySale = async (e) => {
      e.preventDefault();
      const catId = document.getElementById('sales-category-select').value;
      const discountStr = document.getElementById('sales-cat-discount').value;
      if (!catId || !discountStr) return;

      const discount = parseFloat(discountStr);
      const category = globalCategories.find(c => c.id === catId);
      if (!category) return;

      const btn = e.target.querySelector('button[type="submit"]');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin inline-block"></i> Processing...`;
      btn.disabled = true;

      try {
        const snap = await db.collection('products').where('categoryId', '==', catId).get();
        const batch = db.batch();
        let updatedCount = 0;

        snap.forEach(doc => {
          const prod = doc.data();
          const salePrice = prod.price - (prod.price * (discount / 100));
          batch.update(doc.ref, { salePrice: salePrice, saleActive: true, saleDesc: `${discount}% off Category` });
          updatedCount++;
        });

        if (updatedCount > 0) {
          await batch.commit();
        }

        await db.collection('sales').add({
          type: 'Category',
          targetId: catId,
          targetName: category.name,
          discountPercent: discount,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast(`Sale applied to ${updatedCount} products in ${category.name}!`);
        e.target.reset();
        await loadProductTemplates();
      } catch (error) {
        showToast("Error applying sale: " + error.message);
      } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        lucide.createIcons();
      }
    };

    window.applyProductSale = async (e) => {
      e.preventDefault();
      const prodId = document.getElementById('sales-product-select').value;
      const discountStr = document.getElementById('sales-prod-discount').value;
      const fixedStr = document.getElementById('sales-prod-fixed').value;

      if (!prodId || (!discountStr && !fixedStr)) {
        showToast("Select a product and provide either a percentage or fixed price.");
        return;
      }

      const product = productTemplates.find(p => p.id === prodId);
      if (!product) return;

      let salePrice = 0;
      let descStr = '';

      if (fixedStr) {
        salePrice = parseFloat(fixedStr);
        descStr = `Fixed at ${window.appCurrency || '$'}${salePrice.toFixed(2)}`;
      } else {
        const disc = parseFloat(discountStr);
        salePrice = product.price - (product.price * (disc / 100));
        descStr = `${disc}% Off`;
      }

      const btn = e.target.querySelector('button[type="submit"]');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin inline-block"></i> Applying...`;
      btn.disabled = true;

      try {
        await db.collection('products').doc(prodId).update({
          salePrice: salePrice,
          saleActive: true,
          saleDesc: descStr
        });

        await db.collection('sales').add({
          type: 'Product',
          targetId: prodId,
          targetName: product.name,
          salePrice: salePrice,
          descStr: descStr,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast(`Sale successfully applied to ${product.name}!`);
        e.target.reset();
        await loadProductTemplates();
      } catch (error) {
        showToast("Error applying product sale: " + error.message);
      } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        lucide.createIcons();
      }
    };

    window.loadAdminManageSales = async () => {
      const tbody = document.getElementById('admin-manage-sales-table-body');
      if (!tbody) return;

      try {
        const snap = await db.collection('sales').orderBy('createdAt', 'desc').get();
        const sales = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (sales.length === 0) {
          tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate font-bold">No active sales right now.</td></tr>`;
          return;
        }

        tbody.innerHTML = sales.map(s => `
          <tr class="hover:bg-sand/10 transition border-b border-sand/30">
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded bg-charcoal text-cream text-[10px] font-black uppercase tracking-wider block w-max mb-1">${s.type}</span>
              <span class="font-bold text-charcoal">${s.targetName}</span>
            </td>
            <td class="px-6 py-4 text-slate text-sm">Varies (See Products)</td>
            <td class="px-6 py-4 font-bold text-flame">${s.discountPercent ? s.discountPercent + '% Off' : s.descStr}</td>
            <td class="px-6 py-4 text-right">
              <button onclick="removeSale('${s.id}', '${s.type}', '${s.targetId}')" class="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-600 transition">Revoke Sale</button>
            </td>
          </tr>
        `).join('');
      } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500 font-bold">Error loading sales data.</td></tr>`;
      }
    };

    window.removeSale = async (saleId, type, targetId) => {
      if (confirm(`Remove this ${type} sale? Prices will revert to original.`)) {
        try {
          if (type === 'Category') {
            const snap = await db.collection('products').where('categoryId', '==', targetId).get();
            const batch = db.batch();
            snap.forEach(doc => {
              batch.update(doc.ref, { saleActive: false, salePrice: null, saleDesc: null });
            });
            await batch.commit();
          } else {
            await db.collection('products').doc(targetId).update({ saleActive: false, salePrice: null, saleDesc: null });
          }

          await db.collection('sales').doc(saleId).delete();

          showToast("Sale successfully revoked!");
          await loadProductTemplates();
          loadAdminManageSales();
        } catch (e) {
          showToast("Error revoking sale: " + e.message);
        }
      }
    };

    // --- ADMIN: Load Customers ---
    async function loadCustomers() {
      const tbody = document.getElementById('admin-customers-table-body');
      if (!tbody) return;

      try {
        const snapshot = await db.collection('users').where('role', '==', 'user').get();
        const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load order counts for each customer (optional, can be optimized later)
        const customerPromises = customers.map(async customer => {
          try {
            const orders = await db.collection('orders').where('userId', '==', customer.id).get();
            return { ...customer, orderCount: orders.size };
          } catch (e) {
            return { ...customer, orderCount: 0 };
          }
        });
        const customersWithOrders = await Promise.all(customerPromises);

        tbody.innerHTML = customersWithOrders.map(customer => `
          <tr>
            <td class="px-6 py-4 font-mono text-xs">${customer.id.substring(0, 8)}...</td>
            <td class="px-6 py-4 font-bold">${customer.name || 'N/A'}</td>
            <td class="px-6 py-4">${customer.email}</td>
            <td class="px-6 py-4">${customer.orderCount}</td>
            <td class="px-6 py-4">${customer.createdAt ? new Date(customer.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
              <button onclick="contactSpecificCustomer('${customer.id}', '${customer.email}')" class="px-3 py-1.5 bg-editorbg border border-sand rounded-lg text-xs font-bold hover:bg-sand/30 transition mr-1">
                <i data-lucide="mail" class="w-3.5 h-3.5 inline mr-1"></i> Contact
              </button>
              <button onclick="window.toggleCustomerBlock('${customer.id}', ${customer.isBlocked})" class="px-3 py-1.5 ${customer.isBlocked ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'} border rounded-lg text-xs font-bold transition">
                ${customer.isBlocked ? 'Unblock' : 'Block'}
              </button>
            </td>
          </tr>
        `).join('');
        lucide.createIcons();
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    }

    // --- LIVE CHAT SYSTEM (USER & ADMIN) ---

    let activeAdminChatUser = null;
    let adminChatListener = null;
    let adminUsersListener = null;
    let userChatListener = null;

    // --- Admin: Initialize Chat List ---
    async function loadCustomersForContact() {
      const listContainer = document.getElementById('admin-chat-users-list');
      if (!listContainer) return;

      if (adminUsersListener) adminUsersListener(); // Unsubscribe previous

      adminUsersListener = db.collection('chat_sessions')
        .orderBy('lastMessageAt', 'desc')
        .onSnapshot(async (snapshot) => {
          const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          if (sessions.length === 0) {
            listContainer.innerHTML = '<div class="p-6 text-center text-sm font-bold text-slate">No conversations yet.</div>';
            return;
          }

          let html = '';
          for (const s of sessions) {
            const unreadCount = s.unreadAdmin || 0;
            const badge = unreadCount > 0 ? `<span class="bg-green-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm">${unreadCount}</span>` : '';

            let time = '';
            if (s.lastMessageAt) {
              const date = s.lastMessageAt.toDate ? s.lastMessageAt.toDate() : new Date(s.lastMessageAt);
              time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            html += `
               <div onclick="window.openAdminChatForUser('${s.id}', '${(s.userName || '').replace(/'/g, "\\'")}', '${s.userEmail}')" 
                    class="p-4 border-b border-sand/30 hover:bg-sand/20 cursor-pointer transition flex items-center gap-3 ${activeAdminChatUser === s.id ? 'bg-sand/20 border-l-4 border-l-flame' : 'border-l-4 border-l-transparent'}">
                  <div class="w-10 h-10 rounded-full bg-charcoal text-cream flex items-center justify-center font-bold shrink-0">${(s.userName || 'U').charAt(0).toUpperCase()}</div>
                  <div class="flex-1 min-w-0">
                     <div class="flex justify-between items-baseline mb-1">
                        <h4 class="text-sm font-bold text-charcoal truncate">${s.userName || 'User'}</h4>
                        <span class="text-[9px] text-slate font-bold whitespace-nowrap ml-2">${time}</span>
                     </div>
                     <p class="text-xs text-slate truncate font-medium">${s.lastMessage || '...'}</p>
                  </div>
                  ${badge}
               </div>
             `;
          }
          listContainer.innerHTML = html;
          lucide.createIcons();
        });
    }

    // --- Admin: Open Specific Chat ---
    window.openAdminChatForUser = (userId, name, email) => {
      activeAdminChatUser = userId;
      document.getElementById('admin-chat-empty').classList.add('hidden');
      document.getElementById('admin-chat-header').classList.remove('hidden');
      document.getElementById('admin-chat-messages').classList.remove('hidden');
      document.getElementById('admin-chat-input-area').classList.remove('hidden');

      document.getElementById('admin-active-chat-avatar').innerText = (name || 'U').charAt(0).toUpperCase();
      document.getElementById('admin-active-chat-name').innerText = name || 'User';
      document.getElementById('admin-active-chat-email').innerText = email || '';

      // Reset unread count for admin
      db.collection('chat_sessions').doc(userId).set({ unreadAdmin: 0 }, { merge: true });

      if (adminChatListener) adminChatListener(); // Unsubscribe previous messages

      const msgContainer = document.getElementById('admin-chat-messages');

      adminChatListener = db.collection('chat_sessions').doc(userId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
          msgContainer.innerHTML = snapshot.docs.map(doc => {
            const msg = doc.data();
            const isMe = msg.sender === 'admin';
            return `
                 <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                   <div class="max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-charcoal text-cream rounded-br-sm' : 'bg-white border border-sand/50 text-charcoal rounded-bl-sm'}">
                     ${msg.text}
                   </div>
                 </div>
               `;
          }).join('');
          msgContainer.scrollTop = msgContainer.scrollHeight;
        });
    };

    // --- Admin: Send Message ---
    window.sendAdminChatMessage = async (e) => {
      e.preventDefault();
      const input = document.getElementById('admin-chat-input');
      const text = input.value.trim();
      if (!text || !activeAdminChatUser) return;

      input.value = '';
      const ts = Date.now();

      await db.collection('chat_sessions').doc(activeAdminChatUser).collection('messages').add({
        text: text, sender: 'admin', timestamp: ts
      });

      await db.collection('chat_sessions').doc(activeAdminChatUser).set({
        lastMessage: text, lastMessageAt: ts, unreadUser: firebase.firestore.FieldValue.increment(1)
      }, { merge: true });
    };

    // Click "Contact" from Customer Table redirects here
    window.contactSpecificCustomer = function (customerId, email) {
      switchAdminSubTab('customers', 'contact');
      db.collection('users').doc(customerId).get().then(doc => {
        if (doc.exists) {
          window.openAdminChatForUser(customerId, doc.data().name || 'User', email);
        }
      });
    }

    window.toggleUserChat = () => {
      if (!currentUser || currentUser.role === 'admin') {
        if (!currentUser) {
          pendingAction = 'chat';
        }
        toggleModal('login-modal');
        return;
      }
      const win = document.getElementById('user-chat-window');
      if (win.classList.contains('hidden')) {
        win.classList.remove('hidden');
        setTimeout(() => {
          win.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
          if (window.lucide) window.lucide.createIcons();
        }, 10);

        db.collection('chat_sessions').doc(currentUser.uid).set({ unreadUser: 0 }, { merge: true });
        document.getElementById('user-chat-unread-badge')?.classList.add('hidden');
      } else {
        win.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
        setTimeout(() => win.classList.add('hidden'), 300);
      }
    };

    // --- User: Send Message ---
    window.sendUserChatMessage = async (e) => {
      e.preventDefault();
      const input = document.getElementById('user-chat-input');
      const text = input.value.trim();
      if (!text || !currentUser) return;

      input.value = '';
      const ts = Date.now();

      await db.collection('chat_sessions').doc(currentUser.uid).collection('messages').add({
        text: text, sender: 'user', timestamp: ts
      });

      await db.collection('chat_sessions').doc(currentUser.uid).set({
        userName: currentUser.name, userEmail: currentUser.email,
        lastMessage: text, lastMessageAt: ts, unreadAdmin: firebase.firestore.FieldValue.increment(1)
      }, { merge: true });
    };

    // --- Initialize Realtime listeners on Auth ---
    function attachGlobalChatListeners(user) {
      if (!user) {
        if (userChatListener) { userChatListener(); userChatListener = null; }
        const container = document.getElementById('user-live-chat-container');
        if (container) {
          container.classList.remove('hidden');
          container.classList.add('flex');
        }
        return;
      }

      if (user.role === 'admin') {
        document.getElementById('user-live-chat-container')?.classList.add('hidden');
      } else {
        const container = document.getElementById('user-live-chat-container');
        if (container) {
          container.classList.remove('hidden');
          container.classList.add('flex');
        }

        if (userChatListener) userChatListener();
        const msgContainer = document.getElementById('user-chat-messages');

        userChatListener = db.collection('chat_sessions').doc(user.uid).collection('messages')
          .orderBy('timestamp', 'asc')
          .onSnapshot(snapshot => {
            const formatMsgTime = (ts) => {
              if (!ts) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const d = typeof ts === 'number' ? new Date(ts) : (ts.toDate ? ts.toDate() : new Date(ts));
              return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };

            if (snapshot.docs.length > 0) {
              msgContainer.innerHTML = snapshot.docs.map(doc => {
                const msg = doc.data();
                const isMe = msg.sender === 'user';
                const timeStr = formatMsgTime(msg.timestamp);
                return `
                  <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full">
                    <div class="max-w-[82%] ${isMe ? 'bg-black text-white' : 'bg-[#eaeaea] text-[#111111]'} p-4 rounded-md text-[14px] leading-relaxed font-sans shadow-none">
                      ${msg.text}
                    </div>
                    <span class="text-[11px] text-gray-400 mt-1.5 ${isMe ? 'mr-1' : 'ml-1'} font-normal">${timeStr}</span>
                  </div>
                `;
              }).join('');
              msgContainer.scrollTop = msgContainer.scrollHeight;
            } else {
              msgContainer.innerHTML = `
                <div class="flex flex-col items-start w-full">
                  <div class="max-w-[82%] bg-[#eaeaea] text-[#111111] p-4 rounded-md text-[14px] leading-relaxed font-sans shadow-none">
                    Hello! Welcome to FrameCraft. How can we help you preserve your memories today?
                  </div>
                  <span class="text-[11px] text-gray-400 mt-1.5 ml-1 font-normal">Welcome</span>
                </div>
              `;
            }
            if (window.lucide) window.lucide.createIcons();
          });

        // Listen for unread badges on the floating button
        db.collection('chat_sessions').doc(user.uid).onSnapshot(doc => {
          if (doc.exists) {
            const unread = doc.data().unreadUser || 0;
            const badge = document.getElementById('user-chat-unread-badge');
            if (unread > 0 && document.getElementById('user-chat-window').classList.contains('hidden')) {
              badge.innerText = unread;
              badge.classList.remove('hidden');
              badge.classList.add('flex');
            } else {
              badge.classList.add('hidden');
              badge.classList.remove('flex');
            }
          }
        });
      }
    }

    // --- ADMIN: Contact Customer Form ---
    let editingProductId = null;
    const defaultFrameSizes = [{ width: 8, height: 10, name: '8 × 10' }];
    const defaultFrameColours = [{ name: 'Black', value: '#000000' }];

    window.addProductSizeRow = (size = {}) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[1fr_1fr_1.2fr_auto] gap-2 product-size-row';
      row.innerHTML = `<input class="product-size-width px-2 py-2 text-xs bg-white border border-sand rounded-lg" type="number" min="0.01" step="0.01" placeholder="Width" value="${size.width || ''}" required><input class="product-size-height px-2 py-2 text-xs bg-white border border-sand rounded-lg" type="number" min="0.01" step="0.01" placeholder="Height" value="${size.height || ''}" required><input class="product-size-name px-2 py-2 text-xs bg-white border border-sand rounded-lg" placeholder="Display name" value="${size.name || ''}"><button type="button" onclick="this.parentElement.remove()" class="w-8 rounded-lg text-red-500 hover:bg-red-50" aria-label="Remove size"><i data-lucide="x" class="w-4 h-4 mx-auto"></i></button>`;
      document.getElementById('product-sizes-list').appendChild(row); lucide.createIcons();
    };
    window.addProductColourRow = (colour = {}) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[1.2fr_1fr_auto] gap-2 product-colour-row';
      row.innerHTML = `<input class="product-colour-name px-2 py-2 text-xs bg-white border border-sand rounded-lg" placeholder="Colour name" value="${colour.name || ''}" required><input class="product-colour-value h-9 bg-white border border-sand rounded-lg" type="color" value="${/^#[0-9a-f]{6}$/i.test(colour.value || '') ? colour.value : '#000000'}" required><button type="button" onclick="this.parentElement.remove()" class="w-8 rounded-lg text-red-500 hover:bg-red-50" aria-label="Remove colour"><i data-lucide="x" class="w-4 h-4 mx-auto"></i></button>`;
      document.getElementById('product-colours-list').appendChild(row); lucide.createIcons();
    };
    function readProductFrameConfiguration() {
      const sizes = Array.from(document.querySelectorAll('.product-size-row')).map(row => ({ width: Number(row.querySelector('.product-size-width').value), height: Number(row.querySelector('.product-size-height').value), name: row.querySelector('.product-size-name').value.trim() })).filter(size => size.width > 0 && size.height > 0);
      const colours = Array.from(document.querySelectorAll('.product-colour-row')).map(row => ({ name: row.querySelector('.product-colour-name').value.trim(), value: row.querySelector('.product-colour-value').value.toUpperCase() })).filter(colour => colour.name && /^#[0-9A-F]{6}$/.test(colour.value));
      if (!sizes.length) throw new Error('Add at least one valid frame size.');
      if (!colours.length) throw new Error('Add at least one named frame colour.');
      if (new Set(colours.map(c => c.value)).size !== colours.length) throw new Error('Each frame colour must use a unique colour value.');
      if (new Set(colours.map(c => c.name.toLowerCase())).size !== colours.length) throw new Error('Each frame colour must have a unique name.');
      return { sizes, colours, dynamicThickness: document.getElementById('product-dynamic-thickness').checked };
    }
    let adminGalleryImages = [];

    window.renderAdminGalleryPreview = function () {
      const container = document.getElementById('product-gallery-preview');
      const countText = document.getElementById('product-gallery-text');
      if (!container) return;

      if (countText) {
        countText.textContent = `${adminGalleryImages.length} gallery image(s) added`;
      }

      container.innerHTML = adminGalleryImages.map((img, idx) => {
        const src = img.type === 'file' ? img.previewUrl : img.url;
        return `
          <div class="aspect-square bg-editorbg rounded-xl border border-sand overflow-hidden relative group p-1">
            <img src="${src}" class="w-full h-full object-cover rounded-lg bg-white" alt="Gallery ${idx + 1}" onerror="this.src='https://via.placeholder.com/150?text=Invalid+URL'">
            <span class="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
              ${img.type === 'file' ? 'File' : 'URL'}
            </span>
            <button type="button" onclick="window.removeAdminGalleryImage(${idx})" class="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow transition cursor-pointer z-10" title="Remove image">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    };

    window.removeAdminGalleryImage = function (index) {
      adminGalleryImages.splice(index, 1);
      window.renderAdminGalleryPreview();
    };

    window.addProductGalleryUrl = function () {
      const input = document.getElementById('product-gallery-url-input');
      if (!input) return;
      const url = input.value.trim();
      if (!url) {
        showToast("Please enter an image URL.");
        return;
      }
      adminGalleryImages.push({ type: 'url', url: url });
      input.value = '';
      window.renderAdminGalleryPreview();
    };

    function resetProductForm() {
      editingProductId = null;
      document.getElementById('editing-product-id').value = '';
      document.getElementById('add-product-form').reset();
      document.getElementById('product-sizes-list').innerHTML = '';
      document.getElementById('product-colours-list').innerHTML = '';
      defaultFrameSizes.forEach(addProductSizeRow);
      defaultFrameColours.forEach(addProductColourRow);
      if (document.getElementById('frame-img-text')) document.getElementById('frame-img-text').textContent = 'Upload Frame Image File';
      if (document.getElementById('bg-img-text')) document.getElementById('bg-img-text').textContent = 'Upload Background Image File';
      if (document.getElementById('product-frame-url')) document.getElementById('product-frame-url').value = '';
      if (document.getElementById('product-bg-url')) document.getElementById('product-bg-url').value = '';
      if (document.getElementById('product-submit-label')) document.getElementById('product-submit-label').textContent = 'Add Product Template';
      adminGalleryImages = [];
      window.renderAdminGalleryPreview();
    }
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('contact-customer-form');
      if (form) {
        form.addEventListener('submit', async function (e) {
          e.preventDefault();

          const customerId = document.getElementById('contact-customer-select').value;
          const subject = document.getElementById('contact-customer-subject').value;
          const message = document.getElementById('contact-customer-message').value;

          if (!customerId) {
            showToast('Please select a customer');
            return;
          }

          try {
            const customerDoc = await db.collection('users').doc(customerId).get();
            const customerEmail = customerDoc.data()?.email;
            const customerName = customerDoc.data()?.name || 'Customer';

            await db.collection('customer_messages').add({
              customerId,
              customerEmail,
              customerName,
              subject,
              message,
              sentAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            if (customerEmail) {
              try {
                const formattedMessage = message.replace(/\n/g, '<br>');
                await emailjs.send('service_ia6xjfs', 'template_72upsy8', {
                  customer_email: customerEmail,
                  to_name: customerName,
                  title: subject,
                  message: formattedMessage
                });
                showToast('Message logged and email sent successfully!');
              } catch (emailErr) {
                console.error('EmailJS Rejection:', emailErr);
                showToast('Message logged to database, but EmailJS failed to send.');
              }
            } else {
              showToast('Message logged, but customer has no email on file.');
            }

            form.reset();
          } catch (error) {
            console.error('Database Error:', error);
            showToast('Error saving message to database.');
          }
        });
      }

      // Site background image preview
      const siteBgImageInput = document.getElementById('site-bg-image');
      if (siteBgImageInput) {
        siteBgImageInput.addEventListener('change', function (e) {
          if (e.target.files.length > 0) {
            const span = document.querySelector('#image-options span');
            if (span) span.textContent = `${e.target.files[0].name} selected`;
          }
        });
      }

      // Product image preview
      const productImagesInput = document.getElementById('product-images');
      if (productImagesInput) {
        productImagesInput.addEventListener('change', function (e) {
          uploadedProductImages = Array.from(e.target.files);
          const preview = document.getElementById('product-images-preview');
          preview.innerHTML = '';

          uploadedProductImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
              const div = document.createElement('div');
              div.className = 'aspect-square bg-editorbg rounded-xl border border-sand overflow-hidden relative';

              preview.appendChild(div);
              lucide.createIcons();
            };
            reader.readAsDataURL(file);
          });

          const text = document.getElementById('product-images-text');
          if (text) text.textContent = `${uploadedProductImages.length} image(s) selected`;
        });
      }

      // File Input Listener for Gallery Images
      document.getElementById('product-gallery-file-input')?.addEventListener('change', function (e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = function (evt) {
            adminGalleryImages.push({
              type: 'file',
              file: file,
              previewUrl: evt.target.result
            });
            window.renderAdminGalleryPreview();
          };
          reader.readAsDataURL(file);
        });
        e.target.value = '';
      });

      // File Input Text Updaters
      document.getElementById('product-frame-img')?.addEventListener('change', function (e) {
        if (e.target.files.length) document.getElementById('frame-img-text').textContent = e.target.files[0].name;
      });
      document.getElementById('product-bg-img')?.addEventListener('change', function (e) {
        if (e.target.files.length) document.getElementById('bg-img-text').textContent = e.target.files[0].name;
      });

      // Add product form
      const addProductForm = document.getElementById('add-product-form');
      if (addProductForm) {
        resetProductForm();
        addProductForm.addEventListener('submit', async function (e) {
          e.preventDefault();

          const name = document.getElementById('product-name').value;
          const price = parseFloat(document.getElementById('product-price').value);
          const tax = parseFloat(document.getElementById('product-tax').value || 0);
          const categoryId = document.getElementById('product-category').value;

          const frameFile = document.getElementById('product-frame-img')?.files[0];
          const frameUrlInput = document.getElementById('product-frame-url')?.value.trim();
          const bgFile = document.getElementById('product-bg-img')?.files[0];
          const bgUrlInput = document.getElementById('product-bg-url')?.value.trim();

          const currentProduct = editingProductId ? productTemplates.find(p => p.id === editingProductId) : null;
          let frameConfiguration;
          try { frameConfiguration = readProductFrameConfiguration(); } catch (configurationError) { showToast(configurationError.message); return; }

          const btn = e.target.querySelector('button[type="submit"]');
          const originalBtnHtml = btn.innerHTML;
          btn.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Processing Product...`;
          btn.disabled = true;
          lucide.createIcons();

          try {
            // 1. Resolve Frame Image (Customization Only)
            let frameUrl = currentProduct?.frameImage || '';
            if (frameFile) {
              showToast('Processing frame image...');
              try {
                const apiKey = "MVqFJ98Cdkzs8viUodmvdnZw";
                const formData = new FormData();
                formData.append('image_file', frameFile);
                formData.append('size', 'auto');
                const removeBgRes = await fetch('https://api.remove.bg/v1.0/removebg', {
                  method: 'POST', headers: { 'X-Api-Key': apiKey }, body: formData
                });
                if (removeBgRes.ok) {
                  const transparentFrameBlob = await removeBgRes.blob();
                  frameUrl = await uploadToCloudinary(transparentFrameBlob);
                } else {
                  frameUrl = await uploadToCloudinary(frameFile);
                }
              } catch (e) {
                frameUrl = await uploadToCloudinary(frameFile);
              }
            } else if (frameUrlInput) {
              frameUrl = frameUrlInput;
            }

            // 2. Resolve Background Image (Customization Only)
            let bgUrl = currentProduct?.bgImage || '';
            if (bgFile) {
              showToast('Uploading background image...');
              bgUrl = await uploadToCloudinary(bgFile);
            } else if (bgUrlInput) {
              bgUrl = bgUrlInput;
            }

            // 3. Resolve Gallery Images (Product Cards & Product Details View Only)
            const resolvedGalleryUrls = [];
            for (let item of adminGalleryImages) {
              if (item.type === 'file' && item.file) {
                showToast('Uploading gallery image...');
                const uploadedUrl = await uploadToCloudinary(item.file);
                resolvedGalleryUrls.push(uploadedUrl);
              } else if (item.type === 'url' && item.url) {
                resolvedGalleryUrls.push(item.url);
              }
            }

            const savedGallery = resolvedGalleryUrls;

            const productPayload = {
              name,
              price,
              taxRate: tax,
              categoryId: categoryId || null,
              frameImage: frameUrl,
              bgImage: bgUrl,
              images: savedGallery,
              galleryImages: savedGallery,
              frameConfiguration,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            let productId = editingProductId;
            if (productId) {
              await db.collection('products').doc(productId).set(productPayload, { merge: true });
            } else {
              productPayload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
              productId = (await db.collection('products').add(productPayload)).id;
            }

            await db.collection('assets').doc(productId).set({
              category: 'frames', productId, frameManaged: true, cost: price, imageURL: frameUrl || (savedGallery[0] || ''), name, frameConfiguration, type: 'product-frame', createdAt: firebase.firestore.FieldValue.serverTimestamp(), updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            showToast(editingProductId ? 'Product template updated successfully!' : 'Product template created successfully!');
            resetProductForm();
            await loadProductTemplates();
          } catch (error) {
            console.error('Error saving product:', error);
            showToast('Error saving product: ' + error.message);
          } finally {
            btn.innerHTML = originalBtnHtml;
            btn.disabled = false;
            lucide.createIcons();
          }
        });
      }
    });

    function removeProductImage(index) {
      uploadedProductImages.splice(index, 1);
      // Refresh preview
      const preview = document.getElementById('product-images-preview');
      preview.innerHTML = '';
      uploadedProductImages.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          const div = document.createElement('div');
          div.className = 'aspect-square bg-editorbg rounded-xl border border-sand overflow-hidden relative';
          div.innerHTML = `
                <img src="${e.target.result}" class="w-full h-full object-contain bg-white p-2">
                <button onclick="removeProductImage(${typeof index !== 'undefined' ? index : 'i'})" class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              `;
          preview.appendChild(div);
          lucide.createIcons();
        };
        reader.readAsDataURL(file);
      });

      const text = document.getElementById('product-images-text');
      if (text) text.textContent = `${uploadedProductImages.length} image(s) selected`;
    }

    // --- ADMIN: Load Product Templates ---
    async function loadProductTemplates() {
      const grid = document.getElementById('products-grid');

      try {
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
        productTemplates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (grid) {
          grid.innerHTML = productTemplates.map(product => {
            const displayImg = (Array.isArray(product.galleryImages) && product.galleryImages[0]) ||
                               (Array.isArray(product.images) && product.images[0]) ||
                               product.frameImage ||
                               'https://via.placeholder.com/400x400?text=No+Gallery+Image';
            return `
            <div class="bg-editorbg p-4 rounded-2xl border border-sand/50 shadow-sm">
              <div class="product-preview-container aspect-square rounded-xl overflow-hidden bg-white mb-4 p-2 relative flex items-center justify-center">
                <img src="${displayImg}" class="w-full h-full object-contain p-2" alt="${product.name}">
              </div>
              <h3 class="text-lg font-bold text-charcoal mb-1">${product.name}</h3>
              <p class="text-xl font-black text-flame mb-4">${window.appCurrency || '$'}${product.price.toFixed(2)}</p>
              <div class="flex gap-2">
                <button onclick="switchAdminSubTab('products', 'add-product'); editProduct('${product.id}')" class="flex-1 py-2 bg-charcoal text-cream rounded-lg text-sm font-bold hover:bg-flame transition">
                  <i data-lucide="edit" class="w-4 h-4 inline mr-1"></i> Edit
                </button>
                <button onclick="deleteProduct('${product.id}')" class="py-2 px-4 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
          }).join('');

          if (productTemplates.length === 0) {
            grid.innerHTML = `
              <div class="col-span-full text-center py-10">
                <i data-lucide="package" class="w-16 h-16 text-sand mx-auto mb-4"></i>
                <p class="text-slate font-bold">No product templates yet</p>
                <p class="text-sm text-slate">Add your first product above!</p>
              </div>
            `;
          }
        }

        if (typeof window.loadAdminManageProductsTable === 'function') window.loadAdminManageProductsTable();

        if (window.lucide) lucide.createIcons();
        if (window.initScrollAnimations) window.initScrollAnimations();
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }

    // Realtime Listener for Products Collection
    try {
      db.collection('products').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        productTemplates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const grid = document.getElementById('products-grid');
        if (grid) {
          grid.innerHTML = productTemplates.map(product => {
            const displayImg = (Array.isArray(product.galleryImages) && product.galleryImages[0]) ||
                               (Array.isArray(product.images) && product.images[0]) ||
                               product.frameImage ||
                               'https://via.placeholder.com/400x400?text=No+Gallery+Image';
            return `
            <div class="bg-editorbg p-4 rounded-2xl border border-sand/50 shadow-sm">
              <div class="product-preview-container aspect-square rounded-xl overflow-hidden bg-white mb-4 p-2 relative flex items-center justify-center">
                <img src="${displayImg}" class="w-full h-full object-contain p-2" alt="${product.name}">
              </div>
              <h3 class="text-lg font-bold text-charcoal mb-1">${product.name}</h3>
              <p class="text-xl font-black text-flame mb-4">${window.appCurrency || '$'}${product.price.toFixed(2)}</p>
              <div class="flex gap-2">
                <button onclick="switchAdminSubTab('products', 'add-product'); editProduct('${product.id}')" class="flex-1 py-2 bg-charcoal text-cream rounded-lg text-sm font-bold hover:bg-flame transition">
                  <i data-lucide="edit" class="w-4 h-4 inline mr-1"></i> Edit
                </button>
                <button onclick="deleteProduct('${product.id}')" class="py-2 px-4 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
          }).join('');

          if (productTemplates.length === 0) {
            grid.innerHTML = `
              <div class="col-span-full text-center py-10">
                <i data-lucide="package" class="w-16 h-16 text-sand mx-auto mb-4"></i>
                <p class="text-slate font-bold">No product templates yet</p>
                <p class="text-sm text-slate">Add your first product above!</p>
              </div>
            `;
          }
        }

        const tbody = document.getElementById('admin-manage-products-table-body');
        if (tbody) {
          const catList = window.globalCategories || [];
          tbody.innerHTML = productTemplates.map(p => {
            const cat = catList.find(c => c.id === p.categoryId);
            const catName = cat ? cat.name : 'Uncategorized';
            const displayImg = (Array.isArray(p.galleryImages) && p.galleryImages[0]) ||
                               (Array.isArray(p.images) && p.images[0]) ||
                               p.frameImage ||
                               'https://via.placeholder.com/150?text=No+Image';

            let statusBadge = p.outOfStock ? `<span class="px-2 py-1 rounded bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider block mb-1">Out of Stock</span>` : `<span class="px-2 py-1 rounded bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-wider block mb-1">In Stock</span>`;
            let priceString = p.saleActive ? `<span class="line-through text-slate text-xs">${window.appCurrency || '$'}${p.price.toFixed(2)}</span> <span class="text-flame font-bold">${window.appCurrency || '$'}${p.salePrice.toFixed(2)}</span>` : `<span class="text-flame font-bold">${window.appCurrency || '$'}${p.price.toFixed(2)}</span>`;

            return `
            <tr class="hover:bg-sand/10 transition border-b border-sand/30">
              <td class="px-6 py-4"><img src="${displayImg}" class="w-12 h-12 object-contain rounded border border-sand bg-white p-1"></td>
              <td class="px-6 py-4 font-bold text-charcoal">${p.name}</td>
              <td class="px-6 py-4 text-xs font-semibold text-slate uppercase">${catName}</td>
              <td class="px-6 py-4">${statusBadge} ${priceString}</td>
              <td class="px-6 py-4 text-right">
                <button onclick="toggleProductStock('${p.id}', ${!!p.outOfStock})" class="px-3 py-1.5 ${p.outOfStock ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'} border rounded-lg text-xs font-bold transition mr-1 mb-1 sm:mb-0 w-24">
                  ${p.outOfStock ? 'Mark In Stock' : 'Mark OOS'}
                </button>
                <button onclick="switchAdminSubTab('products', 'add-product'); editProduct('${p.id}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mr-1">Edit</button>
                <button onclick="deleteProduct('${p.id}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-600 transition">Delete</button>
              </td>
            </tr>
          `;
          }).join('');

          if (productTemplates.length === 0) {
            tbody.innerHTML = `
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-slate font-bold">No products found. Add a product above!</td>
              </tr>
            `;
          }
        }

        if (typeof window.loadProductsForLanding === 'function') window.loadProductsForLanding();
        if (window.lucide) lucide.createIcons();
      }, err => {
        console.warn("Firestore realtime products listener fallback:", err);
      });
    } catch (e) {
      console.warn("Could not bind realtime products listener:", e);
    }

    async function deleteProduct(productId) {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          await db.collection('products').doc(productId).delete();
          // Product-owned frames use the product id, so this cannot affect another product's frame.
          const frameAsset = await db.collection('assets').doc(productId).get();
          if (frameAsset.exists && frameAsset.data().frameManaged === true) await frameAsset.ref.delete();
          showToast('Product deleted successfully');
          await loadProductTemplates();
          await loadGlobalAssets();
        } catch (error) {
          console.error('Error deleting product:', error);
          showToast('Error deleting product');
        }
      }
    }

    function editProduct(productId) {
      const product = productTemplates.find(p => p.id === productId);
      if (!product) return showToast('Product details are not available yet.');
      editingProductId = productId;
      document.getElementById('editing-product-id').value = productId;
      document.getElementById('product-name').value = product.name || '';
      document.getElementById('product-price').value = product.price || 0;
      document.getElementById('product-tax').value = product.taxRate || 0;
      document.getElementById('product-sizes-list').innerHTML = '';
      document.getElementById('product-colours-list').innerHTML = '';
      const configuration = product.frameConfiguration || { sizes: defaultFrameSizes, colours: defaultFrameColours, dynamicThickness: false };
      (configuration.sizes?.length ? configuration.sizes : defaultFrameSizes).forEach(addProductSizeRow);
      (configuration.colours?.length ? configuration.colours : defaultFrameColours).forEach(addProductColourRow);
      document.getElementById('product-dynamic-thickness').checked = Boolean(configuration.dynamicThickness);

      if (document.getElementById('product-frame-url')) document.getElementById('product-frame-url').value = product.frameImage || '';
      if (document.getElementById('product-bg-url')) document.getElementById('product-bg-url').value = product.bgImage || '';
      if (document.getElementById('frame-img-text')) document.getElementById('frame-img-text').textContent = product.frameImage ? 'Current Frame Image Set' : 'Upload Frame Image File';
      if (document.getElementById('bg-img-text')) document.getElementById('bg-img-text').textContent = product.bgImage ? 'Current BG Image Set' : 'Upload Background Image File';
      if (document.getElementById('product-submit-label')) document.getElementById('product-submit-label').textContent = 'Save Product Changes';

      // Load Gallery Images into adminGalleryImages
      adminGalleryImages = [];
      const existingGallery = (Array.isArray(product.galleryImages) && product.galleryImages.length > 0)
        ? product.galleryImages
        : (Array.isArray(product.images) ? product.images : []);

      existingGallery.forEach(url => {
        if (url) adminGalleryImages.push({ type: 'url', url: url });
      });
      window.renderAdminGalleryPreview();

      document.getElementById('admin-products-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('Editing product template. Modify images or URLs as needed.');
    }

    // --- ADMIN: Settings ---
    function toggleBgOptions() {
      const type = document.getElementById('site-bg-type').value;
      document.getElementById('gradient-options').classList.toggle('hidden', type !== 'gradient');
      document.getElementById('image-options').classList.toggle('hidden', type !== 'image');
    }

    async function saveSiteSettings() {
      const settings = {
        primaryColor: document.getElementById('site-primary-color').value,
        accentColor: document.getElementById('site-accent-color').value,
        bgColor: document.getElementById('site-bg-color').value,
        textColor: document.getElementById('site-text-color').value,
        bgType: document.getElementById('site-bg-type').value,
        font: document.getElementById('site-font').value
      };

      if (settings.bgType === 'gradient') {
        settings.gradientStart = document.getElementById('site-gradient-start').value;
        settings.gradientEnd = document.getElementById('site-gradient-end').value;
      } else if (settings.bgType === 'image') {
        // Upload the image if selected
        const fileInput = document.getElementById('site-bg-image');
        if (fileInput && fileInput.files.length > 0) {
          const imageUrl = await uploadToCloudinary(fileInput.files[0]);
          settings.bgImageUrl = imageUrl;
        }
      }

      try {
        await db.collection('settings').doc('site').set(settings, { merge: true });
        siteSettings = settings;
        applySiteSettings();
        showToast('Site settings saved successfully!');
      } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings');
      }
    }

    async function resetSiteSettings() {
      if (confirm('Reset to default settings?')) {
        const defaultSettings = {
          primaryColor: '#000102',
          accentColor: '#775a19',
          bgColor: '#faf9f7',
          textColor: '#45474b',
          bgType: 'color',
          font: "'Inter', sans-serif"
        };


        document.getElementById('site-primary-color').value = defaultSettings.primaryColor;
        document.getElementById('site-accent-color').value = defaultSettings.accentColor;
        document.getElementById('site-bg-color').value = defaultSettings.bgColor;
        document.getElementById('site-text-color').value = defaultSettings.textColor;
        document.getElementById('site-bg-type').value = 'color';
        document.getElementById('site-font').value = defaultSettings.font;
        toggleBgOptions();

        try {
          await db.collection('settings').doc('site').set(defaultSettings, { merge: true });
          siteSettings = defaultSettings;
          applySiteSettings();
          showToast('Settings reset to default');
        } catch (error) {
          console.error('Error resetting settings:', error);
        }
      }
    }

    async function loadSettings() {
      try {
        if (typeof window.loadAdminStaff === 'function') window.loadAdminStaff();
        const doc = await db.collection('settings').doc('site').get();
        if (doc.exists) {
          siteSettings = doc.data();

          if (siteSettings.primaryColor) document.getElementById('site-primary-color').value = siteSettings.primaryColor;
          if (siteSettings.accentColor) document.getElementById('site-accent-color').value = siteSettings.accentColor;
          if (siteSettings.bgColor) document.getElementById('site-bg-color').value = siteSettings.bgColor;
          if (siteSettings.textColor) document.getElementById('site-text-color').value = siteSettings.textColor;
          if (siteSettings.bgType) document.getElementById('site-bg-type').value = siteSettings.bgType;
          if (siteSettings.font) document.getElementById('site-font').value = siteSettings.font;
          if (siteSettings.gradientStart) document.getElementById('site-gradient-start').value = siteSettings.gradientStart;
          if (siteSettings.gradientEnd) document.getElementById('site-gradient-end').value = siteSettings.gradientEnd;

          toggleBgOptions();
        }

        const taxDoc = await db.collection('settings').doc('tax').get();
        if (taxDoc.exists) {
          taxSettings = taxDoc.data();
          document.getElementById('default-tax-rate').value = taxSettings.rate || 0;
          document.getElementById('tax-label').value = taxSettings.label || 'Tax';
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    function applySiteSettings() {
      if (!siteSettings) return;
      const style = document.documentElement.style;
      const isValidHex = hex => typeof hex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(hex);

      if (isValidHex(siteSettings.primaryColor) && siteSettings.primaryColor !== '#000000') {
        style.setProperty('--dark-slate', siteSettings.primaryColor);
        style.setProperty('--charcoal', siteSettings.primaryColor);
        const primaryHex = siteSettings.primaryColor;
        const r = parseInt(primaryHex.slice(1, 3), 16) || 0;
        const g = parseInt(primaryHex.slice(3, 5), 16) || 0;
        const b = parseInt(primaryHex.slice(5, 7), 16) || 0;
        const flameR = Math.max(0, r - 30);
        const flameG = Math.max(0, g - 10);
        const flameB = Math.max(0, b - 20);
        style.setProperty('--flame', `rgb(${flameR}, ${flameG}, ${flameB})`);
      }
      if (isValidHex(siteSettings.accentColor)) {
        style.setProperty('--accent', siteSettings.accentColor);
        style.setProperty('--accent-alt', siteSettings.accentColor);
      }
      if (isValidHex(siteSettings.bgColor) && siteSettings.bgColor !== '#000000' && siteSettings.bgColor !== '#000') {
        style.setProperty('--bg-color', siteSettings.bgColor);
        style.setProperty('--cream', lightenColor(siteSettings.bgColor, 30));
      }
      if (isValidHex(siteSettings.textColor)) {
        style.setProperty('--text-color', siteSettings.textColor);
        style.setProperty('--slate', adjustLightness(siteSettings.textColor, -20));
      }
      if (siteSettings.font) style.setProperty('--font-family', siteSettings.font);

      const heroImage = document.getElementById('hero-image');
      if (siteSettings.bgType === 'gradient' && isValidHex(siteSettings.gradientStart) && isValidHex(siteSettings.gradientEnd)) {
        document.body.style.background = `linear-gradient(135deg, ${siteSettings.gradientStart}, ${siteSettings.gradientEnd})`;
        if (heroImage) heroImage.style.display = 'none';
      } else if (siteSettings.bgType === 'image' && siteSettings.bgImageUrl) {
        document.body.style.background = 'var(--bg-color, #faf9f7)';
        if (heroImage) {
          heroImage.src = siteSettings.bgImageUrl;
          heroImage.style.display = 'block';
          heroImage.style.objectFit = 'cover';
          heroImage.style.width = '100%';
          heroImage.style.height = '100%';
        }
      } else if (isValidHex(siteSettings.bgColor) && siteSettings.bgColor !== '#000000' && siteSettings.bgColor !== '#000') {
        document.body.style.background = siteSettings.bgColor;
        document.body.style.backgroundImage = 'none';
        if (heroImage) {
          heroImage.src = 'home.png';
          heroImage.style.display = 'block';
        }
      } else {
        document.body.style.background = '';
        document.body.style.backgroundImage = '';
      }
    }

    // Helper functions to adjust colors
    function lightenColor(hex, percent) {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, (num >> 16) + amt);
      const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
      const B = Math.min(255, (num & 0x0000FF) + amt);
      return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    function adjustLightness(hex, percent) {
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max(0, Math.min(255, (num >> 16) + amt));
      const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
      const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
      return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    async function saveTaxSettings() {
      taxSettings = {
        rate: parseFloat(document.getElementById('default-tax-rate').value || 0),
        label: document.getElementById('tax-label').value || 'Tax'
      };

      try {
        await db.collection('settings').doc('tax').set(taxSettings);
        showToast('Tax settings saved successfully!');
      } catch (error) {
        console.error('Error saving tax settings:', error);
        showToast('Error saving tax settings');
      }
    }

    // --- Apply saved settings on load ---
    window.addEventListener('DOMContentLoaded', async function () {
      try {
        const doc = await db.collection('settings').doc('site').get();
        if (doc.exists) {
          siteSettings = doc.data();
          applySiteSettings();
        }

        // Also load products to display on landing page
        await loadProductsForLanding();
      } catch (error) {
        console.error('Error initializing:', error);
      }
    });
    // --- Initialize Category Slider Logic ---
    window.initCategorySlider = () => {
      const categoryContainer = document.getElementById('category-container');
      const prevBtn = document.getElementById('cat-prev');
      const nextBtn = document.getElementById('cat-next');
      const dotsContainer = document.getElementById('cat-dots');

      if (categoryContainer && dotsContainer) {
        const items = categoryContainer.children;
        const itemCount = items.length;

        dotsContainer.innerHTML = ''; // clear existing dots
        if (itemCount === 0) return;

        // Create dots
        for (let i = 0; i < itemCount; i++) {
          const dot = document.createElement('button');
          dot.className = `h-1.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-primary' : 'w-2 bg-outline-variant'}`;
          dot.onclick = () => {
            const itemWidth = items[0].offsetWidth + 24; // item + gap
            categoryContainer.scrollTo({
              left: i * itemWidth,
              behavior: 'smooth'
            });
          };
          dotsContainer.appendChild(dot);
        }

        // Scroll buttons
        if (prevBtn) {
          prevBtn.onclick = () => {
            const itemWidth = items[0].offsetWidth + 24;
            categoryContainer.scrollBy({ left: -itemWidth, behavior: 'smooth' });
          };
        }
        if (nextBtn) {
          nextBtn.onclick = () => {
            const itemWidth = items[0].offsetWidth + 24;
            categoryContainer.scrollBy({ left: itemWidth, behavior: 'smooth' });
          };
        }

        // Update dots on scroll
        categoryContainer.onscroll = () => {
          const itemWidth = items[0].offsetWidth + 24;
          const activeIndex = Math.round(categoryContainer.scrollLeft / itemWidth);

          Array.from(dotsContainer.children).forEach((dot, idx) => {
            if (idx === activeIndex) {
              dot.classList.add('w-8', 'bg-primary');
              dot.classList.remove('w-2', 'bg-outline-variant');
            } else {
              dot.classList.remove('w-8', 'bg-primary');
              dot.classList.add('w-2', 'bg-outline-variant');
            }
          });
        };
      }
    };

    // --- Load dynamic categories to landing page ---
    window.renderLandingCategories = async () => {
      if (globalCategories.length === 0) {
        await window.loadCategoriesData();
      }
      const container = document.getElementById('category-container');
      if (!container) return;

      if (globalCategories.length === 0) {
        container.innerHTML = `<p class="text-on-surface-variant font-bold text-center w-full">More categories coming soon.</p>`;
        return;
      }

      container.innerHTML = globalCategories.map(c => `
        <div class="flex-shrink-0 w-[280px] aspect-[3/4] relative group/item cursor-pointer snap-start rounded overflow-hidden" onclick="window.handlePathRouting('/products')">
          <img class="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" src="${c.imageURL || 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=400&h=400'}" alt="${c.name}">
          <div class="absolute inset-0 bg-primary/0 group-hover/item:bg-primary/80 transition-all duration-500 flex flex-col justify-end p-8">
            <div class="opacity-0 group-hover/item:opacity-100 transform translate-y-4 group-hover/item:translate-y-0 transition-all duration-500">
              <h4 class="text-on-primary font-headline-md text-2xl mb-2">${c.name}</h4>
              <p class="text-on-primary/80 text-label-sm mb-6">${c.desc || 'Explore our exclusive collection.'}</p>
              <button class="bg-on-primary text-primary px-4 py-2 text-label-sm font-label-sm rounded font-bold">View Products</button>
            </div>
          </div>
        </div>
      `).join('');

      window.initCategorySlider();
    };
    // --- Load products for landing page ---
    async function loadProductsForLanding() {
      try {
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
        productTemplates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const products = productTemplates;

        const productsGrid = document.querySelector('#frames-section .products-grid');
        if (productsGrid && products.length > 0) {
          productsGrid.innerHTML = products.map((product, idx) => {
            const hasSale = product.saleActive && product.salePrice != null;

            // Exact price HTML structure from Stitch UI
            const priceHtml = hasSale
              ? `<span class="text-on-surface-variant line-through text-label-sm">${window.appCurrency || '$'}${product.price.toFixed(2)}</span>
                 <span class="text-primary font-bold text-lg">${window.appCurrency || '$'}${product.salePrice.toFixed(2)}</span>`
              : `<span class="text-primary font-bold text-lg">${window.appCurrency || '$'}${product.price.toFixed(2)}</span>`;

            // Adding a delay class for animations exactly like the Stitch code
            const delay = (idx % 4) * 100;
            const delayStyle = delay > 0 ? `style="transition-delay: ${delay}ms;"` : '';

            // Using the description or a fallback, matching line-clamp-2
            const desc = product.description || "Precision-cut artisan frame crafted for a clean, natural look.";
            const galleryImg = (Array.isArray(product.galleryImages) && product.galleryImages[0]) ||
                               (Array.isArray(product.images) && product.images[0]) ||
                               product.frameImage ||
                               'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=400&h=400';

            return `
             <div class="reveal bg-surface-container-lowest p-4 group active" ${delayStyle}>
               <div class="product-preview-container relative overflow-hidden mb-6 aspect-[4/5] bg-surface-container !p-0 !outline-none !border-none !rounded-none flex items-center justify-center">
                 <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${galleryImg}" alt="${product.name}">
                 ${hasSale ? `<div class="absolute top-4 right-4 bg-on-primary px-3 py-1 text-label-sm font-label-sm shadow-sm z-10 text-primary font-bold">Sale</div>` : ''}
                 ${product.outOfStock ? `<div class="absolute top-4 left-4 bg-error text-on-primary px-3 py-1 text-label-sm font-label-sm shadow-sm z-10">Out of Stock</div>` : ''}
               </div>
               <div class="flex items-center gap-1 text-secondary-fixed-dim mb-2">
                 <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                 <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                 <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                 <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                 <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                 <span class="text-on-surface-variant text-[12px] ml-1">(128)</span>
               </div>
               <h3 class="text-headline-md font-headline-md text-primary mb-2 text-xl">${product.name}</h3>
               <p class="text-on-surface-variant text-body-md mb-4 line-clamp-2">${desc}</p>
               <div class="flex items-center gap-3 mb-6">
                 ${priceHtml}
               </div>
               <button onclick="window.openProductDetail('${product.id}')" class="w-full py-3 bg-primary text-on-primary text-label-sm font-label-sm hover:bg-secondary transition-all ${product.outOfStock ? 'opacity-50 cursor-not-allowed' : ''}" ${product.outOfStock ? 'disabled' : ''}>View Details</button>
             </div>
          `;
          }).join('');
        }
        lucide.createIcons();
        if (window.initScrollAnimations) window.initScrollAnimations();

      } catch (error) {
        console.error('Error loading products for landing:', error);
      }
    }

    window.selectPdSize = function (sizeKey, btnEl) {
      document.querySelectorAll('.pd-size-btn').forEach(btn => {
        btn.className = 'pd-size-btn bg-white text-gray-800 hover:border-black py-3 px-2 text-xs font-bold border border-gray-300 text-center transition cursor-pointer';
      });
      if (btnEl) {
        btnEl.className = 'pd-size-btn bg-black text-white py-3 px-2 text-xs font-bold border border-black text-center transition cursor-pointer';
      }
    };

    window.selectPdMaterial = function (matName, btnEl) {
      document.querySelectorAll('.pd-mat-btn span.rounded-full').forEach(span => {
        span.classList.remove('border-black');
        span.classList.add('border-transparent');
      });
      document.querySelectorAll('.pd-mat-btn span.text-gray-900').forEach(span => {
        span.classList.remove('text-gray-900');
        span.classList.add('text-gray-500');
      });
      if (btnEl) {
        const circle = btnEl.querySelector('span.rounded-full');
        const label = btnEl.querySelector('span.text-[9px]');
        if (circle) { circle.classList.remove('border-transparent'); circle.classList.add('border-black'); }
        if (label) { label.classList.remove('text-gray-500'); label.classList.add('text-gray-900'); }
      }
    };

    window.switchPdImage = function (imgSrc, btnEl) {
      const mainImg = document.getElementById('pd-main-image');
      if (mainImg) {
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
          mainImg.src = imgSrc;
          mainImg.style.opacity = '1';
        }, 120);
      }
      document.querySelectorAll('.pd-thumb-btn').forEach(btn => {
        btn.classList.remove('border-black');
        btn.classList.add('border-transparent');
      });
      if (btnEl) {
        btnEl.classList.remove('border-transparent');
        btnEl.classList.add('border-black');
      }
    };

    window.openProductDetail = async function (productId) {
      if ((!productTemplates || productTemplates.length === 0) && typeof loadProductTemplates === 'function') {
        try { await loadProductTemplates(); } catch (e) { console.warn("Failed to auto-load product templates:", e); }
      }
      const product = productTemplates.find(p => p.id === productId || slugify(p.name) === productId);
      let finalProduct = product;
      if (!finalProduct) {
        const defaultProducts = [
          { id: 'default-1', name: 'CLASSIC WOOD', price: 45.00, images: ['https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=800&h=800'] },
          { id: 'default-2', name: 'MODERN METAL', price: 55.00, images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800&h=800'] },
          { id: 'default-3', name: 'GALLERY WRAP', price: 65.00, images: ['https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&q=80&w=800&h=800'] },
          { id: 'default-4', name: 'ORNATE GOLD', price: 85.00, images: ['https://images.unsplash.com/photo-1550584488-06764ee714a6?auto=format&fit=crop&q=80&w=800&h=800'] }
        ];
        finalProduct = defaultProducts.find(p => p.id === productId || p.name === productId || slugify(p.name) === productId);
      }

      if (!finalProduct) return;

      const slug = slugify(finalProduct.name);
      const path = `/products/${slug}`;
      try {
        window.history.pushState({ view: 'product', productId: finalProduct.id || slug }, "", path);
      } catch (e) {
        console.warn("Failed to push history state:", e);
      }
      window.renderProductDetail(finalProduct);
    };

    window.renderProductDetail = function (product) {
      if (!product) return;

      // 1. Ensure main landing wrapper is active while hiding secondary views
      const views = ['dashboard', 'editor', 'admin', 'checkout'];
      views.forEach(v => {
        const el = document.getElementById(v + '-view');
        if (el) el.classList.add('hidden');
      });
      const landingView = document.getElementById('landing-view');
      if (landingView) landingView.classList.remove('hidden');

      // 2. Hide homepage landing content sections (hero, frames/category, about, contact)
      window.showLandingContentSections(false);

      // 3. Unhide product-detail-view immediately
      const pdView = document.getElementById('product-detail-view');
      if (pdView) pdView.classList.remove('hidden');

      // 4. Populate product details
      const name = product.name || 'Ornate Victorian Gilt';
      const finalPrice = (product.saleActive && product.salePrice != null) ? product.salePrice : (product.price || 195.00);
      const origPrice = product.price ? product.price * 1.28 : finalPrice * 1.28;

      const prodNameEl = document.getElementById('pd-product-name');
      const breadcrumbEl = document.getElementById('pd-breadcrumb-title');
      const priceEl = document.getElementById('pd-price');
      const origPriceEl = document.getElementById('pd-original-price');
      const descEl = document.getElementById('pd-description');

      if (prodNameEl) prodNameEl.textContent = name;
      if (breadcrumbEl) breadcrumbEl.textContent = name;
      if (priceEl) priceEl.textContent = `${window.appCurrency || '$'}${finalPrice.toFixed(2)}`;
      if (origPriceEl) origPriceEl.textContent = `${window.appCurrency || '$'}${origPrice.toFixed(2)}`;
      if (descEl && product.description) descEl.textContent = product.description;

      // 5. Populate main image & gallery thumbnails (Gallery Images ONLY)
      let imageList = [];
      if (Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
        imageList = product.galleryImages;
      } else if (Array.isArray(product.images) && product.images.length > 0) {
        imageList = product.images;
      } else if (product.frameImage) {
        imageList = [product.frameImage];
      } else {
        imageList = [
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800'
        ];
      }

      const mainImg = document.getElementById('pd-main-image');
      if (mainImg) mainImg.src = imageList[0];

      const thumbsGrid = document.getElementById('pd-thumbnails-grid');
      if (thumbsGrid) {
        if (imageList.length > 1) {
          thumbsGrid.classList.remove('hidden');
          thumbsGrid.innerHTML = imageList.map((img, idx) => `
            <button type="button" onclick="window.switchPdImage('${img}', this)" class="pd-thumb-btn aspect-square overflow-hidden bg-[#f4f3f0] border-2 ${idx === 0 ? 'border-black' : 'border-transparent hover:border-gray-300'} transition cursor-pointer p-0">
              <img src="${img}" class="w-full h-full object-cover" alt="${name} thumbnail ${idx + 1}">
            </button>
          `).join('');
        } else {
          thumbsGrid.classList.add('hidden');
          thumbsGrid.innerHTML = '';
        }
      }

      // 5.5 Populate Product-Specific Variants (Sizes & Colors) assigned by Admin
      let prodSizes = [];
      if (Array.isArray(product.frameConfiguration?.sizes)) {
        prodSizes = product.frameConfiguration.sizes;
      } else if (Array.isArray(product.sizes)) {
        prodSizes = product.sizes;
      } else if (Array.isArray(product.variants?.sizes)) {
        prodSizes = product.variants.sizes;
      }

      let prodColours = [];
      if (Array.isArray(product.frameConfiguration?.colours)) {
        prodColours = product.frameConfiguration.colours;
      } else if (Array.isArray(product.frameConfiguration?.colors)) {
        prodColours = product.frameConfiguration.colors;
      } else if (Array.isArray(product.colours)) {
        prodColours = product.colours;
      } else if (Array.isArray(product.colors)) {
        prodColours = product.colors;
      } else if (Array.isArray(product.variants?.colours)) {
        prodColours = product.variants.colours;
      } else if (Array.isArray(product.variants?.colors)) {
        prodColours = product.variants.colors;
      }

      // Render Size Selector
      const sizeContainer = document.getElementById('pd-size-container');
      const sizeSelector = document.getElementById('pd-size-selector');
      if (sizeSelector) {
        if (prodSizes && prodSizes.length > 0) {
          if (sizeContainer) sizeContainer.classList.remove('hidden');
          sizeSelector.innerHTML = prodSizes.map((s, idx) => {
            let sizeName = '';
            if (typeof s === 'string') {
              sizeName = s;
            } else if (s && typeof s === 'object') {
              sizeName = (s.name || s.label || (s.width && s.height ? `${s.width} × ${s.height}` : '') || '').trim();
            }
            if (!sizeName) sizeName = 'Standard';
            const isSelected = idx === 0;
            const btnClass = isSelected
              ? 'pd-size-btn bg-black text-white py-3 px-2 text-xs font-bold border border-black text-center transition cursor-pointer'
              : 'pd-size-btn bg-white text-gray-800 hover:border-black py-3 px-2 text-xs font-bold border border-gray-300 text-center transition cursor-pointer';

            const escapedName = sizeName.replace(/'/g, "\\'");
            return `<button type="button" onclick="window.selectPdSize('${escapedName}', this)" class="${btnClass}">${sizeName}</button>`;
          }).join('');
        } else {
          if (sizeContainer) sizeContainer.classList.add('hidden');
          sizeSelector.innerHTML = '';
        }
      }

      // Render Color / Material Selector
      const matContainer = document.getElementById('pd-material-container');
      const matSelector = document.getElementById('pd-material-selector');
      if (matSelector) {
        if (prodColours && prodColours.length > 0) {
          if (matContainer) matContainer.classList.remove('hidden');
          matSelector.innerHTML = prodColours.map((c, idx) => {
            let colourName = '';
            let colourVal = '#000000';
            if (typeof c === 'string') {
              colourName = c;
              colourVal = /^#[0-9a-f]{3,8}$/i.test(c) ? c : '#000000';
            } else if (c && typeof c === 'object') {
              colourName = (c.name || c.label || c.colorName || c.value || '').trim();
              colourVal = c.value || c.color || c.hex || '#000000';
            }
            if (!colourName) colourName = 'COLOR';
            const isSelected = idx === 0;
            const borderClass = isSelected ? 'border-black' : 'border-transparent';
            const textClass = isSelected ? 'text-gray-900' : 'text-gray-500';

            const escapedName = colourName.replace(/'/g, "\\'");
            const safeVal = /^#[0-9a-f]{3,8}$/i.test(colourVal) ? colourVal : '#000000';
            return `<button type="button" onclick="window.selectPdMaterial('${escapedName}', this)" class="pd-mat-btn flex flex-col items-center gap-1.5 group cursor-pointer">
              <span class="w-8 h-8 rounded-full border-2 ${borderClass} group-hover:scale-110 transition-transform" style="background-color: ${safeVal};"></span>
              <span class="text-[9px] font-bold ${textClass} tracking-wider uppercase">${colourName}</span>
            </button>`;
          }).join('');
        } else {
          if (matContainer) matContainer.classList.add('hidden');
          matSelector.innerHTML = '';
        }
      }

      // 6. Update Action Buttons
      const cartBtn = document.getElementById('pd-add-to-cart-btn');
      if (cartBtn) {
        cartBtn.onclick = () => {
          if (!currentUser) {
            toggleModal('login-modal');
            return;
          }
          addStoreItemToCart(name, finalPrice);
        };
      }

      const customizeBtn = document.getElementById('pd-customize-btn');
      if (customizeBtn) {
        customizeBtn.onclick = () => {
          loadProductIntoEditor(product);
        };
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.lucide) lucide.createIcons();
    };


    window.loadProductIntoEditor = (product) => {
      window.activeFrameProduct = product;
      window.activeFrameConfiguration = {
        productId: product.id || product.productId || null,
        productName: product.name || 'Custom Frame',
        size: null,
        colour: null,
        thickness: 100,
        ...(product.frameConfiguration || {})
      };
      const configuredSizes = window.activeFrameConfiguration.sizes || defaultFrameSizes;
      const configuredColours = window.activeFrameConfiguration.colours || defaultFrameColours;
      window.activeFrameConfiguration.size = configuredSizes[0];
      window.activeFrameConfiguration.colour = configuredColours[0];
      const artLayer = document.getElementById('artwork-layer');
      artLayer.innerHTML = '';
      document.getElementById('design-canvas').style.backgroundColor = '#ffffff';
      document.getElementById('canvas-bg-color').value = '#ffffff';

      triggerTransition('editor', `${product.name} Customization`);

      setTimeout(() => {
        if (product.frameImage && product.bgImage) {
          const canvasW = document.getElementById('design-canvas').offsetWidth;
          const canvasH = document.getElementById('design-canvas').offsetHeight;
          const img = new Image();
          img.crossOrigin = "anonymous";

          img.onload = () => {
            const imgW = img.naturalWidth;
            const imgH = img.naturalHeight;

            const scanCanvas = document.createElement('canvas');
            scanCanvas.width = imgW;
            scanCanvas.height = imgH;
            const ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);

            let minX = imgW, minY = imgH, maxX = 0, maxY = 0;
            let hasVisiblePixels = false;
            let holeMinX = null, holeMinY = null, holeMaxX = null, holeMaxY = null;

            try {
              const imageData = ctx.getImageData(0, 0, imgW, imgH).data;
              for (let y = 0; y < imgH; y++) {
                for (let x = 0; x < imgW; x++) {
                  if (imageData[(y * imgW + x) * 4 + 3] > 10) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    hasVisiblePixels = true;
                  }
                }
              }

              const alphaAt = (x, y) => imageData[(y * imgW + x) * 4 + 3];
              const transparent = (x, y) => alphaAt(x, y) <= 10;

              let startX = Math.max(0, Math.min(imgW - 1, Math.round((minX + maxX) / 2)));
              let startY = Math.max(0, Math.min(imgH - 1, Math.round((minY + maxY) / 2)));
              if (!transparent(startX, startY)) {
                let found = false;
                const maxR = Math.floor(Math.min(imgW, imgH) / 2);
                for (let r = 1; r < maxR && !found; r += 2) {
                  for (let dy = -r; dy <= r && !found; dy += 2) {
                    for (let dx = -r; dx <= r && !found; dx += 2) {
                      const x = startX + dx;
                      const y = startY + dy;
                      if (x < 0 || y < 0 || x >= imgW || y >= imgH) continue;
                      if (transparent(x, y)) { startX = x; startY = y; found = true; }
                    }
                  }
                }
              }

              if (transparent(startX, startY)) {
                const visited = new Uint8Array(imgW * imgH);
                const queue = new Int32Array(imgW * imgH);
                let qh = 0, qt = 0;
                const startIdx = startY * imgW + startX;
                visited[startIdx] = 1;
                queue[qt++] = startIdx;
                holeMinX = startX; holeMaxX = startX; holeMinY = startY; holeMaxY = startY;

                while (qh < qt) {
                  const idx = queue[qh++];
                  const x = idx % imgW;
                  const y = (idx / imgW) | 0;
                  if (x < holeMinX) holeMinX = x;
                  if (x > holeMaxX) holeMaxX = x;
                  if (y < holeMinY) holeMinY = y;
                  if (y > holeMaxY) holeMaxY = y;

                  const n1 = idx - 1;
                  const n2 = idx + 1;
                  const n3 = idx - imgW;
                  const n4 = idx + imgW;

                  if (x > 0 && !visited[n1] && transparent(x - 1, y)) { visited[n1] = 1; queue[qt++] = n1; }
                  if (x < imgW - 1 && !visited[n2] && transparent(x + 1, y)) { visited[n2] = 1; queue[qt++] = n2; }
                  if (y > 0 && !visited[n3] && transparent(x, y - 1)) { visited[n3] = 1; queue[qt++] = n3; }
                  if (y < imgH - 1 && !visited[n4] && transparent(x, y + 1)) { visited[n4] = 1; queue[qt++] = n4; }
                }
              }
            } catch (e) { }

            if (!hasVisiblePixels) { minX = 0; minY = 0; maxX = imgW; maxY = imgH; }

            const visibleW = (maxX - minX) || imgW;
            const visibleH = (maxY - minY) || imgH;

            let croppedFrameSrc = null;
            try {
              const cropCanvas = document.createElement('canvas');
              cropCanvas.width = visibleW;
              cropCanvas.height = visibleH;
              const cropCtx = cropCanvas.getContext('2d');
              cropCtx.drawImage(img, minX, minY, visibleW, visibleH, 0, 0, visibleW, visibleH);
              croppedFrameSrc = cropCanvas.toDataURL('image/png');
            } catch (e) { }

            // Restore auto-fit logic: calculate scale to make the VISIBLE part exactly fit the canvas boundaries
            const scaleX = canvasW / visibleW;
            const scaleY = canvasH / visibleH;

            const finalW = imgW * scaleX;
            const finalH = imgH * scaleY;

            const frameLeft = -(minX * scaleX);
            const frameTop = -(minY * scaleY);

            // The background perfectly matches the canvas dimensions minus a tiny inward safety buffer
            const safetyX = canvasW * 0.005;
            const safetyY = canvasH * 0.005;
            const bgWidth = canvasW - (safetyX * 2);
            const bgHeight = canvasH - (safetyY * 2);

            // Add Background Image perfectly constrained inside the canvas workspace bounds
            const bgWrap = document.createElement('div');
            bgWrap.className = 'canvas-item absolute cursor-move select-none bg-transparent';
            bgWrap.dataset.type = 'image';
            bgWrap.style.width = bgWidth + 'px';
            bgWrap.style.height = bgHeight + 'px';
            bgWrap.style.left = safetyX + 'px';
            bgWrap.style.top = safetyY + 'px';
            bgWrap.dataset.cost = 0;
            bgWrap.dataset.itemName = "Background Artwork";
            bgWrap.dataset.frameRole = 'artwork';
            // object-fill guarantees it completely stretches to the edges without leaving blank gaps
            bgWrap.innerHTML = `<img src="${product.bgImage}" crossorigin="anonymous" class="w-full h-full object-fill pointer-events-none block rounded-md">`;
            artLayer.appendChild(bgWrap);

            // Add Frame Image precisely matched and auto-fitted to the canvas bounds
            const frameWrap = document.createElement('div');
            frameWrap.className = 'canvas-item absolute relative cursor-move select-none bg-transparent';
            frameWrap.style.isolation = 'isolate';
            frameWrap.dataset.type = 'image';
            frameWrap.style.width = finalW + 'px';
            frameWrap.style.height = finalH + 'px';
            frameWrap.style.left = frameLeft + 'px';
            frameWrap.style.top = frameTop + 'px';
            frameWrap.dataset.cost = (product.saleActive && product.salePrice != null) ? product.salePrice : (product.price || 0);
            frameWrap.dataset.itemName = product.name;
            frameWrap.dataset.frameRole = 'frame';
            frameWrap.dataset.frameBounds = JSON.stringify({ imgW, imgH, minX, minY, maxX, maxY });
            if (croppedFrameSrc) frameWrap.dataset.frameCroppedSrc = croppedFrameSrc;
            if (holeMinX != null && holeMinY != null && holeMaxX != null && holeMaxY != null) {
              const sliceLeft = Math.max(1, holeMinX - minX);
              const sliceTop = Math.max(1, holeMinY - minY);
              const sliceRight = Math.max(1, visibleW - (holeMaxX - minX));
              const sliceBottom = Math.max(1, visibleH - (holeMaxY - minY));
              frameWrap.dataset.frameSlices = JSON.stringify({ sliceLeft, sliceTop, sliceRight, sliceBottom, srcW: visibleW, srcH: visibleH });
            }
            frameWrap.innerHTML = `<img src="${product.frameImage}" crossorigin="anonymous" style="width:100%; height:100%;" class="pointer-events-none block drop-shadow-xl">`;
            artLayer.appendChild(frameWrap);

            selectElement(bgWrap, 'image');
            window.renderFrameCustomizationPanel();
            if (window.activeFrameConfiguration?.dynamicThickness) window.applyFrameThickness(window.activeFrameConfiguration.thickness || 100, false);
            recordState();
            showToast("Smart Template loaded & Auto-fitted perfectly!");
            window.updateCanvasScale();
          };
          img.src = product.frameImage;
        } else {
          const imgSrc = product.images && product.images.length > 0 ? product.images[0] : null;
          if (imgSrc) {
            addFrameToCanvas(imgSrc, product.price, product.name);
            showToast("Template loaded! Right-click to adjust layers.");
          }
          window.updateCanvasScale();
        }
      }, 800);
    };

    window.selectManagedFrame = async (productId) => {
      let product = productTemplates.find(p => p.id === productId);
      if (!product) { const doc = await db.collection('products').doc(productId).get(); if (doc.exists) product = { id: doc.id, ...doc.data() }; }
      if (!product) return showToast('This frame is no longer available.');
      window.loadProductIntoEditor(product);
    };

    window.syncFrameCustomizationPanels = () => {
      const config = window.activeFrameConfiguration;
      const desktopPanel = document.getElementById('desktop-frame-panel');
      const mobileControls = document.getElementById('mobile-frame-controls');
      const frameCustomPanel = document.getElementById('frame-customization-panel');

      // Only show if a frame element is selected
      if (!selectedItem || selectedItem.dataset.frameRole !== 'frame' || !config) {
        if (desktopPanel) {
          desktopPanel.classList.add('hidden');
          desktopPanel.classList.remove('md:flex'); // Removes flex override so it hides cleanly
        }
        if (mobileControls) {
          mobileControls.classList.add('hidden');
          mobileControls.classList.remove('flex');
        }
        if (frameCustomPanel) frameCustomPanel.classList.add('hidden');
        return;
      }

      // Process colours: ensure current colour is first, no duplicates
      const baseColours = config.colours?.length ? config.colours : defaultFrameColours;
      const processedColours = [];
      if (config.colour) {
        processedColours.push(config.colour);
      }
      baseColours.forEach(c => {
        if (!processedColours.find(pc => pc.value === c.value)) {
          processedColours.push(c);
        }
      });
      const sizes = config.sizes?.length ? config.sizes : defaultFrameSizes;

      // 1. Desktop Panel Sync (Squares)
      if (desktopPanel) {
        desktopPanel.classList.remove('hidden');
        desktopPanel.classList.add('md:flex');

        const desktopColors = document.getElementById('desktop-frame-colors');
        desktopColors.innerHTML = processedColours.map((c, idx) => `
              <button onclick="selectFrameColourByValue('${c.value}')" title="${c.name}" class="w-8 h-8 rounded border-2 ${config.colour && config.colour.value === c.value ? 'border-flame shadow-md scale-110' : 'border-sand/50'} hover:scale-105 transition-all" style="background-color: ${c.value};"></button>
          `).join('');

        const thicknessWrapper = document.getElementById('desktop-frame-thickness-wrapper');
        if (config.dynamicThickness) {
          thicknessWrapper.classList.remove('hidden');
          document.getElementById('dt-thickness-slider').value = config.thickness || 100;
          document.getElementById('dt-thickness-val').textContent = `${config.thickness || 100}%`;
        } else {
          thicknessWrapper.classList.add('hidden');
        }
      }

      // 2. Mobile Top Bar Sync (Circles)
      if (mobileControls) {
        mobileControls.classList.remove('hidden');
        mobileControls.classList.add('flex');

        let mobileHtml = `<div class="flex items-center gap-1.5 pl-1">`;
        mobileHtml += processedColours.map((c, idx) => `
              <button onclick="selectFrameColourByValue('${c.value}')" title="${c.name}" class="w-5 h-5 rounded-full border-2 ${config.colour && config.colour.value === c.value ? 'border-flame shadow-md scale-110' : 'border-sand'} shrink-0 transition-transform" style="background-color: ${c.value};"></button>
          `).join('');
        mobileHtml += `</div>`;

        if (config.dynamicThickness) {
          mobileHtml += `
                 <div class="h-4 w-px bg-sand mx-1 shrink-0"></div>
                 <i data-lucide="move-horizontal" class="w-3 h-3 text-slate shrink-0"></i>
                 <input type="range" id="mob-thickness-slider" min="70" max="150" value="${config.thickness || 100}" class="w-12 accent-flame shrink-0" oninput="applyFrameThickness(this.value)">
              `;
        }
        mobileControls.innerHTML = mobileHtml;
        lucide.createIcons();
      }

      // 3. Frame Customization Panel (in cat-frames)
      if (frameCustomPanel) {
        frameCustomPanel.classList.remove('hidden');

        // Frame sizes
        const frameSizeOptions = document.getElementById('frame-size-options');
        if (frameSizeOptions) {
          frameSizeOptions.innerHTML = sizes.map((s, idx) => `
                  <button onclick="selectFrameSize(${idx})" class="px-3 py-1.5 rounded-lg border-2 text-xs font-bold ${config.size && config.size.width === s.width && config.size.height === s.height ? 'border-flame bg-flame/10 text-flame' : 'border-sand/50 bg-white text-slate'} hover:border-flame transition">${s.name || `${s.width} × ${s.height}`}</button>
              `).join('');
        }

        // Frame colours
        const frameColourOptions = document.getElementById('frame-colour-options');
        if (frameColourOptions) {
          frameColourOptions.innerHTML = processedColours.map((c, idx) => `
                  <button onclick="selectFrameColourByValue('${c.value}')" title="${c.name}" class="w-8 h-8 rounded-full border-2 ${config.colour && config.colour.value === c.value ? 'border-flame shadow-md scale-110' : 'border-sand/50'} hover:scale-105 transition-all" style="background-color: ${c.value};"></button>
              `).join('');
        }

        // Thickness control
        const thicknessControl = document.getElementById('frame-thickness-control');
        if (thicknessControl) {
          if (config.dynamicThickness) {
            thicknessControl.classList.remove('hidden');
            document.getElementById('frame-thickness-value').textContent = `${config.thickness || 100}%`;
            document.getElementById('frame-thickness-slider').value = config.thickness || 100;
          } else {
            thicknessControl.classList.add('hidden');
          }
        }
      }
    };

    // Helper function to select color by value instead of index
    window.selectFrameColourByValue = (value) => {
      const config = window.activeFrameConfiguration;
      if (!config) return;
      const baseColours = config.colours?.length ? config.colours : defaultFrameColours;
      const colour = baseColours.find(c => c.value === value);
      if (colour) {
        config.colour = colour;
        window.syncFrameCustomizationPanels();
        window.updateFrameColourOverlay();
        recordState();
      }
    };

    window.updateFrameColourOverlay = () => {
      const config = window.activeFrameConfiguration;
      const frame = document.querySelector('#artwork-layer [data-frame-role="frame"]');
      if (!config || !frame || !config.colour) return;
      const bounds = JSON.parse(frame.dataset.frameBounds || '{}');
      const slices = JSON.parse(frame.dataset.frameSlices || 'null');
      if (!slices || !bounds || !bounds.imgW || !bounds.imgH) {
        const existing = frame.querySelector('.frame-colour-overlay');
        if (existing) existing.remove();
        return;
      }
      frame.style.isolation = 'isolate';

      let overlay = frame.querySelector('.frame-colour-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'frame-colour-overlay pointer-events-none absolute';
        overlay.style.boxSizing = 'border-box';
        overlay.style.borderStyle = 'solid';
        overlay.style.background = 'transparent';
        overlay.style.mixBlendMode = 'color';
        overlay.style.opacity = '.72';
        overlay.style.zIndex = '5';
        frame.appendChild(overlay);
      }

      const sx = frame.offsetWidth / bounds.imgW;
      const sy = frame.offsetHeight / bounds.imgH;
      const visibleW = (bounds.maxX - bounds.minX) || bounds.imgW;
      const visibleH = (bounds.maxY - bounds.minY) || bounds.imgH;
      const visLeft = (bounds.minX || 0) * sx;
      const visTop = (bounds.minY || 0) * sy;
      const visW = visibleW * sx;
      const visH = visibleH * sy;

      overlay.style.left = `${visLeft}px`;
      overlay.style.top = `${visTop}px`;
      overlay.style.width = `${visW}px`;
      overlay.style.height = `${visH}px`;
      overlay.style.borderColor = config.colour.value;

      const scaleX = visW / (slices.srcW || visibleW || 1);
      const scaleY = visH / (slices.srcH || visibleH || 1);
      const mult = Number(config.thickness || 100) / 100;
      const maxXInset = Math.max(1, (visW / 2) - 1);
      const maxYInset = Math.max(1, (visH / 2) - 1);

      const leftPx = Math.min(maxXInset, Math.max(1, slices.sliceLeft * scaleX * mult));
      const rightPx = Math.min(maxXInset, Math.max(1, slices.sliceRight * scaleX * mult));
      const topPx = Math.min(maxYInset, Math.max(1, slices.sliceTop * scaleY * mult));
      const bottomPx = Math.min(maxYInset, Math.max(1, slices.sliceBottom * scaleY * mult));

      overlay.style.borderLeftWidth = `${leftPx}px`;
      overlay.style.borderRightWidth = `${rightPx}px`;
      overlay.style.borderTopWidth = `${topPx}px`;
      overlay.style.borderBottomWidth = `${bottomPx}px`;
    };

    window.renderFrameCustomizationPanel = () => {
      window.syncFrameCustomizationPanels();
    };

    window.selectFrameSize = (index) => {
      const config = window.activeFrameConfiguration; if (!config) return;
      config.size = (config.sizes?.length ? config.sizes : defaultFrameSizes)[index];
      window.refitActiveFrameForSize();
    };

    window.selectFrameColour = (index) => {
      const config = window.activeFrameConfiguration; if (!config) return;
      config.colour = (config.colours?.length ? config.colours : defaultFrameColours)[index];
      window.syncFrameCustomizationPanels();
      window.updateFrameColourOverlay();
      recordState();
    };

    window.applyFrameThickness = (value, shouldRecord = true) => {
      const config = window.activeFrameConfiguration; if (!config) return;
      config.thickness = Number(value);

      const dtVal = document.getElementById('dt-thickness-val');
      const dtSlider = document.getElementById('dt-thickness-slider');
      const mobSlider = document.getElementById('mob-thickness-slider');
      const frameThicknessVal = document.getElementById('frame-thickness-value');
      const frameThicknessSlider = document.getElementById('frame-thickness-slider');

      if (dtVal) dtVal.textContent = `${value}%`;
      if (dtSlider && dtSlider.value !== value) dtSlider.value = value;
      if (mobSlider && mobSlider.value !== value) mobSlider.value = value;
      if (frameThicknessVal) frameThicknessVal.textContent = `${value}%`;
      if (frameThicknessSlider && frameThicknessSlider.value !== value) frameThicknessSlider.value = value;

      const frame = document.querySelector('#artwork-layer [data-frame-role="frame"]');
      if (frame) {
        const img = frame.querySelector('img');
        const croppedSrc = frame.dataset.frameCroppedSrc;
        const slices = JSON.parse(frame.dataset.frameSlices || 'null');
        const bounds = JSON.parse(frame.dataset.frameBounds || '{}');
        if (config.dynamicThickness && croppedSrc && slices && bounds && bounds.imgW && bounds.imgH) {
          if (img) { img.style.transform = ''; img.style.visibility = 'hidden'; }
          let borderEl = frame.querySelector('.dynamic-frame-border');
          if (!borderEl) {
            borderEl = document.createElement('div');
            borderEl.className = 'dynamic-frame-border pointer-events-none absolute drop-shadow-xl';
            borderEl.style.boxSizing = 'border-box';
            borderEl.style.borderStyle = 'solid';
            borderEl.style.borderColor = 'transparent';
            borderEl.style.zIndex = '1';
            borderEl.style.borderImageSource = `url("${croppedSrc}")`;
            borderEl.style.borderImageSlice = `${slices.sliceTop} ${slices.sliceRight} ${slices.sliceBottom} ${slices.sliceLeft}`;
            borderEl.style.borderImageRepeat = 'round';
            frame.appendChild(borderEl);
          } else {
            borderEl.style.borderImageSource = `url("${croppedSrc}")`;
            borderEl.style.borderImageSlice = `${slices.sliceTop} ${slices.sliceRight} ${slices.sliceBottom} ${slices.sliceLeft}`;
          }

          const sx = frame.offsetWidth / bounds.imgW;
          const sy = frame.offsetHeight / bounds.imgH;
          const visibleW = (bounds.maxX - bounds.minX) || bounds.imgW;
          const visibleH = (bounds.maxY - bounds.minY) || bounds.imgH;

          const visLeft = (bounds.minX || 0) * sx;
          const visTop = (bounds.minY || 0) * sy;
          const visW = visibleW * sx;
          const visH = visibleH * sy;
          borderEl.style.left = `${visLeft}px`;
          borderEl.style.top = `${visTop}px`;
          borderEl.style.width = `${visW}px`;
          borderEl.style.height = `${visH}px`;

          const scaleX = visW / (slices.srcW || visibleW || 1);
          const scaleY = visH / (slices.srcH || visibleH || 1);

          const mult = Number(value) / 100;
          const maxXInset = Math.max(1, (visW / 2) - 1);
          const maxYInset = Math.max(1, (visH / 2) - 1);

          const leftPx = Math.min(maxXInset, Math.max(1, slices.sliceLeft * scaleX * mult));
          const rightPx = Math.min(maxXInset, Math.max(1, slices.sliceRight * scaleX * mult));
          const topPx = Math.min(maxYInset, Math.max(1, slices.sliceTop * scaleY * mult));
          const bottomPx = Math.min(maxYInset, Math.max(1, slices.sliceBottom * scaleY * mult));

          borderEl.style.borderLeftWidth = `${leftPx}px`;
          borderEl.style.borderRightWidth = `${rightPx}px`;
          borderEl.style.borderTopWidth = `${topPx}px`;
          borderEl.style.borderBottomWidth = `${bottomPx}px`;
          if (config.colour) window.updateFrameColourOverlay();
        } else if (img) {
          img.style.visibility = '';
        }
      }
      if (shouldRecord) recordState();
    };
    window.refitActiveFrameForSize = () => {
      const config = window.activeFrameConfiguration; const frame = document.querySelector('#artwork-layer [data-frame-role="frame"]'); const artwork = document.querySelector('#artwork-layer [data-frame-role="artwork"]');
      if (!config?.size || !frame) return;
      const canvas = document.getElementById('design-canvas'); const oldW = canvas.offsetWidth; const oldH = canvas.offsetHeight;
      const ratio = config.size.width / config.size.height; const max = 720; const newW = ratio >= 1 ? max : Math.round(max * ratio); const newH = ratio >= 1 ? Math.round(max / ratio) : max;
      Array.from(document.querySelectorAll('#artwork-layer .canvas-item')).filter(item => item !== frame && item !== artwork).forEach(item => { item.style.left = `${item.offsetLeft / oldW * newW}px`; item.style.top = `${item.offsetTop / oldH * newH}px`; item.style.width = `${item.offsetWidth / oldW * newW}px`; item.style.height = `${item.offsetHeight / oldH * newH}px`; });
      canvas.style.width = `${newW}px`; canvas.style.height = `${newH}px`; const drawing = document.getElementById('drawing-layer'); drawing.width = newW; drawing.height = newH;
      if (artwork) { artwork.style.left = `${newW * .005}px`; artwork.style.top = `${newH * .005}px`; artwork.style.width = `${newW * .99}px`; artwork.style.height = `${newH * .99}px`; }
      const bounds = JSON.parse(frame.dataset.frameBounds || '{}'); const visibleW = (bounds.maxX - bounds.minX) || bounds.imgW; const visibleH = (bounds.maxY - bounds.minY) || bounds.imgH;
      if (visibleW && visibleH) { const sx = newW / visibleW, sy = newH / visibleH; frame.style.width = `${bounds.imgW * sx}px`; frame.style.height = `${bounds.imgH * sy}px`; frame.style.left = `${-bounds.minX * sx}px`; frame.style.top = `${-bounds.minY * sy}px`; }
      if (config?.dynamicThickness) window.applyFrameThickness(config.thickness || 100, false);
      window.updateCanvasScale();
      recordState();
    };

    window.currentCanvasScale = 1;
    window.updateCanvasScale = () => {
      const canvas = document.getElementById('design-canvas');
      const wrapper = document.getElementById('scaler-wrapper');
      const main = document.getElementById('editor-workspace-main');
      if (!canvas || !wrapper || !main) return;

      const canvasW = parseFloat(canvas.style.width) || canvas.offsetWidth || 400;
      const canvasH = parseFloat(canvas.style.height) || canvas.offsetHeight || 500;

      const paddingX = 48;
      const paddingY = window.innerWidth < 768 ? 160 : 64;
      const availableW = Math.max(100, main.clientWidth - paddingX);
      const availableH = Math.max(100, main.clientHeight - paddingY);

      const scale = Math.min(1, Math.min(availableW / canvasW, availableH / canvasH));
      window.currentCanvasScale = scale;

      canvas.style.transform = `scale(${scale})`;
      canvas.style.transformOrigin = 'center center';

      wrapper.style.width = `${canvasW * scale}px`;
      wrapper.style.height = `${canvasH * scale}px`;

      if (typeof syncRing === 'function') {
        syncRing();
      }
    };

    function switchDashboardTab(tab) {
      const btnTemplates = document.getElementById('btn-dash-templates');
      const btnProjects = document.getElementById('btn-dash-projects');
      const secTemplates = document.getElementById('dash-templates-sec');
      const secProjects = document.getElementById('dash-projects-sec');

      if (tab === 'projects') {
        if (!currentUser) { toggleModal('login-modal'); return; } // Must be logged in to view projects

        btnTemplates.classList.replace('bg-charcoal', 'hover:bg-sand/30');
        btnTemplates.classList.replace('text-cream', 'text-slate');

        btnProjects.classList.replace('hover:bg-sand/30', 'bg-charcoal');
        btnProjects.classList.replace('text-slate', 'text-cream');

        secTemplates.classList.replace('block', 'hidden');
        secProjects.classList.replace('hidden', 'block');

        renderMyProjects();
      } else {
        btnProjects.classList.replace('bg-charcoal', 'hover:bg-sand/30');
        btnProjects.classList.replace('text-cream', 'text-slate');

        btnTemplates.classList.replace('hover:bg-sand/30', 'bg-charcoal');
        btnTemplates.classList.replace('text-slate', 'text-cream');

        secProjects.classList.replace('block', 'hidden');
        secTemplates.classList.replace('hidden', 'block');
      }
    }

    function renderMyProjects() {
      const grid = document.getElementById('projects-grid');
      if (myProjects.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full text-center py-10 bg-white rounded-3xl border border-sand/50 shadow-sm mt-4">
            <i data-lucide="folder-open" class="w-12 h-12 text-sand mx-auto mb-3"></i>
            <p class="text-slate font-bold text-lg">You haven't saved any projects yet.</p>
            <button onclick="switchDashboardTab('templates')" class="mt-4 px-6 py-2 bg-flame/10 text-flame rounded-xl font-bold text-sm hover:bg-flame hover:text-cream transition">Start Designing</button>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      grid.innerHTML = myProjects.map((proj) => {
        const dateStr = proj.date && proj.date.seconds ? new Date(proj.date.seconds * 1000).toLocaleDateString() : new Date(proj.date).toLocaleDateString();
        return `
        <div class="bg-white p-6 rounded-3xl border border-sand hover:border-flame shadow-sm transition group cursor-pointer" onclick="loadProject('${proj.id}')">
          <div class="aspect-[4/3] rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative border border-sand/50 shadow-inner" style="background-color: ${proj.backgroundColor || '#eef3f6'}">
            ${proj.canvasData ?
            `<div class="w-full h-full absolute inset-0 pointer-events-none flex items-center justify-center">
                 <div style="transform: scale(0.3); transform-origin: center; width: 400px; height: 500px; position: relative;">${proj.canvasData}</div>
               </div>` :
            `<i data-lucide="image" class="w-8 h-8 text-sand/60 group-hover:scale-110 transition duration-300"></i>`
          }
            <div class="absolute inset-0 bg-charcoal/5 group-hover:bg-transparent transition"></div>
          </div>
          <h3 class="font-extrabold text-charcoal text-lg mb-1 truncate">${proj.title}</h3>
          <p class="text-xs font-bold text-slate">Saved: ${dateStr}</p>
        </div>
      `}).join('');
      lucide.createIcons();
    }

    window.loadProject = (id) => {
      const proj = myProjects.find(p => p.id === id);
      if (proj) {
        currentProjectId = id;
        document.getElementById('editor-project-title').innerText = proj.title;
        document.getElementById('artwork-layer').innerHTML = proj.canvasData || '';
        document.getElementById('design-canvas').style.backgroundColor = proj.backgroundColor || '#ffffff';
        document.getElementById('canvas-bg-color').value = rgbToHex(proj.backgroundColor || '#ffffff');

        // Re-bind blur events for text elements so history works
        document.getElementById('artwork-layer').querySelectorAll('[data-type="text"]').forEach(t => t.onblur = recordState);

        triggerTransition('editor', proj.title);
        window.updateCanvasScale();
        setTimeout(recordState, 500); // Save initial load to the undo/redo stack
      }
    };

    // --- BROWSER HISTORY SPA ROUTER INTERFACE ---
    // Toggle Accordion Collapse (only one visible at a time)
    window.toggleFaq = (index) => {
      const faqItems = document.querySelectorAll('.faq-item');
      faqItems.forEach((item, idx) => {
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('i');
        if (idx === index) {
          const isOpened = answer.style.maxHeight && answer.style.maxHeight !== '0px';
          if (isOpened) {
            answer.style.maxHeight = '0px';
            icon.style.transform = 'rotate(0deg)';
            item.classList.remove('border-flame', 'shadow-md');
          } else {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            icon.style.transform = 'rotate(180deg)';
            item.classList.add('border-flame', 'shadow-md');
          }
        } else {
          answer.style.maxHeight = '0px';
          icon.style.transform = 'rotate(0deg)';
          item.classList.remove('border-flame', 'shadow-md');
        }
      });
    };

    window.showLandingContentSections = (show) => {
      const sections = ['hero', 'frames-section', 'category-section', 'contact-section', 'about-section'];
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          if (show) el.classList.remove('hidden');
          else el.classList.add('hidden');
        }
      });

      const additionalSections = ['product-detail-view', 'faq-section', 'orders-tracking-section', 'user-profile-section', 'user-settings-section', 'dynamic-page-section', 'blog-index-section'];
      additionalSections.forEach(id => {
        const el = document.getElementById(id);
        if (el && show) el.classList.add('hidden');
      });

      if (show && window.initScrollAnimations) {
        setTimeout(() => window.initScrollAnimations(), 50);
      }
    };

    // Switch to FAQ view
    window.showFAQPage = (pushState = true) => {
      window.showLandingContentSections(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
      const faq = document.getElementById('faq-section');
      if (faq) faq.classList.remove('hidden');
      if (pushState) {
        window.history.pushState({ view: 'faq' }, "", "#faq");
      }
    };

    // ==================================================
    // DYNAMIC DYNAMICALLY GENERATED CMS PAGE ENGINE
    // ==================================================
    window.dynamicPages = [];
    let activePageImages = [];

    // Helper: Parse pasted content into headings, subheadings, and paragraphs
    function parsePastedContent(text) {
      if (!text) return [];
      const lines = text.split(/\r?\n/);
      const blocks = [];
      let currentParagraphLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          if (currentParagraphLines.length > 0) {
            blocks.push({ type: 'paragraph', value: currentParagraphLines.join('\n') });
            currentParagraphLines = [];
          }
          continue;
        }

        // Markdown headings
        const mdHeadingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (mdHeadingMatch) {
          if (currentParagraphLines.length > 0) {
            blocks.push({ type: 'paragraph', value: currentParagraphLines.join('\n') });
            currentParagraphLines = [];
          }
          const level = mdHeadingMatch[1].length;
          const textVal = mdHeadingMatch[2].trim();
          blocks.push({
            type: level <= 2 ? 'heading' : 'subheading',
            value: textVal
          });
          continue;
        }

        // Plain text headings
        const isShort = line.length < 80;
        const endsWithPeriod = line.endsWith('.');
        const isAllUpperCase = line === line.toUpperCase() && /[A-Z]/.test(line);

        if (isShort && !endsWithPeriod && (isAllUpperCase || line.length < 50)) {
          if (currentParagraphLines.length > 0) {
            blocks.push({ type: 'paragraph', value: currentParagraphLines.join('\n') });
            currentParagraphLines = [];
          }
          const hasHeadingAlready = blocks.some(b => b.type === 'heading');
          blocks.push({
            type: (!hasHeadingAlready || isAllUpperCase) ? 'heading' : 'subheading',
            value: line
          });
        } else {
          currentParagraphLines.push(line);
        }
      }

      if (currentParagraphLines.length > 0) {
        blocks.push({ type: 'paragraph', value: currentParagraphLines.join('\n') });
      }
      return blocks;
    }

    // Helper: Group content blocks by headings/subheadings
    function groupTextBlocks(blocks) {
      const groups = [];
      let currentGroup = [];

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        if (b.type === 'heading' || b.type === 'subheading') {
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }
          currentGroup = [b];
        } else {
          currentGroup.push(b);
        }
      }
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      return groups;
    }

    // Helper: Build alternating & responsive layout with intelligent image distribution
    function buildLayout(pageTitle, textGroups, images, specialBlocks) {
      let html = '';
      const remainingGroups = [...textGroups];
      const remainingImages = [...images];

      const topButtons = [];
      const bottomButtons = [];
      const bodySpecials = [];

      specialBlocks.forEach(spec => {
        if (spec.type === 'button') {
          const parts = spec.value.split('::');
          const placement = parts[2] || 'bottom';
          if (placement === 'top') {
            topButtons.push(spec);
          } else {
            bottomButtons.push(spec);
          }
        } else {
          bodySpecials.push(spec);
        }
      });

      let topButtonsHtml = topButtons.map(btn => renderSpecialBlock(btn)).join('');

      // 1. HERO SECTION
      if (remainingImages.length >= 1) {
        const heroImage = remainingImages.shift();
        let introHtml = '';
        if (remainingGroups.length > 0) {
          const firstGroup = remainingGroups.shift();
          introHtml = firstGroup.map(b => {
            if (b.type === 'heading' || b.type === 'subheading') {
              return `<h3 class="text-xl font-bold text-flame mb-3">${b.value}</h3>`;
            } else {
              return `<p class="text-slate text-sm leading-relaxed mb-3">${b.value.replace(/\n/g, '<br>')}</p>`;
            }
          }).join('');
        }

        html += `
          <!-- Hero Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16 pb-10 border-b border-sand/20">
            <div class="space-y-4">
              <span class="text-xs font-bold text-slate uppercase tracking-wider bg-sand/20 px-3 py-1 rounded-full">Featured Studio Page</span>
              <h1 class="text-4xl md:text-5xl font-black text-charcoal leading-tight" style="font-family: 'Oswald', sans-serif;">
                ${pageTitle.toUpperCase()}
              </h1>
              <div class="h-1.5 w-20 bg-flame rounded-full mb-6"></div>
              <div class="text-slate font-medium">${introHtml}</div>
            </div>
            <div class="relative group rounded-3xl overflow-hidden shadow-xl border border-sand/40 bg-white">
              <div class="aspect-[4/3] w-full">
                <img src="${heroImage}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="${pageTitle}">
              </div>
            </div>
          </div>
        `;

        if (topButtonsHtml) {
          html += `<div class="my-6">${topButtonsHtml}</div>`;
          topButtonsHtml = '';
        }
      } else {
        html += `
          <!-- Centered Hero -->
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h1 class="text-4xl md:text-5xl font-black text-charcoal mb-4" style="font-family: 'Oswald', sans-serif;">
              ${pageTitle.toUpperCase()}
            </h1>
            <div class="h-1.5 w-24 bg-flame rounded-full mx-auto"></div>
          </div>
        `;
      }

      // 2. ALTERNATING BODY SECTIONS
      let sectionIndex = 0;

      while (remainingGroups.length > 0 || remainingImages.length > 0 || bodySpecials.length > 0) {
        sectionIndex++;

        // A. Text Group section
        if (remainingGroups.length > 0) {
          const group = remainingGroups.shift();
          const shouldBeSideBySide = remainingImages.length > 0 && (sectionIndex % 2 === 1);

          if (shouldBeSideBySide) {
            const sideImage = remainingImages.shift();
            const textHtml = renderGroupBlocks(group);
            const imageOnLeft = sectionIndex % 4 === 1;

            if (imageOnLeft) {
              html += `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center my-16">
                  <div class="rounded-3xl overflow-hidden shadow-lg border border-sand/30 bg-white aspect-[4/3]">
                    <img src="${sideImage}" alt="${pageTitle} Illustration" title="${pageTitle} Illustration" loading="lazy" class="w-full h-full object-cover">
                  </div>
                  <div class="space-y-4 font-medium text-slate text-sm leading-relaxed">${textHtml}</div>
                </div>
              `;
            } else {
              html += `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center my-16">
                  <div class="space-y-4 font-medium text-slate text-sm leading-relaxed">${textHtml}</div>
                  <div class="rounded-3xl overflow-hidden shadow-lg border border-sand/30 bg-white aspect-[4/3]">
                    <img src="${sideImage}" alt="${pageTitle} Illustration" title="${pageTitle} Illustration" loading="lazy" class="w-full h-full object-cover">
                  </div>
                </div>
              `;
            }
          } else {
            const textHtml = renderGroupBlocks(group);
            html += `
              <div class="my-10 space-y-4 font-medium text-slate text-sm leading-relaxed max-w-3xl">
                ${textHtml}
              </div>
            `;
          }

          if (topButtonsHtml) {
            html += `<div class="my-6">${topButtonsHtml}</div>`;
            topButtonsHtml = '';
          }
        }

        // B. Special Blocks
        if (bodySpecials.length > 0 && (sectionIndex % 2 === 0 || remainingGroups.length === 0)) {
          const spec = bodySpecials.shift();
          html += renderSpecialBlock(spec);
        }

        // C. Remaining Images
        if (remainingImages.length > 0 && (sectionIndex % 3 === 0 || remainingGroups.length === 0)) {
          if (remainingImages.length >= 2) {
            const img1 = remainingImages.shift();
            const img2 = remainingImages.shift();
            html += `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 my-12">
                <div class="rounded-3xl overflow-hidden shadow-md border border-sand/30 bg-white aspect-[4/3]">
                  <img src="${img1}" alt="${pageTitle} Gallery Image 1" title="${pageTitle} Image 1" loading="lazy" class="w-full h-full object-cover">
                </div>
                <div class="rounded-3xl overflow-hidden shadow-md border border-sand/30 bg-white aspect-[4/3]">
                  <img src="${img2}" alt="${pageTitle} Gallery Image 2" title="${pageTitle} Image 2" loading="lazy" class="w-full h-full object-cover">
                </div>
              </div>
            `;
          } else {
            const img = remainingImages.shift();
            html += `
              <div class="my-12 rounded-3xl overflow-hidden shadow-lg border border-sand/30 bg-white max-h-[500px]">
                <img src="${img}" alt="${pageTitle} Details" title="${pageTitle} Details Image" loading="lazy" class="w-full h-full object-cover">
              </div>
            `;
          }
        }
      }

      // 3. BOTTOM BUTTONS
      if (bottomButtons.length > 0) {
        html += `
          <div class="mt-12 pt-6 border-t border-sand/10 flex flex-col gap-4 items-center sm:items-start">
            ${bottomButtons.map(btn => renderSpecialBlock(btn)).join('')}
          </div>
        `;
      }

      return html;
    }

    function renderGroupBlocks(group) {
      return group.map(block => {
        if (block.type === 'heading') {
          return `<h2 class="text-2xl md:text-3xl font-bold text-charcoal pt-4 pb-2 border-b border-sand/20" style="font-family: 'Oswald', sans-serif;">${block.value}</h2>`;
        } else if (block.type === 'subheading') {
          return `<h3 class="text-xl font-bold text-flame pt-2">${block.value}</h3>`;
        } else {
          const formattedPara = block.value.replace(/\n/g, '<br>');
          return `<p class="text-slate leading-relaxed text-sm md:text-base">${formattedPara}</p>`;
        }
      }).join('');
    }

    function renderSpecialBlock(block) {
      if (block.type === 'list') {
        const items = block.value.split('\n').map(i => i.trim()).filter(i => i.length > 0);
        return `
          <div class="my-8 bg-white p-6 rounded-3xl border border-sand/40 shadow-sm max-w-2xl">
            <ul class="space-y-2.5">
              ${items.map(item => `
                <li class="flex items-start gap-3">
                  <span class="w-2 h-2 rounded-full bg-flame mt-2 shrink-0"></span>
                  <span class="text-slate text-sm md:text-base font-semibold">${item}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      } else if (block.type === 'quote') {
        const parts = block.value.split('::');
        const quoteText = parts[0] || '';
        const quoteAuthor = parts[1] || '';
        return `
          <div class="my-10 p-6 md:p-8 bg-white border-l-4 border-flame rounded-r-3xl shadow-sm italic text-charcoal/90 text-base md:text-lg max-w-3xl">
            “${quoteText.trim()}”
            ${quoteAuthor ? `<span class="block text-xs font-bold text-slate mt-3 not-italic">— ${quoteAuthor.trim()}</span>` : ''}
          </div>
        `;
      } else if (block.type === 'button') {
        const parts = block.value.split('::');
        const btnText = parts[0] || '';
        const btnUrl = parts[1] || '';
        const targetUrl = btnUrl ? btnUrl.trim() : '#';
        const isExternal = targetUrl.startsWith('http');

        let onclickHandler = '';
        if (!isExternal && targetUrl.startsWith('#')) {
          const hashVal = targetUrl.replace('#', '');
          onclickHandler = `onclick="event.preventDefault(); window.switchView('${hashVal}')"`;
        }

        return `
          <div class="my-8 flex justify-start">
            <a href="${targetUrl}" ${onclickHandler} ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} 
               class="bg-flame hover:bg-flame/90 text-cream px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 inline-block">
              ${btnText.trim()}
            </a>
          </div>
        `;
      }
      return '';
    }

    window.initDynamicPages = async () => {
      try {
        const snapshot = await db.collection('pages').get();
        window.dynamicPages = snapshot.docs.map(doc => doc.data());
        window.renderDynamicNavLinks();
      } catch (err) {
        console.warn("Failed to load dynamic pages on init:", err);
      }
    };

    window.renderDynamicNavLinks = () => {
      // Clear any existing dynamic links in headers/footers
      document.querySelectorAll('.dynamic-page-link').forEach(el => el.remove());

      const headerNav = document.getElementById('header-nav-links');
      const mobileNav = document.getElementById('mobile-nav-links');
      const footerNav = document.getElementById('footer-nav-links');

      if (!window.dynamicPages) return;

      window.dynamicPages.forEach(p => {
        if (p.placement === 'header') {
          // 1. Desktop Header Navigation Link
          if (headerNav) {
            const link = document.createElement('a');
            link.href = `#${p.slug}`;
            link.className = "dynamic-page-link uppercase";
            link.innerText = p.title;
            link.onclick = (e) => {
              e.preventDefault();
              window.showDynamicPage(p.slug);
              window.closeAllDropdowns();
            };
            headerNav.appendChild(link);
          }

          // 2. Mobile Nav Drawer Link
          if (mobileNav) {
            const link = document.createElement('a');
            link.href = `#${p.slug}`;
            link.className = "dynamic-page-link block text-lg font-bold text-charcoal uppercase";
            link.innerText = p.title;
            link.onclick = (e) => {
              e.preventDefault();
              window.showDynamicPage(p.slug);
              window.toggleMobileMenu();
            };
            const authSection = document.getElementById('mobile-nav-auth-links');
            if (authSection) {
              mobileNav.insertBefore(link, authSection);
            } else {
              mobileNav.appendChild(link);
            }
          }
        }
      });
      lucide.createIcons();
    };

    window.showDynamicPage = (slug, pushState = true) => {
      window.showLandingContentSections(false);
      window.scrollTo({ top: 0, behavior: 'instant' });

      const page = window.dynamicPages.find(p => p.slug === slug);
      if (!page) {
        db.collection('pages').doc(slug).get().then(doc => {
          if (doc.exists) {
            window.renderPageContent(doc.data());
          } else {
            window.switchView('landing', false);
          }
        }).catch(err => {
          console.error("Error fetching dynamic page:", err);
          window.switchView('landing', false);
        });
      } else {
        window.renderPageContent(page);
      }

      if (pushState) {
        window.history.pushState({ view: 'dynamic', slug: slug }, "", "#" + slug);
      }
    };

    window.routeToBlogCategory = (cat) => {
      window.showBlogIndexPage(true);
      setTimeout(() => {
        const select = document.getElementById('blog-frontend-category');
        if (select) {
          select.value = cat;
          window.renderBlogIndex(cat);
        }
      }, 50);
    };

    window.renderPageContent = (page) => {
      const container = document.getElementById('dynamic-page-content-container');
      if (!container) return;

      // SEO optimization
      if (page.metaTitle) document.title = page.metaTitle;
      else document.title = page.title + " | FrameCraft Studio";

      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl && page.metaDescription) {
        metaDescEl.setAttribute('content', page.metaDescription);
      }

      // Hide the blog index screen so the article is visible!
      const blogSec = document.getElementById('blog-index-section');
      if (blogSec) blogSec.classList.add('hidden');

      const dynSection = document.getElementById('dynamic-page-section');
      if (dynSection) dynSection.classList.remove('hidden');

      // Step 1: Parse content if it exists, support old pages
      let textBlocks = [];
      if (page.content) {
        textBlocks = parsePastedContent(page.content);
      } else if (page.blocks) {
        textBlocks = page.blocks.filter(b => ['heading', 'subheading', 'paragraph'].includes(b.type));
      }

      // Step 2: Separate special blocks
      let specialBlocks = page.specialBlocks || [];
      if (!page.content && page.blocks) {
        specialBlocks = page.blocks.filter(b => ['list', 'quote', 'button'].includes(b.type));
      }

      // Step 3: Group text blocks
      const textGroups = groupTextBlocks(textBlocks);
      const images = page.images || [];

      // Step 4: Build visually distributed responsive layout
      let html = buildLayout(page.title, textGroups, images, specialBlocks);

      // Add Category Dropdown Button for Blogs Only
      if (page.type === 'blog') {
        const blogs = (window.dynamicPages || []).filter(p => p.type === 'blog');
        const categories = [...new Set(blogs.map(b => b.blogCategory).filter(Boolean))];

        const categoryDropdownHtml = `
             <div class="relative inline-block mb-6 z-50" id="blog-cat-dropdown-container">
                <button onclick="event.stopPropagation(); document.getElementById('blog-category-dropdown-menu').classList.toggle('hidden')" class="bg-white border border-sand shadow-sm text-charcoal px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:border-flame transition">
                   <i data-lucide="layers" class="w-4 h-4 text-flame"></i> Category: <span class="text-flame">${page.blogCategory || 'All'}</span> <i data-lucide="chevron-down" class="w-3 h-3 text-slate ml-1"></i>
                </button>
                <div id="blog-category-dropdown-menu" class="hidden absolute left-0 top-full mt-2 bg-white border border-sand rounded-xl shadow-xl p-2 min-w-[220px] transition-all transform origin-top-left">
                   <button onclick="window.routeToBlogCategory('')" class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate hover:bg-sand/20 rounded-lg transition">All Categories</button>
                   ${categories.map(c => `
                      <button onclick="window.routeToBlogCategory('${c.replace(/'/g, "\\'")}')" class="w-full text-left px-4 py-2.5 text-xs font-bold ${c === page.blogCategory ? 'text-flame bg-flame/10' : 'text-slate hover:bg-sand/20'} rounded-lg transition">${c}</button>
                   `).join('')}
                </div>
             </div>
          `;
        html = categoryDropdownHtml + html;
      }

      container.innerHTML = html;
      lucide.createIcons();
      if (window.initScrollAnimations) window.initScrollAnimations();
    };

    window.switchAdminCmsTab = (tab) => {
      document.getElementById('tab-cms-pages').className = "px-4 py-2 bg-editorbg text-slate border border-sand rounded-lg text-xs font-bold hover:bg-sand/30 transition";
      document.getElementById('tab-cms-blogs').className = "px-4 py-2 bg-editorbg text-slate border border-sand rounded-lg text-xs font-bold hover:bg-sand/30 transition";
      document.getElementById('view-cms-pages').classList.add('hidden');
      document.getElementById('view-cms-blogs').classList.add('hidden');

      document.getElementById('tab-cms-' + tab).className = "px-4 py-2 bg-charcoal text-cream rounded-lg text-xs font-bold transition";
      document.getElementById('view-cms-' + tab).classList.remove('hidden');
    };

    window.loadDynamicPagesTable = async () => {
      const pBody = document.getElementById('admin-pages-table-body');
      const bBody = document.getElementById('admin-blogs-table-body');
      if (!pBody || !bBody) return;

      pBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-slate font-bold"><i data-lucide="loader" class="w-5 h-5 animate-spin mx-auto text-flame"></i></td></tr>`;
      bBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-slate font-bold"><i data-lucide="loader" class="w-5 h-5 animate-spin mx-auto text-flame"></i></td></tr>`;
      lucide.createIcons();

      try {
        const snapshot = await db.collection('pages').orderBy('createdAt', 'desc').get();
        window.dynamicPages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        window.renderDynamicNavLinks();

        const pages = window.dynamicPages.filter(p => p.type !== 'blog');
        const blogs = window.dynamicPages.filter(p => p.type === 'blog');

        if (pages.length === 0) {
          pBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-slate font-bold">No static pages created yet.</td></tr>`;
        } else {
          pBody.innerHTML = pages.map(p => {
            const createdStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A';
            return `
              <tr class="hover:bg-sand/10 transition">
                <td class="px-6 py-4 font-black text-charcoal">${p.title}</td>
                <td class="px-6 py-4 font-mono text-xs text-flame">#${p.slug}</td>
                <td class="px-6 py-4 text-slate text-xs font-bold uppercase">${p.placement || 'hidden'}</td>
                <td class="px-6 py-4 text-slate text-xs">${createdStr}</td>
                <td class="px-6 py-4 text-right space-x-1">
                  <button onclick="window.previewDynamicPage('${p.slug}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mb-1 sm:mb-0">View</button>
                  <button onclick="window.openEditPageForm('${p.slug}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mb-1 sm:mb-0">Edit</button>
                  <button onclick="window.deleteDynamicPage('${p.slug}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-600 transition mb-1 sm:mb-0">Delete</button>
                  <button onclick="window.copyPageLink('${p.slug}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mb-1 sm:mb-0">Link</button>
                </td>
              </tr>
            `;
          }).join('');
        }

        if (blogs.length === 0) {
          bBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-slate font-bold">No blog posts created yet.</td></tr>`;
        } else {
          bBody.innerHTML = blogs.map(p => {
            const createdStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A';
            return `
              <tr class="hover:bg-sand/10 transition">
                <td class="px-6 py-4 font-black text-charcoal">${p.title}</td>
                <td class="px-6 py-4 font-bold text-slate text-xs"><span class="bg-flame/10 text-flame px-2 py-1 rounded">${p.blogCategory || 'Uncategorized'}</span></td>
                <td class="px-6 py-4 font-mono text-xs text-flame">#${p.slug}</td>
                <td class="px-6 py-4 text-slate text-xs">${createdStr}</td>
                <td class="px-6 py-4 text-right space-x-1">
                  <button onclick="window.previewDynamicPage('${p.slug}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mb-1 sm:mb-0">View</button>
                  <button onclick="window.openEditPageForm('${p.slug}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mb-1 sm:mb-0">Edit</button>
                  <button onclick="window.deleteDynamicPage('${p.slug}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-600 transition mb-1 sm:mb-0">Delete</button>
                  <button onclick="window.copyPageLink('${p.slug}')" class="px-3 py-1.5 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition mb-1 sm:mb-0">Link</button>
                </td>
              </tr>
            `;
          }).join('');
        }
      } catch (err) {
        pBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500 font-bold">Error: ${err.message}</td></tr>`;
      }
      lucide.createIcons();
    };

    window.previewDynamicPage = (slug) => {
      window.switchView(slug);
    };

    window.copyPageLink = (slug) => {
      const link = window.location.origin + window.location.pathname + "#" + slug;
      navigator.clipboard.writeText(link).then(() => {
        showToast("Shareable URL copied to clipboard!");
      }).catch(err => {
        alert("Copy failed: " + err.message);
      });
    };

    window.deleteDynamicPage = async (slug) => {
      if (!confirm("Are you sure you want to delete this content?")) return;
      showToast("Deleting content...");
      try {
        await db.collection('pages').doc(slug).delete();
        showToast("Deleted successfully.");
        await window.loadDynamicPagesTable();
      } catch (err) {
        alert("Error: " + err.message);
      }
    };

    window.toggleNewCategoryInput = () => {
      const select = document.getElementById('form-blog-category-select');
      const input = document.getElementById('form-blog-category-new');
      if (select.value === "") {
        input.classList.remove('hidden');
      } else {
        input.classList.add('hidden');
        input.value = '';
      }
    };

    window.populateBlogCategoriesSelect = () => {
      const select = document.getElementById('form-blog-category-select');
      const blogs = (window.dynamicPages || []).filter(p => p.type === 'blog');
      const categories = [...new Set(blogs.map(b => b.blogCategory).filter(Boolean))];

      select.innerHTML = '<option value="">-- Type a New Category --</option>' +
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
      window.toggleNewCategoryInput();
    };

    window.openCreatePageForm = (type = 'page') => {
      document.getElementById('pages-list-card').classList.add('hidden');
      document.getElementById('pages-form-card').classList.remove('hidden');

      const isBlog = type === 'blog';
      document.getElementById('page-form-title').innerText = isBlog ? "Create New Blog Post" : "Create New Page";
      document.getElementById('edit-page-id').value = '';
      document.getElementById('form-page-type').value = type;
      document.getElementById('page-edit-form').reset();

      const catContainer = document.getElementById('blog-category-container');
      if (isBlog) {
        catContainer.classList.remove('hidden');
        window.populateBlogCategoriesSelect();
      } else {
        catContainer.classList.add('hidden');
      }

      activePageImages = [];
      document.getElementById('form-blocks-container').innerHTML = '';
      document.getElementById('form-page-content').value = '';
      window.renderGalleryPreview();
    };

    window.openEditPageForm = (slug) => {
      const page = window.dynamicPages.find(p => p.slug === slug);
      if (!page) return;

      document.getElementById('pages-list-card').classList.add('hidden');
      document.getElementById('pages-form-card').classList.remove('hidden');

      const isBlog = page.type === 'blog';
      document.getElementById('page-form-title').innerText = isBlog ? "Edit Blog: " + page.title : "Edit Page: " + page.title;
      document.getElementById('edit-page-id').value = page.slug;
      document.getElementById('form-page-type').value = page.type || 'page';

      document.getElementById('form-page-title').value = page.title;
      document.getElementById('form-page-slug').value = page.slug;
      document.getElementById('form-page-meta-title').value = page.metaTitle || '';
      document.getElementById('form-page-meta-description').value = page.metaDescription || '';
      document.getElementById('form-page-placement').value = page.placement || 'header';

      const catContainer = document.getElementById('blog-category-container');
      if (isBlog) {
        catContainer.classList.remove('hidden');
        window.populateBlogCategoriesSelect();

        const select = document.getElementById('form-blog-category-select');
        const input = document.getElementById('form-blog-category-new');

        let found = false;
        Array.from(select.options).forEach(opt => {
          if (opt.value === page.blogCategory) {
            select.value = page.blogCategory;
            found = true;
          }
        });

        if (!found && page.blogCategory) {
          select.value = "";
          input.value = page.blogCategory;
        }
        window.toggleNewCategoryInput();
      } else {
        catContainer.classList.add('hidden');
      }

      // Load content
      let contentVal = '';
      if (page.content) {
        contentVal = page.content;
      } else if (page.blocks) {
        const textParts = [];
        page.blocks.forEach(b => {
          if (b.type === 'heading') textParts.push(`## ${b.value}`);
          else if (b.type === 'subheading') textParts.push(`### ${b.value}`);
          else if (b.type === 'paragraph') textParts.push(b.value);
        });
        contentVal = textParts.join('\n\n');
      }
      document.getElementById('form-page-content').value = contentVal;

      activePageImages = [...(page.images || [])];
      window.renderGalleryPreview();

      const blocksContainer = document.getElementById('form-blocks-container');
      blocksContainer.innerHTML = '';

      const specBlocks = page.specialBlocks || (page.blocks ? page.blocks.filter(b => ['list', 'quote', 'button'].includes(b.type)) : []);
      specBlocks.forEach(b => {
        window.addContentBlock(b.type, b.value);
      });
    };

    window.closePageForm = () => {
      document.getElementById('pages-list-card').classList.remove('hidden');
      document.getElementById('pages-form-card').classList.add('hidden');
    };

    window.autoGenerateSlug = (title) => {
      const isEdit = document.getElementById('edit-page-id').value !== '';
      if (isEdit) return;
      const slugInput = document.getElementById('form-page-slug');
      if (slugInput) {
        slugInput.value = title.toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    };

    window.saveDynamicPage = async (e) => {
      e.preventDefault();

      const title = document.getElementById('form-page-title').value.trim();
      const slug = document.getElementById('form-page-slug').value.trim().toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (!title || !slug) return alert("Please enter a valid Title and Slug.");

      const metaTitle = document.getElementById('form-page-meta-title').value.trim();
      const metaDescription = document.getElementById('form-page-meta-description').value.trim();
      const placement = document.getElementById('form-page-placement').value;
      const content = document.getElementById('form-page-content').value;
      const type = document.getElementById('form-page-type').value;

      let blogCategory = '';
      if (type === 'blog') {
        const selectCat = document.getElementById('form-blog-category-select').value;
        const newCat = document.getElementById('form-blog-category-new').value.trim();
        blogCategory = selectCat || newCat || 'Uncategorized';
      }

      // Extract special blocks
      const blockRows = Array.from(document.querySelectorAll('#form-blocks-container .block-row'));
      const specialBlocks = blockRows.map(row => {
        const type = row.dataset.type;
        let value = '';

        if (type === 'list') {
          const field = row.querySelector('.block-field-val');
          value = field ? field.value.trim() : '';
        } else if (type === 'quote') {
          const qText = row.querySelector('.block-quote-text').value.trim();
          const qAuthor = row.querySelector('.block-quote-author').value.trim();
          value = qAuthor ? `${qText}::${qAuthor}` : qText;
        } else if (type === 'button') {
          const bText = row.querySelector('.block-btn-text').value.trim();
          const bUrl = row.querySelector('.block-btn-url').value.trim();
          const bPlacement = row.querySelector('.block-btn-placement').value;
          value = `${bText}::${bUrl}::${bPlacement}`;
        }

        return { type, value };
      });

      const editPageId = document.getElementById('edit-page-id').value;

      showToast("Saving content...");
      try {
        const pageData = {
          type,
          title,
          slug,
          metaTitle,
          metaDescription,
          placement,
          content,
          images: activePageImages,
          specialBlocks,
          blogCategory: type === 'blog' ? blogCategory : null,
          updatedAt: new Date().toISOString()
        };

        if (editPageId) {
          if (editPageId !== slug) {
            await db.collection('pages').doc(editPageId).delete();
          }
          await db.collection('pages').doc(slug).set(pageData, { merge: true });
        } else {
          pageData.createdAt = new Date().toISOString();
          await db.collection('pages').doc(slug).set(pageData);
        }

        showToast("Saved successfully.");
        window.closePageForm();
        await window.loadDynamicPagesTable();
      } catch (err) {
        alert("Error saving: " + err.message);
      }
    };

    window.showBlogIndexPage = (pushState = true) => {
      window.showLandingContentSections(false);
      window.scrollTo({ top: 0, behavior: 'instant' });

      const blogSec = document.getElementById('blog-index-section');
      if (blogSec) blogSec.classList.remove('hidden');

      window.renderBlogIndex();

      if (pushState) {
        window.history.pushState({ view: 'blogs' }, "", "/blogs");
      }
    };

    window.renderBlogIndex = (filterCategory = '') => {
      const container = document.getElementById('blog-cards-container');
      const catDropdown = document.getElementById('blog-frontend-category');
      if (!container) return;

      const blogs = (window.dynamicPages || []).filter(p => p.type === 'blog');
      const categories = [...new Set(blogs.map(b => b.blogCategory).filter(Boolean))];

      if (catDropdown && catDropdown.options.length <= 1 && categories.length > 0) {
        catDropdown.innerHTML = `<option value="">All Categories</option>` +
          categories.map(c => `<option value="${c}">${c}</option>`).join('');
      }
      if (catDropdown) catDropdown.value = filterCategory;

      const filteredBlogs = filterCategory ? blogs.filter(b => b.blogCategory === filterCategory) : blogs;

      if (filteredBlogs.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-16 bg-white rounded-3xl border border-sand/50 shadow-sm mt-4"><i data-lucide="book-open" class="w-12 h-12 text-sand mx-auto mb-3"></i><p class="text-slate font-bold text-lg">No blogs found in this category.</p></div>`;
        lucide.createIcons();
        return;
      }

      container.innerHTML = filteredBlogs.map(b => {
        const img = (b.images && b.images.length > 0) ? b.images[0] : 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=400';
        const desc = b.metaDescription || b.content?.substring(0, 100) || 'Read more about this topic...';
        const date = b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '';
        return `
             <div class="bg-white rounded-3xl overflow-hidden border border-sand/50 shadow-sm hover:shadow-md transition flex flex-col group cursor-pointer h-full" onclick="window.handlePathRouting('/${b.slug}')">
                <div class="aspect-[4/3] overflow-hidden relative border-b border-sand/30">
                   <img src="${img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy">
                   <div class="absolute top-4 left-4 bg-charcoal text-cream text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md backdrop-blur-md">${b.blogCategory || 'Uncategorized'}</div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                   <span class="text-[10px] font-bold text-sand uppercase tracking-widest mb-2 block">${date}</span>
                   <h3 class="text-xl font-extrabold text-charcoal mb-3 line-clamp-2 leading-tight">${b.title}</h3>
                   <p class="text-sm text-slate mb-6 line-clamp-3 font-medium">${desc}</p>
                   <div class="mt-auto">
                      <button class="text-flame font-bold text-xs uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">Read Article <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>
                   </div>
                </div>
             </div>
          `;
      }).join('');
      lucide.createIcons();
    };

    window.addContentBlock = (type, value = '') => {
      const container = document.getElementById('form-blocks-container');
      if (!container) return;

      const blockId = 'block-' + generateId();
      let fieldsHtml = '';

      if (type === 'heading' || type === 'subheading') {
        fieldsHtml = `<input type="text" value="${value}" class="block-field-val w-full px-3.5 py-2.5 bg-white border border-sand rounded-xl font-semibold text-xs text-charcoal focus:outline-none focus:border-flame transition" placeholder="Enter heading text...">`;
      } else if (type === 'paragraph') {
        fieldsHtml = `<textarea rows="3" class="block-field-val w-full px-3.5 py-2.5 bg-white border border-sand rounded-xl font-semibold text-xs text-charcoal focus:outline-none focus:border-flame transition" placeholder="Enter paragraph content...">${value}</textarea>`;
      } else if (type === 'list') {
        fieldsHtml = `
          <p class="text-[9px] font-bold text-slate mb-1">Enter list items (one per line):</p>
          <textarea rows="3" class="block-field-val w-full px-3.5 py-2.5 bg-white border border-sand rounded-xl font-semibold text-xs text-charcoal focus:outline-none focus:border-flame transition" placeholder="Item 1\nItem 2">${value}</textarea>
        `;
      } else if (type === 'quote') {
        const parts = value.split('::');
        const qText = parts[0] || '';
        const qAuthor = parts[1] || '';
        fieldsHtml = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate mb-1 block">Quote Text</label>
              <textarea rows="2" class="block-quote-text w-full px-3.5 py-2.5 bg-white border border-sand rounded-xl font-semibold text-xs text-charcoal focus:outline-none focus:border-flame transition" placeholder="Quote...">${qText}</textarea>
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate mb-1 block">Author</label>
              <input type="text" value="${qAuthor}" class="block-quote-author w-full px-3.5 py-2.5 bg-white border border-sand rounded-xl font-semibold text-xs text-charcoal focus:outline-none focus:border-flame transition" placeholder="e.g. John Doe">
            </div>
          </div>
        `;
      } else if (type === 'button') {
        const parts = value.split('::');
        const bText = parts[0] || '';
        const bUrl = parts[1] || '';
        const bPlacement = parts[2] || 'bottom';
        fieldsHtml = `
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate mb-1 block">Button Label</label>
              <input type="text" value="${bText}" class="block-btn-text w-full px-3.5 py-2.5 bg-white border border-sand rounded-xl font-semibold text-xs text-charcoal focus:outline-none focus:border-flame transition" placeholder="e.g. Shop Now">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate mb-1 block">Button Link</label>
              <input type="text" value="${bUrl}" class="block-btn-url w-full px-3.5 py-2.5 bg-white border border-sand rounded-xl font-semibold text-xs text-charcoal focus:outline-none focus:border-flame transition" placeholder="e.g. #frames-section">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate mb-1 block">Button Placement</label>
              <select class="block-btn-placement w-full px-3.5 py-2.5 bg-white border border-sand rounded-xl font-semibold text-xs text-charcoal focus:outline-none focus:border-flame transition">
                <option value="top" ${bPlacement === 'top' ? 'selected' : ''}>Top of the Page</option>
                <option value="bottom" ${bPlacement === 'bottom' ? 'selected' : ''}>Bottom of the Page</option>
              </select>
            </div>
          </div>
        `;
      }

      const blockRow = document.createElement('div');
      blockRow.id = blockId;
      blockRow.className = "block-row flex items-start gap-4 bg-white p-4 rounded-xl border border-sand/40 shadow-sm relative";
      blockRow.dataset.type = type;

      blockRow.innerHTML = `
        <div class="flex-1 space-y-2">
          <span class="text-[9px] uppercase font-black text-flame tracking-wider">${type} Block</span>
          <div class="block-fields-wrap">${fieldsHtml}</div>
        </div>
        <div class="flex flex-col gap-1 shrink-0 pt-4">
          <button type="button" onclick="window.moveBlockUp('${blockId}')" class="p-1 hover:bg-editorbg rounded border border-sand/40 text-slate" title="Move Up"><i class="fa-solid fa-chevron-up text-xs"></i></button>
          <button type="button" onclick="window.moveBlockDown('${blockId}')" class="p-1 hover:bg-editorbg rounded border border-sand/40 text-slate" title="Move Down"><i class="fa-solid fa-chevron-down text-xs"></i></button>
          <button type="button" onclick="window.removeBlockRow('${blockId}')" class="p-1 hover:bg-red-50 rounded border border-red-200 text-red-500" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
        </div>
      `;

      container.appendChild(blockRow);
      lucide.createIcons();
    };

    window.removeBlockRow = (id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };

    window.moveBlockUp = (id) => {
      const el = document.getElementById(id);
      if (el && el.previousElementSibling) {
        el.parentNode.insertBefore(el, el.previousElementSibling);
      }
    };

    window.moveBlockDown = (id) => {
      const el = document.getElementById(id);
      if (el && el.nextElementSibling) {
        el.parentNode.insertBefore(el.nextElementSibling, el);
      }
    };

    window.addImageByUrl = () => {
      const url = prompt("Enter image URL:");
      if (url && url.trim().length > 0) {
        activePageImages.push(url.trim());
        window.renderGalleryPreview();
      }
    };

    window.uploadGalleryImage = async (input) => {
      const file = input.files[0];
      if (!file) return;

      showToast("Uploading page image...");
      try {
        const url = await uploadToCloudinary(file);
        activePageImages.push(url);
        window.renderGalleryPreview();
        showToast("Upload completed.");
      } catch (err) {
        alert("Image upload failed: " + err.message);
      }
      input.value = '';
    };

    window.removeGalleryImage = (idx) => {
      activePageImages.splice(idx, 1);
      window.renderGalleryPreview();
    };

    window.moveGalleryImage = (idx, dir) => {
      if (dir === 'left' && idx > 0) {
        const temp = activePageImages[idx];
        activePageImages[idx] = activePageImages[idx - 1];
        activePageImages[idx - 1] = temp;
      } else if (dir === 'right' && idx < activePageImages.length - 1) {
        const temp = activePageImages[idx];
        activePageImages[idx] = activePageImages[idx + 1];
        activePageImages[idx + 1] = temp;
      }
      window.renderGalleryPreview();
    };

    window.renderGalleryPreview = () => {
      const container = document.getElementById('form-gallery-preview');
      if (!container) return;

      if (activePageImages.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center text-slate/50 text-xs font-bold py-6">No gallery images added yet.</div>`;
        return;
      }

      container.innerHTML = activePageImages.map((img, idx) => `
        <div class="relative group aspect-square rounded-xl overflow-hidden border border-sand/40 shadow-sm bg-white">
          <img src="${img}" alt="CMS Page Gallery Preview" class="w-full h-full object-cover" loading="lazy">
          <div class="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button type="button" onclick="window.moveGalleryImage(${idx}, 'left')" class="p-1.5 bg-white/90 rounded text-charcoal hover:text-flame transition" title="Move Left"><i class="fa-solid fa-chevron-left text-xs"></i></button>
            <button type="button" onclick="window.moveGalleryImage(${idx}, 'right')" class="p-1.5 bg-white/90 rounded text-charcoal hover:text-flame transition" title="Move Right"><i class="fa-solid fa-chevron-right text-xs"></i></button>
            <button type="button" onclick="window.removeGalleryImage(${idx})" class="p-1.5 bg-red-500 rounded text-cream hover:bg-red-600 transition" title="Delete"><i class="fa-solid fa-trash-can text-xs"></i></button>
          </div>
        </div>
      `).join('');
    };

    // Global Order Timeline and tracking data definitions
    const TIMELINE_STAGES = [
      { key: 'Pending', label: 'Order Placed', icon: 'file-text' },
      { key: 'Payment Confirmed', label: 'Payment Confirmed', icon: 'credit-card' },
      { key: 'Order Confirmed', label: 'Order Confirmed', icon: 'clipboard-check' },
      { key: 'Frame Preparation', label: 'Frame Prep', icon: 'hammer' },
      { key: 'Printing', label: 'Printing Artwork', icon: 'printer' },
      { key: 'Packing', label: 'Packing Frame', icon: 'box' },
      { key: 'Quality Check', label: 'Quality Check', icon: 'shield-check' },
      { key: 'Shipped', label: 'Shipped', icon: 'truck' },
      { key: 'Out For Delivery', label: 'Out For Delivery', icon: 'map-pin' },
      { key: 'Delivered', label: 'Delivered', icon: 'check-circle' }
    ];

    function getStageIndex(status) {
      let normalized = status;
      if (status === 'Confirming Order') normalized = 'Order Confirmed';
      if (status === 'Out for Shipment') normalized = 'Shipped';
      if (status === 'Canceled') return -1;

      return TIMELINE_STAGES.findIndex(s => s.key === normalized);
    }

    function generateTimelineHTML(currentStatus) {
      let activeIndex = getStageIndex(currentStatus);
      if (currentStatus === 'Canceled') {
        return `
           <div class="bg-red-50 text-red-700 border border-red-200 p-5 rounded-2xl flex items-center gap-3 font-bold text-sm">
              <i data-lucide="x-circle" class="w-5 h-5 shrink-0 text-red-600"></i>
              This order has been canceled.
           </div>
         `;
      }

      let html = `<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 relative min-w-[700px] md:min-w-0 py-2">`;

      TIMELINE_STAGES.forEach((stage, idx) => {
        const isCompleted = idx < activeIndex;
        const isActive = idx === activeIndex;

        let dotClass = '';
        let textClass = '';
        let lineClass = '';

        if (isCompleted) {
          dotClass = 'bg-flame border-flame text-cream';
          textClass = 'text-charcoal font-bold';
          lineClass = 'bg-flame';
        } else if (isActive) {
          dotClass = 'bg-white border-flame text-flame shadow-md scale-110';
          textClass = 'text-flame font-black';
          lineClass = 'bg-sand';
        } else {
          dotClass = 'bg-white border-sand text-slate';
          textClass = 'text-slate font-medium';
          lineClass = 'bg-sand';
        }

        const connector = idx < TIMELINE_STAGES.length - 1
          ? `<div class="hidden md:block absolute left-[calc(50%+16px)] right-[calc(-50%+16px)] top-4 h-0.5 ${lineClass} z-0"></div>`
          : '';

        html += `
           <div class="flex md:flex-col items-center gap-3 md:gap-1.5 flex-1 w-full text-left md:text-center relative">
              ${connector}
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition duration-300 z-10 ${dotClass}">
                 ${isCompleted ? '<i data-lucide="check" class="w-4 h-4"></i>' : `<i data-lucide="${stage.icon}" class="w-4 h-4"></i>`}
              </div>
              <div class="flex flex-col">
                 <span class="text-[9px] uppercase tracking-wider ${textClass}">${stage.label}</span>
              </div>
           </div>
         `;
      });

      html += `</div>`;
      return html;
    }

    let myOrders = [];

    window.loadUserOrders = async () => {
      if (!currentUser) return;
      try {
        const ordersSnap = await db.collection('orders').where('uid', '==', currentUser.uid).get();
        myOrders = ordersSnap.docs.map(doc => doc.data());
      } catch (err) {
        console.error("Error loading user orders:", err);
        myOrders = [];
      }
    };

    window.showOrdersTrackingPage = async (pushState = true) => {
      if (!currentUser) {
        pendingAction = 'orders';
        toggleModal('login-modal');
        return;
      }

      await window.loadUserOrders();
      window.showLandingContentSections(false);

      const ordersSec = document.getElementById('orders-tracking-section');
      if (ordersSec) ordersSec.classList.remove('hidden');

      window.filterAndRenderOrders();
      window.scrollTo({ top: 0, behavior: 'instant' });

      if (pushState) {
        window.history.pushState({ view: 'orders-tracking' }, "", "#orders-tracking");
      }
    };

    window.showUserProfilePage = async (pushState = true) => {
      if (!currentUser) { toggleModal('login-modal'); return; }

      window.showLandingContentSections(false);
      const profileSec = document.getElementById('user-profile-section');
      if (profileSec) profileSec.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Populate Data
      document.getElementById('profile-page-avatar').innerText = currentUser.name.charAt(0).toUpperCase();
      document.getElementById('profile-page-name').innerText = currentUser.name;
      document.getElementById('profile-page-email').innerText = currentUser.email;

      await window.loadUserOrders();
      document.getElementById('profile-page-orders-count').innerText = myOrders.length;
      document.getElementById('profile-page-projects-count').innerText = myProjects.length;

      if (pushState) window.history.pushState({ view: 'user-profile' }, "", "#user-profile");
    };

    window.showUserSettingsPage = (pushState = true) => {
      if (!currentUser) { toggleModal('login-modal'); return; }

      window.showLandingContentSections(false);
      const settingsSec = document.getElementById('user-settings-section');
      if (settingsSec) settingsSec.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });

      if (pushState) window.history.pushState({ view: 'user-settings' }, "", "#user-settings");
    };

    window.updateUserPassword = async () => {
      const oldPass = document.getElementById('settings-old-pass').value;
      const newPass = document.getElementById('settings-new-pass').value;
      if (newPass.length < 6) return showToast("New password must be at least 6 characters.");

      try {
        const user = firebase.auth().currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPass);

        document.getElementById('settings-old-pass').value = '';
        document.getElementById('settings-new-pass').value = '';
        showToast("Password updated successfully!");
      } catch (error) {
        showToast("Error updating password: " + error.message);
      }
    };

    function renderOrderCard(o) {
      let itemsCount = o.orderedProducts ? o.orderedProducts.reduce((sum, p) => sum + (p.qty || 1), 0) : 1;
      let statusBadgeClass = 'bg-sand/30 text-slate';
      if (o.status === 'Delivered') statusBadgeClass = 'bg-green-100 text-green-800';
      else if (o.status === 'Canceled') statusBadgeClass = 'bg-red-100 text-red-800';
      else if (o.status === 'Shipped' || o.status === 'Out for Shipment') statusBadgeClass = 'bg-blue-100 text-blue-800';
      else if (o.status === 'Order Confirmed' || o.status === 'Confirming Order') statusBadgeClass = 'bg-purple-100 text-purple-800';

      let trackingInfoHtml = '';
      if (o.status === 'Shipped' || o.status === 'Out for Shipment' || o.status === 'Delivered') {
        trackingInfoHtml = `
            <div class="mt-4 bg-editorbg p-3.5 rounded-xl border border-sand/50 inline-block w-full">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate block mb-1">Shipping Tracking Information</span>
                <div class="flex items-center gap-2">
                    <i data-lucide="truck" class="w-4 h-4 text-flame"></i>
                    <span class="text-sm font-extrabold text-charcoal">${o.shippingCompany || 'Standard Carrier'}</span>
                    <span class="text-slate mx-1">—</span>
                    <span class="text-sm font-mono text-flame tracking-wide font-bold">${o.trackingNumber || 'Tracking not available'}</span>
                </div>
            </div>
          `;
      }

      return `
        <div class="bg-white p-6 rounded-3xl border border-sand/50 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div class="space-y-2 flex-1 w-full">
                <div class="flex items-center gap-3">
                    <span class="text-lg font-extrabold text-charcoal">#${o.id}</span>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold ${statusBadgeClass}">${o.status}</span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm font-medium text-slate mt-2">
                    <div><span class="text-xs font-bold uppercase tracking-wider text-slate/60">Date:</span><br><span class="text-charcoal">${o.date}</span></div>
                    <div><span class="text-xs font-bold uppercase tracking-wider text-slate/60">Total:</span><br><span class="text-flame font-bold">${o.total}</span></div>
                    <div><span class="text-xs font-bold uppercase tracking-wider text-slate/60">Items:</span><br><span class="text-charcoal">${itemsCount}</span></div>
                    <div><span class="text-xs font-bold uppercase tracking-wider text-slate/60">Est. Delivery:</span><br><span class="text-charcoal">${o.estimatedDelivery || 'N/A'}</span></div>
                </div>
                ${trackingInfoHtml}
            </div>
            <div class="w-full md:w-auto shrink-0 self-stretch flex items-center">
                <button onclick="openOrderDetailView('${o.id}')" class="w-full md:w-auto px-6 py-3 md:py-2.5 bg-editorbg hover:bg-sand/30 border border-sand rounded-xl font-bold text-sm text-charcoal hover:border-charcoal transition text-center block">View Details</button>
            </div>
        </div>
      `;
    }

    window.filterAndRenderOrders = () => {
      const container = document.getElementById('orders-list-container');
      if (!container) return;

      const searchVal = document.getElementById('order-search-input').value.trim().toLowerCase();
      const filterVal = document.getElementById('order-filter-status').value;
      const sortVal = document.getElementById('order-sort-by').value;

      let list = [...myOrders];

      if (searchVal) {
        list = list.filter(o => o.id.toLowerCase().includes(searchVal));
      }

      if (filterVal !== 'ALL') {
        list = list.filter(o => o.status === filterVal);
      }

      if (sortVal === 'NEWEST') {
        list.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
      } else if (sortVal === 'OLDEST') {
        list.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeA - timeB;
        });
      } else if (sortVal === 'STATUS_DELIVERED') {
        list = list.filter(o => o.status === 'Delivered');
      } else if (sortVal === 'STATUS_PENDING') {
        list = list.filter(o => o.status === 'Pending');
      } else if (sortVal === 'STATUS_CANCELLED') {
        list = list.filter(o => o.status === 'Canceled');
      }

      if (list.length === 0) {
        if (myOrders.length === 0) {
          container.innerHTML = `
               <div class="text-center py-16 bg-white rounded-3xl border border-sand/50 shadow-sm">
                  <i data-lucide="package-open" class="w-16 h-16 text-sand mx-auto mb-4"></i>
                  <h3 class="text-xl font-extrabold text-charcoal mb-2">You haven't placed any orders yet.</h3>
                  <p class="text-sm text-slate mb-6">Create your first custom frame project and place an order to see it tracked here.</p>
                  <button onclick="scrollToSection('frames-section')" class="px-6 py-2.5 bg-flame text-cream font-bold text-sm rounded-xl hover:bg-flame/90 transition shadow-sm">Browse Products</button>
               </div>
             `;
        } else {
          container.innerHTML = `
               <div class="text-center py-12 bg-white rounded-3xl border border-sand/50 shadow-sm">
                  <i data-lucide="search" class="w-12 h-12 text-sand mx-auto mb-3"></i>
                  <h3 class="text-lg font-bold text-charcoal mb-1">No matching orders found.</h3>
                  <p class="text-sm text-slate">Try adjusting your search query or filters.</p>
               </div>
             `;
        }
        lucide.createIcons();
        return;
      }

      container.innerHTML = list.map(o => renderOrderCard(o)).join('');
      lucide.createIcons();
    };

    window.openOrderDetailView = (id) => {
      const o = myOrders.find(order => order.id === id);
      if (!o) return;

      if (o.uid !== currentUser.uid) {
        alert("Security Error: Unauthorized access attempt.");
        return;
      }

      document.getElementById('detail-order-id-title').innerText = `ORDER DETAILS - #${o.id}`;
      document.getElementById('detail-order-date-subtitle').innerText = `Placed on ${o.date}`;
      document.getElementById('detail-timeline-container').innerHTML = generateTimelineHTML(o.status);

      document.getElementById('detail-customer-name').innerText = o.customer || '';
      document.getElementById('detail-customer-email').innerText = o.email || '';
      document.getElementById('detail-customer-phone').innerText = o.phone || '';

      let payStatusColor = 'bg-sand/30 text-slate';
      if (o.paymentStatus === 'Paid' || o.paymentStatus === 'Success') payStatusColor = 'bg-green-100 text-green-800';
      else if (o.paymentStatus === 'Failed') payStatusColor = 'bg-red-100 text-red-800';

      document.getElementById('detail-payment-method').innerText = o.paymentMethod || 'CARD';
      const payStatusEl = document.getElementById('detail-payment-status');
      payStatusEl.innerText = o.paymentStatus || 'Pending';
      payStatusEl.className = `px-2 py-0.5 rounded text-xs font-bold ${payStatusColor}`;

      const carrierInfoEl = document.getElementById('detail-shipping-carrier-info');
      if (o.status === 'Shipped' || o.status === 'Out for Shipment' || o.status === 'Delivered') {
        carrierInfoEl.classList.remove('hidden');
        carrierInfoEl.classList.add('block');
        document.getElementById('detail-carrier-text').innerText = `${o.shippingCompany || 'Standard Carrier'} — ${o.trackingNumber || 'N/A'}`;
      } else {
        carrierInfoEl.classList.add('hidden');
        carrierInfoEl.classList.remove('block');
      }

      document.getElementById('detail-shipping-address').innerHTML = `
         <p class="font-bold text-charcoal mb-2">Delivery Address:</p>
         <p>${o.address || 'N/A'}</p>
      `;

      const productsListEl = document.getElementById('detail-products-list');
      productsListEl.innerHTML = (o.orderedProducts || []).map(p => {
        let c = p.customization || o.customization || {};
        let frameStr = c.frame || 'Standard Frame';
        let sizeStr = c.size?.name || 'Original size';
        let colorStr = c.colour?.name || 'Original color';
        let thickStr = c.thickness ? `${c.thickness}mm` : 'Standard thickness';

        return `
           <div class="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-sand/5 transition">
              <div class="space-y-1">
                 <div class="font-bold text-charcoal text-base">${p.title || 'Product'}</div>
                 <div class="text-xs font-bold text-slate uppercase">
                    Frame: <span class="text-charcoal">${frameStr}</span> | 
                    Size: <span class="text-charcoal">${sizeStr}</span> | 
                    Finish: <span class="text-charcoal">${colorStr}</span> | 
                    Profile: <span class="text-charcoal">${thickStr}</span>
                 </div>
              </div>
              <div class="text-right shrink-0">
                 <span class="text-sm text-slate font-bold">${p.qty || 1} x ${window.appCurrency || '$'}${(p.cost || 0).toFixed(2)}</span>
              </div>
           </div>
         `;
      }).join('');

      let safeTotal = 0;
      if (typeof o.total === 'string') safeTotal = parseFloat(o.total.replace(/[^0-9.]/g, '')) || 0;
      else if (typeof o.total === 'number') safeTotal = o.total;

      document.getElementById('detail-subtotal').innerText = `${window.appCurrency || '$'}${o.baseAmount ? o.baseAmount.toFixed(2) : safeTotal.toFixed(2)}`;
      document.getElementById('detail-shipping').innerText = `${window.appCurrency || '$'}${o.shippingCharges ? o.shippingCharges.toFixed(2) : '0.00'}`;
      document.getElementById('detail-grand-total').innerText = `${window.appCurrency || '$'}${safeTotal.toFixed(2)}`;

      toggleModal('order-details-modal');
      lucide.createIcons();
    };

    // --- DYNAMIC SEO META ENGINE & CLEAN PATH ROUTER ---

    // 1. Helper: Slugify product name
    function slugify(text) {
      if (!text) return "";
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }

    // 2. Base JSON-LD Structured Data Schema Schemas
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${window.location.origin}/#organization`,
      "name": "FrameCraft Studio",
      "url": window.location.origin,
      "logo": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%23252422'/><text x='50' y='72' font-family='Arial' font-size='68' font-weight='bold' fill='%23eb5e28' text-anchor='middle'>F</text></svg>",
      "sameAs": [
        "https://facebook.com",
        "https://instagram.com",
        "https://x.com",
        "https://wa.me/923001234567"
      ]
    };

    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${window.location.origin}/#localbusiness`,
      "name": "FrameCraft Studio",
      "image": `${window.location.origin}/home.png`,
      "priceRange": "$$",
      "telephone": "+1-555-123-4567",
      "email": "hello@framecraft.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Frame Street, Artisan Quarter",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "postalCode": "94103",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 37.7749,
        "longitude": -122.4194
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday"],
          "opens": "10:00",
          "closes": "16:00"
        }
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${window.location.origin}/#website`,
      "url": window.location.origin,
      "name": "FrameCraft Studio",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/products?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    function getBreadcrumbSchema(items) {
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url ? (window.location.origin + item.url) : window.location.origin
        }))
      };
    }

    // 3. Helper: Render visual breadcrumbs inside DOM elements
    function renderVisualBreadcrumbs(items, containerId = 'seo-breadcrumbs-container') {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast) {
          return `<span class="text-charcoal font-black" aria-current="page">${item.name}</span>`;
        } else {
          return `<a href="${item.url}" onclick="event.preventDefault(); window.handlePathRouting('${item.url}')" class="text-slate hover:text-flame transition">${item.name}</a>
                  <span class="text-sand/70 font-normal mx-1"><i class="fa-solid fa-chevron-right text-[8px]"></i></span>`;
        }
      }).join('');
    }

    // 4. Central Dynamic SEO Metadata Engine
    window.updateSEOMetadata = function (options = {}) {
      const origin = window.location.origin;
      const path = options.path || window.location.pathname;
      const canonicalUrl = origin + path;

      const title = options.title || "FrameCraft Studio | Online Bespoke Picture Framing & Custom Dimension Workspace";
      const description = options.description || "Design bespoke custom picture frames online. Enter exact millimeter dimensions, choose from solid oak, walnut, and modern metal materials, and customize artisan frame templates. Our gallery-grade physical frames are handcrafted in our workshop and delivered directly to your door.";
      const keywords = options.keywords || "custom framing studio, bespoke picture frames, millimeter precision frames, online frame customizer, solid wood picture frames, museum glass framing, picture frame templates, web-to-print frames, custom size frames";
      const robots = options.robots || "index, follow";
      const ogType = options.ogType || "website";
      const ogImage = options.ogImage || (origin + "/home.png");

      // Set Document Title
      document.title = title;

      // Set Charset, Viewport, Theme Color statically on HTML head, but dynamic update:
      let themeColorEl = document.querySelector('meta[name="theme-color"]');
      if (!themeColorEl) {
        themeColorEl = document.createElement('meta');
        themeColorEl.setAttribute('name', 'theme-color');
        themeColorEl.setAttribute('content', '#2b3d46');
        document.head.appendChild(themeColorEl);
      }

      // Meta helper
      function setMeta(name, content, isProperty = false) {
        let el = isProperty
          ? document.querySelector(`meta[property="${name}"]`)
          : document.querySelector(`meta[name="${name}"]`);

        if (el) {
          el.setAttribute('content', content);
        } else {
          el = document.createElement('meta');
          el.setAttribute(isProperty ? 'property' : 'name', name);
          el.setAttribute('content', content);
          document.head.appendChild(el);
        }
      }

      setMeta('description', description);
      setMeta('keywords', keywords);
      setMeta('robots', robots);

      // Canonical Link tag
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (canonicalEl) {
        canonicalEl.setAttribute('href', canonicalUrl);
      } else {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        canonicalEl.setAttribute('href', canonicalUrl);
        document.head.appendChild(canonicalEl);
      }

      // Open Graph Tags
      setMeta('og:title', title, true);
      setMeta('og:description', description, true);
      setMeta('og:image', ogImage, true);
      setMeta('og:url', canonicalUrl, true);
      setMeta('og:type', ogType, true);
      setMeta('og:site_name', "FrameCraft Studio", true);

      // Twitter Cards Tags
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', title);
      setMeta('twitter:description', description);
      setMeta('twitter:image', ogImage);
      setMeta('twitter:url', canonicalUrl);

      // Inject JSON-LD Schema
      let schemaEl = document.getElementById('seo-jsonld');
      if (schemaEl) schemaEl.remove();

      if (options.schema) {
        schemaEl = document.createElement('script');
        schemaEl.id = 'seo-jsonld';
        schemaEl.type = 'application/ld+json';
        schemaEl.text = JSON.stringify(options.schema, null, 2);
        document.head.appendChild(schemaEl);
      }
    };

    // 5. CENTRAL PATH ROUTER
    window.handlePathRouting = function (pathname, pushHistoryState = true) {
      if (typeof window.closeMobileMenu === 'function') {
        window.closeMobileMenu();
      }
      const origin = window.location.origin;

      let cleanPath = pathname || "/";
      if (cleanPath.endsWith('/') && cleanPath !== '/') {
        cleanPath = cleanPath.slice(0, -1);
      }

      // Dynamic dynamic pages match
      const cmsPage = window.dynamicPages && window.dynamicPages.find(p => "/" + p.slug === cleanPath);

      // Individual products match
      let productId = null;
      let isProductPath = false;
      if (cleanPath.startsWith('/products/')) {
        productId = cleanPath.substring('/products/'.length);
        isProductPath = true;
      }

      if (cleanPath === "/" || cleanPath === "") {
        window.switchView('landing', false);
        window.scrollToSection('hero');

        window.updateSEOMetadata({
          title: "FrameCraft Studio | Online Bespoke Picture Framing & Custom Dimension Workspace",
          description: "Design bespoke custom picture frames online. Enter exact millimeter dimensions, choose from solid oak, walnut, and modern metal materials, and customize artisan frame templates. Our gallery-grade physical frames are handcrafted in our workshop and delivered directly to your door.",
          path: "/",
          schema: [orgSchema, localBusinessSchema, websiteSchema]
        });
      }
      else if (cleanPath === "/products") {
        window.switchView('landing', false);
        window.scrollToSection('frames-section');

        window.updateSEOMetadata({
          title: "Premium Custom Picture Frames Collection | FrameCraft Studio",
          description: "Explore our collection of hand-crafted solid wood and modern metal picture frames. Available in custom dimensions with museum-grade glass.",
          path: "/products",
          schema: [
            getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Products', url: '/products' }])
          ]
        });
        renderVisualBreadcrumbs([{ name: 'Home', url: '/' }, { name: 'Products', url: '/products' }]);
      }
      else if (cleanPath === "/about-us") {
        window.switchView('landing', false);
        window.scrollToSection('about-section');

        window.updateSEOMetadata({
          title: "About Our Artisan Framing Workshop | FrameCraft Studio",
          description: "Learn about FrameCraft Studio's heritage, our artisan custom framing workshop, and our commitment to museum-grade picture framing.",
          path: "/about-us",
          schema: [
            getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'About Us', url: '/about-us' }])
          ]
        });
        renderVisualBreadcrumbs([{ name: 'Home', url: '/' }, { name: 'About Us', url: '/about-us' }]);
      }
      else if (cleanPath === "/blogs") {
        window.switchView('landing', false);
        window.showBlogIndexPage(false);

        window.updateSEOMetadata({
          title: "Design Insights & Articles | FrameCraft Studio Blog",
          description: "Explore our latest articles, guides, and inspiration on custom framing, interior design, and protecting your cherished artwork.",
          path: "/blogs",
          schema: [
            getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blogs' }])
          ]
        });
        renderVisualBreadcrumbs([{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blogs' }]);
      }
      else if (cleanPath === "/contact") {
        window.switchView('landing', false);
        window.scrollToSection('contact-section');

        window.updateSEOMetadata({
          title: "Contact FrameCraft Studio | Custom Framing Customer Support",
          description: "Get in touch with our team for questions about bespoke frames, bulk orders, or custom projects. Phone: (555) 123-4567, Email: support@framecraft.com.",
          path: "/contact",
          schema: [
            getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }])
          ]
        });
        renderVisualBreadcrumbs([{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]);
      }
      else if (cleanPath === "/faq") {
        window.showLandingContentSections(false);
        const faq = document.getElementById('faq-section');
        if (faq) faq.classList.remove('hidden');

        // Heading optimization: exactly one H1 when standalone
        const faqHeader = document.querySelector('#faq-section h2');
        if (faqHeader) {
          const h1 = document.createElement('h1');
          h1.className = faqHeader.className;
          h1.style.cssText = faqHeader.style.cssText;
          h1.innerHTML = faqHeader.innerHTML;
          faqHeader.replaceWith(h1);
        }

        const faqItems = [];
        document.querySelectorAll('.faq-item').forEach(item => {
          const question = item.querySelector('button span').textContent.trim();
          const answer = item.querySelector('.faq-answer p').textContent.trim();
          faqItems.push({
            "@type": "Question",
            "name": question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": answer
            }
          });
        });

        window.updateSEOMetadata({
          title: "Frequently Asked Questions | FrameCraft Studio Picture Framing",
          description: "Have questions about our custom picture frames, pricing, dimensions, or shipping? Read our detailed FAQs to learn more.",
          path: "/faq",
          schema: [
            getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'FAQ', url: '/faq' }]),
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqItems
            }
          ]
        });
        renderVisualBreadcrumbs([{ name: 'Home', url: '/' }, { name: 'FAQ', url: '/faq' }]);
      }
      else if (cleanPath === "/order-tracking" || cleanPath === "/orders-tracking") {
        if (!currentUser) {
          pendingAction = 'orders';
          window.handlePathRouting("/", true);
          toggleModal('login-modal');
          return;
        }
        window.showLandingContentSections(false);
        const tracking = document.getElementById('orders-tracking-section');
        if (tracking) tracking.classList.remove('hidden');

        window.loadUserOrders().then(() => {
          window.filterAndRenderOrders();
        });

        window.updateSEOMetadata({
          title: "Track Your Custom Frame Order | FrameCraft Studio",
          description: "Enter your order reference number to track the manufacturing and shipment status of your bespoke picture frame in real-time.",
          path: "/order-tracking",
          robots: "noindex, nofollow"
        });
        renderVisualBreadcrumbs([{ name: 'Home', url: '/' }, { name: 'Order Tracking', url: '/order-tracking' }]);
      }
      else if (cleanPath === "/custom-frame-design") {
        window.switchView('editor', false);
        window.updateSEOMetadata({
          title: "Bespoke Frame Builder & Customizer Workspace | FrameCraft Studio",
          description: "Create your museum-grade custom frame in real-time. Enter millimeter-precision dimensions, select profile materials, and add custom mounts.",
          path: "/custom-frame-design",
          schema: [
            getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Custom Frame Design', url: '/custom-frame-design' }])
          ]
        });
      }
      else if (cleanPath === "/dashboard") {
        window.switchView('dashboard', false);
        window.updateSEOMetadata({
          title: "My Projects Dashboard | FrameCraft Studio",
          path: "/dashboard",
          robots: "noindex, nofollow"
        });
      }
      else if (cleanPath === "/checkout") {
        if (!currentUser) {
          window.handlePathRouting("/", true);
          toggleModal('login-modal');
          return;
        }
        window.switchView('checkout', false);
        window.updateSEOMetadata({
          title: "Secure Checkout | Order Custom Frames | FrameCraft Studio",
          path: "/checkout",
          robots: "noindex, nofollow"
        });
        renderVisualBreadcrumbs([{ name: 'Home', url: '/' }, { name: 'Checkout', url: '/checkout' }]);
      }
      else if (cleanPath === "/admin") {
        if (!currentUser || currentUser.role !== 'admin') {
          window.handlePathRouting("/", true);
          return;
        }
        window.switchView('admin', false);
        toggleAdminSection('dashboard');
        window.updateSEOMetadata({
          title: "Admin Operations Dashboard | FrameCraft Studio",
          path: "/admin",
          robots: "noindex, nofollow"
        });
      }
      else if (cleanPath === "/user-profile") {
        if (!currentUser) { toggleModal('login-modal'); return; }
        window.showLandingContentSections(false);
        const profileSec = document.getElementById('user-profile-section');
        if (profileSec) profileSec.classList.remove('hidden');
        window.updateSEOMetadata({
          title: "My Profile | FrameCraft Studio",
          path: "/user-profile",
          robots: "noindex, nofollow"
        });
      }
      else if (cleanPath === "/user-settings") {
        if (!currentUser) { toggleModal('login-modal'); return; }
        window.showLandingContentSections(false);
        const settingsSec = document.getElementById('user-settings-section');
        if (settingsSec) settingsSec.classList.remove('hidden');
        window.updateSEOMetadata({
          title: "My Settings | FrameCraft Studio",
          path: "/user-settings",
          robots: "noindex, nofollow"
        });
      }
      else if (isProductPath && productId) {
        window.showLandingContentSections(false);

        const resolveAndShowProduct = () => {
          let product = productTemplates.find(p => p.id === productId || slugify(p.name) === productId);
          if (!product) {
            const defaultProducts = [
              { id: 'default-1', name: 'CLASSIC WOOD', price: 45.00, images: ['https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=800&h=800'] },
              { id: 'default-2', name: 'MODERN METAL', price: 55.00, images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800&h=800'] },
              { id: 'default-3', name: 'GALLERY WRAP', price: 65.00, images: ['https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&q=80&w=800&h=800'] },
              { id: 'default-4', name: 'ORNATE GOLD', price: 85.00, images: ['https://images.unsplash.com/photo-1550584488-06764ee714a6?auto=format&fit=crop&q=80&w=800&h=800'] }
            ];
            product = defaultProducts.find(p => p.id === productId || p.name === productId || slugify(p.name) === productId);
          }
          if (product) {
            window.activeProductRouting = true;
            window.renderProductDetail(product);
            window.activeProductRouting = false;

            const prodName = product.name;
            const prodPrice = product.price;
            const origin = window.location.origin;
            const canonicalUrl = origin + cleanPath;
            const prodImage = (product.images && product.images[0]) || (product.frameImage) || (origin + "/home.png");

            const productSchema = {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": prodName,
              "image": prodImage,
              "description": product.description || `Artisan hand-crafted custom dimension ${prodName} picture frame template. Made to order at millimeter precision.`,
              "brand": {
                "@type": "Brand",
                "name": "FrameCraft Studio"
              },
              "offers": {
                "@type": "Offer",
                "price": prodPrice,
                "priceCurrency": window.appCurrency || "USD",
                "availability": "https://schema.org/InStock",
                "url": canonicalUrl
              }
            };

            window.updateSEOMetadata({
              title: `${prodName} - Bespoke Custom Framed Picture | FrameCraft Studio`,
              description: `Design and order your bespoke ${prodName} custom frame. Available in solid wood and metal finishes with custom dimensions. Handcrafted with museum-grade acrylic glass.`,
              path: cleanPath,
              ogImage: prodImage,
              ogType: "product",
              schema: [
                getBreadcrumbSchema([
                  { name: 'Home', url: '/' },
                  { name: 'Products', url: '/products' },
                  { name: prodName, url: cleanPath }
                ]),
                productSchema
              ]
            });

            renderVisualBreadcrumbs([
              { name: 'Home', url: '/' },
              { name: 'Products', url: '/products' },
              { name: prodName, url: cleanPath }
            ], 'product-detail-modal-breadcrumbs');
          } else {
            window.handlePathRouting("/products", true);
          }
        };

        resolveAndShowProduct();
      }
      else if (cmsPage) {
        window.switchView('landing', false);
        window.showLandingContentSections(false);
        window.renderPageContent(cmsPage);

        window.updateSEOMetadata({
          title: cmsPage.metaTitle || (cmsPage.title + " | FrameCraft Studio"),
          description: cmsPage.metaDescription || `${cmsPage.title} custom page at FrameCraft Studio.`,
          path: cleanPath,
          schema: [
            getBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: cmsPage.title, url: cleanPath }
            ])
          ]
        });
        renderVisualBreadcrumbs([
          { name: 'Home', url: '/' },
          { name: cmsPage.title, url: cleanPath }
        ]);
      }
      else {
        window.switchView('landing', false);
        window.history.replaceState({ view: 'landing' }, "", "/");
        window.updateSEOMetadata({
          title: "FrameCraft Studio | Online Bespoke Picture Framing & Custom Dimension Workspace",
          description: "Design bespoke custom picture frames online. Enter exact millimeter dimensions, choose from solid oak, walnut, and modern metal materials, and customize artisan frame templates.",
          path: "/",
          schema: [orgSchema, localBusinessSchema, websiteSchema]
        });
      }

      if (pushHistoryState && window.location.pathname !== cleanPath) {
        window.history.pushState({ view: cleanPath }, "", cleanPath);
      }
    };

    // 6. ADAPTED switchView (Delegates to cleaner paths for dynamic states)
    window.switchView = function (targetId, pushHistoryState = true) {
      if (targetId === 'admin') {
        if (!currentUser || currentUser.role !== 'admin') {
          window.handlePathRouting("/", false);
          return;
        }
      }
      if (['cart', 'checkout', 'user-profile', 'user-settings', 'orders-tracking'].includes(targetId)) {
        if (!currentUser) {
          pendingAction = targetId === 'cart' ? 'open-cart' : (targetId === 'orders-tracking' ? 'orders' : targetId);
          window.handlePathRouting("/", false);
          toggleModal('login-modal');
          return;
        }
      }

      if (targetId === 'faq') {
        window.handlePathRouting("/faq", pushHistoryState);
        return;
      }
      if (targetId === 'orders-tracking') {
        window.handlePathRouting("/order-tracking", pushHistoryState);
        return;
      }
      if (targetId === 'user-profile') {
        window.handlePathRouting("/user-profile", pushHistoryState);
        return;
      }
      if (targetId === 'user-settings') {
        window.handlePathRouting("/user-settings", pushHistoryState);
        return;
      }
      if (window.dynamicPages && window.dynamicPages.some(p => p.slug === targetId)) {
        window.handlePathRouting("/" + targetId, pushHistoryState);
        return;
      }

      const views = ['landing', 'dashboard', 'editor', 'admin', 'checkout'];
      views.forEach(v => {
        const el = document.getElementById(v + '-view');
        if (el) el.classList.add('hidden');
      });

      if (targetId === 'landing') {
        window.showLandingContentSections(true);
      }
      if (targetId === 'dashboard') {
        switchDashboardTab('templates');
      }

      const target = document.getElementById(targetId + '-view');
      if (target) target.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });

      const floatingBtn = document.getElementById('floating-cart-btn');
      const dashboardBtn = document.getElementById('dashboard-cart-btn');
      const headerNavCartBtn = document.getElementById('header-nav-cart-btn');
      const headerNavOrdersBtn = document.getElementById('header-nav-orders-btn');

      const showCart = ['dashboard', 'editor', 'checkout'].includes(targetId);
      if (floatingBtn) {
        if (showCart) {
          floatingBtn.classList.remove('hidden');
          floatingBtn.classList.add('md:flex');
        } else {
          floatingBtn.classList.add('hidden');
          floatingBtn.classList.remove('md:flex');
        }
      }
      if (dashboardBtn) {
        dashboardBtn.style.display = showCart ? 'flex' : 'none';
      }
      if (headerNavCartBtn) {
        if (targetId === 'editor') {
          headerNavCartBtn.classList.add('hidden');
          headerNavCartBtn.classList.remove('flex');
        } else {
          headerNavCartBtn.classList.remove('hidden');
          headerNavCartBtn.classList.add('flex');
        }
      }
      if (headerNavOrdersBtn) {
        if (targetId === 'editor') {
          headerNavOrdersBtn.classList.add('hidden');
          headerNavOrdersBtn.classList.remove('flex');
        } else {
          headerNavOrdersBtn.classList.remove('hidden');
          headerNavOrdersBtn.classList.add('flex');
        }
      }

      let cleanPath = "/";
      if (targetId === "landing") cleanPath = "/";
      else if (targetId === "dashboard") cleanPath = "/dashboard";
      else if (targetId === "editor") cleanPath = "/custom-frame-design";
      else if (targetId === "checkout") cleanPath = "/checkout";
      else if (targetId === "admin") cleanPath = "/admin";

      if (pushHistoryState && window.location.pathname !== cleanPath) {
        try {
          window.history.pushState({ view: cleanPath }, "", cleanPath);
        } catch (e) {
          console.warn("Failed to push history state:", e);
        }
        window.handlePathRouting(cleanPath, false);
      }
    };

    window.addEventListener('popstate', function (e) {
      if (e.state && e.state.view) {
        window.handlePathRouting(window.location.pathname, false);
      } else {
        window.handlePathRouting(window.location.pathname || "/", false);
      }
    });

    window.addEventListener('DOMContentLoaded', async () => {
      // Init CMS engine
      try {
        await window.initCms();
      } catch (err) {
        console.error("CMS Initialization failed:", err);
      }

      // 1. Initial dynamic CMS pages
      await window.initDynamicPages();

      // 2. Load settings and products dynamically first
      try {
        const doc = await db.collection('settings').doc('site').get();
        if (doc.exists) {
          siteSettings = doc.data();
          applySiteSettings();
        }
        await loadProductsForLanding();
        await window.renderLandingCategories(); // Inject the dynamic categories here
      } catch (error) {
        console.error('Initialization error during dynamic load:', error);
      }

      // 3. Backwards hash compatibility redirect
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        let cleanPath = "/";
        if (hash === "faq") cleanPath = "/faq";
        else if (hash === "orders-tracking") cleanPath = "/order-tracking";
        else if (hash === "user-profile") cleanPath = "/user-profile";
        else if (hash === "user-settings") cleanPath = "/user-settings";
        else if (hash === "checkout") cleanPath = "/checkout";
        else if (hash === "dashboard") cleanPath = "/dashboard";
        else if (hash === "editor") cleanPath = "/custom-frame-design";
        else if (hash === "admin") cleanPath = "/admin";
        else if (hash.startsWith("landing/")) {
          const section = hash.split('/')[1];
          if (section === "hero") cleanPath = "/";
          else if (section === "frames-section") cleanPath = "/products";
          else if (section === "about-section") cleanPath = "/about-us";
          else if (section === "contact-section") cleanPath = "/contact";
          else cleanPath = "/" + section;
        } else if (window.dynamicPages && window.dynamicPages.some(p => p.slug === hash)) {
          cleanPath = "/" + hash;
        } else {
          cleanPath = "/products/" + hash;
        }
        window.history.replaceState({ view: cleanPath }, "", cleanPath);
      }

      // 4. Initial path routing execution
      window.handlePathRouting(window.location.pathname, false);

      // Initialize dropdown toggle events
      document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const container = this.parentElement;
          const wasActive = container.classList.contains('active');
          window.closeAllDropdowns();
          if (!wasActive) {
            container.classList.add('active');
          }
        });
      });

      // Add subtle movement to cinematic background modals
      document.addEventListener('mousemove', (e) => {
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        if ((loginModal && !loginModal.classList.contains('hidden')) || (signupModal && !signupModal.classList.contains('hidden'))) {
          const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
          const moveY = (e.clientY - window.innerHeight / 2) * 0.005;
          if (loginModal) loginModal.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
          if (signupModal) signupModal.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
        }
      });
    });

    window.closeAllDropdowns = () => {
      document.querySelectorAll('.nav-dropdown-container').forEach(c => c.classList.remove('active'));
      const blogMenu = document.getElementById('blog-category-dropdown-menu');
      if (blogMenu) blogMenu.classList.add('hidden');
    };

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-dropdown-container') && !e.target.closest('#blog-cat-dropdown-container')) {
        window.closeAllDropdowns();
      }
    });

    // --- CORRECTIONS LAYER: INSTANT SINGLE-CLICK SCROLL ROUTER ---
    window.scrollToSection = function (sectionId) {
      if (typeof event !== 'undefined') event.preventDefault();
      window.showLandingContentSections(true);
      const isLandingHidden = document.getElementById('landing-view').classList.contains('hidden');

      if (isLandingHidden) {
        window.switchView('landing', true);
        setTimeout(() => {
          performSmoothScroll(sectionId);
        }, 150);
      } else {
        performSmoothScroll(sectionId);
      }
    };

    function performSmoothScroll(id) {
      const targetEl = document.getElementById(id);
      if (targetEl) {
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        if (window.history.state?.view === 'landing') {
          window.history.replaceState({ view: 'landing', section: id }, "", "#landing/" + id);
        }
      }
    }

    // --- ACTIVE INTERACTION SCROLL OBSERVER ---
    window.addEventListener('scroll', () => {
      if (document.getElementById('landing-view').classList.contains('hidden')) return;
      const faq = document.getElementById('faq-section');
      if (faq && !faq.classList.contains('hidden')) return;
      const ordersSec = document.getElementById('orders-tracking-section');
      if (ordersSec && !ordersSec.classList.contains('hidden')) return;

      const sections = ['hero', 'frames-section', 'about-section', 'contact-section'];
      const scrollPos = window.scrollY + 120;

      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;

          let path = '/';
          if (id === 'frames-section') path = '/products';
          else if (id === 'about-section') path = '/about-us';
          else if (id === 'contact-section') path = '/contact';

          const navAnchor = document.querySelector(`.landing-nav a[href="${path}"]`);
          if (navAnchor && scrollPos >= top && scrollPos < top + height) {
            document.querySelectorAll('.landing-nav a').forEach(a => a.style.color = '');
            navAnchor.style.color = 'var(--btn-color, #eb5e28)';

            // Dynamically update URL path and SEO meta tags when scrolling on landing page
            if (window.location.pathname !== path && (!window.history.state || window.history.state.view === '/' || window.history.state.view === '/products' || window.history.state.view === '/about-us' || window.history.state.view === '/contact')) {
              window.history.replaceState({ view: path }, "", path);

              let title = "";
              let description = "";
              if (path === '/') {
                title = "FrameCraft Studio | Online Bespoke Picture Framing & Custom Dimension Workspace";
                description = "Design bespoke custom picture frames online. Enter exact millimeter dimensions, choose from solid oak, walnut, and modern metal materials, and customize artisan frame templates.";
              } else if (path === '/products') {
                title = "Premium Custom Picture Frames Collection | FrameCraft Studio";
                description = "Explore our collection of hand-crafted solid wood and modern metal picture frames. Available in custom dimensions with museum-grade glass.";
              } else if (path === '/about-us') {
                title = "About Our Artisan Framing Workshop | FrameCraft Studio";
                description = "Learn about FrameCraft Studio's heritage, our artisan custom framing workshop, and our commitment to museum-grade picture framing.";
              } else if (path === '/contact') {
                title = "Contact FrameCraft Studio | Custom Framing Customer Support";
                description = "Get in touch with our team for questions about bespoke frames, bulk orders, or custom projects.";
              }

              window.updateSEOMetadata({
                title: title,
                description: description,
                path: path
              });
            }
          }
        }
      });
    });

    function toggleModal(id) {
      const modal = document.getElementById(id);

      if (id === 'cart-modal') {
        const slide = document.getElementById('cart-slide');
        if (modal.classList.contains('hidden')) {
          if (!currentUser) {
            pendingAction = 'open-cart';
            toggleModal('login-modal');
            return;
          }
          modal.classList.remove('hidden');
          void modal.offsetWidth;
          slide.classList.remove('translate-x-full');
          slide.classList.add('translate-x-0');
        } else {
          slide.classList.remove('translate-x-0');
          slide.classList.add('translate-x-full');
          setTimeout(() => {
            modal.classList.add('hidden');
          }, 300);
        }
        return;
      }

      if (id === 'order-details-modal') {
        const content = document.getElementById('order-details-modal-content');
        if (modal.classList.contains('hidden')) {
          modal.classList.remove('hidden');
          void modal.offsetWidth;
          content.classList.remove('scale-95', 'opacity-0');
          content.classList.add('scale-100', 'opacity-100');
        } else {
          content.classList.remove('scale-100', 'opacity-100');
          content.classList.add('scale-95', 'opacity-0');
          setTimeout(() => {
            modal.classList.add('hidden');
          }, 200);
        }
        return;
      }

      if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
        if (id === 'product-detail-modal') {
          if (window.location.pathname.startsWith('/products/')) {
            try {
              window.history.pushState({ view: '/products' }, "", "/products");
            } catch (e) {
              console.warn("Failed to push history state:", e);
            }
            window.handlePathRouting("/products", false);
          }
        }
      }
    }

    let currentUser = null;
    let pendingAction = null;
    let cartItems = [];
    let myProjects = [];
    let myGallery = [];
    let globalOrders = [];
    let currentProjectId = null;

    function generateId() {
      return Math.random().toString(36).substr(2, 9);
    }

    async function loadGlobalAssets() {
      const snapshot = await db.collection('assets').orderBy('createdAt', 'desc').get();
      const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const framesContainer = document.getElementById('cat-frames');
      const decorContainer = document.getElementById('cat-decor');
      const textureContainer = document.getElementById('cat-textures');

      const frames = assets.filter(a => a.category === 'frames');
      const decor = assets.filter(a => a.category === 'decor');
      const textures = assets.filter(a => a.category === 'textures');

      if (textureContainer) {
        textureContainer.innerHTML = textures.length > 0
          ? `<div class="grid grid-cols-2 gap-3">` + textures.map(t => `<button onclick="applyBgTexture('${t.imageURL}')" class="aspect-square bg-editorbg rounded-xl border border-sand/50 overflow-hidden cursor-pointer hover:border-flame transition p-2 flex items-center justify-center"><img src="${t.imageURL}" class="max-w-full max-h-full object-cover pointer-events-none"></button>`).join('') + `</div>`
          : `<p class="text-xs font-bold text-slate text-center mt-4">Background textures added by admin will appear here.</p>`;
      }

      if (framesContainer) {
        framesContainer.innerHTML = frames.length > 0
          ? `<div id="frame-customization-panel" class="hidden mb-4 p-3 rounded-xl bg-editorbg border border-sand/50 space-y-3"><div><p class="text-[10px] font-black text-slate uppercase tracking-wider">Frame Size</p><div id="frame-size-options" class="flex flex-wrap gap-2 mt-2"></div></div><div><p class="text-[10px] font-black text-slate uppercase tracking-wider">Frame Colour</p><div id="frame-colour-options" class="flex flex-wrap gap-2 mt-2"></div></div><div id="frame-thickness-control" class="hidden"><div class="flex justify-between text-[10px] font-black text-slate uppercase tracking-wider"><span>Frame Thickness</span><span id="frame-thickness-value">100%</span></div><input id="frame-thickness-slider" type="range" min="70" max="150" value="100" class="w-full accent-flame mt-2" oninput="applyFrameThickness(this.value)"></div></div><div class="grid grid-cols-2 gap-3">` + frames.map(f => `<button onclick="selectManagedFrame('${f.productId || f.id}')" class="aspect-square bg-editorbg rounded-xl border border-sand/50 overflow-hidden cursor-pointer hover:border-flame transition p-2 flex flex-col items-center justify-center"><img src="${f.imageURL}" class="max-w-full max-h-full object-contain pointer-events-none"><span class="text-[9px] font-bold text-charcoal mt-1 truncate max-w-full">${f.name || 'Custom Frame'}</span></button>`).join('') + `</div>`
          : `<p class="text-xs font-bold text-slate text-center mt-4">Product frame templates will appear here.</p>`;
      }
      if (decorContainer) {
        decorContainer.innerHTML = decor.length > 0
          ? `<div class="grid grid-cols-2 gap-3">` + decor.map(d => `<button onclick="addGalleryImageToCanvas('${d.imageURL}', ${d.cost || 0}, '${d.name || 'Decor Item'}')" class="aspect-square bg-editorbg rounded-xl border border-sand/50 overflow-hidden cursor-pointer hover:border-flame transition p-2 flex items-center justify-center"><img src="${d.imageURL}" class="max-w-full max-h-full object-contain pointer-events-none"></button>`).join('') + `</div>`
          : `<p class="text-xs font-bold text-slate text-center mt-4">Decoration items added by admin will appear here.</p>`;
      }
    }

    window.updateCartItemQuantity = async (id, delta) => {
      const item = cartItems.find(i => i.id === id);
      if (!item) return;
      const currentQty = item.quantity || item.qty || 1;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        window.removeFromCart(id);
      } else {
        item.quantity = newQty;
        item.qty = newQty;
        updateCartUI();
        if (currentUser) {
          try {
            await db.collection('users').doc(currentUser.uid).collection('cart').doc(id).set({ quantity: newQty, qty: newQty }, { merge: true });
          } catch (e) { }
        }
      }
    };

    function updateCartUI() {
      const container = document.getElementById('cart-items-container');
      const subtotalEl = document.getElementById('cart-subtotal');
      const totalEl = document.getElementById('cart-total');
      if (!container) return;

      if (cartItems.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 font-serif text-lg mt-12">Your cart is empty.</div>`;
        if (subtotalEl) subtotalEl.innerText = `${window.appCurrency || '$'}0.00`;
        if (totalEl) totalEl.innerText = `${window.appCurrency || '$'}0.00`;
        return;
      }

      container.innerHTML = cartItems.map(item => {
        const unitCost = parseFloat(item.cost) || 0;
        const qty = item.quantity || item.qty || 1;
        const itemTotal = unitCost * qty;
        const imgUrl = item.imageURL || item.image || item.preview || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80';
        const sizeText = item.size || item.dimensions || (item.customization ? `${item.customization.width || 16}×${item.customization.height || 20}"` : '16×20"');

        return `
          <div class="flex items-start gap-5 py-2">
            <img src="${imgUrl}" alt="${item.title}" class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-none bg-gray-100 shrink-0 border border-gray-200/50">
            <div class="flex-1 flex flex-col justify-between min-h-[96px] sm:min-h-[112px]">
              <div>
                <h4 class="font-bold text-[#111111] text-[15px] leading-tight">${item.title || 'Custom Frame'}</h4>
                <p class="text-xs text-gray-500 mt-1 font-normal">Size: ${sizeText}</p>
              </div>
              <div class="flex items-center justify-between mt-auto pt-2">
                <div class="border border-gray-300 bg-[#f9f8f6] flex items-center gap-3 px-3 py-1 text-xs select-none">
                  <button type="button" onclick="updateCartItemQuantity('${item.id}', -1)" class="cursor-pointer hover:opacity-60 text-gray-700 px-1 font-medium">-</button>
                  <span class="font-medium text-gray-900 px-1">${qty}</span>
                  <button type="button" onclick="updateCartItemQuantity('${item.id}', 1)" class="cursor-pointer hover:opacity-60 text-gray-700 px-1 font-medium">+</button>
                </div>
                <span class="font-bold text-[#111111] text-[16px] sm:text-[17px] ml-auto">${window.appCurrency || '$'}${itemTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      const cartCalculatedSumTotal = cartItems.reduce((sum, item) => {
        const cost = parseFloat(item.cost) || 0;
        const q = item.quantity || item.qty || 1;
        return sum + (cost * q);
      }, 0);

      const formattedTotal = `${window.appCurrency || '$'}${cartCalculatedSumTotal.toFixed(2)}`;
      if (subtotalEl) subtotalEl.innerText = formattedTotal;
      if (totalEl) totalEl.innerText = formattedTotal;
      if (window.lucide) lucide.createIcons();
    }

    // MOBILE NAV DRAWER HELPERS
    window.closeMobileMenu = () => {
      const modal = document.getElementById('mobile-nav-drawer');
      const slide = document.getElementById('mobile-nav-slide');
      if (modal && slide && !modal.classList.contains('hidden')) {
        slide.classList.remove('translate-x-0');
        slide.classList.add('translate-x-full');
        modal.classList.add('opacity-0');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
      }
    };

    window.toggleMobileMenu = () => {
      const modal = document.getElementById('mobile-nav-drawer');
      const slide = document.getElementById('mobile-nav-slide');
      if (!modal || !slide) return;
      if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        void modal.offsetWidth; // trigger reflow
        modal.classList.remove('opacity-0');
        slide.classList.remove('translate-x-full');
        slide.classList.add('translate-x-0');
      } else {
        window.closeMobileMenu();
      }
    };

    // Safe global fetcher to prevent index crashes
    window.fetchGlobalOrders = async () => {
      try {
        const ordersSnap = await db.collection('orders').get();
        globalOrders = ordersSnap.docs.map(doc => doc.data()).sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA; // Safe descending sort
        });
      } catch (error) {
        console.error("Error fetching global orders:", error);
        globalOrders = [];
      }
    };

    // FIREBASE REALTIME AUTH LISTENER
    firebase.auth().onAuthStateChanged(async (user) => {
      loadGlobalAssets();

      if (user) {
        // Prevent partial login state if unverified via email/pass
        if (!user.emailVerified && user.providerData && user.providerData.some(p => p.providerId === 'password')) {
          return;
        }

        let userDoc = await db.collection('users').doc(user.uid).get();
        let role = 'user';
        let privileges = [];

        if (userDoc.exists) {
          const data = userDoc.data();
          if (data.isBlocked) {
            await firebase.auth().signOut();
            showToast("Your account has been blocked by the administrator.");
            return;
          }
          role = data.role || 'user';
          privileges = data.privileges || [];
        } else {
          await db.collection('users').doc(user.uid).set({
            email: user.email,
            name: user.displayName || "Google User",
            role: 'user',
            isBlocked: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }

        currentUser = { uid: user.uid, email: user.email, name: user.displayName || "User", role: role, privileges: privileges };
        window.currentUser = currentUser;

        if (typeof attachGlobalChatListeners === 'function') attachGlobalChatListeners(currentUser);

        if (role === 'admin') {
          document.getElementById('nav-auth-buttons').innerHTML = `
                <button onclick="toggleMobileMenu()" class="md:hidden p-2 mr-2 text-charcoal hover:text-flame transition"><i data-lucide="menu" class="w-6 h-6"></i></button>
                <div class="w-10 h-10 rounded-full bg-flame text-cream flex items-center justify-center font-bold shadow-md cursor-pointer" onclick="handleLogout()" title="Logout">A</div>
          `;

          // Enforce Privileges Strictly
          if (currentUser.uid !== 'admin_uid') {
            const adminTabs = ['dashboard', 'orders', 'products', 'sales', 'pages', 'customers', 'settings'];
            adminTabs.forEach(tab => {
              const btn = document.getElementById('btn-adm-' + tab);
              if (btn) {
                if (!privileges.includes(tab)) btn.classList.add('hidden');
                else btn.classList.remove('hidden');
              }
            });

            if (privileges.length > 0) {
              if (!privileges.includes('dashboard')) {
                toggleAdminSection(privileges[0]); // Open first available tab
              } else {
                toggleAdminSection('dashboard');
              }
            } else {
              // If they somehow have no privileges, hide the content area to be safe
              toggleAdminSection('none');
              showToast("Your account has no assigned privileges.");
            }
          } else {
            // Master Admin sees all
            const adminTabs = ['dashboard', 'orders', 'products', 'sales', 'pages', 'customers', 'settings'];
            adminTabs.forEach(tab => {
              const btn = document.getElementById('btn-adm-' + tab);
              if (btn) btn.classList.remove('hidden');
            });
            toggleAdminSection('dashboard');
          }

          switchView('admin');
          return;
        }

        // Hide auth buttons inside the mobile drawer since they are logged in
        const mobileAuthLinks = document.getElementById('mobile-nav-auth-links');
        if (mobileAuthLinks) mobileAuthLinks.classList.add('hidden');

        // INJECT THE RIGHT-TO-LEFT SEQUENCE: Order Tracking -> Cart -> Mobile Menu -> Profile Dropdown
        if (window.renderDynamicRightActionButtons) {
          window.renderDynamicRightActionButtons();
        }

        // Global click listener to close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          const profileMenu = document.getElementById('profile-dropdown-menu');
          if (profileMenu && !profileMenu.classList.contains('hidden') && !e.target.closest('#nav-auth-buttons')) {
            profileMenu.classList.add('hidden');
          }
        });
        lucide.createIcons();

        await window.loadUserOrders();

        const projSnap = await db.collection('projects').where('userID', '==', currentUser.uid).get();
        myProjects = projSnap.docs.map(doc => doc.data());
        if (!document.getElementById('dash-projects-sec').classList.contains('hidden')) renderMyProjects();

        const galSnap = await db.collection('users').doc(currentUser.uid).collection('uploads').orderBy('uploadedAt', 'desc').get();
        myGallery = galSnap.docs.map(doc => doc.data().imageURL);
        renderUserGallery();

        const cartSnap = await db.collection('users').doc(currentUser.uid).collection('cart').get();
        cartItems = cartSnap.docs.map(doc => doc.data());
        updateCartUI();

        if (pendingAction === 'open-cart') { toggleModal('cart-modal'); pendingAction = null; }
        if (pendingAction === 'cart') { handleAddToCart(); pendingAction = null; }
        if (pendingAction === 'buy') { handleBuyNow(); pendingAction = null; }
        if (pendingAction === 'orders') { window.showOrdersTrackingPage(); pendingAction = null; }
        if (pendingAction === 'chat') { window.toggleUserChat(); pendingAction = null; }

      } else {
        currentUser = null;
        window.currentUser = null;
        if (typeof attachGlobalChatListeners === 'function') attachGlobalChatListeners(null);
        myProjects = [];
        myGallery = [];
        cartItems = [];
        updateCartUI();

        // Show auth links inside the mobile drawer
        const mobileAuthLinks = document.getElementById('mobile-nav-auth-links');
        if (mobileAuthLinks) mobileAuthLinks.classList.remove('hidden');

        if (window.renderDynamicRightActionButtons) {
          window.renderDynamicRightActionButtons();
        }
        lucide.createIcons();

        // Protected view routing guard on logout/unauthenticated state
        const protectedViews = ['admin', 'dashboard', 'checkout', 'user-profile', 'user-settings'];
        const currentHash = window.location.hash.replace('#', '');
        if (protectedViews.includes(currentHash)) {
          window.switchView('landing', false);
          window.history.replaceState({ view: 'landing' }, "", "#landing");
        }
      }
    });

    async function handleGoogleAuth() {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await firebase.auth().signInWithPopup(provider);

        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('signup-modal').classList.add('hidden');
        showToast("Logged in with Google successfully!");
      } catch (error) {
        console.error(error);
        showToast("Google Auth failed: " + error.message);
      }
    }

    function showToast(message) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');

      // Auto-detect if the message is an error based on keywords
      const lowerMsg = message.toLowerCase();
      const isError = lowerMsg.includes('error') || lowerMsg.includes('fail') ||
        lowerMsg.includes('invalid') || lowerMsg.includes('cannot') ||
        lowerMsg.includes('please') || lowerMsg.includes('not ');

      // Set dynamic styles and icons based on type
      const bgClass = isError ? 'bg-red-50 border-red-500 text-red-900' : 'bg-green-50 border-green-500 text-green-900';
      const icon = isError
        ? '<i data-lucide="x-circle" class="w-6 h-6 text-red-600 shrink-0"></i>'
        : '<i data-lucide="check-circle" class="w-6 h-6 text-green-600 shrink-0"></i>';

      // Enhanced Toast UI classes
      toast.className = `${bgClass} px-6 py-4 rounded-xl shadow-2xl border-l-4 font-bold text-sm flex items-center gap-3 transform transition-all duration-300 translate-x-full opacity-0 max-w-sm`;
      toast.innerHTML = `${icon} <span class="leading-tight">${message}</span>`;

      container.appendChild(toast);
      lucide.createIcons();

      setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
      }, 10);

      setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }



    async function handleLogin() {
      const emailInput = document.getElementById('login-email').value.trim().toLowerCase();
      const pass = document.getElementById('login-pass').value;

      if (emailInput === 'admin' && pass === 'admin123') {
        currentUser = { uid: 'admin_uid', email: 'admin', name: 'Admin', role: 'admin' };

        document.getElementById('nav-auth-buttons').innerHTML = `<div class="w-10 h-10 rounded-full bg-flame text-cream flex items-center justify-center font-bold shadow-md cursor-pointer" onclick="handleLogout()" title="Logout">A</div>`;
        toggleModal('login-modal');
        switchView('admin');

        showToast("Welcome back to the Admin Portal!");
        return;
      }

      try {
        const userCred = await firebase.auth().signInWithEmailAndPassword(emailInput, pass);
        const user = userCred.user;

        if (!user.emailVerified) {
          await firebase.auth().signOut();
          showToast("Please verify your email before logging in.");
          return;
        }

        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().isBlocked) {
          await firebase.auth().signOut();
          showToast("Your account has been blocked by the administrator.");
          return;
        }

        toggleModal('login-modal');
        showToast("Welcome back to the Studio!");
      } catch (error) {
        console.error(error);
        alert("Error logging in: " + error.message);
      }
    }

    async function handleSignup() {
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const pass = document.getElementById('signup-pass').value;

      const localImages = myGallery.filter(url => url.startsWith('blob:'));

      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        await user.updateProfile({ displayName: name });

        await db.collection('users').doc(user.uid).set({
          email: user.email,
          name: name,
          role: 'user',
          isBlocked: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (localImages.length > 0) {
          showToast("Syncing your local designs to the cloud...");
          for (let url of localImages) {
            try {
              let blob = await fetch(url).then(r => r.blob());
              let secureUrl = await uploadToCloudinary(blob);
              await db.collection('users').doc(user.uid).collection('uploads').add({
                imageURL: secureUrl,
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
              });
            } catch (syncErr) {
              console.error("Could not sync local image", syncErr);
            }
          }
        }

        // Trigger email verification and enter polling state
        await user.sendEmailVerification();

        document.getElementById('signup-action-buttons').classList.add('hidden');
        document.getElementById('signup-pending-container').classList.remove('hidden');
        document.getElementById('signup-pending-container').classList.add('flex');

        // Ensure button is un-clickable until verified
        const pendingLoginBtn = document.getElementById('signup-pending-login-btn');
        if (pendingLoginBtn) {
          pendingLoginBtn.disabled = true;
          pendingLoginBtn.className = "w-full bg-sand/30 text-slate py-3.5 rounded-xl font-extrabold text-lg transition cursor-not-allowed";
        }

        let verifyPoll = setInterval(async () => {
          await user.reload();
          if (user.emailVerified) {
            clearInterval(verifyPoll);

            const pendingContainer = document.getElementById('signup-pending-container');
            pendingContainer.innerHTML = `
                   <i data-lucide="check-circle" class="w-10 h-10 text-green-500 mb-3"></i>
                   <h3 class="text-lg font-bold text-charcoal mb-1">Verified!</h3>
                   <p class="text-xs font-medium text-slate mb-5">Your email is verified successfully.</p>
               `;
            lucide.createIcons();

            setTimeout(async () => {
              await firebase.auth().signOut(); // Force them to log in cleanly via the login screen
              toggleModal('signup-modal');
              toggleModal('login-modal');

              // Reset UI for next time
              document.getElementById('signup-action-buttons').classList.remove('hidden');
              document.getElementById('signup-pending-container').classList.add('hidden');
              document.getElementById('signup-pending-container').classList.remove('flex');

              // Restore original pending HTML inside the container
              document.getElementById('signup-pending-container').innerHTML = `
                     <i data-lucide="loader-2" class="w-10 h-10 text-flame animate-spin mb-3"></i>
                     <h3 class="text-lg font-bold text-charcoal mb-1">Pending...</h3>
                     <p class="text-xs font-medium text-slate mb-5">We've sent a verification link to your email. Please click it to verify your account. Waiting for confirmation...</p>
                     <button id="signup-pending-login-btn" disabled class="w-full bg-sand/30 text-slate py-3.5 rounded-xl font-extrabold text-lg transition cursor-not-allowed">Log In</button>
                   `;
              document.getElementById('signup-name').value = '';
              document.getElementById('signup-email').value = '';
              document.getElementById('signup-pass').value = '';
            }, 2000);
          }
        }, 2500);

        return; // Halt further execution, polling handles it
      } catch (error) {
        console.error(error);
        alert("Error signing up: " + error.message);
      }
    }

    async function handleLogout() {
      try {
        await firebase.auth().signOut();
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem('framecraft_currentUser');
      currentUser = null;
      window.location.href = window.location.origin + window.location.pathname + '#landing';
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }

    window.removeFromCart = async (id) => {
      try {
        await db.collection('users').doc(currentUser.uid).collection('cart').doc(id).delete();
        cartItems = cartItems.filter(item => item.id !== id);
        updateCartUI();
      } catch (error) {
        console.error("Failed to remove item", error);
      }
    };

    async function handleAddToCart() {
      if (!currentUser) { toggleModal('login-modal'); return; }
      showToast("Adding to Cart...");
        const title = document.getElementById('editor-project-title').innerText;
        const canvasHtml = document.getElementById('artwork-layer').innerHTML;
        const bgColor = document.getElementById('design-canvas').style.backgroundColor || '#ffffff';

        const newItem = {
          id: generateId(),
          title: title,
          cost: calculateCanvasCost().total,
          customization: getCurrentCustomizationSummary(),
          canvasData: canvasHtml,
          backgroundColor: bgColor,
          dateAdded: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(currentUser.uid).collection('cart').doc(newItem.id).set(newItem);
        cartItems.push(newItem);
        updateCartUI();
        showToast("Design added to your studio cart!");
    }

    window.handleAdminAssetUpload = async (e) => {
      e.preventDefault();

      const category = document.getElementById('admin-asset-category').value;
      const cost = document.getElementById('admin-asset-cost').value;
      const fileInput = document.getElementById('admin-asset-file');
      const file = fileInput.files[0];

      if (!file) {
        showToast("Please select a file first!");
        return;
      }

      const btn = e.target.querySelector('button[type="submit"]');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Publishing...`;
      btn.disabled = true;
      lucide.createIcons();

      try {
        showToast("Uploading to Cloudinary...");
        const secureUrl = await uploadToCloudinary(file);

        showToast("Saving Asset Data to Firestore...");
        await db.collection('assets').add({
          category: category,
          cost: parseFloat(cost) || 0,
          imageURL: secureUrl,
          type: file.type,
          name: file.name,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast("Asset published successfully!");
        document.getElementById('admin-upload-form').reset();
        document.getElementById('admin-file-name').innerText = 'Drag & Drop or Click to Browse';
        toggleAdminSection('orders');
        // Note: loadGlobalAssets() will need to be refactored separately to fetch from Firestore
        loadGlobalAssets();

      } catch (err) {
        console.error("Admin Upload Error:", err);
        showToast("Upload failed: " + (err.message || "Unknown error"));
      } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        setTimeout(() => lucide.createIcons(), 10);
      }
    };

    function handleBuyNow() {
      if (!currentUser) { pendingAction = 'buy'; toggleModal('login-modal'); }
      else { proceedToCheckout(true); }
    }

    function proceedToCheckout(isDirectBuy = false) {
      window.isDirectBuyCheckout = isDirectBuy;
      if (!isDirectBuy && cartItems.length === 0) {
        showToast("Your cart is empty!");
        return;
      }

      const cartModal = document.getElementById('cart-modal');
      if (!cartModal.classList.contains('hidden')) toggleModal('cart-modal');

      window.playGlobalLoader("wait a sec...", () => {
        document.getElementById('chk-name').value = currentUser.name || '';
        document.getElementById('chk-email').value = currentUser.email || '';
        const aggregateCartPriceSum = cartItems.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
        const designWorkspaceActivePrice = parseFloat(calculateCanvasCost().total) || 0;
        const total = isDirectBuy ? designWorkspaceActivePrice : aggregateCartPriceSum;
        document.getElementById('chk-total').innerText = `${window.appCurrency || '$'}${total.toFixed(2)}`;
        switchView('checkout');
      });
    }

    // --- GATEWAY ADAPTER INTERFACE STRATEGY ---
    class AutomatedPaymentAdapterSystem {
      async createIntent(payload) {
        return {
          clientSecret: "pi_live_secret_" + Math.random().toString(36).substr(2, 10),
          intentId: "intent_tx_" + Math.random().toString(36).substr(2, 14)
        };
      }
      async processCapture(intentId) {
        return { success: true, transactionId: "ch_live_" + Math.random().toString(36).substr(2, 12) };
      }
    }

    const NetworkPaymentService = new AutomatedPaymentAdapterSystem();

    window.switchPaymentArchitecture = (method) => {
      const codLabel = document.getElementById('label-pay-cod');
      const cardLabel = document.getElementById('label-pay-card');
      const submitText = document.getElementById('btn-submit-secure-text');

      if (method === 'CARD') {
        cardLabel.className = "flex items-center justify-between p-4 bg-white border-2 border-flame rounded-2xl cursor-pointer transition select-none";
        codLabel.className = "flex items-center justify-between p-4 bg-editorbg border border-sand rounded-2xl cursor-pointer transition select-none";
        submitText.innerText = "Proceed to Pay";
      } else {
        codLabel.className = "flex items-center justify-between p-4 bg-white border-2 border-flame rounded-2xl cursor-pointer transition select-none";
        cardLabel.className = "flex items-center justify-between p-4 bg-editorbg border border-sand rounded-2xl cursor-pointer transition select-none";
        submitText.innerText = "Place Order";
      }
    };

    window.routeCheckoutExecutionFlow = () => {
      const selectedMethod = document.querySelector('input[name="payment_method_choice"]:checked').value;

      const chkName = document.getElementById('chk-name').value;
      const chkEmail = document.getElementById('chk-email').value;
      const chkCity = document.getElementById('chk-city').value;
      const chkAddress = document.getElementById('chk-address').value;

      if (!chkName || !chkEmail || !chkCity || !chkAddress) {
        showToast("Please complete all shipping address detail metrics first.");
        return;
      }

      if (selectedMethod === 'CARD') {
        const baseAmountRaw = parseFloat(document.getElementById('chk-total').innerText.replace(/[^0-9.]/g, '')) || 0;
        const shippingCalculatedCharge = baseAmountRaw > 150 ? 0 : 15.00;
        const absoluteGrandTotalFee = baseAmountRaw + shippingCalculatedCharge;

        document.getElementById('summary-base-price').innerText = `${window.appCurrency || '$'}${baseAmountRaw.toFixed(2)}`;
        document.getElementById('summary-shipping-price').innerText = `${window.appCurrency || '$'}${shippingCalculatedCharge.toFixed(2)}`;
        document.getElementById('summary-grand-total').innerText = `${window.appCurrency || '$'}${absoluteGrandTotalFee.toFixed(2)}`;

        const screen = document.getElementById('secure-payment-screen');
        screen.classList.remove('hidden');
        screen.classList.add('flex');
        document.getElementById('screen-holder-name').focus();
      } else {
        processFinalCheckoutOrderCreation('COD', 'Pending', { transactionId: 'COD-PENDING-LOG', intentId: 'None', brand: 'None', last4: 'None' });
      }
    };

    window.closeSecurePaymentScreen = () => {
      const screen = document.getElementById('secure-payment-screen');
      screen.classList.add('hidden');
      screen.classList.remove('flex');
    };

    window.updateLivePaymentCardPreview = (field, val) => {
      if (field === 'name') {
        document.getElementById('preview-card-name').innerText = val.trim().length > 0 ? val.toUpperCase() : "YOUR NAME";
      }
    };

    window.formatPaymentCardNumberInput = (input) => {
      let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
      let parts = [];
      for (let i = 0; i < value.length; i += 4) {
        parts.push(value.substring(i, i + 4));
      }
      input.value = parts.length > 0 ? parts.join(' ') : value;

      document.getElementById('preview-card-number').innerText = input.value.length > 0 ? input.value : "•••• •••• •••• ••••";

      let logoHtml = '<i class="fas fa-credit-card"></i>';
      let brandLabel = "CARD";

      if (value.startsWith('4')) { logoHtml = '<i class="fab fa-cc-visa text-2xl text-blue-400"></i>'; brandLabel = "VISA"; }
      else if (/^5[1-5]/.test(value)) { logoHtml = '<i class="fab fa-cc-mastercard text-2xl text-orange-400"></i>'; brandLabel = "MASTERCARD"; }
      else if (/^3[47]/.test(value)) { logoHtml = '<i class="fab fa-cc-amex text-2xl text-cyan-400"></i>'; brandLabel = "AMEX"; }
      else if (/^6011/.test(value)) { logoHtml = '<i class="fab fa-cc-discover text-2xl text-orange-300"></i>'; brandLabel = "DISCOVER"; }
      else if (/^62/.test(value)) { logoHtml = '<i class="fas fa-credit-card text-2xl text-slate-300"></i>'; brandLabel = "UNIONPAY"; }

      const logoPreviewContainer = document.getElementById('preview-card-logo');
      logoPreviewContainer.innerHTML = logoHtml;
      logoPreviewContainer.className = "tracking-normal opacity-100 flex items-center justify-center";
    };

    window.formatPaymentCardExpiryInput = (input) => {
      let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
      if (value.length >= 2) {
        input.value = value.substring(0, 2) + '/' + value.substring(2, 4);
      } else {
        input.value = value;
      }
      document.getElementById('preview-card-expiry').innerText = input.value.length > 0 ? input.value : "MM/YY";
    };

    function processLuhnAlgorithmVerification(numStr) {
      let clean = numStr.replace(/\s+/g, '');
      let sum = 0;
      let alternate = false;
      for (let i = clean.length - 1; i >= 0; i--) {
        let n = parseInt(clean.charAt(i), 10);
        if (alternate) {
          if ((n *= 2) > 9) n -= 9;
        }
        sum += n;
        alternate = !alternate;
      }
      return (sum % 10) === 0;
    }

    window.executeSecureNetworkTokenization = async () => {
      const cardHolder = document.getElementById('screen-holder-name').value.trim();
      const cardNum = document.getElementById('screen-card-number').value.replace(/\s+/g, '');
      const expiry = document.getElementById('screen-card-expiry').value;
      const cvv = document.getElementById('screen-card-cvv').value;
      const country = document.getElementById('screen-billing-country').value;
      const postal = document.getElementById('screen-billing-postal').value;

      if (!cardHolder || !cardNum || !expiry || !cvv || !postal) {
        showToast("Please fulfill all active card secure fields.");
        return;
      }

      if (cardNum.length < 13 || !processLuhnAlgorithmVerification(cardNum)) {
        showToast("Invalid card configuration parameters (Luhn Failure Rejected).");
        return;
      }

      const expParts = expiry.split('/');
      if (expParts.length !== 2 || parseInt(expParts[0]) > 12) {
        showToast("Invalid card expiration parameter format matrix.");
        return;
      }

      const confirmBtn = document.getElementById('btn-screen-confirm-pay');
      const payText = document.getElementById('btn-screen-pay-text');

      confirmBtn.disabled = true;
      payText.innerText = "Verifying Bank Credentials...";

      window.playGlobalLoader("Routing Payment Gateway Intent...", null, false);

      try {
        const rawPriceSum = parseFloat(document.getElementById('chk-total').innerText.replace(/[^0-9.]/g, '')) || 0;
        const calculatedShipping = rawPriceSum > 150 ? 0 : 15.00;
        const checkoutGrandTotalVolume = rawPriceSum + calculatedShipping;

        const intent = await NetworkPaymentService.createIntent({ amount: checkoutGrandTotalVolume });

        window.playGlobalLoader("Processing Transaction Settlement Security Token...", null, false);
        const settlement = await NetworkPaymentService.processCapture(intent.intentId);

        if (settlement && settlement.success) {
          let cardBrandLabel = document.getElementById('preview-card-logo').innerText;
          let maskedLast4Digits = cardNum.substring(cardNum.length - 4);

          window.playGlobalLoader("confirming order...", null, false);
          await processFinalCheckoutOrderCreation('CARD', 'Succeeded', {
            transactionId: settlement.transactionId,
            intentId: intent.intentId,
            brand: cardBrandLabel,
            last4: maskedLast4Digits
          });
        } else {
          throw new Error("Card processing request denied by downstream network banks.");
        }
      } catch (error) {
        window.hideGlobalLoader();
        confirmBtn.disabled = false;
        payText.innerText = "Confirm Payment Authorization";
        alert("Payment Processing Engine Error Statement: " + error.message);
      }
    };

    async function generateOrderConfirmationPdf(order) {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // 1. Header (Dark Slate Background)
      pdf.setFillColor(43, 61, 70);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      pdf.setFillColor(235, 94, 40);
      pdf.rect(0, 35, pageWidth, 2, 'F');

      // Header Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(26);
      pdf.text('FrameCraft', 15, 22);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(235, 94, 40);
      pdf.text('INVOICE', pageWidth - 15, 20, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Order #${order.id}`, pageWidth - 15, 28, { align: 'right' });

      // 2. Customer & Order Details (Two Columns)
      pdf.setTextColor(43, 61, 70);

      // Left Column (Bill To)
      let y = 50;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(158, 182, 196);
      pdf.text('BILL TO', 15, y);

      y += 6;
      pdf.setTextColor(43, 61, 70);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(order.customer || 'Guest User', 15, y);

      y += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(order.email || '', 15, y);
      y += 5;
      pdf.text(order.phone || '', 15, y);

      const splitAddress = pdf.splitTextToSize(order.address || '', 80);
      y += 5;
      pdf.text(splitAddress, 15, y);

      // Right Column (Order Info)
      let ry = 50;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(158, 182, 196);
      pdf.text('ORDER DETAILS', 120, ry);

      ry += 6;
      pdf.setTextColor(43, 61, 70);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', 120, ry);
      pdf.setFont('helvetica', 'normal');
      pdf.text(order.date || '', 150, ry);

      ry += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Method:', 120, ry);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${order.paymentMethod} (${order.paymentStatus})`, 150, ry);

      ry += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Est. Delivery:', 120, ry);
      pdf.setFont('helvetica', 'normal');
      pdf.text(order.estimatedDelivery || '', 150, ry);

      // 3. Line Separator
      y = Math.max(y + (splitAddress.length * 5), ry) + 15;
      pdf.setDrawColor(218, 229, 235);
      pdf.line(15, y, pageWidth - 15, y);

      // 4. Products Table Header
      y += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(158, 182, 196);
      pdf.text('ITEM DESCRIPTION', 15, y);
      pdf.text('QTY', 140, y, { align: 'center' });
      pdf.text('TOTAL', pageWidth - 15, y, { align: 'right' });

      y += 4;
      pdf.line(15, y, pageWidth - 15, y);

      // 5. Products List
      y += 8;
      pdf.setTextColor(43, 61, 70);
      pdf.setFontSize(11);
      (order.orderedProducts || []).forEach(p => {
        pdf.setFont('helvetica', 'bold');
        const splitTitle = pdf.splitTextToSize(p.title, 110);
        pdf.text(splitTitle, 15, y);

        pdf.setFont('helvetica', 'normal');
        pdf.text(String(p.qty || 1), 140, y, { align: 'center' });

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${window.appCurrency || '$'}${(p.cost || 0).toFixed(2)}`, pageWidth - 15, y, { align: 'right' });

        y += (splitTitle.length * 6) + 4;
      });

      pdf.line(15, y, pageWidth - 15, y);

      // 6. Totals & Product Image
      y += 10;

      // Fetch and embed the image
      const previewUrl = order.previewImageURL;
      if (previewUrl && !previewUrl.includes('via.placeholder.com')) {
        try {
          const base64Img = await new Promise((res, rej) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
              const c = document.createElement('canvas');
              // DOWNSCALE heavily to keep PDF under EmailJS 50KB Free Tier limit
              const maxW = 200;
              const scale = Math.min(1, maxW / img.width);
              c.width = img.width * scale;
              c.height = img.height * scale;
              const cx = c.getContext('2d');
              cx.drawImage(img, 0, 0, c.width, c.height);
              res(c.toDataURL('image/jpeg', 0.4)); // 40% quality compression
            };
            img.onerror = rej;
            img.src = previewUrl;
          });
          pdf.addImage(base64Img, 'JPEG', 15, y, 70, 70);
        } catch (e) { console.warn("Could not embed image in PDF:", e); }
      }

      // Totals on the right
      let ty = y + 5;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Subtotal:', 140, ty);
      pdf.text(`${window.appCurrency || '$'}${(order.baseAmount || 0).toFixed(2)}`, pageWidth - 15, ty, { align: 'right' });

      ty += 8;
      pdf.text('Shipping:', 140, ty);
      pdf.text(`${window.appCurrency || '$'}${(order.shippingCharges || 0).toFixed(2)}`, pageWidth - 15, ty, { align: 'right' });

      ty += 12;
      pdf.setFillColor(43, 61, 70);
      pdf.rect(130, ty - 7, 70, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('GRAND TOTAL:', 135, ty);
      pdf.setTextColor(235, 94, 40); // Flame
      pdf.text(String(order.total), pageWidth - 17, ty, { align: 'right' });

      // Footer
      pdf.setTextColor(158, 182, 196);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Thank you for shopping with FrameCraft Studio!', pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.text('hello@framecraft.studio', pageWidth / 2, pageHeight - 14, { align: 'center' });

      // Clean Data URI for EmailJS attachment compatibility
      let cleanDataUri = pdf.output('datauristring');
      cleanDataUri = cleanDataUri.replace(/filename=[^;]+;/, '');

      return {
        blob: pdf.output('blob'),
        dataUri: cleanDataUri
      };
    }

    window.downloadLastOrderPdf = () => {
      if (!window.lastOrderPdf?.blob) return showToast('Your order PDF is not available yet.');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(window.lastOrderPdf.blob);
      link.download = window.lastOrderPdf.filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    };

    async function processFinalCheckoutOrderCreation(method, paymentStatus, meta) {
      const name = document.getElementById('chk-name').value || "Guest User";
      const email = document.getElementById('chk-email').value || "processing@studio.com";
      const phone = document.getElementById('chk-phone').value || "N/A";
      const province = document.getElementById('chk-province').value || "";
      const city = document.getElementById('chk-city').value || "";
      const street = document.getElementById('chk-address').value || "";
      const address = `${street}, ${city}, ${province}`;
      const title = document.getElementById('editor-project-title').innerText;

      const basePriceRaw = parseFloat(document.getElementById('chk-total').innerText.replace(/[^0-9.]/g, '')) || 0;
      const shippingRateValue = method === 'CARD' ? (basePriceRaw > 150 ? 0 : 15.00) : 0;
      const structuralGrandTotal = basePriceRaw + shippingRateValue;

      const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const estDeliveryTimestampString = new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Automatically capture the user's live editor workspace if they are purchasing from the builder
      let activePreviewUrl = 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=400';
      if (window.isDirectBuyCheckout) {
        try {
          const editorCanvas = document.getElementById('design-canvas');
          const canvasShot = await html2canvas(editorCanvas, { scale: 1, useCORS: true });
          activePreviewUrl = canvasShot.toDataURL('image/jpeg', 0.8);
        } catch (e) { }
      } else if (cartItems.length > 0) {
        activePreviewUrl = cartItems[0].imageURL || activePreviewUrl;
      }

      const structuredDatabaseOrderRecordPayload = {
        id: orderId,
        uid: currentUser ? currentUser.uid : 'GUEST-AUTHENTICATION-CONTEXT',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'Pending',
        customer: name,
        email: email,
        phone: phone,
        address: address,
        previewImageURL: activePreviewUrl,

        orderedProducts: cartItems.length > 0 ? cartItems.map(i => ({ title: i.title, cost: parseFloat(i.cost) || 0, qty: 1 })) : [{ title: title, cost: basePriceRaw, qty: 1 }],
        baseAmount: basePriceRaw,
        shippingCharges: shippingRateValue,
        total: `${window.appCurrency || '$'}${structuralGrandTotal.toFixed(2)}`,

        paymentMethod: method,
        paymentStatus: paymentStatus,
        paymentProvider: method === 'CARD' ? 'StripeEngineAbstractionAdapter' : 'None',
        paymentIntentId: meta.intentId,
        transactionId: meta.transactionId,
        cardBrand: meta.brand,
        cardLast4: meta.last4,
        paidAt: method === 'CARD' ? firebase.firestore.FieldValue.serverTimestamp() : null,
        estimatedDelivery: estDeliveryTimestampString
      };

      const orderPdf = await generateOrderConfirmationPdf(structuredDatabaseOrderRecordPayload);
      structuredDatabaseOrderRecordPayload.pdfFileName = `FrameCraft-Invoice-${orderId}.pdf`;

      await db.collection('orders').doc(orderId).set(structuredDatabaseOrderRecordPayload);

      // Create a gorgeous visual HTML email including the product image
      let emailTemplateAggregationOutputBlock = `
        <div style="font-family: Arial, sans-serif; color: #2b3d46; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #dae5eb; border-radius: 12px; overflow: hidden;">
            <div style="background: #2b3d46; padding: 20px; text-align: center; border-bottom: 3px solid #eb5e28;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">FrameCraft Studio</h2>
            </div>
            <div style="padding: 30px;">
                <h3 style="margin-top: 0; color: #2b3d46;">Order Confirmation - #${orderId}</h3>
                <p style="color: #4a5c66; font-size: 15px;">Thank you for choosing FrameCraft! Your bespoke order has been validated successfully.</p>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #dae5eb;">
                    <p style="margin: 0 0 10px 0;"><b>Delivery To:</b> ${name}</p>
                    <p style="margin: 0 0 10px 0;"><b>Address:</b> ${address}</p>
                    <p style="margin: 0 0 0 0;"><b>Est. Arrival:</b> ${estDeliveryTimestampString}</p>
                </div>

                <h4 style="margin-bottom: 10px; color: #2b3d46;">Order Summary</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    ${structuredDatabaseOrderRecordPayload.orderedProducts.map(p => `
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #dae5eb; color: #4a5c66;">${p.title} (x${p.qty})</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #dae5eb; text-align: right; font-weight: bold; color: #2b3d46;">${window.appCurrency || '$'}${p.cost.toFixed(2)}</td>
                    </tr>
                    `).join('')}
                </table>
                
                <div style="text-align: right; margin-bottom: 30px; font-size: 15px; color: #4a5c66;">
                    <p style="margin: 5px 0;">Subtotal: ${window.appCurrency || '$'}${basePriceRaw.toFixed(2)}</p>
                    <p style="margin: 5px 0;">Shipping: ${window.appCurrency || '$'}${shippingRateValue.toFixed(2)}</p>
                    <h3 style="color: #eb5e28; margin: 10px 0 0 0; font-size: 20px;">Grand Total: ${window.appCurrency || '$'}${structuralGrandTotal.toFixed(2)}</h3>
                </div>

                ${activePreviewUrl ? `
                <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                    <p style="margin-top: 0; font-weight: bold; color: #9eb6c4; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Product Preview</p>
                    <img src="${activePreviewUrl}" style="max-width: 100%; max-height: 250px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" alt="Product Preview">
                </div>
                ` : ''}
            </div>
        </div>
      `;

      try {
        await emailjs.send('service_ia6xjfs', 'template_72upsy8', {
          customer_email: email,
          to_name: name,
          title: `Order Validation Summary Confirmation - #${orderId}`,
          message: emailTemplateAggregationOutputBlock,
          pdf_filename: structuredDatabaseOrderRecordPayload.pdfFileName,
          pdf_attachment: orderPdf ? orderPdf.dataUri : ''
        });

        await emailjs.send('service_ia6xjfs', 'template_72upsy8', {
          customer_email: 'admin@framecraft.com',
          to_name: 'Studio Management Admin',
          title: `ALERT: New Order Received - #${orderId}`,
          message: emailTemplateAggregationOutputBlock,
          pdf_filename: structuredDatabaseOrderRecordPayload.pdfFileName,
          pdf_attachment: orderPdf ? orderPdf.dataUri : ''
        });
      } catch (e) { console.warn("Outbound SMTP relay dropped payload packet.", e); }

      const batch = db.batch();
      if (currentUser) {
        const cartDocs = await db.collection('users').doc(currentUser.uid).collection('cart').get();
        cartDocs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      cartItems = [];
      if (orderPdf) {
        window.lastOrderPdf = { blob: orderPdf.blob, filename: structuredDatabaseOrderRecordPayload.pdfFileName };
      }
      updateCartUI();
      window.hideGlobalLoader();

      const screen = document.getElementById('secure-payment-screen');
      if (screen && !screen.classList.contains('hidden')) closeSecurePaymentScreen();

      document.getElementById('checkout-view').innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-16 bg-white rounded-3xl shadow-xl border border-sand p-10 mt-10">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="check-circle" class="w-12 h-12 text-green-600"></i>
                </div>
                <h2 class="text-3xl font-black text-charcoal mb-4">Order Validated & Confirmed</h2>
                <p class="text-sm font-semibold text-slate mb-6">Bespoke Reference Code: <span class="font-bold text-flame">${orderId}</span></p>
                
                <div class="bg-editorbg rounded-2xl p-6 text-left text-xs font-bold text-slate space-y-3 mb-8 max-w-md mx-auto border border-sand/40">
                    <div class="flex justify-between"><span>Customer Name:</span><span class="text-charcoal">${name}</span></div>
                    <div class="flex justify-between"><span>Delivery Destination:</span><span class="text-charcoal text-right max-w-[60%] truncate">${address}</span></div>
                    <div class="flex justify-between"><span>Handcrafted Estimated Arrival:</span><span class="text-charcoal">${estDeliveryTimestampString}</span></div>
                    <hr style="border:none; border-top:1px solid #ccc5b9; opacity:0.4;">
                    <div class="flex justify-between"><span>Payment Method Selected:</span><span class="text-charcoal">${method}</span></div>
                    <div class="flex justify-between"><span>Downstream Processing Status:</span><span class="text-green-600">${paymentStatus}</span></div>
                    <div class="flex justify-between"><span>Gateway Network ID:</span><span class="text-charcoal font-mono truncate max-w-[50%]">${meta.transactionId}</span></div>
                    <hr style="border:none; border-top:1px solid #ccc5b9; opacity:0.4;">
                    <div class="flex justify-between text-sm font-black"><span>Total Volume Authorized:</span><span class="text-flame">${window.appCurrency || '$'}${structuralGrandTotal.toFixed(2)}</span></div>
                </div>

                <div class="flex flex-wrap justify-center gap-3"><button onclick="downloadLastOrderPdf()" class="bg-charcoal px-6 py-3.5 rounded-xl text-cream font-extrabold text-sm shadow-lg"><i data-lucide="file-down" class="w-4 h-4 inline mr-1"></i> Download Order PDF</button><button onclick="window.location.reload()" class="btn-solid-orange px-8 py-3.5 rounded-xl text-cream font-extrabold text-sm shadow-lg">Return to Studio Workspace</button></div>
            </div>
        `;
      lucide.createIcons();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.downloadLastOrderPdf = () => {
      if (!window.lastOrderPdf?.blob) return showToast('Your order PDF is not available yet.');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(window.lastOrderPdf.blob);
      link.download = window.lastOrderPdf.filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    };

    async function processFinalCheckoutOrderCreation(method, paymentStatus, meta) {
      const name = document.getElementById('chk-name').value || "Guest User";
      const email = document.getElementById('chk-email').value || "processing@studio.com";
      const phone = document.getElementById('chk-phone').value || "N/A";
      const province = document.getElementById('chk-province').value || "";
      const city = document.getElementById('chk-city').value || "";
      const street = document.getElementById('chk-address').value || "";
      const address = `${street}, ${city}, ${province}`;
      const title = document.getElementById('editor-project-title').innerText;

      const basePriceRaw = parseFloat(document.getElementById('chk-total').innerText.replace(/[^0-9.]/g, '')) || 0;
      const shippingRateValue = method === 'CARD' ? (basePriceRaw > 150 ? 0 : 15.00) : 0;
      const structuralGrandTotal = basePriceRaw + shippingRateValue;

      const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const estDeliveryTimestampString = new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Automatically capture the user's live editor workspace if they are purchasing from the builder
      let activePreviewUrl = 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=400';
      if (window.isDirectBuyCheckout) {
        try {
          const editorCanvas = document.getElementById('design-canvas');
          const canvasShot = await html2canvas(editorCanvas, { scale: 1, useCORS: true });
          activePreviewUrl = canvasShot.toDataURL('image/jpeg', 0.8);
        } catch (e) { }
      } else if (cartItems.length > 0) {
        activePreviewUrl = cartItems[0].imageURL || activePreviewUrl;
      }

      const structuredDatabaseOrderRecordPayload = {
        id: orderId,
        uid: currentUser ? currentUser.uid : 'GUEST-AUTHENTICATION-CONTEXT',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'Pending',
        customer: name,
        email: email,
        phone: phone,
        address: address,
        previewImageURL: activePreviewUrl,

        orderedProducts: cartItems.length > 0 ? cartItems.map(i => ({ title: i.title, cost: parseFloat(i.cost) || 0, qty: 1 })) : [{ title: title, cost: basePriceRaw, qty: 1 }],
        baseAmount: basePriceRaw,
        shippingCharges: shippingRateValue,
        total: `${window.appCurrency || '$'}${structuralGrandTotal.toFixed(2)}`,

        paymentMethod: method,
        paymentStatus: paymentStatus,
        paymentProvider: method === 'CARD' ? 'StripeEngineAbstractionAdapter' : 'None',
        paymentIntentId: meta.intentId,
        transactionId: meta.transactionId,
        cardBrand: meta.brand,
        cardLast4: meta.last4,
        paidAt: method === 'CARD' ? firebase.firestore.FieldValue.serverTimestamp() : null,
        estimatedDelivery: estDeliveryTimestampString
      };

      const orderPdf = await generateOrderConfirmationPdf(structuredDatabaseOrderRecordPayload);
      structuredDatabaseOrderRecordPayload.pdfFileName = `FrameCraft-Invoice-${orderId}.pdf`;

      await db.collection('orders').doc(orderId).set(structuredDatabaseOrderRecordPayload);

      let emailTemplateAggregationOutputBlock = `
            <h3>Order Confirmation - #${orderId}</h3>
            <p>Thank you for choosing FrameCraft Studio! Your order metrics have been validated successfully.</p>
            <hr style="border:none; border-top:1px solid #dae5eb; margin:15px 0;">
            <b>Customer:</b> ${name}<br>
            <b>Email:</b> ${email}<br>
            <b>Phone:</b> ${phone}<br>
            <b>Shipping Destination Address:</b> ${address}<br>
            <b>Estimated Handcrafted Delivery:</b> ${estDeliveryTimestampString}<br>
            <hr style="border:none; border-top:1px solid #dae5eb; margin:15px 0;">
            <h4>Items Ordered Parameters:</h4>
            ${structuredDatabaseOrderRecordPayload.orderedProducts.map(p => `• ${p.title} (x${p.qty}) — ${window.appCurrency || '$'}${p.cost.toFixed(2)}<br>`).join('')}
            <br>
            <b>Subtotal:</b> ${window.appCurrency || '$'}${basePriceRaw.toFixed(2)}<br>
            <b>Shipping Charge:</b> ${window.appCurrency || '$'}${shippingRateValue.toFixed(2)}<br>
            <b>Grand Total:</b> ${window.appCurrency || '$'}${structuralGrandTotal.toFixed(2)}<br>
            <hr style="border:none; border-top:1px solid #dae5eb; margin:15px 0;">
            <b>Payment Architecture Method:</b> ${method}<br>
            <b>Downstream Payment Status:</b> ${paymentStatus}<br>
            <b>Downstream System Transaction ID:</b> ${meta.transactionId}<br>
        `;

      try {
        await emailjs.send('service_ia6xjfs', 'template_72upsy8', {
          customer_email: email,
          to_name: name,
          title: `Order Validation Summary Confirmation - #${orderId}`,
          message: emailTemplateAggregationOutputBlock,
          pdf_filename: structuredDatabaseOrderRecordPayload.pdfFileName,
          pdf_attachment: orderPdf ? orderPdf.dataUri : ''
        });

        await emailjs.send('service_ia6xjfs', 'template_72upsy8', {
          customer_email: 'admin@framecraft.com',
          to_name: 'Studio Management Admin',
          title: `ALERT: New Order Received - #${orderId}`,
          message: emailTemplateAggregationOutputBlock,
          pdf_filename: structuredDatabaseOrderRecordPayload.pdfFileName,
          pdf_attachment: orderPdf ? orderPdf.dataUri : ''
        });
      } catch (e) { console.warn("Outbound SMTP relay dropped payload packet.", e); }

      const batch = db.batch();
      if (currentUser) {
        const cartDocs = await db.collection('users').doc(currentUser.uid).collection('cart').get();
        cartDocs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      cartItems = [];
      if (orderPdf) {
        window.lastOrderPdf = { blob: orderPdf.blob, filename: structuredDatabaseOrderRecordPayload.pdfFileName };
      }
      updateCartUI();
      window.hideGlobalLoader();

      const screen = document.getElementById('secure-payment-screen');
      if (screen && !screen.classList.contains('hidden')) closeSecurePaymentScreen();

      document.getElementById('checkout-view').innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-16 bg-white rounded-3xl shadow-xl border border-sand p-10 mt-10">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="check-circle" class="w-12 h-12 text-green-600"></i>
                </div>
                <h2 class="text-3xl font-black text-charcoal mb-4">Order Validated & Confirmed</h2>
                <p class="text-sm font-semibold text-slate mb-6">Bespoke Reference Code: <span class="font-bold text-flame">${orderId}</span></p>
                
                <div class="bg-editorbg rounded-2xl p-6 text-left text-xs font-bold text-slate space-y-3 mb-8 max-w-md mx-auto border border-sand/40">
                    <div class="flex justify-between"><span>Customer Name:</span><span class="text-charcoal">${name}</span></div>
                    <div class="flex justify-between"><span>Delivery Destination:</span><span class="text-charcoal text-right max-w-[60%] truncate">${address}</span></div>
                    <div class="flex justify-between"><span>Handcrafted Estimated Arrival:</span><span class="text-charcoal">${estDeliveryTimestampString}</span></div>
                    <hr style="border:none; border-top:1px solid #ccc5b9; opacity:0.4;">
                    <div class="flex justify-between"><span>Payment Method Selected:</span><span class="text-charcoal">${method}</span></div>
                    <div class="flex justify-between"><span>Downstream Processing Status:</span><span class="text-green-600">${paymentStatus}</span></div>
                    <div class="flex justify-between"><span>Gateway Network ID:</span><span class="text-charcoal font-mono truncate max-w-[50%]">${meta.transactionId}</span></div>
                    <hr style="border:none; border-top:1px solid #ccc5b9; opacity:0.4;">
                    <div class="flex justify-between text-sm font-black"><span>Total Volume Authorized:</span><span class="text-flame">${window.appCurrency || '$'}${structuralGrandTotal.toFixed(2)}</span></div>
                </div>

                <div class="flex flex-wrap justify-center gap-3"><button onclick="downloadLastOrderPdf()" class="bg-charcoal px-6 py-3.5 rounded-xl text-cream font-extrabold text-sm shadow-lg"><i data-lucide="file-down" class="w-4 h-4 inline mr-1"></i> Download Order PDF</button><button onclick="window.location.reload()" class="btn-solid-orange px-8 py-3.5 rounded-xl text-cream font-extrabold text-sm shadow-lg">Return to Studio Workspace</button></div>
            </div>
        `;
      lucide.createIcons();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    let cityChartInstance = null;
    let revenueChartInstance = null;
    let currentReplaceId = null;

    window.appCurrency = '$';
    let currentTrackingOrderId = null;



    window.switchAdminOrderTab = (tab) => {
      document.getElementById('adm-orders-list-view').classList.add('hidden');
      document.getElementById('adm-orders-finance-view').classList.add('hidden');
      document.getElementById('tab-adm-list').classList.replace('bg-charcoal', 'bg-editorbg');
      document.getElementById('tab-adm-list').classList.replace('text-cream', 'text-slate');
      document.getElementById('tab-adm-finance').classList.replace('bg-charcoal', 'bg-editorbg');
      document.getElementById('tab-adm-finance').classList.replace('text-cream', 'text-slate');

      if (tab === 'list') {
        document.getElementById('adm-orders-list-view').classList.remove('hidden');
        document.getElementById('tab-adm-list').classList.replace('bg-editorbg', 'bg-charcoal');
        document.getElementById('tab-adm-list').classList.replace('text-slate', 'text-cream');
      } else {
        document.getElementById('adm-orders-finance-view').classList.remove('hidden');
        document.getElementById('tab-adm-finance').classList.replace('bg-editorbg', 'bg-charcoal');
        document.getElementById('tab-adm-finance').classList.replace('text-slate', 'text-cream');
        renderFinanceDashboard();
      }
    };

    function renderAdminOrders() {
      const tbody = document.getElementById('admin-orders-table-body');
      if (!tbody) return;
      tbody.innerHTML = globalOrders.map(o => {
        // Safely extract the item name from the orderedProducts array
        const itemName = (o.orderedProducts && o.orderedProducts.length > 0) ? o.orderedProducts[0].title : 'Custom Frame';

        // Safely parse the total to prevent crashes from old/malformed database records
        let safeTotal = 0;
        if (typeof o.total === 'string') safeTotal = parseFloat(o.total.replace(/[^0-9.]/g, '')) || 0;
        else if (typeof o.total === 'number') safeTotal = o.total;

        return `
        <tr class="hover:bg-sand/10 transition">
          <td class="px-6 py-4 font-black">${o.id || 'N/A'}</td>
          <td class="px-6 py-4">${itemName}</td>
          <td class="px-6 py-4 text-slate">${o.date || 'N/A'}</td>
          <td class="px-6 py-4 font-bold">${window.appCurrency || '$'}${safeTotal.toFixed(2)}</td>
          <td class="px-6 py-4 text-right">
            <button onclick="viewOrderDetails('${o.id}')" class="px-4 py-2 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition">View Details</button>
          </td>
        </tr>
        `;
      }).join('');
    }

    function renderAdminTracking() {
      const tbody = document.getElementById('admin-tracking-table-body');
      if (!tbody) return;

      tbody.innerHTML = globalOrders.map(o => {
        let statusInfo = o.status;
        if (o.status === 'Out for Shipment' || o.status === 'Shipped') statusInfo += `<br><span class="text-[10px] text-slate">${o.shippingCompany || 'Standard'}: ${o.trackingNumber || 'N/A'}</span>`;
        if (o.status === 'Canceled') statusInfo += `<br><span class="text-[10px] text-red-500">${o.cancelReason || 'Canceled'}</span>`;

        return `
        <tr class="hover:bg-sand/10 transition">
          <td class="px-6 py-4 font-black">${o.id}</td>
          <td class="px-6 py-4">${o.customer}</td>
          <td class="px-6 py-4 text-slate">${o.date}</td>
          <td class="px-6 py-4 font-bold">${statusInfo}</td>
          <td class="px-6 py-4">
            <select onchange="openTrackingModal('${o.id}', this.value)" class="bg-editorbg border border-sand rounded-lg text-xs font-bold px-3 py-2 outline-none cursor-pointer ${o.status === 'Canceled' ? 'text-red-600' : ''}">
              <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending (Order Placed)</option>
              <option value="Payment Confirmed" ${o.status === 'Payment Confirmed' ? 'selected' : ''}>Payment Confirmed</option>
              <option value="Confirming Order" ${o.status === 'Confirming Order' || o.status === 'Order Confirmed' ? 'selected' : ''}>Order Confirmed</option>
              <option value="Frame Preparation" ${o.status === 'Frame Preparation' ? 'selected' : ''}>Frame Preparation</option>
              <option value="Printing" ${o.status === 'Printing' ? 'selected' : ''}>Printing</option>
              <option value="Packing" ${o.status === 'Packing' ? 'selected' : ''}>Packing</option>
              <option value="Quality Check" ${o.status === 'Quality Check' ? 'selected' : ''}>Quality Check</option>
              <option value="Out for Shipment" ${o.status === 'Out for Shipment' || o.status === 'Shipped' ? 'selected' : ''}>Shipped (Out for Shipment)</option>
              <option value="Out For Delivery" ${o.status === 'Out For Delivery' ? 'selected' : ''}>Out For Delivery</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Canceled" ${o.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
            </select>
          </td>
        </tr>
      `}).join('');
    }

    function renderAdminCanceled() {
      const tbody = document.getElementById('admin-canceled-table-body');
      if (!tbody) return;
      const canceledOrders = globalOrders.filter(o => o.status === 'Canceled');
      if (canceledOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate font-bold">No canceled orders.</td></tr>`;
        return;
      }
      tbody.innerHTML = canceledOrders.map(o => `
        <tr class="hover:bg-red-50 transition">
          <td class="px-6 py-4 font-black">${o.id}</td>
          <td class="px-6 py-4">${o.customer}</td>
          <td class="px-6 py-4 text-slate">${o.date}</td>
          <td class="px-6 py-4 font-bold text-red-600">${o.cancelReason || 'No reason provided'}</td>
        </tr>
      `).join('');
    }

    window.openTrackingModal = (id, status) => {
      currentTrackingOrderId = id;
      if (status === 'Out for Shipment' || status === 'Shipped') {
        window.currentSelectedShipmentStatus = status;
        document.getElementById('ship-company').value = '';
        document.getElementById('ship-tracknum').value = '';
        toggleModal('admin-shipment-modal');
      } else if (status === 'Canceled') {
        document.getElementById('cancel-reason').value = '';
        toggleModal('admin-cancel-modal');
      } else {
        updateOrderStatus(id, status);
      }
    };

    window.confirmShipment = async () => {
      const company = document.getElementById('ship-company').value;
      const trackNum = document.getElementById('ship-tracknum').value;
      if (!company || !trackNum) return alert("Please fill all shipment fields");

      const targetStatus = window.currentSelectedShipmentStatus || 'Out for Shipment';
      updateOrderStatus(currentTrackingOrderId, targetStatus, { shippingCompany: company, trackingNumber: trackNum });
      toggleModal('admin-shipment-modal');

      const order = globalOrders.find(o => o.id === currentTrackingOrderId);

      if (order && order.email) {
        const htmlMessage = `
                Great news! Your order is on its way.<br><br>
                <b>Shipping Provider:</b> ${company}<br>
                <b>Tracking Number:</b> ${trackNum}<br><br>
                Please use the tracking number to monitor your delivery status.
            `;

        try {
          await emailjs.send('service_ia6xjfs', 'template_72upsy8', {
            customer_email: order.email,
            to_name: order.customer || 'Customer',
            title: `Your Order #${order.id} has Shipped!`,
            message: htmlMessage
          });
          showToast("Shipment email successfully sent to customer.");
        } catch (err) {
          console.error("Email failed:", err);
          showToast("Status updated, but shipment email failed to send.");
        }
      }
    };

    window.confirmCancellation = () => {
      const reason = document.getElementById('cancel-reason').value;
      if (!reason) return alert("Please provide a reason for cancellation");
      updateOrderStatus(currentTrackingOrderId, 'Canceled', { cancelReason: reason });
      toggleModal('admin-cancel-modal');
    };

    async function updateOrderStatus(id, status, extraData = {}) {
      try {
        await db.collection('orders').doc(id).update({ status: status, ...extraData });

        // Sync Admin Array
        const orderIndex = globalOrders.findIndex(o => o.id === id);
        if (orderIndex !== -1) {
          globalOrders[orderIndex].status = status;
          Object.assign(globalOrders[orderIndex], extraData);
        }

        // Sync User Array (Ensures instant UI update without refresh)
        const myOrderIndex = myOrders.findIndex(o => o.id === id);
        if (myOrderIndex !== -1) {
          myOrders[myOrderIndex].status = status;
          Object.assign(myOrders[myOrderIndex], extraData);
        }

        showToast("Order status updated to " + status);
        renderAdminTracking();
        renderAdminCanceled();
        renderAdminOrders();

        // Re-render User View if they are looking at it
        if (!document.getElementById('orders-tracking-section').classList.contains('hidden')) {
          filterAndRenderOrders();
        }
      } catch (e) {
        alert("Error updating order: " + e.message);
      }
    }

    window.updateGlobalCurrency = () => {
      const newCurr = document.getElementById('admin-currency-select').value;
      window.appCurrency = newCurr;
      showToast(`Global currency updated to ${newCurr}`);
      renderAdminOrders();
      renderFinanceDashboard();
    };

    window.updateAdminTheme = () => {
      const theme = document.getElementById('admin-theme-select').value;
      if (theme === 'dark') {
        document.body.classList.add('bg-charcoal', 'text-cream');
        document.body.classList.remove('bg-cream', 'text-charcoal');
      } else {
        document.body.classList.remove('bg-charcoal', 'text-cream');
        document.body.classList.add('bg-cream', 'text-charcoal');
      }
      showToast("Theme preference applied.");
    };

    window.updateAdminLanguage = () => {
      showToast("Language preference saved.");
    };

    window.updateAdminPassword = async () => {
      const newPass = document.getElementById('admin-new-pass').value;
      if (!newPass || newPass.length < 6) return alert("Password must be at least 6 characters.");
      if (currentUser.uid === 'admin_uid') return alert("Cannot change hardcoded demo admin password.");
      try {
        await firebase.auth().currentUser.updatePassword(newPass);
        document.getElementById('admin-new-pass').value = '';
        showToast("Admin password updated successfully.");
      } catch (e) {
        alert("Error updating password: " + e.message);
      }
    };

    function renderFinanceDashboard() {
      if (!globalOrders.length) return;

      let totalRev = 0;
      let cityCounts = {};
      let dates = [];
      let revByDate = {};

      globalOrders.forEach(o => {
        let rev = 0;
        if (typeof o.total === 'string') rev = parseFloat(o.total.replace(/[^0-9.]/g, '')) || 0;
        else if (typeof o.total === 'number') rev = o.total;

        totalRev += rev;

        let cMatch = o.address ? o.address.split(',') : [];
        let city = cMatch.length > 1 ? cMatch[1].trim() : 'Unknown';
        cityCounts[city] = (cityCounts[city] || 0) + 1;

        let d = o.date;
        if (!dates.includes(d)) dates.push(d);
        revByDate[d] = (revByDate[d] || 0) + rev;
      });

      let topCity = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a])[0] || '-';

      document.getElementById('finance-total-rev').innerText = `${window.appCurrency || '$'}${totalRev.toFixed(2)}`;
      document.getElementById('finance-total-orders').innerText = globalOrders.length;
      document.getElementById('finance-top-city').innerText = topCity;

      if (cityChartInstance) cityChartInstance.destroy();
      if (revenueChartInstance) revenueChartInstance.destroy();

      const ctxCity = document.getElementById('cityChart');
      if (ctxCity) {
        cityChartInstance = new Chart(ctxCity, {
          type: 'doughnut',
          data: {
            labels: Object.keys(cityCounts),
            datasets: [{ data: Object.values(cityCounts), backgroundColor: ['#eb5e28', '#252422', '#ccc5b9', '#403d39'] }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }

      const ctxRev = document.getElementById('revenueChart');
      if (ctxRev) {
        dates.sort((a, b) => new Date(a) - new Date(b));
        let revData = dates.map(d => revByDate[d]);
        revenueChartInstance = new Chart(ctxRev, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{ label: `Revenue (${window.appCurrency || '$'})`, data: revData, borderColor: '#eb5e28', backgroundColor: 'rgba(235,94,40,0.1)', fill: true, tension: 0.4 }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }

    async function loadAdminManageAssets() {
      const grid = document.getElementById('admin-manage-grid');
      grid.innerHTML = `<div class="col-span-full text-center py-10"><i data-lucide="loader" class="w-8 h-8 animate-spin mx-auto text-flame mb-2"></i></div>`;
      lucide.createIcons();

      const snapshot = await db.collection('assets').orderBy('createdAt', 'desc').get();
      const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (!assets.length) {
        grid.innerHTML = `<div class="col-span-full text-center text-slate font-bold">No assets found.</div>`;
        return;
      }

      grid.innerHTML = assets.map(a => `
        <div class="border border-sand rounded-xl p-4 flex flex-col items-center bg-editorbg shadow-sm">
          <div class="h-24 w-full flex items-center justify-center mb-4">
            <img src="${a.imageURL}" class="max-h-full max-w-full object-contain">
          </div>
          <div class="flex gap-2 mb-4">
            <span class="text-[10px] font-bold text-slate uppercase bg-white px-2 py-1 rounded border border-sand/50">${a.category}</span>
            <span class="text-[10px] font-bold text-flame uppercase bg-white px-2 py-1 rounded border border-sand/50">${window.appCurrency}${a.cost || 0}</span>
          </div>
          <div class="flex w-full gap-2 mt-auto mb-2">
            <button onclick="editAdminAssetCost('${a.id}', ${a.cost || 0})" class="flex-1 py-1.5 bg-white hover:bg-sand/30 text-charcoal border border-sand rounded text-xs font-bold transition">Edit Price</button>
          </div>
          <div class="flex w-full gap-2">
            <button onclick="deleteAdminAsset('${a.id}')" class="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-xs font-bold transition">Delete</button>
            <button onclick="triggerReplaceAsset('${a.id}')" class="flex-1 py-1.5 bg-white hover:bg-sand/30 text-charcoal border border-sand rounded text-xs font-bold transition">Replace</button>
          </div>
        </div>
      `).join('');
    }

    window.editAdminAssetCost = async (id, currentCost) => {
      const newCost = prompt("Enter new price:", currentCost);
      if (newCost !== null && !isNaN(parseFloat(newCost))) {
        try {
          await db.collection('assets').doc(id).update({ cost: parseFloat(newCost) });
          showToast("Price updated.");
          loadAdminManageAssets();
        } catch (e) {
          alert("Error: " + e.message);
        }
      }
    };

    window.deleteAdminAsset = async (id) => {
      if (confirm("Delete this asset permanently?")) {
        try {
          await db.collection('assets').doc(id).delete();
          showToast("Asset deleted.");
          loadAdminManageAssets();
          loadGlobalAssets();
        } catch (e) {
          alert("Error: " + e.message);
        }
      }
    };

    window.triggerReplaceAsset = (id) => {
      currentReplaceId = id;
      document.getElementById('admin-replace-file').click();
    };

    document.getElementById('admin-replace-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file || !currentReplaceId) return;

      showToast("Uploading new file...");
      try {
        const secureUrl = await uploadToCloudinary(file);
        await db.collection('assets').doc(currentReplaceId).update({
          imageURL: secureUrl,
          type: file.type,
          name: file.name
        });
        showToast("Asset replaced successfully.");
        loadAdminManageAssets();
        loadGlobalAssets();
      } catch (err) {
        alert("Upload failed: " + err.message);
      }
      e.target.value = '';
    });

    function renderAdminOrders() {
      const tbody = document.getElementById('admin-orders-table-body');
      if (!tbody) return;
      if (globalOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-slate font-bold">No orders found.</td></tr>`;
        return;
      }
      tbody.innerHTML = globalOrders.map(o => {
        const itemName = (o.orderedProducts && o.orderedProducts.length > 0) ? o.orderedProducts[0].title : 'Custom Frame';
        let safeTotal = 0;
        if (typeof o.total === 'string') safeTotal = parseFloat(o.total.replace(/[^0-9.]/g, '')) || 0;
        else if (typeof o.total === 'number') safeTotal = o.total;

        return `
        <tr class="hover:bg-sand/10 transition">
          <td class="px-6 py-4 font-black">${o.id || 'N/A'}</td>
          <td class="px-6 py-4">${itemName}</td>
          <td class="px-6 py-4 text-slate">${o.date || 'N/A'}</td>
          <td class="px-6 py-4 font-bold">${window.appCurrency || '$'}${safeTotal.toFixed(2)}</td>
          <td class="px-6 py-4 text-right">
            <button onclick="viewOrderDetails('${o.id}')" class="px-4 py-2 bg-editorbg hover:bg-sand/40 border border-sand rounded-lg text-xs font-bold text-charcoal transition">View Details</button>
          </td>
        </tr>
        `;
      }).join('');
    }

    function renderAdminTracking() {
      const tbody = document.getElementById('admin-tracking-table-body');
      if (!tbody) return;
      if (globalOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-slate font-bold">No tracking data available.</td></tr>`;
        return;
      }

      tbody.innerHTML = globalOrders.map(o => {
        let statusInfo = o.status || 'Pending';
        if (o.status === 'Out for Shipment' || o.status === 'Shipped') statusInfo += `<br><span class="text-[10px] text-slate">${o.shippingCompany || 'Standard'}: ${o.trackingNumber || 'N/A'}</span>`;
        if (o.status === 'Canceled') statusInfo += `<br><span class="text-[10px] text-red-500">${o.cancelReason || 'Canceled'}</span>`;

        return `
        <tr class="hover:bg-sand/10 transition">
          <td class="px-6 py-4 font-black">${o.id || 'N/A'}</td>
          <td class="px-6 py-4">${o.customer || 'Guest'}</td>
          <td class="px-6 py-4 text-slate">${o.date || 'N/A'}</td>
          <td class="px-6 py-4 font-bold">${statusInfo}</td>
          <td class="px-6 py-4">
            <select onchange="openTrackingModal('${o.id}', this.value)" class="bg-editorbg border border-sand rounded-lg text-xs font-bold px-3 py-2 outline-none cursor-pointer ${o.status === 'Canceled' ? 'text-red-600' : ''}">
              <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending (Order Placed)</option>
              <option value="Payment Confirmed" ${o.status === 'Payment Confirmed' ? 'selected' : ''}>Payment Confirmed</option>
              <option value="Confirming Order" ${o.status === 'Confirming Order' || o.status === 'Order Confirmed' ? 'selected' : ''}>Order Confirmed</option>
              <option value="Frame Preparation" ${o.status === 'Frame Preparation' ? 'selected' : ''}>Frame Preparation</option>
              <option value="Printing" ${o.status === 'Printing' ? 'selected' : ''}>Printing</option>
              <option value="Packing" ${o.status === 'Packing' ? 'selected' : ''}>Packing</option>
              <option value="Quality Check" ${o.status === 'Quality Check' ? 'selected' : ''}>Quality Check</option>
              <option value="Out for Shipment" ${o.status === 'Out for Shipment' || o.status === 'Shipped' ? 'selected' : ''}>Shipped (Out for Shipment)</option>
              <option value="Out For Delivery" ${o.status === 'Out For Delivery' ? 'selected' : ''}>Out For Delivery</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Canceled" ${o.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
            </select>
          </td>
        </tr>
      `}).join('');
    }

    function renderAdminCanceled() {
      const tbody = document.getElementById('admin-canceled-table-body');
      if (!tbody) return;
      const canceledOrders = globalOrders.filter(o => o.status === 'Canceled');
      if (canceledOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-slate font-bold">No canceled orders.</td></tr>`;
        return;
      }
      tbody.innerHTML = canceledOrders.map(o => `
        <tr class="hover:bg-red-50 transition">
          <td class="px-6 py-4 font-black">${o.id || 'N/A'}</td>
          <td class="px-6 py-4">${o.customer || 'Guest'}</td>
          <td class="px-6 py-4 text-slate">${o.date || 'N/A'}</td>
          <td class="px-6 py-4 font-bold text-red-600">${o.cancelReason || 'No reason provided'}</td>
        </tr>
      `).join('');
    }

    async function loadAdminManageAssets() {
      const grid = document.getElementById('admin-manage-grid');
      grid.innerHTML = `<div class="col-span-full text-center py-10"><i data-lucide="loader" class="w-8 h-8 animate-spin mx-auto text-flame mb-2"></i></div>`;
      lucide.createIcons();

      const snapshot = await db.collection('assets').orderBy('createdAt', 'desc').get();
      const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (!assets.length) {
        grid.innerHTML = `<div class="col-span-full text-center text-slate font-bold">No assets found.</div>`;
        return;
      }

      grid.innerHTML = assets.map(a => `
        <div class="border border-sand rounded-xl p-4 flex flex-col items-center bg-editorbg shadow-sm">
          <div class="h-24 w-full flex items-center justify-center mb-4">
            <img src="${a.imageURL}" class="max-h-full max-w-full object-contain">
          </div>
          <div class="flex gap-2 mb-4">
            <span class="text-[10px] font-bold text-slate uppercase bg-white px-2 py-1 rounded border border-sand/50">${a.category}</span>
            <span class="text-[10px] font-bold text-flame uppercase bg-white px-2 py-1 rounded border border-sand/50">${window.appCurrency}${a.cost || 0}</span>
          </div>
          <div class="flex w-full gap-2 mt-auto mb-2">
            <button onclick="editAdminAssetCost('${a.id}', ${a.cost || 0})" class="flex-1 py-1.5 bg-white hover:bg-sand/30 text-charcoal border border-sand rounded text-xs font-bold transition">Edit Price</button>
          </div>
          <div class="flex w-full gap-2">
            <button onclick="deleteAdminAsset('${a.id}')" class="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-xs font-bold transition">Delete</button>
            <button onclick="triggerReplaceAsset('${a.id}')" class="flex-1 py-1.5 bg-white hover:bg-sand/30 text-charcoal border border-sand rounded text-xs font-bold transition">Replace</button>
          </div>
        </div>
      `).join('');
    }

    window.editAdminAssetCost = async (id, currentCost) => {
      const newCost = prompt("Enter new price:", currentCost);
      if (newCost !== null && !isNaN(parseFloat(newCost))) {
        try {
          await db.collection('assets').doc(id).update({ cost: parseFloat(newCost) });
          showToast("Price updated.");
          loadAdminManageAssets();
        } catch (e) {
          alert("Error: " + e.message);
        }
      }
    };

    window.deleteAdminAsset = async (id) => {
      if (confirm("Delete this asset permanently?")) {
        try {
          await db.collection('assets').doc(id).delete();
          showToast("Asset deleted.");
          loadAdminManageAssets();
          loadGlobalAssets();
        } catch (e) {
          alert("Error: " + e.message);
        }
      }
    };

    window.triggerReplaceAsset = (id) => {
      currentReplaceId = id;
      document.getElementById('admin-replace-file').click();
    };

    document.getElementById('admin-replace-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file || !currentReplaceId) return;

      showToast("Uploading new file...");
      try {
        const secureUrl = await uploadToCloudinary(file);
        await db.collection('assets').doc(currentReplaceId).update({
          imageURL: secureUrl,
          type: file.type,
          name: file.name
        });
        showToast("Asset replaced successfully.");
        loadAdminManageAssets();
        loadGlobalAssets();
      } catch (err) {
        alert("Upload failed: " + err.message);
      }
      e.target.value = '';
    });

    function viewOrderDetails(id) {
      const order = globalOrders.find(o => o.id === id);
      if (!order) return;

      document.getElementById('admin-order-content').innerHTML = `
        <div class="grid grid-cols-2 gap-y-3 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div><span class="block text-[9px] uppercase text-slate font-bold">Order ID</span><span class="text-charcoal font-black text-sm">${order.id || 'N/A'}</span></div>
          <div><span class="block text-[9px] uppercase text-slate font-bold">Settled Amount</span><span class="text-flame font-black text-sm">${order.total || '0.00'}</span></div>
          <div class="col-span-2"><span class="block text-[9px] uppercase text-slate font-bold">Fulfillment Status</span><span class="text-charcoal font-extrabold bg-sand/20 px-2 py-0.5 rounded text-xs inline-block mt-0.5">${order.status || 'Pending'}</span></div>
          
          <hr class="col-span-2 border-sand/40 my-1">
          
          <div><span class="block text-[9px] uppercase text-slate font-bold">Payment Method</span><span class="text-charcoal font-extrabold">${order.paymentMethod || 'COD'}</span></div>
          <div><span class="block text-[9px] uppercase text-slate font-bold">Payment Status</span><span class="text-charcoal font-extrabold">${order.paymentStatus || 'Pending'}</span></div>
          <div><span class="block text-[9px] uppercase text-slate font-bold">Card Network</span><span class="text-charcoal font-extrabold">${order.cardBrand || 'None'}</span></div>
          <div><span class="block text-[9px] uppercase text-slate font-bold">Account Suffix</span><span class="text-charcoal font-mono font-bold">${order.cardLast4 && order.cardLast4 !== 'None' ? '•••• ' + order.cardLast4 : 'None'}</span></div>
          <div class="col-span-2"><span class="block text-[9px] uppercase text-slate font-bold">Transaction Reference ID</span><span class="text-xs font-mono text-slate bg-editorbg p-1 rounded block truncate mt-0.5">${order.transactionId || 'None'}</span></div>
          
          <hr class="col-span-2 border-sand/40 my-1">
          
          <div class="col-span-2"><span class="block text-[9px] uppercase text-slate font-bold">Items Spec Profile</span><span class="text-charcoal font-bold text-xs">${(order.orderedProducts && order.orderedProducts.length > 0) ? order.orderedProducts.map(p => p.title + ' (x' + (p.qty || 1) + ')').join(', ') : 'Custom Frame'}</span></div>
          <div class="col-span-2"><span class="block text-[9px] uppercase text-slate font-bold">Customization</span><span class="text-charcoal font-bold text-xs">${order.customization ? `Frame: ${order.customization.frame} · Size: ${order.customization.size?.name || 'Original size'} · Colour: ${order.customization.colour?.name || 'Original finish'} · Thickness: ${order.customization.thickness ? `${order.customization.thickness}%` : 'Standard'} · Decor: ${order.customization.decor?.length ? order.customization.decor.map(d => d.name).join(', ') : 'None'} · Quantity: ${order.customization.quantity || 1}` : 'No saved customization details'}</span></div>
          <div class="col-span-2"><span class="block text-[9px] uppercase text-slate font-bold">Customer Name</span><span class="text-charcoal font-bold">${order.customer || 'Guest'}</span></div>
          <div><span class="block text-[9px] uppercase text-slate font-bold">Phone Number</span><span class="text-charcoal font-bold text-xs">${order.phone || 'N/A'}</span></div>
          <div><span class="block text-[9px] uppercase text-slate font-bold">Fulfillment City</span><span class="text-charcoal font-bold text-xs">${order.address ? (order.address.split(',')[1] || 'Local').trim() : 'Local'}</span></div>
          <div class="col-span-2"><span class="block text-[9px] uppercase text-slate font-bold">Full Street Address</span><span class="text-charcoal font-medium text-xs leading-tight block mt-0.5">${order.address || 'N/A'}</span></div>
        </div>
      `;
      toggleModal('admin-order-modal');
    }

    function switchElementCategory(cat) {
      document.querySelectorAll('.elem-tab').forEach(t => {
        t.classList.remove('bg-flame/10', 'text-flame');
        t.classList.add('bg-editorbg', 'text-slate');
      });
      event.target.classList.add('bg-flame/10', 'text-flame');
      event.target.classList.remove('bg-editorbg', 'text-slate');
      document.querySelectorAll('.elem-category').forEach(c => c.classList.add('hidden'));
      document.getElementById('cat-' + cat).classList.remove('hidden');
    }

    window.applyTextEffect = (effectType) => {
      if (!selectedItem || selectedItem.dataset.type !== 'text') return;

      // Update Buttons UI
      document.querySelectorAll('.effect-btn').forEach(btn => {
        btn.classList.remove('active', 'border-flame', 'bg-flame/10');
        btn.classList.add('border-sand', 'bg-editorbg');
      });
      event.target.classList.add('active', 'border-flame', 'bg-flame/10');
      event.target.classList.remove('border-sand', 'bg-editorbg');

      // Restore text if removing circular
      if (selectedItem.classList.contains('effect-circular') && effectType !== 'circular') {
        selectedItem.innerText = selectedItem.dataset.origText || selectedItem.innerText.replace(/\n/g, "");
        selectedItem.style.width = 'auto'; selectedItem.style.height = 'auto';
      }

      // Remove old classes and attach new
      selectedItem.classList.remove('effect-shadow', 'effect-glow', 'effect-holo', 'effect-holo-fill', 'effect-circular');
      selectedItem.dataset.effect = effectType;

      // Show/Hide dynamic control panels
      const container = document.getElementById('effect-controls-container');
      document.getElementById('ctrl-shadow').classList.add('hidden');
      document.getElementById('ctrl-glow').classList.add('hidden');
      document.getElementById('ctrl-circular').classList.add('hidden');
      document.getElementById('ctrl-holo-fill').classList.add('hidden');

      if (effectType === 'none' || effectType === 'holo') {
        container.classList.add('hidden');
      } else {
        container.classList.remove('hidden');
        if (effectType === 'shadow') document.getElementById('ctrl-shadow').classList.remove('hidden');
        if (effectType === 'glow') document.getElementById('ctrl-glow').classList.remove('hidden');
        if (effectType === 'circular') document.getElementById('ctrl-circular').classList.remove('hidden');
        if (effectType === 'holo-fill') document.getElementById('ctrl-holo-fill').classList.remove('hidden');
      }

      if (effectType !== 'none') selectedItem.classList.add('effect-' + effectType);

      if (effectType === 'circular') {
        if (!selectedItem.dataset.origText) selectedItem.dataset.origText = selectedItem.innerText;
        renderCircularText();
      }

      updateEffectParams();
      recordState();
    };

    window.renderCircularText = () => {
      if (!selectedItem || selectedItem.dataset.effect !== 'circular') return;
      const text = selectedItem.dataset.origText || selectedItem.innerText;
      selectedItem.innerHTML = '';

      const curveAngle = parseFloat(document.getElementById('circ-arc').value); // 10 to 360 degrees
      const fontSize = parseInt(window.getComputedStyle(selectedItem).fontSize) || 32;

      // Estimate the physical width of the text to calculate the required radius
      const estWidth = text.length * (fontSize * 0.55);
      // Math: Arc Length (s) = Radius (r) * Angle in Radians (theta) -> r = s / theta
      const radius = Math.max(estWidth / (curveAngle * Math.PI / 180), fontSize);

      selectedItem.style.width = `${radius * 2}px`;
      selectedItem.style.height = `${radius * 2}px`;

      const isFullCircle = curveAngle === 360;
      const step = isFullCircle ? (360 / text.length) : (curveAngle / Math.max(1, text.length - 1));
      const startAngle = isFullCircle ? 0 : (-curveAngle / 2);

      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.innerText = text[i];
        span.style.position = 'absolute';
        span.style.transformOrigin = 'center center';
        // Rotate to the correct angle, then push outward radially
        span.style.transform = `rotate(${startAngle + (i * step)}deg) translateY(-${radius}px)`;
        selectedItem.appendChild(span);
      }
    };

    window.updateEffectParams = () => {
      if (!selectedItem) return;
      const effect = selectedItem.dataset.effect;

      if (effect === 'shadow') {
        const dist = parseFloat(document.getElementById('sh-dist').value);
        const angle = parseFloat(document.getElementById('sh-angle').value) * (Math.PI / 180);
        const x = Math.round(Math.cos(angle) * dist);
        const y = Math.round(Math.sin(angle) * dist);
        const blur = document.getElementById('sh-blur').value;

        const hex = document.getElementById('sh-color').value;
        const trans = (100 - document.getElementById('sh-trans').value) / 100;
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);

        selectedItem.style.setProperty('--sh-x', x + 'px');
        selectedItem.style.setProperty('--sh-y', y + 'px');
        selectedItem.style.setProperty('--sh-blur', blur + 'px');
        selectedItem.style.setProperty('--sh-color', `rgba(${r},${g},${b},${trans})`);
      }
      else if (effect === 'glow') {
        selectedItem.style.setProperty('--gl-size', document.getElementById('gl-size').value + 'px');
      }
      else if (effect === 'circular') {
        renderCircularText();
      }
      else if (effect === 'holo-fill') {
        selectedItem.style.setProperty('--hf-color', document.getElementById('hf-color').value);
      }
    };

    // Cinematic Transitions
    function triggerTransition(targetView, projectName = null) {
      let text = targetView === 'editor' ? "loading canvas..." : "Entering Workshop Studio...";
      if (projectName && targetView === 'editor') document.getElementById('editor-project-title').innerText = projectName;

      window.playGlobalLoader(text, () => {
        switchView(targetView);
      });
    }

    function toggleCustomSizeDrawer() {
      const drawer = document.getElementById('custom-size-drawer');
      drawer.classList.toggle('hidden');
      if (!drawer.classList.contains('hidden')) { document.getElementById('frame-width').focus(); }
    }

    function toggleFrameInputs() {
      const type = document.getElementById('frame-shape-type').value;
      const rectInputs = document.getElementById('rect-inputs');
      const circleInputs = document.getElementById('circle-inputs');
      if (type === 'circle') {
        rectInputs.classList.add('hidden');
        circleInputs.classList.remove('hidden');
      } else {
        rectInputs.classList.remove('hidden');
        circleInputs.classList.add('hidden');
      }
    }

    function startCustomSizedEditor() {
      const type = document.getElementById('frame-shape-type').value;
      let w, h, name;
      if (type === 'circle') {
        const r = document.getElementById('frame-radius').value || 300;
        w = r * 2;
        h = r * 2;
        name = `Circle ${r}mm Radius Frame`;
      } else {
        w = document.getElementById('frame-width').value || 400;
        h = document.getElementById('frame-height').value || 600;
        name = `${type.charAt(0).toUpperCase() + type.slice(1)} ${w}x${h}mm Frame`;
      }

      const canvas = document.getElementById('design-canvas');
      const frameOverlay = document.getElementById('frame-overlay');
      const dWidth = Math.min(w, 800);
      const dHeight = Math.min(h, 800);
      canvas.style.width = dWidth + 'px';
      canvas.style.height = dHeight + 'px';

      if (type === 'circle') {
        canvas.style.borderRadius = '50%';
      } else if (type === 'rounded') {
        canvas.style.borderRadius = '32px';
      } else {
        canvas.style.borderRadius = '0px';
      }

      const dLayer = document.getElementById('drawing-layer');
      dLayer.width = dWidth;
      dLayer.height = dHeight;
      triggerTransition('editor', name);
    }

    const toolBtns = document.querySelectorAll('.editor-tool-btn');
    const toolPanels = document.querySelectorAll('.tool-panel-content');
    const flyoutPanel = document.getElementById('flyout-panel');
    const closeMobileBtn = document.getElementById('close-mobile-panel');

    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPanelId = 'panel-' + btn.getAttribute('data-panel');

        if (btn.classList.contains('active') && window.innerWidth < 768) {
          btn.classList.remove('active');
          flyoutPanel.classList.add('hidden');
          return;
        }

        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        flyoutPanel.classList.remove('hidden');

        toolPanels.forEach(panel => {
          if (panel.id === targetPanelId) {
            panel.classList.remove('hidden');
          } else {
            panel.classList.add('hidden');
          }
        });
      });
    });

    if (closeMobileBtn) {
      closeMobileBtn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        flyoutPanel.classList.add('hidden');
      });
    }

    // Auto-close menu when tapping outside on Mobile
    window.addEventListener('pointerdown', (e) => {
      if (window.innerWidth < 768 && !flyoutPanel.classList.contains('hidden')) {
        // If the tap was NOT on the panel itself and NOT on a sidebar button
        if (!e.target.closest('#flyout-panel') && !e.target.closest('.editor-tool-btn')) {
          toolBtns.forEach(b => b.classList.remove('active'));
          flyoutPanel.classList.add('hidden');
        }
      }
    });


    /* =========================================================
       CANVA STUDIO MASTER ENGINE v5 
    ========================================================= */
    const mainWorkspace = document.getElementById('design-canvas');
    const artLayer = document.getElementById('artwork-layer');
    const portalRing = document.getElementById('portal-ring');
    const ctxMenu = document.getElementById('canva-context-menu');
    const layersModal = document.getElementById('layers-modal');
    const topDefault = document.getElementById('top-bar-default');
    const topText = document.getElementById('top-bar-text');
    const topImage = document.getElementById('top-bar-image');
    const topShape = document.getElementById('top-bar-shape');

    let historyStack = [], historyStep = -1;
    let clipboardNode = null;

    function recordState() {
      historyStep++;
      historyStack = historyStack.slice(0, historyStep);
      historyStack.push({
        art: artLayer.innerHTML,
        canvasBg: document.getElementById('design-canvas').style.backgroundColor || '#ffffff',
        canvasDraw: document.getElementById('drawing-layer').toDataURL()
      });
      renderLayersList();
    }

    function applyHistory(step) {
      deselectAll();
      const s = historyStack[step];
      artLayer.innerHTML = s.art;
      document.getElementById('design-canvas').style.backgroundColor = s.canvasBg;
      document.getElementById('canvas-bg-color').value = rgbToHex(s.canvasBg);

      const canvas = document.getElementById('drawing-layer');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (s.canvasDraw) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = s.canvasDraw;
      }

      artLayer.querySelectorAll('[data-type="text"]').forEach(t => t.onblur = recordState);
      renderLayersList();
    }

    function rgbToHex(color) {
      if (color.startsWith('#')) return color;
      const rgb = color.match(/\d+/g);
      if (!rgb) return '#ffffff';
      return "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1);
    }

    function triggerUndo() { if (historyStep > 0) { historyStep--; applyHistory(historyStep); } }
    function triggerRedo() { if (historyStep < historyStack.length - 1) { historyStep++; applyHistory(historyStep); } }

    let selectedItem = null, activeItem = null;
    let isDragging = false, isResizing = false, isRotating = false, resizeDir = '';
    let startMetrics = {};

    // Crop Mode States
    let isCropping = false, isDraggingCrop = false, activeCropMask = null, cropGhost = null, cropStartPos = {};

    function syncRing() {
      if (!selectedItem || selectedItem.dataset.type === 'text') { portalRing.classList.add('hidden'); return; }

      const itemRect = selectedItem.getBoundingClientRect();
      const scale = window.currentCanvasScale || 1;
      const scaledW = selectedItem.offsetWidth * scale;
      const scaledH = selectedItem.offsetHeight * scale;

      if (selectedItem.dataset.rotation && selectedItem.dataset.rotation !== "0") {
        portalRing.style.left = (itemRect.left + itemRect.width / 2 - scaledW / 2) + 'px';
        portalRing.style.top = (itemRect.top + itemRect.height / 2 - scaledH / 2) + 'px';
      } else {
        portalRing.style.left = itemRect.left + 'px';
        portalRing.style.top = itemRect.top + 'px';
      }

      portalRing.style.width = scaledW + 'px';
      portalRing.style.height = scaledH + 'px';

      const rot = selectedItem.dataset.rotation || 0;
      portalRing.style.transform = `rotate(${rot}deg)`;
      portalRing.classList.remove('hidden');
    }

    function deselectAll() {
      if (selectedItem) selectedItem.classList.remove('ring-1', 'ring-dashed', 'ring-flame', 'ring-2', 'ring-offset-2', 'ring-inset');
      mainWorkspace.classList.remove('ring-2', 'ring-flame', 'ring-offset-2', 'ring-inset');
      selectedItem = null; portalRing.classList.add('hidden');
      topDefault.classList.remove('hidden');
      topDefault.classList.add('flex');
      topText.classList.add('hidden'); topText.classList.remove('flex');
      topImage.classList.add('hidden'); topImage.classList.remove('flex');
      if (topShape) { topShape.classList.add('hidden'); topShape.classList.remove('flex'); }
      if (window.syncFrameCustomizationPanels) window.syncFrameCustomizationPanels();
      renderLayersList();
    }

    function selectElement(el, type) {
      if (selectedItem === el) return;
      deselectAll(); selectedItem = el;
      topDefault.classList.add('hidden'); topDefault.classList.remove('flex');

      if (type === 'canvas') {
        el.classList.add('ring-2', 'ring-flame', 'ring-offset-2', 'ring-inset');
        topDefault.classList.remove('hidden');
        if (window.syncFrameCustomizationPanels) window.syncFrameCustomizationPanels();
        return;
      }
      else if (type === 'image') {
        const isSvg = el.querySelector('svg');
        if (isSvg) {
          topShape.classList.remove('hidden'); topShape.classList.add('flex');
          document.getElementById('shape-color').value = rgbToHex(window.getComputedStyle(el).color);
          const strokeEl = el.querySelector('[stroke-width]');
          if (strokeEl) document.getElementById('shape-thickness').value = strokeEl.getAttribute('stroke-width') || 4;
        } else {
          topImage.classList.remove('hidden'); topImage.classList.add('flex');
          const radiusSlider = document.getElementById('top-border-radius');
          if (radiusSlider) radiusSlider.value = parseInt(window.getComputedStyle(el).borderRadius) || 0;
          const maskControls = document.getElementById('mask-adjust-controls');
          if (maskControls) {
            if (el.dataset.mask === 'true' && el.querySelector('img')) {
              maskControls.classList.remove('hidden'); maskControls.classList.add('flex');
              const img = el.querySelector('img');
              const pos = window.getComputedStyle(img).objectPosition.split(' ');
              document.getElementById('mask-pan-x').value = pos[0] ? parseFloat(pos[0]) : 50;
              document.getElementById('mask-pan-y').value = pos[1] ? parseFloat(pos[1]) : 50;
            } else {
              maskControls.classList.add('hidden'); maskControls.classList.remove('flex');
            }
          }
        }
        syncRing();
        if (window.syncFrameCustomizationPanels) window.syncFrameCustomizationPanels();
      }
      else if (type === 'text') {
        el.classList.add('ring-1', 'ring-dashed', 'ring-flame');
        topText.classList.remove('hidden'); topText.classList.add('flex');
        document.getElementById('top-font-size').value = parseInt(window.getComputedStyle(el).fontSize || 32);
        if (window.syncFrameCustomizationPanels) window.syncFrameCustomizationPanels();
      }
      renderLayersList();
    }

    // CONTEXT MENU & MOUSE BRAIN
    window.hideMenu = () => ctxMenu.classList.add('hidden');
    window.addEventListener('click', e => { if (!e.target.closest('#canva-context-menu')) hideMenu(); });

    window.addEventListener('contextmenu', e => {
      const item = e.target.closest('.canvas-item');
      const isCanvas = e.target === mainWorkspace || e.target === artLayer;

      if (item || isCanvas) {
        e.preventDefault();
        if (item) selectElement(item, item.dataset.type);
        else deselectAll();

        let x = e.clientX, y = e.clientY;
        if (x + 230 > window.innerWidth) x -= 230;
        if (y + 260 > window.innerHeight) y -= 260;
        ctxMenu.style.left = x + 'px'; ctxMenu.style.top = y + 'px';
        ctxMenu.classList.remove('hidden'); lucide.createIcons();
      } else hideMenu();
    });

    // CLIPBOARD LOGIC WITH SYSTEM API OVERRIDE
    window.doCopy = () => { if (selectedItem && selectedItem !== mainWorkspace) clipboardNode = selectedItem.cloneNode(true); };
    window.doCut = () => { if (selectedItem && selectedItem !== mainWorkspace) { doCopy(); selectedItem.remove(); deselectAll(); recordState(); } };

    window.doPaste = async () => {
      if (clipboardNode) {
        const clone = clipboardNode.cloneNode(true);
        clone.style.left = (parseInt(clone.style.left || 40) + 25) + 'px';
        clone.style.top = (parseInt(clone.style.top || 40) + 25) + 'px';
        artLayer.appendChild(clone); selectElement(clone, clone.dataset.type); recordState();
        return;
      }

      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
          if (imageTypes.length > 0) {
            const blob = await clipboardItem.getType(imageTypes[0]);
            const reader = new FileReader();
            reader.onload = evt => {
              const wrap = document.createElement('div');
              wrap.className = 'canvas-item absolute cursor-move select-none bg-transparent shadow-md';
              wrap.dataset.type = 'image';
              wrap.style.left = '60px'; wrap.style.top = '60px';
              wrap.style.width = '180px'; wrap.style.height = '220px';
              wrap.innerHTML = `<img src="${evt.target.result}" class="w-full h-full object-cover pointer-events-none block">`;
              artLayer.appendChild(wrap); selectElement(wrap, 'image'); recordState();
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      } catch (err) {
        alert("Browser security blocked the right-click paste. Please press Ctrl+V on your keyboard to paste the image directly.");
      }
    };

    window.addEventListener('pointerdown', e => {
      const pHandle = e.target.closest('.portal-handle');
      if (pHandle && selectedItem) {
        e.preventDefault();
        pHandle.setPointerCapture(e.pointerId); // Locks touch to the tiny handle
        if (pHandle.dataset.dir === 'rotate') {
          isRotating = true; activeItem = selectedItem;
          const rect = activeItem.getBoundingClientRect();
          startMetrics = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
          document.getElementById('rotation-tooltip').classList.remove('hidden');
        } else {
          isResizing = true; resizeDir = pHandle.dataset.dir; activeItem = selectedItem;
          startMetrics = { x: e.clientX, y: e.clientY, w: activeItem.offsetWidth, h: activeItem.offsetHeight, l: activeItem.offsetLeft, t: activeItem.offsetTop };
        }
        return;
      }
    });

    function getRealTarget(clientX, clientY) {
      const elements = document.elementsFromPoint(clientX, clientY);
      for (let el of elements) {
        const item = el.closest('.canvas-item');
        if (!item) continue;

        // Text, masks, and SVGs are always selectable
        if (item.dataset.type === 'text' || item.dataset.mask === 'true' || item.querySelector('svg')) {
          return item;
        }

        // For images, check if the specific pixel clicked is transparent
        const img = item.querySelector('img');
        if (img) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 1; canvas.height = 1;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const rect = img.getBoundingClientRect();

            // Map click coordinates to natural image scale
            const rx = (clientX - rect.left) * (img.naturalWidth / rect.width);
            const ry = (clientY - rect.top) * (img.naturalHeight / rect.height);

            ctx.drawImage(img, rx, ry, 1, 1, 0, 0, 1, 1);
            const alpha = ctx.getImageData(0, 0, 1, 1).data[3];

            // Check z-index and alpha to ensure we don't select ghost borders
            if (alpha > 10) return item;
          } catch (e) {
            return item; // Fallback if image fails to read
          }
        } else {
          return item;
        }
      }
      return null;
    }

    mainWorkspace.addEventListener('pointerdown', e => {
      if (e.target.closest('.portal-handle')) return;

      if (isCropping) {
        const item = e.target.closest('.canvas-item');
        if (item === activeCropMask) {
          isDraggingCrop = true;
          const img = activeCropMask.querySelector('img');
          const pos = window.getComputedStyle(img).objectPosition.split(' ');
          cropStartPos = { px: parseFloat(pos[0]) || 50, py: parseFloat(pos[1]) || 50, mx: e.clientX, my: e.clientY };
          e.preventDefault();
          activeCropMask.setPointerCapture(e.pointerId);
          return;
        } else {
          exitCropMode();
        }
      }

      // Run our smart pixel checker
      const item = getRealTarget(e.clientX, e.clientY);

      if (item) {
        if (item.dataset.type === 'text' && item.contentEditable === "true") return;

        e.preventDefault();
        item.setPointerCapture(e.pointerId);
        selectElement(item, item.dataset.type);
        isDragging = true;
        activeItem = item;
        const scale = window.currentCanvasScale || 1;
        const canvasRect = mainWorkspace.getBoundingClientRect();
        const localX = (e.clientX - canvasRect.left) / scale;
        const localY = (e.clientY - canvasRect.top) / scale;
        startMetrics = { x: localX - item.offsetLeft, y: localY - item.offsetTop };
        return;
      }

      deselectAll();
    });

    window.addEventListener('pointermove', e => {
      if (!activeItem && !activeCropMask) return; e.preventDefault();

      const scale = window.currentCanvasScale || 1;
      if (isDraggingCrop && activeCropMask) {
        const dx = e.clientX - cropStartPos.mx;
        const dy = e.clientY - cropStartPos.my;
        let newX = Math.max(0, Math.min(100, cropStartPos.px - (dx / scale * 0.2)));
        let newY = Math.max(0, Math.min(100, cropStartPos.py - (dy / scale * 0.2)));

        activeCropMask.querySelector('img').style.objectPosition = `${newX}% ${newY}%`;
        if (cropGhost && cropGhost.querySelector('img')) {
          cropGhost.querySelector('img').style.objectPosition = `${newX}% ${newY}%`;
        }
        const pxSlider = document.getElementById('mask-pan-x');
        if (pxSlider) { pxSlider.value = newX; document.getElementById('mask-pan-y').value = newY; }
      }
      else if (isDragging) {
        const canvasRect = mainWorkspace.getBoundingClientRect();
        const localX = (e.clientX - canvasRect.left) / scale;
        const localY = (e.clientY - canvasRect.top) / scale;
        activeItem.style.left = (localX - startMetrics.x) + 'px';
        activeItem.style.top = (localY - startMetrics.y) + 'px';
        syncRing();

        if (activeItem.dataset.type === 'image' && !activeItem.dataset.mask && activeItem.querySelector('img')) {
          const cx = activeItem.offsetLeft + activeItem.offsetWidth / 2;
          const cy = activeItem.offsetTop + activeItem.offsetHeight / 2;
          Array.from(artLayer.querySelectorAll('.canvas-item[data-mask="true"]')).forEach(mask => {
            const mRect = mask.getBoundingClientRect();
            const cRect = mainWorkspace.getBoundingClientRect();
            const ml = (mRect.left - cRect.left) / scale, mt = (mRect.top - cRect.top) / scale;
            if (cx >= ml && cx <= ml + mask.offsetWidth && cy >= mt && cy <= mt + mask.offsetHeight) {
              mask.style.transform = 'scale(1.05)'; mask.style.boxShadow = '0 0 20px rgba(235,94,40,0.6)';
            } else {
              mask.style.transform = 'scale(1)'; mask.style.boxShadow = 'none';
            }
          });
        }
      }
      else if (isResizing) {
        let dx = (e.clientX - startMetrics.x) / scale, dy = (e.clientY - startMetrics.y) / scale;
        if (resizeDir.includes('e')) activeItem.style.width = Math.max(20, startMetrics.w + dx) + 'px';
        if (resizeDir.includes('s')) activeItem.style.height = Math.max(20, startMetrics.h + dy) + 'px';
        if (resizeDir.includes('w')) { const nw = startMetrics.w - dx; if (nw > 20) { activeItem.style.width = nw + 'px'; activeItem.style.left = (startMetrics.l + dx) + 'px'; } }
        if (resizeDir.includes('n')) { const nh = startMetrics.h - dy; if (nh > 20) { activeItem.style.height = nh + 'px'; activeItem.style.top = (startMetrics.t + dy) + 'px'; } }
        syncRing();
      }
      else if (isRotating) {
        let angle = Math.atan2(e.clientY - startMetrics.cy, e.clientX - startMetrics.cx) * (180 / Math.PI) + 90;
        angle = Math.round(angle);
        if (angle < 0) angle += 360;

        if (e.shiftKey || angle % 45 < 5 || angle % 45 > 40) {
          angle = Math.round(angle / 45) * 45;
          if (angle === 360) angle = 0;
        }

        activeItem.dataset.rotation = angle;
        activeItem.style.transform = `rotate(${angle}deg)`;
        document.getElementById('rotation-tooltip').innerText = `${angle}°`;
        syncRing();
      }
    });

    window.addEventListener('pointerup', () => {
      if (isDraggingCrop) { isDraggingCrop = false; return; }

      if (isDragging && activeItem && activeItem.dataset.type === 'image' && !activeItem.dataset.mask && activeItem.querySelector('img')) {
        const cx = activeItem.offsetLeft + activeItem.offsetWidth / 2;
        const cy = activeItem.offsetTop + activeItem.offsetHeight / 2;

        const masks = Array.from(artLayer.querySelectorAll('.canvas-item[data-mask="true"]'));
        for (let mask of masks) {
          const mRect = mask.getBoundingClientRect();
          const cRect = mainWorkspace.getBoundingClientRect();
          const ml = mRect.left - cRect.left, mt = mRect.top - cRect.top;

          if (cx >= ml && cx <= ml + mask.offsetWidth && cy >= mt && cy <= mt + mask.offsetHeight) {
            mask.innerHTML = activeItem.innerHTML;
            mask.querySelector('img').className = 'w-full h-full object-cover pointer-events-none block';
            mask.style.border = 'none'; mask.style.backgroundColor = 'transparent';
            mask.style.transform = 'scale(1)'; mask.style.boxShadow = 'none';
            activeItem.remove();
            selectElement(mask, 'image');
            break;
          } else {
            mask.style.transform = 'scale(1)'; mask.style.boxShadow = 'none';
          }
        }
      }
      window.addEventListener('pointercancel', () => {
        isDragging = false; isResizing = false; isRotating = false; activeItem = null; isDraggingCrop = false;
      });
      if (isDragging || isResizing || isRotating) recordState();
      if (isRotating) document.getElementById('rotation-tooltip').classList.add('hidden');
      isDragging = false; isResizing = false; isRotating = false; activeItem = null;
    });

    // Canva-Style Crop Mode Engine
    function enterCropMode(mask) {
      if (activeCropMask) exitCropMode();
      activeCropMask = mask;
      isCropping = true;

      mask.style.overflow = 'visible';
      mask.style.zIndex = '90';
      const img = mask.querySelector('img');
      if (img) img.style.opacity = '0.25';

      cropGhost = document.createElement('div');
      cropGhost.className = 'absolute inset-0 border-2 border-flame shadow-[0_0_0_9999px_rgba(37,36,34,0.6)] pointer-events-none overflow-hidden z-10';
      cropGhost.style.borderRadius = window.getComputedStyle(mask).borderRadius;

      if (img) {
        const ghostImg = img.cloneNode(true);
        ghostImg.style.opacity = '1';
        cropGhost.appendChild(ghostImg);
      }
      mask.appendChild(cropGhost);
      portalRing.classList.add('hidden');
    }

    function exitCropMode() {
      if (!activeCropMask) return;
      activeCropMask.style.overflow = 'hidden';
      activeCropMask.style.zIndex = '';
      const img = activeCropMask.querySelector('img');
      if (img) img.style.opacity = '1';
      if (cropGhost) cropGhost.remove();
      activeCropMask = null;
      cropGhost = null;
      isCropping = false;
      recordState();
      syncRing();
    }

    // Universal Double-Click Router
    mainWorkspace.addEventListener('dblclick', e => {
      const mask = e.target.closest('.canvas-item[data-mask="true"]');
      if (mask && mask.querySelector('img')) {
        enterCropMode(mask);
      }
    });

    // Advanced Global Paste Image Logic
    // Advanced Global Paste Image Logic (Ctrl+V)
    window.addEventListener('paste', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      function addPastedImage(src) {
        const wrap = document.createElement('div');
        wrap.className = 'canvas-item absolute cursor-move select-none bg-transparent';
        wrap.dataset.type = 'image';
        wrap.style.left = '60px'; wrap.style.top = '60px';
        wrap.style.width = '180px'; wrap.style.height = '220px';
        wrap.innerHTML = `<img src="${src}" class="w-full h-full object-cover pointer-events-none block">`;
        artLayer.appendChild(wrap);
        selectElement(wrap, 'image');
        recordState();
      }

      // 1. Check for raw Image File (Screenshots or right-click "Copy Image")
      if (clipboardData.items) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          if (clipboardData.items[i].type.indexOf('image') !== -1) {
            const file = clipboardData.items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = evt => { addPastedImage(evt.target.result); };
            reader.readAsDataURL(file);
            e.preventDefault();
            return;
          }
        }
      }

      // 2. Check for direct URL text (Right-click "Copy Image Address")
      const textData = clipboardData.getData('text/plain');
      if (textData && (textData.match(/\.(jpeg|jpg|gif|png|webp)$/i) || textData.startsWith('http') || textData.startsWith('data:image/'))) {
        addPastedImage(textData);
        e.preventDefault();
        return;
      }

      // 3. Check for HTML Image Node (Selecting elements in a browser)
      const htmlData = clipboardData.getData('text/html');
      if (htmlData) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData, 'text/html');
        const img = doc.querySelector('img');
        if (img && img.src) {
          addPastedImage(img.src);
          e.preventDefault();
        }
      }
    });

    // Pan Image Sliders Logic
    document.getElementById('mask-pan-x').addEventListener('input', function () {
      if (selectedItem && selectedItem.dataset.mask === 'true' && selectedItem.querySelector('img')) {
        const y = document.getElementById('mask-pan-y').value;
        selectedItem.querySelector('img').style.objectPosition = `${this.value}% ${y}%`;
      }
    });

    document.getElementById('mask-pan-y').addEventListener('input', function () {
      if (selectedItem && selectedItem.dataset.mask === 'true' && selectedItem.querySelector('img')) {
        const x = document.getElementById('mask-pan-x').value;
        selectedItem.querySelector('img').style.objectPosition = `${x}% ${this.value}%`;
      }
    });

    document.getElementById('mask-pan-x').addEventListener('change', recordState);
    document.getElementById('mask-pan-y').addEventListener('change', recordState);
    window.addEventListener('scroll', syncRing, true); window.addEventListener('resize', () => { syncRing(); if (typeof window.updateCanvasScale === 'function') window.updateCanvasScale(); });



    window.deleteActive = () => {
      if (selectedItem) { selectedItem.remove(); deselectAll(); recordState(); }
    };

    window.moveLayer = (dir) => {
      if (!selectedItem) return;
      if (dir === 'front') artLayer.appendChild(selectedItem);
      if (dir === 'back') artLayer.prepend(selectedItem);
      if (dir === 'forward' && selectedItem.nextElementSibling) artLayer.insertBefore(selectedItem.nextElementSibling, selectedItem);
      if (dir === 'backward' && selectedItem.previousElementSibling) artLayer.insertBefore(selectedItem, selectedItem.previousElementSibling);
      syncRing(); recordState();
    };

    window.toggleLayersModal = () => { layersModal.classList.toggle('hidden'); if (!layersModal.classList.contains('hidden')) renderLayersList(); };

    function renderLayersList() {
      const container = document.getElementById('layers-list-container'); if (!container) return;
      container.innerHTML = '';
      const items = Array.from(artLayer.children).reverse();

      items.forEach((item, i) => {
        const type = item.dataset.type || 'element';
        const isSel = (item === selectedItem);
        let label = type === 'text' ? `"${item.innerText.slice(0, 12)}..."` : `Artwork Layer #${items.length - i}`;

        const row = document.createElement('div');
        row.className = `p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs font-bold transition ${isSel ? 'bg-flame/15 border-flame text-flame' : 'bg-editorbg border-sand/40 text-charcoal hover:bg-sand/20'}`;
        row.innerHTML = `
          <div class="flex items-center gap-2 overflow-hidden"><i data-lucide="${type === 'text' ? 'type' : 'image'}" class="w-3.5 h-3.5 shrink-0"></i><span class="truncate">${label}</span></div>
          <div class="flex items-center gap-1 shrink-0">
            <button onclick="event.stopPropagation(); selectPanelItem(${items.length - 1 - i}, 'up');" class="p-1 hover:bg-white rounded text-slate"><i data-lucide="chevron-up" class="w-3 h-3"></i></button>
            <button onclick="event.stopPropagation(); selectPanelItem(${items.length - 1 - i}, 'down');" class="p-1 hover:bg-white rounded text-slate"><i data-lucide="chevron-down" class="w-3 h-3"></i></button>
          </div>`;
        row.onclick = () => selectElement(item, type);
        container.appendChild(row);
      });
      lucide.createIcons();
    }

    window.selectPanelItem = (domIdx, dir) => {
      const el = artLayer.children[domIdx];
      if (el) { selectElement(el, el.dataset.type); moveLayer(dir === 'up' ? 'forward' : 'backward'); }
    };



    // SHORTCUT BRAIN
    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItem) { e.preventDefault(); deleteActive(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) triggerRedo(); else triggerUndo(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); triggerRedo(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'c') { e.preventDefault(); doCopy(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'v') { e.preventDefault(); doPaste(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'x') { e.preventDefault(); doCut(); }
      if (e.ctrlKey && e.key === ']') { e.preventDefault(); moveLayer('front'); }
      if (e.ctrlKey && e.key === '[') { e.preventDefault(); moveLayer('back'); }
      if (e.ctrlKey && e.key === 'ArrowUp') { e.preventDefault(); moveLayer('forward'); }
      if (e.ctrlKey && e.key === 'ArrowDown') { e.preventDefault(); moveLayer('backward'); }
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (currentUser) saveProjectToDB(false);
        else showToast("Please log in to save your project.");
      }
    });

    setInterval(() => {
      if (currentUser && !document.getElementById('editor-view').classList.contains('hidden') && historyStep > 0) {
        saveProjectToDB(true);
      }
    }, 30000);

    window.addEventListener('beforeunload', () => {
      if (currentUser && historyStep > 0) {
        saveProjectToDB(true);
      }
    });

    document.getElementById('btn-undo').addEventListener('click', triggerUndo);
    document.getElementById('btn-redo').addEventListener('click', triggerRedo);
    document.getElementById('btn-delete-element').addEventListener('click', deleteActive);

    // SPAWNERS
    const presets = [{ t: "Add a heading", s: "32px", w: "800" }, { t: "Add a subheading", s: "20px", w: "700" }, { t: "Body text goes here", s: "14px", w: "400" }];
    document.querySelectorAll('#panel-text button').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        const div = document.createElement('div');
        div.className = 'canvas-item absolute cursor-move p-1 min-w-[80px] bg-transparent focus:outline-none';
        div.dataset.type = 'text'; div.style.left = '50px'; div.style.top = '50px';
        div.style.fontSize = presets[i].s; div.style.fontWeight = presets[i].w;

        // Spawn un-editable initially so it drags perfectly
        div.contentEditable = "false";
        div.innerText = presets[i].t;

        // Enable typing on double click
        div.addEventListener('dblclick', function (e) {
          this.contentEditable = "true";
          this.focus();
          this.classList.remove('cursor-move');
          this.classList.add('cursor-text');
          document.execCommand('selectAll', false, null); // Highlight text to type over immediately
        });

        // Revert to dragging when clicking away
        div.addEventListener('blur', function () {
          this.contentEditable = "false";
          this.classList.add('cursor-move');
          this.classList.remove('cursor-text');
          recordState();
        });

        artLayer.appendChild(div); selectElement(div, 'text'); recordState();
      });
    });

    const hiddenUploader = document.getElementById('real-file-uploader');
    document.querySelector('#panel-upload button:nth-child(1)').addEventListener('click', () => hiddenUploader.click());

    hiddenUploader.addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;

      if (!currentUser) {
        const localUrl = URL.createObjectURL(file);

        const wrap = document.createElement('div');
        wrap.className = 'canvas-item absolute cursor-move select-none bg-transparent';
        wrap.dataset.type = 'image'; wrap.style.left = '40px'; wrap.style.top = '40px'; wrap.style.width = '180px'; wrap.style.height = '220px';
        wrap.innerHTML = `<img src="${localUrl}" class="w-full h-full object-fill pointer-events-none block">`;
        artLayer.appendChild(wrap); selectElement(wrap, 'image'); recordState();

        myGallery.unshift(localUrl);
        renderUserGallery();
        showToast("Image added locally. Sign up to save permanently!");
        return;
      }

      showToast("Uploading Image to Cloudinary...");
      try {
        const secureUrl = await uploadToCloudinary(file);

        const wrap = document.createElement('div');
        wrap.className = 'canvas-item absolute cursor-move select-none bg-transparent';
        wrap.dataset.type = 'image'; wrap.style.left = '40px'; wrap.style.top = '40px'; wrap.style.width = '180px'; wrap.style.height = '220px';
        wrap.innerHTML = `<img src="${secureUrl}" class="w-full h-full object-fill pointer-events-none block">`;
        artLayer.appendChild(wrap); selectElement(wrap, 'image'); recordState();

        await db.collection('users').doc(currentUser.uid).collection('uploads').add({
          imageURL: secureUrl,
          uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        myGallery.unshift(secureUrl);
        renderUserGallery();
        showToast("Image saved securely to your Cloud gallery!");
      } catch (error) {
        console.error("Upload failed", error);
        showToast("Failed to upload image: " + error.message);
      }
    });

    function renderUserGallery() {
      const container = document.getElementById('recent-uploads-grid');
      if (!container) return;
      if (myGallery.length === 0) {
        container.innerHTML = `<div class="col-span-2 text-center text-xs text-slate font-bold py-4">No uploads yet.</div>`;
        return;
      }
      container.innerHTML = myGallery.slice(0, 6).map(img => `
        <div class="aspect-square bg-editorbg rounded-xl border border-sand/50 overflow-hidden cursor-pointer hover:border-flame transition" onclick="addGalleryImageToCanvas('${img}')">
          <img src="${img}" alt="User uploaded artwork template" class="w-full h-full object-cover pointer-events-none" loading="lazy">
        </div>
      `).join('');
    }

    window.addGalleryImageToCanvas = (src, cost = 0, name = "Item") => {
      const wrap = document.createElement('div');
      wrap.className = 'canvas-item absolute cursor-move select-none bg-transparent';
      wrap.dataset.type = 'image'; wrap.style.left = '60px'; wrap.style.top = '60px'; wrap.style.width = '180px'; wrap.style.height = '220px';
      wrap.dataset.cost = cost;
      wrap.dataset.itemName = name;
      wrap.innerHTML = `<img src="${src}" crossorigin="anonymous" class="w-full h-full object-fill pointer-events-none block">`;
      artLayer.appendChild(wrap); selectElement(wrap, 'image'); recordState();
    };

    // Duplicate pointerdown and getRealTarget functions removed here to fix dragging offset bugs

    window.addFrameToCanvas = (src, cost = 0, name = "Item") => {
      const canvasW = mainWorkspace.offsetWidth;
      const canvasH = mainWorkspace.offsetHeight;
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;

        // Draw to a hidden canvas to scan for the true physical borders of the frame
        const scanCanvas = document.createElement('canvas');
        scanCanvas.width = imgW;
        scanCanvas.height = imgH;
        const ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        let minX = imgW, minY = imgH, maxX = 0, maxY = 0;
        let hasVisiblePixels = false;

        try {
          const imageData = ctx.getImageData(0, 0, imgW, imgH).data;
          for (let y = 0; y < imgH; y++) {
            for (let x = 0; x < imgW; x++) {
              const alpha = imageData[(y * imgW + x) * 4 + 3];
              if (alpha > 10) { // If pixel is not transparent
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                hasVisiblePixels = true;
              }
            }
          }
        } catch (e) {
          console.warn("Could not scan frame bounds due to CORS, falling back to basic stretch.");
        }

        if (!hasVisiblePixels) {
          minX = 0; minY = 0; maxX = imgW; maxY = imgH;
        }

        const visibleW = (maxX - minX) || imgW;
        const visibleH = (maxY - minY) || imgH;

        // Calculate scale required to make the VISIBLE part perfectly fit the canvas
        const scaleX = canvasW / visibleW;
        const scaleY = canvasH / visibleH;

        const finalW = imgW * scaleX;
        const finalH = imgH * scaleY;

        const wrap = document.createElement('div');
        wrap.className = 'canvas-item absolute cursor-move select-none bg-transparent';
        wrap.dataset.type = 'image';
        wrap.style.width = finalW + 'px';
        wrap.style.height = finalH + 'px';
        wrap.dataset.cost = cost;
        wrap.dataset.itemName = name;
        // Offset the element so the transparent edges hang OUTSIDE the canvas borders
        wrap.style.left = -(minX * scaleX) + 'px';
        wrap.style.top = -(minY * scaleY) + 'px';

        wrap.innerHTML = `<img src="${src}" crossorigin="anonymous" style="width:100%; height:100%;" class="pointer-events-none block">`;
        artLayer.appendChild(wrap);
        selectElement(wrap, 'image');
        recordState();
      };
      img.src = src;
    };

    document.querySelectorAll('#shape-btn-container button').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const shape = document.createElement('div');
        shape.className = 'canvas-item absolute cursor-move w-24 h-24 shadow-sm';
        shape.dataset.type = 'image';
        shape.style.left = '60px';
        shape.style.top = '60px';
        if (idx === 0) {
          shape.classList.add('bg-sand', 'border-2', 'border-charcoal');
        }
        if (idx === 1) {
          shape.classList.add('bg-flame', 'rounded-full');
        }
        artLayer.appendChild(shape);
        selectElement(shape, 'image');
        recordState();
      });
    });

    document.getElementById('canvas-bg-color').addEventListener('input', function (e) {
      document.getElementById('design-canvas').style.backgroundColor = e.target.value;
      if (document.getElementById('mobile-canvas-bg-color')) document.getElementById('mobile-canvas-bg-color').value = e.target.value;
    });

    document.getElementById('canvas-bg-color').addEventListener('change', function (e) {
      recordState();
    });

    if (document.getElementById('mobile-canvas-bg-color')) {
      document.getElementById('mobile-canvas-bg-color').addEventListener('input', function (e) {
        document.getElementById('design-canvas').style.backgroundColor = e.target.value;
        document.getElementById('canvas-bg-color').value = e.target.value;
      });
      document.getElementById('mobile-canvas-bg-color').addEventListener('change', function (e) {
        recordState();
      });
    }

    window.flipElement = (axis) => {
      if (!selectedItem) return;
      let scaleX = selectedItem.dataset.scaleX ? parseFloat(selectedItem.dataset.scaleX) : 1;
      let scaleY = selectedItem.dataset.scaleY ? parseFloat(selectedItem.dataset.scaleY) : 1;

      if (axis === 'x') scaleX *= -1;
      if (axis === 'y') scaleY *= -1;

      selectedItem.dataset.scaleX = scaleX;
      selectedItem.dataset.scaleY = scaleY;

      const innerImg = selectedItem.querySelector('img') || selectedItem.querySelector('svg');
      if (innerImg) {
        innerImg.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
      } else {
        selectedItem.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
      }
      recordState();
    };

    window.alignElement = (pos) => {
      if (!selectedItem) return;
      const canvasW = mainWorkspace.offsetWidth;
      const canvasH = mainWorkspace.offsetHeight;
      const itemW = selectedItem.offsetWidth;
      const itemH = selectedItem.offsetHeight;

      if (pos === 'left') selectedItem.style.left = '0px';
      if (pos === 'center') selectedItem.style.left = ((canvasW - itemW) / 2) + 'px';
      if (pos === 'right') selectedItem.style.left = (canvasW - itemW) + 'px';

      syncRing();
      recordState();
    };

    window.applyBgTexture = (url) => {
      mainWorkspace.style.backgroundImage = `url('${url}')`;
      mainWorkspace.style.backgroundSize = 'cover';
      mainWorkspace.style.backgroundPosition = 'center';
      recordState();
    };

    window.addEventListener('mouseup', function () {
      if (isDrawingNow === true) {
        isDrawingNow = false;
        ctxDraw.closePath();
        recordState();
      }
    });

    window.addVectorShape = (type) => {
      const shape = document.createElement('div');
      shape.className = 'canvas-item absolute cursor-move flex items-center justify-center text-charcoal';
      shape.dataset.type = 'image';
      shape.style.left = '60px'; shape.style.top = '60px'; shape.style.width = '100px'; shape.style.height = '100px';
      let svgContent = '';

      if (type === 'square') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" fill="currentColor"/></svg>`; }
      else if (type === 'rectangle') { shape.style.height = '60px'; svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" fill="currentColor"/></svg>`; }
      else if (type === 'rounded-square') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" rx="15" fill="currentColor"/></svg>`; }
      else if (type === 'circle') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="currentColor"/></svg>`; }
      else if (type === 'triangle') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,100 0,100" fill="currentColor"/></svg>`; }
      else if (type === 'pentagon') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,38 82,100 18,100 0,38" fill="currentColor"/></svg>`; }
      else if (type === 'kite') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,30 50,100 0,30" fill="currentColor"/></svg>`; }
      else if (type === 'star') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="currentColor"/></svg>`; }
      else if (type === 'line-straight') { shape.style.height = '20px'; svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none"><line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" stroke-width="4" vector-effect="non-scaling-stroke"/></svg>`; }
      else if (type === 'line-curved') { shape.style.height = '60px'; svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none"><path d="M 0,25 Q 50,-25 100,25" fill="none" stroke="currentColor" stroke-width="4" vector-effect="non-scaling-stroke"/></svg>`; }

      else if (type === 'hollow-square') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="96" height="96" x="2" y="2" fill="none" stroke="currentColor" stroke-width="4" vector-effect="non-scaling-stroke"/></svg>`; }
      else if (type === 'hollow-circle') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="4" vector-effect="non-scaling-stroke"/></svg>`; }
      else if (type === 'hollow-rounded') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="96" height="96" x="2" y="2" rx="15" fill="none" stroke="currentColor" stroke-width="4" vector-effect="non-scaling-stroke"/></svg>`; }
      else if (type === 'hollow-pill') { shape.style.height = '50px'; shape.style.width = '120px'; svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="96" height="96" x="2" y="2" rx="48" fill="none" stroke="currentColor" stroke-width="4" vector-effect="non-scaling-stroke"/></svg>`; }

      else if (type === 'heart') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`; }
      else if (type === 'cloud') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>`; }
      else if (type === 'zap') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`; }
      else if (type === 'badge-shield') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`; }
      else if (type === 'badge-burst') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 5.09 19.5 4.5 20.09 8.91 24 12 20.09 15.09 19.5 19.5 15.09 18.91 12 22 8.91 18.91 4.5 19.5 3.91 15.09 0 12 3.91 8.91 4.5 4.5 8.91 5.09 12 2"/></svg>`; }
      else if (type === 'badge-ribbon') { svgContent = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`; }

      shape.innerHTML = svgContent;
      shape.querySelector('svg').style.pointerEvents = 'none';

      artLayer.appendChild(shape);
      selectElement(shape, 'image');
      recordState();
    };

    window.addMaskShape = (type) => {
      const shape = document.createElement('div');
      shape.className = 'canvas-item absolute cursor-move flex items-center justify-center bg-sand/30 border-2 border-dashed border-slate/40 overflow-hidden';
      shape.dataset.type = 'image';
      shape.dataset.mask = 'true';
      shape.style.left = '60px'; shape.style.top = '60px';

      if (type === 'rect') { shape.style.width = '160px'; shape.style.height = '120px'; }
      else if (type === 'square') { shape.style.width = '140px'; shape.style.height = '140px'; }
      else if (type === 'triangle') {
        shape.style.width = '140px'; shape.style.height = '140px';
        shape.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        shape.style.border = 'none'; // hide borders for complex paths
      }
      else if (type === 'star') {
        shape.style.width = '140px'; shape.style.height = '140px';
        shape.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        shape.style.border = 'none';
      }
      else if (type === 'kite') {
        shape.style.width = '120px'; shape.style.height = '160px';
        shape.style.clipPath = 'polygon(50% 0%, 100% 30%, 50% 100%, 0% 30%)';
        shape.style.border = 'none';
      }
      else if (type === 'pentagon') {
        shape.style.width = '140px'; shape.style.height = '140px';
        shape.style.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
        shape.style.border = 'none';
      }
      else if (type === 'liquid') {
        shape.style.width = '140px'; shape.style.height = '140px';
        shape.style.borderRadius = '40% 60% 70% 30% / 40% 50% 60% 50%';
      }

      shape.innerHTML = `<div class="pointer-events-none text-slate font-bold text-[10px] text-center w-full"><i data-lucide="image" class="w-6 h-6 mx-auto mb-1 opacity-50"></i>Drop Image</div>`;

      artLayer.appendChild(shape);
      selectElement(shape, 'image');
      recordState();
      lucide.createIcons();
    };

    // Global Workspace Drag & Drop Engine
    mainWorkspace.addEventListener('dragover', e => { e.preventDefault(); });
    mainWorkspace.addEventListener('drop', e => {
      e.preventDefault();
      const target = e.target.closest('.canvas-item[data-mask="true"]');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = evt => {
            if (target) {
              target.innerHTML = `<img src="${evt.target.result}" style="width:100%; height:100%; object-fit:cover; pointer-events:none;">`;
              target.style.border = 'none';
              target.style.backgroundColor = 'transparent';
              selectElement(target, 'image');
            } else {
              const wrap = document.createElement('div');
              wrap.className = 'canvas-item absolute cursor-move select-none bg-transparent';
              wrap.dataset.type = 'image';
              const scale = window.currentCanvasScale || 1;
              wrap.style.left = ((e.clientX - mainWorkspace.getBoundingClientRect().left) / scale) + 'px';
              wrap.style.top = ((e.clientY - mainWorkspace.getBoundingClientRect().top) / scale) + 'px';
              wrap.style.width = '180px'; wrap.style.height = '220px';
              wrap.innerHTML = `<img src="${evt.target.result}" class="w-full h-full object-fill pointer-events-none block">`;
              artLayer.appendChild(wrap);
              selectElement(wrap, 'image');
            }
            recordState();
          };
          reader.readAsDataURL(file);
        }
      }
    });

    let isDrawingMode = false;
    let isDrawingNow = false;
    let drawCanvas = document.getElementById('drawing-layer');
    let ctxDraw = drawCanvas.getContext('2d');
    let currentBrush = { size: 3, alpha: 1.0, cap: 'round' };

    window.setBrush = (type) => {
      document.querySelectorAll('.brush-type-btn').forEach(btn => {
        btn.classList.remove('border-flame', 'bg-flame/10', 'text-flame');
        btn.classList.add('border-sand', 'bg-white', 'text-slate');
      });
      const activeBtn = document.getElementById(`brush-btn-${type}`);
      activeBtn.classList.remove('border-sand', 'bg-white', 'text-slate');
      activeBtn.classList.add('border-flame', 'bg-flame/10', 'text-flame');

      if (type === 'pen') currentBrush = { size: 3, alpha: 1.0, cap: 'round' };
      if (type === 'bold') currentBrush = { size: 12, alpha: 1.0, cap: 'round' };
      if (type === 'faint') currentBrush = { size: 24, alpha: 0.15, cap: 'round' };
      if (type === 'marker') currentBrush = { size: 8, alpha: 0.8, cap: 'square' };
      document.getElementById('brush-size-slider').value = currentBrush.size;
    };

    document.getElementById('brush-size-slider').addEventListener('input', e => {
      currentBrush.size = parseInt(e.target.value);
    });

    document.getElementById('line-thickness').addEventListener('input', e => {
      if (selectedItem && selectedItem.dataset.type === 'image') {
        const svgs = selectedItem.querySelectorAll('line, path, rect, circle, polygon');
        svgs.forEach(el => {
          if (el.hasAttribute('stroke') || el.tagName === 'line' || el.tagName === 'path') {
            el.setAttribute('stroke-width', e.target.value);
            if (el.tagName !== 'line' && el.tagName !== 'path') el.setAttribute('stroke', 'currentColor');
          }
        });
      }
    });

    document.getElementById('line-thickness').addEventListener('change', recordState);

    document.getElementById('toggle-draw-btn').addEventListener('click', function (e) {
      if (isDrawingMode === false) {
        isDrawingMode = true;
        e.target.innerText = "Disable Drawing";
        e.target.classList.remove('bg-charcoal');
        e.target.classList.add('bg-flame');
        drawCanvas.classList.remove('pointer-events-none');
        drawCanvas.classList.add('pointer-events-auto');
        deselectAll();
      } else {
        isDrawingMode = false;
        e.target.innerText = "Enable Drawing";
        e.target.classList.add('bg-charcoal');
        e.target.classList.remove('bg-flame');
        drawCanvas.classList.add('pointer-events-none');
        drawCanvas.classList.remove('pointer-events-auto');
      }
    });

    drawCanvas.addEventListener('pointerdown', function (e) {
      if (isDrawingMode === true) {
        isDrawingNow = true;
        const rect = drawCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (drawCanvas.width / rect.width);
        const y = (e.clientY - rect.top) * (drawCanvas.height / rect.height);
        ctxDraw.beginPath();
        ctxDraw.moveTo(x, y);
      }
    });

    drawCanvas.addEventListener('pointermove', function (e) {
      if (isDrawingNow === true) {
        const rect = drawCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (drawCanvas.width / rect.width);
        const y = (e.clientY - rect.top) * (drawCanvas.height / rect.height);
        const color = document.getElementById('brush-color').value;

        ctxDraw.strokeStyle = color;
        ctxDraw.lineWidth = currentBrush.size;
        ctxDraw.lineCap = currentBrush.cap;
        ctxDraw.globalAlpha = currentBrush.alpha;

        ctxDraw.lineTo(x, y);
        ctxDraw.stroke();
      }
    });

    window.addEventListener('pointerup', function () {
      if (isDrawingNow === true) {
        isDrawingNow = false;
        ctxDraw.closePath();
      }
    });

    document.getElementById('shape-color').addEventListener('input', e => {
      if (selectedItem && selectedItem.querySelector('svg')) {
        selectedItem.style.color = e.target.value;
      }
    });
    document.getElementById('shape-color').addEventListener('change', recordState);

    document.getElementById('shape-thickness').addEventListener('input', e => {
      if (selectedItem && selectedItem.dataset.type === 'image') {
        const svgs = selectedItem.querySelectorAll('line, path, rect, circle, polygon');
        svgs.forEach(el => {
          if (el.hasAttribute('stroke') || el.tagName === 'line' || el.tagName === 'path') {
            el.setAttribute('stroke-width', e.target.value);
            if (el.tagName !== 'line' && el.tagName !== 'path') el.setAttribute('stroke', 'currentColor');
          }
        });
      }
    });
    document.getElementById('shape-thickness').addEventListener('change', recordState);
    document.getElementById('btn-delete-shape').addEventListener('click', deleteActive);



    document.getElementById('top-font-family').addEventListener('change', function () { if (selectedItem) { selectedItem.style.fontFamily = this.value; recordState(); } });
    document.getElementById('top-font-size').addEventListener('input', function () { if (selectedItem) { selectedItem.style.fontSize = this.value + 'px'; recordState(); } });
    document.getElementById('top-text-color').addEventListener('input', function () { if (selectedItem) { selectedItem.style.color = this.value; recordState(); } });

    document.getElementById('btn-bg-remover').addEventListener('click', async () => {
      if (!selectedItem || selectedItem.dataset.type !== 'image' || !selectedItem.querySelector('img')) {
        showToast("Please select a photo first.");
        return;
      }

      const imgEl = selectedItem.querySelector('img');
      const originalSrc = imgEl.src;

      const btn = document.getElementById('btn-bg-remover');
      const originalBtnHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Removing...`;
      btn.disabled = true;

      imgEl.style.transition = 'all 0.3s ease';
      imgEl.style.filter = 'blur(4px) grayscale(50%) brightness(1.2)';
      imgEl.style.opacity = '0.6';

      lucide.createIcons();

      try {
        const apiKey = "MVqFJ98Cdkzs8viUodmvdnZw";

        const imageResponse = await fetch(originalSrc);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append('image_file', imageBlob);
        formData.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': apiKey },
          body: formData
        });

        if (!response.ok) throw new Error("BG Removal failed.");

        const resultBlob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(resultBlob);
        reader.onloadend = () => {
          imgEl.src = reader.result;
          showToast("Background Removed Successfully!");
          recordState();
        };
      } catch (error) {
        console.error(error);
        showToast("Failed to remove background.");
        imgEl.src = originalSrc;
      } finally {
        imgEl.style.filter = 'none';
        imgEl.style.opacity = '1';

        btn.innerHTML = originalBtnHtml;
        btn.disabled = false;
        setTimeout(() => lucide.createIcons(), 10);
      }
    });

    document.getElementById('top-border-radius').addEventListener('input', function () {
      if (selectedItem) {
        selectedItem.style.borderRadius = this.value + 'px';
        selectedItem.style.overflow = 'hidden';
      }
    });

    document.getElementById('top-border-radius').addEventListener('change', recordState);



    recordState();

    window.exportCanvas = async (format) => {
      const canvasEl = document.getElementById('design-canvas');
      deselectAll();
      const canvas = await html2canvas(canvasEl, { scale: 2, useCORS: true });
      if (format === 'pdf') {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'l' : 'p', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save('FrameCraft-Design.pdf');
      } else {
        const link = document.createElement('a');
        link.download = `FrameCraft-Design.${format}`;
        link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 1.0);
        link.click();
      }
    };

    window.toggleFileMenu = () => {
      const menu = document.getElementById('file-dropdown');
      if (menu.classList.contains('opacity-0')) {
        menu.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        menu.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
      } else {
        menu.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        menu.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
      }
    };

    window.addEventListener('click', (e) => {
      if (!e.target.closest('#file-menu-container')) {
        const menu = document.getElementById('file-dropdown');
        if (menu && menu.classList.contains('opacity-100')) toggleFileMenu();
      }
    });

    const titleEl = document.getElementById('editor-project-title');
    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        titleEl.blur();
      }
    });

    // Variable to track selected size in resize modal
    window.selectedModalSize = null;

    window.openResizeModal = () => {
      const modal = document.getElementById('resize-modal');
      const canvasEl = document.getElementById('design-canvas');
      const standardContainer = document.getElementById('standard-resize-container');
      const frameContainer = document.getElementById('frame-resize-container');
      const frameModalSizes = document.getElementById('frame-modal-sizes');
      window.selectedModalSize = null;

      const config = window.activeFrameConfiguration;
      if (config && config.sizes && config.sizes.length > 0) {
        // Show frame specific sizes
        standardContainer.classList.add('hidden');
        frameContainer.classList.remove('hidden');
        frameModalSizes.innerHTML = config.sizes.map((size, idx) => `
          <button onclick="selectModalSize(${idx})" class="px-4 py-2 rounded-lg border-2 text-sm font-bold ${config.size && config.size.width === size.width && config.size.height === size.height ? 'border-flame bg-flame/10 text-flame' : 'border-sand/50 bg-white text-slate'} hover:border-flame transition">${size.name || `${size.width} × ${size.height}`}</button>
        `).join('');
      } else {
        // Show standard resize
        standardContainer.classList.remove('hidden');
        frameContainer.classList.add('hidden');
        document.getElementById('resize-w-input').value = canvasEl.offsetWidth;
        document.getElementById('resize-h-input').value = canvasEl.offsetHeight;
      }

      modal.classList.remove('hidden');
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
      }, 10);
    };

    window.selectModalSize = (idx) => {
      const config = window.activeFrameConfiguration;
      if (!config || !config.sizes) return;
      window.selectedModalSize = config.sizes[idx];
      const frameModalSizes = document.getElementById('frame-modal-sizes');
      frameModalSizes.innerHTML = config.sizes.map((size, i) => `
        <button onclick="selectModalSize(${i})" class="px-4 py-2 rounded-lg border-2 text-sm font-bold ${i === idx ? 'border-flame bg-flame/10 text-flame' : 'border-sand/50 bg-white text-slate'} hover:border-flame transition">${size.name || `${size.width} × ${size.height}`}</button>
      `).join('');
    };

    window.closeResizeModal = () => {
      const modal = document.getElementById('resize-modal');
      modal.classList.add('opacity-0');
      modal.querySelector('div').classList.add('scale-95');
      setTimeout(() => modal.classList.add('hidden'), 300);
    };

    window.applyResize = () => {
      const config = window.activeFrameConfiguration;
      if (config && config.sizes && config.sizes.length > 0 && window.selectedModalSize) {
        // Apply selected frame size
        config.size = window.selectedModalSize;
        window.refitActiveFrameForSize();
      } else {
        // Standard resize
        const newW = document.getElementById('resize-w-input').value;
        const newH = document.getElementById('resize-h-input').value;
        if (!newW || !newH) return;
        const canvasEl = document.getElementById('design-canvas');
        const dLayer = document.getElementById('drawing-layer');
        const frameType = document.getElementById('frame-shape-type').value;
        const w = Math.min(parseInt(newW), 1800);
        const h = Math.min(parseInt(newH), 1800);
        canvasEl.style.width = w + 'px';
        canvasEl.style.height = h + 'px';
        dLayer.width = w;
        dLayer.height = h;
        if (frameType === 'circle') {
          canvasEl.style.borderRadius = '50%';
        } else if (frameType === 'rounded') {
          canvasEl.style.borderRadius = '32px';
        } else {
          canvasEl.style.borderRadius = '0px';
        }
      }
      window.updateCanvasScale();
      recordState();
      closeResizeModal();
    };
    window.saveProjectToDB = async (isSilent = false) => {
      if (!currentUser) {
        if (!isSilent) toggleModal('login-modal');
        return;
      }
      const title = document.getElementById('editor-project-title').innerText;
      const canvasHtml = document.getElementById('artwork-layer').innerHTML;
      const bgColor = document.getElementById('design-canvas').style.backgroundColor || '#ffffff';

      const imageElements = document.getElementById('artwork-layer').querySelectorAll('img');
      const imageURLs = Array.from(imageElements).map(img => img.src);

      try {
        if (!isSilent) showToast("Saving project to Firestore...");

        const isNewProject = !currentProjectId;
        if (isNewProject) {
          currentProjectId = generateId();
        }

        const projectData = {
          id: currentProjectId,
          userID: currentUser.uid,
          title: title,
          canvasData: canvasHtml,
          backgroundColor: bgColor,
          imageURLs: imageURLs,
          date: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (isNewProject) {
          await db.collection('projects').doc(currentProjectId).set(projectData);
          myProjects.push(projectData);
        } else {
          await db.collection('projects').doc(currentProjectId).update(projectData);
          const index = myProjects.findIndex(p => p.id === currentProjectId);
          if (index !== -1) myProjects[index] = { ...myProjects[index], ...projectData };
        }

        if (!isSilent) showToast("Project saved securely!");
      } catch (error) {
        console.error(error);
        if (!isSilent) alert("Failed to save project.");
      }
    };

    // Adds pre-made items directly to checkout from landing page
    window.addStoreItemToCart = async (title, cost) => {
      if (!currentUser) {
        toggleModal('login-modal');
        return;
      }
      showToast("Adding to Cart...");

        // Dynamically find the product image on the page
        let imageSrc = "https://via.placeholder.com/400x500?text=" + encodeURIComponent(title);
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
          const h3 = card.querySelector('h3');
          if (h3 && h3.innerText.trim() === title.trim()) {
            const img = card.querySelector('img');
            if (img) imageSrc = img.src;
          }
        });

        const newItem = {
          id: generateId(),
          title: title,
          cost: cost,
          canvasData: '<div class="w-full h-full flex items-center justify-center text-slate font-bold bg-white">' + title + ' Frame Ready</div>',
          backgroundColor: '#ffffff',
          imageURL: imageSrc, // Store the preview image
          dateAdded: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('users').doc(currentUser.uid).collection('cart').doc(newItem.id).set(newItem);
        cartItems.push(newItem);
        updateCartUI();
        showToast(title + " added to your cart!");
        toggleModal('cart-modal');
    };

    // Consolidated Loader Animation and Smooth Scrolling Engine inside primary DOMContentLoaded handler
    /* =========================================
       NEW SETTINGS ENGINE 
       ========================================= */

    // 1. Tab Switcher
    window.switchSettingsTab = (tab) => {
      // Hide all panels
      document.querySelectorAll('.settings-panel').forEach(p => {
        p.classList.remove('block');
        p.classList.add('hidden');
      });

      // Show target panel
      const targetPanel = document.getElementById('set-panel-' + tab);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
        targetPanel.classList.add('block');
      }

      // Reset all sub-tab button styles
      const btns = ['colors', 'fonts', 'bg', 'tax', 'localization', 'security'];
      btns.forEach(b => {
        const btn = document.getElementById('tab-set-' + b);
        if (btn) {
          btn.className = "px-3.5 py-1.5 bg-editorbg text-slate border border-sand rounded-lg text-[11px] font-bold hover:bg-sand/30 transition whitespace-nowrap";
        }
      });

      // Highlight active sub-tab
      const activeBtn = document.getElementById('tab-set-' + tab);
      if (activeBtn) {
        activeBtn.className = "px-3.5 py-1.5 bg-flame/10 text-flame border border-flame rounded-lg text-[11px] font-bold transition whitespace-nowrap";
      }
    };

    // Settings Group Switcher
    window.switchSettingsGroup = (group) => {
      // Reset group button styles
      const groups = ['general', 'theme', 'customization'];
      groups.forEach(g => {
        const btn = document.getElementById('tab-group-' + g);
        if (btn) {
          btn.className = "px-4 py-2 bg-editorbg text-slate border border-sand rounded-lg text-xs font-bold hover:bg-sand/30 transition whitespace-nowrap";
        }
      });

      // Highlight active group
      const activeGroupBtn = document.getElementById('tab-group-' + group);
      if (activeGroupBtn) {
        activeGroupBtn.className = "px-4 py-2 bg-charcoal text-cream rounded-lg text-xs font-bold transition whitespace-nowrap";
      }

      // Hide all sub-tab rows
      const generalRow = document.getElementById('settings-subtabs-general');
      const themeRow = document.getElementById('settings-subtabs-theme');
      if (generalRow) generalRow.classList.add('hidden');
      if (themeRow) themeRow.classList.add('hidden');

      if (group === 'general') {
        if (generalRow) {
          generalRow.classList.remove('hidden');
          generalRow.classList.add('flex');
        }
        window.switchSettingsTab('tax');
      } else if (group === 'theme') {
        if (themeRow) {
          themeRow.classList.remove('hidden');
          themeRow.classList.add('flex');
        }
        window.switchSettingsTab('colors');
      } else if (group === 'customization') {
        // Hide all panels
        document.querySelectorAll('.settings-panel').forEach(p => {
          p.classList.remove('block');
          p.classList.add('hidden');
        });
        // Show customization panel
        const custPanel = document.getElementById('set-panel-customization');
        if (custPanel) {
          custPanel.classList.remove('hidden');
          custPanel.classList.add('block');
        }
        // Render dashboard
        if (window.renderCmsDashboard) {
          window.renderCmsDashboard();
        }
      }
    };

    // 2. Color target logic
    window.activeColorTarget = 'background'; // default

    // Store localized colors in memory
    window.tempColorSettings = {
      background: '#faf9f7',
      header: '#faf9f7',
      footer: '#efeeec',
      buttons: '#775a19',
      text_general: '#45474b',
      text_header: '#000102',
      text_footer: '#45474b',
      icon_color: '#000102'
    };

    // Helper to map UI targets to their specific CSS root variables
    const colorVarMap = {
      background: '--bg-color',
      header: '--header-bg',
      footer: '--footer-bg',
      buttons: '--btn-color',
      text_general: '--text-general',
      text_header: '--text-header',
      text_footer: '--text-footer',
      icon_color: '--icon-color'
    };

    window.selectColorTarget = (target, btnElement) => {
      window.activeColorTarget = target;

      // Visual button selection
      const btnContainer = document.getElementById('color-target-buttons');
      btnContainer.querySelectorAll('button').forEach(b => {
        b.className = "px-4 py-2 bg-editorbg text-slate border border-sand hover:border-flame rounded-lg text-xs font-bold transition";
      });
      btnElement.className = "px-4 py-2 bg-flame/10 text-flame border border-flame rounded-lg text-xs font-bold transition";

      // Update color picker value to match current target's memory
      document.getElementById('active-target-color').value = window.tempColorSettings[target] || '#000102';
    };

    window.previousColorSettings = null; // Memory for the undo button

    window.applyColorToTarget = () => {
      const color = document.getElementById('active-target-color').value;
      const target = window.activeColorTarget;

      // Snapshot the current state before making the change (for Undo functionality)
      window.previousColorSettings = JSON.parse(JSON.stringify(window.tempColorSettings));

      // Save to temporary state
      window.tempColorSettings[target] = color;

      // Live preview on the CSS root 
      const root = document.documentElement.style;
      if (colorVarMap[target]) {
        root.setProperty(colorVarMap[target], color);
      }

      // Re-apply CMS socials so icon inline styles update immediately if icon_color changed
      if (target === 'icon_color' && window.renderDynamicSocialsAndContact) {
        window.renderDynamicSocialsAndContact();
      }
    };

    window.undoColorChange = () => {
      if (!window.previousColorSettings) {
        showToast("Nothing to undo!");
        return;
      }

      // Restore the previous state
      window.tempColorSettings = JSON.parse(JSON.stringify(window.previousColorSettings));

      // Instantly push restored state to the CSS UI
      const root = document.documentElement.style;
      Object.keys(window.tempColorSettings).forEach(key => {
        if (colorVarMap[key]) {
          root.setProperty(colorVarMap[key], window.tempColorSettings[key]);
        }
      });

      // Visually update the color picker to reflect the undo
      document.getElementById('active-target-color').value = window.tempColorSettings[window.activeColorTarget] || '#000102';

      // Clear undo state (limits to 1 step back)
      window.previousColorSettings = null;
      showToast("Last color change undone.");

      if (window.renderDynamicSocialsAndContact) window.renderDynamicSocialsAndContact();
    };

    window.resetColorSettings = async () => {
      if (!confirm("Are you sure you want to completely reset all colors to their original default values?")) return;

      // The absolute main fallback colors
      const defaultColors = {
        background: '#faf9f7',
        header: '#faf9f7',
        footer: '#efeeec',
        buttons: '#775a19',
        text_general: '#45474b',
        text_header: '#000102',
        text_footer: '#45474b',
        icon_color: '#000102'
      };

      // Snapshot current state to allow undoing the reset
      window.previousColorSettings = JSON.parse(JSON.stringify(window.tempColorSettings));

      // Apply defaults strictly
      window.tempColorSettings = JSON.parse(JSON.stringify(defaultColors));

      // Push defaults instantly to the CSS UI
      const root = document.documentElement.style;
      Object.keys(window.tempColorSettings).forEach(key => {
        if (colorVarMap[key]) {
          root.setProperty(colorVarMap[key], window.tempColorSettings[key]);
        }
      });

      // Visually update the active color picker to match the reset
      const colorInput = document.getElementById('active-target-color');
      if (colorInput) {
        colorInput.value = window.tempColorSettings[window.activeColorTarget];
      }

      // FORCE SAVE TO DATABASE SO IT PERSISTS ON RELOAD
      try {
        await db.collection('settings').doc('advanced_colors').set(window.tempColorSettings, { merge: true });
        showToast("Colors successfully reset and saved to database!");
      } catch (e) {
        showToast("Colors reset, but failed to save to database: " + e.message);
      }
    };

    window.saveColorSettings = async () => {
      try {
        await db.collection('settings').doc('advanced_colors').set(window.tempColorSettings, { merge: true });
        showToast("Specific Color settings saved successfully!");
      } catch (e) {
        showToast("Error saving colors: " + e.message);
      }
    };

    // Ensure colors load seamlessly on startup
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const colorDoc = await db.collection('settings').doc('advanced_colors').get();
        if (colorDoc.exists) {
          const savedColors = colorDoc.data();
          window.tempColorSettings = { ...window.tempColorSettings, ...savedColors };
          const root = document.documentElement.style;
          Object.keys(window.tempColorSettings).forEach(key => {
            if (colorVarMap[key]) {
              root.setProperty(colorVarMap[key], window.tempColorSettings[key]);
            }
          });
        }
      } catch (e) { console.error("Could not load advanced colors", e); }

      // Load Fonts on Startup
      try {
        const fontDoc = await db.collection('settings').doc('advanced_fonts').get();
        if (fontDoc.exists) {
          window.tempFontSettings = { ...window.tempFontSettings, ...fontDoc.data() };
        }
        updateTypographyCSS();
      } catch (e) { console.error("Could not load advanced fonts", e); }
    });

    // 3. Typography Logic Engine
    window.activeFontTarget = 'font_general'; // default

    // Default system fonts
    const defaultFonts = {
      font_general: "'Plus Jakarta Sans', sans-serif",
      font_header: "'Oswald', sans-serif",
      font_footer: "'Plus Jakarta Sans', sans-serif"
    };

    window.tempFontSettings = JSON.parse(JSON.stringify(defaultFonts));
    window.previousFontSettings = null;

    window.selectFontTarget = (target, btnElement) => {
      window.activeFontTarget = target;

      // Visual button selection
      const btnContainer = document.getElementById('font-target-buttons');
      btnContainer.querySelectorAll('button').forEach(b => {
        b.className = "px-4 py-2 bg-editorbg text-slate border border-sand hover:border-flame rounded-lg text-xs font-bold transition";
      });
      btnElement.className = "px-4 py-2 bg-flame/10 text-flame border border-flame rounded-lg text-xs font-bold transition";

      // Update font select dropdown value
      document.getElementById('active-target-font').value = window.tempFontSettings[target];
    };

    window.applyFontToTarget = () => {
      const font = document.getElementById('active-target-font').value;
      const target = window.activeFontTarget;

      window.previousFontSettings = JSON.parse(JSON.stringify(window.tempFontSettings));
      window.tempFontSettings[target] = font;

      updateTypographyCSS();
    };

    window.undoFontChange = () => {
      if (!window.previousFontSettings) return showToast("Nothing to undo!");

      window.tempFontSettings = JSON.parse(JSON.stringify(window.previousFontSettings));
      updateTypographyCSS();

      document.getElementById('active-target-font').value = window.tempFontSettings[window.activeFontTarget];
      window.previousFontSettings = null;
      showToast("Last font change undone.");
    };

    window.resetFontSettings = async () => {
      if (!confirm("Reset all fonts to default system settings?")) return;

      window.previousFontSettings = JSON.parse(JSON.stringify(window.tempFontSettings));
      window.tempFontSettings = JSON.parse(JSON.stringify(defaultFonts));

      updateTypographyCSS();
      document.getElementById('active-target-font').value = window.tempFontSettings[window.activeFontTarget];

      try {
        await db.collection('settings').doc('advanced_fonts').set(window.tempFontSettings, { merge: true });
        showToast("Fonts successfully reset and saved!");
      } catch (e) {
        showToast("Failed to save reset: " + e.message);
      }
    };

    window.saveFontSettings = async () => {
      try {
        await db.collection('settings').doc('advanced_fonts').set(window.tempFontSettings, { merge: true });
        showToast("Typography settings saved successfully!");
      } catch (e) {
        showToast("Error saving fonts: " + e.message);
      }
    };

    window.updateTypographyCSS = () => {
      let styleTag = document.getElementById('dynamic-typography-overrides');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-typography-overrides';
        document.head.appendChild(styleTag);
      }

      styleTag.innerHTML = `
            body { font-family: ${window.tempFontSettings.font_general} !important; }
            h1, h2, h3, h4, h5, h6, .landing-header h2, .section-title, .hero-text h1, .product-card h3 { font-family: ${window.tempFontSettings.font_header} !important; }
            #site-footer, #site-footer h3, #site-footer h4, #site-footer p, #site-footer a, #site-footer li, #site-footer span { font-family: ${window.tempFontSettings.font_footer} !important; }
            i:not([class*="fa-"]):not([class*="fab"]):not([class*="fas"]), .lucide, svg, .canvas-item[data-type="text"] { font-family: inherit !important; }
        `;
    };
    // 4. Background Settings Engine
    const defaultBgSettings = {
      type: 'color',
      color: '#faf9f7',
      gradient: 'linear-gradient(135deg, #faf9f7, #e3e2e0)',
      imageURL: 'home.png',
      showText: true
    };

    window.tempBgSettings = JSON.parse(JSON.stringify(defaultBgSettings));
    window.previousBgSettings = null;

    window.changeBgType = () => {
      const type = document.getElementById('bg-type-select').value;
      document.getElementById('bg-ctrl-color').classList.add('hidden');
      document.getElementById('bg-ctrl-gradient').classList.add('hidden');
      document.getElementById('bg-ctrl-image').classList.add('hidden');

      if (type === 'color') document.getElementById('bg-ctrl-color').classList.remove('hidden');
      if (type === 'gradient') document.getElementById('bg-ctrl-gradient').classList.remove('hidden');
      if (type === 'image') document.getElementById('bg-ctrl-image').classList.remove('hidden');

      applyBgUpdate();
    };

    window.selectGradient = (grad, btn) => {
      // Visual indicator
      document.querySelectorAll('#bg-ctrl-gradient button').forEach(b => b.classList.remove('border-charcoal', 'scale-105'));
      btn.classList.add('border-charcoal', 'scale-105');

      window.tempBgSettings.gradient = grad;
      applyBgUpdate();
    };

    window.handleBgImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      document.getElementById('bg-image-name').innerText = "Uploading... please wait";

      try {
        // Reusing your existing Cloudinary connection
        const url = await uploadToCloudinary(file);
        document.getElementById('bg-image-name').innerText = file.name + " (Uploaded)";
        window.tempBgSettings.imageURL = url;
        applyBgUpdate();
      } catch (err) {
        document.getElementById('bg-image-name').innerText = "Upload failed. Try again.";
        showToast("Failed to upload image.");
      }
    };

    window.applyBgUpdate = () => {
      window.previousBgSettings = JSON.parse(JSON.stringify(window.tempBgSettings));

      window.tempBgSettings.type = document.getElementById('bg-type-select').value;
      window.tempBgSettings.color = document.getElementById('bg-solid-color').value;
      window.tempBgSettings.showText = document.getElementById('bg-show-text').checked;

      renderHomeBackground();
    };

    window.renderHomeBackground = () => {
      const heroSection = document.getElementById('hero');
      const heroImg = document.getElementById('hero-image');
      const heroTextElements = document.querySelectorAll('.hero-text, .hero-stage');
      const heroContent = document.querySelector('.hero-content');

      if (!heroSection) return;

      if (heroImg) {
        heroImg.style.display = 'none';
        if (heroImg.parentElement) heroImg.parentElement.style.display = 'none';
      }
      heroSection.style.background = 'none';

      if (window.tempBgSettings.type === 'color') {
        heroSection.style.backgroundColor = window.tempBgSettings.color;
      } else if (window.tempBgSettings.type === 'gradient') {
        heroSection.style.background = window.tempBgSettings.gradient;
      } else if (window.tempBgSettings.type === 'image') {
        if (heroImg) {
          if (heroImg.parentElement) heroImg.parentElement.style.display = 'block';

          if (window.tempBgSettings.imageURL === 'home.png') {
            heroImg.src = 'home.png';
            heroImg.style.display = 'block';
            if (heroImg.parentElement && heroImg.parentElement.tagName === 'PICTURE') {
              const sources = heroImg.parentElement.querySelectorAll('source');
              if (sources.length >= 2) {
                sources[0].srcset = 'homemob.png';
                sources[1].srcset = 'home.png';
              }
            }
          } else {
            heroImg.src = window.tempBgSettings.imageURL;
            heroImg.style.display = 'block';
            if (heroImg.parentElement && heroImg.parentElement.tagName === 'PICTURE') {
              const sources = heroImg.parentElement.querySelectorAll('source');
              sources.forEach(source => {
                source.srcset = window.tempBgSettings.imageURL;
              });
            }
          }
        }
      }

      if (heroContent) {
        heroContent.style.display = 'flex';
      }

      heroTextElements.forEach(el => {
        el.style.display = '';
      });
    };



    window.undoBgChange = () => {
      if (!window.previousBgSettings) return showToast("Nothing to undo!");
      window.tempBgSettings = JSON.parse(JSON.stringify(window.previousBgSettings));

      syncBgUI();
      renderHomeBackground();
      window.previousBgSettings = null;
      showToast("Last background change undone.");
    };

    window.resetBgSettings = async () => {
      if (!confirm("Reset Home Background to defaults?")) return;
      window.previousBgSettings = JSON.parse(JSON.stringify(window.tempBgSettings));
      window.tempBgSettings = JSON.parse(JSON.stringify(defaultBgSettings));

      syncBgUI();
      renderHomeBackground();

      try {
        await db.collection('settings').doc('advanced_bg').set(window.tempBgSettings, { merge: true });
        showToast("Background reset & saved!");
      } catch (e) { }
    };

    window.saveBgSettings = async () => {
      try {
        await db.collection('settings').doc('advanced_bg').set(window.tempBgSettings, { merge: true });
        showToast("Home Background saved successfully!");
      } catch (e) {
        showToast("Error saving background: " + e.message);
      }
    };

    window.syncBgUI = () => {
      document.getElementById('bg-type-select').value = window.tempBgSettings.type;
      document.getElementById('bg-solid-color').value = window.tempBgSettings.color;
      document.getElementById('bg-show-text').checked = window.tempBgSettings.showText;
      changeBgType();
    };

    // Auto-fetch Background config on load
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const bgDoc = await db.collection('settings').doc('advanced_bg').get();
        if (bgDoc.exists) {
          window.tempBgSettings = { ...window.tempBgSettings, ...bgDoc.data() };
          syncBgUI();
          renderHomeBackground();
        }
      } catch (e) { console.error("Could not load advanced bg", e); }
    });

    // 5. Tax Settings Engine
    const defaultTaxSettings = {
      enabled: true,
      label: 'Sales Tax',
      rate: 0.00,
      method: 'exclusive'
    };

    window.tempTaxSettings = JSON.parse(JSON.stringify(defaultTaxSettings));
    window.previousTaxSettings = null;

    window.syncTaxUI = () => {
      const isEnabled = document.getElementById('tax-enable').checked;
      const container = document.getElementById('tax-details-container');
      // Visually disable the inputs if tax is turned off
      if (isEnabled) {
        container.classList.remove('opacity-50', 'pointer-events-none');
      } else {
        container.classList.add('opacity-50', 'pointer-events-none');
      }
    };

    window.updateTaxTempState = () => {
      window.previousTaxSettings = JSON.parse(JSON.stringify(window.tempTaxSettings));
      window.tempTaxSettings.enabled = document.getElementById('tax-enable').checked;
      window.tempTaxSettings.label = document.getElementById('tax-label-input').value;
      window.tempTaxSettings.rate = parseFloat(document.getElementById('tax-rate-input').value) || 0;
      window.tempTaxSettings.method = document.getElementById('tax-calc-method').value;
    };

    window.populateTaxUI = () => {
      document.getElementById('tax-enable').checked = window.tempTaxSettings.enabled;
      document.getElementById('tax-label-input').value = window.tempTaxSettings.label || 'Sales Tax';
      document.getElementById('tax-rate-input').value = window.tempTaxSettings.rate || 0.00;
      document.getElementById('tax-calc-method').value = window.tempTaxSettings.method || 'exclusive';
      syncTaxUI();
    };

    window.undoTaxChange = () => {
      if (!window.previousTaxSettings) return showToast("Nothing to undo!");
      window.tempTaxSettings = JSON.parse(JSON.stringify(window.previousTaxSettings));
      populateTaxUI();
      window.previousTaxSettings = null;
      showToast("Last tax change undone.");
    };

    window.resetTaxSettings = async () => {
      if (!confirm("Reset Tax settings to default?")) return;
      window.previousTaxSettings = JSON.parse(JSON.stringify(window.tempTaxSettings));
      window.tempTaxSettings = JSON.parse(JSON.stringify(defaultTaxSettings));
      populateTaxUI();

      try {
        await db.collection('settings').doc('advanced_tax').set(window.tempTaxSettings, { merge: true });
        showToast("Tax settings reset & saved!");
      } catch (e) { }
    };

    window.saveTaxSettings = async () => {
      updateTaxTempState();
      try {
        await db.collection('settings').doc('advanced_tax').set(window.tempTaxSettings, { merge: true });
        showToast("Tax Settings saved successfully!");
      } catch (e) {
        showToast("Error saving tax settings: " + e.message);
      }
    };

    // Auto-fetch Tax config on load
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const taxDoc = await db.collection('settings').doc('advanced_tax').get();
        if (taxDoc.exists) {
          window.tempTaxSettings = { ...window.tempTaxSettings, ...taxDoc.data() };
        }
        populateTaxUI();
      } catch (e) { console.error("Could not load advanced tax", e); }
    });

    // 6. Currency Engine
    const defaultCurrSettings = { currency: '$' };

    window.tempCurrSettings = JSON.parse(JSON.stringify(defaultCurrSettings));
    window.previousCurrSettings = null;

    window.populateCurrUI = () => {
      document.getElementById('loc-currency-select').value = window.tempCurrSettings.currency || '$';
    };

    window.updateCurrTempState = () => {
      window.previousCurrSettings = JSON.parse(JSON.stringify(window.tempCurrSettings));
      window.tempCurrSettings.currency = document.getElementById('loc-currency-select').value;
    };

    // --- CURRENCY LOGIC ---
    window.undoCurrChange = () => {
      if (!window.previousCurrSettings) return showToast("Nothing to undo!");
      window.tempCurrSettings = JSON.parse(JSON.stringify(window.previousCurrSettings));
      window.populateCurrUI();
      window.previousCurrSettings = null;
      showToast("Last currency change undone.");
    };

    window.resetCurrSettings = async () => {
      if (!confirm("Reset Currency to default (USD)?")) return;
      window.previousCurrSettings = JSON.parse(JSON.stringify(window.tempCurrSettings));
      window.tempCurrSettings = JSON.parse(JSON.stringify(defaultCurrSettings));
      window.populateCurrUI();
      try {
        await db.collection('settings').doc('advanced_curr').set(window.tempCurrSettings, { merge: true });
        window.applyCurrency(window.tempCurrSettings.currency);
        showToast("Currency reset & applied!");
      } catch (e) { }
    };

    window.saveCurrSettings = async () => {
      window.updateCurrTempState();
      try {
        await db.collection('settings').doc('advanced_curr').set(window.tempCurrSettings, { merge: true });
        window.applyCurrency(window.tempCurrSettings.currency);
        showToast("Currency saved & applied!");
      } catch (e) {
        showToast("Error saving currency: " + e.message);
      }
    };

    window.applyCurrency = (newSymbol) => {
      const oldSymbol = window.appCurrency || '$';
      if (oldSymbol === newSymbol) return;
      window.appCurrency = newSymbol;

      const targetSelectors = [
        '.product-card p', '#chk-total', '#cart-total',
        '#finance-total-rev', '#product-detail-price',
        '#admin-orders-table-body td:nth-child(4)',
        '#admin-manage-grid .text-flame'
      ];

      targetSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el.innerHTML && el.innerHTML.includes(oldSymbol)) {
            el.innerHTML = el.innerHTML.split(oldSymbol).join(newSymbol);
          }
        });
      });

      if (typeof renderAdminOrders === 'function') renderAdminOrders();
      if (typeof renderFinanceDashboard === 'function') renderFinanceDashboard();
      if (typeof updateCartUI === 'function') updateCartUI();
      if (typeof loadProductsForLanding === 'function') loadProductsForLanding();
    };

    // Auto-fetch config on load
    window.addEventListener('DOMContentLoaded', async () => {
      // Init CMS engine
      try {
        await window.initCms();
      } catch (err) {
        console.error("CMS Initialization failed:", err);
      }

      // 1. Initial dynamic CMS pages
      await window.initDynamicPages();

      // 2. Load settings and products dynamically first
      try {
        const doc = await db.collection('settings').doc('site').get();
        if (doc.exists) {
          siteSettings = doc.data();
          applySiteSettings();
        }
        await loadProductsForLanding();
        await window.renderLandingCategories(); // Inject the dynamic categories here
      } catch (error) {
        console.error('Initialization error during dynamic load:', error);
      }
    });

    // 7. Security & Passwords Engine
    window.updateAdminCredentials = async () => {
      const newEmail = document.getElementById('sec-new-email').value.trim();
      const newPass = document.getElementById('sec-new-pass').value;
      const currentPass = document.getElementById('sec-current-pass').value;

      if (!currentPass) return showToast("Current password is required to make changes.");
      if (!newEmail && !newPass) return showToast("No new email or password provided.");

      // Prevent modifying the hardcoded "admin" offline demo
      if (currentUser && currentUser.uid === 'admin_uid') return showToast("Cannot modify the local demo admin account.");

      const user = firebase.auth().currentUser;
      if (!user) return showToast("You are not authenticated.");

      try {
        showToast("Verifying credentials...");

        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPass);
        await user.reauthenticateWithCredential(credential);

        // Update Email if provided
        if (newEmail && newEmail !== user.email) {
          await user.updateEmail(newEmail);
          await db.collection('users').doc(user.uid).update({ email: newEmail });
        }

        // Update Password if provided
        if (newPass) {
          if (newPass.length < 6) throw new Error("Password must be at least 6 characters.");
          await user.updatePassword(newPass);
        }

        // Clear inputs
        document.getElementById('sec-new-email').value = '';
        document.getElementById('sec-new-pass').value = '';
        document.getElementById('sec-current-pass').value = '';

        showToast("Credentials updated successfully!");
      } catch (error) {
        showToast("Error updating credentials: " + error.message);
      }
    };

    window.toggleCustomerBlock = async (uid, currentStatus) => {
      const action = currentStatus ? "unblock" : "block";
      if (confirm(`Are you sure you want to ${action} this customer?`)) {
        try {
          await db.collection('users').doc(uid).update({ isBlocked: !currentStatus });
          showToast(`Customer successfully ${action}ed.`);
          loadCustomers();
        } catch (e) {
          showToast("Error updating customer: " + e.message);
        }
      }
    };

    window.toggleStaffInputsForExisting = () => {
      const existingId = document.getElementById('sec-add-existing-customer').value;
      const container = document.getElementById('new-staff-inputs-container');
      if (existingId) {
        container.classList.add('hidden');
      } else {
        container.classList.remove('hidden');
      }
    };

    window.populateCustomerUpgradeDropdown = async () => {
      const dropdown = document.getElementById('sec-add-existing-customer');
      if (!dropdown) return;
      try {
        // Fetch all users to avoid missing those without explicit role fields
        const allUsersSnap = await db.collection('users').get();
        let optHtml = '<option value="">-- Create New User Account --</option>';
        allUsersSnap.docs.forEach(doc => {
          const d = doc.data();
          if (d.role !== 'admin' && doc.id !== 'admin_uid') {
            optHtml += `<option value="${doc.id}">${d.name || 'Unknown User'} (${d.email || 'No Email'})</option>`;
          }
        });
        dropdown.innerHTML = optHtml;
      } catch (e) {
        console.error("Error populating customer dropdown:", e);
      }
    };

    window.loadAdminStaff = async () => {
      const tbody = document.getElementById('admin-staff-table-body');

      // Ensure dropdown is completely populated
      window.populateCustomerUpgradeDropdown();

      if (!tbody) return;
      try {
        const snap = await db.collection('users').where('role', '==', 'admin').get();
        let html = '';
        snap.docs.forEach(doc => {
          const data = doc.data();
          if (doc.id === currentUser.uid && currentUser.uid === 'admin_uid') return; // Skip master demo
          const privs = data.privileges && data.privileges.length > 0 ? data.privileges.join(', ') : 'All/Master';
          html += `
                    <tr class="hover:bg-sand/10 border-b border-sand/30 transition">
                        <td class="px-4 py-3"><span class="font-bold block text-charcoal">${data.name || 'Unknown'}</span><span class="text-[10px] text-slate">${data.email || ''}</span></td>
                        <td class="px-4 py-3 text-[10px] text-slate font-bold uppercase max-w-[150px] truncate" title="${privs}">${privs}</td>
                        <td class="px-4 py-3 text-right">
                            <button onclick="window.revokeAdmin('${doc.id}')" class="px-2 py-1 bg-red-50 text-red-600 rounded border border-red-200 text-[10px] font-bold hover:bg-red-100 transition">Revoke</button>
                        </td>
                    </tr>
                `;
        });
        tbody.innerHTML = html || `<tr><td colspan="3" class="px-4 py-3 text-center text-xs text-slate">No extra staff accounts found.</td></tr>`;
      } catch (e) { console.error("Load staff error", e); }
    };

    window.revokeAdmin = async (uid) => {
      if (!confirm("Are you sure you want to revoke this user's access? They will lose all portal privileges and revert to a standard user.")) return;
      try {
        await db.collection('users').doc(uid).update({ role: 'user', privileges: [] });
        showToast("Staff access revoked successfully. User reverted to customer.");
        window.loadAdminStaff();
      } catch (e) {
        showToast("Error revoking staff: " + e.message);
      }
    };

    window.addNewAdmin = async () => {
      const existingId = document.getElementById('sec-add-existing-customer').value;
      const privs = [];
      document.querySelectorAll('.admin-privilege-cb:checked').forEach(cb => privs.push(cb.value));

      if (privs.length === 0) return showToast("Please select at least one privilege.");

      try {
        showToast("Assigning privileges...");

        if (existingId) {
          await db.collection('users').doc(existingId).update({
            role: 'admin',
            privileges: privs
          });
        } else {
          const name = document.getElementById('sec-add-name').value.trim();
          const email = document.getElementById('sec-add-email').value.trim();
          const pass = document.getElementById('sec-add-pass').value;

          if (!name || !email || !pass) return showToast("Please fill all fields to create a staff account.");
          if (pass.length < 6) return showToast("Password must be at least 6 characters.");

          const secondaryApp = firebase.initializeApp(firebaseConfig, "SecondaryAdminCreator");
          const res = await secondaryApp.auth().createUserWithEmailAndPassword(email, pass);
          await res.user.updateProfile({ displayName: name });

          await db.collection('users').doc(res.user.uid).set({
            email: email,
            name: name,
            role: 'admin',
            privileges: privs,
            isBlocked: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          await secondaryApp.auth().signOut();
          await secondaryApp.delete();
        }

        if (document.getElementById('sec-add-existing-customer')) document.getElementById('sec-add-existing-customer').value = '';
        if (document.getElementById('sec-add-name')) document.getElementById('sec-add-name').value = '';
        if (document.getElementById('sec-add-email')) document.getElementById('sec-add-email').value = '';
        if (document.getElementById('sec-add-pass')) document.getElementById('sec-add-pass').value = '';
        document.querySelectorAll('.admin-privilege-cb').forEach(cb => cb.checked = false);
        window.toggleStaffInputsForExisting();

        showToast("Privileged Staff successfully assigned!");
        window.loadAdminStaff();
      } catch (error) {
        showToast("Error assigning privileges: " + error.message);
      }
    };

    // Remove old unused dummy function
    if (window.updateAdminPassword) window.updateAdminPassword = undefined;

    /* =========================================
       CINEMATIC BACKGROUND SLIDER ENGINE
       ========================================= */
    (function () {
      const heroSliderImages = ['home1.png', 'home2.png', 'home3.png'];
      let currentIndex = 0;
      let slideTimer = null;
      const wrapper = document.querySelector('.hero-slides-wrapper');
      if (!wrapper) return;

      // 1. Create Slides Dynamically
      heroSliderImages.forEach((src, idx) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide${idx === 0 ? ' active' : ''}`;
        slide.style.backgroundImage = `url('${src}')`;

        // Preload slide image
        const img = new Image();
        img.src = src;

        wrapper.appendChild(slide);
      });

      const slides = wrapper.children;

      function showSlide(index) {
        if (!slides.length) return;

        let nextIndex = index;
        if (nextIndex >= slides.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = slides.length - 1;

        const currentActive = wrapper.querySelector('.hero-slide.active');
        if (currentActive) {
          currentActive.classList.remove('active');
          currentActive.classList.add('exiting');
          setTimeout(() => {
            currentActive.classList.remove('exiting');
          }, 1500);
        }

        slides[nextIndex].classList.add('active');
        currentIndex = nextIndex;

        // Preload the next upcoming slide in buffer
        const preloadIdx = (nextIndex + 1) % slides.length;
        const preloadImg = new Image();
        preloadImg.src = heroSliderImages[preloadIdx];
      }

      function nextSlide() {
        showSlide(currentIndex + 1);
      }

      function prevSlide() {
        showSlide(currentIndex - 1);
      }

      function startAutoplay() {
        stopAutoplay();
        slideTimer = setInterval(nextSlide, 10000);
      }

      function stopAutoplay() {
        if (slideTimer) clearInterval(slideTimer);
      }

      // Start autoplay initially
      startAutoplay();

      // Manual navigation
      const prevBtn = document.getElementById('hero-prev-btn');
      const nextBtn = document.getElementById('hero-next-btn');

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          prevSlide();
          startAutoplay();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          nextSlide();
          startAutoplay();
        });
      }

      // Touch swipe support (Mobile)
      let touchStartX = 0;
      let touchEndX = 0;
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        heroSection.addEventListener('touchstart', e => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        heroSection.addEventListener('touchend', e => {
          touchEndX = e.changedTouches[0].screenX;
          const threshold = 55;
          if (touchStartX - touchEndX > threshold) {
            nextSlide();
            startAutoplay();
          } else if (touchEndX - touchStartX > threshold) {
            prevSlide();
            startAutoplay();
          }
        }, { passive: true });
      }

      // Keyboard arrow triggers
      document.addEventListener('keydown', e => {
        const activeView = window.currentActiveView || 'landing';
        if (activeView === 'landing') {
          if (e.key === 'ArrowRight') {
            nextSlide();
            startAutoplay();
          } else if (e.key === 'ArrowLeft') {
            prevSlide();
            startAutoplay();
          }
        }
      });
    })();

    /* =========================================
       PREMIUM SCROLL ANIMATIONS ENGINE
       ========================================= */
    (function () {
      // 1. Initial counter animator
      function startCounterAnimation(el) {
        const rawVal = el.textContent || '';
        const numberMatch = rawVal.match(/\d+/);
        if (!numberMatch) return;
        const target = parseInt(numberMatch[0]);
        const suffix = rawVal.substring(rawVal.indexOf(numberMatch[0]) + numberMatch[0].length);
        const prefix = rawVal.substring(0, rawVal.indexOf(numberMatch[0]));
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = progress * (2 - progress); // easeOutQuad
          const currentVal = Math.floor(easeProgress * target);
          el.textContent = prefix + currentVal + suffix;
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = rawVal;
          }
        }
        requestAnimationFrame(updateCounter);
      }

      // 2. Setup Intersection Observer
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.08
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');

            // Trigger numbers counters
            const counters = entry.target.querySelectorAll('.animate-counter');
            counters.forEach(c => startCounterAnimation(c));

            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // 3. Expose register function globally to support dynamic templates staggering
      window.initScrollAnimations = function () {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('animated'));
          return;
        }

        // Apply staggers programmatically to Product grids
        document.querySelectorAll('.products-grid .product-card').forEach((card, idx) => {
          if (!card.classList.contains('scroll-animate')) {
            card.classList.add('scroll-animate', 'scale-up');
            card.style.transitionDelay = `${(idx % 4) * 100}ms`;
          }
        });

        // Apply staggers to FAQ list items
        document.querySelectorAll('.faq-item').forEach((item, idx) => {
          if (!item.classList.contains('scroll-animate')) {
            item.classList.add('scroll-animate', 'scale-up');
            item.style.transitionDelay = `${(idx % 4) * 100}ms`;
          }
        });

        // Observe elements
        document.querySelectorAll('.scroll-animate').forEach(el => {
          if (!el.classList.contains('animated')) {
            observer.observe(el);
          }
        });
      };

      // Bootstrap observer on startup
      window.addEventListener('load', () => {
        setTimeout(window.initScrollAnimations, 200);
      });
    })();
  