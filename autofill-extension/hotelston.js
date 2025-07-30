(() => {
  const { passengers, setValue, createButton } = window.autofillCommon;

  function fillHotelston() {
    const firstInputs = document.querySelectorAll("input[name='firstname']");
    firstInputs.forEach((el, idx) =>
      setValue(el, passengers[idx] ? passengers[idx].firstName : passengers[0].firstName)
    );
    const lastInputs = document.querySelectorAll("input[name='lastname']");
    lastInputs.forEach((el, idx) =>
      setValue(el, passengers[idx] ? passengers[idx].lastName : passengers[0].lastName)
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillHotelston));
  } else {
    createButton(fillHotelston);
  }
})();
