import { useState, useEffect } from "react";
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
  Zap,
  Phone,
  MicIcon,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const EnhancedMultiLanguageAssistant = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState(true);
  const { toast } = useToast();

  const languages = [
    { code: "english", name: "English", native: "English", flag: "🇿🇦", voice: "Zulu accent" },
    { code: "zulu", name: "Zulu", native: "isiZulu", flag: "🇿🇦", voice: "Native speaker" },
    { code: "xhosa", name: "Xhosa", native: "isiXhosa", flag: "🇿🇦", voice: "Native speaker" },
    { code: "afrikaans", name: "Afrikaans", native: "Afrikaans", flag: "🇿🇦", voice: "Native speaker" },
    { code: "sotho", name: "Sotho", native: "Sesotho", flag: "🇿🇦", voice: "Native speaker" },
    { code: "tswana", name: "Tswana", native: "Setswana", flag: "🇿🇦", voice: "Native speaker" },
    { code: "sepedi", name: "Sepedi", native: "Sepedi", flag: "🇿🇦", voice: "Native speaker" },
    { code: "tsonga", name: "Tsonga", native: "Xitsonga", flag: "🇿🇦", voice: "Native speaker" }
  ];

  const localKnowledge = [
    {
      category: "Transport",
      icon: "🚌",
      questions: [
        "Where is the nearest taxi rank?",
        "What are the taxi fares to Mamelodi?",
        "When do taxis start running in the morning?",
        "Which route goes to Pretoria CBD?",
        "How much is a tuk-tuk ride to the clinic?"
      ]
    },
    {
      category: "Services",
      icon: "🏛️",
      questions: [
        "Where can I get help with documents?",
        "Which clinic is open on weekends?",
        "How do I apply for a business license?",
        "Where is the nearest SASSA office?",
        "When are pension payouts?"
      ]
    },
    {
      category: "Emergency", 
      icon: "🚨",
      questions: [
        "What are the emergency numbers?",
        "Where is the nearest police station?",
        "How do I report a crime?",
        "Where is the nearest hospital?",
        "Who do I call for ambulance?"
      ]
    },
    {
      category: "Shopping",
      icon: "🛒",
      questions: [
        "Which spaza shops are open now?",
        "Where can I buy fresh vegetables?",
        "Which shop has the best prices?",
        "Where can I buy airtime?",
        "Which shops offer credit?"
      ]
    }
  ];

  const culturalTips = [
    {
      title: "Taxi Etiquette",
      content: "Always greet the driver when entering. Pass money forward hand-to-hand. Let others exit first when it's not your stop. Use proper hand signals to stop a taxi.",
      language: "Multi-cultural",
      audio: true
    },
    {
      title: "Community Respect",
      content: "Address elders with respect titles like 'Mama' or 'Baba'. Ubuntu philosophy - 'I am because we are' guides community interactions. Help your neighbors.",
      language: "Traditional Values",
      audio: true
    },
    {
      title: "Business Culture",
      content: "Building relationships comes before business. Take time for personal conversations before discussing work. Trust is built over time through consistent behavior.",
      language: "Local Business",
      audio: true
    },
    {
      title: "Stokvel Customs",
      content: "Monthly contributions must be made on time. Attendance at meetings is important. Decisions are made collectively. Respect the rotating order.",
      language: "Financial Culture",
      audio: true
    }
  ];

  const voiceCommandsList = [
    { command: "Ngicela usizo", translation: "I need help", language: "Zulu" },
    { command: "Kukuphi isiteshi samaphoyisa?", translation: "Where is the police station?", language: "Zulu" },
    { command: "Ndifuna ukukhwela itaxi", translation: "I want to take a taxi", language: "Xhosa" },
    { command: "Waar is die naaste kliniek?", translation: "Where is the nearest clinic?", language: "Afrikaans" },
    { command: "Ke batla ho ya Mamelodi", translation: "I want to go to Mamelodi", language: "Sotho" }
  ];

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Voice Recognition Started",
        description: `Listening in ${languages.find(l => l.code === selectedLanguage)?.native}...`,
      });
      // Simulate voice recognition with contextual responses
      setTimeout(() => {
        const sampleQueries = [
          "Ngicela ukwazi ukuthi sikuphi isiteshi samaphoyisa?",
          "Where can I catch a taxi to Mamelodi?",
          "Waar is die naaste kliniek?",
          "Ke batla ho ya kae bakeng sa pension?"
        ];
        const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
        setQuery(randomQuery);
        setIsListening(false);
        handleAIQuery(randomQuery);
      }, 3000);
    }
  };

  const handleAIQuery = (customQuery?: string) => {
    const currentQuery = customQuery || query;
    const responses: { [key: string]: string } = {
      english: `Based on your location in Eersterust, the nearest police station is Eersterust SAPS on Hinterland Road, about 2km from here. They are open 24/7. For emergencies call 10111. The community watch patrol also covers this area from 6pm-10pm daily.`,
      zulu: `Ngokwendawo yakho e-Eersterust, isiteshi samaphoyisa esiseduze kakhulu yi-Eersterust SAPS eHinterland Road, cishe ama-2km ukusuka lapha. Sivulekile usuku nosuku. Ezimeni eziphakamisayo shayela 10111. Abantu bakuleli bendawo baphinde bahlole ukuphepha kusukela ngo-6pm kuya ku-10pm nsuku zonke.`,
      xhosa: `Ngokwendawo yakho e-Eersterust, isitishi samapolisa esikufutshane yi-Eersterust SAPS eHinterland Road, malunga neekholometer ezi-2 ukusuka apha. Sivulekile ubusuku nemini. Kwiimeko zongxamiseko biza u-10111. Abakwakuloo mmandla nabo bakhangela ukhuseleko ukusuka ngo-6pm ukuya ku-10pm yonke imihla.`,
      afrikaans: `Gebaseer op jou ligging in Eersterust, is die naaste polisiestasie Eersterust SAPS in Hinterlandweg, ongeveer 2km van hier af. Hulle is 24/7 oop. Vir noodgevalle bel 10111. Die gemeenskapswag patrolleer ook hierdie area van 6nm-10nm daagliks.`
    };

    const response = responses[selectedLanguage] || responses.english;
    setCurrentMessage(response);
    toast({
      title: "AI Response Ready",
      description: "Answer provided with local context in your selected language",
    });
  };

  const handleTextToSpeech = (text: string) => {
    setIsPlaying(true);
    toast({
      title: "Speaking...",
      description: `Playing audio in ${languages.find(l => l.code === selectedLanguage)?.native} with ${languages.find(l => l.code === selectedLanguage)?.voice}`,
    });
    
    // Simulate speech duration
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const handleQuickQuestion = (question: string) => {
    setQuery(question);
    handleAIQuery(question);
  };

  return (
    <Card className="border-tuk-blue/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-6 w-6 mr-2 text-tuk-blue" />
          Enhanced Multi-Language AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="w-full overflow-x-auto flex justify-start md:grid md:grid-cols-4">
            <TabsTrigger value="chat" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">💬</span>
              <span className="hidden sm:inline">Voice Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">🧠</span>
              <span className="hidden sm:inline">Local Knowledge</span>
              <span className="sm:hidden">Knowledge</span>
            </TabsTrigger>
            <TabsTrigger value="culture" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">🏛️</span>
              <span className="hidden sm:inline">Cultural Guide</span>
              <span className="sm:hidden">Culture</span>
            </TabsTrigger>
            <TabsTrigger value="commands" className="whitespace-nowrap flex-shrink-0">
              <span className="mr-1">🗣️</span>
              <span className="hidden sm:inline">Voice Commands</span>
              <span className="sm:hidden">Commands</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            {/* Language Selection with Voice Support */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Select Your Language & Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      className={`h-auto p-3 ${selectedLanguage === lang.code ? "bg-primary ring-2 ring-primary/20" : ""}`}
                      onClick={() => setSelectedLanguage(lang.code)}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{lang.flag}</div>
                        <div className="text-sm font-medium">{lang.native}</div>
                        <div className="text-xs text-muted-foreground">{lang.voice}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Voice Assistant */}
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-warning" />
                  Voice Assistant with Township Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Button
                        onClick={handleVoiceInput}
                        className={`flex-1 ${isListening ? "bg-danger hover:bg-danger/90 animate-pulse" : "bg-warning hover:bg-warning/90"} text-black`}
                      >
                        <Mic className={`h-4 w-4 mr-2 ${isListening ? "animate-pulse" : ""}`} />
                        {isListening ? "Stop Listening" : "Start Voice Input"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVoiceCommands(!voiceCommands)}
                      >
                        {voiceCommands ? <VolumeX className="h-4 w-4" /> : <MicIcon className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Say things like: "Where is the clinic?", "How much is taxi to town?", "What time do spaza shops close?"
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Quick Voice Commands</div>
                    <div className="space-y-1">
                      {voiceCommandsList.slice(0, 3).map((cmd, idx) => (
                        <div key={idx} className="p-2 bg-muted/30 rounded text-xs">
                          <div className="font-medium">{cmd.command}</div>
                          <div className="text-muted-foreground">{cmd.translation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Chat Interface */}
            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-success" />
                  AI Chat with Township Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={
                    selectedLanguage === "zulu" ? "Buza umbuzo wakho lapha (Ngayaphi ekiliniki?)..." :
                    selectedLanguage === "xhosa" ? "Buza umbuzo wakho apha (Yeyiphi indlela eya eMamelodi?)..." :
                    selectedLanguage === "afrikaans" ? "Vra jou vraag hier (Waar is die taxi rank?)..." :
                    "Ask about local transport, services, shops, or safety..."
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-20"
                />
                
                {currentMessage && (
                  <Card className="bg-muted p-4 border-l-4 border-l-primary">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="text-sm">{currentMessage}</p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTextToSpeech(currentMessage)}
                            disabled={isPlaying}
                          >
                            {isPlaying ? <VolumeX className="h-3 w-3 mr-1" /> : <Volume2 className="h-3 w-3 mr-1" />}
                            {isPlaying ? "Playing..." : "Listen"}
                          </Button>
                          <Badge variant="outline" className="text-xs">
                            {languages.find(l => l.code === selectedLanguage)?.native}
                          </Badge>
                          <Badge className="bg-success text-white text-xs">
                            Township Context
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
                
                <Button 
                  onClick={() => handleAIQuery()}
                  className="w-full bg-success hover:bg-success/90"
                  disabled={!query.trim()}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Get Local AI Answer
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
                      <span className="mr-2">{section.icon}</span>
                      {section.category} Knowledge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {section.questions.map((question, qIndex) => (
                        <Button
                          key={qIndex}
                          variant="outline"
                          className="text-left justify-start h-auto p-3 hover:bg-primary/10"
                          onClick={() => handleQuickQuestion(question)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">{question}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Township Knowledge */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Eersterust Area Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-bold mb-2 text-success">Key Locations</h4>
                    <div className="space-y-1 text-sm">
                      <div>🏥 Eersterust Clinic - Main Road (24h emergency)</div>
                      <div>🏪 Shoprite Eersterust - Shopping Center (8am-8pm)</div>
                      <div>⛽ BP Garage - Corner Main & Church (24h)</div>
                      <div>🏦 First National Bank - Mall (9am-4pm)</div>
                      <div>📮 Post Office - Government Complex (8am-4:30pm)</div>
                      <div>🚌 Main Taxi Rank - Church Street (5am-10pm)</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-warning">Transport Routes & Prices</h4>
                    <div className="space-y-1 text-sm">
                      <div>🚌 To Pretoria CBD - R15 (R25 after 7pm)</div>
                      <div>🚌 To Mamelodi - R12 (R20 after 7pm)</div>
                      <div>🚌 To Silverton - R10 (R15 after 7pm)</div>
                      <div>🚌 Internal Poort - R8 (R12 after 7pm)</div>
                      <div>🛺 Tuk-tuk short distance - R5-R10</div>
                      <div>🛺 Tuk-tuk to clinic - R8-R12</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-danger">Emergency Info</h4>
                    <div className="space-y-1 text-sm">
                      <div>🚨 Police: 10111 (Eersterust SAPS)</div>
                      <div>🚑 Ambulance: 10177</div>
                      <div>🔥 Fire: 10177</div>
                      <div>⚡ Electricity: 0860 562 874</div>
                      <div>💧 Water: 012 358 7911</div>
                      <div>🛡️ Community Watch: 084 123 4567</div>
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
                      <div className="flex gap-2">
                        {tip.audio && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTextToSpeech(tip.content)}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Listen
                          </Button>
                        )}
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                          📱 Learn More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="commands" className="space-y-4">
            <Card className="border-tuk-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-tuk-blue" />
                  Voice Commands by Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {voiceCommandsList.map((cmd, index) => (
                    <Card key={index} className="border-muted/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-primary">{cmd.command}</div>
                            <div className="text-sm text-muted-foreground">{cmd.translation}</div>
                            <Badge variant="outline" className="text-xs mt-1">{cmd.language}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setQuery(cmd.command)}
                            >
                              🎤 Try This
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-tuk-blue hover:bg-tuk-blue/90"
                              onClick={() => handleTextToSpeech(cmd.command)}
                            >
                              🔊 Hear It
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};