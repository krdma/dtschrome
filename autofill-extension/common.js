(() => {
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

  function createButton(onClick) {
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
    btn.addEventListener('click', onClick);
    document.body.appendChild(btn);
  }

  window.autofillCommon = {
    setValue,
    setValueByName,
    setDropdown,
    getMaleValue,
    setGender,
    createButton
  };
})();
