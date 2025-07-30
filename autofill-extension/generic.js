(() => {
  // Domains that should display the autofill button. Update this list as needed.
  const allowedDomains = ['example.com'];
  if (!allowedDomains.some(domain => location.hostname.includes(domain))) {
    return;
  }

  const { passengers, mainPassenger, setValue, setValueByName, setDropdown, setGender, createButton } = window.autofillCommon;

  function fillGeneric(data) {
    const pax = data && data.passports ? data.passports : passengers;

    pax.forEach((p, idx) => {
      const first = p.first_name || p.firstName;
      const last = p.last_name || p.lastName;
      setValueByName(`form.passengers.ADT-${idx}.name`, first);
      setValueByName(`form.passengers.ADT-${idx}.surname`, last);
      if (idx === 0) {
        const email = data?.email || p.email || mainPassenger.email;
        const phone = data?.phone || p.phone || mainPassenger.phone;
        setValueByName(`form.passengers.ADT-${idx}.email`, email);
        setValueByName(`form.passengers.ADT-${idx}.phone`, phone);
      }
    });

    const firstInputs = document.querySelectorAll("input[name*='first']");
    firstInputs.forEach((el, idx) => {
      const first = pax[idx] ? (pax[idx].first_name || pax[idx].firstName) : (pax[0].first_name || pax[0].firstName);
      setValue(el, first);
    });
    const lastInputs = document.querySelectorAll("input[name*='last']");
    lastInputs.forEach((el, idx) => {
      const last = pax[idx] ? (pax[idx].last_name || pax[idx].lastName) : (pax[0].last_name || pax[0].lastName);
      setValue(el, last);
    });
    const emailInput = document.querySelector("input[type='email']");
    if (emailInput) setValue(emailInput, data?.email || mainPassenger.email);
    const phoneInput = document.querySelector("input[type='tel']");
    if (phoneInput) setValue(phoneInput, data?.phone || mainPassenger.phone);

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
