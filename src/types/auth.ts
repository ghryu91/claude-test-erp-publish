// src/types/auth.ts

/** 로그인 요청 DTO */
export interface LoginRequest {
  login_id: string;
  password: string;
}

/** 로그인 응답 DTO */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  login_id: string;
  user_name: string;
  company_id: number;
  company_name: string;
  authority_group_id: number;
}

/** 시스템 전역에서 사용하는 사용자 정보 객체 */
export interface AuthUser {
  user_id: number;
  login_id: string;
  user_name: string;
  email_address?: string;
  company_id: number;
  company_name: string;
  authority_group_id: number;
  authority_group_name?: string;
  last_login_at?: string;
  // ... 추가 정보
}