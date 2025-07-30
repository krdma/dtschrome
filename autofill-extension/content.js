(() => {
  const passenger = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    dob: '1990-01-01',
    gender: 'MALE'
  };

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
    document
      .querySelectorAll("ry-input-d[data-ref='pax-details__name'] input")
      .forEach(i => setValue(i, passenger.firstName));
    document
      .querySelectorAll("ry-input-d[data-ref='pax-details__surname'] input")
      .forEach(i => setValue(i, passenger.lastName));
    document
      .querySelectorAll("ry-input-d[data-ref='pax-details__dob'] input")
      .forEach(i => setValue(i, passenger.dob));

    setValue(
      document.querySelector(
        "ry-input-d[data-ref='contact-details__email'] input, input[type='email']"
      ),
      passenger.email
    );
    setValue(
      document.querySelector(
        "ry-input-d[data-ref='contact-details__phone'] input, input[type='tel']"
      ),
      passenger.phone
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
    setValue(document.querySelector("input[name*='firstName']"), passenger.firstName);
    setValue(document.querySelector("input[name*='lastName']"), passenger.lastName);
    setValue(document.querySelector("input[type='email']"), passenger.email);
    setValue(document.querySelector("input[type='tel']"), passenger.phone);
  }

  function fillGeneric() {
    const namedFields = {
      'form.passengers.ADT-0.name': passenger.firstName,
      'form.passengers.ADT-0.surname': passenger.lastName,
      'form.passengers.ADT-0.email': passenger.email,
      'form.passengers.ADT-0.phone': passenger.phone
    };
    Object.entries(namedFields).forEach(([n, v]) => setValueByName(n, v));

    const selectors = [
      ["input[name*='first']", "input[placeholder*='First']"],
      ["input[name*='last']", "input[placeholder*='Last']"],
      ["input[type='email']", "input[name*='mail']"],
      ["input[type='tel']", "input[name*='phone']"]
    ];
    const values = [passenger.firstName, passenger.lastName, passenger.email, passenger.phone];
    selectors.forEach((sels, idx) => {
      for (const sel of sels) {
        const el = document.querySelector(sel);
        if (el) {
          setValue(el, values[idx]);
          break;
        }
      }
    });

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
