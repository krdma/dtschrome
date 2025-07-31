(() => {
  const {
    passengers,
    mainPassenger,
    setValue,
    setDropdown,
    setGender,
    getContactInfo,
    createButton
  } = window.autofillCommon;

  function fillWizzAir(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    setDropdown(
      document.querySelector("select[name*='title'], select[id*='title']"),
      pax[0]?.sex || 'MR'
    );
    setGender(
      document.querySelector("select[name*='gender'], select[id*='gender']")
    );
    const firstInput = document.querySelector("input[name*='firstName']");
    if (firstInput)
      setValue(firstInput, pax[0] ? (pax[0].first_name || pax[0].firstName) : passengers[0].firstName);
    const lastInput = document.querySelector("input[name*='lastName']");
    if (lastInput)
      setValue(lastInput, pax[0] ? (pax[0].last_name || pax[0].lastName) : passengers[0].lastName);
    setValue(
      document.querySelector("input[type='email']"),
      contact.email || mainPassenger.email
    );
    setValue(
      document.querySelector("input[type='tel']"),
      contact.phone || mainPassenger.phone
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillWizzAir));
  } else {
    createButton(fillWizzAir);
  }
})();
