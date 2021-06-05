export interface InputValidators {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(validators: InputValidators) {
  let isValid = true;
  // If required is true, we must assure that the input has a value
  if (validators.required) {
    isValid = isValid && validators.value.toString().length !== 0;
  }

  if (validators.minLength != null && typeof validators.value === "string") {
    isValid = isValid && validators.value.length >= validators.minLength;
  }

  if (validators.maxLength != null && typeof validators.value === "string") {
    isValid = isValid && validators.value.length <= validators.maxLength;
  }

  if (validators.min != null && typeof validators.value === "number") {
    isValid = isValid && validators.value >= validators.min;
  }

  if (validators.max != null && typeof validators.value === "number") {
    isValid = isValid && validators.value <= validators.max;
  }

  console.log(isValid);

  return isValid;
}
