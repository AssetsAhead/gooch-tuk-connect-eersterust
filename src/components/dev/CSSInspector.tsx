import { useState, useEffect, useCallback, useRef } from "react";
import { X, Search, Undo, Redo, Download, Eye, Copy, Palette, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface StyleProperty {
  property: string;
  value: string;
  inherited: boolean;
  specificity?: string;
  source?: string;
}

interface StyleChange {
  element: Element;
  property: string;
  oldValue: string;
  newValue: string;
}

export function CSSInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [computedStyles, setComputedStyles] = useState<StyleProperty[]>([]);
  const [cssVariables, setCssVariables] = useState<StyleProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [history, setHistory] = useState<StyleChange[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const overlayRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const styleCategories = {
    all: "All Styles",
    layout: "Layout",
    typography: "Typography",
    colors: "Colors",
    spacing: "Spacing",
    borders: "Borders",
    effects: "Effects"
  };

  const getCategoryForProperty = (prop: string): string => {
    if (prop.includes('display') || prop.includes('position') || prop.includes('flex') || 
        prop.includes('grid') || prop.includes('float') || prop.includes('overflow')) {
      return 'layout';
    }
    if (prop.includes('font') || prop.includes('text') || prop.includes('line-height') || 
        prop.includes('letter-spacing') || prop.includes('word')) {
      return 'typography';
    }
    if (prop.includes('color') || prop.includes('background') || prop.includes('fill') || 
        prop.includes('stroke')) {
      return 'colors';
    }
    if (prop.includes('margin') || prop.includes('padding') || prop.includes('gap') || 
        prop.includes('spacing')) {
      return 'spacing';
    }
    if (prop.includes('border') || prop.includes('outline') || prop.includes('radius')) {
      return 'borders';
    }
    if (prop.includes('shadow') || prop.includes('opacity') || prop.includes('transform') || 
        prop.includes('transition') || prop.includes('animation') || prop.includes('filter')) {
      return 'effects';
    }
    return 'all';
  };

  const getSpecificity = (element: Element, property: string): string => {
    // Simplified specificity calculation
    const matchedRules = Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules || []);
        } catch {
          return [];
        }
      })
      .filter((rule): rule is CSSStyleRule => rule.type === CSSRule.STYLE_RULE)
      .filter(rule => {
        try {
          return element.matches(rule.selectorText);
        } catch {
          return false;
        }
      })
      .filter(rule => rule.style.getPropertyValue(property));

    if (matchedRules.length === 0) return "0,0,0,0";

    // Calculate specificity for the most specific matching rule
    const lastRule = matchedRules[matchedRules.length - 1];
    const selector = lastRule.selectorText;
    
    const ids = (selector.match(/#[\w-]+/g) || []).length;
    const classes = (selector.match(/\.[\w-]+/g) || []).length;
    const attrs = (selector.match(/\[[\w-]+\]/g) || []).length;
    const pseudoClasses = (selector.match(/:[\w-]+/g) || []).length;
    const elements = (selector.match(/^[\w-]+|[\s>+~][\w-]+/g) || []).length;

    return `0,${ids},${classes + attrs + pseudoClasses},${elements}`;
  };

  const analyzeStyles = useCallback((element: Element) => {
    const computed = window.getComputedStyle(element);
    const styles: StyleProperty[] = [];
    const variables: StyleProperty[] = [];

    // Get all computed styles
    for (let i = 0; i < computed.length; i++) {
      const property = computed[i];
      const value = computed.getPropertyValue(property);

      if (property.startsWith('--')) {
        variables.push({
          property,
          value,
          inherited: false,
          specificity: getSpecificity(element, property)
        });
      } else {
        // Check if inherited
        const parent = element.parentElement;
        const isInherited = parent && 
          window.getComputedStyle(parent).getPropertyValue(property) === value;

        styles.push({
          property,
          value,
          inherited: !!isInherited,
          specificity: getSpecificity(element, property),
          source: element.getAttribute('class') || element.tagName.toLowerCase()
        });
      }
    }

    setComputedStyles(styles.sort((a, b) => a.property.localeCompare(b.property)));
    setCssVariables(variables.sort((a, b) => a.property.localeCompare(b.property)));
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isInspecting || !highlightRef.current) return;

    const target = e.target as Element;
    if (overlayRef.current?.contains(target)) return;

    const rect = target.getBoundingClientRect();
    const highlight = highlightRef.current;

    highlight.style.display = 'block';
    highlight.style.left = `${rect.left + window.scrollX}px`;
    highlight.style.top = `${rect.top + window.scrollY}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
  }, [isInspecting]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isInspecting) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target as Element;
    if (overlayRef.current?.contains(target)) return;

    setSelectedElement(target);
    analyzeStyles(target);
    setIsInspecting(false);
    
    if (highlightRef.current) {
      highlightRef.current.style.display = 'none';
    }

    toast({
      title: "Element Selected",
      description: `${target.tagName.toLowerCase()}${target.className ? '.' + target.className.split(' ').join('.') : ''}`,
    });
  }, [isInspecting, analyzeStyles]);

  useEffect(() => {
    if (isInspecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick, true);
      document.body.style.cursor = 'crosshair';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      document.body.style.cursor = '';
    };
  }, [isInspecting, handleMouseMove, handleClick]);

  const handleStyleEdit = (property: string, value: string) => {
    if (!selectedElement) return;

    const oldValue = (selectedElement as HTMLElement).style.getPropertyValue(property);
    (selectedElement as HTMLElement).style.setProperty(property, value);

    const change: StyleChange = {
      element: selectedElement,
      property,
      oldValue,
      newValue: value
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(change);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    analyzeStyles(selectedElement);
    setEditingProperty(null);
    setEditValue("");

    toast({
      title: "Style Updated",
      description: `${property}: ${value}`,
    });
  };

  const handleUndo = () => {
    if (historyIndex < 0) return;

    const change = history[historyIndex];
    (change.element as HTMLElement).style.setProperty(
      change.property,
      change.oldValue
    );

    setHistoryIndex(historyIndex - 1);
    if (selectedElement) analyzeStyles(selectedElement);

    toast({
      title: "Undo",
      description: `Reverted ${change.property}`,
    });
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;

    const change = history[historyIndex + 1];
    (change.element as HTMLElement).style.setProperty(
      change.property,
      change.newValue
    );

    setHistoryIndex(historyIndex + 1);
    if (selectedElement) analyzeStyles(selectedElement);

    toast({
      title: "Redo",
      description: `Applied ${change.property}`,
    });
  };

  const exportStyles = () => {
    if (!selectedElement) return;

    const selector = selectedElement.tagName.toLowerCase() + 
      (selectedElement.className ? '.' + selectedElement.className.split(' ').join('.') : '');

    const filteredStyles = computedStyles
      .filter(s => !s.inherited)
      .filter(s => searchTerm === "" || 
        s.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.value.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const css = `${selector} {\n${filteredStyles
      .map(s => `  ${s.property}: ${s.value};`)
      .join('\n')}\n}`;

    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'styles.css';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Styles Exported",
      description: "CSS file downloaded successfully",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Style copied to clipboard",
    });
  };

  const filteredStyles = computedStyles.filter(s => {
    const matchesSearch = searchTerm === "" || 
      s.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.value.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || 
      getCategoryForProperty(s.property) === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        size="icon"
      >
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Highlight overlay */}
      <div
        ref={highlightRef}
        className="fixed pointer-events-none z-[9998]"
        style={{
          display: 'none',
          border: '2px solid hsl(var(--primary))',
          backgroundColor: 'hsl(var(--primary) / 0.1)',
        }}
      />

      {/* Inspector panel */}
      <Card
        ref={overlayRef}
        className="fixed top-4 right-4 z-[9999] w-96 max-h-[90vh] bg-background/95 backdrop-blur-sm border shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">CSS Inspector</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsInspecting(!isInspecting)}
              variant={isInspecting ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isInspecting ? "Inspecting..." : "Inspect Element"}
            </Button>
            <Button
              onClick={handleUndo}
              disabled={historyIndex < 0}
              variant="outline"
              size="sm"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              variant="outline"
              size="sm"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              onClick={exportStyles}
              disabled={!selectedElement}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {selectedElement && (
            <div className="text-sm">
              <span className="font-mono text-primary">
                {selectedElement.tagName.toLowerCase()}
                {selectedElement.className && 
                  `.${selectedElement.className.split(' ').join('.')}`}
              </span>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(styleCategories).map(([key, label]) => (
              <Badge
                key={key}
                variant={filterCategory === key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilterCategory(key)}
              >
                {label}
              </Badge>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="computed" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="computed">
                Computed ({filteredStyles.length})
              </TabsTrigger>
              <TabsTrigger value="variables">
                Variables ({cssVariables.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="computed" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {filteredStyles.map((style, index) => (
                    <div
                      key={index}
                      className="p-2 rounded border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-primary">
                              {style.property}
                            </code>
                            {style.inherited && (
                              <Badge variant="secondary" className="text-xs">
                                inherited
                              </Badge>
                            )}
                          </div>
                          {editingProperty === style.property ? (
                            <Input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                if (editValue) {
                                  handleStyleEdit(style.property, editValue);
                                } else {
                                  setEditingProperty(null);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleStyleEdit(style.property, editValue);
                                } else if (e.key === 'Escape') {
                                  setEditingProperty(null);
                                  setEditValue("");
                                }
                              }}
                              className="mt-1 h-7 text-xs"
                            />
                          ) : (
                            <div
                              onClick={() => {
                                setEditingProperty(style.property);
                                setEditValue(style.value);
                              }}
                              className="text-xs text-muted-foreground font-mono cursor-pointer hover:text-foreground mt-1 break-all"
                            >
                              {style.value}
                            </div>
                          )}
                          {style.specificity && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Specificity: {style.specificity}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => copyToClipboard(`${style.property}: ${style.value};`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="variables" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {cssVariables.map((variable, index) => (
                    <div
                      key={index}
                      className="p-2 rounded border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <code className="text-xs font-mono text-primary">
                            {variable.property}
                          </code>
                          <div className="text-xs text-muted-foreground font-mono mt-1 break-all">
                            {variable.value}
                          </div>
                          {variable.specificity && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Specificity: {variable.specificity}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => copyToClipboard(`${variable.property}: ${variable.value};`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </>
  );
}
