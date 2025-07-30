(() => {
  const { passengers, setValue, createButton } = window.autofillCommon;

  function fillHotelston(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const firstInputs = document.querySelectorAll("input[name='firstname']");
    firstInputs.forEach((el, idx) => {
      const first = pax[idx] ? (pax[idx].first_name || pax[idx].firstName) : (pax[0].first_name || pax[0].firstName);
      setValue(el, first);
    });
    const lastInputs = document.querySelectorAll("input[name='lastname']");
    lastInputs.forEach((el, idx) => {
      const last = pax[idx] ? (pax[idx].last_name || pax[idx].lastName) : (pax[0].last_name || pax[0].lastName);
      setValue(el, last);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillHotelston));
  } else {
    createButton(fillHotelston);
  }
})();
