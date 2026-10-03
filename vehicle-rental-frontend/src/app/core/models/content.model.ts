/** Mirrors content-service `Content` entity (feedback / review / query entries). */
export interface Content {
  id: number;
  type: string;
  name: string;
  email: string;
  message: string;
  rating: number;
}

export type ContentInput = Omit<Content, 'id'>;
