(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    getContactInfo,
    createButton
  } = window.autofillCommon;

  function setBasicDropdown(dropdown, value) {
    if (!dropdown) return;
    const input = dropdown.querySelector("input[id^='dropdown_']") || dropdown.previousElementSibling;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    }
    const span = dropdown.querySelector('span');
    if (span) span.textContent = value;
  }

  function findContactSection() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const h of headings) {
      const txt = h.textContent || '';
      if (/контакт/i.test(txt) || /contact/i.test(txt)) {
        return h.closest('form') || h.parentElement;
      }
    }
    return null;
  }

  function fillContactSection(contact, section) {
    if (!section) return;
    setDropdown(section.querySelector('select'), contact.title || 'MR');
    setValue(
      section.querySelector("input[name='firstname'], input[name*='first']"),
      contact.firstName
    );
    setValue(
      section.querySelector("input[name='lastname'], input[name*='last']"),
      contact.lastName
    );
    setValue(section.querySelector("input[type='email']"), contact.email);
    setValue(section.querySelector("input[type='tel']"), contact.phone);
  }

  function fillBookingInfoForm(data) {
    const form = document.getElementById('booking-info-search-form');
    if (!form) return false;

    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});

    const contactHeader = Array.from(form.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .find(h => /контакт/i.test(h.textContent || ''));
    const contactSection = contactHeader ? contactHeader.parentElement : null;

    const firstInputs = Array.from(form.querySelectorAll("input[name='firstname']"));
    const lastInputs = Array.from(form.querySelectorAll("input[name='lastname']"));

    firstInputs.forEach((input, idx) => {
      if (contactSection && contactSection.contains(input)) return;
      const p = pax[idx] || pax[0];
      setValue(input, p.first_name || p.firstName);
      const block = input.closest('div');
      const dd = block ? block.querySelector("[data-testid='basicDropdown']") : null;
      setBasicDropdown(dd, p.gender === 'FEMALE' ? 'Г-жа' : 'Г-н');
    });

    lastInputs.forEach((input, idx) => {
      if (contactSection && contactSection.contains(input)) return;
      const p = pax[idx] || pax[0];
      setValue(input, p.last_name || p.lastName);
    });

    if (contactSection) {
      setBasicDropdown(
        contactSection.querySelector("[data-testid='basicDropdown']"),
        contact.title === 'MS' || contact.title === 'MRS' ? 'Г-жа' : 'Г-н'
      );
      setValue(contactSection.querySelector("input[name='firstname']"), contact.firstName);
      setValue(contactSection.querySelector("input[name='lastname']"), contact.lastName);
      setValue(contactSection.querySelector("input[type='email']"), contact.email);
      const phoneInput = contactSection.querySelector("input[type='tel']");
      if (phoneInput) setValue(phoneInput, contact.phone);
    }

    return true;
  }

  function fillHotelston(data) {
    if (fillBookingInfoForm(data)) return;

    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const contactSection = findContactSection();

    const firstInputs = Array.from(
      document.querySelectorAll(
        "input[name='firstname'], input[name*='first']"
      )
    ).filter(el => !contactSection || !contactSection.contains(el));
    firstInputs.slice(0, pax.length).forEach((el, idx) => {
      const first = pax[idx]
        ? pax[idx].first_name || pax[idx].firstName
        : pax[0].first_name || pax[0].firstName;
      setValue(el, first);
    });

    const lastInputs = Array.from(
      document.querySelectorAll(
        "input[name='lastname'], input[name*='last']"
      )
    ).filter(el => !contactSection || !contactSection.contains(el));
    lastInputs.slice(0, pax.length).forEach((el, idx) => {
      const last = pax[idx]
        ? pax[idx].last_name || pax[idx].lastName
        : pax[0].last_name || pax[0].lastName;
      setValue(el, last);
    });

    fillContactSection(contact, contactSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillHotelston));
  } else {
    createButton(fillHotelston);
  }
})();
