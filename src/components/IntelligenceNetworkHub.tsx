import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Network,
  Eye,
  Zap,
  Shield,
  AlertTriangle,
  Camera,
  Globe,
  TrendingUp,
  Clock,
  Users,
  Target,
  CheckCircle,
  Radio,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntelligenceNode {
  id: string;
  name: string;
  type: 'government' | 'private_security' | 'community' | 'business' | 'institutional';
  dataStreams: string[];
  processingCapability: 'basic' | 'advanced' | 'ai_enhanced';
  trustLevel: number;
  realTimeFeeds: number;
  lastActivity: string;
  specializations: string[];
}

interface ThreatIntelligence {
  id: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  category: 'crime_pattern' | 'suspicious_behavior' | 'vehicle_tracking' | 'crowd_analysis';
  description: string;
  affectedAreas: string[];
  confidence: number;
  sources: string[];
  timestamp: string;
  actionRequired: boolean;
}

export const IntelligenceNetworkHub = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { toast } = useToast();

  const intelligenceNodes: IntelligenceNode[] = [
    {
      id: 'node-001',
      name: 'SAPS Central Intelligence',
      type: 'government',
      dataStreams: ['crime_reports', 'patrol_routes', 'incident_history', 'wanted_persons'],
      processingCapability: 'advanced',
      trustLevel: 95,
      realTimeFeeds: 12,
      lastActivity: '2 minutes ago',
      specializations: ['crime_correlation', 'legal_evidence', 'forensics']
    },
    {
      id: 'node-002',
      name: 'ADT Armed Response Network',
      type: 'private_security',
      dataStreams: ['armed_response', 'panic_alerts', 'property_monitoring', 'client_incidents'],
      processingCapability: 'ai_enhanced',
      trustLevel: 87,
      realTimeFeeds: 28,
      lastActivity: '30 seconds ago',
      specializations: ['rapid_response', 'threat_assessment', 'property_security']
    },
    {
      id: 'node-003',
      name: 'Community Watch Collective',
      type: 'community',
      dataStreams: ['citizen_reports', 'neighbourhood_watch', 'social_media', 'local_events'],
      processingCapability: 'basic',
      trustLevel: 73,
      realTimeFeeds: 45,
      lastActivity: '1 minute ago',
      specializations: ['local_knowledge', 'community_sentiment', 'early_warning']
    },
    {
      id: 'node-004',
      name: 'Shopping Centers Security Hub',
      type: 'business',
      dataStreams: ['retail_security', 'customer_incidents', 'vehicle_tracking', 'crowd_analytics'],
      processingCapability: 'ai_enhanced',
      trustLevel: 91,
      realTimeFeeds: 156,
      lastActivity: '15 seconds ago',
      specializations: ['crowd_analysis', 'theft_prevention', 'vehicle_recognition']
    },
    {
      id: 'node-005',
      name: 'Religious & Educational Alliance',
      type: 'institutional',
      dataStreams: ['facility_monitoring', 'community_events', 'child_safety', 'gathering_intelligence'],
      processingCapability: 'advanced',
      trustLevel: 89,
      realTimeFeeds: 34,
      lastActivity: '45 seconds ago',
      specializations: ['child_protection', 'large_gatherings', 'community_welfare']
    },
    {
      id: 'node-006',
      name: 'Municipal Emergency Services',
      type: 'government',
      dataStreams: ['emergency_calls', 'traffic_monitoring', 'infrastructure_alerts', 'service_delivery'],
      processingCapability: 'advanced',
      trustLevel: 92,
      realTimeFeeds: 23,
      lastActivity: '3 minutes ago',
      specializations: ['emergency_coordination', 'infrastructure_monitoring', 'public_safety']
    }
  ];

  const threatIntelligence: ThreatIntelligence[] = [
    {
      id: 'intel-001',
      threatLevel: 'high',
      category: 'crime_pattern',
      description: 'Coordinated ATM skimming operations detected across 3 shopping centers',
      affectedAreas: ['Denlyn Mall', 'Silverton Plaza', 'Wonderpark Mall'],
      confidence: 87,
      sources: ['business_cameras', 'community_reports', 'police_intel'],
      timestamp: '12 minutes ago',
      actionRequired: true
    },
    {
      id: 'intel-002',
      threatLevel: 'medium',
      category: 'suspicious_behavior',
      description: 'Increased loitering near school zones during dismissal hours',
      affectedAreas: ['Mamelodi High School', 'Eersterust Primary'],
      confidence: 73,
      sources: ['school_security', 'community_watch'],
      timestamp: '25 minutes ago',
      actionRequired: true
    },
    {
      id: 'intel-003',
      threatLevel: 'critical',
      category: 'vehicle_tracking',
      description: 'Stolen vehicle involved in multiple crimes spotted in area',
      affectedAreas: ['Entire network coverage area'],
      confidence: 95,
      sources: ['police_database', 'anpr_cameras', 'community_alerts'],
      timestamp: '8 minutes ago',
      actionRequired: true
    }
  ];

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'government': return <Shield className="h-5 w-5 text-blue-600" />;
      case 'private_security': return <Radio className="h-5 w-5 text-red-600" />;
      case 'community': return <Users className="h-5 w-5 text-green-600" />;
      case 'business': return <Target className="h-5 w-5 text-purple-600" />;
      case 'institutional': return <Globe className="h-5 w-5 text-orange-600" />;
      default: return <Network className="h-5 w-5" />;
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getProcessingBadge = (capability: string) => {
    switch (capability) {
      case 'ai_enhanced': return <Badge className="bg-purple-500 text-white">AI Enhanced</Badge>;
      case 'advanced': return <Badge className="bg-blue-500 text-white">Advanced</Badge>;
      case 'basic': return <Badge variant="outline">Basic</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const calculateNetworkHealth = () => {
    const avgTrust = intelligenceNodes.reduce((sum, node) => sum + node.trustLevel, 0) / intelligenceNodes.length;
    const totalFeeds = intelligenceNodes.reduce((sum, node) => sum + node.realTimeFeeds, 0);
    const aiNodes = intelligenceNodes.filter(node => node.processingCapability === 'ai_enhanced').length;
    
    return { avgTrust: Math.round(avgTrust), totalFeeds, aiNodes };
  };

  const networkHealth = calculateNetworkHealth();

  const handleIntelAction = (action: string, intelId: string) => {
    toast({
      title: `${action} initiated`,
      description: `Intelligence report ${intelId} processed`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Intelligence Network Header */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Distributed Intelligence Network Hub
            <Badge className="bg-purple-500 text-white animate-pulse">AI ACTIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-purple-500/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{intelligenceNodes.length}</div>
              <div className="text-sm text-muted-foreground">Intelligence Nodes</div>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{networkHealth.totalFeeds}</div>
              <div className="text-sm text-muted-foreground">Live Data Streams</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{networkHealth.avgTrust}%</div>
              <div className="text-sm text-muted-foreground">Network Trust Score</div>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{networkHealth.aiNodes}</div>
              <div className="text-sm text-muted-foreground">AI Processing Nodes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="intelligence" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Threat Intel
          </TabsTrigger>
          <TabsTrigger value="nodes" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network Nodes
          </TabsTrigger>
          <TabsTrigger value="fusion" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Data Fusion
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        {/* Threat Intelligence */}
        <TabsContent value="intelligence">
          <div className="space-y-6">
            {/* Active Threats */}
            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Active Threat Intelligence
                  <Badge className="bg-red-500 text-white">
                    {threatIntelligence.filter(t => t.actionRequired).length} Requiring Action
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatIntelligence.map((intel) => (
                    <Card key={intel.id} className={`border-l-4 ${
                      intel.threatLevel === 'critical' ? 'border-l-red-500 bg-red-500/5' :
                      intel.threatLevel === 'high' ? 'border-l-orange-500 bg-orange-500/5' :
                      intel.threatLevel === 'medium' ? 'border-l-yellow-500 bg-yellow-500/5' :
                      'border-l-green-500 bg-green-500/5'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getThreatLevelColor(intel.threatLevel)}>
                                {intel.threatLevel.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {intel.category.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{intel.timestamp}</span>
                            </div>
                            <h4 className="font-medium mb-2">{intel.description}</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Affected Areas:</span>
                                <div className="flex flex-wrap gap-1">
                                  {intel.affectedAreas.map((area) => (
                                    <Badge key={area} variant="outline" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div>Confidence: <span className="font-medium">{intel.confidence}%</span></div>
                                <div>Sources: <span className="font-medium">{intel.sources.length}</span></div>
                              </div>
                            </div>
                          </div>
                          {intel.actionRequired && (
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleIntelAction('Escalate', intel.id)}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Escalate
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleIntelAction('Investigate', intel.id)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Investigate
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Intelligence Sources */}
            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Cross-Reference Intelligence Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Visual Intelligence</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-500 mb-1">156</div>
                    <div className="text-sm text-muted-foreground">Active camera feeds</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-green-500/5 to-blue-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Human Intelligence</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500 mb-1">47</div>
                    <div className="text-sm text-muted-foreground">Community reporters</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">AI Analytics</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-500 mb-1">24/7</div>
                    <div className="text-sm text-muted-foreground">Automated analysis</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Intelligence Nodes */}
        <TabsContent value="nodes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {intelligenceNodes.map((node) => (
              <Card key={node.id} className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getNodeTypeIcon(node.type)}
                      <div>
                        <CardTitle className="text-lg">{node.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {node.type.replace('_', ' ')} Node
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{node.trustLevel}%</div>
                      <div className="text-xs text-muted-foreground">Trust Level</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Processing Capability */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Processing:</span>
                    {getProcessingBadge(node.processingCapability)}
                  </div>

                  {/* Real-time Feeds */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Live Feeds</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-500">{node.realTimeFeeds}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                  </div>

                  {/* Data Streams */}
                  <div>
                    <div className="text-sm font-medium mb-2">Data Streams</div>
                    <div className="flex flex-wrap gap-1">
                      {node.dataStreams.slice(0, 3).map((stream) => (
                        <Badge key={stream} variant="outline" className="text-xs">
                          {stream.replace('_', ' ')}
                        </Badge>
                      ))}
                      {node.dataStreams.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{node.dataStreams.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <div className="text-sm font-medium mb-2">Specializations</div>
                    <div className="flex flex-wrap gap-1">
                      {node.specializations.map((spec) => (
                        <Badge key={spec} className="bg-purple-500/10 text-purple-700 text-xs">
                          {spec.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Monitor
                    </Button>
                    <Button size="sm" className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20">
                      <Brain className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  </div>

                  {/* Last Activity */}
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Last activity: {node.lastActivity}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Data Fusion */}
        <TabsContent value="fusion">
          <div className="space-y-6">
            {/* Fusion Process */}
            <Card className="border-gradient-to-r from-purple-500/20 to-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-500" />
                  Multi-Source Data Fusion Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-blue-500/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">📊</div>
                      <h4 className="font-medium mb-2">Data Collection</h4>
                      <p className="text-sm text-muted-foreground">
                        Aggregate data from {intelligenceNodes.length} intelligence nodes
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-500/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">🔀</div>
                      <h4 className="font-medium mb-2">Cross-Correlation</h4>
                      <p className="text-sm text-muted-foreground">
                        AI-powered pattern matching and relationship analysis
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-500/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">🎯</div>
                      <h4 className="font-medium mb-2">Actionable Intelligence</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate prioritized threat assessments and responses
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Fusion Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Fusion Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg bg-green-500/5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Pattern Match Confirmed</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vehicle seen at 3 crime scenes identified through cross-node analysis
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-yellow-500/5">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-sm">Anomaly Detected</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unusual crowd gathering pattern flagged by multiple sources
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-blue-500/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Intelligence Synthesis</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Crime trend prediction updated based on 156 data points
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-lg">Network Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                      <span className="text-sm font-medium">Data Processing Speed</span>
                      <span className="font-bold text-purple-600">2.3s avg</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                      <span className="text-sm font-medium">Cross-Reference Accuracy</span>
                      <span className="font-bold text-blue-600">94.7%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm font-medium">False Positive Rate</span>
                      <span className="font-bold text-green-600">3.1%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                      <span className="text-sm font-medium">Network Uptime</span>
                      <span className="font-bold text-orange-600">99.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Predictive Analytics */}
        <TabsContent value="predictions">
          <div className="space-y-6">
            <Card className="border-gradient-to-r from-green-500/20 to-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Predictive Crime Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">High Probability Events (Next 48h)</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg bg-red-500/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Vehicle Theft</span>
                          <Badge className="bg-red-500 text-white">87%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Shopping center parking areas</p>
                      </div>
                      
                      <div className="p-3 border rounded-lg bg-orange-500/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Pickpocketing</span>
                          <Badge className="bg-orange-500 text-white">73%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Taxi rank & ATM areas</p>
                      </div>
                      
                      <div className="p-3 border rounded-lg bg-yellow-500/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Public Disturbance</span>
                          <Badge className="bg-yellow-500 text-black">62%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Community gathering spaces</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Recommended Actions</h4>
                    <div className="space-y-3">
                      <Button className="w-full justify-start bg-blue-500 hover:bg-blue-600">
                        <Shield className="h-4 w-4 mr-2" />
                        Increase Patrols in High-Risk Areas
                      </Button>
                      <Button className="w-full justify-start bg-green-500 hover:bg-green-600">
                        <Eye className="h-4 w-4 mr-2" />
                        Deploy Additional Camera Coverage
                      </Button>
                      <Button className="w-full justify-start bg-purple-500 hover:bg-purple-600">
                        <Radio className="h-4 w-4 mr-2" />
                        Alert Community Watch Networks
                      </Button>
                      <Button className="w-full justify-start bg-orange-500 hover:bg-orange-600">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Notify Partner Security Teams
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};