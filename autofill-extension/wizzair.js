(() => {
  const { passengers, mainPassenger, setValue, setDropdown, setGender, createButton } = window.autofillCommon;

  function fillWizzAir(data) {
    setDropdown(
      document.querySelector("select[name*='title'], select[id*='title']"),
      'MR'
    );
    setGender(
      document.querySelector("select[name*='gender'], select[id*='gender']")
    );
    const firstInput = document.querySelector("input[name*='firstName']");
    if (firstInput) setValue(firstInput, passengers[0].firstName);
    const lastInput = document.querySelector("input[name*='lastName']");
    if (lastInput) setValue(lastInput, passengers[0].lastName);
    setValue(document.querySelector("input[type='email']"), mainPassenger.email);
    setValue(document.querySelector("input[type='tel']"), mainPassenger.phone);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillWizzAir));
  } else {
    createButton(fillWizzAir);
  }
})();
