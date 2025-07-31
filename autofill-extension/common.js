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
  const mainContact = {
    firstName: 'Test',
    lastName: 'Contact',
    email: 'contact@example.com',
    phone: '5555555555',
    title: 'MR'
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
    const result = {
      title: data?.title || null,
      firstName: data?.first_name || data?.firstName || null,
      lastName: data?.last_name || data?.lastName || null,
      email: data?.email || null,
      phone: data?.phone || null
    };
    const contacts = Array.isArray(data?.contact)
      ? data.contact
      : Array.isArray(data?.contacts)
      ? data.contacts
      : data?.contact && typeof data.contact === 'object'
      ? [data.contact]
      : null;
    if (contacts) {
      for (const c of contacts) {
        const type = (c.type || '').toLowerCase();
        if (!result.firstName) result.firstName = c.first_name || c.firstName || null;
        if (!result.lastName) result.lastName = c.last_name || c.lastName || null;
        if (!result.title) result.title = c.title || null;
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
        if (result.email && result.phone && result.firstName && result.lastName && result.title) break;
      }
    }
    if (!result.firstName) result.firstName = mainContact.firstName;
    if (!result.lastName) result.lastName = mainContact.lastName;
    if (!result.email) result.email = mainContact.email;
    if (!result.phone) result.phone = mainContact.phone;
    if (!result.title) result.title = mainContact.title;
    return result;
  }

  function formatDate(value) {
    if (!value) return '';
    const datePart = value.split('T')[0].split(' ')[0];
    let m = datePart.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (m) return `${m[3]}.${m[2]}.${m[1]}`;
    m = datePart.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
    if (m) return `${m[1]}.${m[2]}.${m[3]}`;
    return datePart;
  }

  function createButton(onClick) {
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '5px'
    });

    const infoBox = document.createElement('div');
    Object.assign(infoBox.style, {
      background: '#fff',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '4px',
      maxWidth: '400px',
      overflow: 'auto',
      display: 'none'
    });

    const toggleInfo = document.createElement('button');
    toggleInfo.textContent = '\u25BC';
    Object.assign(toggleInfo.style, {
      padding: '2px 6px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      background: '#f0f0f0',
      cursor: 'pointer'
    });
    toggleInfo.addEventListener('click', () => {
      if (infoBox.style.display === 'none') {
        infoBox.style.display = 'block';
        toggleInfo.textContent = '\u25B2';
      } else {
        infoBox.style.display = 'none';
        toggleInfo.textContent = '\u25BC';
      }
    });

    const controls = document.createElement('div');
    Object.assign(controls.style, { display: 'flex', gap: '5px' });

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

    function displayData(data) {
      infoBox.innerHTML = '';
      if (!data) {
        infoBox.textContent = 'No data';
        return;
      }
      const orderId = data.id || data.orderId || data.order_id || data.booking_id || '';
      if (orderId) {
        const header = document.createElement('div');
        header.textContent = `\u2116 заказа: ${orderId}`;
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '5px';
        infoBox.appendChild(header);
      }
      if (Array.isArray(data.passports) && data.passports.length) {
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Пол</th><th>Имя</th><th>Фамилия</th><th>Паспорт</th><th>ДР</th></tr>';
        Array.from(thead.querySelectorAll('th')).forEach(th => {
          th.style.border = '1px solid #ccc';
          th.style.padding = '2px 4px';
        });
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        data.passports.forEach(p => {
          const row = document.createElement('tr');
          const dob = formatDate(p.birthday || p.dob || '');
          row.innerHTML = `<td>${p.gender || p.sex || ''}</td>` +
            `<td>${p.first_name || p.firstName || ''}</td>` +
            `<td>${p.last_name || p.lastName || ''}</td>` +
            `<td>${p.passport_number || p.passportNumber || ''}</td>` +
            `<td>${dob}</td>`;
          Array.from(row.children).forEach(td => {
            td.style.border = '1px solid #ccc';
            td.style.padding = '2px 4px';
          });
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        infoBox.appendChild(table);
      } else {
        infoBox.appendChild(document.createTextNode('No passport data'));
      }
    }

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
      displayData(data);
      infoBox.style.display = 'block';
      toggleInfo.textContent = '\u25B2';
      onClick(data);
    });

    controls.appendChild(input);
    controls.appendChild(btn);
    controls.appendChild(toggleInfo);

    container.appendChild(infoBox);
    container.appendChild(controls);
    document.body.appendChild(container);
  }

  window.autofillCommon = {
    passengers,
    mainPassenger,
    mainContact,
    setValue,
    setValueByName,
    setDropdown,
    getMaleValue,
    setGender,
    getContactInfo,
    createButton
  };
})();
