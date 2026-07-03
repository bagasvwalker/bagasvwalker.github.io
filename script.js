/**
 * BAGAS VITORO — PORTFOLIO
 * Interactive behavior:
 *   1. Mobile navigation toggle
 *   2. Scroll-spy active nav link
 *   3. Live "session uptime" counter in the hero nameplate
 *   4. Copy-to-clipboard for the contact email
 *   5. Footer year auto-update
 *
 * Written defensively: every DOM lookup is guarded so the page never
 * throws if a section is edited or removed later.
 */
(() => {
  "use strict";

  /* ---------------------------------------------------------------------
   * 1. Mobile navigation toggle
   * ------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the menu after a link is tapped (mobile UX expectation).
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
   * 2. Scroll-spy: highlight the nav link for the section in view
   * ------------------------------------------------------------------- */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinkByHref = new Map(
    Array.from(document.querySelectorAll(".nav-links a")).map((a) => [
      a.getAttribute("href"),
      a,
    ])
  );

  if (sections.length && navLinkByHref.size && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navLinkByHref.get(`#${entry.target.id}`);
          if (!link) return;

          if (entry.isIntersecting) {
            navLinkByHref.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      {
        // Trigger when a section occupies the vertical center band of the
        // viewport, so the "active" state feels accurate while scrolling.
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------------------------------------------------------------------
   * 3. Live session uptime counter — a nod to the industrial-panel theme
   * ------------------------------------------------------------------- */
  const uptimeEl = document.getElementById("uptime");

  if (uptimeEl) {
    const startedAt = Date.now();
    const pad = (n) => String(n).padStart(2, "0");

    const tick = () => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;
      uptimeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    tick();
    // 1s cadence is precise enough for a cosmetic counter and cheap on CPU.
    const intervalId = setInterval(tick, 1000);

    // Pause the interval when the tab is hidden to avoid drift and save
    // battery; resync immediately on return.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(intervalId);
      } else {
        tick();
      }
    });
  }

  /* ---------------------------------------------------------------------
   * 4. Copy-to-clipboard for the contact email
   * ------------------------------------------------------------------- */
  const copyEmailBtn = document.getElementById("copyEmailBtn");

  if (copyEmailBtn) {
    const originalLabel = copyEmailBtn.textContent;
    const emailToCopy = copyEmailBtn.dataset.copy || "";

    copyEmailBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(emailToCopy);
        } else {
          // Fallback for non-secure contexts / older browsers.
          const textarea = document.createElement("textarea");
          textarea.value = emailToCopy;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }

        copyEmailBtn.textContent = "Copied";
        copyEmailBtn.classList.add("is-copied");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        copyEmailBtn.textContent = "Copy failed";
      } finally {
        setTimeout(() => {
          copyEmailBtn.textContent = originalLabel;
          copyEmailBtn.classList.remove("is-copied");
        }, 1800);
      }
    });
  }

  /* ---------------------------------------------------------------------
   * 5. Footer year
   * ------------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
