import { InfringementMonitoringDashboard } from "@/components/monitoring/InfringementMonitoringDashboard";

const InfringementMonitoring = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <InfringementMonitoringDashboard />
      </div>
    </div>
  );
};

export default InfringementMonitoring;
