import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Tablet, 
  Monitor,
  RotateCw,
  X,
  Minimize2,
  Maximize2,
  Split,
  Camera,
  Download,
  RefreshCw,
  Laptop
} from 'lucide-react';

interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: typeof Smartphone;
  category: 'phone' | 'tablet' | 'desktop';
  userAgent?: string;
}

const devicePresets: DevicePreset[] = [
  // Phones
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    icon: Smartphone,
    category: 'phone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    width: 375,
    height: 667,
    icon: Smartphone,
    category: 'phone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'samsung-s23',
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 800,
    icon: Smartphone,
    category: 'phone',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36'
  },
  {
    id: 'pixel-7',
    name: 'Google Pixel 7',
    width: 412,
    height: 915,
    icon: Smartphone,
    category: 'phone',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36'
  },
  // Tablets
  {
    id: 'ipad-pro-12',
    name: 'iPad Pro 12.9"',
    width: 1024,
    height: 1366,
    icon: Tablet,
    category: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    width: 820,
    height: 1180,
    icon: Tablet,
    category: 'tablet',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 'samsung-tab-s8',
    name: 'Samsung Tab S8',
    width: 800,
    height: 1280,
    icon: Tablet,
    category: 'tablet',
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-X700) AppleWebKit/537.36'
  },
  // Desktop
  {
    id: 'laptop',
    name: 'Laptop (1366x768)',
    width: 1366,
    height: 768,
    icon: Laptop,
    category: 'desktop'
  },
  {
    id: 'desktop-hd',
    name: 'Desktop HD (1920x1080)',
    width: 1920,
    height: 1080,
    icon: Monitor,
    category: 'desktop'
  },
  {
    id: 'desktop-4k',
    name: 'Desktop 4K (2560x1440)',
    width: 2560,
    height: 1440,
    icon: Monitor,
    category: 'desktop'
  }
];

