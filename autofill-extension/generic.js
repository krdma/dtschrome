(() => {
  // Domains that should display the autofill button. Update this list as needed.
  const allowedDomains = ['example.com'];
  if (!allowedDomains.some(domain => location.hostname.includes(domain))) {
    return;
  }

  const { passengers, mainPassenger, setValue, setValueByName, setDropdown, setGender, createButton } = window.autofillCommon;

  function fillGeneric(data) {
    passengers.forEach((p, idx) => {
      setValueByName(`form.passengers.ADT-${idx}.name`, p.firstName);
      setValueByName(`form.passengers.ADT-${idx}.surname`, p.lastName);
      if (idx === 0) {
        setValueByName(`form.passengers.ADT-${idx}.email`, p.email);
        setValueByName(`form.passengers.ADT-${idx}.phone`, p.phone);
      }
    });

    const firstInputs = document.querySelectorAll("input[name*='first']");
    firstInputs.forEach((el, idx) =>
      setValue(el, passengers[idx] ? passengers[idx].firstName : passengers[0].firstName)
    );
    const lastInputs = document.querySelectorAll("input[name*='last']");
    lastInputs.forEach((el, idx) =>
      setValue(el, passengers[idx] ? passengers[idx].lastName : passengers[0].lastName)
    );
    const emailInput = document.querySelector("input[type='email']");
    if (emailInput) setValue(emailInput, mainPassenger.email);
    const phoneInput = document.querySelector("input[type='tel']");
    if (phoneInput) setValue(phoneInput, mainPassenger.phone);

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
