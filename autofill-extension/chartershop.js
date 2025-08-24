(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    createButton
  } = window.autofillCommon;

  function formatDate(value) {
    if (!value) return '';
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}.${m[2]}.${m[1]}`;
    const m2 = value.match(/^(\d{2})[./-](\d{2})[./-](\d{4})/);
    if (m2) return `${m2[1]}.${m2[2]}.${m2[3]}`;
    return value;
  }

  function fillChartershop(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const forms = document.querySelectorAll('.booking-passenger');
    pax.forEach((p, idx) => {
      const form = forms[idx];
      if (!form) return;
      const gender = (p.gender || p.sex || '').toUpperCase();
      const genderVal = /FEMALE|F/.test(gender) ? '1' : '0';
      setDropdown(form.querySelector('.passenger-sex'), genderVal);
      setValue(form.querySelector('.passenger-lname'), p.last_name || p.lastName || '');
      setValue(form.querySelector('.passenger-fname'), p.first_name || p.firstName || '');
      const dob = p.birthday || p.dob;
      setValue(form.querySelector('.passenger-birth'), formatDate(dob));
      const nationality = (p.nationality || p.citizenship || 'UA').toUpperCase();
      setDropdown(form.querySelector('.passenger-citizenship'), nationality);
      const seria = p.passport_seria || p.passportSeries || p.series || p.passport_series || p.seria || '';
      setValue(form.querySelector('.passport-seria'), seria);
      const number = p.passport_number || p.passportNumber || p.number || '';
      setValue(form.querySelector('.passport-number'), number);
      const issue = p.passport_issue || p.passportIssue || p.issue_date || p.issueDate || '';
      setValue(form.querySelector('.passport-from'), formatDate(issue));
      const expiry = p.passport_expiry || p.passportExpiry || p.expiry_date || p.expiry || '';
      setValue(form.querySelector('.passport-to'), formatDate(expiry));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillChartershop));
  } else {
    createButton(fillChartershop);
  }
})();
