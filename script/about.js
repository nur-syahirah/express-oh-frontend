// about.js

// Function to parse JWT (you had this already)
function parseJwt(usertoken) {
  if (!usertoken) return null;
  try {
    const base64Url = usertoken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}

// Fetch user profile for autofill on feedback form
async function fetchFeedbackAutofill() {
  const token = localStorage.getItem('usertoken');
  if (!token) return null;

  try {
    const response = await fetch('http://localhost:8080/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch profile');

    const profile = await response.json();
    return {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || ''
    };
  } catch (error) {
    console.error('Error fetching profile for autofill:', error);
    return null;
  }
}

function createHeroSection() {
  const hero = document.createElement('section');
  hero.className = 'hero mb-5';

  const heroLogo = document.createElement('div');
  heroLogo.className = 'hero-logo';
  const h1 = document.createElement('h1');
  h1.textContent = 'About Us';
  h1.style.backgroundColor = 'transparent';
  heroLogo.appendChild(h1);

  const lead = document.createElement('p');
  lead.className = 'lead';
  lead.textContent = 'Freshly roasted in Singapore. Ethically sourced. Always intentional.';

  const p = document.createElement('p');
  p.textContent = `We’re a small-batch coffee roastery based in Singapore, focused on
    thoughtful sourcing and precise roasting. Each origin is selected for
    its unique character, then roasted in-house to bring out its best — nothing more, nothing less.
    No noise, no shortcuts. Just honest coffee, crafted for those who care about the details.`;

  const exploreBtn = document.createElement('a');
  exploreBtn.href = 'products.html';
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

  const teamMembers = [
    {
      name: 'Syahirah',
      role: 'Developer 1',
      img: 'images/Syahirah.jpeg',
      overlay: 'Created the administrative page and respective crud and tracking.'
    },
    {
      name: 'Keith',
      role: 'Developer 2',
      img: 'images/Keith.jpg',
      overlay: 'Created the landing, login and splash page'
    },
    {
      name: 'Chee Yong',
      role: 'Developer 3',
      img: 'images/CheeYong.jpg',
      overlay: 'created the Shop, Cart & Payment pages'
    },
    {
      name: 'Ke Wei',
      role: 'Developer 4',
      img: 'images/KeWei.jpg',
      overlay: 'created the about and user dashboard'
    },
  ];

  // Desktop grid
  const desktopGrid = document.createElement('div');
  desktopGrid.className = 'row g-4 justify-content-center d-none d-md-flex';

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

  // Mobile carousel
  const carousel = document.createElement('div');
  carousel.id = 'teamCarousel';
  carousel.className = 'carousel slide d-md-none mb-4';
  carousel.setAttribute('data-bs-ride', 'carousel');

  const carouselInner = document.createElement('div');
  carouselInner.className = 'carousel-inner';

  teamMembers.forEach((member, index) => {
    const item = document.createElement('div');
    item.className = 'carousel-item' + (index === 0 ? ' active' : '');

    const imgContainer = document.createElement('div');
    imgContainer.className = 'team-img-container mx-auto';

    const img = document.createElement('img');
    img.src = member.img;
    img.alt = member.name;
    img.className = 'd-block mx-auto rounded-circle team-img';

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.textContent = member.overlay;

    imgContainer.append(img, overlay);

    const name = document.createElement('h5');
    name.className = 'team-name mt-3';
    name.textContent = member.name;

    const role = document.createElement('p');
    role.className = 'team-role';
    role.textContent = member.role;

    item.append(imgContainer, name, role);
    carouselInner.appendChild(item);
  });

  carousel.appendChild(carouselInner);

  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-control-prev';
  prevBtn.type = 'button';
  prevBtn.setAttribute('data-bs-target', '#teamCarousel');
  prevBtn.setAttribute('data-bs-slide', 'prev');
  prevBtn.innerHTML = `<span class="carousel-control-prev-icon"></span>`;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-control-next';
  nextBtn.type = 'button';
  nextBtn.setAttribute('data-bs-target', '#teamCarousel');
  nextBtn.setAttribute('data-bs-slide', 'next');
  nextBtn.innerHTML = `<span class="carousel-control-next-icon"></span>`;

  carousel.append(prevBtn, nextBtn);

  teamSection.append(carousel, desktopGrid);
  return teamSection;
}

function createContactForm() {
  const section = document.getElementById('contact-section');
  section.innerHTML = ''; // clear existing content

  const h2 = document.createElement('h2');
  h2.textContent = 'Contact Us';

  const form = document.createElement('form');
  form.id = 'contactForm';
  form.action = 'https://getform.io/f/aqomopwa';
  form.method = 'POST';
  form.className = 'contact-form';
  form.noValidate = true;

  function createInput({ tag = 'input', type, id, name, placeholder, required = false, pattern, title, rows }) {
    const label = document.createElement('label');
    label.htmlFor = id;

    const labels = {
      name: 'Full Name',
      email: 'Email address',
      message: 'Your message'
    };

    label.textContent = labels[id] || '';

    let input = tag === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    if (tag === 'textarea' && rows) input.rows = rows;
    if (tag !== 'textarea') input.type = type;

    Object.assign(input, { id, name, placeholder, required, pattern, title });

    return [label, input];
  }

  const [labelName, inputName] = createInput({
    type: 'text',
    id: 'name',
    name: 'name',
    placeholder: 'Wan Zhen',
    required: true,
    pattern: '^[A-Za-z\\s]{2,}$',
    title: 'Full name should only contain letters and spaces, minimum 2 characters.'
  });

  const [labelEmail, inputEmail] = createInput({
    type: 'email',
    id: 'email',
    name: 'email',
    placeholder: 'wanzhen@gmail.com',
    required: true,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    title: 'Please enter a valid email address.'
  });

  const [labelMessage, textareaMessage] = createInput({
    tag: 'textarea',
    id: 'message',
    name: 'message',
    rows: 5,
    placeholder: 'Please give us your valuable feedback',
    required: true,
    pattern: "^(?!.*(--|/\\*|\\*/|['\";])).{10,}$",
    title: 'Message must be at least 10 characters and must not contain characters like quotes, semicolons, or comment symbols.'
  });

  const btnSubmit = document.createElement('button');
  btnSubmit.type = 'submit';
  btnSubmit.className = 'btn btn-dark';
  btnSubmit.textContent = 'Send Message';

  form.append(labelName, inputName, labelEmail, inputEmail, labelMessage, textareaMessage, btnSubmit);
  section.append(h2, form);

  // Autofill contact form email and name from user profile
  fetchFeedbackAutofill().then(profile => {
    if (profile) {
      if (inputName) inputName.value = `${profile.firstName} ${profile.lastName}`.trim();
      if (inputEmail) inputEmail.value = profile.email;
    }
  });
}

function loadMainContent() {
  const main = document.getElementById('mainAbout');
  main.innerHTML = '';

  const heroSection = createHeroSection();
  const teamSection = createTeamSection();

  main.append(heroSection, teamSection);

  createContactForm();
}

document.addEventListener('DOMContentLoaded', loadMainContent);
