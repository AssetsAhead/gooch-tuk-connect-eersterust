import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFacialClocking, VerificationMethod } from '@/hooks/useFacialClocking';
import { ShieldCheck, Clock, UserCheck, History, Fingerprint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClockingMethodSelector } from './ClockingMethodSelector';
import { FacialClockingPanel } from './FacialClockingPanel';
import { PinClockingPanel } from './PinClockingPanel';
import { QRClockingPanel } from './QRClockingPanel';
import { MarshalClockingPanel } from './MarshalClockingPanel';
import { RegistrationPanel } from './RegistrationPanel';
import { ClockingHistory } from './ClockingHistory';
import { ClockingTypeSelector } from './ClockingTypeSelector';
import { VerificationResult } from './VerificationResult';

const FacialClockingSystem = () => {
  const hook = useFacialClocking();
  const [activeTab, setActiveTab] = useState('clock');
  const [method, setMethod] = useState<VerificationMethod>('pin');
  const [selectedType, setSelectedType] = useState<'shift_start' | 'shift_end' | 'trip_start' | 'trip_end'>('shift_start');

  useEffect(() => {
    hook.checkRegistration();
    hook.fetchClockings();
  }, [hook.checkRegistration, hook.fetchClockings]);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Driver Clocking System
          </CardTitle>
          <CardDescription>
            Clock in/out using your preferred method. Facial recognition earns bonus reputation points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clock">
                <Clock className="h-4 w-4 mr-1" /> Clock
              </TabsTrigger>
              <TabsTrigger value="register">
                <Fingerprint className="h-4 w-4 mr-1" /> Setup
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-1" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clock" className="mt-4 space-y-4">
              <ClockingMethodSelector selected={method} onSelect={setMethod} />
              <ClockingTypeSelector selected={selectedType} onSelect={setSelectedType} disabled={hook.isProcessing} />

              {method === 'facial' && (
                <FacialClockingPanel
                  isProcessing={hook.isProcessing}
                  hasRegistration={!!hook.registration}
                  selectedType={selectedType}
                  onClock={hook.clockIn}
                  onGoRegister={() => setActiveTab('register')}
                />
              )}
              {method === 'pin' && (
                <PinClockingPanel
                  isProcessing={hook.isProcessing}
                  hasPin={!!hook.registration?.clocking_pin}
                  selectedType={selectedType}
                  onClock={hook.clockWithPin}
                  onGoSetup={() => setActiveTab('register')}
                />
              )}
              {method === 'qr' && (
                <QRClockingPanel
                  isProcessing={hook.isProcessing}
                  selectedType={selectedType}
                  onClock={hook.clockWithQR}
                />
              )}
              {method === 'marshal' && (
                <MarshalClockingPanel
                  isProcessing={hook.isProcessing}
                  selectedType={selectedType}
                  onClock={hook.clockWithMarshal}
                />
              )}

              {hook.lastResult && <VerificationResult result={hook.lastResult} />}
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <RegistrationPanel
                registration={hook.registration}
                isProcessing={hook.isProcessing}
                onRegisterFace={hook.registerFace}
                onSetPin={hook.setPin}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ClockingHistory clockings={hook.clockings} onRefresh={hook.fetchClockings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacialClockingSystem;
