import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Accessibility, 
  X, 
  Minimize2, 
  Maximize2,
  AlertTriangle,
  AlertCircle,
  Info,
  Play,
  Eye,
  Keyboard,
  Palette,
  Tag,
  Focus,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

type Severity = 'critical' | 'serious' | 'moderate' | 'minor';

interface A11yIssue {
  id: string;
  severity: Severity;
  category: 'contrast' | 'aria' | 'keyboard' | 'focus' | 'semantic' | 'forms';
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriterion: string;
  title: string;
  description: string;
  element?: HTMLElement;
  selector?: string;
  fix: string;
  codeExample?: string;
}

export const AccessibilityAuditor: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [issues, setIssues] = React.useState<A11yIssue[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);
  const [selectedIssue, setSelectedIssue] = React.useState<A11yIssue | null>(null);
  const [highlightedElement, setHighlightedElement] = React.useState<HTMLElement | null>(null);

  // Only run in development
  if (import.meta.env.MODE !== 'development') return null;

  const runAudit = React.useCallback(async () => {
    setIsScanning(true);
    const foundIssues: A11yIssue[] = [];

    try {
      // 1. Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.hasAttribute('alt')) {
          foundIssues.push({
            id: `img-alt-${index}`,
            severity: 'critical',
            category: 'semantic',
            wcagLevel: 'A',
            wcagCriterion: '1.1.1',
            title: 'Image missing alt text',
            description: 'Images must have alternative text for screen readers',
            element: img as HTMLElement,
            selector: `img[src="${img.src}"]`,
            fix: 'Add an alt attribute with a descriptive text',
            codeExample: `<img src="${img.src}" alt="Description of image" />`
          });
        } else if (img.alt === '' && img.role !== 'presentation') {
          foundIssues.push({
            id: `img-alt-empty-${index}`,
            severity: 'moderate',
            category: 'semantic',
            wcagLevel: 'A',
            wcagCriterion: '1.1.1',
            title: 'Image has empty alt text',
            description: 'Empty alt should only be used for decorative images',
            element: img as HTMLElement,
            selector: `img[src="${img.src}"]`,
            fix: 'Add descriptive alt text or role="presentation" for decorative images',
            codeExample: `<img src="${img.src}" alt="Description" />\n<!-- OR for decorative -->\n<img src="${img.src}" alt="" role="presentation" />`
          });
        }
      });

      // 2. Check for missing form labels
      const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
      inputs.forEach((input, index) => {
        const hasLabel = input.hasAttribute('aria-label') || 
                        input.hasAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${input.id}"]`);
        
        if (!hasLabel) {
          foundIssues.push({
            id: `input-label-${index}`,
            severity: 'critical',
            category: 'forms',
            wcagLevel: 'A',
            wcagCriterion: '3.3.2',
            title: 'Form input missing label',
            description: 'Form inputs must have associated labels',
            element: input as HTMLElement,
            selector: input.id ? `#${input.id}` : `input[type="${input.getAttribute('type')}"]`,
            fix: 'Add a <label> element or aria-label attribute',
            codeExample: `<label for="${input.id || 'input-id'}">\n  Label text\n</label>\n<input id="${input.id || 'input-id'}" ... />\n\n<!-- OR -->\n<input aria-label="Label text" ... />`
          });
        }
      });

      // 3. Check for buttons without accessible names
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach((button, index) => {
        const hasAccessibleName = button.textContent?.trim() || 
                                  button.hasAttribute('aria-label') ||
                                  button.hasAttribute('aria-labelledby');
        
        if (!hasAccessibleName) {
          foundIssues.push({
            id: `button-name-${index}`,
            severity: 'serious',
            category: 'aria',
            wcagLevel: 'A',
            wcagCriterion: '4.1.2',
            title: 'Button without accessible name',
            description: 'Buttons must have text content or aria-label',
            element: button as HTMLElement,
            selector: button.id ? `#${button.id}` : 'button',
            fix: 'Add text content or aria-label to the button',
            codeExample: `<button aria-label="Close">X</button>\n<!-- OR -->\n<button>Close</button>`
          });
        }
      });

      // 4. Check for missing landmark roles
      const hasMain = document.querySelector('main, [role="main"]');
      if (!hasMain) {
        foundIssues.push({
          id: 'missing-main',
          severity: 'serious',
          category: 'semantic',
          wcagLevel: 'AA',
          wcagCriterion: '1.3.1',
          title: 'Missing main landmark',
          description: 'Page should have a main landmark for primary content',
          fix: 'Wrap main content in <main> element or add role="main"',
          codeExample: `<main>\n  <!-- Primary page content -->\n</main>`
        });
      }

      // 5. Check for low contrast text
      const checkContrast = (element: Element) => {
        const computed = window.getComputedStyle(element);
        const bgColor = computed.backgroundColor;
        const color = computed.color;
        
        // Parse colors
        const parseRgb = (rgb: string) => {
          const match = rgb.match(/\d+/g);
          return match ? match.map(Number) : [0, 0, 0];
        };

        const bgRgb = parseRgb(bgColor);
        const fgRgb = parseRgb(color);

        // Calculate relative luminance
        const getLuminance = (rgb: number[]) => {
          const [r, g, b] = rgb.map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        const bgLum = getLuminance(bgRgb);
        const fgLum = getLuminance(fgRgb);

        const ratio = (Math.max(bgLum, fgLum) + 0.05) / (Math.min(bgLum, fgLum) + 0.05);
        
        const fontSize = parseFloat(computed.fontSize);
        const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 700;
        const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && isBold);

        const requiredRatio = isLargeText ? 3 : 4.5; // WCAG AA

        return { ratio, requiredRatio, passes: ratio >= requiredRatio };
      };

      const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6, li, td, th, label');
      textElements.forEach((element, index) => {
        if (element.textContent?.trim()) {
          const { ratio, requiredRatio, passes } = checkContrast(element);
          
          if (!passes && ratio > 1) { // ratio > 1 means there's actual contrast to measure
            foundIssues.push({
              id: `contrast-${index}`,
              severity: ratio < 3 ? 'critical' : 'serious',
              category: 'contrast',
              wcagLevel: 'AA',
              wcagCriterion: '1.4.3',
              title: 'Insufficient color contrast',
              description: `Contrast ratio ${ratio.toFixed(2)}:1 is below required ${requiredRatio}:1`,
              element: element as HTMLElement,
              selector: element.id ? `#${element.id}` : element.tagName.toLowerCase(),
              fix: 'Increase contrast between text and background colors',
              codeExample: `/* Ensure contrast ratio of at least ${requiredRatio}:1 */\n.element {\n  color: #000000; /* Darker text */\n  background: #FFFFFF; /* Lighter background */\n}`
            });
          }
        }
      });

      // 6. Check for keyboard navigation issues
      const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
      interactiveElements.forEach((element, index) => {
        const tabindex = element.getAttribute('tabindex');
        
        if (tabindex && parseInt(tabindex) > 0) {
          foundIssues.push({
            id: `tabindex-${index}`,
            severity: 'moderate',
            category: 'keyboard',
            wcagLevel: 'A',
            wcagCriterion: '2.1.1',
            title: 'Positive tabindex detected',
            description: 'Avoid positive tabindex values as they disrupt natural tab order',
            element: element as HTMLElement,
            selector: element.id ? `#${element.id}` : element.tagName.toLowerCase(),
            fix: 'Use tabindex="0" or remove tabindex and rely on natural DOM order',
            codeExample: `<!-- Remove positive tabindex -->\n<button tabindex="0">Button</button>`
          });
        }
      });

      // 7. Check for links with non-descriptive text
      const links = document.querySelectorAll('a');
      links.forEach((link, index) => {
        const text = link.textContent?.trim().toLowerCase();
        const nonDescriptive = ['click here', 'read more', 'here', 'more', 'link'];
        
        if (text && nonDescriptive.includes(text)) {
          foundIssues.push({
            id: `link-text-${index}`,
            severity: 'moderate',
            category: 'semantic',
            wcagLevel: 'A',
            wcagCriterion: '2.4.4',
            title: 'Link with non-descriptive text',
            description: `Link text "${text}" is not descriptive enough`,
            element: link as HTMLElement,
            selector: `a[href="${link.getAttribute('href')}"]`,
            fix: 'Use descriptive link text that explains the destination or purpose',
            codeExample: `<!-- Instead of -->\n<a href="/about">Click here</a>\n\n<!-- Use -->\n<a href="/about">Learn about our company</a>`
          });
        }
      });

      // 8. Check for missing language attribute
      const html = document.querySelector('html');
      if (!html?.hasAttribute('lang')) {
        foundIssues.push({
          id: 'missing-lang',
          severity: 'serious',
          category: 'semantic',
          wcagLevel: 'A',
          wcagCriterion: '3.1.1',
          title: 'Missing language attribute',
          description: 'HTML element must have a lang attribute',
          fix: 'Add lang attribute to <html> tag',
          codeExample: `<html lang="en">`
        });
      }

      // 9. Check for headings hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
      
      let lastLevel = 0;
      headingLevels.forEach((level, index) => {
        if (level - lastLevel > 1) {
          foundIssues.push({
            id: `heading-skip-${index}`,
            severity: 'moderate',
            category: 'semantic',
            wcagLevel: 'A',
            wcagCriterion: '1.3.1',
            title: 'Heading level skipped',
            description: `Heading levels should not be skipped (found h${level} after h${lastLevel})`,
            element: headings[index] as HTMLElement,
            fix: 'Use consecutive heading levels (h1 → h2 → h3)',
            codeExample: `<h${lastLevel + 1}>Correct heading level</h${lastLevel + 1}>`
          });
        }
        lastLevel = level;
      });

      // 10. Check for focus indicators
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex="0"]');
      focusableElements.forEach((element, index) => {
        const computed = window.getComputedStyle(element, ':focus');
        const hasFocusStyle = computed.outlineWidth !== '0px' || 
                             computed.outlineStyle !== 'none' ||
                             computed.boxShadow !== 'none';
        
        if (!hasFocusStyle) {
          foundIssues.push({
            id: `focus-indicator-${index}`,
            severity: 'serious',
            category: 'focus',
            wcagLevel: 'AA',
            wcagCriterion: '2.4.7',
            title: 'Missing focus indicator',
            description: 'Interactive elements must have a visible focus indicator',
            element: element as HTMLElement,
            fix: 'Add visible focus styles',
            codeExample: `/* Add focus styles */\n.element:focus {\n  outline: 2px solid #0066CC;\n  outline-offset: 2px;\n}\n\n/* Or use Tailwind */\n.element {\n  @apply focus:ring-2 focus:ring-primary;\n}`
          });
        }
      });

      setIssues(foundIssues);
      
      toast({
        title: "Accessibility audit complete",
        description: `Found ${foundIssues.length} issue${foundIssues.length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: "Audit failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }, []);

  const highlightElement = (element?: HTMLElement) => {
    // Remove previous highlight
    if (highlightedElement) {
      highlightedElement.style.outline = '';
      highlightedElement.style.outlineOffset = '';
    }

    if (element) {
      element.style.outline = '3px solid #ff0000';
      element.style.outlineOffset = '2px';
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedElement(element);
    } else {
      setHighlightedElement(null);
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'serious':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'moderate':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'minor':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'serious':
        return 'destructive';
      case 'moderate':
        return 'secondary';
      case 'minor':
        return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contrast':
        return <Palette className="h-3 w-3" />;
      case 'aria':
        return <Tag className="h-3 w-3" />;
      case 'keyboard':
        return <Keyboard className="h-3 w-3" />;
      case 'focus':
        return <Focus className="h-3 w-3" />;
      case 'forms':
        return <FileText className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const issuesByCategory = React.useMemo(() => {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.category]) {
        acc[issue.category] = [];
      }
      acc[issue.category].push(issue);
      return acc;
    }, {} as Record<string, A11yIssue[]>);
  }, [issues]);

  const issuesBySeverity = React.useMemo(() => {
    const critical = issues.filter(i => i.severity === 'critical');
    const serious = issues.filter(i => i.severity === 'serious');
    const moderate = issues.filter(i => i.severity === 'moderate');
    const minor = issues.filter(i => i.severity === 'minor');
    return { critical, serious, moderate, minor };
  }, [issues]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-[484px] right-4 z-[9998] rounded-full w-12 h-12 p-0"
        variant="outline"
        size="icon"
      >
        <Accessibility className="h-5 w-5" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 z-[9998] w-64">
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            <CardTitle className="text-sm">A11y Auditor</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {issues.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {issues.length}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Critical</div>
              <div className="font-bold text-red-500">{issuesBySeverity.critical.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total</div>
              <div className="font-bold">{issues.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-[9998] w-[900px] h-[650px] shadow-2xl flex flex-col">
      <CardHeader className="p-4 flex-shrink-0 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          <div>
            <CardTitle className="text-base">Accessibility Auditor</CardTitle>
            <CardDescription className="text-xs">
              WCAG compliance checker with actionable fixes
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="default"
            size="sm"
            onClick={runAudit}
            disabled={isScanning}
            className="h-7 text-xs"
          >
            {isScanning ? (
              <>
                <div className="animate-spin h-3 w-3 mr-1 border-2 border-current border-t-transparent rounded-full" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Run Audit
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-7 w-7 p-0"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-7 w-7 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      {/* Summary Stats */}
      {issues.length > 0 && (
        <div className="p-3 border-b bg-muted/30">
          <div className="grid grid-cols-5 gap-2">
            <Card className="p-2">
              <div className="text-xs text-muted-foreground">Total Issues</div>
              <div className="text-2xl font-bold">{issues.length}</div>
            </Card>
            <Card className="p-2 border-red-500/50 bg-red-500/5">
              <div className="text-xs text-red-600 dark:text-red-400">Critical</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {issuesBySeverity.critical.length}
              </div>
            </Card>
            <Card className="p-2 border-orange-500/50 bg-orange-500/5">
              <div className="text-xs text-orange-600 dark:text-orange-400">Serious</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {issuesBySeverity.serious.length}
              </div>
            </Card>
            <Card className="p-2 border-yellow-500/50 bg-yellow-500/5">
              <div className="text-xs text-yellow-600 dark:text-yellow-400">Moderate</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {issuesBySeverity.moderate.length}
              </div>
            </Card>
            <Card className="p-2 border-blue-500/50 bg-blue-500/5">
              <div className="text-xs text-blue-600 dark:text-blue-400">Minor</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {issuesBySeverity.minor.length}
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Issues List */}
        <div className="w-[450px] border-r flex flex-col">
          {issues.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <div className="text-sm font-medium mb-2">
                  {isScanning ? 'Scanning page...' : 'No audit run yet'}
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  Click "Run Audit" to scan for accessibility issues
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="all" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b h-9 flex-shrink-0">
                <TabsTrigger value="all" className="text-xs">
                  All
                  <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px]">
                    {issues.length}
                  </Badge>
                </TabsTrigger>
                {Object.entries(issuesByCategory).map(([category, items]) => (
                  <TabsTrigger key={category} value={category} className="text-xs capitalize">
                    {getCategoryIcon(category)}
                    <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                      {items.length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="m-0 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-2">
                    {issues.map(issue => (
                      <Card
                        key={issue.id}
                        className={cn(
                          "p-3 cursor-pointer transition-colors hover:bg-muted/50",
                          selectedIssue?.id === issue.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => {
                          setSelectedIssue(issue);
                          if (issue.element) {
                            highlightElement(issue.element);
                          }
                        }}
                      >
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1">{issue.title}</div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {issue.description}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityBadge(issue.severity)} className="text-[10px] h-4">
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] h-4">
                                WCAG {issue.wcagLevel} {issue.wcagCriterion}
                              </Badge>
                              {issue.element && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    highlightElement(issue.element);
                                  }}
                                  className="h-5 text-[10px] px-2"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Show
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {Object.entries(issuesByCategory).map(([category, items]) => (
                <TabsContent key={category} value={category} className="m-0 flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-2">
                      {items.map(issue => (
                        <Card
                          key={issue.id}
                          className={cn(
                            "p-3 cursor-pointer transition-colors hover:bg-muted/50",
                            selectedIssue?.id === issue.id && "border-primary bg-primary/5"
                          )}
                          onClick={() => {
                            setSelectedIssue(issue);
                            if (issue.element) {
                              highlightElement(issue.element);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-1">{issue.title}</div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {issue.description}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getSeverityBadge(issue.severity)} className="text-[10px] h-4">
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] h-4">
                                  WCAG {issue.wcagLevel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        {/* Issue Details */}
        <div className="flex-1 min-w-0">
          {!selectedIssue ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select an issue to view details and fixes
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Issue Header */}
                <Card>
                  <CardHeader className="p-3">
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(selectedIssue.severity)}
                      <div className="flex-1">
                        <CardTitle className="text-sm">{selectedIssue.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {selectedIssue.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityBadge(selectedIssue.severity)}>
                        {selectedIssue.severity}
                      </Badge>
                      <Badge variant="outline">
                        WCAG {selectedIssue.wcagLevel} - {selectedIssue.wcagCriterion}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedIssue.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Element Info */}
                {selectedIssue.selector && (
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Element</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="font-mono text-xs bg-muted p-2 rounded">
                        {selectedIssue.selector}
                      </div>
                      {selectedIssue.element && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => highlightElement(selectedIssue.element)}
                          className="mt-2 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Highlight Element
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* How to Fix */}
                <Card className="bg-green-500/5 border-green-500/50">
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm text-green-600 dark:text-green-400">
                      How to Fix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="text-xs mb-3">{selectedIssue.fix}</div>
                    {selectedIssue.codeExample && (
                      <div>
                        <div className="text-xs font-medium mb-1 text-green-600 dark:text-green-400">
                          Code Example:
                        </div>
                        <pre className="font-mono text-[10px] bg-muted p-2 rounded overflow-x-auto">
                          {selectedIssue.codeExample}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Resources */}
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Learn More</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2 text-xs">
                    <a
                      href={`https://www.w3.org/WAI/WCAG21/quickref/#${selectedIssue.wcagCriterion}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      → WCAG {selectedIssue.wcagCriterion} Guidelines
                    </a>
                    <a
                      href="https://www.w3.org/WAI/WCAG21/Understanding/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      → Understanding WCAG
                    </a>
                    <a
                      href="https://webaim.org/resources/contrastchecker/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      → WebAIM Contrast Checker
                    </a>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </Card>
  );
};
