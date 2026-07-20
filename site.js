(function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Scroll reveal (also covers the desaturate-to-colour image reveal)
  var els = document.querySelectorAll(".reveal, .img-reveal");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) { io.observe(el); });
  }

  // Sticky nav: transparent over the top of the page, solid once scrolled
  var header = document.querySelector("header");
  if (header) {
    var setHeaderState = function () {
      header.classList.toggle("at-top", window.scrollY < 60);
    };
    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  }

  // Filterable gallery
  var filters = document.querySelectorAll(".gallery-filter");
  var galleryItems = document.querySelectorAll(".gallery-item");
  if (filters.length && galleryItems.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        var filter = btn.getAttribute("data-filter");
        galleryItems.forEach(function (item) {
          var categories = (item.getAttribute("data-category") || "").split(" ");
          var match = filter === "all" || categories.indexOf(filter) !== -1;
          item.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  // Lightbox
  var lightbox = document.querySelector(".lightbox");
  if (lightbox && galleryItems.length) {
    var lightboxImg = lightbox.querySelector("img");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtn = lightbox.querySelector(".lightbox-prev");
    var nextBtn = lightbox.querySelector(".lightbox-next");
    var visibleItems = function () {
      return Array.prototype.filter.call(galleryItems, function (item) {
        return !item.classList.contains("is-hidden");
      });
    };
    var currentIndex = 0;
    var openAt = function (index) {
      var items = visibleItems();
      if (!items.length) return;
      currentIndex = (index + items.length) % items.length;
      var item = items[currentIndex];
      lightboxImg.src = item.getAttribute("data-full") || item.querySelector("img").src;
      lightboxImg.alt = item.querySelector("img").alt || "";
      lightbox.classList.add("is-open");
      closeBtn.focus();
    };
    galleryItems.forEach(function (item) {
      item.addEventListener("click", function () {
        openAt(visibleItems().indexOf(item));
      });
    });
    var closeLightbox = function () {
      lightbox.classList.remove("is-open");
      lightboxImg.src = "";
    };
    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    if (prevBtn) prevBtn.addEventListener("click", function () { openAt(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { openAt(currentIndex + 1); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") openAt(currentIndex + 1);
      if (e.key === "ArrowLeft") openAt(currentIndex - 1);
    });
  }
})();
