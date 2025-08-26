(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    getContactInfo,
    createButton
  } = window.autofillCommon;

  function destroySelectBoxes() {
    document.querySelectorAll('select.selectBox').forEach(select => {
      const prev = select.previousElementSibling;
      if (prev && prev.classList && prev.classList.contains('selectBox')) {
        prev.remove();
      }
      select.style.display = '';
    });
  }

  function fillLuxuryTravel(data) {
    destroySelectBoxes();
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});

    const rows = document.querySelectorAll("table.passengers tr[name^='room_row']");
    rows.forEach((row, idx) => {
      const p = pax[idx] || pax[0];
      const first = p.first_name || p.firstName || '';
      const last = p.last_name || p.lastName || '';
      const gender = (p.gender || p.sex || '').toUpperCase();
      const titleVal = /FEMALE|MS|MISS|MRS|F/.test(gender) ? '1' : '0';
     
      setDropdown(row.querySelector("select[name='salutation']"), titleVal);
      setValue(row.querySelector("input[name='first']"), first);
      setValue(row.querySelector("input[name='last']"), last);
      const passport = p.passport_number || p.passport || p.document_number || p.docNumber || '';
      setValue(row.querySelector("input[name='passport']"), passport);

      const dob = p.birthday || p.dob;
      if (dob) {
        const [y, m, d] = dob.split('T')[0].split('-');
        setDropdown(row.querySelector("select[name='child_day']"), d);
        setDropdown(row.querySelector("select[name='child_month']"), m);
        setDropdown(row.querySelector("select[name='child_year']"), y);
      }
    });

    setValue(document.querySelector("input[type='email']"), contact.email);
    setValue(document.querySelector("input[type='tel']"), contact.phone);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillLuxuryTravel));
  } else {
    createButton(fillLuxuryTravel);
  }
})();
