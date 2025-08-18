import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, CheckCircle, AlertTriangle, Users, 
  Car, Route, Clock, FileText, Award, TrendingUp
} from 'lucide-react';

export const SANTACOComplianceTracker = () => {
  const [activeCompliance, setActiveCompliance] = useState('operational');

  const complianceMetrics = {
    operational: {
      title: "Operational Compliance",
      description: "Addressing SANTACO operational standards",
      metrics: [
        {
          name: "Route Adherence",
          score: 94,
          target: 95,
          status: "warning",
          description: "Staying on designated routes",
          impact: "Reduces conflict with traditional taxi operators"
        },
        {
          name: "Passenger Capacity",
          score: 100,
          target: 100,
          status: "success",
          description: "Respecting vehicle capacity limits",
          impact: "Maintains safety and regulatory compliance"
        },
        {
          name: "Operating Hours",
          score: 87,
          target: 90,
          status: "warning",
          description: "Operating within permitted hours",
          impact: "Respects traditional taxi operating schedules"
        },
        {
          name: "Rank Protocols",
          score: 92,
          target: 95,
          status: "good",
          description: "Following taxi rank procedures",
          impact: "Builds trust with taxi associations"
        }
      ]
    },
    community: {
      title: "Community Relations",
      description: "Building positive relationships with stakeholders",
      metrics: [
        {
          name: "SANTACO Engagement",
          score: 78,
          target: 85,
          status: "warning",
          description: "Active communication with taxi councils",
          impact: "Reduces tensions and builds cooperation"
        },
        {
          name: "Conflict Resolution",
          score: 95,
          target: 90,
          status: "success",
          description: "Peaceful resolution of disputes",
          impact: "Maintains harmonious relationships"
        },
        {
          name: "Benefit Sharing",
          score: 88,
          target: 85,
          status: "success",
          description: "Supporting local taxi economy",
          impact: "Demonstrates commitment to community"
        },
        {
          name: "Safety Collaboration",
          score: 91,
          target: 90,
          status: "success",
          description: "Joint safety initiatives",
          impact: "Shared responsibility for passenger safety"
        }
      ]
    },
    regulatory: {
      title: "Regulatory Compliance",
      description: "Meeting government and industry standards",
      metrics: [
        {
          name: "Permits & Licenses",
          score: 100,
          target: 100,
          status: "success",
          description: "All required documentation current",
          impact: "Legal operation and credibility"
        },
        {
          name: "Vehicle Inspections",
          score: 96,
          target: 95,
          status: "success",
          description: "Regular safety and roadworthy checks",
          impact: "Passenger safety and legal compliance"
        },
        {
          name: "Driver Verification",
          score: 98,
          target: 95,
          status: "success",
          description: "Background checks and training",
          impact: "Public trust and passenger safety"
        },
        {
          name: "Insurance Coverage",
          score: 100,
          target: 100,
          status: "success",
          description: "Comprehensive coverage maintained",
          impact: "Passenger protection and liability coverage"
        }
      ]
    }
  };

  const recentActions = [
    {
      type: "engagement",
      message: "Met with SANTACO Ward Committee - discussed route optimization",
      timestamp: "2 hours ago",
      impact: "positive"
    },
    {
      type: "compliance",
      message: "Completed route adherence training for 12 drivers",
      timestamp: "1 day ago", 
      impact: "positive"
    },
    {
      type: "conflict",
      message: "Resolved passenger capacity dispute through mediation",
      timestamp: "2 days ago",
      impact: "positive"
    },
    {
      type: "partnership",
      message: "Signed community benefit sharing agreement",
      timestamp: "3 days ago",
      impact: "positive"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'good': return 'text-sa-blue';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'good': return 'secondary';
      case 'warning': return 'outline';
      case 'danger': return 'destructive';
      default: return 'secondary';
    }
  };

  const overallScore = Object.values(complianceMetrics).reduce((acc, category) => {
    const categoryScore = category.metrics.reduce((sum, metric) => sum + metric.score, 0) / category.metrics.length;
    return acc + categoryScore;
  }, 0) / Object.keys(complianceMetrics).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-sa-green" />
                SANTACO Compliance Dashboard
              </CardTitle>
              <CardDescription>
                Monitoring compliance with taxi industry standards and community relations
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sa-green">{Math.round(overallScore)}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(complianceMetrics).map(([key, category]) => {
              const categoryScore = category.metrics.reduce((sum, metric) => sum + metric.score, 0) / category.metrics.length;
              return (
                <Button
                  key={key}
                  variant={activeCompliance === key ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveCompliance(key)}
                >
                  <div className="text-2xl font-bold">{Math.round(categoryScore)}%</div>
                  <div className="text-xs text-center">{category.title}</div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{complianceMetrics[activeCompliance as keyof typeof complianceMetrics].title}</CardTitle>
          <CardDescription>
            {complianceMetrics[activeCompliance as keyof typeof complianceMetrics].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceMetrics[activeCompliance as keyof typeof complianceMetrics].metrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{metric.name}</h3>
                  <Badge variant={getStatusBadge(metric.status)}>
                    {metric.score}% / {metric.target}%
                  </Badge>
                </div>
                <Progress value={metric.score} className="h-2" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-sa-blue mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-sa-blue">{metric.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Compliance Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  action.impact === 'positive' ? 'bg-success' : 'bg-warning'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{action.message}</p>
                  <p className="text-xs text-muted-foreground">{action.timestamp}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-sa-gold mx-auto mb-2" />
            <div className="text-2xl font-bold">847</div>
            <div className="text-sm text-muted-foreground">Families Served</div>
            <div className="text-xs text-sa-green">+12% this month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-sa-blue mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Conflicts This Month</div>
            <div className="text-xs text-success">Peaceful operations</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-tuk-orange mx-auto mb-2" />
            <div className="text-2xl font-bold">15</div>
            <div className="text-sm text-muted-foreground">Joint Initiatives</div>
            <div className="text-xs text-sa-blue">With SANTACO partners</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};