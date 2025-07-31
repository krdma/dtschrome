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

  function fillContactSection(contact, section, after) {
    if (!section) return;

    const isAfter = el =>
      !after || (after.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);

    const dropdown = Array.from(section.querySelectorAll('select')).find(isAfter);
    setDropdown(dropdown, contact.title || 'MR');

    const firstInput = Array.from(
      section.querySelectorAll("input[name='firstname'], input[name*='first']")
    ).find(isAfter);
    setValue(firstInput, contact.firstName);

    const lastInput = Array.from(
      section.querySelectorAll("input[name='lastname'], input[name*='last']")
    ).find(isAfter);
    setValue(lastInput, contact.lastName);

    const emailInput = Array.from(section.querySelectorAll("input[type='email']")).find(
      isAfter
    );
    setValue(emailInput, contact.email);

    const phoneInput = Array.from(section.querySelectorAll("input[type='tel']")).find(
      isAfter
    );
    setValue(phoneInput, contact.phone);
  }

  function fillBookingInfoForm(data) {
    const form = document.getElementById('booking-info-search-form');
    if (!form) return false;

    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});

    const contactHeader = Array.from(form.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .find(h => /контакт/i.test(h.textContent || ''));
    const contactSection = contactHeader ? contactHeader.parentElement : null;

    const isBefore = el =>
      contactHeader && (el.compareDocumentPosition(contactHeader) & Node.DOCUMENT_POSITION_FOLLOWING);

    const firstInputs = Array.from(form.querySelectorAll("input[name='firstname']"));
    const lastInputs = Array.from(form.querySelectorAll("input[name='lastname']"));

    firstInputs.forEach((input, idx) => {
      if (contactSection && !isBefore(input)) return;
      const p = pax[idx] || pax[0];
      setValue(input, p.first_name || p.firstName);
      const block = input.closest('div');
      const dd = block ? block.querySelector("[data-testid='basicDropdown']") : null;
      setBasicDropdown(dd, p.gender === 'FEMALE' ? 'Г-жа' : 'Г-н');
    });

    lastInputs.forEach((input, idx) => {
      if (contactSection && !isBefore(input)) return;
      const p = pax[idx] || pax[0];
      setValue(input, p.last_name || p.lastName);
    });

    if (contactSection) {
      fillContactSection(contact, contactSection, contactHeader);
    }

    return true;
  }

  function fillHotelston(data) {
    if (fillBookingInfoForm(data)) return;

    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});

    const contactHeader =
      document.querySelector('h4.app48d785bd6b5800a2_SNeFvWtYAKI-') ||
      Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).find(h =>
        /контакт/i.test(h.textContent || '')
      );
    const contactSection = contactHeader ? contactHeader.parentElement : findContactSection();

    const isBefore = el =>
      contactHeader && (el.compareDocumentPosition(contactHeader) & Node.DOCUMENT_POSITION_FOLLOWING);

    const firstInputs = Array.from(
      document.querySelectorAll(
        "input[name='firstname'], input[name*='first']"
      )
    ).filter(el => (!contactSection || !contactSection.contains(el)) && (!contactHeader || isBefore(el)));
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
    ).filter(el => (!contactSection || !contactSection.contains(el)) && (!contactHeader || isBefore(el)));
    lastInputs.slice(0, pax.length).forEach((el, idx) => {
      const last = pax[idx]
        ? pax[idx].last_name || pax[idx].lastName
        : pax[0].last_name || pax[0].lastName;
      setValue(el, last);
    });

    fillContactSection(contact, contactSection, contactHeader);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillHotelston));
  } else {
    createButton(fillHotelston);
  }
})();
