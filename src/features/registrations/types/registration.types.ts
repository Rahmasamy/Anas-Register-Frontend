export type CreateRegistrationPayload = {
  name: string;
  phone: string;
  project?: string;
  center: string;
  location: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  category: string;
  specialties: string[];
  status?: string;
  extra?: string;
  needs: string[];
  previousSupport?: string;
  contactChoice?: string;
  consent: true;
};

/** Exact flat 201 response returned by the Express registration controller. */
export type CreateRegistrationResponse = {
  id: string;
  referenceNumber: string;
  workflowStatus: string;
  createdAt: string;
};

export type RegistrationConfirmation = CreateRegistrationResponse;
