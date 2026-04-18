export interface Partner {
  name: string;
  occupation: string;
  interests: string[];
}

export interface CoupleData {
  partner1: Partner;
  partner2: Partner;
  startDate: string;
  photos: string[];
}

export interface CoupleSubmission {
  partner1: Partner;
  partner2: Partner;
  startDate: string;
  previews: string[];
  files: File[];
}
