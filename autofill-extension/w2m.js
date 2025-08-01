(() => {
  const {
    passengers,
    mainPassenger,
    setValue,
    createButton
  } = window.autofillCommon;

  function fillW2M(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const first = pax[0] || mainPassenger;
    const orderId =
      data?.order_id || data?.orderId || data?.id || data?.booking_id || '';

    const row = document.querySelector('.js-pax-row:not(.hidden)');
    const nameInput =
      row?.querySelector("input[name='pax-name']") ||
      document.querySelector("input[name='pax-name']");
    const surnameInput =
      row?.querySelector("input[name='pax-surname']") ||
      document.querySelector("input[name='pax-surname']");

    setValue(nameInput, first.first_name || first.firstName);
    setValue(surnameInput, first.last_name || first.lastName);

    setValue(document.getElementById('booking_reference'), orderId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillW2M));
  } else {
    createButton(fillW2M);
  }
})();
