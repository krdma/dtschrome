(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    getContactInfo,
    createButton
  } = window.autofillCommon;

  function formatDate(d) {
    if (!d) return '';
    if (d.includes('.')) return d;
    const [year, month, day] = d.split('-');
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
  }

  function fillSmartSys(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const blocks = document.querySelectorAll('.tourist-data');
    blocks.forEach((block, idx) => {
      const p = pax[idx] || pax[0];
      setValue(block.querySelector('.samo-tourist-name'), p.first_name || p.firstName);
      setValue(block.querySelector('.samo-tourist-surname'), p.last_name || p.lastName);
      const dob = p.birthday || p.dob;
      setValue(block.querySelector('.samo-born-date'), formatDate(dob));
      setValue(block.querySelector('.samo-tourist-phone'), p.phone || contact.phone);
      setValue(block.querySelector('.samo-passport-serie'), p.passport_series || p.passportSerie || '');
      setValue(block.querySelector('.samo-passport-number'), p.passport_number || p.passportNumber || '');
      setDropdown(block.querySelector('.samo-passport-state'), p.citizenship || p.nationality || '');
      const genderInputs = block.querySelectorAll('.gender');
      const gender = (p.gender || p.sex || '').toUpperCase();
      if (genderInputs.length) {
        const maleInput = genderInputs[0];
        const femaleInput = genderInputs[1];
        const target = gender.startsWith('M') ? maleInput : femaleInput;
        if (target) {
          target.checked = true;
          target.dispatchEvent(new Event('change', { bubbles: true }));
          target.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    setValue(document.querySelector("input[name='payer[phone]'], input#samo-pay-phone"), contact.phone);
    setValue(document.querySelector("input[name='payer[email]']"), contact.email);
    setValue(document.querySelector("input[name='payer[name]']"), `${contact.firstName} ${contact.lastName}`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillSmartSys));
  } else {
    createButton(fillSmartSys);
  }
})();
