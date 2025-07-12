import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SassaDiscountInfo {
  isVerified: boolean;
  discountPercentage: number;
  grantType: string | null;
}

export const useSassaDiscount = (userId?: string) => {
  const [discountInfo, setDiscountInfo] = useState<SassaDiscountInfo>({
    isVerified: false,
    discountPercentage: 0,
    grantType: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSassaVerification = async () => {
      try {
        const { data, error } = await supabase
          .from('sassa_verifications')
          .select('status, grant_type')
          .eq('user_id', userId)
          .eq('status', 'approved')
          .maybeSingle();

        if (error) {
          console.error('Error fetching SASSA verification:', error);
          return;
        }

        if (data) {
          // Apply different discount rates based on grant type
          const discountPercentage = getDiscountByGrantType(data.grant_type);
          setDiscountInfo({
            isVerified: true,
            discountPercentage,
            grantType: data.grant_type,
          });
        }
      } catch (error) {
        console.error('Error in fetchSassaVerification:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSassaVerification();
  }, [userId]);

  const getDiscountByGrantType = (grantType: string): number => {
    switch (grantType) {
      case 'old_age_pension':
      case 'disability_grant':
        return 25; // 25% discount for vulnerable groups
      case 'child_support_grant':
      case 'foster_child_grant':
        return 20; // 20% discount for child-related grants
      case 'care_dependency_grant':
        return 30; // 30% discount for care dependency
      case 'war_veterans_grant':
        return 35; // 35% discount for veterans
      default:
        return 15; // 15% default discount for any approved SASSA grant
    }
  };

  const calculateDiscountedPrice = (originalPrice: number): { finalPrice: number; savings: number } => {
    if (!discountInfo.isVerified) {
      return { finalPrice: originalPrice, savings: 0 };
    }

    const savings = Math.round(originalPrice * (discountInfo.discountPercentage / 100));
    const finalPrice = originalPrice - savings;
    
    return { finalPrice, savings };
  };

  return {
    discountInfo,
    loading,
    calculateDiscountedPrice,
  };
};