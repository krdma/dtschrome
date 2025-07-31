(() => {
  // Domains that should display the autofill button. Update this list as needed.
  const allowedDomains = ['example.com'];
  if (!allowedDomains.some(domain => location.hostname.includes(domain))) {
    return;
  }

  const {
    passengers,
    mainPassenger,
    setValue,
    setValueByName,
    setDropdown,
    setGender,
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

  function fillGeneric(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const contactSection = findContactSection();

    pax.forEach((p, idx) => {
      const first = p.first_name || p.firstName;
      const last = p.last_name || p.lastName;
      setValueByName(`form.passengers.ADT-${idx}.name`, first);
      setValueByName(`form.passengers.ADT-${idx}.surname`, last);
      if (idx === 0) {
        setValueByName(`form.passengers.ADT-${idx}.email`, contact.email);
        setValueByName(`form.passengers.ADT-${idx}.phone`, contact.phone);
      }
    });

    const firstInputs = document.querySelectorAll("input[name*='first']");
    firstInputs.forEach((el, idx) => {
      if (contactSection && contactSection.contains(el)) return;
      const first = pax[idx] ? (pax[idx].first_name || pax[idx].firstName) : (pax[0].first_name || pax[0].firstName);
      setValue(el, first);
    });
    const lastInputs = document.querySelectorAll("input[name*='last']");
    lastInputs.forEach((el, idx) => {
      if (contactSection && contactSection.contains(el)) return;
      const last = pax[idx] ? (pax[idx].last_name || pax[idx].lastName) : (pax[0].last_name || pax[0].lastName);
      setValue(el, last);
    });
    const emailInput = document.querySelector("input[type='email']");
    if (emailInput && (!contactSection || !contactSection.contains(emailInput))) {
      setValue(emailInput, contact.email);
    }
    const phoneInput = document.querySelector("input[type='tel']");
    if (phoneInput && (!contactSection || !contactSection.contains(phoneInput))) {
      setValue(phoneInput, contact.phone);
    }

    fillContactSection(contact, contactSection);

    const titleField = document.querySelector("select[name*='title']");
    if (titleField) setDropdown(titleField, 'MR');
    const genderField = document.querySelector("select[name*='gender']");
    if (genderField) setGender(genderField);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillGeneric));
  } else {
    createButton(fillGeneric);
  }
})();
