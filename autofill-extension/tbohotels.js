(() => {
  const {
    passengers,
    setValue,
    setDropdown,
    getContactInfo,
    createButton
  } = window.autofillCommon;

  function fillTboHotels(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});

    pax.forEach((p, idx) => {
      const first = document.getElementById(`fName_${idx}`);
      const last = document.getElementById(`lName_${idx}`);
      const title = document.querySelector(`select[name='title_${idx}']`);
      setValue(first, p.first_name || p.firstName);
      setValue(last, p.last_name || p.lastName);
      if (title) {
        const t = p.gender === 'MS' ? 'Ms' : 'Mr';
        setDropdown(title, t);
      }
    });

    setValue(document.getElementById('guestEmail'), contact.email);
    setValue(document.getElementById('guestPhoneNo'), contact.phone);
    const cc = document.getElementById('guestcountrycode');
    if (cc && contact.phone) {
      const m = ('' + contact.phone).match(/^\+\d{1,3}/);
      if (m) setValue(cc, m[0]);
    }

    // setDropdown(document.getElementById('chkInHrs'), '14');
    // setDropdown(document.getElementById('chkInMin'), '00');
    // setDropdown(document.getElementById('chkOutHrs'), '11');
    // setDropdown(document.getElementById('chkOutMin'), '00');

    const save = document.getElementById('saveCustomerName');
    if (save) {
      save.checked = true;
      save.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillTboHotels));
  } else {
    createButton(fillTboHotels);
  }
})();
