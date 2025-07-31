(() => {
  const {
    passengers,
    getContactInfo,
    setValue,
    setDropdown,
    createButton
  } = window.autofillCommon;

  const skipContainers = [
    '.hotel__body__customers__items',
    '.hotel__body__customers__item'
  ];

  function selectOutside(selector) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      let insideSkip = false;
      for (const container of skipContainers) {
        if (el.closest(container)) {
          insideSkip = true;
          break;
        }
      }
      if (!insideSkip) {
        return el;
      }
    }
    return null;
  }

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
      selectOutside("input[formcontrolname='name']"),
      first.first_name || first.firstName
    );
    setValue(
      selectOutside("input[formcontrolname='surname']"),
      first.last_name || first.lastName
    );

    const { code, number } = splitPhone(contact.phone);
    setDropdown(
      selectOutside("[formcontrolname='countryCode']"),
      code
    );
    setValue(
      selectOutside("input[formcontrolname='phoneNumber']"),
      number
    );
    const phoneInput = selectOutside("input[formcontrolname='phone']");
    if (phoneInput) setValue(phoneInput, code + number);

    setValue(
      selectOutside("input[formcontrolname='email']"),
      contact.email
    );

    const orderId =
      data?.order_id || data?.orderId || data?.id || data?.booking_id || '';
    setValue(
      selectOutside("input[formcontrolname='clientReference']"),
      orderId
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillHotelbeds));
  } else {
    createButton(fillHotelbeds);
  }
})();
