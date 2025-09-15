import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bug, Lightbulb, AlertTriangle, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackForm {
  type: 'bug' | 'feature' | 'general' | 'urgent';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  rating: number;
  title: string;
  description: string;
  device_info: string;
  browser_info: string;
}

export const UserFeedbackSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<FeedbackForm>({
    type: 'general',
    category: '',
    priority: 'medium',
    rating: 5,
    title: '',
    description: '',
    device_info: navigator.userAgent,
    browser_info: `${navigator.userAgent} | Screen: ${screen.width}x${screen.height}`,
  });
  const [loading, setLoading] = useState(false);

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-blue-600' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-green-600' },
    { value: 'urgent', label: 'Urgent Issue', icon: AlertTriangle, color: 'text-orange-600' },
  ];

  const categories = [
    'Authentication',
    'User Interface',
    'Performance',
    'Security',
    'Data Accuracy',
    'Mobile Experience',
    'Accessibility',
    'Documentation',
    'Other',
  ];

  const submitFeedback = async () => {
    if (!user || !feedback.title || !feedback.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          feedback_type: feedback.type,
          category: feedback.category,
          priority: feedback.priority,
          rating: feedback.rating,
          title: feedback.title,
          description: feedback.description,
          device_info: feedback.device_info,
          browser_info: feedback.browser_info,
          status: 'submitted',
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      });

      // Reset form
      setFeedback({
        ...feedback,
        title: '',
        description: '',
        rating: 5,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedType = feedbackTypes.find(type => type.value === feedback.type);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Share Your Feedback
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Help us improve PoortLink by sharing your experience, reporting issues, or suggesting new features.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Feedback Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {feedbackTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFeedback({ ...feedback, type: type.value as any })}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  feedback.type === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <type.icon className={`h-4 w-4 ${type.color}`} />
                  <span className="font-medium text-sm">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={feedback.category} onValueChange={(value) => setFeedback({ ...feedback, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup
              value={feedback.priority}
              onValueChange={(value) => setFeedback({ ...feedback, priority: value as any })}
              className="flex gap-4"
            >
              {['low', 'medium', 'high', 'critical'].map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <RadioGroupItem value={priority} id={priority} />
                  <Label htmlFor={priority} className="capitalize text-sm">
                    {priority}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Overall Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setFeedback({ ...feedback, rating: star })}
                className="p-1"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= feedback.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <input
            id="title"
            type="text"
            placeholder={`Enter a brief ${selectedType?.label.toLowerCase()}`}
            value={feedback.title}
            onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Provide detailed information about your feedback..."
            value={feedback.description}
            onChange={(e) => setFeedback({ ...feedback, description: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Technical Information</Label>
          <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
            <div><strong>Device:</strong> {feedback.device_info}</div>
            <div><strong>Screen:</strong> {screen.width}x{screen.height}</div>
            <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
          </div>
        </div>

        <Button 
          onClick={submitFeedback} 
          disabled={loading || !feedback.title || !feedback.description}
          className="w-full"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
};