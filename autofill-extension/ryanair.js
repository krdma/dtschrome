(() => {
  const {
    passengers,
    mainPassenger,
    setValue,
    setDropdown,
    setGender,
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

  function fillRyanair() {
    setRyanairTitles('MR');
    setRyanairGender();
    const firstInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__name'] input"
    );
    firstInputs.forEach((i, idx) =>
      setValue(i, passengers[idx] ? passengers[idx].firstName : passengers[0].firstName)
    );
    const lastInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__surname'] input"
    );
    lastInputs.forEach((i, idx) =>
      setValue(i, passengers[idx] ? passengers[idx].lastName : passengers[0].lastName)
    );
    const dobInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__dob'] input"
    );
    dobInputs.forEach((i, idx) =>
      setValue(i, passengers[idx] ? passengers[idx].dob : passengers[0].dob)
    );

    setValue(
      document.querySelector(
        "ry-input-d[data-ref='contact-details__email'] input, input[type='email']"
      ),
      mainPassenger.email
    );
    setValue(
      document.querySelector(
        "ry-input-d[data-ref='contact-details__phone'] input, input[type='tel']"
      ),
      mainPassenger.phone
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillRyanair));
  } else {
    createButton(fillRyanair);
  }
})();
