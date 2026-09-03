export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  document.cookie = `access_token=${accessToken}; path=/; max-age=3600; SameSite=Lax`
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  document.cookie = 'access_token=; path=/; max-age=0'
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

export function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? match[1] : null
}
