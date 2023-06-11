export const fullNameValidate = {
  validator: (v) => /^\p{L}{2,}(?:\s+\p{L}{2,})+\s*$/u.test(v),
  message: "יש להזין שם מלא תקין",
}

export const phoneValidate = {
  validator: (v) => /^05\d{8}$/.test(v),
  message: "יש להזין מספר נייד תקין",
}

export const usernameValidate = {
  validator: (v) => /^.{5,}$/.test(v),
  message: "יש להזין שם משתמש תקין",
}

export const passwordValidate = {
  validator: (v) => /^.{4,}$/.test(v),
  message: "יש להזין סיסמה תקינה",
}

export const popupValidate = {
  validator: (v) => /^.{6,}$/.test(v),
  message: "יש להזין תוכן תקין למודעה",
}
