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

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll reveal (also covers the desaturate-to-colour image reveal)
  var els = document.querySelectorAll(".reveal, .img-reveal");
  if (!("IntersectionObserver" in window) || reducedMotion) {
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

  // Animated stat numbers (trust strip): counts up from 0 to the final
  // value once scrolled into view. The element's own text is the source
  // of truth for the final display (e.g. "1:1", "100%") - every matching
  // occurrence of the target number within it is swapped for the
  // in-progress count each frame, then reset to the exact original text.
  var counters = document.querySelectorAll(".count-up");
  if (counters.length && "IntersectionObserver" in window && !reducedMotion) {
    var animateCount = function (el) {
      var finalText = el.textContent;
      var target = parseInt(el.getAttribute("data-count-to"), 10);
      if (isNaN(target)) return;
      var duration = 1100;
      var start = null;
      var step = function (timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(target * eased);
        el.textContent = finalText.split(String(target)).join(String(current));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = finalText;
        }
      };
      requestAnimationFrame(step);
    };
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countIo.observe(el); });
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
    // Deep links from other pages (e.g. "portfolio.html#filter-brows") land
    // pre-filtered to the relevant category, not just scrolled to the grid.
    var hashFilter = document.getElementById(window.location.hash.slice(1));
    if (hashFilter && hashFilter.classList.contains("gallery-filter")) {
      hashFilter.click();
    }
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
        // Applying the item's own category filter first (if it isn't already
        // active) means closing the lightbox leaves the gallery filtered to
        // match what was just viewed, and the filter scales cleanly as more
        // photos are added per category later.
        var category = (item.getAttribute("data-category") || "").split(" ")[0];
        var matchingFilter = category && document.getElementById("filter-" + category);
        if (matchingFilter && matchingFilter.getAttribute("aria-pressed") !== "true") {
          matchingFilter.click();
        }
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
