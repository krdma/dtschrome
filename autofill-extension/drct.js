(() => {
  const {
    passengers,
    setValue,
    getContactInfo,
    createButton
  } = window.autofillCommon;

  function normalizeType(type) {
    if (!type) return 'ADULT';
    const value = type.toString().toUpperCase();
    if (/(CHILD|CHD)/.test(value)) return 'CHILD';
    if (/(INFANT|INF|BABY)/.test(value)) return 'INFANT';
    if (/(ADULT|ADT)/.test(value)) return 'ADULT';
    return 'ADULT';
  }

  function formatDate(value) {
    if (!value) return '';
    const datePart = value.split('T')[0].split(' ')[0];
    let match = datePart.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (match) return `${match[3]}.${match[2]}.${match[1]}`;
    match = datePart.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
    if (match) return `${match[1]}.${match[2]}.${match[3]}`;
    return datePart;
  }

  function fillByLabel(container, pattern, value) {
    if (!container || value == null) return;
    const fields = container.querySelectorAll('.form-field');
    for (const field of fields) {
      const label = field.querySelector('label');
      const text = label ? label.textContent || '' : '';
      if (pattern.test(text)) {
        const input = field.querySelector('input, textarea');
        if (input) {
          setValue(input, value);
        }
        return;
      }
    }
  }

  function setGenderField(field, passenger) {
    if (!field || !passenger) return;
    const gender = (passenger.gender || passenger.sex || '').toString().toUpperCase();
    const female = /(FEMALE|F)/.test(gender);
    const targetValue = female ? 'Ж' : 'М';
    const radio = field.querySelector(`input[value='${targetValue}']`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('input', { bubbles: true }));
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      radio.dispatchEvent(new Event('click', { bubbles: true }));
    } else {
      const label = female
        ? field.querySelector('.gender-radio__label.female, label[for*="female"]')
        : field.querySelector('.gender-radio__label.male, label[for*="male"]');
      if (label) label.click();
    }
  }

  function fillPassengerBlock(block, passenger) {
    if (!block || !passenger) return;
    const fields = block.querySelectorAll('.form-field');
    fields.forEach(field => {
      const label = field.querySelector('label');
      const text = label ? label.textContent || '' : '';
      if (/last/i.test(text)) {
        const input = field.querySelector('input');
        setValue(input, passenger.last_name || passenger.lastName || '');
      } else if (/first/i.test(text)) {
        const input = field.querySelector('input');
        setValue(input, passenger.first_name || passenger.firstName || '');
      } else if (/gender/i.test(text)) {
        setGenderField(field, passenger);
      } else if (/birth/i.test(text)) {
        const input = field.querySelector('input');
        setValue(input, formatDate(passenger.birthday || passenger.dob || passenger.date_of_birth));
      }
    });
  }

  function fillContactInfo(contact) {
    if (!contact) return;
    const containers = document.querySelectorAll('.search__contact-info, .contact-info, .contact-form');
    containers.forEach(container => {
      fillByLabel(container, /first/i, contact.firstName);
      fillByLabel(container, /last/i, contact.lastName);
      fillByLabel(container, /email/i, contact.email);
      fillByLabel(container, /phone|tel/i, contact.phone);
    });

    const emailInput = document.querySelector("input[type='email']");
    if (emailInput) setValue(emailInput, contact.email);
    const phoneInput = document.querySelector("input[type='tel']");
    if (phoneInput) setValue(phoneInput, contact.phone);
  }

  function fillDrct(data) {
    const paxData = data && data.passports ? data.passports : passengers;
    const contact = getContactInfo(data || {});
    const remaining = paxData.slice();

    function takePassenger(type) {
      const index = remaining.findIndex(
        p =>
          normalizeType(
            p.type || p.passenger_type || p.pax_type || p.category || p.paxType
          ) === type
      );
      if (index >= 0) {
        return remaining.splice(index, 1)[0];
      }
      return remaining.shift();
    }

    const blocks = document.querySelectorAll('.search__passenger-block');
    blocks.forEach(block => {
      const title = block.querySelector('.search__flight-title');
      const text = title ? (title.textContent || '').toUpperCase() : '';
      let passengerType = 'ADULT';
      if (/CHILD/.test(text)) passengerType = 'CHILD';
      else if (/INFANT|BABY/.test(text)) passengerType = 'INFANT';
      const passenger = takePassenger(passengerType);
      if (passenger) {
        fillPassengerBlock(block, passenger);
      }
    });

    fillContactInfo(contact);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => createButton(fillDrct));
  } else {
    createButton(fillDrct);
  }
})();
