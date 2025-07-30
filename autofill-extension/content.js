(() => {
  const passenger = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    dob: '1990-01-01'
  };

  function setValue(input, value) {
    if (!input) return;
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
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
      if (toggle) {
        toggle.click();
        setTimeout(() => {
          const option = dropdown.querySelector(
            `[value='${value}'], [data-value='${value}']`
          );
          if (option) option.click();
        }, 100);
      }
    }
  }

  function fillRyanair() {
    setDropdown(
      document.querySelector("ry-dropdown[data-ref='pax-details__title']"),
      'MR'
    );
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
    setValue(document.querySelector("input[name*='firstName']"), passenger.firstName);
    setValue(document.querySelector("input[name*='lastName']"), passenger.lastName);
    setValue(document.querySelector("input[type='email']"), passenger.email);
    setValue(document.querySelector("input[type='tel']"), passenger.phone);
  }

  function fillGeneric() {
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
