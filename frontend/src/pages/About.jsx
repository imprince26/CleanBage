import {
    Users,
    Recycle,
    Trophy,
    TreeDeciduous,
    Target,
    Shield,
  } from "lucide-react";
  import { Card, CardContent } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Link } from "react-router-dom";
  
  const About = () => {
    const stats = [
      { number: "50K+", label: "Active Users" },
      { number: "1000+", label: "Smart Bins" },
      { number: "95%", label: "Collection Rate" },
      { number: "30%", label: "Waste Reduction" },
    ];
  
    const teamMembers = [
      {
        name: "Raj Patel",
        role: "Project Lead",
        image: "/team/raj.jpg",
        bio: "10+ years experience in waste management",
      },
      {
        name: "Priya Shah",
        role: "Operations Head",
        image: "/team/priya.jpg",
        bio: "Expert in logistics and route optimization",
      },
      {
        name: "Amit Singh",
        role: "Tech Lead",
        image: "/team/amit.jpg",
        bio: "Specialized in IoT and smart city solutions",
      },
    ];
  
    const values = [
      {
        icon: TreeDeciduous,
        title: "Environmental Impact",
        description: "Committed to sustainable waste management practices",
      },
      {
        icon: Users,
        title: "Community First",
        description: "Working together with residents for a cleaner city",
      },
      {
        icon: Target,
        title: "Innovation",
        description: "Using technology to solve waste management challenges",
      },
      {
        icon: Shield,
        title: "Reliability",
        description: "Consistent and dependable waste collection services",
      },
    ];
  
    return (
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                About CleanBage
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transforming waste management through smart technology and community
                engagement
              </p>
              <Button size="lg" asChild>
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </section>
  
        {/* Stats Section */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {stat.number}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        {/* Mission Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-6">
                  At CleanBage, we're committed to revolutionizing waste management
                  through innovative technology and community engagement. Our mission
                  is to create cleaner, more sustainable cities by making waste
                  management smarter and more efficient.
                </p>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Recycle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/images/mission.jpg"
                  alt="Mission"
                  className="rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
                  <p className="text-lg font-semibold">Established 2023</p>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Values Section */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <Card key={value.title}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-primary/10 mb-4">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        {/* Team Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.name} className="overflow-hidden">
                  <div className="aspect-square">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="font-semibold mb-1">{member.name}</h3>
                      <p className="text-sm text-primary mb-2">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
              <p className="text-primary-foreground/90 mb-8">
                Be part of the solution for a cleaner, more sustainable future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };
  
  export default About;