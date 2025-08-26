(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    createButton
  } = window.autofillCommon;

  function fillGoGlobal(data) {
    const pax = data && data.passports ? data.passports : passengers;

    const firstInputs = document.querySelectorAll("input[id^='ctl00_BodyContent_TBFname']");
    const lastInputs = document.querySelectorAll("input[id^='ctl00_BodyContent_TBLname']");
    const titleSelects = document.querySelectorAll("select[id^='ctl00_BodyContent_DDLGender']");

    firstInputs.forEach((input, idx) => {
      const p = pax[idx] || pax[0];
      setValue(input, p.first_name || p.firstName);
    });

    lastInputs.forEach((input, idx) => {
      const p = pax[idx] || pax[0];
      setValue(input, p.last_name || p.lastName);
    });

    titleSelects.forEach((sel, idx) => {
      const p = pax[idx] || pax[0];
      let title = 'MR.';
      if ((p.type || '').toUpperCase().startsWith('CH')) {
        title = 'CHD';
      } else {
        title = p.gender === 'FEMALE' ? 'MS.' : 'MR.';
      }
      setDropdown(sel, title);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillGoGlobal));
  } else {
    createButton(fillGoGlobal);
  }
})();
