import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Recycle,
  Calendar,
  Truck,
  Trophy,
  Users,
  ShieldCheck,
  Wallet,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = {
    general: {
      icon: Recycle,
      title: "General Questions",
      questions: [
        {
          question: "What is CleanBage?",
          answer: "CleanBage is a smart waste management platform that connects residents with waste collectors to ensure efficient and timely waste collection. It features bin tracking, scheduling, and reward systems.",
        },
        {
          question: "How do I get started with CleanBage?",
          answer: "Simply register for an account, verify your email, and complete your profile. You'll then have access to all features based on your user role (resident or waste collector).",
        },
        {
          question: "Is the service available in my area?",
          answer: "Currently, CleanBage operates in Jamnagar, Gujarat. We're continuously expanding our coverage area. Check your location's availability during registration.",
        },
      ],
    },
    collection: {
      icon: Calendar,
      title: "Collection & Scheduling",
      questions: [
        {
          question: "How often is waste collected?",
          answer: "Collection frequency varies by area and waste type. Regular collections are typically scheduled 2-3 times per week. You can view and customize your collection schedule in the app.",
        },
        {
          question: "What if I miss a collection?",
          answer: "You can request a special collection through the app. Note that additional charges may apply for on-demand collections outside regular schedules.",
        },
        {
          question: "How do I report a missed collection?",
          answer: "Use the 'Report Issue' feature in the app to notify us about missed collections. Include relevant details and photos if necessary.",
        },
      ],
    },
    rewards: {
      icon: Trophy,
      title: "Rewards Program",
      questions: [
        {
          question: "How do I earn reward points?",
          answer: "Earn points through regular waste segregation, timely bin placement, reporting issues, and maintaining good collection schedules. Special bonuses are awarded for environmental initiatives.",
        },
        {
          question: "What can I redeem points for?",
          answer: "Points can be redeemed for various rewards including discount coupons, free collections, eco-friendly products, and special services.",
        },
        {
          question: "When do points expire?",
          answer: "Reward points are valid for 12 months from the date of earning. Check your rewards dashboard for point expiration dates.",
        },
      ],
    },
    technical: {
      icon: ShieldCheck,
      title: "Technical Support",
      questions: [
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login screen, enter your registered email, and follow the reset instructions sent to your inbox.",
        },
        {
          question: "Is my data secure?",
          answer: "Yes, we use industry-standard encryption and security measures to protect your personal information. Read our Privacy Policy for more details.",
        },
        {
          question: "What devices are supported?",
          answer: "CleanBage works on most modern web browsers and has mobile apps for both Android and iOS devices.",
        },
      ],
    },
  };

  const filteredFAQs = Object.entries(faqCategories).map(([key, category]) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Find answers to common questions about using CleanBage's waste management services
        </p>
      </div>

      {/* Search */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Categories */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start">
          {Object.entries(faqCategories).map(([key, category]) => (
            <TabsTrigger key={key} value={key}>
              <category.icon className="h-4 w-4 mr-2" />
              {category.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(faqCategories).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5 text-primary" />
                  {category.title}
                </CardTitle>
                <CardDescription>
                  Common questions about {category.title.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {filteredFAQs
                    .find((c) => c.title === category.title)
                    ?.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Contact Support Section */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Still have questions?</h3>
            <p className="text-muted-foreground">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link to="/contact">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/help">
                  View Help Center
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;