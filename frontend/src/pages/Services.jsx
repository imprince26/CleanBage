import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Recycle,
  Truck,
  Calendar,
  MapPin,
  Bell,
  Award,
  BarChart3,
  Users,
  MessageSquare,
  ArrowRight,
  Leaf,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      icon: Trash2,
      title: "Smart Waste Collection",
      description: "Real-time monitoring of bin fill levels and automated collection scheduling",
      features: [
        "IoT-enabled waste bins",
        "Fill level monitoring",
        "Automated alerts",
        "Efficient collection routes",
      ],
    },
    {
      icon: Recycle,
      title: "Waste Segregation",
      description: "Proper waste segregation guidelines and monitoring for better recycling",
      features: [
        "Segregation guidelines",
        "Recyclable waste tracking",
        "Composting support",
        "Environmental impact reports",
      ],
    },
    {
      icon: Truck,
      title: "Route Optimization",
      description: "AI-powered route planning for efficient waste collection",
      features: [
        "Dynamic route planning",
        "Traffic consideration",
        "Fuel optimization",
        "Real-time tracking",
      ],
    },
    {
      icon: Calendar,
      title: "Scheduled Collections",
      description: "Regular and on-demand waste collection services",
      features: [
        "Regular schedules",
        "On-demand pickups",
        "Reminder notifications",
        "Schedule adjustments",
      ],
    },
    {
      icon: Award,
      title: "Rewards Program",
      description: "Earn points for responsible waste management practices",
      features: [
        "Point system",
        "Redeemable rewards",
        "Performance tracking",
        "Special achievements",
      ],
    },
    {
      icon: MessageSquare,
      title: "Community Engagement",
      description: "Platform for community feedback and improvement suggestions",
      features: [
        "Feedback system",
        "Community forums",
        "Educational resources",
        "Local initiatives",
      ],
    },
  ];

  const specialFeatures = [
    {
      icon: Building2,
      title: "For Residential Areas",
      description: "Comprehensive waste management solutions for residential complexes",
      points: [
        "Regular collection schedules",
        "Door-to-door service",
        "Waste segregation support",
        "Community engagement",
      ],
    },
    {
      icon: Leaf,
      title: "For Commercial Areas",
      description: "Tailored solutions for businesses and commercial establishments",
      points: [
        "High-volume handling",
        "Flexible collection times",
        "Waste audit reports",
        "Compliance support",
      ],
    },
  ];

  return (
    <div className="container py-8 space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Our Services</h1>
        <p className="text-muted-foreground max-w-[800px] mx-auto">
          Comprehensive waste management solutions powered by smart technology for
          cleaner, sustainable communities
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Card key={index} className="relative group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Special Features Section */}
      <div className="pt-8">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-bold">Specialized Solutions</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Tailored waste management services for different needs
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {specialFeatures.map((feature, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-xl">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                    <ul className="space-y-2 pt-2">
                      {feature.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center pt-8">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="max-w-[600px] mx-auto space-y-6">
              <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
              <p className="text-primary-foreground/90">
                Join CleanBage today and experience smart waste management for your
                community
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                >
                  <Link to="/register">Sign Up Now</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Services;