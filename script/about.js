function createHeroSection() {
  const hero = document.createElement('section');
  hero.className = 'hero mb-5';

  const heroLogo = document.createElement('div');
  heroLogo.className = 'hero-logo';
  const h1 = document.createElement('h1');
  h1.textContent = 'About Us';
  heroLogo.appendChild(h1);

  const lead = document.createElement('p');
  lead.className = 'lead';
  lead.textContent = 'Freshly roasted in Singapore. Ethically sourced. Always intentional.';

  const p = document.createElement('p');
  p.textContent = `We’re a small-batch coffee roastery based in Singapore, focused on
    thoughtful sourcing and precise roasting. Each origin is selected for
    its unique character, then roasted in-house to bring out its best —
    nothing more, nothing less. No noise, no shortcuts. Just honest
    coffee, crafted for those who care about the details.`;

  const exploreBtn = document.createElement('a');
  exploreBtn.href = '#';
  exploreBtn.className = 'btn btn-dark mt-3';
  exploreBtn.textContent = 'Explore Now!';

  hero.append(heroLogo, lead, p, exploreBtn);
  return hero;
}

function createTeamSection() {
  const teamSection = document.createElement('section');
  teamSection.className = 'team-section text-center mb-5';

  const h2 = document.createElement('h2');
  h2.className = 'mb-4';
  h2.textContent = 'The Team';

  teamSection.appendChild(h2);

  // Create Desktop Grid (for simplicity, only this here)
  const desktopGrid = document.createElement('div');
  desktopGrid.className = 'row g-4 justify-content-center d-none d-md-flex';

  const teamMembers = [
    {
      name: 'Syahirah',
      role: 'Creative Director',
      img: 'images/placeholder Syahirah.png',
      overlay: 'Creative genius behind the brand.'
    },
    {
      name: 'Keith',
      role: 'Roastmaster',
      img: 'images/placeholder Keith.png',
      overlay: 'Master of the roast profile.'
    },
    {
      name: 'Chee Yong',
      role: 'Operations Lead',
      img: 'images/placeholder Chee Yong.png',
      overlay: 'Orchestrates the logistics.'
    },
    {
      name: 'Ke Wei',
      role: 'Tech & Web',
      img: 'images/placeholder Ke Wei.png',
      overlay: 'Tech wizard of the crew.'
    },
  ];

  teamMembers.forEach(member => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-3';

    const imgContainer = document.createElement('div');
    imgContainer.className = 'team-img-container';

    const img = document.createElement('img');
    img.src = member.img;
    img.alt = member.name;
    img.className = 'img-fluid rounded-circle team-img';

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.textContent = member.overlay;

    imgContainer.append(img, overlay);

    const name = document.createElement('h5');
    name.className = 'team-name';
    name.textContent = member.name;

    const role = document.createElement('p');
    role.className = 'team-role';
    role.textContent = member.role;

    col.append(imgContainer, name, role);
    desktopGrid.appendChild(col);
  });

  teamSection.appendChild(desktopGrid);
  return teamSection;
}

function loadMainContent() {
  const main = document.getElementById('main');
  main.innerHTML = ''; // clear existing content

  const heroSection = createHeroSection();
  const teamSection = createTeamSection();

  main.append(heroSection, teamSection);
}

document.addEventListener('DOMContentLoaded', loadMainContent);

