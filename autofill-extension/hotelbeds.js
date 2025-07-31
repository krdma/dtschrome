(() => {
  const {
    passengers,
    getContactInfo,
    setValue,
    setDropdown,
    createButton
  } = window.autofillCommon;

  function splitPhone(phone) {
    const digits = String(phone || '').replace(/\D+/g, '');
    const code = digits.slice(0, 3);
    const number = digits.slice(3);
    return { code, number };
  }

  function fillHotelbeds(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const first = pax[0] || passengers[0];

    setValue(
      document.querySelector("input[formcontrolname='name']"),
      first.first_name || first.firstName
    );
    setValue(
      document.querySelector("input[formcontrolname='surname']"),
      first.last_name || first.lastName
    );

    const { code, number } = splitPhone(contact.phone);
    setDropdown(
      document.querySelector("[formcontrolname='countryCode']"),
      code
    );
    setValue(
      document.querySelector("input[formcontrolname='phoneNumber']"),
      number
    );
    const phoneInput = document.querySelector("input[formcontrolname='phone']");
    if (phoneInput) setValue(phoneInput, code + number);

    setValue(
      document.querySelector("input[formcontrolname='email']"),
      contact.email
    );

    const orderId =
      data?.order_id || data?.orderId || data?.id || data?.booking_id || '';
    setValue(
      document.querySelector("input[formcontrolname='clientReference']"),
      orderId
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillHotelbeds));
  } else {
    createButton(fillHotelbeds);
  }
})();
