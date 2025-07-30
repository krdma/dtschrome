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

  const { setValue, createButton } = window.autofillCommon;

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
