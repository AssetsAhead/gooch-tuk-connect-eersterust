import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DriverRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rideId: string;
  driverName: string;
  driverPhotoUrl?: string;
  destination: string;
  fare: number;
  onRatingSubmitted?: () => void;
}

export const DriverRatingDialog = ({
  open,
  onOpenChange,
  rideId,
  driverName,
  driverPhotoUrl,
  destination,
  fare,
  onRatingSubmitted
}: DriverRatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const quickFeedback = [
    { label: 'Great driver!', emoji: '👍' },
    { label: 'Safe driving', emoji: '🛡️' },
    { label: 'Friendly', emoji: '😊' },
    { label: 'Clean vehicle', emoji: '✨' },
  ];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        description: 'Tap the stars to rate your driver',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update ride with rating
      const { error } = await supabase
        .from('rides')
        .update({
          driver_rating: rating,
          driver_rating_comment: comment || null
        })
        .eq('id', rideId);

      if (error) throw error;

      toast({
        title: 'Thank you for your feedback!',
        description: `You rated ${driverName} ${rating} stars`
      });

      onRatingSubmitted?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Rating failed',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuickFeedback = (feedback: string) => {
    setComment(prev => prev ? `${prev} ${feedback}` : feedback);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Rate Your Trip</DialogTitle>
          <DialogDescription className="text-center">
            How was your ride to {destination}?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Driver info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={driverPhotoUrl} alt={driverName} />
              <AvatarFallback className="text-xl bg-primary/10">
                {driverName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{driverName}</p>
              <p className="text-sm text-muted-foreground">R{fare} fare</p>
            </div>
          </div>

          {/* Star rating */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-10 w-10 transition-colors',
                    (hoveredRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {rating === 0 && 'Tap to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent!'}
          </p>

          {/* Quick feedback */}
          <div className="flex flex-wrap gap-2 justify-center">
            {quickFeedback.map((item) => (
              <Button
                key={item.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuickFeedback(item.label)}
                className="text-xs"
              >
                {item.emoji} {item.label}
              </Button>
            ))}
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full"
          />

          {/* Submit */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Submit Rating
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
