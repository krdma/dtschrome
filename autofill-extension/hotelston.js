(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    getContactInfo,
    createButton
  } = window.autofillCommon;

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

  function fillHotelston(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const contactSection = findContactSection();

    const firstInputs = Array.from(
      document.querySelectorAll("input[name='firstname']")
    ).filter(el => !contactSection || !contactSection.contains(el));
    firstInputs.slice(0, pax.length).forEach((el, idx) => {
      const first = pax[idx]
        ? pax[idx].first_name || pax[idx].firstName
        : pax[0].first_name || pax[0].firstName;
      setValue(el, first);
    });

    const lastInputs = Array.from(
      document.querySelectorAll("input[name='lastname']")
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
