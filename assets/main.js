/**
 * Blog JS Utilities
 * Handles post list rendering, modal interactions, title highlighting, and scroll-to-top functionality
 */

// ============================================================================
// POST LIST MODULE
// ============================================================================

(function initPostList() {
  const list = document.getElementById("post-list");
  if (!list) return;

  const container =
    document.querySelector(".container") || document.querySelector("main");
  const category = container?.dataset?.category || "";

  function computePostsJsonPath() {
    return new URL("posts.json", window.location.href).pathname.replace(
      /\/[^\/]*$/,
      "/posts.json",
    );
  }

  // function computePostsJsonPath() {
  //   const parts = location.pathname.split("/").filter(Boolean);
  //   if (parts.length && parts[parts.length - 1].endsWith(".html")) {
  //     parts.pop();
  //   }
  //   const ups = parts.length;
  //   const prefix = ups ? "../".repeat(ups) : "./";
  //   return prefix + "assets/posts.json";
  // }

  function markActiveCategory(cat) {
    const links = document.querySelectorAll(".category-link");
    links.forEach((a) => a.classList.remove("active"));

    if (!cat) {
      const allLink =
        document.querySelector('.category-link[href="index.html"]') ||
        document.querySelector('.category-link[href="./"]');
      if (allLink) allLink.classList.add("active");
      return;
    }

    const activeLink = document.querySelector(
      `.category-link[href$='${cat}/']`,
    );
    if (activeLink) activeLink.classList.add("active");
  }

  function renderPostList(posts) {
    list.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      list.innerHTML = '<li class="post-item">No posts yet.</li>';
      return;
    }

    let filteredPosts = posts;
    if (category) {
      filteredPosts = posts.filter((p) => p.category === category);
    }

    // Filter out inactive posts
    filteredPosts = filteredPosts.filter((p) => p.status !== "inactive");

    // Sort newest first
    filteredPosts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    if (filteredPosts.length === 0) {
      list.innerHTML = `<li class="post-item">No posts${
        category ? ` for '${category}'` : ""
      }.</li>`;
      markActiveCategory(category);
      return;
    }

    filteredPosts.forEach((post) => {
      const li = document.createElement("li");
      li.className = "post-item";

      const a = document.createElement("a");
      a.href = post.path || `posts/${post.date}/`;

      const date = document.createElement("span");
      date.className = "post-date";
      date.textContent = post.date;

      const sep = document.createElement("span");
      sep.className = "post-sep";
      sep.textContent = " – ";

      const title = document.createElement("span");
      title.className = "post-title";
      title.textContent = post.title;

      a.appendChild(date);
      a.appendChild(sep);
      a.appendChild(title);
      li.appendChild(a);
      list.appendChild(li);
    });

    markActiveCategory(category);
  }

  const postsJsonPath = computePostsJsonPath();

  fetch(postsJsonPath, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("posts.json not found");
      return response.json();
    })
    .then(renderPostList)
    .catch((error) => {
      console.error("Failed to load posts:", error);
      list.innerHTML = '<li class="post-item">Unable to load posts.</li>';
    });
})();

// ============================================================================
// MODAL MODULE
// ============================================================================

(function initModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  const images = document.querySelectorAll(".zoomImage");
  if (images.length === 0) return;

  function openModal(imageSrc) {
    modal.innerHTML = '<span class="close-btn">&times;</span>';
    const img = document.createElement("img");
    img.src = imageSrc;
    modal.appendChild(img);
    modal.classList.add("show");
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.innerHTML = "";
  }

  images.forEach((image) => {
    image.addEventListener("click", () => {
      openModal(image.src);
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("close-btn")) {
      closeModal();
    }
  });
})();

// ============================================================================
// SCROLL TO TOP BUTTON MODULE
// ============================================================================

(function initScrollToTop() {
  const btn = document.createElement("button");
  btn.id = "scrollToTopBtn";
  btn.className = "scroll-to-top-btn";
  btn.innerHTML = "↑ up";
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    if (scrollPercent > 30) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// ============================================================================
// TITLE HIGHLIGHT MODULE
// ============================================================================

(function initTitleHighlight() {
  const HIGHLIGHT_DURATION = 800; // milliseconds

  function highlightElement(el) {
    // Retrigger animation
    el.classList.remove("highlighted");
    void el.offsetWidth; // Force reflow
    el.classList.add("highlighted");

    if (el._highlightTimeout) {
      clearTimeout(el._highlightTimeout);
    }

    el._highlightTimeout = setTimeout(() => {
      el.classList.remove("highlighted");
      el._highlightTimeout = null;
    }, HIGHLIGHT_DURATION);
  }

  function processHashNavigation() {
    const hash = location.hash;
    if (!hash) return;

    let id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch (e) {
      id = hash.slice(1);
    }

    const target = document.getElementById(id);
    if (!target) return;

    // Get all title-highlight elements including the target itself
    const highlights = Array.from(target.querySelectorAll(".title-highlight"));
    if (target.classList.contains("title-highlight")) {
      highlights.unshift(target);
    }

    if (highlights.length === 0) return;

    highlights.forEach(highlightElement);

    // Focus without scrolling for accessibility
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    setTimeout(() => {
      target.removeAttribute("tabindex");
    }, HIGHLIGHT_DURATION + 200);
  }

  window.addEventListener("hashchange", processHashNavigation);
  window.addEventListener("load", processHashNavigation);
})();
