import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Mic, 
  Volume2, 
  Globe, 
  BookOpen,
  MapPin,
  Users,
  Star,
  Brain,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const MultiLanguageAssistant = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const { toast } = useToast();

  const languages = [
    { code: "english", name: "English", native: "English", flag: "🇿🇦" },
    { code: "zulu", name: "Zulu", native: "isiZulu", flag: "🇿🇦" },
    { code: "xhosa", name: "Xhosa", native: "isiXhosa", flag: "🇿🇦" },
    { code: "afrikaans", name: "Afrikaans", native: "Afrikaans", flag: "🇿🇦" },
    { code: "sotho", name: "Sotho", native: "Sesotho", flag: "🇿🇦" },
    { code: "tswana", name: "Tswana", native: "Setswana", flag: "🇿🇦" },
    { code: "sepedi", name: "Sepedi", native: "Sepedi", flag: "🇿🇦" },
    { code: "tsonga", name: "Tsonga", native: "Xitsonga", flag: "🇿🇦" }
  ];

  const localKnowledge = [
    {
      category: "Transport",
      questions: [
        "Where is the nearest taxi rank?",
        "What are the taxi fares to Mamelodi?",
        "When do taxis start running in the morning?"
      ]
    },
    {
      category: "Services",
      questions: [
        "Where can I get help with documents?",
        "Which clinic is open on weekends?",
        "How do I apply for a business license?"
      ]
    },
    {
      category: "Emergency", 
      questions: [
        "What are the emergency numbers?",
        "Where is the nearest police station?",
        "How do I report a crime?"
      ]
    }
  ];

  const culturalTips = [
    {
      title: "Taxi Etiquette",
      content: "Always greet the driver when entering. Pass money forward hand-to-hand. Let others exit first when it's not your stop.",
      language: "Multi-cultural"
    },
    {
      title: "Community Respect",
      content: "Address elders with respect titles. Ubuntu philosophy - 'I am because we are' guides community interactions.",
      language: "Traditional Values"
    },
    {
      title: "Business Culture",
      content: "Building relationships comes before business. Take time for personal conversations before discussing work.",
      language: "Local Business"
    }
  ];

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Voice Recognition Started",
        description: `Listening in ${languages.find(l => l.code === selectedLanguage)?.native}...`,
      });
      // Simulate voice recognition
      setTimeout(() => {
        setQuery("Ngicela ukwazi ukuthi sikuphi isiteshi samaphoyisa?");
        setIsListening(false);
      }, 3000);
    }
  };

  const handleAIQuery = () => {
    const responses: { [key: string]: string } = {
      english: "The nearest police station is Eersterust SAPS on Hinterland Road, about 2km from here. They are open 24/7 and you can also call 10111 for emergencies.",
      zulu: "Isiteshi samaphoyisa esiseduze kakhulu yi-Eersterust SAPS eHinterland Road, cishe ama-2km ukusuka lapha. Bavulekile usuku nosuku futhi ungashayela 10111 ezimeni eziphakamisayo.",
      xhosa: "Isitishi samapolisa esikufutshane yi-Eersterust SAPS eHinterland Road, malunga neekholometer ezi-2 ukusuka apha. Bavulekile ubusuku nemini kwaye unokubiza 10111 kwiimeko zongxamiseko.",
      afrikaans: "Die naaste polisiestasie is Eersterust SAPS in Hinterlandweg, ongeveer 2km van hier af. Hulle is 24/7 oop en jy kan ook 10111 bel vir noodgevalle."
    };

    setCurrentMessage(responses[selectedLanguage] || responses.english);
    toast({
      title: "AI Response Ready",
      description: "Answer provided in your selected language",
    });
  };

  const handleTextToSpeech = (text: string) => {
    toast({
      title: "Speaking...",
      description: `Playing audio in ${languages.find(l => l.code === selectedLanguage)?.native}`,
    });
  };

  return (
    <Card className="border-tuk-blue/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-6 w-6 mr-2 text-tuk-blue" />
          Multi-Language AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">💬 Chat</TabsTrigger>
            <TabsTrigger value="knowledge">🧠 Local Knowledge</TabsTrigger>
            <TabsTrigger value="culture">🏛️ Cultural Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            {/* Language Selection */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Select Your Language</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      className={`h-auto p-3 ${selectedLanguage === lang.code ? "bg-primary" : ""}`}
                      onClick={() => setSelectedLanguage(lang.code)}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{lang.flag}</div>
                        <div className="text-sm font-medium">{lang.native}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Voice Input */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-warning" />
                  Voice Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleVoiceInput}
                    className={`flex-1 ${isListening ? "bg-danger hover:bg-danger/90" : "bg-warning hover:bg-warning/90"} text-black`}
                  >
                    <Mic className={`h-4 w-4 mr-2 ${isListening ? "animate-pulse" : ""}`} />
                    {isListening ? "Stop Listening" : "Start Voice Input"}
                  </Button>
                  {currentMessage && (
                    <Button 
                      onClick={() => handleTextToSpeech(currentMessage)}
                      variant="outline"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Speak
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-success" />
                  AI Chat in {languages.find(l => l.code === selectedLanguage)?.native}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={
                    selectedLanguage === "zulu" ? "Buza umbuzo wakho lapha..." :
                    selectedLanguage === "xhosa" ? "Buza umbuzo wakho apha..." :
                    selectedLanguage === "afrikaans" ? "Vra jou vraag hier..." :
                    "Ask your question here..."
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-20"
                />
                
                {currentMessage && (
                  <Card className="bg-muted p-4">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="text-sm">{currentMessage}</p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTextToSpeech(currentMessage)}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Speak
                          </Button>
                          <Badge variant="outline" className="text-xs">
                            {languages.find(l => l.code === selectedLanguage)?.native}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
                
                <Button 
                  onClick={handleAIQuery}
                  className="w-full bg-success hover:bg-success/90"
                  disabled={!query.trim()}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Get AI Answer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <div className="grid gap-4">
              {localKnowledge.map((section, index) => (
                <Card key={index} className="border-tuk-orange/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-tuk-orange" />
                      {section.category} Knowledge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.questions.map((question, qIndex) => (
                        <Button
                          key={qIndex}
                          variant="outline"
                          className="w-full text-left justify-start h-auto p-3"
                          onClick={() => {
                            setQuery(question);
                            handleAIQuery();
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                          {question}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Township-Specific Knowledge */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Eersterust Area Knowledge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Key Locations</h4>
                    <div className="space-y-1 text-sm">
                      <div>🏥 Eersterust Clinic - Main Road</div>
                      <div>🏪 Shoprite Eersterust - Shopping Center</div>
                      <div>⛽ BP Garage - Corner Main & Church</div>
                      <div>🏦 First National Bank - Mall</div>
                      <div>📮 Post Office - Government Complex</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Transport Routes</h4>
                    <div className="space-y-1 text-sm">
                      <div>🚌 To Pretoria CBD - R15 (R25 after 7pm)</div>
                      <div>🚌 To Mamelodi - R12 (R20 after 7pm)</div>
                      <div>🚌 To Silverton - R10 (R15 after 7pm)</div>
                      <div>🚌 Internal Poort - R8 (R12 after 7pm)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="culture" className="space-y-4">
            <div className="grid gap-4">
              {culturalTips.map((tip, index) => (
                <Card key={index} className="border-secondary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-5 w-5 mr-2 text-secondary" />
                      {tip.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{tip.content}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{tip.language}</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTextToSpeech(tip.content)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Listen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Common Phrases */}
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-tuk-blue" />
                  Essential Phrases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Zulu Basics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Hello</span>
                        <span className="font-medium">Sawubona</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thank you</span>
                        <span className="font-medium">Ngiyabonga</span>
                      </div>
                      <div className="flex justify-between">
                        <span>How much?</span>
                        <span className="font-medium">Malini?</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Help me</span>
                        <span className="font-medium">Ngisiza</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Taxi Terms</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Stop here</span>
                        <span className="font-medium">Misa lapha</span>
                      </div>
                      <div className="flex justify-between">
                        <span>How much to...?</span>
                        <span className="font-medium">Malini ukuya...?</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Short left</span>
                        <span className="font-medium">Sot leff</span>
                      </div>
                      <div className="flex justify-between">
                        <span>After robot</span>
                        <span className="font-medium">Ngemva kwe-robot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};