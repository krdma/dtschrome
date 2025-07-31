(() => {
  const {
    passengers,
    getContactInfo,
    setValue,
    createButton
  } = window.autofillCommon;

  function fillItravex(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const orderId =
      data?.order_id || data?.orderId || data?.id || data?.booking_id || '';
    setValue(document.getElementById('reference'), orderId);

    pax.forEach((p, idx) => {
      const first = p.first_name || p.firstName;
      const last = p.last_name || p.lastName;
      const pass = p.passport_number || p.passportNumber || '';
      setValue(document.getElementById(`name-${idx + 1}`), first);
      setValue(document.getElementById(`surnames-${idx + 1}`), last);
      setValue(document.getElementById(`documentNumber-${idx + 1}`), pass);
    });

    // Try filling contact fields if they exist
    setValue(document.querySelector("input[type='email']"), contact.email);
    setValue(document.querySelector("input[type='tel']"), contact.phone);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillItravex));
  } else {
    createButton(fillItravex);
  }
})();
