import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const roleRequestSchema = z.object({
  requestedRole: z.enum(["driver", "owner", "marshall", "councillor"], {
    required_error: "Please select a role to request",
  }),
  justification: z
    .string()
    .min(50, "Justification must be at least 50 characters")
    .max(1000, "Justification must not exceed 1000 characters"),
});

type RoleRequestFormData = z.infer<typeof roleRequestSchema>;

export function RoleRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RoleRequestFormData>({
    resolver: zodResolver(roleRequestSchema),
    defaultValues: {
      justification: "",
    },
  });

  const onSubmit = async (data: RoleRequestFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert role request
      const { data: request, error: insertError } = await supabase
        .from("role_requests")
        .insert({
          user_id: user.id,
          requested_role: data.requestedRole,
          justification: data.justification,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send notification (email + SMS)
      try {
        await supabase.functions.invoke("send-role-request-email", {
          body: {
            requestId: request.id,
            userEmail: user.email!,
            userId: user.id,
            requestedRole: data.requestedRole,
            status: 'pending',
          },
        });
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Don't fail the request if notification fails
      }

      toast({
        title: "Request Submitted",
        description: "Your role request has been submitted and is pending review.",
      });

      form.reset();
    } catch (error: any) {
      console.error("Error submitting role request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit role request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Role Elevation</CardTitle>
        <CardDescription>
          Submit a request to gain access to elevated roles. Your request will be reviewed by an administrator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="requestedRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="marshall">Marshall</SelectItem>
                      <SelectItem value="councillor">Councillor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the role you wish to request access to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why you are requesting this role... (minimum 50 characters)"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed explanation of why you need this role. Be specific about your qualifications and intended use.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
