import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  HelpCircle,
  Book,
  Phone,
  Mail,
  Search,
  FileText,
  MessageSquare,
  Video,
  Book as BookIcon,
  ExternalLink,
  MapPin,
  Trash2,
  Route,
  Gift,
} from "lucide-react";

const Help = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Role-specific FAQs
  const faqs = {
    resident: [
      {
        question: "How do I report an uncollected bin?",
        answer: "Go to the Bin Map section, locate the specific bin, and click on 'Report Issue'. Fill in the required details and submit the report."
      },
      {
        question: "How does the reward system work?",
        answer: "You earn points for responsible waste management practices, like regular reporting and proper waste segregation. These points can be redeemed in the Reward Store."
      },
      {
        question: "How can I track my waste collection schedule?",
        answer: "Check your Dashboard or Calendar section to view upcoming collection schedules for your area."
      },
    ],
    garbage_collector: [
      {
        question: "How do I update my route status?",
        answer: "In the Active Routes section, select your assigned route and use the status toggle to update its current status."
      },
      {
        question: "What should I do if I encounter a blocked bin?",
        answer: "Mark the bin as 'inaccessible' in your collection report and add photos/notes about the obstruction."
      },
      {
        question: "How do I complete a collection report?",
        answer: "After completing collection, go to Reports section, fill in all required fields including fill levels and waste types, and submit."
      },
    ],
    common: [
      {
        question: "How do I change my password?",
        answer: "Go to Settings > Security, click on 'Change Password' and follow the instructions."
      },
      {
        question: "How can I update my profile information?",
        answer: "Visit your Profile page, click on 'Edit Profile' and update the necessary information."
      },
      {
        question: "What should I do if I forget my password?",
        answer: "Click on 'Forgot Password' on the login page and follow the reset instructions sent to your email."
      },
    ],
  };

  // Documentation sections
  const documentation = [
    {
      title: "Getting Started",
      icon: BookIcon,
      content: "Learn the basics of using the CleanBage platform and its key features."
    },
    {
      title: "User Guides",
      icon: FileText,
      content: "Detailed guides for all major features and functionalities."
    },
    {
      title: "Video Tutorials",
      icon: Video,
      content: "Watch step-by-step tutorials on how to use various features."
    },
  ];

  const getCurrentFaqs = () => {
    if (!user) return faqs.common;
    return [...faqs[user.role] || [], ...faqs.common];
  };

  const filteredFaqs = getCurrentFaqs().filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers and learn how to make the most of CleanBage
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2" asChild>
          <a href="mailto:support@cleanbage.com">
            <MessageSquare className="h-4 w-4" />
            Contact Support
          </a>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="docs">
            <Book className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about using CleanBage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Comprehensive guides and tutorials for using CleanBage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {documentation.map((doc, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <doc.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {doc.content}
                      </p>
                      <Button variant="link" className="p-0 mt-2">
                        Learn More
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Get in touch with our support team for assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Email Support</h3>
                        <p className="text-sm text-muted-foreground">
                          support@cleanbage.com
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Response within 24 hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Phone Support</h3>
                        <p className="text-sm text-muted-foreground">
                          +91 1234567890
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Mon-Sat, 9AM-6PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Visit Us</h3>
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">CleanBage Office</p>
                    <p className="text-sm text-muted-foreground">
                      JMC Building, Main Road
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Jamnagar, Gujarat 361001
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;