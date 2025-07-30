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

  function setValue(input, value) {
    if (!input) return;
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function setValueByName(fieldName, value) {
    const input = document.getElementsByName(fieldName)[0];
    if (!input) return;
    input.value = value;
    const event = new Event('change');
    input.dispatchEvent(event);
  }

  function setDropdown(dropdown, value) {
    if (!dropdown) return;
    let select = null;
    if (dropdown.tagName === 'SELECT') {
      select = dropdown;
    } else {
      select = dropdown.querySelector('select');
    }
    if (select) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      const toggle = dropdown.querySelector('.dropdown__toggle');
      if (!toggle) return;
      toggle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      toggle.click();

      setTimeout(() => {
        const candidates = dropdown.querySelectorAll(
          `[data-value='${value}'], [value='${value}'], button, li, ry-dropdown-item`
        );
        let option = null;
        for (const c of candidates) {
          const text = c.textContent ? c.textContent.trim().toUpperCase() : '';
          if (
            c.getAttribute('data-value') === value ||
            c.getAttribute('value') === value ||
            text.startsWith(value)
          ) {
            option = c;
            break;
          }
        }
        if (!option && candidates.length) option = candidates[0];
        if (option) {
          option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          option.click();
          option.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }
      }, 200);
    }
  }

  function getMaleValue(select) {
    const options = Array.from(select.querySelectorAll('option'));
    if (!options.length) return null;
    for (const opt of options) {
      const text = (opt.textContent || '').trim().toUpperCase();
      const val = (opt.value || '').toUpperCase();
      if (/^(MALE|M(?!S)|MR|MAN)/.test(text) || /^(MALE|M(?!S)|MR|MAN)/.test(val)) {
        return opt.value;
      }
    }
    return options[0].value;
  }

  function setGender(select) {
    const value = getMaleValue(select);
    if (value != null) setDropdown(select, value);
  }

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

  function fillGeneric() {
    passengers.forEach((p, idx) => {
      setValueByName(`form.passengers.ADT-${idx}.name`, p.firstName);
      setValueByName(`form.passengers.ADT-${idx}.surname`, p.lastName);
      if (idx === 0) {
        setValueByName(`form.passengers.ADT-${idx}.email`, p.email);
        setValueByName(`form.passengers.ADT-${idx}.phone`, p.phone);
      }
    });

    const firstInputs = document.querySelectorAll("input[name*='first']");
    firstInputs.forEach((el, idx) =>
      setValue(el, passengers[idx] ? passengers[idx].firstName : passengers[0].firstName)
    );
    const lastInputs = document.querySelectorAll("input[name*='last']");
    lastInputs.forEach((el, idx) =>
      setValue(el, passengers[idx] ? passengers[idx].lastName : passengers[0].lastName)
    );
    const emailInput = document.querySelector("input[type='email']");
    if (emailInput) setValue(emailInput, mainPassenger.email);
    const phoneInput = document.querySelector("input[type='tel']");
    if (phoneInput) setValue(phoneInput, mainPassenger.phone);


    const titleField = document.querySelector("select[name*='title']");
    if (titleField) setDropdown(titleField, 'MR');
    const genderField = document.querySelector("select[name*='gender']");
    if (genderField) setGender(genderField);
  }

  function fillFields() {
    if (location.hostname.includes('ryanair.com')) {
      fillRyanair();
    } else if (location.hostname.includes('wizzair.com')) {
      fillWizzAir();
    } else {
      fillGeneric();
    }
  }

  function createButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Fill Passenger Info';
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '10px 15px',
      background: '#00aaff',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    });
    btn.addEventListener('click', fillFields);
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();
