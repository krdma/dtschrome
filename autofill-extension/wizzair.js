(() => {
  const { passengers, setValue, setDropdown, getContactInfo, createButton } =
    window.autofillCommon;

  let storedPassengers = passengers;

  function getPassengerSections() {
    return Array.from(
      document.querySelectorAll('.booking-flow__passengers__header')
    );
  }

  function getPassengerIndex(section, fallbackIndex) {
    const firstInput = section.querySelector(
      "input[id*='first-name'], input[name*='firstName']"
    );
    const id = firstInput?.id || firstInput?.name;
    if (id) {
      const match = id.match(/(\d+)/);
      if (match) return Number(match[1]);
    }
    return fallbackIndex;
  }

  function getNormalizedGender(passenger) {
    const rawGender = (
      passenger?.gender ||
      passenger?.sex ||
      passenger?.title ||
      ''
    )
      .toString()
      .toLowerCase();
    if (/(f|wom|mrs|ms|miss|fem)/.test(rawGender)) return 'female';
    return 'male';
  }

  function pickTitle(passenger) {
    const normalizedGender = getNormalizedGender(passenger);
    return (
      passenger?.title ||
      passenger?.sex ||
      (normalizedGender === 'female' ? 'MS' : 'MR')
    );
  }

  function getGenderOptionValue(select, gender) {
    if (!select) return null;
    const options = Array.from(select.querySelectorAll('option'));
    const matcher = gender === 'female' ? /(f|wom|mrs|ms|miss|fem)/ : /(m|mr|man|male)/;
    for (const option of options) {
      const text = (option.textContent || '').trim().toLowerCase();
      const value = (option.value || '').trim().toLowerCase();
      if (matcher.test(text) || matcher.test(value)) {
        return option.value || value;
      }
    }
    return options.length ? options[0].value : null;
  }

  function triggerClick(element) {
    if (!element) return;
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  function setGenderControls(section, passenger) {
    const normalizedGender = getNormalizedGender(passenger);
    const genderSelect = section.querySelector(
      "select[name*='gender'], select[id*='gender']"
    );
    if (genderSelect) {
      const value = getGenderOptionValue(genderSelect, normalizedGender);
      if (value != null) setDropdown(genderSelect, value);
      return;
    }

    const radios = Array.from(
      section.querySelectorAll("input[type='radio'][name*='gender'], input[type='radio'][id*='gender']")
    );
    if (!radios.length) return;
    const target =
      radios.find(r => (r.value || '').toLowerCase() === normalizedGender) ||
      (normalizedGender === 'female'
        ? radios.find(r => /(f|wom|mrs|ms|miss|fem)/.test((r.value || '').toLowerCase()))
        : radios.find(r => /(m|mr|man|male)/.test((r.value || '').toLowerCase())) ||
      radios[0];
    if (!target) return;
    const label = target.id
      ? section.querySelector(`label[for='${target.id}']`)
      : null;
    if (label) {
      triggerClick(label);
    } else {
      triggerClick(target);
    }
  }

  function fillPassengerSection(section, passenger) {
    if (!section || !passenger) return;
    const firstName = passenger.first_name || passenger.firstName || '';
    const lastName = passenger.last_name || passenger.lastName || '';
    const titleSelect = section.querySelector(
      "select[name*='title'], select[id*='title']"
    );
    if (titleSelect) setDropdown(titleSelect, pickTitle(passenger));
    const firstInput = section.querySelector(
      "input[id*='first-name'], input[name*='firstName']"
    );
    setValue(firstInput, firstName);
    const lastInput = section.querySelector(
      "input[id*='last-name'], input[name*='lastName']"
    );
    setValue(lastInput, lastName);
    setGenderControls(section, passenger);
  }

  function fillAllPassengers(paxList) {
    const sections = getPassengerSections();
    sections.forEach((section, index) => {
      const passenger = paxList[index] || paxList[0] || storedPassengers[index];
      fillPassengerSection(section, passenger);
    });
  }

  function addPassengerFillIcons() {
    const sections = getPassengerSections();
    sections.forEach((section, fallbackIndex) => {
      const index = getPassengerIndex(section, fallbackIndex);
      let icon = section.querySelector('.autofill-passenger-icon');
      if (!icon) {
        icon = document.createElement('button');
        icon.type = 'button';
        icon.className = 'autofill-passenger-icon';
        icon.textContent = '🪄';
        icon.title = 'Заполнить данные пассажира';
        icon.style.marginLeft = '8px';
        icon.style.background = 'transparent';
        icon.style.border = 'none';
        icon.style.cursor = 'pointer';
        icon.style.fontSize = '18px';
        icon.style.lineHeight = '1';
        const nameContainer = section.querySelector(
          '.booking-flow__passengers__header__name'
        );
        (nameContainer || section).appendChild(icon);
      }
      icon.onclick = event => {
        event.preventDefault();
        const passenger =
          storedPassengers[index] ||
          storedPassengers[fallbackIndex] ||
          storedPassengers[0];
        fillPassengerSection(section, passenger);
      };
    });
  }

  function fillWizzAir(data) {
    const paxData =
      data && Array.isArray(data.passports) && data.passports.length
        ? data.passports
        : passengers;
    storedPassengers = paxData;
    addPassengerFillIcons();
    fillAllPassengers(paxData);
    const contact = getContactInfo(data || {});
    setValue(document.querySelector("input[type='email']"), contact.email);
    setValue(document.querySelector("input[type='tel']"), contact.phone);
  }

  function init() {
    storedPassengers = passengers;
    addPassengerFillIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createButton(fillWizzAir);
      init();
    });
  } else {
    createButton(fillWizzAir);
    init();
  }
})();
