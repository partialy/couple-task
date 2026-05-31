export function getSystemNoticeWebSocketUrl(): string {
  const token = localStorage.getItem('token') || '';
  const tokenParam = encodeURIComponent(token.startsWith('Bearer ') ? token : `Bearer ${token}`);
  const path = '/api/ws/system-notice';
  const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProto}//${window.location.host}${path}?token=${tokenParam}`;
}