function createContactForm() {
  const section = document.getElementById('contact-section');

  const h2 = document.createElement('h2');
  h2.textContent = 'Contact Us';

  const form = document.createElement('form');
  form.id = 'contactForm';
  form.action = 'https://getform.io/f/aqomopwa';
  form.method = 'POST';
  form.className = 'contact-form';
  form.noValidate = true;

  // Helper to create label + input/textarea
  function createInput({ tag = 'input', type, id, name, placeholder, required = false, pattern, title, rows }) {
    const label = document.createElement('label');
    label.htmlFor = id;

    let labelText;
    switch (id) {
      case 'name':
        labelText = 'Full Name';
        break;
      case 'email':
        labelText = 'Email address';
        break;
      case 'message':
        labelText = 'Your message';
        break;
      default:
        labelText = '';
    }
    label.textContent = labelText;

    let input;
    if (tag === 'textarea') {
      input = document.createElement('textarea');
      if (rows) input.rows = rows;
    } else {
      input = document.createElement('input');
      input.type = type;
    }
    input.id = id;
    input.name = name;
    if (placeholder) input.placeholder = placeholder;
    if (required) input.required = true;
    if (pattern) input.pattern = pattern;
    if (title) input.title = title;

    return [label, input];
  }

  // Full Name input
  const [labelName, inputName] = createInput({
    type: 'text',
    id: 'name',
    name: 'name',
    placeholder: 'Wan Zhen',
    required: true,
    pattern: '^[A-Za-z\\s]{2,}$',
    title: 'Full name should only contain letters and spaces, minimum 2 characters.',
  });

  // Email input with type="text" for better pattern enforcement
  const [labelEmail, inputEmail] = createInput({
    type: 'text', // changed from 'email' to 'text'
    id: 'email',
    name: 'email',
    placeholder: 'wanzhen@gmail.com',
    required: true,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    title: 'Please enter a valid email address with a proper domain (e.g., user@example.com).',
  });

  // Message textarea
  const [labelMessage, textareaMessage] = createInput({
    tag: 'textarea',
    id: 'message',
    name: 'message',
    rows: 5,
    placeholder: 'Please give us your valuable feedback',
    required: true,
    pattern: '.{10,}',
    title: 'Message must be at least 10 characters.',
  });

  // Submit button
  const btnSubmit = document.createElement('button');
  btnSubmit.type = 'submit';
  btnSubmit.className = 'btn btn-dark';
  btnSubmit.textContent = 'Send Message';

  // Append all to form
  form.append(labelName, inputName);
  form.append(labelEmail, inputEmail);
  form.append(labelMessage, textareaMessage);
  form.append(btnSubmit);

  // Append heading + form to section
  section.append(h2, form);
}

// Call this once on page load to create the toast container
function createToastContainer() {
  if (document.getElementById('toast')) return; // prevent duplicates

  const toast = document.createElement('div');
  toast.id = 'toast';
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#333',
    color: '#fff',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    display: 'none',
    zIndex: '9999',
    fontSize: '1rem',
    maxWidth: '90%',
    textAlign: 'center',
  });

  document.body.appendChild(toast);
}

// Call this to show a toast message for a certain time (default 3 seconds)
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  // Fade out after duration
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s ease';
    toast.style.opacity = '0';

    // Hide after fade out
    setTimeout(() => {
      toast.style.display = 'none';
      toast.style.transition = ''; // reset transition for next show
    }, 500);
  }, duration);
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  createToastContainer();

  // Example usage:
  // showToast('Welcome to Express-Oh!');
});

// Call this after DOM content loads
document.addEventListener('DOMContentLoaded', createContactForm);
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  function showToast(message, isSuccess = true) {
    toast.textContent = message;
    toast.style.background = isSuccess ? '#28a745' : '#dc3545';
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = form.name;
    const email = form.email;
    const message = form.message;

    if (!name.checkValidity()) {
      showToast(name.title, false);
      name.focus();
      return;
    }
    if (!email.checkValidity()) {
      showToast(email.title, false);
      email.focus();
      return;
    }

    // Additional manual regex check for email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.value)) {
      showToast('Please enter a valid email address.', false);
      email.focus();
      return;
    }

    if (!message.checkValidity()) {
      showToast(message.title, false);
      message.focus();
      return;
    }

    const formData = new FormData(form);
    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          form.reset();
          showToast('Thank you! Your message has been sent.');
        } else {
          showToast('Oops! Something went wrong.', false);
        }
      })
      .catch(() => {
        showToast('Network error. Please try again later.', false);
      });
  });
});
