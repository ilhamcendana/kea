interface FieldText {
  label: string;
  type: "text" | "number" | "email" | "select" | "checkbox" | "radio";
}

interface Event {
  id: string;
  name: string;
  eventDate: string;
}