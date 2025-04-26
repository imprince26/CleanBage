import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Lock,
  File,
  Cookie,
  Eye,
  Share2,
  Trash2,
  MessageSquare,
  Map,
  Bell,
} from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: [
        "Personal Information: Name, email address, phone number, and residential address",
        "Location Data: Real-time location tracking for waste collection services",
        "Usage Data: Information about how you interact with our application",
        "Device Information: Browser type, IP address, and device identifiers",
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "Provide and maintain our waste management services",
        "Process and manage waste collection requests",
        "Send notifications about collection schedules and updates",
        "Improve our services and user experience",
        "Communicate with you about your account and our services",
      ],
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: [
        "With garbage collectors to facilitate waste collection",
        "With service providers who assist in our operations",
        "When required by law or to protect our rights",
        "With your consent or at your direction",
      ],
    },
    {
      icon: Map,
      title: "Location Data Usage",
      content: [
        "Track waste collection vehicles for service optimization",
        "Provide accurate bin location information",
        "Enable efficient route planning for collectors",
        "Location tracking can be disabled through device settings",
      ],
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking",
      content: [
        "We use cookies to enhance user experience",
        "Track application usage patterns",
        "Remember user preferences",
        "You can control cookie settings through your browser",
      ],
    },
    {
      icon: Eye,
      title: "Data Security",
      content: [
        "Implementation of industry-standard security measures",
        "Regular security assessments and updates",
        "Encrypted data transmission",
        "Secure data storage practices",
      ],
    },
    {
      icon: Bell,
      title: "Communications",
      content: [
        "Service-related notifications and updates",
        "Collection schedule reminders",
        "Customer support communications",
        "Marketing communications (with consent)",
      ],
    },
    {
      icon: Trash2,
      title: "Data Retention and Deletion",
      content: [
        "Data retained as long as necessary for service provision",
        "Account data deleted upon request",
        "Some data retained for legal compliance",
        "Regular data cleanup procedures",
      ],
    },
  ];

  const lastUpdated = "April 27, 2024";

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Your privacy is important to us. This policy outlines how we collect,
          use, and protect your personal information.
        </p>
        <p className="text-sm text-muted-foreground">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Introduction Card */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            This Privacy Policy describes how CleanBage ("we," "our," or "us")
            collects, uses, and shares your personal information when you use our
            waste management application and services. By using our services, you
            agree to the collection and use of information in accordance with this
            policy.
          </p>
        </CardContent>
      </Card>

      {/* Policy Sections */}
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
            <MessageSquare className="h-5 w-5" />
            Privacy Inquiries
          </CardTitle>
          <CardDescription>
            If you have any questions about this Privacy Policy, please contact us
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You can reach our Privacy Team at:
          </p>
          <div className="space-y-2">
            <p>Email: privacy@cleanbage.com</p>
            <p>Phone: +91 1234567890</p>
            <p>Address: JMC Building, Main Road, Jamnagar, Gujarat 361001</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          This privacy policy is subject to change. We will notify users of any
          material changes via email or through the application.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;