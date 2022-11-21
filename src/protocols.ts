import { TicketStatus } from "@prisma/client";

export type ApplicationError = {
  name: string;
  message: string;
};

export type ViaCEPAddress = {
  logradouro: string,
  complemento: string,
  bairro: string,
  localidade: string,
  uf: string,

};

export type AddressEnrollment = {
  logradouro: string,
  complemento: string,
  bairro: string,
  cidade: string,
  uf: string,
  error?: string

}

export type AddressByCEP = {
  logradouro: string,
  complemento: string,
  bairro: string,
  cidade: string,
  uf: string,
  
}

export type RequestError = {
  status: number,
  data: object | null,
  statusText: string,
  name: string,
  message: string,
};

export type TicketEntity = {
    id: number,
    ticketTypeId: number,
    enrollmentId: number,
    status: TicketStatus,
    createdAt: Date,
    updatedAt: Date
}

export type Ticket = Partial<TicketEntity>;

export type PaymentEntity = {
  id: number,
  ticketId: number,
  value: number,
  cardIssuer: string,
  cardLastDigits: string,
  createdAt: Date,
  updatedAt: Date
}

export type Payment = Partial<PaymentEntity>;

export type CardData = {
  issuer: string,
  number: number,
  name: string,
  expirationDate: Date,
  cvv: number
}
