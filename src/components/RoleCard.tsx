import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleCardProps {
  title: string;
  description: string;
  image: string;
  onClick: () => void;
  color: "primary" | "secondary" | "tuk-orange" | "tuk-blue" | "success" | "danger" | "warning";
}

export const RoleCard = ({ title, description, image, onClick, color }: RoleCardProps) => {
  const colorClasses = {
    primary: "border-primary hover:bg-primary/10",
    secondary: "border-secondary hover:bg-secondary/10", 
    "tuk-orange": "border-tuk-orange hover:bg-tuk-orange/10",
    "tuk-blue": "border-tuk-blue hover:bg-tuk-blue/10",
    success: "border-success hover:bg-success/10",
    danger: "border-danger hover:bg-danger/10",
    warning: "border-warning hover:bg-warning/10"
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${colorClasses[color]} hover:shadow-lg`}
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 text-sm">{description}</p>
        <Button variant="outline" className="w-full">
          Enter as {title}
        </Button>
      </CardContent>
    </Card>
  );
};