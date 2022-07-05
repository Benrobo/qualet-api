export function validatePhonenumber(phoneNumber) {
  if (!phoneNumber) return false;
  const regexp =
    /^\+{0,2}([\-\. ])?(\(?\d{0,3}\))?([\-\. ])?\(?\d{0,3}\)?([\-\. ])?\d{3}([\-\. ])?\d{4}/;
  return regexp.test(phoneNumber);
}

export function validateEmail(email) {
  const tester =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email) return false;

  let emailParts = email.split("@");

  if (emailParts.length !== 2) return false;

  let account = emailParts[0];
  let address = emailParts[1];

  if (account.length > 64) return false;
  else if (address.length > 255) return false;

  let domainParts = address.split(".");
  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  )
    return false;

  if (!tester.test(email)) return false;

  return true;
}


const luhnCheck = val => {
  let checksum = 0; // running checksum total
  let j = 1; // takes value of 1 or 2

  // Process each digit one by one starting from the last
  for (let i = val.length - 1; i >= 0; i--) {
    let calc = 0;
    // Extract the next digit and multiply by 1 or 2 on alternative digits.
    calc = Number(val.charAt(i)) * j;

    // If the result is in two digits add 1 to the checksum total
    if (calc > 9) {
      checksum = checksum + 1;
      calc = calc - 10;
    }

    // Add the units element to the checksum total
    checksum = checksum + calc;

    // Switch the value of j
    if (j == 1) {
      j = 2;
    } else {
      j = 1;
    }
  }

  //Check if it is divisible by 10 or not.
  return (checksum % 10) == 0;
}

export const validateCardNumber = number => {
  //Check if the number contains only numeric value  
  //and is of between 13 to 19 digits
  const regex = new RegExp("^[0-9]{13,19}$");
  if (!regex.test(number)) {
    return false;
  }

  return luhnCheck(number);
}

export const validateCardExp = (exp = "") => {
  if (exp === "") return false
  if (exp.includes("/") === false) return false;
  if (typeof exp === "number") return false;

  if (typeof exp === "string") {
    const formated = exp.split("/");

    if (formated.length <= 0) {
      return false
    }
    const date = new Date()
    const currYear = date.getFullYear()
    const currMon = date.getMonth() + 1;
    const month = parseInt(formated[0])
    const year = `20${parseInt(formated[1])}`;

    if (year < currYear) return false
    if (year === currYear && month < currMon) return false;

    return true
  }
}

export const validateCvv = (cvv) => {
  if (typeof cvv === "number") {
    const str = cvv.toString();
    const len = str.length;
    console.log(str);
    if (len < 3) return false;
    if (len > 3) return false;
  }
  if (typeof cvv === "string") {
    let len = cvv.length;
    if (len < 3) return false;
    if (len > 3) return false;
  }
  return true
}