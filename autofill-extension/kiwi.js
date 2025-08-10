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
      setDropdown(document.querySelector(`[name='passengers.${idx}.nationality']`), (p.nationality || 'ua').toLowerCase());
      setDropdown(document.querySelector(`[name='passengers.${idx}.title']`), p.sex === 'MS' ? 'ms' : 'mr');
      const dob = p.birthday ? p.birthday.split(' ')[0] : p.dob;
      if (dob) {
        const [y, m, d] = dob.split('-');
        setValue(document.querySelector(`[name='passengers.${idx}.birthDay']`), d);
        setDropdown(document.querySelector(`[name='passengers.${idx}.birthMonth']`), m);
        setValue(document.querySelector(`[name='passengers.${idx}.birthYear']`), y);
      }
      setValue(document.querySelector(`[name='passengers.${idx}.idNumber']`), p.passport_number);

      if(p.expiry){
        let [yp, mp, dp] = p.expiry.split('-');
        setValue(document.querySelector(`[name='passengers.${idx}.idExpirationDay']`), dp);
        setDropdown(document.querySelector(`[name='passengers.${idx}.idExpirationMonth']`), mp);
        setValue(document.querySelector(`[name='passengers.${idx}.idExpirationYear']`), yp);
      }
    });

    setValue(document.querySelector("input[type='email']"), contact.email);
    setValue(document.querySelector("input[type='tel']"), contact.phone);
  }

  const init = () => setTimeout(() => createButton(fillKiwi), 5000);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
