(function () {
  // ==========================================
  // 1. DEFAULT CUSTOMIZATION SCHEMA REGISTRY
  // ==========================================
  window.defaultCustomization = {
    navigation: [
      { id: "nav_home", name: "HOME", url: "/", enabled: true },
      {
        id: "nav_products", name: "PRODUCTS", url: "/products", enabled: true, dropdown: [
          { name: "Premium Frames", url: "/products" },
          { name: "Standard Frames", url: "/products" },
          { name: "Wooden Frames", url: "/products" },
          { name: "Metal Frames", url: "/products" },
          { name: "Floating Frames", url: "/products" },
          { name: "Canvas Frames", url: "/products" },
          { name: "Custom Frames", url: "/products" }
        ]
      },
      {
        id: "nav_contact", name: "CONTACT", url: "/contact", enabled: true, dropdown: [
          { name: "Contact Us", url: "/contact" },
          { name: "Phone", url: "tel:+15551234567" },
          { name: "Email", url: "mailto:hello@framecraft.com" },
          { name: "FAQ", url: "/faq" },
          { name: "Business Hours", url: "/contact" },
          { name: "Our Location", url: "/contact" }
        ]
      },
      { id: "nav_about", name: "ABOUT US", url: "/about-us", enabled: true }
    ],
    social: [
      { id: "social_fb", name: "Facebook", icon: "fa-brands fa-facebook-f", url: "https://facebook.com", enabled: true },
      { id: "social_ig", name: "Instagram", icon: "fa-brands fa-instagram", url: "https://instagram.com", enabled: true },
      { id: "social_x", name: "X (Twitter)", icon: "fa-brands fa-x-twitter", url: "https://x.com", enabled: true },
      { id: "social_wa", name: "WhatsApp", icon: "fa-brands fa-whatsapp", url: "https://wa.me/923001234567", enabled: true },
      { id: "social_pin", name: "Pinterest", icon: "fa-brands fa-pinterest-p", url: "https://pinterest.com", enabled: true },
      { id: "social_tt", name: "TikTok", icon: "fa-brands fa-tiktok", url: "https://tiktok.com", enabled: true },
      { id: "social_yt", name: "YouTube", icon: "fa-brands fa-youtube", url: "https://youtube.com", enabled: true },
      { id: "social_li", name: "LinkedIn", icon: "fa-brands fa-linkedin-in", url: "https://linkedin.com", enabled: true }
    ],
    contactInfo: {
      phone: "+1 (555) 123-4567",
      email: "hello@framecraft.com",
      address: "123 Artisan Street, Craft City, CC 12345",
      workingHours: "Mon - Fri: 9:00 AM - 6:00 PM",
      googleMapsLink: "https://maps.google.com",
      locationName: "Craft City",
      supportEmail: "support@framecraft.com",
      businessEmail: "hello@framecraft.com"
    },
    logos: {
      type: "text",
      textPrefix: "Frame",
      textSuffix: "Craft",
      lightLogoUrl: "",
      darkLogoUrl: "",
      faviconUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%23252422'/><text x='50' y='72' font-family='Arial' font-size='68' font-weight='bold' fill='%23eb5e28' text-anchor='middle'>F</text></svg>",
      appIconUrl: "",
      footerLogoUrl: "",
      loadingLogoUrl: "",
      hideBranding: false,
      brandingPage: "/",
      brandingCustomUrl: ""
    },
    seo: {
      "/": {
        title: "FrameCraft Studio | Online Bespoke Picture Framing & Custom Dimension Workspace",
        description: "Design bespoke custom picture frames online. Enter exact millimeter dimensions, choose from solid wood, walnut, and modern metal materials, and customize artisan frame templates.",
        keywords: "custom framing studio, bespoke picture frames, millimeter precision frames, online frame customizer, solid wood picture frames, museum glass framing, picture frame templates, web-to-print frames, custom size frames",
        ogTitle: "FrameCraft Studio | Online Bespoke Picture Framing & Custom Dimension Workspace",
        ogDescription: "Design bespoke custom picture frames online. Enter exact millimeter dimensions, choose from solid wood, walnut, and modern metal materials, and customize artisan frame templates.",
        ogImage: "home.png",
        canonicalUrl: ""
      },
      "/products": {
        title: "Premium Custom Picture Frames Collection | FrameCraft Studio",
        description: "Explore our collection of hand-crafted solid wood and modern metal picture frames. Available in custom dimensions with museum-grade glass.",
        keywords: "custom picture frames, wood frames, metal frames, canvas framing",
        ogTitle: "Premium Custom Picture Frames Collection | FrameCraft Studio",
        ogDescription: "Explore our collection of hand-crafted solid wood and modern metal picture frames.",
        ogImage: "home.png",
        canonicalUrl: ""
      },
      "/about-us": {
        title: "About Our Artisan Framing Workshop | FrameCraft Studio",
        description: "Learn about FrameCraft Studio's heritage, our artisan custom framing workshop, and our commitment to museum-grade picture framing.",
        keywords: "about custom framing, artisan framing, custom frame makers",
        ogTitle: "About Our Artisan Framing Workshop | FrameCraft Studio",
        ogDescription: "Learn about FrameCraft Studio's heritage, our artisan custom framing workshop, and our commitment to museum-grade picture framing.",
        ogImage: "home.png",
        canonicalUrl: ""
      },
      "/contact": {
        title: "Contact FrameCraft Studio | Custom Framing Customer Support",
        description: "Get in touch with our team for questions about bespoke frames, bulk orders, or custom projects. Phone: (555) 123-4567, Email: support@framecraft.com.",
        keywords: "contact framecraft, customer support framing",
        ogTitle: "Contact FrameCraft Studio | Custom Framing Customer Support",
        ogDescription: "Get in touch with our team for questions about bespoke frames, bulk orders, or custom projects.",
        ogImage: "home.png",
        canonicalUrl: ""
      },
      "/faq": {
        title: "Frequently Asked Questions | FrameCraft Studio Picture Framing",
        description: "Have questions about our custom picture frames, pricing, dimensions, or shipping? Read our detailed FAQs to learn more.",
        keywords: "faq custom framing, shipping picture frames",
        ogTitle: "Frequently Asked Questions | FrameCraft Studio",
        ogDescription: "Have questions about our custom picture frames, pricing, dimensions, or shipping?",
        ogImage: "home.png",
        canonicalUrl: ""
      }
    },
    pages: {
      home: {
        title: "Home Page",
        sections: {
          hero: {
            title: "Hero Section",
            elements: {
              eyebrow: {
                type: "text",
                label: "Eyebrow Text",
                value: "Bespoke framing, made personal",
                style: {}
              },
              heading: {
                type: "text",
                label: "Hero Title",
                value: "BEST CUSTOM <span style=\"color: var(--btn-color);\">FRAMES</span>",
                style: {}
              },
              description: {
                type: "rich-text",
                label: "Hero Description",
                value: "Elevate your art with gallery-worthy precision and premium artisan finishes.",
                style: {}
              },
              primary_btn: {
                type: "button",
                label: "Primary CTA Button",
                text: "Explore Frames",
                url: "#frames-section",
                openNewTab: false,
                style: {}
              },
              secondary_btn: {
                type: "button",
                label: "Secondary CTA Button",
                text: "Start Creating",
                url: "/dashboard",
                openNewTab: false,
                style: {}
              },
              trust_bar: {
                type: "text",
                label: "Trust Info Bar",
                value: "Crafted to order · Premium materials · Secure checkout",
                style: {}
              },
              bg_image: {
                type: "image",
                label: "Hero Image (Desktop)",
                value: "home.png",
                altText: "Home Screen",
                title: "FrameCraft Gallery Showcase",
                lazyLoading: false
              }
            }
          },
          products_sec: {
            title: "Our Products Section",
            elements: {
              title: {
                type: "text",
                label: "Section Title",
                value: "OUR PRODUCTS",
                style: {}
              },
              subtitle: {
                type: "text",
                label: "Section Subtitle",
                value: "Premium Quality Custom Frames",
                style: {}
              }
            }
          }
        }
      },
      about: {
        title: "About Page",
        sections: {
          content: {
            title: "About Content",
            elements: {
              heading: {
                type: "text",
                label: "Main Title",
                value: "ABOUT US",
                style: {}
              },
              subheading: {
                type: "text",
                label: "Subheading Title",
                value: "Crafting Memories Since 2010",
                style: {}
              },
              paragraph1: {
                type: "rich-text",
                label: "Artisan Paragraph 1",
                value: "At FrameCraft, we believe that every picture tells a story, and every story deserves a beautiful frame. We specialize in creating bespoke, custom picture frames that perfectly complement your cherished memories.",
                style: {}
              },
              paragraph2: {
                type: "rich-text",
                label: "Artisan Paragraph 2",
                value: "Our skilled artisans combine traditional craftsmanship with modern technology to create frames that are not just functional, but also works of art in their own right.",
                style: {}
              },
              stat1_val: {
                type: "text",
                label: "Stat 1 Number",
                value: "13+",
                style: {}
              },
              stat1_lbl: {
                type: "text",
                label: "Stat 1 Description",
                value: "Years Experience",
                style: {}
              },
              stat2_val: {
                type: "text",
                label: "Stat 2 Number",
                value: "10K+",
                style: {}
              },
              stat2_lbl: {
                type: "text",
                label: "Stat 2 Description",
                value: "Happy Customers",
                style: {}
              },
              stat3_val: {
                type: "text",
                label: "Stat 3 Number",
                value: "500+",
                style: {}
              },
              stat3_lbl: {
                type: "text",
                label: "Stat 3 Description",
                value: "Frame Designs",
                style: {}
              },
              workshop_image: {
                type: "image",
                label: "Workshop Showcase Image",
                value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRr3UtwXB-RiIwmGdjaTTDfX7mOFbmGH5LAmVq-xgTNNEJ-zEHX8FYwbYOI&s=10",
                altText: "FrameCraft Workshop Team and Custom Framing Tools",
                title: "Our Handcrafted Frame Workshop",
                lazyLoading: true
              }
            }
          }
        }
      },
      contact: {
        title: "Contact Page",
        sections: {
          content: {
            title: "Contact Details",
            elements: {
              heading: {
                type: "text",
                label: "Main Title",
                value: "GET IN TOUCH",
                style: {}
              },
              info_heading: {
                type: "text",
                label: "Info Column Title",
                value: "Contact Information",
                style: {}
              },
              form_heading: {
                type: "text",
                label: "Form Column Title",
                value: "Send Us a Message",
                style: {}
              },
              form_submit: {
                type: "button",
                label: "Form Submit Button",
                text: "Send Message",
                url: "",
                openNewTab: false,
                style: {}
              }
            }
          }
        }
      },
      faq: {
        title: "FAQ Page",
        sections: {
          content: {
            title: "FAQ Content",
            elements: {
              heading: {
                type: "text",
                label: "Page Title",
                value: "Frequently Asked Questions",
                style: {}
              }
            }
          }
        }
      },
      checkout: {
        title: "Checkout Page",
        sections: {
          content: {
            title: "Checkout Headers",
            elements: {
              heading: {
                type: "text",
                label: "Page Title",
                value: "Secure Checkout",
                style: {}
              },
              success_heading: {
                type: "text",
                label: "Order Success Title",
                value: "Order Validated & Confirmed",
                style: {}
              },
              success_subheading: {
                type: "text",
                label: "Order Success Reference Label",
                value: "Bespoke Reference Code:",
                style: {}
              }
            }
          }
        }
      },
      login_signup: {
        title: "Auth Modals",
        sections: {
          login: {
            title: "Login Window",
            elements: {
              title: {
                type: "text",
                label: "Greeting Title",
                value: "Welcome back",
                style: {}
              },
              btn_text: {
                type: "text",
                label: "Login Button Text",
                value: "Log In",
                style: {}
              }
            }
          },
          signup: {
            title: "Signup Window",
            elements: {
              title: {
                type: "text",
                label: "Greeting Title",
                value: "Create Account",
                style: {}
              },
              btn_text: {
                type: "text",
                label: "Signup Button Text",
                value: "Sign Up",
                style: {}
              }
            }
          }
        }
      },
      cart: {
        title: "Cart Sidebar",
        sections: {
          general: {
            title: "Labels",
            elements: {
              title: {
                type: "text",
                label: "Cart Header Title",
                value: "Your Shopping Cart",
                style: {}
              }
            }
          }
        }
      },
      notFound: {
        title: "404 Page",
        sections: {
          general: {
            title: "General Content",
            elements: {
              title: {
                type: "text",
                label: "Main Title",
                value: "404 - Page Not Found",
                style: {}
              },
              desc: {
                type: "text",
                label: "Description message",
                value: "The page you are looking for does not exist or has been relocated.",
                style: {}
              }
            }
          }
        }
      },
      footer: {
        title: "Footer Section",
        sections: {
          general: {
            title: "Footer Text Columns",
            elements: {
              desc: {
                type: "text",
                label: "Footer Description",
                value: "Crafting beautiful frames for your beautiful memories since 2010.",
                style: {}
              },
              quick_links: {
                type: "text",
                label: "Quick Links Title",
                value: "Quick Links",
                style: {}
              },
              services: {
                type: "text",
                label: "Services Column Title",
                value: "Services",
                style: {}
              },
              contact: {
                type: "text",
                label: "Contact Column Title",
                value: "Contact Info",
                style: {}
              },
              copyright: {
                type: "text",
                label: "Footer Copyright Text",
                value: "© 2024 FrameCraft. All rights reserved. | Designed by <a href='https://grouperlogic.com/' target='_blank' style='text-decoration:underline;'>grouperlogic.com</a>",
                style: {}
              },
              quick_links_items: {
                type: "links",
                label: "Quick Links Management",
                value: [
                  { name: "Home", page: "/", customUrl: "", color: "" },
                  { name: "Products", page: "/products", customUrl: "", color: "" },
                  { name: "About", page: "/about-us", customUrl: "", color: "" },
                  { name: "Contact", page: "/contact", customUrl: "", color: "" }
                ]
              },
              services_items: {
                type: "links",
                label: "Services Links",
                value: [
                  { name: "Custom Framing", page: "/dashboard", customUrl: "", color: "" },
                  { name: "Photo Printing", page: "", customUrl: "#frames-section", color: "" },
                  { name: "Frame Restoration", page: "", customUrl: "#contact-section", color: "" },
                  { name: "Corporate Orders", page: "", customUrl: "#contact-section", color: "" }
                ]
              },
              contact_items: {
                type: "links",
                label: "Contact Items",
                value: [
                  { name: "Address", page: "", customUrl: "", color: "", icon: "map-pin", text: "123 Artisan Street, Craft City" },
                  { name: "Email", page: "", customUrl: "", color: "", icon: "mail", text: "hello@framecraft.com" },
                  { name: "Phone", page: "", customUrl: "", color: "", icon: "phone", text: "+1 (555) 123-4567" }
                ]
              }
            }
          }
        }
      }
    },
    right_action_btn: {
      enabled: true,
      visible: true,
      text: "Start Creating",
      iconUrl: "",
      iconSource: "none",
      page: "/dashboard",
      customUrl: "",
      dropdown: []
    },
    right_action_buttons: [
      {
        id: "action_cart",
        name: "Cart",
        iconUrl: "",
        iconSource: "none",
        defaultIcon: "shopping-cart",
        page: "",
        customUrl: "",
        url: "",
        enabled: true,
        visible: true,
        showBeforeLogin: true,
        actionType: "cart"
      },
      {
        id: "action_orders",
        name: "Order Tracking",
        iconUrl: "",
        iconSource: "none",
        defaultIcon: "package",
        page: "/order-tracking",
        customUrl: "",
        url: "/order-tracking",
        enabled: true,
        visible: true,
        showBeforeLogin: true,
        actionType: "orders"
      },
      {
        id: "action_profile",
        name: "Profile",
        iconUrl: "",
        iconSource: "none",
        defaultIcon: "user",
        page: "",
        customUrl: "",
        url: "",
        enabled: true,
        visible: true,
        showBeforeLogin: false,
        actionType: "profile",
        dropdown: [
          { name: "My Profile", page: "/user-profile", customUrl: "", url: "/user-profile", enabled: true, visible: true },
          { name: "My Projects", page: "/dashboard", customUrl: "", url: "/dashboard", enabled: true, visible: true },
          { name: "My Orders", page: "/orders-tracking", customUrl: "", url: "/orders-tracking", enabled: true, visible: true },
          { name: "Settings", page: "/user-settings", customUrl: "", url: "/user-settings", enabled: true, visible: true }
        ]
      }
    ]
  };

  window.publicCustomization = {};
  window.draftCustomization = {};
  window.quillInstances = {};

  // Deep clone utility
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Deep merge target with source
  function mergeDefaults(target, defaults) {
    for (const key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
          if (!target[key]) target[key] = {};
          mergeDefaults(target[key], defaults[key]);
        } else {
          if (target[key] === undefined) {
            target[key] = clone(defaults[key]);
          }
        }
      }
    }
  }

  // ==========================================
  // 2. INITIALIZATION AND FIRESTORE LOAD
  // ==========================================
  window.initCms = async function () {
    // Inject global responsive font-size rules
    let cmsGlobalStyle = document.getElementById('cms-global-styles');
    if (!cmsGlobalStyle) {
      cmsGlobalStyle = document.createElement('style');
      cmsGlobalStyle.id = 'cms-global-styles';
      cmsGlobalStyle.textContent = `
        .cms-responsive-text {
          font-size: var(--font-size-desktop) !important;
        }
        @media (max-width: 1024px) {
          .cms-responsive-text {
            font-size: var(--font-size-tablet, var(--font-size-desktop)) !important;
          }
        }
        @media (max-width: 640px) {
          .cms-responsive-text {
            font-size: var(--font-size-mobile, var(--font-size-tablet, var(--font-size-desktop))) !important;
          }
        }
      `;
      document.head.appendChild(cmsGlobalStyle);
    }

    try {
      const doc = await db.collection('settings').doc('customization').get();
      let dbData = {};
      if (doc.exists) {
        dbData = doc.data();
      }
      // Merge with defaults to ensure future-ready items are populated
      mergeDefaults(dbData, window.defaultCustomization);
      window.publicCustomization = clone(dbData);
      window.draftCustomization = clone(dbData);

    } catch (e) {
      console.error("CMS Initialization Error:", e);
      window.publicCustomization = clone(window.defaultCustomization);
      window.draftCustomization = clone(window.defaultCustomization);
    }
  };

  // Helper getters
  window.getCmsValue = function (pathString) {
    const parts = pathString.split('.');
    let cur = window.draftCustomization;
    for (const p of parts) {
      if (cur === undefined || cur === null) return undefined;
      cur = cur[p];
    }
    return cur;
  };

  // Helper setter
  window.setCmsValue = function (pathString, val) {
    const parts = pathString.split('.');
    let cur = window.draftCustomization;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cur[p]) cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = val;
    window.applyCmsPreview(pathString);
    window.checkCmsDirty();
  };

  // ==========================================
  // 3. STYLE APPLIER UTILITIES
  // ==========================================
  window.applyCmsStyles = function (el, style) {
    if (!el || !style) return;
    el.style.fontFamily = style.fontFamily || '';
    el.style.fontWeight = style.fontWeight || '';
    el.style.fontStyle = style.fontStyle || '';
    el.style.color = style.color || '';
    el.style.backgroundColor = style.backgroundColor || '';
    el.style.letterSpacing = style.letterSpacing ? style.letterSpacing + 'px' : '';
    el.style.lineHeight = style.lineHeight || '';
    el.style.textAlign = style.textAlign || '';
    el.style.textTransform = style.textTransform || '';
    el.style.textDecoration = style.textDecoration || '';
    el.style.textShadow = style.textShadow || '';
    el.style.opacity = style.opacity !== undefined ? style.opacity : '';
    el.style.maxWidth = style.maxWidth || '';
    el.style.animation = style.animation || '';

    // Visibility
    if (style.visibility === 'hidden') {
      el.classList.add('hidden');
    } else {
      el.classList.remove('hidden');
    }

    // Spacing
    el.style.marginTop = style.marginTop ? style.marginTop + 'px' : '';
    el.style.marginBottom = style.marginBottom ? style.marginBottom + 'px' : '';
    el.style.marginLeft = style.marginLeft ? style.marginLeft + 'px' : '';
    el.style.marginRight = style.marginRight ? style.marginRight + 'px' : '';
    el.style.paddingTop = style.paddingTop ? style.paddingTop + 'px' : '';
    el.style.paddingBottom = style.paddingBottom ? style.paddingBottom + 'px' : '';
    el.style.paddingLeft = style.paddingLeft ? style.paddingLeft + 'px' : '';
    el.style.paddingRight = style.paddingRight ? style.paddingRight + 'px' : '';

    // Responsive fonts using CSS custom properties
    if (style.fontSize) el.style.setProperty('--font-size-desktop', style.fontSize + 'px');
    else el.style.removeProperty('--font-size-desktop');

    if (style.fontSizeTablet) el.style.setProperty('--font-size-tablet', style.fontSizeTablet + 'px');
    else el.style.removeProperty('--font-size-tablet');

    if (style.fontSizeMobile) el.style.setProperty('--font-size-mobile', style.fontSizeMobile + 'px');
    else el.style.removeProperty('--font-size-mobile');

    if (style.fontSize || style.fontSizeTablet || style.fontSizeMobile) {
      el.classList.add('cms-responsive-text');
    } else {
      el.classList.remove('cms-responsive-text');
    }

    // Custom classes
    if (el.dataset.originalClass === undefined) {
      el.dataset.originalClass = el.className || '';
    }
    el.className = el.dataset.originalClass + (style.customClass ? ' ' + style.customClass : '');
  };

  // Apply single element customization
  window.applySingleElement = function (el, pathString) {
    const config = window.getCmsValue(pathString);
    if (!config) return;

    // Apply Content
    if (config.type === 'text') {
      el.innerHTML = config.value; // Changed to innerHTML to allow span injections
    } else if (config.type === 'rich-text') {
      el.innerHTML = config.value;
    } else if (config.type === 'button') {
      el.innerText = config.text;

      // Apply button unique styling parameters
      if (config.style) {
        const style = config.style;
        if (style.background) el.style.backgroundColor = style.background;
        if (style.textColor) el.style.color = style.textColor;
        if (style.borderRadius) el.style.borderRadius = style.borderRadius + 'px';
        if (style.padding) {
          el.style.paddingTop = style.padding + 'px';
          el.style.paddingBottom = style.padding + 'px';
        }
        if (style.width) el.style.width = style.width;
        if (style.shadow) el.style.boxShadow = style.shadow;
        if (style.border) el.style.border = style.border;

        // Add dynamic style element for button hover colors if specified
        if (style.hoverBackground || style.hoverColor) {
          const hoverClass = `cms-hover-btn-${pathString.replace(/\./g, '-')}`;
          el.classList.add(hoverClass);
          let styleEl = document.getElementById(`style-${hoverClass}`);
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = `style-${hoverClass}`;
            document.head.appendChild(styleEl);
          }
          styleEl.textContent = `
            .${hoverClass}:hover {
              background-color: ${style.hoverBackground || style.background} !important;
              color: ${style.hoverColor || style.textColor} !important;
            }
          `;
        }

        // Add Button Icon
        if (style.icon) {
          const iconPos = style.iconPosition || 'left';
          // Check if icon already exists
          let iconEl = el.querySelector('.cms-btn-icon');
          if (!iconEl) {
            iconEl = document.createElement('i');
            iconEl.className = 'cms-btn-icon ' + (iconPos === 'left' ? 'mr-2' : 'ml-2');
            if (iconPos === 'left') el.prepend(iconEl);
            else el.append(iconEl);
          }
          // Support FontAwesome classes e.g. fa-solid fa-star
          iconEl.className = 'cms-btn-icon ' + style.icon + ' ' + (iconPos === 'left' ? 'mr-2' : 'ml-2');
        } else {
          el.querySelector('.cms-btn-icon')?.remove();
        }
      }

      // Button link handler redirection
      el.onclick = function (e) {
        if (config.url) {
          e.preventDefault();
          if (config.url.startsWith('#')) {
            window.scrollToSection(config.url.replace('#', ''));
          } else {
            if (config.openNewTab) {
              window.open(config.url, '_blank');
            } else {
              window.handlePathRouting(config.url);
            }
          }
        }
      };
    }

    // Apply General styles for non-button or layout styles
    if (config.style) {
      window.applyCmsStyles(el, config.style);
    }

    // Apply Link properties if text-link is enabled
    if (config.link && config.link.enabled) {
      if (el.tagName !== 'A') {
        // Wrap with standard link or attach click redirect
        el.style.cursor = 'pointer';
        el.title = config.link.title || '';
        el.setAttribute('aria-label', config.link.ariaLabel || '');
        el.onclick = function (e) {
          e.preventDefault();
          if (config.link.openNewTab) {
            window.open(config.link.url, '_blank', config.link.noFollow ? 'nofollow' : '');
          } else {
            window.handlePathRouting(config.link.url);
          }
        };
      }
    }
  };

  // Update dynamic elements in active preview
  window.applyCmsPreview = function (pathString) {
    document.querySelectorAll(`[data-cms="${pathString}"]`).forEach(el => {
      window.applySingleElement(el, pathString);
    });

    // Special renders
    if (pathString.startsWith('logos')) {
      window.renderDynamicLogos();
    }
    // NOTE: Header and Footer CMS renderers are permanently disabled here 
    // to preserve the custom hardcoded premium UI layout.
  };

  // Sweep the whole DOM and apply customization values
  window.applyCmsAll = function () {
    // 1. Dynamic logos
    window.renderDynamicLogos();

    // NOTE: Header and Footer CMS renderers are permanently disabled here 
    // to preserve the custom hardcoded premium UI layout.
  }; // <-- ADD THIS CLOSING BRACE

  window.renderDynamicRightActionButtons = function () {
    const container = document.getElementById('nav-auth-buttons');
    if (!container) return;

    if (window.currentUser && window.currentUser.role === 'admin') {
      container.innerHTML = `
        <div class="hidden md:flex items-center gap-3">
          <span class="material-symbols-outlined cursor-pointer hover:text-[#775a19] transition-colors text-[#000102] text-[22px]">search</span>
          <span class="material-symbols-outlined cursor-pointer hover:text-[#775a19] transition-colors text-[#000102] text-[22px]" onclick="toggleModal('cart-modal')">shopping_cart</span>
        </div>
        <div class="h-6 w-px bg-outline-variant/30 hidden md:block mx-2"></div>
        <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-[#000102]"><span class="material-symbols-outlined">menu</span></button>
        <div class="w-10 h-10 rounded-full bg-[#000102] text-[#ffffff] flex items-center justify-center font-bold shadow-md cursor-pointer" onclick="handleLogout()" title="Logout">A</div>
      `;
      return;
    }

    let html = '<div class="hidden md:flex items-center gap-3">';
    html += `
      <span class="material-symbols-outlined cursor-pointer hover:text-[#775a19] transition-colors text-[#000102] text-[22px]">search</span>
      <span class="material-symbols-outlined cursor-pointer hover:text-[#775a19] transition-colors text-[#000102] text-[22px]" onclick="toggleModal('cart-modal')">shopping_cart</span>
    `;
    html += '</div><div class="h-6 w-px bg-outline-variant/30 hidden md:block mx-2"></div>';

    if (window.currentUser) {
      const userRole = (window.currentUser.role === 'admin') ? 'ADMINISTRATOR' : 'ARTISAN MEMBER';
      html += `
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-[#000102] text-[#ffffff] flex items-center justify-center text-base font-bold shadow-md cursor-pointer shrink-0" onclick="document.getElementById('profile-dropdown-menu').classList.toggle('hidden'); if(window.lucide) lucide.createIcons();">
            ${(window.currentUser.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div id="profile-dropdown-menu" class="hidden absolute right-0 top-full mt-3 w-64 bg-white border border-gray-200/90 shadow-2xl rounded-none z-[1010] overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-200/80 bg-[#f4f3f0]">
              <p class="text-[11px] font-bold text-[#9e7024] uppercase tracking-wider mb-1">${userRole}</p>
              <p class="font-serif text-[15px] text-[#111111] leading-tight truncate font-normal">${window.currentUser.email || ''}</p>
            </div>
            <div class="py-1">
              <button onclick="if(window.showUserProfilePage){window.showUserProfilePage();}else{switchView('user-profile');} document.getElementById('profile-dropdown-menu').classList.add('hidden')" class="w-full flex items-center gap-3.5 px-5 py-2.5 text-[14px] font-medium text-[#111111] hover:bg-gray-50 transition-colors text-left border-none bg-transparent cursor-pointer">
                <i data-lucide="user" class="w-4 h-4 text-[#2d3748] stroke-[1.8]"></i>
                <span>My Profile</span>
              </button>
              <button onclick="switchView('dashboard'); switchDashboardTab('projects'); document.getElementById('profile-dropdown-menu').classList.add('hidden')" class="w-full flex items-center gap-3.5 px-5 py-2.5 text-[14px] font-medium text-[#111111] hover:bg-gray-50 transition-colors text-left border-none bg-transparent cursor-pointer">
                <i data-lucide="palette" class="w-4 h-4 text-[#2d3748] stroke-[1.8]"></i>
                <span>My Projects</span>
              </button>
              <button onclick="switchView('orders-tracking'); document.getElementById('profile-dropdown-menu').classList.add('hidden')" class="w-full flex items-center gap-3.5 px-5 py-2.5 text-[14px] font-medium text-[#111111] hover:bg-gray-50 transition-colors text-left border-none bg-transparent cursor-pointer">
                <i data-lucide="truck" class="w-4 h-4 text-[#2d3748] stroke-[1.8]"></i>
                <span>Order Tracking</span>
              </button>
              <button onclick="if(window.showUserSettingsPage){window.showUserSettingsPage();}else{switchView('user-settings');} document.getElementById('profile-dropdown-menu').classList.add('hidden')" class="w-full flex items-center gap-3.5 px-5 py-2.5 text-[14px] font-medium text-[#111111] hover:bg-gray-50 transition-colors text-left border-none bg-transparent cursor-pointer">
                <i data-lucide="settings" class="w-4 h-4 text-[#2d3748] stroke-[1.8]"></i>
                <span>Settings</span>
              </button>
            </div>
            <div class="border-t border-gray-200/80">
              <button onclick="handleLogout()" class="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] font-bold text-[#991b1b] hover:bg-red-50/60 transition-colors text-left border-none bg-transparent cursor-pointer">
                <i data-lucide="log-out" class="w-4 h-4 text-[#991b1b] stroke-[2]"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        <button onclick="toggleMobileMenu()" class="md:hidden material-symbols-outlined p-2 text-[#000102]">menu</button>
      `;
    } else {
      html += `
        <button onclick="toggleModal('login-modal')" class="hidden sm:block text-[14px] font-bold px-7 py-2.5 border border-[#000102] text-[#000102] hover:bg-[#000102] hover:text-[#ffffff] transition-all duration-300 rounded">Login</button>
        <button onclick="toggleModal('signup-modal')" class="hidden md:block text-[14px] font-bold px-7 py-2.5 bg-[#000102] text-[#ffffff] hover:bg-[#775a19] transition-all duration-300 shadow-sm rounded">Signup</button>
        <button onclick="toggleMobileMenu()" class="md:hidden material-symbols-outlined p-2 text-[#000102]">menu</button>
      `;
    }

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  };

  // ==========================================
  // 4. DYNAMIC LOGOS, NAVIGATION & SOCIALS
  // ==========================================
  window.renderDynamicLogos = function () {
    const conf = window.draftCustomization.logos || {};
    // Apply Favicon
    if (conf.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = conf.faviconUrl;
    }

    // Apply main header logo
    const lightTextLogo = document.getElementById('logo-light-text');
    const darkTextLogo = document.getElementById('logo-dark-text');
    const lightImgLogo = document.getElementById('logo-light-img');
    const darkImgLogo = document.getElementById('logo-dark-img');

    // Branding toggles
    const logoContainers = document.querySelectorAll('.header-branding-container');
    logoContainers.forEach(container => {
      if (conf.hideBranding) {
        container.classList.add('hidden');
      } else {
        container.classList.remove('hidden');

        // Handle custom click destination
        const destUrl = conf.brandingCustomUrl || conf.brandingPage || '/';
        container.style.cursor = 'pointer';
        container.onclick = (e) => {
          e.preventDefault();
          window.handlePathRouting(destUrl);
        };
      }
    });

    if (conf.type === 'text') {
      if (lightTextLogo) {
        lightTextLogo.classList.remove('hidden');
        lightTextLogo.innerHTML = `<span>${conf.textPrefix || ''}</span><span class="text-flame">${conf.textSuffix || ''}</span>`;
      }
      if (darkTextLogo) {
        darkTextLogo.classList.remove('hidden');
        darkTextLogo.innerHTML = `<span>${conf.textPrefix || ''}</span><span class="text-flame">${conf.textSuffix || ''}</span>`;
      }
      if (lightImgLogo) lightImgLogo.classList.add('hidden');
      if (darkImgLogo) darkImgLogo.classList.add('hidden');
    } else {
      if (lightTextLogo) lightTextLogo.classList.add('hidden');
      if (darkTextLogo) darkTextLogo.classList.add('hidden');
      if (lightImgLogo && conf.lightLogoUrl) {
        lightImgLogo.classList.remove('hidden');
        lightImgLogo.src = conf.lightLogoUrl;
      }
      if (darkImgLogo && conf.darkLogoUrl) {
        darkImgLogo.classList.remove('hidden');
        darkImgLogo.src = conf.darkLogoUrl;
      }
    }
  };

  window.renderDynamicNavigation = function () {
    const navItems = window.draftCustomization.navigation || [];

    // Render Right Action Buttons
    window.renderDynamicRightActionButtons();

    // 1. Render Desktop Nav links
    const desktopContainer = document.getElementById('header-nav-links');
    if (desktopContainer) {
      let html = '';
      navItems.forEach(item => {
        if (!item.enabled) return;
        const resolvedUrl = item.customUrl ? item.customUrl : (item.page || '/');
        const linkClass = item.name.toUpperCase() === 'HOME'
          ? "text-[#000102] font-bold text-[15px] hover:text-[#775a19] transition-colors"
          : "text-[#45474b] text-[15px] hover:text-[#775a19] transition-colors";

        if (item.dropdown && item.dropdown.length > 0) {
          html += `
            <div class="nav-dropdown-container relative">
              <a href="${resolvedUrl}" class="${linkClass} flex items-center dropdown-trigger" onclick="event.preventDefault(); window.handlePathRouting('${resolvedUrl}')">
                ${item.name} <span class="material-symbols-outlined text-[14px] ml-1">expand_more</span>
              </a>
              <div class="dropdown-menu absolute top-full left-0 mt-2 w-48 bg-white shadow-xl rounded-md opacity-0 pointer-events-none transition-all flex flex-col py-2 border border-outline-variant/30 z-50">
                ${item.dropdown.map(d => {
            const resolvedSubUrl = d.customUrl ? d.customUrl : (d.page || '/');
            return `<a href="${resolvedSubUrl}" class="px-4 py-2 hover:bg-surface-container-low text-primary transition-colors block" onclick="event.preventDefault(); window.handlePathRouting('${resolvedSubUrl}'); window.closeAllDropdowns()">${d.name}</a>`;
          }).join('')}
              </div>
            </div>
          `;
        } else {
          html += `<a href="${resolvedUrl}" onclick="event.preventDefault(); window.handlePathRouting('${resolvedUrl}')" class="${linkClass}">${item.name}</a>`;
        }
      });

      desktopContainer.innerHTML = html;
    }

    // 2. Render Mobile Navigation
    const mobileContainer = document.getElementById('mobile-nav-links');
    if (mobileContainer) {
      let html = '';
      navItems.forEach(item => {
        if (!item.enabled) return;
        const resolvedUrl = item.customUrl ? item.customUrl : (item.page || '/');
        if (item.dropdown && item.dropdown.length > 0) {
          html += `
            <div class="space-y-3">
              <span class="block text-xs font-bold text-slate uppercase tracking-wider">${item.name}</span>
              <div class="pl-4 space-y-3 border-l-2 border-sand/30">
                ${item.dropdown.map(d => {
            const resolvedSubUrl = d.customUrl ? d.customUrl : (d.page || '/');
            return `<a href="${resolvedSubUrl}" onclick="event.preventDefault(); window.handlePathRouting('${resolvedSubUrl}'); toggleMobileMenu()" class="block text-sm font-semibold text-charcoal">${d.name}</a>`;
          }).join('')}
              </div>
            </div>
          `;
        } else {
          html += `<a href="${resolvedUrl}" onclick="event.preventDefault(); window.handlePathRouting('${resolvedUrl}'); toggleMobileMenu()" class="block text-lg font-bold text-charcoal">${item.name}</a>`;
        }
      });

      mobileContainer.innerHTML = html;
    }

    // 3. Render Footer Nav Quick Links
    const footerContainer = document.getElementById('footer-nav-links');
    if (footerContainer) {
      let html = '';
      const quickLinksEl = window.draftCustomization.pages?.footer?.sections?.general?.elements?.quick_links_items;
      if (quickLinksEl && Array.isArray(quickLinksEl.value)) {
        quickLinksEl.value.forEach(item => {
          const url = item.customUrl || item.page || '/';
          const styleAttr = item.color ? `style="color: ${item.color} !important;"` : '';
          html += `<li><a href="${url}" onclick="event.preventDefault(); window.handlePathRouting('${url}')" class="hover:text-primary transition-colors block" ${styleAttr}>${item.name}</a></li>`;
        });
      } else {
        navItems.forEach(item => {
          if (!item.enabled) return;
          let displayName = item.name;
          if (displayName.toUpperCase() === 'ABOUT US') displayName = 'About';
          else if (displayName.toUpperCase() === 'CONTACT US') displayName = 'Contact';

          displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();

          html += `<li><a href="${item.url}" onclick="event.preventDefault(); window.handlePathRouting('${item.url}')" class="hover:text-primary transition-colors block">${displayName}</a></li>`;
        });
      }
      footerContainer.innerHTML = html;
    }

    // 3b. Render Footer Services Links
    const servicesContainer = document.getElementById('footer-services-links');
    if (servicesContainer) {
      const servicesEl = window.draftCustomization.pages?.footer?.sections?.general?.elements?.services_items;
      if (servicesEl && Array.isArray(servicesEl.value)) {
        let html = '';
        servicesEl.value.forEach(item => {
          const url = item.customUrl || item.page || '#';
          const styleAttr = item.color ? `style="color: ${item.color} !important;"` : '';

          let clickHandler = `onclick="event.preventDefault(); window.handlePathRouting('${url}')"`;
          if (url.startsWith('#')) {
            const sectionId = url.replace('#', '');
            clickHandler = `onclick="event.preventDefault(); scrollToSection('${sectionId}')"`;
          }

          html += `<li><a href="${url}" ${clickHandler} class="hover:text-primary transition-colors block" ${styleAttr}>${item.name}</a></li>`;
        });
        servicesContainer.innerHTML = html;
      }
    }

    // Rebind dropdown trigger events
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
  };

  window.renderDynamicSocialsAndContact = function () {
    const socials = window.draftCustomization.social || [];
    const contact = window.draftCustomization.contactInfo || {};

    // 3. Footer socials
    const footerSocials = document.getElementById('footer-socials') || document.querySelector('#site-footer .flex.gap-4');
    if (footerSocials) {
      let html = '';
      const iconMap = {
        'fa-facebook-f': 'face_nod',
        'fa-instagram': 'camera',
        'fa-x-twitter': 'share',
        'fa-pinterest-p': 'potted_plant',
        'fa-youtube': 'play_circle'
      };
      socials.forEach(s => {
        if (!s.enabled) return;
        let matIcon = 'link';
        Object.keys(iconMap).forEach(k => { if (s.icon.includes(k)) matIcon = iconMap[k]; });

        html += `
          <a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.name}">
            <span class="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-primary">${matIcon}</span>
          </a>
        `;
      });
      footerSocials.innerHTML = html;
    }

    // 4. Contact section cards
    const contactSec = document.getElementById('contact-section');
    if (contactSec) {
      const items = contactSec.querySelectorAll('.flex.items-center.gap-4');
      if (items.length >= 4) {
        items[0].querySelector('p').innerText = contact.address;
        items[1].querySelector('p').innerText = contact.email;
        items[2].querySelector('p').innerText = contact.phone;
        items[3].querySelector('p').innerText = contact.workingHours;
      }
    }

    // 5. Footer Contact Info list
    const footerContact = document.querySelector('#site-footer h4[data-cms="footer.general.contact"] + ul');
    if (footerContact) {
      const contactEl = window.draftCustomization.pages?.footer?.sections?.general?.elements?.contact_items;
      if (contactEl && Array.isArray(contactEl.value)) {
        let html = '';
        contactEl.value.forEach(item => {
          let textVal = item.text;
          if (item.name === "Address" && !textVal) textVal = contact.address;
          if (item.name === "Email" && !textVal) textVal = contact.email;
          if (item.name === "Phone" && !textVal) textVal = contact.phone;

          const colorStyle = item.color ? `style="color: ${item.color} !important;"` : '';

          let content = textVal;
          if (item.name === "Email") {
            const mailUrl = item.customUrl || item.page || `mailto:${textVal}`;
            content = `<a href="${mailUrl}" class="hover:text-primary transition-colors block" ${colorStyle}>${textVal}</a>`;
          } else if (item.name === "Phone") {
            const telUrl = item.customUrl || item.page || `tel:${textVal}`;
            content = `<a href="${telUrl}" class="hover:text-primary transition-colors block" ${colorStyle}>${textVal}</a>`;
          } else {
            const mapUrl = item.customUrl || item.page || contact.googleMapsLink;
            if (mapUrl) {
              content = `<a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors block" ${colorStyle}>${textVal}</a>`;
            } else {
              content = `<span class="block" ${colorStyle}>${textVal}</span>`;
            }
          }

          html += `<li class="">${content}</li>`;
        });
        footerContact.innerHTML = html;
      } else {
        const items = footerContact.querySelectorAll('li');
        if (items.length >= 3) {
          items[0].innerHTML = `<a class="hover:text-primary transition-colors block" href="/faq">${contact.address}</a>`;
          items[1].innerHTML = `<a class="hover:text-primary transition-colors block" href="/faq">${contact.email}</a>`;
          items[2].innerHTML = `<a class="hover:text-primary transition-colors block" href="/faq">${contact.phone}</a>`;
        }
      }
    }
  };

  // SEO Update logic
  window.updateSEOMetadata = function (options) {
    const cleanPath = options.path || "/";
    const seoData = window.draftCustomization.seo?.[cleanPath] || {};

    document.title = seoData.title || options.title;

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', seoData.description || options.description || '');

    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) keywordsMeta.setAttribute('content', seoData.keywords || options.keywords || '');

    // OpenGraph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seoData.ogTitle || seoData.title || '');

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seoData.ogDescription || seoData.description || '');

    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', seoData.ogImage || options.ogImage || 'home.png');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', seoData.canonicalUrl || options.canonicalUrl || window.location.href);
    }

    // Structured Data
    document.getElementById('seo-jsonld')?.remove();
    if (options.schema) {
      const schemaEl = document.createElement('script');
      schemaEl.id = 'seo-jsonld';
      schemaEl.type = 'application/ld+json';
      schemaEl.text = JSON.stringify(options.schema, null, 2);
      document.head.appendChild(schemaEl);
    }
  };

  // ==========================================
  // 5. UNCHANGED SAVE & RESET ACTIONS
  // ==========================================
  window.saveCmsChanges = async function () {
    if (window.playGlobalLoader) window.playGlobalLoader("Saving Changes...", null, false);
    try {
      await db.collection('settings').doc('customization').set(window.draftCustomization);
      window.publicCustomization = clone(window.draftCustomization);
      window.applyCmsAll();
      window.checkCmsDirty();
      // Ensure we call a function that actually exists in index.html to show toasts
      if (typeof showToast !== 'undefined') showToast("Customization settings published successfully!");
      else alert("Customization settings published successfully!");
    } catch (e) {
      console.error(e);
      if (typeof showToast !== 'undefined') showToast("Error saving customization settings");
      else alert("Error saving customization settings");
    } finally {
      if (window.hideGlobalLoader) setTimeout(() => window.hideGlobalLoader(), 500);
    }
  };

  window.resetCmsScope = function (scope, pageKey = null, sectionKey = null) {
    let confirmMsg = "Are you sure you want to reset this website customization?";
    if (scope === 'section') confirmMsg = `Reset the "${sectionKey}" section back to defaults?`;
    else if (scope === 'page') confirmMsg = `Reset all sections on the "${pageKey}" page?`;

    if (!confirm(confirmMsg)) return;

    if (scope === 'entire') {
      window.draftCustomization = clone(window.defaultCustomization);
    } else if (scope === 'page' && pageKey) {
      window.draftCustomization.pages[pageKey] = clone(window.defaultCustomization.pages[pageKey]);
    } else if (scope === 'section' && pageKey && sectionKey) {
      window.draftCustomization.pages[pageKey].sections[sectionKey] = clone(window.defaultCustomization.pages[pageKey].sections[sectionKey]);
    }

    // Reapply and update forms
    window.applyCmsAll();
    window.checkCmsDirty();
    if (pageKey) window.openCmsPageEditor(pageKey);
    else window.renderCmsDashboard();

    showToast("Reverted changes to code defaults (click Save to publish).");
  };

  window.checkCmsDirty = function () {
    const isDirty = JSON.stringify(window.draftCustomization) !== JSON.stringify(window.publicCustomization);
    const saveBar = document.getElementById('cms-unsaved-alert-bar');
    if (saveBar) {
      if (isDirty) {
        saveBar.classList.remove('translate-y-24');
        saveBar.classList.add('translate-y-0');
      } else {
        saveBar.classList.remove('translate-y-0');
        saveBar.classList.add('translate-y-24');
      }
    }
  };

  window.discardCmsChanges = function () {
    if (confirm("Discard all unsaved customizations?")) {
      window.draftCustomization = clone(window.publicCustomization);
      window.applyCmsAll();
      window.checkCmsDirty();
      window.renderCmsDashboard();
      showToast("Unsaved changes discarded.");
    }
  };

  // ==========================================
  // 6. RENDER CMS DASHBOARD & PANELS
  // ==========================================
  window.renderCmsDashboard = function () {
    const container = document.getElementById('set-panel-customization');
    if (!container) return;

    // Reset editor instance registry
    window.quillInstances = {};

    let html = `
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-charcoal">Website Customization Panel</h3>
            <p class="text-xs text-slate">Customize labels, styling, links, images, social channels and layout rules across the studio pages.</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="window.resetCmsScope('entire')" class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-extrabold rounded-lg transition flex items-center gap-1">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Reset Website Defaults
            </button>
          </div>
        </div>

        <!-- Search and Filter Bar -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-editorbg/50 p-4 rounded-2xl border border-sand/40">
          <div class="md:col-span-2 relative">
            <input type="text" id="cms-search-input" oninput="window.handleCmsSearchFilter()" placeholder="Search text or labels..." class="w-full pl-10 pr-4 py-2.5 bg-white border border-sand rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:border-flame transition">
            <i data-lucide="search" class="w-4 h-4 text-slate absolute left-3.5 top-3.5"></i>
          </div>
          <div>
            <select id="cms-filter-select" onchange="window.handleCmsSearchFilter()" class="w-full px-3 py-2.5 bg-white border border-sand rounded-xl text-xs font-semibold text-charcoal focus:outline-none focus:border-flame transition cursor-pointer">
              <option value="">All Section Categories</option>
              <option value="pages">Normal Pages</option>
              <option value="headers">Headers & Navigation</option>
              <option value="social">Social Channels</option>
              <option value="logos">Logos & Icons</option>
              <option value="contact">Contact Details</option>
              <option value="seo">SEO Metadata</option>
            </select>
          </div>
        </div>

        <!-- Cards Listing View -->
        <div id="cms-dashboard-cards-grid" class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <!-- Dynamically populated page cards -->
        </div>

        <!-- Dynamic Modal/Drawer Editor Frame -->
        <div id="cms-item-editor-frame" class="hidden bg-editorbg p-6 rounded-3xl border border-sand/60 shadow-sm space-y-6">
          <!-- Back button and editor form -->
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Load elements initially
    window.handleCmsSearchFilter();
  };

  // Search & Filter execution
  window.handleCmsSearchFilter = function () {
    const q = document.getElementById('cms-search-input')?.value.toLowerCase() || "";
    const filter = document.getElementById('cms-filter-select')?.value || "";
    const grid = document.getElementById('cms-dashboard-cards-grid');
    if (!grid) return;

    // Define dashboard page options
    const cards = [
      { id: 'logos', name: 'Logos & App Icons', desc: 'Favicon, Light/Dark logo assets configurations', type: 'logos', icon: 'image' },
      { id: 'navigation', name: 'Header Customization', desc: 'Company branding, header links, action buttons', type: 'headers', icon: 'layout' },
      { id: 'social', name: 'Social Media Icons', desc: 'Facebook, Instagram, WhatsApp links', type: 'social', icon: 'share-2' },
      { id: 'contactInfo', name: 'Contact Information', desc: 'Centralized support details', type: 'contact', icon: 'contact' },
      { id: 'seo', name: 'Global SEO Metadata', desc: 'Meta tags, OG parameters', type: 'seo', icon: 'globe' },
      // Pages
      { id: 'page_home', name: 'Home Page CMS', desc: 'Hero block, product title headers', type: 'pages', pageKey: 'home', icon: 'home' },
      { id: 'page_about', name: 'About Page CMS', desc: 'Artisan text paragraphs, statistics, workshop image', type: 'pages', pageKey: 'about', icon: 'info' },
      { id: 'page_contact', name: 'Contact Page CMS', desc: 'Contact details and send forms', type: 'pages', pageKey: 'contact', icon: 'mail' },
      { id: 'page_faq', name: 'FAQ Page CMS', desc: 'Answers & questions heading values', type: 'pages', pageKey: 'faq', icon: 'help-circle' },
      { id: 'page_checkout', name: 'Checkout Page CMS', desc: 'Validation text titles, success overlays', type: 'pages', pageKey: 'checkout', icon: 'credit-card' },
      { id: 'page_login_signup', name: 'Auth Forms CMS', desc: 'Login details, signup modals text', type: 'pages', pageKey: 'login_signup', icon: 'lock' },
      { id: 'page_cart', name: 'Cart Panel CMS', desc: 'Shopping cart drawer headings', type: 'pages', pageKey: 'cart', icon: 'shopping-cart' },
      { id: 'page_notFound', name: '404 Fallback CMS', desc: 'Page not found titles', type: 'pages', pageKey: 'notFound', icon: 'alert-triangle' },
      { id: 'page_footer', name: 'Footer Columns CMS', desc: 'Services links, copyrights, column texts', type: 'pages', pageKey: 'footer', icon: 'layout' }
    ];

    const filtered = cards.filter(c => {
      // Filter by type
      if (filter && c.type !== filter) return false;

      // Filter by query
      if (q) {
        const matchesName = c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
        if (matchesName) return true;

        // Deep inspect contents
        if (c.pageKey) {
          const page = window.draftCustomization.pages[c.pageKey];
          return JSON.stringify(page).toLowerCase().includes(q);
        }
        return false;
      }
      return true;
    });

    let html = "";
    filtered.forEach(c => {
      let clickAttr = "";
      if (c.pageKey) {
        clickAttr = `onclick="window.openCmsPageEditor('${c.pageKey}')"`;
      } else {
        clickAttr = `onclick="window.openCmsSpecialEditor('${c.id}')"`;
      }

      html += `
        <button ${clickAttr} class="flex flex-col text-left p-5 bg-white border border-sand/40 hover:border-flame hover:shadow-md rounded-2xl transition duration-300 group">
          <div class="w-10 h-10 rounded-xl bg-flame/10 text-flame flex items-center justify-center mb-4 transition duration-300 group-hover:scale-105">
            <i data-lucide="${c.icon}" class="w-5 h-5"></i>
          </div>
          <h4 class="text-sm font-bold text-charcoal mb-1 truncate w-full">${c.name}</h4>
          <p class="text-[10px] text-slate font-medium line-clamp-2">${c.desc}</p>
        </button>
      `;
    });

    grid.innerHTML = html || `<div class="col-span-full py-8 text-center text-xs font-semibold text-slate">No matching CMS sections found.</div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  // Back button UI
  function renderEditorHeader(title, onBackCall) {
    return `
      <div class="flex items-center justify-between border-b border-sand/40 pb-4 mb-4">
        <div class="flex items-center gap-3">
          <button onclick="${onBackCall}" class="w-8 h-8 rounded-lg bg-white border border-sand flex items-center justify-center text-slate hover:text-charcoal hover:shadow-sm transition">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
          </button>
          <h4 class="text-base font-extrabold text-charcoal">${title}</h4>
        </div>
      </div>
    `;
  }

  // ==========================================
  // 7. SPECIFIC EDITOR PANEL BUILDERS
  // ==========================================

  // A. Page-level accordion editors
  window.openCmsPageEditor = function (pageKey) {
    const grid = document.getElementById('cms-dashboard-cards-grid');
    const editor = document.getElementById('cms-item-editor-frame');
    if (!grid || !editor) return;

    grid.classList.add('hidden');
    editor.classList.remove('hidden');

    const page = window.draftCustomization.pages[pageKey];
    let html = renderEditorHeader(`${page.title} Editor`, 'window.renderCmsDashboard()');

    // Add page-level reset
    html += `
      <div class="flex justify-end mb-4">
        <button onclick="window.resetCmsScope('page', '${pageKey}')" class="px-2.5 py-1 bg-red-50 text-red-500 hover:bg-red-100 text-[10px] font-extrabold rounded-md transition flex items-center gap-1">
          <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Reset Page Defaults
        </button>
      </div>
    `;

    if (pageKey === 'footer') {
      html += window.renderFooterCmsEditor();
      editor.innerHTML = html;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    // Render accordions for each section
    html += `<div class="space-y-4">`;
    for (const secKey in page.sections) {
      const section = page.sections[secKey];
      html += `
        <div class="bg-white border border-sand/45 rounded-2xl overflow-hidden shadow-sm">
          <button onclick="window.toggleAccordion('cms-accordion-${secKey}')" class="w-full flex items-center justify-between p-4 bg-white hover:bg-editorbg/30 text-left transition font-bold text-xs text-charcoal border-b border-sand/30">
            <span>${section.title}</span>
            <i data-lucide="chevron-down" class="w-4 h-4 text-slate transform transition-transform duration-200" id="icon-cms-accordion-${secKey}"></i>
          </button>
          <div id="cms-accordion-${secKey}" class="hidden p-5 space-y-6">
            <div class="flex justify-end mb-2">
              <button onclick="window.resetCmsScope('section', '${pageKey}', '${secKey}')" class="px-2 py-0.5 bg-red-50 text-red-500 hover:bg-red-100 text-[9px] font-extrabold rounded transition flex items-center gap-1">
                <i data-lucide="rotate-ccw" class="w-2.5 h-2.5"></i> Reset Section
              </button>
            </div>
      `;

      // Render elements
      for (const elKey in section.elements) {
        const el = section.elements[elKey];
        const path = `pages.${pageKey}.sections.${secKey}.elements.${elKey}`;
        html += `<div class="p-4 bg-editorbg/40 rounded-xl border border-sand/30 space-y-4">`;
        html += `<div class="text-[10px] font-black text-slate uppercase tracking-wider">${el.label}</div>`;

        if (el.type === 'text') {
          html += `
            <input type="text" value="${el.value || ''}" oninput="window.setCmsValue('${path}.value', this.value)" class="w-full px-3.5 py-2 bg-white border border-sand rounded-xl text-xs text-charcoal focus:outline-none focus:border-flame transition">
            ${window.renderTypographyControls(path, el.style)}
            ${window.renderLinkControls(path, el.link)}
          `;
        } else if (el.type === 'rich-text') {
          html += `
            <div class="quill-editor-container bg-white border border-sand rounded-xl overflow-hidden min-h-[150px]" id="quill-${pageKey}-${secKey}-${elKey}"></div>
            ${window.renderTypographyControls(path, el.style)}
          `;
        } else if (el.type === 'button') {
          html += `
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[9px] font-bold text-slate block mb-1">Button Text</label>
                <input type="text" value="${el.text || ''}" oninput="window.setCmsValue('${path}.text', this.value)" class="w-full px-3.5 py-2 bg-white border border-sand rounded-xl text-xs text-charcoal focus:outline-none">
              </div>
              <div>
                <label class="text-[9px] font-bold text-slate block mb-1">Destination URL</label>
                <input type="text" value="${el.url || ''}" oninput="window.setCmsValue('${path}.url', this.value)" class="w-full px-3.5 py-2 bg-white border border-sand rounded-xl text-xs text-charcoal focus:outline-none">
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" id="chk-tab-${path}" ${el.openNewTab ? 'checked' : ''} onchange="window.setCmsValue('${path}.openNewTab', this.checked)" class="rounded border-sand text-flame focus:ring-flame">
              <label for="chk-tab-${path}" class="text-[10px] font-bold text-slate cursor-pointer">Open link in new tab</label>
            </div>
            ${window.renderButtonControls(path, el.style)}
          `;
        } else if (el.type === 'image') {
          html += `
            ${window.renderImageControls(path, el)}
          `;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    }
    html += `</div>`;

    editor.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Initialize Quill rich text editors
    for (const secKey in page.sections) {
      const section = page.sections[secKey];
      for (const elKey in section.elements) {
        const el = section.elements[elKey];
        if (el.type === 'rich-text') {
          const containerId = `quill-${pageKey}-${secKey}-${elKey}`;
          const path = `pages.${pageKey}.sections.${secKey}.elements.${elKey}`;

          if (typeof Quill !== 'undefined') {
            const quill = new Quill(`#${containerId}`, {
              theme: 'snow',
              modules: {
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['link'],
                  [{ 'header': [1, 2, 3, false] }],
                  ['clean']
                ]
              }
            });

            // Set initial content
            quill.root.innerHTML = el.value || '';
            window.quillInstances[path] = quill;

            // Handle changes
            quill.on('text-change', () => {
              window.setCmsValue(`${path}.value`, quill.root.innerHTML);
            });
          } else {
            // Fallback contenteditable
            const textContainer = document.getElementById(containerId);
            if (textContainer) {
              textContainer.contentEditable = true;
              textContainer.className = "p-4 bg-white border border-sand rounded-xl min-h-[150px] text-xs text-charcoal outline-none";
              textContainer.innerHTML = el.value || '';
              textContainer.oninput = function () {
                window.setCmsValue(`${path}.value`, this.innerHTML);
              };
            }
          }
        }
      }
    }
  };

  // Toggle Accordion Panel
  window.toggleAccordion = function (id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (el) {
      const wasHidden = el.classList.contains('hidden');
      document.querySelectorAll('[id^="cms-accordion-"]').forEach(acc => acc.classList.add('hidden'));
      document.querySelectorAll('[id^="icon-cms-accordion-"]').forEach(i => i.classList.remove('rotate-180'));

      if (wasHidden) {
        el.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    }
  };

  // Reusable Typography styling HTML block generator
  window.renderTypographyControls = function (pathString, style = {}) {
    const isExpandedId = `toggle-style-${pathString.replace(/\./g, '-')}`;
    return `
      <div class="mt-2">
        <button onclick="document.getElementById('${isExpandedId}').classList.toggle('hidden'); this.querySelector('i').classList.toggle('rotate-180')" class="flex items-center gap-1.5 text-[10px] font-bold text-flame hover:underline transition">
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 transition-transform duration-200"></i> Format Fonts, Colors & Spacing
        </button>
        <div id="${isExpandedId}" class="hidden mt-3 p-4 bg-white border border-sand/40 rounded-xl space-y-4 text-xs font-semibold text-slate">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Font Family</label>
              <select onchange="window.setCmsValue('${pathString}.style.fontFamily', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
                <option value="">Default Font</option>
                <option value="'Plus Jakarta Sans', sans-serif" ${style.fontFamily === "'Plus Jakarta Sans', sans-serif" ? 'selected' : ''}>Plus Jakarta Sans</option>
                <option value="'Oswald', sans-serif" ${style.fontFamily === "'Oswald', sans-serif" ? 'selected' : ''}>Oswald</option>
                <option value="'Montserrat', sans-serif" ${style.fontFamily === "'Montserrat', sans-serif" ? 'selected' : ''}>Montserrat</option>
                <option value="'Roboto', sans-serif" ${style.fontFamily === "'Roboto', sans-serif" ? 'selected' : ''}>Roboto</option>
                <option value="'Playfair Display', serif" ${style.fontFamily === "'Playfair Display', serif" ? 'selected' : ''}>Playfair Display</option>
                <option value="'Lora', serif" ${style.fontFamily === "'Lora', serif" ? 'selected' : ''}>Lora</option>
                <option value="'Merriweather', serif" ${style.fontFamily === "'Merriweather', serif" ? 'selected' : ''}>Merriweather</option>
                <option value="'Dancing Script', cursive" ${style.fontFamily === "'Dancing Script', cursive" ? 'selected' : ''}>Dancing Script</option>
                <option value="'Pacifico', cursive" ${style.fontFamily === "'Pacifico', cursive" ? 'selected' : ''}>Pacifico</option>
              </select>
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Font Weight</label>
              <select onchange="window.setCmsValue('${pathString}.style.fontWeight', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
                <option value="">Default</option>
                <option value="300" ${style.fontWeight === '300' ? 'selected' : ''}>Light (300)</option>
                <option value="400" ${style.fontWeight === '400' ? 'selected' : ''}>Normal (400)</option>
                <option value="500" ${style.fontWeight === '500' ? 'selected' : ''}>Medium (500)</option>
                <option value="600" ${style.fontWeight === '600' ? 'selected' : ''}>Semi Bold (600)</option>
                <option value="700" ${style.fontWeight === '700' ? 'selected' : ''}>Bold (700)</option>
                <option value="800" ${style.fontWeight === '800' ? 'selected' : ''}>Extra Bold (800)</option>
                <option value="900" ${style.fontWeight === '900' ? 'selected' : ''}>Black (900)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Text Color</label>
              <input type="color" value="${style.color || '#2b3d46'}" onchange="window.setCmsValue('${pathString}.style.color', this.value)" class="w-full h-8 bg-editorbg border border-sand rounded-lg p-0.5 cursor-pointer">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Background Color</label>
              <input type="color" value="${style.backgroundColor || '#ffffff'}" onchange="window.setCmsValue('${pathString}.style.backgroundColor', this.value)" class="w-full h-8 bg-editorbg border border-sand rounded-lg p-0.5 cursor-pointer">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-0.5">Desktop Size (px)</label>
              <input type="number" min="8" max="120" value="${style.fontSize || ''}" oninput="window.setCmsValue('${pathString}.style.fontSize', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-0.5">Tablet Size (px)</label>
              <input type="number" min="8" max="120" value="${style.fontSizeTablet || ''}" oninput="window.setCmsValue('${pathString}.style.fontSizeTablet', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-0.5">Mobile Size (px)</label>
              <input type="number" min="8" max="120" value="${style.fontSizeMobile || ''}" oninput="window.setCmsValue('${pathString}.style.fontSizeMobile', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-0.5">Letter Spacing (px)</label>
              <input type="number" step="0.1" value="${style.letterSpacing || ''}" oninput="window.setCmsValue('${pathString}.style.letterSpacing', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-0.5">Line Height</label>
              <input type="text" value="${style.lineHeight || ''}" oninput="window.setCmsValue('${pathString}.style.lineHeight', this.value)" placeholder="e.g. 1.5 or 24px" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-0.5">Text Align</label>
              <select onchange="window.setCmsValue('${pathString}.style.textAlign', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
                <option value="">Default</option>
                <option value="left" ${style.textAlign === 'left' ? 'selected' : ''}>Left</option>
                <option value="center" ${style.textAlign === 'center' ? 'selected' : ''}>Center</option>
                <option value="right" ${style.textAlign === 'right' ? 'selected' : ''}>Right</option>
                <option value="justify" ${style.textAlign === 'justify' ? 'selected' : ''}>Justify</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Text Transform</label>
              <select onchange="window.setCmsValue('${pathString}.style.textTransform', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
                <option value="">None</option>
                <option value="uppercase" ${style.textTransform === 'uppercase' ? 'selected' : ''}>UPPERCASE</option>
                <option value="lowercase" ${style.textTransform === 'lowercase' ? 'selected' : ''}>lowercase</option>
                <option value="capitalize" ${style.textTransform === 'capitalize' ? 'selected' : ''}>Capitalize</option>
              </select>
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Text Decoration</label>
              <select onchange="window.setCmsValue('${pathString}.style.textDecoration', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
                <option value="">None</option>
                <option value="underline" ${style.textDecoration === 'underline' ? 'selected' : ''}>Underline</option>
                <option value="line-through" ${style.textDecoration === 'line-through' ? 'selected' : ''}>Line-through</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Text Shadow</label>
              <input type="text" value="${style.textShadow || ''}" oninput="window.setCmsValue('${pathString}.style.textShadow', this.value)" placeholder="e.g. 0 2px 4px rgba(0,0,0,0.15)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Max Width (px/%)</label>
              <input type="text" value="${style.maxWidth || ''}" oninput="window.setCmsValue('${pathString}.style.maxWidth', this.value)" placeholder="e.g. 600px" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Opacity</label>
              <input type="range" min="0" max="1" step="0.05" value="${style.opacity !== undefined ? style.opacity : 1}" oninput="window.setCmsValue('${pathString}.style.opacity', parseFloat(this.value))" class="w-full h-8 cursor-pointer">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Visibility</label>
              <select onchange="window.setCmsValue('${pathString}.style.visibility', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
                <option value="visible" ${style.visibility !== 'hidden' ? 'selected' : ''}>Visible</option>
                <option value="hidden" ${style.visibility === 'hidden' ? 'selected' : ''}>Hidden (Display: None)</option>
              </select>
            </div>
          </div>

          <!-- Spacing Inputs -->
          <div class="border-t border-sand/30 pt-3">
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate block mb-2">Margins & Paddings (px)</span>
            <div class="grid grid-cols-4 gap-2">
              <div>
                <label class="text-[8px] font-bold text-slate block mb-0.5">Margin Top</label>
                <input type="number" value="${style.marginTop || ''}" oninput="window.setCmsValue('${pathString}.style.marginTop', this.value)" class="w-full p-1.5 bg-editorbg border border-sand rounded-lg text-xs">
              </div>
              <div>
                <label class="text-[8px] font-bold text-slate block mb-0.5">Margin Bottom</label>
                <input type="number" value="${style.marginBottom || ''}" oninput="window.setCmsValue('${pathString}.style.marginBottom', this.value)" class="w-full p-1.5 bg-editorbg border border-sand rounded-lg text-xs">
              </div>
              <div>
                <label class="text-[8px] font-bold text-slate block mb-0.5">Padding Top</label>
                <input type="number" value="${style.paddingTop || ''}" oninput="window.setCmsValue('${pathString}.style.paddingTop', this.value)" class="w-full p-1.5 bg-editorbg border border-sand rounded-lg text-xs">
              </div>
              <div>
                <label class="text-[8px] font-bold text-slate block mb-0.5">Padding Bottom</label>
                <input type="number" value="${style.paddingBottom || ''}" oninput="window.setCmsValue('${pathString}.style.paddingBottom', this.value)" class="w-full p-1.5 bg-editorbg border border-sand rounded-lg text-xs">
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 border-t border-sand/30 pt-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Custom CSS Class</label>
              <input type="text" value="${style.customClass || ''}" oninput="window.setCmsValue('${pathString}.style.customClass', this.value)" placeholder="e.g. shadow-lg uppercase" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Animation Style</label>
              <select onchange="window.setCmsValue('${pathString}.style.animation', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
                <option value="">None</option>
                <option value="pulse" ${style.animation === 'pulse' ? 'selected' : ''}>Pulse (Gentle)</option>
                <option value="bounce" ${style.animation === 'bounce' ? 'selected' : ''}>Bounce</option>
                <option value="spin" ${style.animation === 'spin' ? 'selected' : ''}>Spin (Loader)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Reusable Link Management generator
  window.renderLinkControls = function (pathString, link = {}) {
    const isExpandedId = `toggle-link-${pathString.replace(/\./g, '-')}`;
    return `
      <div class="mt-2">
        <button onclick="document.getElementById('${isExpandedId}').classList.toggle('hidden'); this.querySelector('i').classList.toggle('rotate-180')" class="flex items-center gap-1.5 text-[10px] font-bold text-flame hover:underline transition">
          <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i> Link / Clickable Properties
        </button>
        <div id="${isExpandedId}" class="hidden mt-3 p-4 bg-white border border-sand/40 rounded-xl space-y-4 text-xs font-semibold text-slate">
          <div class="flex items-center gap-2">
            <input type="checkbox" id="chk-link-${pathString}" ${link.enabled ? 'checked' : ''} onchange="window.setCmsValue('${pathString}.link.enabled', this.checked)" class="rounded border-sand text-flame focus:ring-flame">
            <label for="chk-link-${pathString}" class="text-[10px] font-bold text-slate cursor-pointer">Enable Link (Makes this text element clickable)</label>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Link URL</label>
              <input type="text" value="${link.url || ''}" oninput="window.setCmsValue('${pathString}.link.url', this.value)" placeholder="e.g. /about-us or https://external.com" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">ARIA Label</label>
              <input type="text" value="${link.ariaLabel || ''}" oninput="window.setCmsValue('${pathString}.link.ariaLabel', this.value)" placeholder="Screen readers description" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Title Attribute</label>
              <input type="text" value="${link.title || ''}" oninput="window.setCmsValue('${pathString}.link.title', this.value)" placeholder="Hover tooltip description" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div class="flex flex-col justify-end space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="chk-newtab-${pathString}" ${link.openNewTab ? 'checked' : ''} onchange="window.setCmsValue('${pathString}.link.openNewTab', this.checked)" class="rounded border-sand text-flame">
                <label for="chk-newtab-${pathString}" class="text-[9px] font-bold text-slate cursor-pointer">Open in new tab</label>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" id="chk-nofollow-${pathString}" ${link.noFollow ? 'checked' : ''} onchange="window.setCmsValue('${pathString}.link.noFollow', this.checked)" class="rounded border-sand text-flame">
                <label for="chk-nofollow-${pathString}" class="text-[9px] font-bold text-slate cursor-pointer">Mark as No Follow (SEO)</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Reusable Button styling controls
  window.renderButtonControls = function (pathString, style = {}) {
    const isExpandedId = `toggle-btn-${pathString.replace(/\./g, '-')}`;
    return `
      <div class="mt-2">
        <button onclick="document.getElementById('${isExpandedId}').classList.toggle('hidden'); this.querySelector('i').classList.toggle('rotate-180')" class="flex items-center gap-1.5 text-[10px] font-bold text-flame hover:underline transition">
          <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i> Custom Button Design Options
        </button>
        <div id="${isExpandedId}" class="hidden mt-3 p-4 bg-white border border-sand/40 rounded-xl space-y-4 text-xs font-semibold text-slate">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Button Background</label>
              <input type="color" value="${style.background || '#eb5e28'}" onchange="window.setCmsValue('${pathString}.style.background', this.value)" class="w-full h-8 bg-editorbg border border-sand rounded-lg p-0.5 cursor-pointer">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Hover Background</label>
              <input type="color" value="${style.hoverBackground || '#d14f1c'}" onchange="window.setCmsValue('${pathString}.style.hoverBackground', this.value)" class="w-full h-8 bg-editorbg border border-sand rounded-lg p-0.5 cursor-pointer">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Text Color</label>
              <input type="color" value="${style.textColor || '#ffffff'}" onchange="window.setCmsValue('${pathString}.style.textColor', this.value)" class="w-full h-8 bg-editorbg border border-sand rounded-lg p-0.5 cursor-pointer">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Hover Text Color</label>
              <input type="color" value="${style.hoverColor || '#ffffff'}" onchange="window.setCmsValue('${pathString}.style.hoverColor', this.value)" class="w-full h-8 bg-editorbg border border-sand rounded-lg p-0.5 cursor-pointer">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Border Radius (px)</label>
              <input type="number" value="${style.borderRadius || ''}" oninput="window.setCmsValue('${pathString}.style.borderRadius', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Padding Y (px)</label>
              <input type="number" value="${style.padding || ''}" oninput="window.setCmsValue('${pathString}.style.padding', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Width (e.g. w-full)</label>
              <input type="text" value="${style.width || ''}" oninput="window.setCmsValue('${pathString}.style.width', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-2">
              <label class="text-[9px] font-bold text-slate block mb-1">Font Awesome Icon Class</label>
              <input type="text" value="${style.icon || ''}" oninput="window.setCmsValue('${pathString}.style.icon', this.value)" placeholder="e.g. fa-solid fa-cart-shopping" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Icon Position</label>
              <select onchange="window.setCmsValue('${pathString}.style.iconPosition', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-lg text-[10px]">
                <option value="left" ${style.iconPosition !== 'right' ? 'selected' : ''}>Left</option>
                <option value="right" ${style.iconPosition === 'right' ? 'selected' : ''}>Right</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Reusable Image management, upload & crop panel
  window.renderImageControls = function (pathString, image = {}) {
    const cropModalId = `crop-modal-${pathString.replace(/\./g, '-')}`;
    return `
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 bg-white border border-sand/40 rounded-xl overflow-hidden shadow-sm flex items-center justify-center shrink-0">
            <img src="${image.value || 'home.png'}" id="preview-img-${pathString.replace(/\./g, '-')}" class="w-full h-full object-cover">
          </div>
          <div class="space-y-2 w-full">
            <div class="flex flex-wrap gap-2">
              <label class="bg-flame hover:bg-flame/90 text-cream px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1 shadow-sm">
                <i data-lucide="upload" class="w-3.5 h-3.5"></i> Upload Image
                <input type="file" accept="image/*" onchange="window.handleCmsImageUpload(event, '${pathString}')" class="hidden">
              </label>
              <button onclick="window.initCmsCropper('${pathString}')" class="bg-charcoal hover:bg-charcoal/90 text-cream px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm">
                <i data-lucide="crop" class="w-3.5 h-3.5"></i> Crop Image
              </button>
              <button onclick="window.restoreCmsImageDefault('${pathString}')" class="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restore Default
              </button>
            </div>
            <p class="text-[9px] text-slate font-medium">PNG or JPEG format supported. Keep files under 5MB.</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs font-semibold text-slate">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Alt Accessibility Text</label>
            <input type="text" value="${image.altText || ''}" oninput="window.setCmsValue('${pathString}.altText', this.value)" placeholder="Alternative text for search engines" class="w-full p-2 bg-white border border-sand rounded-lg text-xs">
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Image Title</label>
            <input type="text" value="${image.title || ''}" oninput="window.setCmsValue('${pathString}.title', this.value)" placeholder="Title overlay tooltip attribute" class="w-full p-2 bg-white border border-sand rounded-lg text-xs">
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input type="checkbox" id="chk-lazy-${pathString}" ${image.lazyLoading ? 'checked' : ''} onchange="window.setCmsValue('${pathString}.lazyLoading', this.checked)" class="rounded border-sand text-flame focus:ring-flame">
          <label for="chk-lazy-${pathString}" class="text-[10px] font-bold text-slate cursor-pointer">Enable lazy loading (Improves page load speed)</label>
        </div>

        <!-- Custom HTML5 Cropping Canvas Modal -->
        <div id="${cropModalId}" class="hidden fixed inset-0 z-[9999] bg-charcoal/80 flex flex-col items-center justify-center p-4">
          <div class="bg-white p-6 rounded-3xl w-full max-w-xl shadow-2xl space-y-4">
            <h5 class="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-sand pb-2"><i data-lucide="crop" class="w-4 h-4"></i> Crop Selection Workspace</h5>
            <div class="relative w-full max-h-[350px] overflow-hidden bg-editorbg flex items-center justify-center rounded-xl p-2">
              <canvas id="crop-canvas-${pathString.replace(/\./g, '-')}" class="max-w-full max-h-[300px] shadow border border-sand"></canvas>
            </div>
            <div class="flex justify-end gap-3">
              <button onclick="document.getElementById('${cropModalId}').classList.add('hidden')" class="px-4 py-2 bg-editorbg text-slate rounded-lg text-xs font-bold transition">Cancel</button>
              <button onclick="window.applyCmsCroppedBlob('${pathString}')" class="px-6 py-2 bg-flame text-cream rounded-lg text-xs font-extrabold shadow transition">Apply & Save Crop</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Cloudinary image upload handlers
  window.handleCmsImageUpload = async function (e, pathString) {
    if (e.target.files.length === 0) return;
    window.showGlobalLoader();
    try {
      const secureUrl = await uploadToCloudinary(e.target.files[0]);
      if (pathString.startsWith('right_action_buttons') || pathString.startsWith('navigation')) {
        window.setCmsValue(pathString, secureUrl);
      } else {
        window.setCmsValue(`${pathString}.value`, secureUrl);
      }

      const cleanPathStr = pathString.replace(/\[\d+\]/g, '').replace(/\./g, '-');
      const prev = document.getElementById(`preview-img-${cleanPathStr}`);
      if (prev) prev.src = secureUrl;
      showToast("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Image upload failed", "error");
    } finally {
      window.hideGlobalLoader();
    }
  };

  window.restoreCmsImageDefault = function (pathString) {
    // Get default url value
    const parts = pathString.split('.');
    let cur = window.defaultCustomization;
    for (const p of parts) {
      cur = cur[p];
    }
    const defaultUrl = cur.value || "";
    window.setCmsValue(`${pathString}.value`, defaultUrl);

    const prev = document.getElementById(`preview-img-${pathString.replace(/\./g, '-')}`);
    if (prev) prev.src = defaultUrl;
    showToast("Reverted image back to default.");
  };

  // Canvas Image Cropper Workspace engine
  window.initCmsCropper = function (pathString) {
    const modal = document.getElementById(`crop-modal-${pathString.replace(/\./g, '-')}`);
    const canvas = document.getElementById(`crop-canvas-${pathString.replace(/\./g, '-')}`);
    if (!modal || !canvas) return;

    modal.classList.remove('hidden');

    const imgUrl = window.getCmsValue(`${pathString}.value`) || 'home.png';
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Define default crop frame (e.g. crop center 80%)
      window.activeCropFrame = {
        x: img.width * 0.1,
        y: img.height * 0.1,
        w: img.width * 0.8,
        h: img.height * 0.8,
        img: img
      };

      // Draw crop overlay rectangle
      ctx.strokeStyle = '#eb5e28';
      ctx.lineWidth = Math.max(3, img.width * 0.005);
      ctx.strokeRect(window.activeCropFrame.x, window.activeCropFrame.y, window.activeCropFrame.w, window.activeCropFrame.h);
    };
    img.src = imgUrl;
  };

  window.applyCmsCroppedBlob = function (pathString) {
    const canvas = document.getElementById(`crop-canvas-${pathString.replace(/\./g, '-')}`);
    if (!canvas || !window.activeCropFrame) return;

    window.showGlobalLoader();
    document.getElementById(`crop-modal-${pathString.replace(/\./g, '-')}`).classList.add('hidden');

    try {
      const crop = window.activeCropFrame;
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = crop.w;
      cropCanvas.height = crop.h;
      const ctx = cropCanvas.getContext('2d');
      ctx.drawImage(crop.img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

      cropCanvas.toBlob(async function (blob) {
        try {
          const secureUrl = await uploadToCloudinary(blob);
          window.setCmsValue(`${pathString}.value`, secureUrl);
          const prev = document.getElementById(`preview-img-${pathString.replace(/\./g, '-')}`);
          if (prev) prev.src = secureUrl;
          showToast("Image cropped and saved successfully!");
        } catch (err) {
          console.error(err);
          showToast("Error uploading cropped image", "error");
        } finally {
          window.hideGlobalLoader();
        }
      }, 'image/jpeg', 0.85);
    } catch (e) {
      console.error(e);
      window.hideGlobalLoader();
      showToast("Cropper failed", "error");
    }
  };

  // B. SPECIAL COMPONENT EDITORS
  window.openCmsSpecialEditor = function (specialId) {
    const grid = document.getElementById('cms-dashboard-cards-grid');
    const editor = document.getElementById('cms-item-editor-frame');
    if (!grid || !editor) return;

    grid.classList.add('hidden');
    editor.classList.remove('hidden');

    if (specialId === 'logos') window.renderLogosEditor(editor);
    else if (specialId === 'navigation') window.renderHeaderCmsEditor(editor);
    else if (specialId === 'social') window.renderSocialEditor(editor);
    else if (specialId === 'contactInfo') window.renderContactEditor(editor);
    else if (specialId === 'seo') window.renderSeoEditor(editor);
  };

  // 1. Logo Configurations Panel
  window.renderLogosEditor = function (container) {
    const logos = window.draftCustomization.logos || {};
    let html = renderEditorHeader("Logo & App Assets Editor", "window.renderCmsDashboard()");

    html += `
      <div class="bg-white border border-sand/40 p-6 rounded-2xl space-y-6 text-xs font-semibold text-slate">
        <div>
          <label class="text-[9px] font-bold text-slate uppercase block mb-1">Logo Type</label>
          <select onchange="window.setCmsValue('logos.type', this.value); window.renderCmsSpecialEditor('logos')" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl text-xs">
            <option value="text" ${logos.type === 'text' ? 'selected' : ''}>Text (Render using Fonts & Styling)</option>
            <option value="image" ${logos.type === 'image' ? 'selected' : ''}>Image (Upload Light / Dark SVG or PNG logo)</option>
          </select>
        </div>

        ${logos.type === 'text' ? `
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Primary prefix</label>
              <input type="text" value="${logos.textPrefix || 'Frame'}" oninput="window.setCmsValue('logos.textPrefix', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate block mb-1">Styled suffix</label>
              <input type="text" value="${logos.textSuffix || 'Craft'}" oninput="window.setCmsValue('logos.textSuffix', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-flame">
            </div>
          </div>
        ` : `
          <div class="space-y-4">
            <div>
              <label class="text-[9px] font-bold text-slate block mb-2">Light Mode Logo Image</label>
              ${window.renderImageControls('logos.lightLogoUrl', { value: logos.lightLogoUrl, altText: 'Light Logo' })}
            </div>
            <div class="border-t border-sand/20 pt-4">
              <label class="text-[9px] font-bold text-slate block mb-2">Dark Mode Logo Image</label>
              ${window.renderImageControls('logos.darkLogoUrl', { value: logos.darkLogoUrl, altText: 'Dark Logo' })}
            </div>
            <div class="border-t border-sand/20 pt-4">
              <label class="text-[9px] font-bold text-slate block mb-2">Footer Logo Image</label>
              ${window.renderImageControls('logos.footerLogoUrl', { value: logos.footerLogoUrl, altText: 'Footer Logo' })}
            </div>
          </div>
        `}

        <div class="border-t border-sand/30 pt-6 space-y-4">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-2">Browser Tab Favicon (PNG/SVG URL)</label>
            <input type="text" value="${logos.faviconUrl || ''}" oninput="window.setCmsValue('logos.faviconUrl', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-lg text-[10px]">
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-2">Home screen App Icon URL</label>
            <input type="text" value="${logos.appIconUrl || ''}" oninput="window.setCmsValue('logos.appIconUrl', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-lg text-[10px]">
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  // 2. Header Menu Navigation List Editor
  window.renderNavigationEditor = function (container) {
    window.renderHeaderCmsEditor(container);
  };

  // Nav actions
  window.updateNavField = function (idx, key, val) {
    const item = window.draftCustomization.navigation[idx];
    item[key] = val;
    if (item.page === undefined) item.page = "";
    if (item.customUrl === undefined) item.customUrl = "";

    item.url = item.customUrl ? item.customUrl : (item.page || '/');

    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
  };

  window.updateNavSubField = function (idx, sIdx, key, val) {
    const sub = window.draftCustomization.navigation[idx].dropdown[sIdx];
    sub[key] = val;
    if (sub.page === undefined) sub.page = "";
    if (sub.customUrl === undefined) sub.customUrl = "";

    sub.url = sub.customUrl ? sub.customUrl : (sub.page || '/');

    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
  };

  window.addNavMenuItem = function () {
    window.draftCustomization.navigation.push({
      id: "nav_new_" + Date.now(),
      name: "NEW LINK",
      url: "/",
      enabled: true,
      dropdown: []
    });
    window.renderNavigationEditor(document.getElementById('cms-item-editor-frame'));
    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
  };

  window.deleteNav = function (idx) {
    if (confirm("Remove this navigation menu item and all its sublinks?")) {
      window.draftCustomization.navigation.splice(idx, 1);
      window.renderNavigationEditor(document.getElementById('cms-item-editor-frame'));
      window.applyCmsPreview('navigation');
      window.checkCmsDirty();
    }
  };

  window.addNavDropdownItem = function (idx) {
    if (!window.draftCustomization.navigation[idx].dropdown) {
      window.draftCustomization.navigation[idx].dropdown = [];
    }
    window.draftCustomization.navigation[idx].dropdown.push({
      name: "New Sublink",
      url: "/"
    });
    window.renderNavigationEditor(document.getElementById('cms-item-editor-frame'));
    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
  };

  window.deleteNavSub = function (idx, sIdx) {
    window.draftCustomization.navigation[idx].dropdown.splice(sIdx, 1);
    window.renderNavigationEditor(document.getElementById('cms-item-editor-frame'));
    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
  };

  window.reorderNav = function (idx, shift) {
    const list = window.draftCustomization.navigation;
    const targetIdx = idx + shift;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    window.renderNavigationEditor(document.getElementById('cms-item-editor-frame'));
    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
  };

  // 3. Social Media Platforms Editor
  window.renderSocialEditor = function (container) {
    const social = window.draftCustomization.social || [];
    let html = renderEditorHeader("Social Media Channels", "window.renderCmsDashboard()");

    html += `
      <div class="bg-white border border-sand/40 p-6 rounded-2xl space-y-6 text-xs font-semibold text-slate">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-black uppercase text-slate tracking-wider">Social Platforms Registry</span>
          <button onclick="window.addSocialChannel()" class="bg-flame text-cream px-3 py-1.5 rounded-lg text-[10px] font-bold shadow transition flex items-center gap-1">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Register Platform
          </button>
        </div>

        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          ${social.map((item, idx) => `
            <div class="p-4 bg-editorbg/30 border border-sand/40 rounded-xl space-y-3 relative">
              <div class="absolute right-3 top-3 flex items-center gap-1">
                <button onclick="window.reorderSocial(${idx}, -1)" class="w-6 h-6 rounded bg-white border border-sand flex items-center justify-center text-slate hover:text-charcoal"><i data-lucide="chevron-up" class="w-3.5 h-3.5"></i></button>
                <button onclick="window.reorderSocial(${idx}, 1)" class="w-6 h-6 rounded bg-white border border-sand flex items-center justify-center text-slate hover:text-charcoal"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
                <button onclick="window.deleteSocial(${idx})" class="w-6 h-6 rounded bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 ml-2"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
              </div>

              <div class="grid grid-cols-3 gap-3 w-[78%]">
                <div>
                  <label class="text-[8px] font-bold block mb-0.5 text-slate">Platform Name</label>
                  <input type="text" value="${item.name}" oninput="window.updateSocialField(${idx}, 'name', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg">
                </div>
                <div>
                  <label class="text-[8px] font-bold block mb-0.5 text-slate">FontAwesome Icon</label>
                  <input type="text" value="${item.icon}" oninput="window.updateSocialField(${idx}, 'icon', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-slate">
                </div>
                <div>
                  <label class="text-[8px] font-bold block mb-0.5 text-slate">URL Link</label>
                  <input type="text" value="${item.url}" oninput="window.updateSocialField(${idx}, 'url', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-slate">
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input type="checkbox" id="chk-social-${idx}" ${item.enabled ? 'checked' : ''} onchange="window.updateSocialField(${idx}, 'enabled', this.checked)" class="rounded border-sand text-flame">
                <label for="chk-social-${idx}" class="text-[9px] font-bold text-slate cursor-pointer">Enable (Show this icon on site)</label>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  window.updateSocialField = function (idx, key, val) {
    window.draftCustomization.social[idx][key] = val;
    window.applyCmsPreview('social');
    window.checkCmsDirty();
  };

  window.addSocialChannel = function () {
    window.draftCustomization.social.push({
      id: "social_new_" + Date.now(),
      name: "New Channel",
      icon: "fa-brands fa-link",
      url: "https://",
      enabled: true
    });
    window.renderSocialEditor(document.getElementById('cms-item-editor-frame'));
    window.applyCmsPreview('social');
    window.checkCmsDirty();
  };

  window.deleteSocial = function (idx) {
    if (confirm("Remove this social channel reference?")) {
      window.draftCustomization.social.splice(idx, 1);
      window.renderSocialEditor(document.getElementById('cms-item-editor-frame'));
      window.applyCmsPreview('social');
      window.checkCmsDirty();
    }
  };

  window.reorderSocial = function (idx, shift) {
    const list = window.draftCustomization.social;
    const targetIdx = idx + shift;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    window.renderSocialEditor(document.getElementById('cms-item-editor-frame'));
    window.applyCmsPreview('social');
    window.checkCmsDirty();
  };

  // 4. Contact Information Details Editor
  window.renderContactEditor = function (container) {
    const c = window.draftCustomization.contactInfo || {};
    let html = renderEditorHeader("Contact Information Configuration", "window.renderCmsDashboard()");

    html += `
      <div class="bg-white border border-sand/40 p-6 rounded-2xl space-y-6 text-xs font-semibold text-slate">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Telephone Contact</label>
            <input type="text" value="${c.phone || ''}" oninput="window.setCmsValue('contactInfo.phone', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl">
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">General Inquiries Email</label>
            <input type="text" value="${c.email || ''}" oninput="window.setCmsValue('contactInfo.email', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Support Desk Email</label>
            <input type="text" value="${c.supportEmail || ''}" oninput="window.setCmsValue('contactInfo.supportEmail', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl">
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Business Enquiries Email</label>
            <input type="text" value="${c.businessEmail || ''}" oninput="window.setCmsValue('contactInfo.businessEmail', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl">
          </div>
        </div>

        <div>
          <label class="text-[9px] font-bold text-slate block mb-1">Physical Address</label>
          <input type="text" value="${c.address || ''}" oninput="window.setCmsValue('contactInfo.address', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Working / Business Hours</label>
            <input type="text" value="${c.workingHours || ''}" oninput="window.setCmsValue('contactInfo.workingHours', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl">
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Google Maps Embedded/Share Link</label>
            <input type="text" value="${c.googleMapsLink || ''}" oninput="window.setCmsValue('contactInfo.googleMapsLink', this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl">
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  // 5. Global SEO & Structured Data Editor
  window.renderSeoEditor = function (container) {
    const seo = window.draftCustomization.seo || {};
    let html = renderEditorHeader("SEO & Canonical Metatags", "window.renderCmsDashboard()");

    html += `
      <div class="bg-white border border-sand/40 p-6 rounded-2xl space-y-6 text-xs font-semibold text-slate">
        <div>
          <label class="text-[9px] font-bold text-slate uppercase block mb-1">Select Page Route</label>
          <select id="seo-page-select" onchange="window.renderSeoPageControls(this.value)" class="w-full p-2.5 bg-editorbg border border-sand rounded-xl text-xs">
            <option value="/">Home Route ( / )</option>
            <option value="/products">Products Page ( /products )</option>
            <option value="/about-us">About Us ( /about-us )</option>
            <option value="/contact">Contact Page ( /contact )</option>
            <option value="/faq">FAQ Route ( /faq )</option>
          </select>
        </div>

        <div id="seo-page-inputs-wrapper" class="space-y-4">
          <!-- Page inputs dynamically loaded here -->
        </div>
      </div>
    `;

    container.innerHTML = html;
    window.renderSeoPageControls('/');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  window.renderSeoPageControls = function (route) {
    const wrapper = document.getElementById('seo-page-inputs-wrapper');
    if (!wrapper) return;

    if (!window.draftCustomization.seo) window.draftCustomization.seo = {};
    if (!window.draftCustomization.seo[route]) {
      window.draftCustomization.seo[route] = {
        title: "",
        description: "",
        keywords: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        canonicalUrl: ""
      };
    }

    const page = window.draftCustomization.seo[route];
    const path = `seo.${route}`;

    wrapper.innerHTML = `
      <div>
        <label class="text-[9px] font-bold text-slate block mb-1">HTML Title Tag</label>
        <input type="text" value="${page.title || ''}" oninput="window.setCmsValue('${path}.title', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg">
      </div>
      <div>
        <label class="text-[9px] font-bold text-slate block mb-1">Meta Description</label>
        <textarea rows="3" oninput="window.setCmsValue('${path}.description', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg resize-none">${page.description || ''}</textarea>
      </div>
      <div>
        <label class="text-[9px] font-bold text-slate block mb-1">SEO Keywords</label>
        <input type="text" value="${page.keywords || ''}" oninput="window.setCmsValue('${path}.keywords', this.value)" placeholder="comma separated keywords" class="w-full p-2 bg-editorbg border border-sand rounded-lg">
      </div>
      <div class="grid grid-cols-2 gap-3 pt-3 border-t border-sand/20">
        <div>
          <label class="text-[9px] font-bold text-slate block mb-1">OpenGraph title (OG Title)</label>
          <input type="text" value="${page.ogTitle || ''}" oninput="window.setCmsValue('${path}.ogTitle', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg">
        </div>
        <div>
          <label class="text-[9px] font-bold text-slate block mb-1">OpenGraph description (OG Desc)</label>
          <input type="text" value="${page.ogDescription || ''}" oninput="window.setCmsValue('${path}.ogDescription', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[9px] font-bold text-slate block mb-1">OG Share Image (URL)</label>
          <input type="text" value="${page.ogImage || ''}" oninput="window.setCmsValue('${path}.ogImage', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg">
        </div>
        <div>
          <label class="text-[9px] font-bold text-slate block mb-1">Canonical URL</label>
          <input type="text" value="${page.canonicalUrl || ''}" oninput="window.setCmsValue('${path}.canonicalUrl', this.value)" placeholder="Leave blank to default to current URL" class="w-full p-2 bg-editorbg border border-sand rounded-lg">
        </div>
      </div>
    `;
  };

  // ==========================================
  // CUSTOM FOOTER CMS EDITOR LAYOUT AND EVENT HANDLERS
  // ==========================================
  window.toggleFooterAccordion = function (id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (el) {
      el.classList.toggle('hidden');
      if (icon) {
        icon.classList.toggle('rotate-180');
      }
    }
  };

  window.updateFooterLinkField = function (path, index, field, value) {
    const parts = path.split('.');
    let cur = window.draftCustomization;
    for (let i = 0; i < parts.length; i++) {
      cur = cur[parts[i]];
    }
    if (cur && Array.isArray(cur.value)) {
      cur.value[index][field] = value;
      window.applyCmsPreview(path);
      window.checkCmsDirty();
    }
  };

  window.renderFooterCmsEditor = function () {
    const page = window.draftCustomization.pages['footer'];
    const general = page.sections.general;
    const elements = general.elements;

    // Ensure link configuration fields exist (backward compatibility fallback)
    if (!elements.quick_links_items) {
      elements.quick_links_items = clone(window.defaultCustomization.pages.footer.sections.general.elements.quick_links_items);
    }
    if (!elements.services_items) {
      elements.services_items = clone(window.defaultCustomization.pages.footer.sections.general.elements.services_items);
    }
    if (!elements.contact_items) {
      elements.contact_items = clone(window.defaultCustomization.pages.footer.sections.general.elements.contact_items);
    }

    let html = '<div class="space-y-4">';

    // 1. Company Information Accordion
    html += `
      <div class="bg-white border border-sand/45 rounded-2xl overflow-hidden shadow-sm">
        <button onclick="window.toggleFooterAccordion('footer-acc-company')" class="w-full flex items-center justify-between p-4 bg-white hover:bg-editorbg/30 text-left transition font-bold text-xs text-charcoal border-b border-sand/30">
          <span>Company Information</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate transform transition-transform duration-200" id="icon-footer-acc-company"></i>
        </button>
        <div id="footer-acc-company" class="hidden p-5 space-y-6">
          <div class="flex justify-end mb-2">
            <button onclick="window.resetCmsScope('section', 'footer', 'general'); window.openCmsPageEditor('footer');" class="px-2 py-0.5 bg-red-50 text-red-500 hover:bg-red-100 text-[9px] font-extrabold rounded transition flex items-center gap-1">
              <i data-lucide="rotate-ccw" class="w-2.5 h-2.5"></i> Reset Section
            </button>
          </div>
    `;
    // Render desc and copyright
    ['desc', 'copyright'].forEach(elKey => {
      const el = elements[elKey];
      const path = `pages.footer.sections.general.elements.${elKey}`;
      html += `
        <div class="p-4 bg-editorbg/40 rounded-xl border border-sand/30 space-y-4">
          <div class="text-[10px] font-black text-slate uppercase tracking-wider">${el.label}</div>
          <input type="text" value="${el.value || ''}" oninput="window.setCmsValue('${path}.value', this.value)" class="w-full px-3.5 py-2 bg-white border border-sand rounded-xl text-xs text-charcoal focus:outline-none focus:border-flame transition">
          ${window.renderTypographyControls(path, el.style)}
        </div>
      `;
    });
    html += `</div></div>`;

    // 2. Quick Links Accordion
    html += `
      <div class="bg-white border border-sand/45 rounded-2xl overflow-hidden shadow-sm">
        <button onclick="window.toggleFooterAccordion('footer-acc-links')" class="w-full flex items-center justify-between p-4 bg-white hover:bg-editorbg/30 text-left transition font-bold text-xs text-charcoal border-b border-sand/30">
          <span>Quick Links</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate transform transition-transform duration-200" id="icon-footer-acc-links"></i>
        </button>
        <div id="footer-acc-links" class="hidden p-5 space-y-6">
          <div class="p-4 bg-editorbg/40 rounded-xl border border-sand/30 space-y-4">
            <div class="text-[10px] font-black text-slate uppercase tracking-wider">${elements.quick_links.label}</div>
            <input type="text" value="${elements.quick_links.value || ''}" oninput="window.setCmsValue('pages.footer.sections.general.elements.quick_links.value', this.value)" class="w-full px-3.5 py-2 bg-white border border-sand rounded-xl text-xs text-charcoal focus:outline-none focus:border-flame transition">
            ${window.renderTypographyControls('pages.footer.sections.general.elements.quick_links', elements.quick_links.style)}
          </div>
          <div class="text-[10px] font-black text-slate uppercase tracking-wider px-2">Link Management</div>
          <div class="space-y-4">
    `;
    elements.quick_links_items.value.forEach((item, idx) => {
      html += window.renderFooterLinkItemEditor('pages.footer.sections.general.elements.quick_links_items', item, idx);
    });
    html += `</div></div></div>`;

    // 3. Services Accordion
    html += `
      <div class="bg-white border border-sand/45 rounded-2xl overflow-hidden shadow-sm">
        <button onclick="window.toggleFooterAccordion('footer-acc-services')" class="w-full flex items-center justify-between p-4 bg-white hover:bg-editorbg/30 text-left transition font-bold text-xs text-charcoal border-b border-sand/30">
          <span>Services</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate transform transition-transform duration-200" id="icon-footer-acc-services"></i>
        </button>
        <div id="footer-acc-services" class="hidden p-5 space-y-6">
          <div class="p-4 bg-editorbg/40 rounded-xl border border-sand/30 space-y-4">
            <div class="text-[10px] font-black text-slate uppercase tracking-wider">${elements.services.label}</div>
            <input type="text" value="${elements.services.value || ''}" oninput="window.setCmsValue('pages.footer.sections.general.elements.services.value', this.value)" class="w-full px-3.5 py-2 bg-white border border-sand rounded-xl text-xs text-charcoal focus:outline-none focus:border-flame transition">
            ${window.renderTypographyControls('pages.footer.sections.general.elements.services', elements.services.style)}
          </div>
          <div class="text-[10px] font-black text-slate uppercase tracking-wider px-2">Service Management</div>
          <div class="space-y-4">
    `;
    elements.services_items.value.forEach((item, idx) => {
      html += window.renderFooterLinkItemEditor('pages.footer.sections.general.elements.services_items', item, idx);
    });
    html += `</div></div></div>`;

    // 4. Contact Information Accordion
    html += `
      <div class="bg-white border border-sand/45 rounded-2xl overflow-hidden shadow-sm">
        <button onclick="window.toggleFooterAccordion('footer-acc-contact')" class="w-full flex items-center justify-between p-4 bg-white hover:bg-editorbg/30 text-left transition font-bold text-xs text-charcoal border-b border-sand/30">
          <span>Contact Information</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate transform transition-transform duration-200" id="icon-footer-acc-contact"></i>
        </button>
        <div id="footer-acc-contact" class="hidden p-5 space-y-6">
          <div class="p-4 bg-editorbg/40 rounded-xl border border-sand/30 space-y-4">
            <div class="text-[10px] font-black text-slate uppercase tracking-wider">${elements.contact.label}</div>
            <input type="text" value="${elements.contact.value || ''}" oninput="window.setCmsValue('pages.footer.sections.general.elements.contact.value', this.value)" class="w-full px-3.5 py-2 bg-white border border-sand rounded-xl text-xs text-charcoal focus:outline-none focus:border-flame transition">
            ${window.renderTypographyControls('pages.footer.sections.general.elements.contact', elements.contact.style)}
          </div>
          <div class="text-[10px] font-black text-slate uppercase tracking-wider px-2">Contact Links Management</div>
          <div class="space-y-4">
    `;
    elements.contact_items.value.forEach((item, idx) => {
      html += window.renderFooterContactItemEditor('pages.footer.sections.general.elements.contact_items', item, idx);
    });
    html += `</div></div></div>`;

    html += '</div>';
    return html;
  };

  window.renderFooterLinkItemEditor = function (path, item, index) {
    const pages = [
      { name: "-- Select Website Page --", path: "" },
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
      { name: "About", path: "/about-us" },
      { name: "Contact", path: "/contact" },
      { name: "Studio (Dashboard)", path: "/dashboard" },
      { name: "Editor", path: "/custom-frame-design" },
      { name: "FAQ", path: "/faq" },
      { name: "Order Tracking", path: "/order-tracking" },
      { name: "Checkout", path: "/checkout" }
    ];

    const selectOptions = pages.map(p => `
      <option value="${p.path}" ${item.page === p.path ? 'selected' : ''}>${p.name}</option>
    `).join('');

    return `
      <div class="p-4 bg-editorbg/40 rounded-xl border border-sand/30 space-y-3">
        <div class="flex items-center justify-between border-b border-sand/30 pb-2 mb-2">
          <span class="text-xs font-bold text-charcoal">${item.name || 'Link ' + (index + 1)}</span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Link Text</label>
            <input type="text" value="${item.name || ''}" 
              oninput="window.updateFooterLinkField('${path}', ${index}, 'name', this.value)" 
              class="w-full px-2 py-1.5 bg-white border border-sand rounded-lg text-xs text-charcoal focus:outline-none focus:border-flame transition">
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Text Color Override</label>
            <div class="flex items-center gap-2">
              <input type="color" value="${item.color || '#EEDFCE'}" 
                onchange="window.updateFooterLinkField('${path}', ${index}, 'color', this.value)" 
                class="w-8 h-8 rounded cursor-pointer border border-sand shadow-sm p-0">
              <button onclick="window.updateFooterLinkField('${path}', ${index}, 'color', ''); this.previousElementSibling.value='#EEDFCE';" 
                class="px-2 py-1 bg-sand/30 hover:bg-sand/50 text-[10px] font-bold rounded text-slate hover:text-charcoal transition">Reset</button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Select Website Page (Option 1)</label>
            <select onchange="window.updateFooterLinkField('${path}', ${index}, 'page', this.value)" 
              class="w-full px-2 py-1.5 bg-white border border-sand rounded-lg text-xs text-charcoal focus:outline-none focus:border-flame transition">
              ${selectOptions}
            </select>
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Custom URL (Option 2 - Overrides Page)</label>
            <input type="text" value="${item.customUrl || ''}" placeholder="https://... or /custom-page"
              oninput="window.updateFooterLinkField('${path}', ${index}, 'customUrl', this.value)" 
              class="w-full px-2 py-1.5 bg-white border border-sand rounded-lg text-xs text-charcoal focus:outline-none focus:border-flame transition">
          </div>
        </div>
      </div>
    `;
  };

  window.renderFooterContactItemEditor = function (path, item, index) {
    const pages = [
      { name: "-- Select Website Page --", path: "" },
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
      { name: "About", path: "/about-us" },
      { name: "Contact", path: "/contact" },
      { name: "Studio (Dashboard)", path: "/dashboard" },
      { name: "Editor", path: "/custom-frame-design" },
      { name: "FAQ", path: "/faq" },
      { name: "Order Tracking", path: "/order-tracking" },
      { name: "Checkout", path: "/checkout" }
    ];

    const selectOptions = pages.map(p => `
      <option value="${p.path}" ${item.page === p.path ? 'selected' : ''}>${p.name}</option>
    `).join('');

    return `
      <div class="p-4 bg-editorbg/40 rounded-xl border border-sand/30 space-y-3">
        <div class="flex items-center justify-between border-b border-sand/30 pb-2 mb-2">
          <span class="text-xs font-bold text-charcoal">${item.name || 'Contact Item ' + (index + 1)}</span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Contact Label</label>
            <input type="text" value="${item.name || ''}" disabled
              class="w-full px-2 py-1.5 bg-sand/20 border border-sand rounded-lg text-xs text-charcoal cursor-not-allowed">
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Contact Value Text</label>
            <input type="text" value="${item.text || ''}" 
              oninput="window.updateFooterLinkField('${path}', ${index}, 'text', this.value)" 
              class="w-full px-2 py-1.5 bg-white border border-sand rounded-lg text-xs text-charcoal focus:outline-none focus:border-flame transition">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Select Website Page (Option 1)</label>
            <select onchange="window.updateFooterLinkField('${path}', ${index}, 'page', this.value)" 
              class="w-full px-2 py-1.5 bg-white border border-sand rounded-lg text-xs text-charcoal focus:outline-none focus:border-flame transition">
              ${selectOptions}
            </select>
          </div>
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Custom URL (Option 2 - Overrides Page)</label>
            <input type="text" value="${item.customUrl || ''}" placeholder="https://... or /custom-page"
              oninput="window.updateFooterLinkField('${path}', ${index}, 'customUrl', this.value)" 
              class="w-full px-2 py-1.5 bg-white border border-sand rounded-lg text-xs text-charcoal focus:outline-none focus:border-flame transition">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div>
            <label class="text-[9px] font-bold text-slate block mb-1">Text Color Override</label>
            <div class="flex items-center gap-2">
              <input type="color" value="${item.color || '#EEDFCE'}" 
                onchange="window.updateFooterLinkField('${path}', ${index}, 'color', this.value)" 
                class="w-8 h-8 rounded cursor-pointer border border-sand shadow-sm p-0">
              <button onclick="window.updateFooterLinkField('${path}', ${index}, 'color', ''); this.previousElementSibling.value='#EEDFCE';" 
                class="px-2 py-1 bg-sand/30 hover:bg-sand/50 text-[10px] font-bold rounded text-slate hover:text-charcoal transition">Reset</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // ==========================================
  // CUSTOM HEADER CMS EDITOR LAYOUT AND EVENT HANDLERS
  // ==========================================
  window.toggleHeaderAccordion = function (id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (el) {
      el.classList.toggle('hidden');
      if (icon) {
        icon.classList.toggle('rotate-180');
      }
    }
  };

  window.updateRightBtnField = function (btnIdx, key, val) {
    if (!window.draftCustomization.right_action_buttons) {
      window.draftCustomization.right_action_buttons = clone(window.defaultCustomization.right_action_buttons);
    }
    const btn = window.draftCustomization.right_action_buttons[btnIdx];
    btn[key] = val;

    // Clear iconUrl if iconSource is none
    if (key === 'iconSource' && val === 'none') {
      btn.iconUrl = "";
    }

    if (btn.page === undefined) btn.page = "";
    if (btn.customUrl === undefined) btn.customUrl = "";

    btn.url = btn.customUrl ? btn.customUrl : (btn.page || '/');

    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
    if (key === 'iconSource' || key === 'enabled' || key === 'visible' || key === 'name' || key === 'showBeforeLogin') {
      window.renderHeaderCmsEditor(document.getElementById('cms-item-editor-frame'));
    }
  };

  window.addRightBtnDropdownItem = function (btnIdx) {
    const btn = window.draftCustomization.right_action_buttons[btnIdx];
    if (!btn.dropdown) {
      btn.dropdown = [];
    }
    btn.dropdown.push({ name: "New Sublink", url: "/", page: "/", customUrl: "", enabled: true, visible: true });

    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
    window.renderHeaderCmsEditor(document.getElementById('cms-item-editor-frame'));
  };

  window.updateRightBtnSubField = function (btnIdx, sIdx, key, val) {
    const sub = window.draftCustomization.right_action_buttons[btnIdx].dropdown[sIdx];
    sub[key] = val;
    if (sub.page === undefined) sub.page = "";
    if (sub.customUrl === undefined) sub.customUrl = "";

    sub.url = sub.customUrl ? sub.customUrl : (sub.page || '/');

    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
  };

  window.deleteRightBtnSub = function (btnIdx, sIdx) {
    window.draftCustomization.right_action_buttons[btnIdx].dropdown.splice(sIdx, 1);
    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
    window.renderHeaderCmsEditor(document.getElementById('cms-item-editor-frame'));
  };

  window.reorderRightBtnSub = function (btnIdx, sIdx, dir) {
    const arr = window.draftCustomization.right_action_buttons[btnIdx].dropdown;
    const targetIdx = sIdx + dir;
    if (targetIdx < 0 || targetIdx >= arr.length) return;
    const temp = arr[sIdx];
    arr[sIdx] = arr[targetIdx];
    arr[targetIdx] = temp;

    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
    window.renderHeaderCmsEditor(document.getElementById('cms-item-editor-frame'));
  };

  window.reorderRightBtn = function (btnIdx, dir) {
    const arr = window.draftCustomization.right_action_buttons;
    const targetIdx = btnIdx + dir;
    if (targetIdx < 0 || targetIdx >= arr.length) return;
    const temp = arr[btnIdx];
    arr[btnIdx] = arr[targetIdx];
    arr[targetIdx] = temp;

    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
    window.renderHeaderCmsEditor(document.getElementById('cms-item-editor-frame'));
  };

  window.reorderNavSub = function (idx, sIdx, dir) {
    const arr = window.draftCustomization.navigation[idx].dropdown;
    const targetIdx = sIdx + dir;
    if (targetIdx < 0 || targetIdx >= arr.length) return;
    const temp = arr[sIdx];
    arr[sIdx] = arr[targetIdx];
    arr[targetIdx] = temp;

    window.applyCmsPreview('navigation');
    window.checkCmsDirty();
    window.renderHeaderCmsEditor(document.getElementById('cms-item-editor-frame'));
  };

  window.renderHeaderCmsEditor = function (container) {
    const logos = window.draftCustomization.logos || {};
    const nav = window.draftCustomization.navigation || [];

    // Ensure default settings exist for right_action_btn
    if (!window.draftCustomization.right_action_btn) {
      window.draftCustomization.right_action_btn = clone(window.defaultCustomization.right_action_btn);
    }
    const rightBtn = window.draftCustomization.right_action_btn;

    // Ensure default settings exist for right_action_buttons
    if (!window.draftCustomization.right_action_buttons) {
      window.draftCustomization.right_action_buttons = clone(window.defaultCustomization.right_action_buttons);
    }
    const rightBtns = window.draftCustomization.right_action_buttons;
    rightBtns.forEach(btn => {
      if (btn.page === undefined) btn.page = "";
      if (btn.customUrl === undefined) btn.customUrl = btn.url || "";
      if (btn.dropdown) {
        btn.dropdown.forEach(sub => {
          if (sub.page === undefined) sub.page = "";
          if (sub.customUrl === undefined) sub.customUrl = sub.url || "";
        });
      }
    });

    // Migrate navigation fields for page and customUrl
    nav.forEach(item => {
      if (item.page === undefined) {
        item.page = "";
        item.customUrl = item.url || "";
      }
      if (item.dropdown) {
        item.dropdown.forEach(sub => {
          if (sub.page === undefined) {
            sub.page = "";
            sub.customUrl = sub.url || "";
          }
        });
      }
    });

    // Migrate rightBtn sublinks
    if (rightBtn.dropdown) {
      rightBtn.dropdown.forEach(sub => {
        if (sub.page === undefined) {
          sub.page = "";
          sub.customUrl = sub.url || "";
        }
      });
    }

    let html = renderEditorHeader("Header & Navigation Editor", "window.renderCmsDashboard()");
    html += `<div class="space-y-4 text-xs font-semibold text-slate">`;

    // SECTION 1: COMPANY BRANDING ACCORDION
    const brandingPages = [
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
      { name: "About", path: "/about-us" },
      { name: "Contact", path: "/contact" },
      { name: "Studio (Dashboard)", path: "/dashboard" },
      { name: "Editor", path: "/custom-frame-design" },
      { name: "FAQ", path: "/faq" },
      { name: "Order Tracking", path: "/order-tracking" },
      { name: "Checkout", path: "/checkout" }
    ];

    const brandingSelect = brandingPages.map(p => `
      <option value="${p.path}" ${logos.brandingPage === p.path ? 'selected' : ''}>${p.name}</option>
    `).join('');

    html += `
      <div class="bg-white border border-sand/45 rounded-2xl overflow-hidden shadow-sm">
        <button onclick="window.toggleHeaderAccordion('header-acc-branding')" class="w-full flex items-center justify-between p-4 bg-white hover:bg-editorbg/30 text-left transition font-bold text-xs text-charcoal border-b border-sand/30">
          <span>Company Branding</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate transform transition-transform duration-200" id="icon-header-acc-branding"></i>
        </button>
        <div id="header-acc-branding" class="hidden p-5 space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <input type="checkbox" id="chk-hide-branding" ${logos.hideBranding ? 'checked' : ''} onchange="window.setCmsValue('logos.hideBranding', this.checked)" class="rounded border-sand text-flame">
            <label for="chk-hide-branding" class="text-xs font-bold text-charcoal cursor-pointer">Hide Company Logo/Branding Completely</label>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[9px] font-bold text-slate uppercase block mb-1">Logo Text Prefix</label>
              <input type="text" value="${logos.textPrefix || ''}" oninput="window.setCmsValue('logos.textPrefix', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate uppercase block mb-1">Logo Text Suffix (Orange)</label>
              <input type="text" value="${logos.textSuffix || ''}" oninput="window.setCmsValue('logos.textSuffix', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[9px] font-bold text-slate uppercase block mb-1">Website Page Destination</label>
              <select onchange="window.setCmsValue('logos.brandingPage', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
                ${brandingSelect}
              </select>
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate uppercase block mb-1">Custom URL Override</label>
              <input type="text" value="${logos.brandingCustomUrl || ''}" placeholder="e.g. https://... or /custom-page" oninput="window.setCmsValue('logos.brandingCustomUrl', this.value)" class="w-full p-2 bg-editorbg border border-sand rounded-lg text-xs">
            </div>
          </div>
        </div>
      </div>
    `;

    // SECTION 2: NAVIGATION BUTTONS ACCORDION
    html += `
      <div class="bg-white border border-sand/45 rounded-2xl overflow-hidden shadow-sm">
        <button onclick="window.toggleHeaderAccordion('header-acc-nav')" class="w-full flex items-center justify-between p-4 bg-white hover:bg-editorbg/30 text-left transition font-bold text-xs text-charcoal border-b border-sand/30">
          <span>Navigation Buttons</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate transform transition-transform duration-200" id="icon-header-acc-nav"></i>
        </button>
        <div id="header-acc-nav" class="hidden p-5 space-y-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-[10px] font-black uppercase text-slate tracking-wider">Navigation Menu Hierarchy</span>
            <button onclick="window.addNavMenuItem()" class="bg-flame text-cream px-3 py-1.5 rounded-lg text-[10px] font-bold shadow transition flex items-center gap-1">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add New Route
            </button>
          </div>
          
          <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            ${nav.map((item, idx) => {
      const pagesSelectOptions = brandingPages.map(p => `
                <option value="${p.path}" ${item.page === p.path ? 'selected' : ''}>${p.name}</option>
              `).join('');

      return `
                <div class="p-4 bg-editorbg/30 border border-sand/40 rounded-xl space-y-3 relative group">
                  <div class="absolute right-3 top-3 flex items-center gap-1">
                    <button onclick="window.reorderNav(${idx}, -1)" class="w-6 h-6 rounded bg-white border border-sand flex items-center justify-center text-slate hover:text-charcoal"><i data-lucide="chevron-up" class="w-3.5 h-3.5"></i></button>
                    <button onclick="window.reorderNav(${idx}, 1)" class="w-6 h-6 rounded bg-white border border-sand flex items-center justify-center text-slate hover:text-charcoal"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
                    <button onclick="window.deleteNav(${idx})" class="w-6 h-6 rounded bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 ml-2"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                  </div>
                  
                  <div class="grid grid-cols-3 gap-3 w-[78%]">
                    <div>
                      <label class="text-[8px] font-bold block mb-0.5 text-slate">Menu Link Name</label>
                      <input type="text" value="${item.name}" oninput="window.updateNavField(${idx}, 'name', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-[10px]">
                    </div>
                    <div>
                      <label class="text-[8px] font-bold block mb-0.5 text-slate">Select Page</label>
                      <select onchange="window.updateNavField(${idx}, 'page', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-[10px]">
                        <option value="">-- Custom URL --</option>
                        ${pagesSelectOptions}
                      </select>
                    </div>
                    <div>
                      <label class="text-[8px] font-bold block mb-0.5 text-slate">Custom URL</label>
                      <input type="text" value="${item.customUrl || ''}" placeholder="e.g. /custom" oninput="window.updateNavField(${idx}, 'customUrl', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-[10px]">
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <input type="checkbox" id="chk-nav-${idx}" ${item.enabled ? 'checked' : ''} onchange="window.updateNavField(${idx}, 'enabled', this.checked)" class="rounded border-sand text-flame">
                    <label for="chk-nav-${idx}" class="text-[9px] font-bold text-slate cursor-pointer">Show this route (Enabled)</label>
                  </div>

                  <!-- Dropdown submenu -->
                  <div class="border-t border-sand/20 pt-3 space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-[9px] font-bold uppercase tracking-wider text-slate">Submenu Dropdown Elements</span>
                      <button onclick="window.addNavDropdownItem(${idx})" class="text-[9px] text-flame font-bold hover:underline flex items-center gap-0.5"><i data-lucide="plus" class="w-2.5 h-2.5"></i> Add Sublink</button>
                    </div>
                    ${item.dropdown && item.dropdown.length > 0 ? `
                      <div class="space-y-2 pl-4 border-l border-sand/40">
                        ${item.dropdown.map((sub, sIdx) => {
        const subSelectOptions = brandingPages.map(p => `
                            <option value="${p.path}" ${sub.page === p.path ? 'selected' : ''}>${p.name}</option>
                          `).join('');

        return `
                            <div class="bg-white/40 p-2 border border-sand/30 rounded-lg space-y-2">
                              <div class="flex items-center gap-2">
                                <input type="text" value="${sub.name}" placeholder="Sub Name" oninput="window.updateNavSubField(${idx}, ${sIdx}, 'name', this.value)" class="p-1 text-xs border border-sand rounded bg-white w-1/3">
                                <select onchange="window.updateNavSubField(${idx}, ${sIdx}, 'page', this.value)" class="p-1 text-xs border border-sand rounded bg-white w-1/3">
                                  <option value="">-- Custom URL --</option>
                                  ${subSelectOptions}
                                </select>
                                <input type="text" value="${sub.customUrl || ''}" placeholder="Sub Custom URL" oninput="window.updateNavSubField(${idx}, ${sIdx}, 'customUrl', this.value)" class="p-1 text-xs border border-sand rounded bg-white w-1/3">
                                <button onclick="window.deleteNavSub(${idx}, ${sIdx})" class="text-red-500 hover:text-red-700 ml-auto shrink-0"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                              </div>
                              <div class="flex items-center gap-1 pl-2">
                                <button onclick="window.reorderNavSub(${idx}, ${sIdx}, -1)" class="text-[9px] bg-white border border-sand px-1.5 py-0.5 rounded text-slate hover:text-charcoal flex items-center gap-0.5"><i data-lucide="chevron-up" class="w-2.5 h-2.5"></i> Up</button>
                                <button onclick="window.reorderNavSub(${idx}, ${sIdx}, 1)" class="text-[9px] bg-white border border-sand px-1.5 py-0.5 rounded text-slate hover:text-charcoal flex items-center gap-0.5"><i data-lucide="chevron-down" class="w-2.5 h-2.5"></i> Down</button>
                              </div>
                            </div>
                          `;
      }).join('')}
                      </div>
                    ` : `<span class="text-[9px] text-slate italic block pl-4">No drop-down sublinks registered.</span>`}
                  </div>
                </div>
              `;
    }).join('')}
          </div>
        </div>
      </div>
    `;

    // SECTION 3: RIGHT ACTION BUTTONS ACCORDION
    html += `
      <div class="bg-white border border-sand/45 rounded-2xl overflow-hidden shadow-sm">
        <button onclick="window.toggleHeaderAccordion('header-acc-right-btn')" class="w-full flex items-center justify-between p-4 bg-white hover:bg-editorbg/30 text-left transition font-bold text-xs text-charcoal border-b border-sand/30">
          <span>Right Action Buttons</span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate transform transition-transform duration-200" id="icon-header-acc-right-btn"></i>
        </button>
        <div id="header-acc-right-btn" class="hidden p-5 space-y-4">
          <div class="space-y-4">
    `;

    rightBtns.forEach((btn, btnIdx) => {
      const rightBtnSelectOptions = brandingPages.map(p => `
        <option value="${p.path}" ${btn.page === p.path ? 'selected' : ''}>${p.name}</option>
      `).join('');

      const showBeforeLoginVal = (btn.showBeforeLogin !== undefined)
        ? btn.showBeforeLogin
        : (btn.actionType !== 'profile');

      html += `
        <div class="p-4 bg-editorbg/30 border border-sand/40 rounded-xl space-y-3 relative group">
          <div class="absolute right-3 top-3 flex items-center gap-1">
            <button onclick="window.reorderRightBtn(${btnIdx}, -1)" class="w-6 h-6 rounded bg-white border border-sand flex items-center justify-center text-slate hover:text-charcoal"><i data-lucide="chevron-up" class="w-3.5 h-3.5"></i></button>
            <button onclick="window.reorderRightBtn(${btnIdx}, 1)" class="w-6 h-6 rounded bg-white border border-sand flex items-center justify-center text-slate hover:text-charcoal"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
          </div>

          <div class="text-xs font-bold text-charcoal flex items-center gap-2">
            <span>${btn.name || 'Action Button'}</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-sand/50 text-slate uppercase font-semibold">${btn.actionType}</span>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 py-1">
            <div class="flex items-center gap-1.5">
              <input type="checkbox" id="chk-btn-enabled-${btnIdx}" ${btn.enabled ? 'checked' : ''} onchange="window.updateRightBtnField(${btnIdx}, 'enabled', this.checked)" class="rounded border-sand text-flame">
              <label for="chk-btn-enabled-${btnIdx}" class="text-[10px] font-bold text-slate cursor-pointer">Restore (Enabled)</label>
            </div>
            <div class="flex items-center gap-1.5">
              <input type="checkbox" id="chk-btn-visible-${btnIdx}" ${btn.visible ? 'checked' : ''} onchange="window.updateRightBtnField(${btnIdx}, 'visible', this.checked)" class="rounded border-sand text-flame">
              <label for="chk-btn-visible-${btnIdx}" class="text-[10px] font-bold text-slate cursor-pointer">Show (Visible)</label>
            </div>
            <div class="flex items-center gap-1.5">
              <label for="sel-btn-showbeforelogin-${btnIdx}" class="text-[10px] font-bold text-slate">Show Before Login:</label>
              <select id="sel-btn-showbeforelogin-${btnIdx}" onchange="window.updateRightBtnField(${btnIdx}, 'showBeforeLogin', this.value === 'yes')" class="p-1 bg-white border border-sand rounded text-[10px] font-bold text-slate">
                <option value="yes" ${showBeforeLoginVal ? 'selected' : ''}>Yes</option>
                <option value="no" ${!showBeforeLoginVal ? 'selected' : ''}>No</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-[8px] font-bold block mb-0.5 text-slate">Rename Button</label>
              <input type="text" value="${btn.name || ''}" oninput="window.updateRightBtnField(${btnIdx}, 'name', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-[10px]">
            </div>
            <div>
              <label class="text-[8px] font-bold block mb-0.5 text-slate">Select Page</label>
              <select onchange="window.updateRightBtnField(${btnIdx}, 'page', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-[10px]">
                <option value="">-- Custom URL --</option>
                ${rightBtnSelectOptions}
              </select>
            </div>
            <div>
              <label class="text-[8px] font-bold block mb-0.5 text-slate">Custom URL</label>
              <input type="text" value="${btn.customUrl || ''}" placeholder="e.g. /custom" oninput="window.updateRightBtnField(${btnIdx}, 'customUrl', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-[10px]">
            </div>
          </div>

          <!-- Icon options -->
          <div class="p-4 bg-editorbg/30 border border-sand/40 rounded-xl space-y-3">
            <span class="text-[9px] font-black uppercase text-slate tracking-wider block">Button Icon Settings</span>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[8px] font-bold block mb-0.5 text-slate">Icon Method</label>
                <select onchange="window.updateRightBtnField(${btnIdx}, 'iconSource', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-[10px]">
                  <option value="none" ${btn.iconSource === 'none' ? 'selected' : ''}>Default Icon</option>
                  <option value="image_url" ${btn.iconSource === 'image_url' ? 'selected' : ''}>Image URL</option>
                  <option value="upload_image" ${btn.iconSource === 'upload_image' ? 'selected' : ''}>Upload Image</option>
                </select>
              </div>
              
              <div>
                ${btn.iconSource === 'image_url' ? `
                  <label class="text-[8px] font-bold block mb-0.5 text-slate">Icon Image URL</label>
                  <input type="text" value="${btn.iconUrl || ''}" oninput="window.updateRightBtnField(${btnIdx}, 'iconUrl', this.value)" class="w-full p-1.5 bg-white border border-sand rounded-lg text-[10px]">
                ` : ''}
                
                ${btn.iconSource === 'upload_image' ? `
                  <label class="text-[8px] font-bold block mb-0.5 text-slate">Upload Icon</label>
                  <div class="flex items-center gap-2">
                    <button onclick="document.getElementById('upload-right-btn-icon-${btnIdx}').click()" class="bg-flame text-cream px-3 py-1.5 rounded-lg text-[9px] font-bold shadow transition shrink-0">Upload File</button>
                    <input type="file" id="upload-right-btn-icon-${btnIdx}" class="hidden" onchange="window.handleCmsImageUpload(event, 'right_action_buttons.${btnIdx}.iconUrl')">
                    ${btn.iconUrl ? `<img id="preview-img-right_action_buttons-${btnIdx}-iconUrl" src="${btn.iconUrl}" class="w-8 h-8 object-contain rounded border border-sand">` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Dropdown submenu for Profile -->
          ${btn.actionType === 'profile' ? `
            <div class="border-t border-sand/20 pt-3 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-[9px] font-bold uppercase tracking-wider text-slate">Profile Dropdown Submenu Links</span>
                <button onclick="window.addRightBtnDropdownItem(${btnIdx})" class="text-[9px] text-flame font-bold hover:underline flex items-center gap-0.5"><i data-lucide="plus" class="w-2.5 h-2.5"></i> Add Sublink</button>
              </div>
              ${btn.dropdown && btn.dropdown.length > 0 ? `
                <div class="space-y-2 pl-4 border-l border-sand/40">
                  ${btn.dropdown.map((sub, sIdx) => {
        const subSelectOptions = brandingPages.map(p => `
                      <option value="${p.path}" ${sub.page === p.path ? 'selected' : ''}>${p.name}</option>
                    `).join('');

        return `
                      <div class="bg-white/40 p-2 border border-sand/30 rounded-lg space-y-2">
                        <div class="flex items-center gap-2">
                          <input type="text" value="${sub.name}" placeholder="Sub Name" oninput="window.updateRightBtnSubField(${btnIdx}, ${sIdx}, 'name', this.value)" class="p-1 text-xs border border-sand rounded bg-white w-[30%]">
                          <select onchange="window.updateRightBtnSubField(${btnIdx}, ${sIdx}, 'page', this.value)" class="p-1 text-xs border border-sand rounded bg-white w-[30%]">
                            <option value="">-- Custom URL --</option>
                            ${subSelectOptions}
                          </select>
                          <input type="text" value="${sub.customUrl || ''}" placeholder="Sub Custom URL" oninput="window.updateRightBtnSubField(${btnIdx}, ${sIdx}, 'customUrl', this.value)" class="p-1 text-xs border border-sand rounded bg-white w-[30%]">
                          <button onclick="window.deleteRightBtnSub(${btnIdx}, ${sIdx})" class="text-red-500 hover:text-red-700 ml-auto shrink-0"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                        </div>
                        <div class="flex items-center gap-3 pl-2">
                          <div class="flex items-center gap-1">
                            <input type="checkbox" id="chk-sub-enabled-${btnIdx}-${sIdx}" ${sub.enabled !== false ? 'checked' : ''} onchange="window.updateRightBtnSubField(${btnIdx}, ${sIdx}, 'enabled', this.checked)" class="rounded border-sand text-flame w-3 h-3">
                            <label for="chk-sub-enabled-${btnIdx}-${sIdx}" class="text-[8px] font-bold text-slate cursor-pointer">Restore (Enabled)</label>
                          </div>
                          <div class="flex items-center gap-1">
                            <input type="checkbox" id="chk-sub-visible-${btnIdx}-${sIdx}" ${sub.visible !== false ? 'checked' : ''} onchange="window.updateRightBtnSubField(${btnIdx}, ${sIdx}, 'visible', this.checked)" class="rounded border-sand text-flame w-3 h-3">
                            <label for="chk-sub-visible-${btnIdx}-${sIdx}" class="text-[8px] font-bold text-slate cursor-pointer">Show (Visible)</label>
                          </div>
                          <button onclick="window.reorderRightBtnSub(${btnIdx}, ${sIdx}, -1)" class="text-[8px] bg-white border border-sand px-1 py-0.5 rounded text-slate hover:text-charcoal flex items-center gap-0.5"><i data-lucide="chevron-up" class="w-2 h-2"></i> Up</button>
                          <button onclick="window.reorderRightBtnSub(${btnIdx}, ${sIdx}, 1)" class="text-[8px] bg-white border border-sand px-1 py-0.5 rounded text-slate hover:text-charcoal flex items-center gap-0.5"><i data-lucide="chevron-down" class="w-2 h-2"></i> Down</button>
                        </div>
                      </div>
                    `;
      }).join('')}
                </div>
              ` : `<span class="text-[9px] text-slate italic block pl-4">No sublinks registered.</span>`}
            </div>
          ` : ''}

        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    html += `</div>`; // Close space-y-4
    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

})();
