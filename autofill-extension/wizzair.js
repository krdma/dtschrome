(() => {
  const passengers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      dob: '1985-05-10',
      gender: 'MALE',
      type: 'ADULT'
    },
    {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '1234567891',
      dob: '1987-08-15',
      gender: 'FEMALE',
      type: 'ADULT'
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      phone: '1234567892',
      dob: '1990-02-28',
      gender: 'MALE',
      type: 'ADULT'
    },
    {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      phone: '1234567893',
      dob: '2015-04-20',
      gender: 'FEMALE',
      type: 'CHILD'
    },
    {
      firstName: 'Tom',
      lastName: 'Smith',
      email: 'tom.smith@example.com',
      phone: '1234567894',
      dob: '2018-09-05',
      gender: 'MALE',
      type: 'CHILD'
    }
  ];
  const mainPassenger = passengers[0];

  const { setValue, setDropdown, setGender, createButton } = window.autofillCommon;

  function fillWizzAir() {
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
