(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    getContactInfo,
    createButton
  } = window.autofillCommon;

  function formatDate(value) {
    if (!value) return '';
    const datePart = value.split('T')[0].split(' ')[0];
    let m = datePart.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (m) return `${m[3]}.${m[2]}.${m[1]}`;
    m = datePart.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
    if (m) return `${m[1]}.${m[2]}.${m[3]}`;
    return datePart;
  }

  function fillJoyceTours(data) {
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
      setValue(block.querySelector('.samo-passport-serie'), p.ps_seria || p.passportSerie || '');
      setValue(block.querySelector('.samo-passport-number'), p.ps_number || p.passportNumber || '');
      setDropdown(block.querySelector('.samo-passport-state'), p.citizenship || p.nationality || '13');
      const genderInputs = block.querySelectorAll('.gender');
      const gender = (p.gender || p.sex || '').toUpperCase();
      if (genderInputs.length) {
        const maleInput = genderInputs[0];
        const femaleInput = genderInputs[1];
        const target = gender.startsWith('MR') ? maleInput : femaleInput;
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
    document.addEventListener('DOMContentLoaded', () => createButton(fillJoyceTours));
  } else {
    createButton(fillJoyceTours);
  }
})();
