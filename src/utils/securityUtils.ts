// Security utility functions

/**
 * Validates SASSA-related URLs to prevent open redirects
 */
export const validateSassaUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow official SASSA domains
    const allowedDomains = [
      'sassa.gov.za',
      'www.sassa.gov.za',
      'services.sassa.gov.za'
    ];
    
    return allowedDomains.includes(parsedUrl.hostname.toLowerCase());
  } catch {
    return false;
  }
};

/**
 * Safely opens external URLs with security measures
 */
export const safeOpenUrl = (url: string): void => {
  if (!validateSassaUrl(url)) {
    console.warn('Attempted to open unsafe URL:', url);
    return;
  }
  
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  }
};

/**
 * Generates secure storage URLs with expiration
 */
export const getSecureStorageUrl = async (bucketName: string, filePath: string): Promise<string | null> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Failed to generate secure storage URL:', error);
    return null;
  }
};

/**
 * Validates and sanitizes user inputs
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
};