export const ResponsiveDesignTester: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(devicePresets[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDevice, setComparisonDevice] = useState<DevicePreset>(devicePresets[4]);
  const [comparisonOrientation, setComparisonOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [zoom, setZoom] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const getDeviceDimensions = (device: DevicePreset, deviceOrientation: 'portrait' | 'landscape') => {
    if (deviceOrientation === 'landscape') {
      return { width: device.height, height: device.width };
    }
    return { width: device.width, height: device.height };
  };

  const toggleOrientation = useCallback(() => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  }, []);

  const toggleComparisonOrientation = useCallback(() => {
    setComparisonOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  }, []);

  const toggleComparisonMode = useCallback(() => {
    setComparisonMode(prev => !prev);
  }, []);

  const takeScreenshot = useCallback((deviceName: string) => {
    // In a real implementation, this would capture the iframe content
    console.log(`Taking screenshot of ${deviceName}`);
    // For now, we'll just show a message
    alert(`Screenshot functionality would capture the current view of ${deviceName}`);
  }, []);

  const refreshPreview = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const DeviceFrame: React.FC<{
    device: DevicePreset;
    deviceOrientation: 'portrait' | 'landscape';
    onOrientationToggle: () => void;
    onScreenshot: () => void;
    label?: string;
  }> = ({ device, deviceOrientation, onOrientationToggle, onScreenshot, label }) => {
    const dimensions = getDeviceDimensions(device, deviceOrientation);
    const scaledWidth = dimensions.width * zoom;
    const scaledHeight = dimensions.height * zoom;

    return (
      <div className="flex flex-col items-center gap-2">
        {/* Device Controls */}
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-2 rounded-lg border">
          <Badge variant="outline" className="text-xs">
            {dimensions.width} × {dimensions.height}
          </Badge>
          <Button size="sm" variant="ghost" onClick={onOrientationToggle}>
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onScreenshot}>
            <Camera className="h-3 w-3" />
          </Button>
          {label && (
            <Badge className="text-xs">{label}</Badge>
          )}
        </div>

        {/* Device Frame */}
        <div
          className="relative bg-gray-900 rounded-[2rem] p-3 shadow-2xl"
          style={{
            width: scaledWidth + 48,
            height: scaledHeight + 48
          }}
        >
          {/* Notch for phones */}
          {device.category === 'phone' && deviceOrientation === 'portrait' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10" />
          )}

          {/* Screen */}
          <div
            className="relative bg-white rounded-[1.5rem] overflow-hidden"
            style={{
              width: scaledWidth,
              height: scaledHeight
            }}
          >
            <iframe
              key={refreshKey}
              src={window.location.href}
              className="w-full h-full border-none"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left'
              }}
              title={`${device.name} Preview`}
            />
          </div>

          {/* Home indicator for phones */}
          {device.category === 'phone' && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
          )}
        </div>

        {/* Device Info */}
        <div className="text-center">
          <div className="font-semibold text-sm">{device.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {deviceOrientation} • {device.category}
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 z-[9999] rounded-full shadow-lg"
        size="icon"
        variant="secondary"
      >
        <Smartphone className="h-5 w-5" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-20 left-4 z-[9999] p-4 shadow-xl bg-background/95 backdrop-blur border-2">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Responsive Tester</span>
            <span className="text-xs text-muted-foreground">
              {selectedDevice.name} • {orientation}
            </span>
          </div>
          <div className="flex gap-1 ml-4">
            <Button size="icon" variant="ghost" onClick={toggleOrientation}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={toggleComparisonMode}>
              <Split className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsMinimized(false)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-[9998] bg-background/95 backdrop-blur">
      {/* Header */}
      <Card className="m-4 p-4 border-2 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Responsive Design Tester</h3>
              <p className="text-xs text-muted-foreground">
                Test your app across different devices and orientations
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={refreshPreview}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant={comparisonMode ? 'default' : 'outline'}
              onClick={toggleComparisonMode}
            >
              <Split className="h-4 w-4 mr-1" />
              Compare
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Zoom:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))}
              >
                -
              </Button>
              <span className="text-sm font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(prev => Math.min(2, prev + 0.25))}
              >
                +
              </Button>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <Button size="sm" variant="ghost" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Device Selector */}
      <Card className="mx-4 mb-4 p-4 border-2">
        <div className="space-y-3">
          {/* Phones */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Phones
            </h4>
            <div className="flex flex-wrap gap-2">
              {devicePresets.filter(d => d.category === 'phone').map(device => (
                <Button
                  key={device.id}
                  size="sm"
                  variant={selectedDevice.id === device.id && !comparisonMode ? 'default' : 'outline'}
                  onClick={() => setSelectedDevice(device)}
                  className="text-xs"
                >
                  {device.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tablets */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Tablet className="h-4 w-4" />
              Tablets
            </h4>
            <div className="flex flex-wrap gap-2">
              {devicePresets.filter(d => d.category === 'tablet').map(device => (
                <Button
                  key={device.id}
                  size="sm"
                  variant={selectedDevice.id === device.id && !comparisonMode ? 'default' : 'outline'}
                  onClick={() => setSelectedDevice(device)}
                  className="text-xs"
                >
                  {device.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Desktop */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </h4>
            <div className="flex flex-wrap gap-2">
              {devicePresets.filter(d => d.category === 'desktop').map(device => (
                <Button
                  key={device.id}
                  size="sm"
                  variant={selectedDevice.id === device.id && !comparisonMode ? 'default' : 'outline'}
                  onClick={() => setSelectedDevice(device)}
                  className="text-xs"
                >
                  {device.name}
                </Button>
              ))}
            </div>
          </div>

          {comparisonMode && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Split className="h-4 w-4" />
                  Comparison Device
                </h4>
                <div className="flex flex-wrap gap-2">
                  {devicePresets.map(device => (
                    <Button
                      key={device.id}
                      size="sm"
                      variant={comparisonDevice.id === device.id ? 'default' : 'outline'}
                      onClick={() => setComparisonDevice(device)}
                      className="text-xs"
                    >
                      {device.name}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Preview Area */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className={`flex ${comparisonMode ? 'gap-8' : 'justify-center'} p-8`}>
          <DeviceFrame
            device={selectedDevice}
            deviceOrientation={orientation}
            onOrientationToggle={toggleOrientation}
            onScreenshot={() => takeScreenshot(selectedDevice.name)}
            label={comparisonMode ? 'Device 1' : undefined}
          />
          
          {comparisonMode && (
            <DeviceFrame
              device={comparisonDevice}
              deviceOrientation={comparisonOrientation}
              onOrientationToggle={toggleComparisonOrientation}
              onScreenshot={() => takeScreenshot(comparisonDevice.name)}
              label="Device 2"
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
