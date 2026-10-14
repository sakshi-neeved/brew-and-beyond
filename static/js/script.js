(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");
  const productGrid = $("#productGrid");
  const menuSearch = $("#menuSearch");
  const noResults = $("#noResults");
  const cartDrawer = $("#cartDrawer");
  const cartOverlay = $("#cartOverlay");
  const cartItems = $("#cartItems");
  const cartCount = $("#cartCount");
  const drawerCount = $("#drawerCount");
  const cartSubtotal = $("#cartSubtotal");
  const toast = $("#toast");
  const successModal = $("#successModal");
  const modalTitle = $("#modalTitle");
  const modalMessage = $("#modalMessage");
  const modalIcon = $("#modalIcon");

  let activeFilter = "all";
  let cart = {};
  let toastTimer;

  try {
    cart = JSON.parse(localStorage.getItem("brewBeyondCart") || "{}") || {};
  } catch {
    cart = {};
  }

  const money = amount => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(amount);

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function saveCart() {
    try { localStorage.setItem("brewBeyondCart", JSON.stringify(cart)); } catch { /* storage may be unavailable */ }
  }

  function cartQuantity() {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  }

  function cartTotal() {
    return Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function renderCart() {
    const count = cartQuantity();
    cartCount.textContent = count;
    drawerCount.textContent = `(${count})`;
    cartSubtotal.textContent = money(cartTotal());

    const entries = Object.entries(cart);
    if (!entries.length) {
      cartItems.innerHTML = `<div class="empty-cart"><span>🛍️</span><h3>It's looking a little empty.</h3><p>Your next fave is just a sip away.</p><button class="button button-dark" id="browseMenu">Browse the menu ↗</button></div>`;
      $("#browseMenu").addEventListener("click", () => {
        closeCart();
        $("#menu").scrollIntoView({ behavior: "smooth" });
      });
      return;
    }

    cartItems.innerHTML = entries.map(([id, item]) => `
      <div class="cart-item" data-cart-id="${id}">
        <div class="cart-item-emoji" aria-hidden="true">${item.emoji}</div>
        <div>
          <h3>${escapeHTML(item.name)}</h3>
          <p>${money(item.price)} each</p>
          <div class="quantity-controls">
            <button type="button" data-action="decrease" data-id="${id}" aria-label="Decrease ${escapeHTML(item.name)} quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-action="increase" data-id="${id}" aria-label="Increase ${escapeHTML(item.name)} quantity">+</button>
            <button type="button" data-action="remove" data-id="${id}" aria-label="Remove ${escapeHTML(item.name)}" title="Remove item">×</button>
          </div>
        </div>
        <strong class="cart-item-price">${money(item.price * item.quantity)}</strong>
      </div>
    `).join("");
  }

  // Escape user-visible strings before adding them to the cart drawer's HTML.
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function addToCart(button) {
    const { id, name, price, emoji } = button.dataset;
    if (!id || !name || !Number.isFinite(Number(price))) return;
    if (cart[id]) cart[id].quantity += 1;
    else cart[id] = { name, price: Number(price), emoji: emoji || "☕", quantity: 1 };
    saveCart();
    renderCart();
    showToast(`${name} added to your bag ✨`);
    button.classList.add("just-added");
    setTimeout(() => button.classList.remove("just-added"), 350);
  }

  function openCart() {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartOverlay.classList.add("visible");
    document.body.classList.add("no-scroll");
    $("#closeCart").focus();
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartOverlay.classList.remove("visible");
    document.body.classList.remove("no-scroll");
  }

  function filterProducts() {
    const query = menuSearch.value.trim().toLowerCase();
    let visible = 0;
    $$(".product-card", productGrid).forEach(card => {
      const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
      const matchesSearch = card.dataset.name.toLowerCase().includes(query) ||
        card.textContent.toLowerCase().includes(query);
      const show = matchesCategory && matchesSearch;
      card.hidden = !show;
      if (show) visible++;
    });
    noResults.hidden = visible !== 0;
  }

  function openModal(title, message, icon = "✳") {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalIcon.textContent = icon;
    successModal.classList.add("visible");
    document.body.classList.add("no-scroll");
    $("#modalOkay").focus();
  }

  function closeModal() {
    successModal.classList.remove("visible");
    document.body.classList.remove("no-scroll");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  $$("#mainNav a").forEach(link => link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));

  $$(".filter-tab").forEach(button => button.addEventListener("click", () => {
    $$(".filter-tab").forEach(tab => tab.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    filterProducts();
  }));
  menuSearch.addEventListener("input", filterProducts);
  $$(".add-button").forEach(button => button.addEventListener("click", () => addToCart(button)));

  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  cartItems.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    if (!cart[id]) return;
    if (action === "increase") cart[id].quantity += 1;
    if (action === "decrease") cart[id].quantity -= 1;
    if (action === "remove" || cart[id].quantity <= 0) delete cart[id];
    saveCart();
    renderCart();
  });

  $("#checkoutButton").addEventListener("click", () => {
    if (!cartQuantity()) {
      showToast("Your bag needs a little something first 🛍️");
      return;
    }
    openModal("Order energy: immaculate.", "This is a portfolio demo, so checkout isn't connected to a payment service. Your cart is ready to show off!", "🧾");
  });

  $("#reservationDate").min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
  $("#reservationForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const date = form.elements.date.value;
    const time = form.elements.time.value;
    openModal(`You're on the list, ${name}!`, `Your demo table request is set for ${date} at ${time}. No real booking was sent, but your form is working beautifully.`, "♡");
    form.reset();
  });

  $("#newsletterForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    openModal("You're on the list!", "Your demo subscription was captured in the browser interaction. A real mailing list can be connected later.", "✉");
    form.reset();
  });

  $("#closeModal").addEventListener("click", closeModal);
  $("#modalOkay").addEventListener("click", closeModal);
  successModal.addEventListener("click", event => {
    if (event.target === successModal) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCart();
      closeModal();
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  $("#year").textContent = new Date().getFullYear();
  renderCart();

  // Reveal cards gently as they enter the viewport, with a safe fallback.
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    $$(".product-card, .perk, .reservation-card").forEach((element, index) => {
      element.style.animationDelay = `${(index % 3) * 80}ms`;
      observer.observe(element);
    });
  }
})();
