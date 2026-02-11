// forgot password

export interface RequestEmail {
  email: string;
}

export interface RequestPassword {
  password: string;
  otp: string;
}
