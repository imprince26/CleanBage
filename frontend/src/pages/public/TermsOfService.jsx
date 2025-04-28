import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  import {
    ScrollText,
    Shield,
    UserCog,
    Scale,
    AlertTriangle,
    Ban,
    Gavel,
    Mail,
    CircleDollarSign,
    FileTerminal,
  } from "lucide-react";
  
  const TermsOfService = () => {
    const sections = [
      {
        icon: ScrollText,
        title: "Acceptance of Terms",
        content: [
          "By accessing or using the CleanBage application, you agree to be bound by these Terms of Service",
          "If you disagree with any part of these terms, you may not access the service",
          "We reserve the right to modify these terms at any time without prior notice",
          "Your continued use of the service constitutes acceptance of the modified terms",
        ],
      },
      {
        icon: UserCog,
        title: "User Accounts",
        content: [
          "You must provide accurate and complete information when creating an account",
          "You are responsible for maintaining the security of your account credentials",
          "You must immediately notify us of any unauthorized use of your account",
          "We reserve the right to terminate accounts that violate these terms",
        ],
      },
      {
        icon: Shield,
        title: "User Responsibilities",
        content: [
          "Follow all local waste management regulations and guidelines",
          "Properly segregate waste according to provided instructions",
          "Report accurate information about waste collection and issues",
          "Maintain respectful communication with waste collectors and staff",
          "Keep collection areas accessible and safe",
        ],
      },
      {
        icon: Scale,
        title: "Service Terms",
        content: [
          "Collection services are provided as per scheduled timings",
          "Service availability may vary based on location and circumstances",
          "We reserve the right to modify or discontinue services without notice",
          "Users must comply with waste collection guidelines and schedules",
        ],
      },
      {
        icon: CircleDollarSign,
        title: "Payments and Rewards",
        content: [
          "All applicable fees must be paid as per the agreed schedule",
          "Reward points have no monetary value and cannot be exchanged for cash",
          "We reserve the right to modify the rewards program at any time",
          "Fraudulent activities will result in account termination",
        ],
      },
      {
        icon: Ban,
        title: "Prohibited Activities",
        content: [
          "Submitting false or misleading information",
          "Interfering with the service's normal operation",
          "Attempting to gain unauthorized access to the system",
          "Harassing or threatening other users or staff",
          "Using the service for illegal activities",
        ],
      },
      {
        icon: AlertTriangle,
        title: "Limitation of Liability",
        content: [
          "We are not liable for any indirect or consequential damages",
          "Our liability is limited to the amount paid for the service",
          "We do not guarantee uninterrupted or error-free service",
          "Users assume risks associated with waste handling",
        ],
      },
      {
        icon: FileTerminal,
        title: "Intellectual Property",
        content: [
          "All content and materials are our exclusive property",
          "Users may not copy or modify the application or its content",
          "Trademarks and logos are protected by applicable laws",
          "Feedback and suggestions become our property",
        ],
      },
    ];
  
    const lastUpdated = "April 27, 2024";
  
    return (
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Please read these terms carefully before using CleanBage services
          </p>
          <p className="text-sm text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
        </div>
  
        {/* Introduction Card */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              These Terms of Service ("Terms") govern your access to and use of
              CleanBage's website, mobile application, and waste management services
              (collectively, the "Service"). By using the Service, you agree to be
              bound by these Terms. If you disagree with any part of these terms,
              you must not use our Service.
            </p>
          </CardContent>
        </Card>
  
        {/* Terms Sections */}
        <div className="grid gap-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
  
        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Legal Inquiries
            </CardTitle>
            <CardDescription>
              For any questions about these Terms of Service, please contact us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You can reach our Legal Team at:
            </p>
            <div className="space-y-2">
              <p>Email: legal@cleanbage.com</p>
              <p>Phone: +91 1234567890</p>
              <p>Address: JMC Building, Main Road, Jamnagar, Gujarat 361001</p>
            </div>
          </CardContent>
        </Card>
  
        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            These terms of service are subject to change. We will notify users of any
            material changes via email or through the application. Your continued use
            of the service after such changes constitutes acceptance of the new
            terms.
          </p>
        </div>
      </div>
    );
  };
  
  export default TermsOfService;