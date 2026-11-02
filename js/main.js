/*
 * Layered Relics — site behaviour (no framework, no build step).
 *  - mobile navigation toggle
 *  - product grid rendered from data/products.json, with category filters
 *  - inquiry form: posts to a form service if configured, otherwise opens an email
 */
(function () {
  "use strict";

  var config = window.LR_CONFIG || {};
  var EMAIL = config.email || "thaylin@gmail.com";
  var PRODUCTS_URL = "data/products.json"; // relative so it works under /layeredrelics/ and on a custom domain

  /* ---------- Navigation ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Products ---------- */
  var state = { products: [], categories: [], filter: "all" };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function isSafeUrl(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url.trim());
  }

  function categoryName(id) {
    for (var i = 0; i < state.categories.length; i++) {
      if (state.categories[i].id === id) return state.categories[i].name;
    }
    return id;
  }

  function productCard(p) {
    var li = el("li");
    var card = el("article", "product-card");
    li.appendChild(card);

    var media = el("div", "product-media");
    var img = el("img");
    img.src = p.image;
    img.alt = p.imageAlt || p.name;
    img.width = 800;
    img.height = 600;
    img.loading = "lazy";
    img.decoding = "async";
    media.appendChild(img);
    if (p.placeholder) media.appendChild(el("span", "product-badge", "Placeholder photo"));
    card.appendChild(media);

    var body = el("div", "product-body");
    body.appendChild(el("p", "product-category", categoryName(p.category)));
    body.appendChild(el("h3", "product-name", p.name));
    body.appendChild(el("p", "product-desc", p.description));

    var footer = el("div", "product-footer");
    footer.appendChild(el("p", "product-price", p.price || "Ask for a quote"));

    var action;
    if (isSafeUrl(p.buyUrl)) {
      action = el("a", "btn btn-primary btn-small", config.buyLabel || "Buy Now");
      action.href = p.buyUrl.trim();
      action.target = "_blank";
      action.rel = "noopener";
      action.setAttribute("aria-label", (config.buyLabel || "Buy Now") + ": " + p.name + " (opens in a new tab)");
    } else {
      action = el("a", "btn btn-secondary btn-small", "Ask About This");
      action.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent("Layered Relics: " + p.name) +
        "&body=" + encodeURIComponent("Hi Chris,\n\nI'm interested in the " + p.name + ".\n\n");
      action.setAttribute("aria-label", "Email to ask about " + p.name);
    }
    footer.appendChild(action);
    body.appendChild(footer);
    card.appendChild(body);
    return li;
  }

  function renderProducts() {
    var grid = document.querySelector("[data-product-grid]");
    if (!grid) return;
    var list = state.products.filter(function (p) {
      return state.filter === "all" || p.category === state.filter;
    });
    grid.textContent = "";
    if (!list.length) {
      grid.appendChild(el("li", "product-status", "Nothing here yet — ask about a custom print!"));
      return;
    }
    list.forEach(function (p) { grid.appendChild(productCard(p)); });
  }

  function setFilter(id) {
    state.filter = id;
    document.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === id));
    });
    renderProducts();
  }

  function renderFilters() {
    var wrap = document.querySelector("[data-filters]");
    if (!wrap) return;
    state.categories.forEach(function (c) {
      var btn = el("button", "filter-btn", c.name);
      btn.type = "button";
      btn.setAttribute("data-filter", c.id);
      btn.setAttribute("aria-pressed", "false");
      wrap.appendChild(btn);
    });
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (btn) setFilter(btn.getAttribute("data-filter"));
    });
    // Category cards ("See dice towers", ...) jump to the collection pre-filtered.
    document.querySelectorAll("[data-filter-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        setFilter(link.getAttribute("data-filter-link"));
      });
    });
  }

  function loadProducts() {
    var grid = document.querySelector("[data-product-grid]");
    if (!grid) return;
    fetch(PRODUCTS_URL, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        state.categories = Array.isArray(data.categories) ? data.categories : [];
        state.products = (Array.isArray(data.products) ? data.products : [])
          .filter(function (p) { return p && p.name; })
          // featured items first, otherwise keep file order
          .map(function (p, i) { return { p: p, i: i }; })
          .sort(function (a, b) { return (b.p.featured ? 1 : 0) - (a.p.featured ? 1 : 0) || a.i - b.i; })
          .map(function (x) { return x.p; });
        renderFilters();
        renderProducts();
      })
      .catch(function (err) {
        grid.textContent = "";
        var li = el("li", "product-status");
        li.appendChild(document.createTextNode("The collection couldn't load right now. Please "));
        var a = el("a", null, "email us");
        a.href = "mailto:" + EMAIL;
        li.appendChild(a);
        li.appendChild(document.createTextNode(" to ask about any piece."));
        grid.appendChild(li);
        if (window.console) console.warn("Layered Relics: could not load " + PRODUCTS_URL, err);
      });
  }

  /* ---------- Inquiry form ---------- */
  function initForm() {
    var form = document.querySelector("[data-inquiry-form]");
    if (!form) return;
    var status = form.querySelector("[data-form-status]");

    function say(msg, isError) {
      status.textContent = msg;
      status.classList.toggle("is-error", !!isError);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      form.querySelectorAll("[required]").forEach(function (field) {
        var ok = field.checkValidity() && field.value.trim() !== "";
        field.setAttribute("aria-invalid", String(!ok));
        if (!ok && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        say("Please fill in your name, a valid email and a short description.", true);
        firstInvalid.focus();
        return;
      }

      var data = new FormData(form);
      if (data.get("_gotcha")) return; // spam bot

      if (isSafeUrl(config.formEndpoint)) {
        say("Sending…");
        fetch(config.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            form.reset();
            say("Thanks! Your request is on its way — expect a reply soon.");
          })
          .catch(function () {
            say("Sorry, that didn't send. Please email " + EMAIL + " instead.", true);
          });
        return;
      }

      // No form service configured: hand off to the visitor's email app.
      var subject = "Custom print request: " + data.get("type");
      var body = "Name: " + data.get("name") + "\n" +
        "Email: " + data.get("email") + "\n" +
        "Looking for: " + data.get("type") + "\n\n" +
        data.get("message") + "\n";
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      say("Opening your email app… If nothing happens, email " + EMAIL + " directly.");
    });
  }

  /* ---------- Misc ---------- */
  function initYear() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  initNav();
  initYear();
  loadProducts();
  initForm();
})();
