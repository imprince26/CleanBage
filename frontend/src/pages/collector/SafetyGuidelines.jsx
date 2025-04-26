import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  import { Separator } from "@/components/ui/separator";
  import { Button } from "@/components/ui/button";
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  import {
    Shield,
    AlertTriangle,
    HardHat,
    Martini,
    Cigarette,
    BadgeAlert,
    Truck,
    Sun,
    CloudRain,
    Waves,
    Footprints,
    Pointer,
    FileWarning,
    CheckCircle2,
  } from "lucide-react";
  
  const SafetyGuidelines = () => {
    const guidelines = [
      {
        category: "Personal Protective Equipment (PPE)",
        icon: HardHat,
        items: [
          "Always wear provided safety gloves when handling waste",
          "Use safety boots with non-slip soles",
          "Wear high-visibility clothing during collection duties",
          "Use face masks when handling potentially hazardous waste",
          "Wear safety goggles when required",
        ],
      },
      {
        category: "Prohibited Activities",
        icon: Martini,
        items: [
          "No smoking while handling waste materials",
          "No consumption of alcohol or drugs before or during work",
          "No use of mobile phones while driving collection vehicles",
          "No removal of waste without proper authorization",
        ],
      },
      {
        category: "Vehicle Safety",
        icon: Truck,
        items: [
          "Perform daily vehicle safety checks before starting routes",
          "Follow all traffic rules and speed limits",
          "Park safely when collecting waste",
          "Ensure all waste is properly secured before transport",
          "Report any vehicle issues immediately",
        ],
      },
      {
        category: "Weather Conditions",
        icon: Sun,
        items: [
          "Take extra breaks during extreme heat",
          "Use sunscreen and stay hydrated",
          "Be cautious on wet or slippery surfaces",
          "Follow special procedures during severe weather",
          "Adjust collection schedule if necessary for safety",
        ],
      },
      {
        category: "Waste Handling",
        icon: BadgeAlert,
        items: [
          "Check waste types before collection",
          "Never handle unmarked hazardous materials",
          "Use proper lifting techniques",
          "Report any suspicious or dangerous materials",
          "Keep collection area clean and organized",
        ],
      },
    ];
  
    const emergencyProcedures = [
      {
        title: "Medical Emergency",
        description: "If you or someone else is injured:",
        steps: [
          "Stop work immediately",
          "Call emergency services (108)",
          "Notify your supervisor",
          "Apply first aid if trained and safe to do so",
          "Document the incident",
        ],
      },
      {
        title: "Hazardous Material Exposure",
        description: "If exposed to hazardous materials:",
        steps: [
          "Move to a safe area immediately",
          "Remove contaminated clothing if possible",
          "Rinse affected area with clean water",
          "Seek medical attention",
          "Report the incident to management",
        ],
      },
      {
        title: "Vehicle Accident",
        description: "In case of a vehicle accident:",
        steps: [
          "Ensure personal safety first",
          "Call emergency services if needed",
          "Document the scene with photos",
          "Collect witness information",
          "Complete accident report form",
        ],
      },
    ];
  
    return (
      <div className="container py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Safety Guidelines
          </h1>
          <p className="text-muted-foreground">
            Essential safety information for waste collection operations
          </p>
        </div>
  
        {/* Important Alert */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Safety Notice</AlertTitle>
          <AlertDescription>
            Always prioritize your safety and the safety of others. Never take unnecessary risks
            and report any safety concerns immediately to your supervisor.
          </AlertDescription>
        </Alert>
  
        {/* Guidelines Section */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Guidelines</CardTitle>
            <CardDescription>
              Follow these guidelines to ensure safe waste collection operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              {guidelines.map((section, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <section.icon className="h-5 w-5 text-primary" />
                      <span>{section.category}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pl-7">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
  
        {/* Emergency Procedures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-destructive" />
              Emergency Procedures
            </CardTitle>
            <CardDescription>
              Follow these procedures in case of emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {emergencyProcedures.map((procedure, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{procedure.title}</CardTitle>
                    <CardDescription>{procedure.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2 list-decimal pl-4">
                      {procedure.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
  
        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>
              Keep these numbers handy for emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Emergency Services</p>
                  <p className="text-2xl font-bold">108</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-blue-50 rounded-full">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Supervisor Hotline</p>
                  <p className="text-2xl font-bold">1800-XXX-XXX</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-yellow-50 rounded-full">
                  <BadgeAlert className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">Safety Officer</p>
                  <p className="text-2xl font-bold">1800-XXX-XXX</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default SafetyGuidelines;