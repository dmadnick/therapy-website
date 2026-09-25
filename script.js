// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  });
});

// Highlight the nav link for the section in view
const links = [...nav.querySelectorAll('a:not(.btn)')];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((l) => l.classList.toggle('active', l.hash === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form: submit in the background and show a message on the page
const form = document.getElementById('contact-form');
const status = form?.querySelector('.form-status');
const submitBtn = form?.querySelector('button[type="submit"]');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  status.className = 'form-status';
  status.textContent = 'Sending…';

  try {
    const data = Object.fromEntries(new FormData(form));
    delete data.redirect;
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');

    form.reset();
    status.classList.add('success');
    status.textContent = "Thank you for reaching out. I'll be in touch within two business days.";
  } catch (err) {
    status.classList.add('error');
    status.innerHTML = 'Sorry, something went wrong. Please email me directly at ' +
      '<a href="mailto:dmadnickpsyd@gmail.com">dmadnickpsyd@gmail.com</a>.';
  } finally {
    submitBtn.disabled = false;
  }
});
