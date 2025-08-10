(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    getContactInfo,
    createButton
  } = window.autofillCommon;

  function fillKiwi(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});

    pax.forEach((p, idx) => {
      const first = p.first_name || p.firstName;
      const last = p.last_name || p.lastName;
      setValue(document.querySelector(`[name='passengers.${idx}.firstname']`), first);
      setValue(document.querySelector(`[name='passengers.${idx}.lastname']`), last);
      setDropdown(document.querySelector(`[name='passengers.${idx}.nationality']`), (p.nationality || 'gb').toLowerCase());
      setDropdown(document.querySelector(`[name='passengers.${idx}.title']`), p.gender === 'FEMALE' ? 'ms' : 'mr');
      const dob = p.birthday ? p.birthday.split(' ')[0] : p.dob;
      if (dob) {
        const [y, m, d] = dob.split('-');
        setValue(document.querySelector(`[name='passengers.${idx}.birthDay']`), d);
        setDropdown(document.querySelector(`[name='passengers.${idx}.birthMonth']`), m);
        setValue(document.querySelector(`[name='passengers.${idx}.birthYear']`), y);
      }
      setValue(document.querySelector(`[name='passengers.${idx}.idNumber']`), 'AA123456');
      setValue(document.querySelector(`[name='passengers.${idx}.idExpirationDay']`), '01');
      setDropdown(document.querySelector(`[name='passengers.${idx}.idExpirationMonth']`), '01');
      setValue(document.querySelector(`[name='passengers.${idx}.idExpirationYear']`), '2030');
    });

    setValue(document.querySelector("input[type='email']"), contact.email);
    setValue(document.querySelector("input[type='tel']"), contact.phone);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillKiwi));
  } else {
    createButton(fillKiwi);
  }
})();
