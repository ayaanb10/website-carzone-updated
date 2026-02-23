(function () {
  const STORAGE_KEY = "carzone-cart";

  function getCart() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      // ignore storage errors for this demo
    }
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    updateCartCount(cart);
    showAddToast();
  }

  function clearCart() {
    saveCart([]);
    updateCartCount([]);
  }

  function updateCartCount(cart) {
    const currentCart = cart || getCart();
    const count = currentCart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const countEls = document.querySelectorAll("[data-cart-count]");
    countEls.forEach((el) => {
      el.textContent = count;
      const parent = el.closest(".nav-link");
      if (parent) {
        parent.classList.toggle("has-items", count > 0);
      }
    });
  }

  function formatCurrency(value) {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);
    } catch (e) {
      return "₹" + Math.round(value).toString();
    }
  }

  function renderCheckout() {
    const list = document.querySelector("[data-summary-items]");
    const subtotalEl = document.querySelector("[data-summary-subtotal]");
    const shippingEl = document.querySelector("[data-summary-shipping]");
    const totalEl = document.querySelector("[data-summary-total]");
    const emptyEl = document.querySelector("[data-cart-empty]");
    if (!list || !subtotalEl || !shippingEl || !totalEl || !emptyEl) return;

    const cart = getCart();
    list.innerHTML = "";

    if (!cart.length) {
      emptyEl.hidden = false;
      subtotalEl.textContent = formatCurrency(0);
      shippingEl.textContent = formatCurrency(0);
      totalEl.textContent = formatCurrency(0);
      return;
    }

    emptyEl.hidden = true;
    let subtotal = 0;

    cart.forEach((item) => {
      const li = document.createElement("li");
      const qty = item.quantity || 1;
      const lineTotal = item.price * qty;
      subtotal += lineTotal;
      li.innerHTML = `<span>${item.name} × ${qty}</span><span>${formatCurrency(lineTotal)}</span>`;
      list.appendChild(li);
    });

    const shipping = 99;
    subtotalEl.textContent = formatCurrency(subtotal);
    shippingEl.textContent = formatCurrency(cart.length ? shipping : 0);
    totalEl.textContent = formatCurrency(subtotal + (cart.length ? shipping : 0));
  }

  function attachProductButtons() {
    const buttons = document.querySelectorAll("[data-add-to-cart]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest("[data-product]");
        if (!card) return;
        const id = card.getAttribute("data-product-id");
        const price = Number(card.getAttribute("data-product-price") || "0");
        const nameEl = card.querySelector("[data-product-name]");
        const name = nameEl ? nameEl.textContent.trim() : "Product";
        addToCart({ id, price, name });
      });
    });
  }

  function initFooterYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    const contactSuccess = document.getElementById("contact-success");
    if (!contactForm || !contactSuccess) return;

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      contactSuccess.hidden = false;
      contactForm.reset();
    });
  }

  function initCheckoutForm() {
    const checkoutForm = document.getElementById("checkout-form");
    const checkoutSuccess = document.getElementById("checkout-success");
    if (!checkoutForm || !checkoutSuccess) return;

    checkoutForm.addEventListener("submit", function (e) {
      e.preventDefault();
      checkoutSuccess.hidden = false;
      clearCart();
      renderCheckout();
      checkoutForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function showAddToast() {
    let toast = document.querySelector(".add-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "add-toast";
      toast.textContent = "Added to cart";
      document.body.appendChild(toast);
    }
    toast.classList.add("visible");
    window.setTimeout(() => {
      toast.classList.remove("visible");
    }, 1500);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFooterYear();
    attachProductButtons();
    initContactForm();
    initCheckoutForm();
    renderCheckout();
    updateCartCount();
  });
})();

