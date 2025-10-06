(() => {
  const {
    passengers,
    getContactInfo,
    setValue,
    createButton
  } = window.autofillCommon;

  function toArray(value) {
    if (Array.isArray(value)) return value;
    return [value];
  }

  function pickTitleOptions(passenger) {
    const type = (passenger?.type || '').toUpperCase();
    const gender = (passenger?.gender || passenger?.sex || '').toUpperCase();
    if (type.startsWith('CH')) {
      return ['Child', 'CHD'];
    }
    if (gender.startsWith('F')) {
      return ['Ms', 'Mrs', 'Miss'];
    }
    return ['Mr'];
  }

  function setMuiSelectValue(trigger, titles) {
    const optionsList = toArray(titles)
      .map((t) => (t || '').trim())
      .filter(Boolean);
    if (!trigger || !optionsList.length) return;

    const openMenu = () => {
      trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      trigger.click();
    };

    const findOption = () => {
      const listId = trigger.getAttribute('aria-controls');
      let list = listId ? document.getElementById(listId) : null;
      if (!list) {
        list = document.querySelector('ul[role="listbox"]');
      }
      if (!list) return null;
      const candidates = Array.from(
        list.querySelectorAll('[role="option"], li[role], button[role]')
      );
      const normalizedCandidates = candidates.map((el) => ({
        el,
        text: (el.textContent || '').trim().toLowerCase()
      }));
      for (const desired of optionsList) {
        const desiredLower = desired.toLowerCase();
        let match = normalizedCandidates.find((c) => c.text === desiredLower);
        if (!match) {
          match = normalizedCandidates.find((c) => c.text.includes(desiredLower));
        }
        if (match) {
          return match.el;
        }
      }
      return normalizedCandidates.length ? normalizedCandidates[0].el : null;
    };

    const selectOption = () => {
      const option = findOption();
      if (!option) return;
      option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      option.click();
      option.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    };

    openMenu();
    setTimeout(selectOption, 60);
  }

  function fillGuestRow(row, passenger, delay = 0) {
    if (!row || !passenger) return;
    const firstInput = row.querySelector("[data-testid='guest-first-name'] input, input[name$='.firstName']");
    const lastInput = row.querySelector("[data-testid='guest-last-name'] input, input[name$='.lastName']");
    const titleTrigger = row.querySelector("[data-testid='title-dropdown'] [role='combobox']");

    if (firstInput) {
      setValue(firstInput, passenger.first_name || passenger.firstName || '');
    }
    if (lastInput) {
      setValue(lastInput, passenger.last_name || passenger.lastName || '');
    }
    if (titleTrigger) {
      const titles = pickTitleOptions(passenger);
      setTimeout(() => setMuiSelectValue(titleTrigger, titles), delay);
    }
  }

  function fillContact(contact) {
    if (!contact) return;
    const firstInput = document.querySelector("input[name='contact.firstName'], input[name='contactFirstName']");
    const lastInput = document.querySelector("input[name='contact.lastName'], input[name='contactLastName']");
    const emailInput = document.querySelector(
      "input[name='contact.email'], input[name='contactEmail'], input[type='email']"
    );
    const phoneInput = document.querySelector(
      "input[name='contact.phone'], input[name='contactPhone'], input[type='tel']"
    );

    if (firstInput) setValue(firstInput, contact.firstName || '');
    if (lastInput) setValue(lastInput, contact.lastName || '');
    if (emailInput) setValue(emailInput, contact.email || '');
    if (phoneInput) setValue(phoneInput, contact.phone || '');
  }

  function fillWebbeds(data) {
    const pax = data?.passports && data.passports.length ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const orderId = data?.order_id || data?.orderId || data?.id || '';

    const agentReferenceInput = document.querySelector("input[name='agentReference']");
    if (agentReferenceInput) {
      setValue(agentReferenceInput, orderId || contact.lastName + contact.firstName);
    }

    const guestRows = document.querySelectorAll("[data-testid='guest-info-row']");
    guestRows.forEach((row, index) => {
      const passenger = pax[index] || pax[pax.length - 1] || pax[0];
      fillGuestRow(row, passenger, index * 120);
    });

    fillContact(contact);

    const conditionsCheckbox = document.querySelector(
      "input[name='readConditions'], input[type='checkbox'][name*='conditions']"
    );
    if (conditionsCheckbox && !conditionsCheckbox.checked) {
      conditionsCheckbox.click();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillWebbeds));
  } else {
    createButton(fillWebbeds);
  }
})();
