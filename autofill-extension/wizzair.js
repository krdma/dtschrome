(() => {
  const { passengers, setValue, setDropdown, getContactInfo, createButton } =
    window.autofillCommon;

  function pickPassenger(list, idx) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[idx] || list[list.length - 1] || list[0];
  }

  function fillField(selectors, value, idx) {
    if (value == null || value === "") return false;
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of selectorList) {
      if (!sel) continue;
      let element = null;
      if (typeof sel === "string") {
        const nodes = document.querySelectorAll(sel);
        if (!nodes.length) continue;
        element =
          idx != null ? nodes[idx] || nodes[nodes.length - 1] : nodes[0];
      } else if (sel && sel.nodeType === 1) {
        element = sel;
      }
      if (!element) continue;
      if (element.tagName === "SELECT") {
        setDropdown(element, value);
      } else {
        setValue(element, value);
      }
      return true;
    }
    return false;
  }

  function fillFieldWithCandidates(selectors, values, idx) {
    if (!Array.isArray(values)) values = [values];
    for (const value of values) {
      if (fillField(selectors, value, idx)) {
        return true;
      }
    }
    return false;
  }

  function toISODateParts(value) {
    if (!value) return null;
    const raw = value.split("T")[0].split(" ")[0];
    let match = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (match) {
      return { year: match[1], month: match[2], day: match[3] };
    }
    match = raw.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
    if (match) {
      return { day: match[1], month: match[2], year: match[3] };
    }
    return null;
  }

  function monthCandidates(month) {
    if (!month) return [];
    const num = parseInt(month, 10);
    if (Number.isNaN(num)) return [month];
    const padded = num < 10 ? `0${num}` : `${num}`;
    const values = [padded, `${num}`];
    if (!values.includes(month)) values.push(month);
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const name = monthNames[num - 1];
    if (name) values.push(name);
    return values;
  }

  function setGenderForPassenger(idx, pax) {
    if (!pax) return;
    const value = (pax.sex || pax.gender || "").toString().toUpperCase();
    const isFemale = /F|MS|MISS|MRS|FEMALE|WOMAN|GIRL/.test(value);
    const femaleInput = document.querySelector(
      '.rf-switch__input [value="female"]'
    );
    const maleInput = document.querySelector(
      '.rf-switch__input [value="male"]'
    );
    const target = isFemale ? femaleInput : maleInput || femaleInput;
    if (!target) return;
    if (!target.checked) {
      target.checked = true;
    }
  }

  function fillDate(prefixes, dateParts, idx) {
    if (!dateParts) return;
    const { day, month, year } = dateParts;
    const prefixList = Array.isArray(prefixes) ? prefixes : [prefixes];
    prefixList.forEach((prefix) => {
      if (!prefix) return;
      fillFieldWithCandidates(
        [
          `#${prefix}-day`,
          `select#${prefix}-day`,
          `[data-test='${prefix}-day'] select`,
          `[data-test='${prefix}-day']`,
          `select[name$='.${prefix}.day']`,
          `input[name$='.${prefix}.day']`,
        ],
        [day, day && day.replace(/^0/, "")],
        idx
      );
      fillFieldWithCandidates(
        [
          `#${prefix}-month`,
          `select#${prefix}-month`,
          `[data-test='${prefix}-month'] select`,
          `[data-test='${prefix}-month']`,
          `select[name$='.${prefix}.month']`,
          `input[name$='.${prefix}.month']`,
        ],
        monthCandidates(month),
        idx
      );
      fillFieldWithCandidates(
        [
          `#${prefix}-year`,
          `select#${prefix}-year`,
          `[data-test='${prefix}-year'] select`,
          `[data-test='${prefix}-year']`,
          `select[name$='.${prefix}.year']`,
          `input[name$='.${prefix}.year']`,
        ],
        [year],
        idx
      );
    });
  }

  function fillPassenger(pax, idx) {
    if (!pax) return;
    const firstName = pax.first_name || pax.firstName || "";
    const lastName = pax.last_name || pax.lastName || "";
    const nationality = (
      pax.nationality ||
      pax.nationality_code ||
      pax.citizenship ||
      ""
    )
      .toString()
      .toUpperCase();
    const docNumber =
      pax.passport_number ||
      pax.passportNumber ||
      pax.document_number ||
      pax.documentNumber ||
      "";
    const docType = (
      pax.document_type ||
      pax.documentType ||
      pax.passport_type ||
      "passport"
    )
      .toString()
      .toLowerCase();
    const dob = pax.birthday || pax.dob || "";
    const expiry =
      pax.expiry || pax.passport_expiry || pax.document_expiry || "";

    fillField(
      [
        `#passenger-first-name-${idx}`,
        `[data-test='passenger-first-name-${idx}']`,
        "input[data-test^='passenger-first-name-']",
      ],
      firstName,
      idx
    );

    fillField(
      [
        `#passenger-last-name-${idx}`,
        `[data-test='passenger-last-name-${idx}']`,
        "input[data-test^='passenger-last-name-']",
      ],
      lastName,
      idx
    );

    fillFieldWithCandidates(
      [
        `#passenger-nationality-${idx}`,
        `[data-test='passenger-nationality-${idx}'] select`,
        `[data-test='passenger-nationality-${idx}']`,
        "select[data-test^='passenger-nationality-']",
        "select[name*='nationality']",
      ],
      [nationality, nationality && nationality.slice(0, 2)],
      idx
    );

    fillFieldWithCandidates(
      [
        `#passenger-travel-document-type-${idx}`,
        `[data-test='passenger-travel-document-type-${idx}'] select`,
        `[data-test='passenger-travel-document-type-${idx}']`,
        "select[data-test^='passenger-travel-document-type-']",
        "select[name*='documentType']",
      ],
      [docType, "passport"],
      idx
    );

    fillField(
      [
        `#passenger-travel-document-number-${idx}`,
        `[data-test='passenger-travel-document-number-${idx}']`,
        `[data-test='travel-document-number-${idx}']`,
        "input[data-test^='passenger-travel-document-number-']",
        "input[name*='documentNumber']",
      ],
      docNumber,
      idx
    );

    const dobParts = toISODateParts(dob);
    if (dobParts) {
      fillDate(
        [
          `passenger-date-of-birth-${idx}`,
          `passenger-${idx}-date-of-birth`,
          `passengers-${idx}-date-of-birth`,
        ],
        dobParts,
        idx
      );
    }

    const expiryParts = toISODateParts(expiry);
    if (expiryParts) {
      fillDate(
        [
          `passenger-travel-document-expiration-${idx}`,
          `travel-document-expiration-${idx}`,
          `passenger-${idx}-document-expiration`,
        ],
        expiryParts,
        idx
      );
    }

    setGenderForPassenger(idx, pax);
  }

  function sanitizePhone(phone) {
    if (!phone) return "";
    const trimmed = phone.toString().trim();
    const withPlus = trimmed.startsWith("+")
      ? `+${trimmed.slice(1).replace(/[^0-9]/g, "")}`
      : trimmed.replace(/[^0-9]/g, "");
    return withPlus;
  }

  function fillContact(contact) {
    if (!contact) return;
    fillField(
      [
        "input[data-test='contact-first-name']",
        "input[name='contactDetails.firstName']",
        "input[name*='contactFirstName']",
      ],
      contact.firstName || contact.first_name || ""
    );

    fillField(
      [
        "input[data-test='contact-last-name']",
        "input[name='contactDetails.lastName']",
        "input[name*='contactLastName']",
      ],
      contact.lastName || contact.last_name || ""
    );

    fillField(
      [
        "input[data-test='contact-email']",
        "input[type='email'][name*='contact']",
        "input[name='contactDetails.email']",
      ],
      contact.email
    );

    fillFieldWithCandidates(
      [
        "input[data-test='contact-phone']",
        "input[data-test='contact-phone-number']",
        "input[name='contactDetails.phone']",
        "input[type='tel'][name*='contact']",
      ],
      [sanitizePhone(contact.phone), contact.phone],
      null
    );

    fillFieldWithCandidates(
      [
        "select[data-test='contact-title']",
        "[data-test='contact-title'] select",
        "select[name='contactDetails.title']",
      ],
      [contact.title, contact.title && contact.title.toString().toUpperCase()],
      null
    );
  }

  function fillWizzair(data) {
    const paxList =
      data && Array.isArray(data.passports) && data.passports.length
        ? data.passports
        : passengers;
    if (!paxList || !paxList.length) return;
    paxList.forEach((_, idx) =>
      fillPassenger(pickPassenger(paxList, idx), idx)
    );
    const contact = getContactInfo(data || {});
    fillContact(contact);
  }

  const init = () => {
    setTimeout(() => createButton(fillWizzair), 2000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
