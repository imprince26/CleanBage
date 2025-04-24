
  // // Role-based features
  // const features = {
  //   public: [
  //     {
  //       title: "Real-time Tracking",
  //       description: "Monitor waste collection vehicles and bin status in real-time.",
  //       icon: MapPin,
  //     },
  //     {
  //       title: "Smart Rewards",
  //       description: "Earn points for responsible waste disposal.",
  //       icon: Gift,
  //     },
  //     {
  //       title: "Community Impact",
  //       description: "See your contribution to city's cleanliness goals.",
  //       icon: Users,
  //     },
  //   ],
  //   resident: [
  //     {
  //       title: "Bin Locator",
  //       description: "Find the nearest smart bins in your area.",
  //       icon: MapPin,
  //     },
  //     {
  //       title: "Reward Points",
  //       description: "Track and redeem your earned points.",
  //       icon: Gift,
  //     },
  //     {
  //       title: "Collection Schedule",
  //       description: "View upcoming waste collection times.",
  //       icon: Calendar,
  //     },
  //   ],
  //   garbage_collector: [
  //     {
  //       title: "Route Optimization",
  //       description: "Get the most efficient collection routes.",
  //       icon: Route,
  //     },
  //     {
  //       title: "Bin Status",
  //       description: "Real-time updates on bin fill levels.",
  //       icon: Trash2,
  //     },
  //     {
  //       title: "Schedule Management",
  //       description: "Manage your collection schedules.",
  //       icon: Calendar,
  //     },
  //   ],
  //   admin: [
  //     {
  //       title: "Analytics Dashboard",
  //       description: "Comprehensive waste management analytics.",
  //       icon: LineChart,
  //     },
  //     {
  //       title: "Fleet Management",
  //       description: "Monitor and manage collection vehicles.",
  //       icon: Truck,
  //     },
  //     {
  //       title: "System Reports",
  //       description: "Generate detailed performance reports.",
  //       icon: FileText,
  //     },
  //   ],
  // }
  import { Link } from "react-router-dom"
  import { useAuth } from "@/context/AuthContext"
  import { Button } from "@/components/ui/button"
  import { 
    MapPin, 
    Gift, 
    FileText, 
    Users, 
    HelpCircle, 
    ArrowRight, 
    Recycle,
    Truck,
    TreeDeciduous,
    Route,
    Calendar,
    Trash2,
    LineChart,
    TrendingUp,
    Activity,
    Award,
    Phone,
    Mail,
  } from "lucide-react"
  
  const Home = () => {
    const { user } = useAuth()
  
const features = {
    public: [
      {
        title: "Real-time Tracking",
        description: "Monitor waste collection vehicles and bin status in real-time.",
        icon: MapPin,
      },
      {
        title: "Smart Rewards",
        description: "Earn points for responsible waste disposal.",
        icon: Gift,
      },
      {
        title: "Community Impact",
        description: "See your contribution to city's cleanliness goals.",
        icon: Users,
      },
    ],
    resident: [
      {
        title: "Bin Locator",
        description: "Find the nearest smart bins in your area.",
        icon: MapPin,
      },
      {
        title: "Reward Points",
        description: "Track and redeem your earned points.",
        icon: Gift,
      },
      {
        title: "Collection Schedule",
        description: "View upcoming waste collection times.",
        icon: Calendar,
      },
    ],
    garbage_collector: [
      {
        title: "Route Optimization",
        description: "Get the most efficient collection routes.",
        icon: Route,
      },
      {
        title: "Bin Status",
        description: "Real-time updates on bin fill levels.",
        icon: Trash2,
      },
      {
        title: "Schedule Management",
        description: "Manage your collection schedules.",
        icon: Calendar,
      },
    ],
    admin: [
      {
        title: "Analytics Dashboard",
        description: "Comprehensive waste management analytics.",
        icon: LineChart,
      },
      {
        title: "Fleet Management",
        description: "Monitor and manage collection vehicles.",
        icon: Truck,
      },
      {
        title: "System Reports",
        description: "Generate detailed performance reports.",
        icon: FileText,
      },
    ],
  }

  const getCurrentFeatures = () => {
    if (!user) return features.public
    return features[user.role] || features.public
  }
    const stats = [
      { number: "50K+", label: "Active Users" },
      { number: "1000+", label: "Smart Bins" },
      { number: "95%", label: "Collection Rate" },
      { number: "30%", label: "Waste Reduction" },
    ]
  
    const benefits = [
      {
        title: "Environmental Impact",
        description: "Reduce carbon footprint and promote sustainable waste management practices",
        icon: TreeDeciduous
      },
      {
        title: "Cost Efficiency",
        description: "Optimize collection routes and reduce operational costs",
        icon: TrendingUp
      },
      {
        title: "Real-time Monitoring",
        description: "Track bin status and vehicle locations in real-time",
        icon: Activity
      },
      {
        title: "Community Engagement",
        description: "Encourage citizen participation through rewards and recognition",
        icon: Award
      }
    ]
  
    const testimonials = [
      {
        text: "CleanBage has transformed how we manage waste in our neighborhood.",
        author: "Raj Patel",
        role: "Resident"
      },
      {
        text: "The route optimization feature saves us time and fuel every day.",
        author: "Amit Singh",
        role: "Garbage Collector"
      },
      {
        text: "Data-driven insights help us make better waste management decisions.",
        author: "Priya Shah",
        role: "JMC Official"
      }
    ]
  
    return (
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold">
                  {user ? `Welcome, ${user.name}! 👋` : "🌱 For a Sustainable Future"}
                </span>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Smart Waste Management for a 
                  <span className="text-primary"> Cleaner Jamnagar</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-[600px]">
                  Join us in revolutionizing waste management through technology. 
                  Track, manage, and dispose of waste responsibly while earning rewards.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link to={user ? `/${user.role}/dashboard` : '/register'}>
                      {user ? 'Go to Dashboard' : 'Get Started'}
                      <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                  </Button>
                  {!user && (
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/about">Learn More</Link>
                    </Button>
                  )}
                </div>
              </div>
              <div className="relative lg:pl-8">
                <img 
                  src="/images/waste-management.svg" 
                  alt="Waste Management Illustration" 
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
  
        {/* Stats Section */}
        <section className="py-16 bg-muted">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center space-y-2">
                  <p className="text-4xl font-bold text-primary">{stat.number}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Features Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl">
                {user ? `Features for ${user.role.replace('_', ' ')}` : 'Key Features'}
              </h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Experience the future of waste management with our comprehensive suite of features
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {getCurrentFeatures().map((feature) => (
                <div
                  key={feature.title}
                  className="group p-6 bg-background rounded-xl shadow-sm border hover:shadow-md"
                >
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Benefits Section */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl">Why Choose CleanBage?</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Discover how our smart waste management solution benefits everyone
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4 p-6 bg-background rounded-xl border">
                  <div className="p-3 rounded-lg bg-primary/10 h-fit">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl">What People Say</h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                Hear from our users about their experience with CleanBage
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.author} className="p-6 bg-muted rounded-xl">
                  <p className="text-lg mb-4">{testimonial.text}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Contact Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold sm:text-4xl">Need Help?</h2>
                <p className="text-primary-foreground/90">
                  Our support team is here to assist you with any questions or concerns
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    <span>+91 1234567890</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span>support@cleanbage.com</span>
                  </div>
                </div>
              </div>
              <div className="bg-background text-foreground p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Quick Contact</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full p-2 rounded-md border bg-background"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full p-2 rounded-md border bg-background"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full p-2 rounded-md border bg-background"
                  />
                  <Button className="w-full">Send Message</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
          <div className="container text-center space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {user ? 'Ready to Start?' : 'Ready to Make a Difference?'}
            </h2>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              {user 
                ? 'Access your dashboard and start managing waste efficiently.'
                : 'Join thousands of citizens who are already contributing to a cleaner, greener Jamnagar.'}
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                asChild
              >
                <Link to={user ? `/${user.role}/dashboard` : '/register'}>
                  {user ? 'Go to Dashboard' : 'Join Now'}
                  <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }
  
  export default Home