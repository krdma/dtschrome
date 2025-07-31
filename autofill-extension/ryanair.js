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

  function setRyanairTitles(value) {
    document
      .querySelectorAll("ry-dropdown[data-ref='pax-details__title']")
      .forEach(dd => setDropdown(dd, value));
  }

  function setRyanairGender() {
    document
      .querySelectorAll("select[data-ref*='gender'], select[name*='gender']")
      .forEach(sel => setGender(sel));
  }

  function fillRyanair(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    setRyanairTitles(pax[0]?.sex || 'MR');
    setRyanairGender();
    const firstInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__name'] input"
    );
    firstInputs.forEach((i, idx) => {
      const first = pax[idx] ? (pax[idx].first_name || pax[idx].firstName) : (pax[0].first_name || pax[0].firstName);
      setValue(i, first);
    });
    const lastInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__surname'] input"
    );
    lastInputs.forEach((i, idx) => {
      const last = pax[idx] ? (pax[idx].last_name || pax[idx].lastName) : (pax[0].last_name || pax[0].lastName);
      setValue(i, last);
    });
    const dobInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__dob'] input"
    );
    dobInputs.forEach((i, idx) => {
      const dob = pax[idx] ? (pax[idx].birthday ? pax[idx].birthday.split(' ')[0] : pax[idx].dob) : (pax[0].birthday ? pax[0].birthday.split(' ')[0] : pax[0].dob);
      setValue(i, dob);
    });

    setValue(
      document.querySelector(
        "ry-input-d[data-ref='contact-details__email'] input, input[type='email']"
      ),
      contact.email
    );
    setValue(
      document.querySelector(
        "ry-input-d[data-ref='contact-details__phone'] input, input[type='tel']"
      ),
      contact.phone
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillRyanair));
  } else {
    createButton(fillRyanair);
  }
})();
