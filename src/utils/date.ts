export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  
  // Replace dashes with slashes for better cross-browser compatibility (e.g., Safari)
  const safeDateString = dateString.replace(/-/g, '/');
  const date = new Date(safeDateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return dateString; // Return original if invalid date
  }
  
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffMin < 2) {
    return '刚刚';
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`;
  } else if (diffHour < 24) {
    return `${diffHour}小时前`;
  } else {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (date.getFullYear() !== now.getFullYear()) {
      return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
    }
    
    return `${month}-${day} ${hours}:${minutes}`;
  }
}
