(() => {
  const {
    passengers,
    getContactInfo,
    setValue,
    createButton
  } = window.autofillCommon;

  function fillViajesOlympia(data) {
    const pax = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const first = pax[0] || passengers[0];
    const orderId =
      data?.order_id || data?.orderId || data?.id || data?.booking_id || '';

    setValue(
      document.querySelector("input[placeholder='Introduce locator']"),
      orderId
    );
    setValue(
      document.querySelector("input[placeholder='Client name']"),
      first.first_name || first.firstName || contact.firstName
    );
    setValue(
      document.querySelector("input[placeholder='Introduce first and last name']"),
      first.last_name || first.lastName || contact.lastName
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillViajesOlympia));
  } else {
    createButton(fillViajesOlympia);
  }
})();
