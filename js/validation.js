const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseLocalDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export const validators = {
  product(value) {
    return value ? "" : "Selecciona el producto y proveedor que quieres solicitar.";
  },

  quantity(value) {
    if (!value) {
      return "Ingresa una cantidad.";
    }

    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      return "La cantidad debe ser un número entero entre 1 y 500.";
    }

    return "";
  },

  deliveryDate(value) {
    const selectedDate = parseLocalDate(value);
    if (!selectedDate) {
      return "Selecciona una fecha de entrega.";
    }

    if (selectedDate <= startOfToday()) {
      return "La fecha debe ser posterior a hoy.";
    }

    return "";
  },

  email(value) {
    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return "Ingresa un correo de contacto.";
    }

    return emailPattern.test(normalizedValue) ? "" : "Escribe un correo válido, por ejemplo nombre@dominio.com.";
  },

  address(value) {
    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return "Ingresa la dirección de entrega.";
    }

    return normalizedValue.length >= 10 ? "" : "La dirección debe tener al menos 10 caracteres.";
  },

  notes(value) {
    return value.length <= 180 ? "" : "Las observaciones no pueden superar 180 caracteres.";
  },

  terms(checked) {
    return checked ? "" : "Confirma que entiendes el carácter demostrativo de la solicitud.";
  }
};

export function getFieldValue(field) {
  return field.type === "checkbox" ? field.checked : field.value;
}

export function validateField(field) {
  const validator = validators[field.name];
  if (!validator) {
    return "";
  }

  return validator(getFieldValue(field));
}

export function validateForm(form) {
  const errors = {};
  const fields = form.querySelectorAll("[name]");

  fields.forEach((field) => {
    const message = validateField(field);
    if (message) {
      errors[field.name] = message;
    }
  });

  return errors;
}
