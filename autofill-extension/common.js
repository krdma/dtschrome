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
    input.dispatchEvent(new Event('change', { bubbles: true }));
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

  function getContactInfo(data) {
    const result = { email: data?.email || null, phone: data?.phone || null };
    const contacts = Array.isArray(data?.contact)
      ? data.contact
      : Array.isArray(data?.contacts)
      ? data.contacts
      : null;
    if (contacts) {
      for (const c of contacts) {
        const type = (c.type || '').toLowerCase();
        if (!result.email) {
          if (c.email) {
            result.email = c.email;
          } else if (type.includes('mail') && c.value) {
            result.email = c.value;
          }
        }
        if (!result.phone) {
          if (c.phone) {
            result.phone = c.phone;
          } else if (/phone|tel/.test(type) && c.value) {
            result.phone = c.value;
          }
        }
        if (result.email && result.phone) break;
      }
    }
    return result;
  }

  function createButton(onClick) {
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      gap: '5px'
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Order ID';
    Object.assign(input.style, {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc'
    });

    const btn = document.createElement('button');
    btn.textContent = 'Fill Passenger Info';
    Object.assign(btn.style, {
      padding: '10px 15px',
      background: '#00aaff',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    });

    btn.addEventListener('click', async () => {
      let data = null;
      const bookingId = input.value.trim();
      if (bookingId) {
        try {
          const url = `https://cp.gth.com.ua/plugin/getdata?id=${encodeURIComponent(bookingId)}`;
          const res = await chrome.runtime.sendMessage({ action: 'fetch', url });
          if (res && res.ok) {
            data = res.data;
          } else {
            console.error('Failed to fetch booking data');
          }
        } catch (err) {
          console.error('Failed to fetch booking data', err);
        }
      }
      onClick(data);
    });

    container.appendChild(input);
    container.appendChild(btn);
    document.body.appendChild(container);
  }

  window.autofillCommon = {
    passengers,
    mainPassenger,
    setValue,
    setValueByName,
    setDropdown,
    getMaleValue,
    setGender,
    getContactInfo,
    createButton
  };
})();
