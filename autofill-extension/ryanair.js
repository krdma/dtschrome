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

  function setRyanairTitles(value) {
    document
      .querySelectorAll("ry-dropdown[data-ref='pax-details__title']")
      .forEach(dd => setDropdown(dd, value));
  }

  function setRyanairGender() {
    document
      .querySelectorAll("select[data-ref*='gender'], select[name*='gender']")
      .forEach(sel => setGender(sel));
  }

  function fillRyanair() {
    setRyanairTitles('MR');
    setRyanairGender();
    const firstInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__name'] input"
    );
    firstInputs.forEach((i, idx) =>
      setValue(i, passengers[idx] ? passengers[idx].firstName : passengers[0].firstName)
    );
    const lastInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__surname'] input"
    );
    lastInputs.forEach((i, idx) =>
      setValue(i, passengers[idx] ? passengers[idx].lastName : passengers[0].lastName)
    );
    const dobInputs = document.querySelectorAll(
      "ry-input-d[data-ref='pax-details__dob'] input"
    );
    dobInputs.forEach((i, idx) =>
      setValue(i, passengers[idx] ? passengers[idx].dob : passengers[0].dob)
    );

    setValue(
      document.querySelector(
        "ry-input-d[data-ref='contact-details__email'] input, input[type='email']"
      ),
      mainPassenger.email
    );
    setValue(
      document.querySelector(
        "ry-input-d[data-ref='contact-details__phone'] input, input[type='tel']"
      ),
      mainPassenger.phone
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillRyanair));
  } else {
    createButton(fillRyanair);
  }
})();
