export interface User {
  id: string;
  name: string;
  apartmentNumber: string;
}

export const USERS: User[] = [
  { id: "user1", name: "Usuária 1", apartmentNumber: "" },
  { id: "user2", name: "Usuária 2", apartmentNumber: "" },
];

export interface Installment {
  id: string;
  type: "entrada" | "mensal" | "anual" | "taxa_obra" | "financiamento";
  dueDate: string;
  value: number;
  installmentNumber: string;
  observation: string;
  paid: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  specialty: string;
  whatsappLink: string;
  value: number;
  status: "pendente" | "orcado" | "contratado";
  observation: string;
}

export interface Material {
  id: string;
  name: string;
  storeContact: string;
  value: number;
  quantity: number;
  model: string;
  link: string;
  image?: string;
  status: "pendente" | "orcado" | "comprado";
}

export interface InspectionItem {
  id: string;
  category: "levar" | "verificar";
  description: string;
  checked: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unitValue: number;
  checked: boolean;
}

export interface UserProfile {
  name: string;
  apartmentNumber: string;
  totalFinancing: number;
}

