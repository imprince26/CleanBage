import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Gift, 
  FileText, 
  Bell, 
  Users, 
  HelpCircle, 
  ArrowRight, 
  Recycle,
  Truck,
  TreeDeciduous
} from "lucide-react"

const Home = () => {
  const features = [
    {
      title: "Real-time Tracking",
      description: "Monitor waste collection vehicles and bin status in real-time through our advanced tracking system.",
      icon: MapPin,
    },
    {
      title: "Smart Rewards",
      description: "Earn points for responsible waste disposal and redeem them for exciting rewards.",
      icon: Gift,
    },
    {
      title: "Digital Reports",
      description: "Generate and access detailed waste management reports with just a few clicks.",
      icon: FileText,
    },
    {
      title: "Instant Notifications",
      description: "Receive timely alerts about collection schedules and bin status updates.",
      icon: Bell,
    },
    {
      title: "Community Impact",
      description: "See your contribution to the city's cleanliness goals through our impact dashboard.",
      icon: Users,
    },
    {
      title: "24/7 Support",
      description: "Access round-the-clock support for any waste management related queries.",
      icon: HelpCircle,
    },
  ]
  
  const stats = [
    {
      value: "50K+",
      label: "Active Users",
      icon: Users,
    },
    {
      value: "1000+",
      label: "Smart Bins",
      icon: Recycle,
    },
    {
      value: "95%",
      label: "Collection Rate",
      icon: Truck,
    },
    {
      value: "30%",
      label: "Waste Reduction",
      icon: TreeDeciduous,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="container relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <span className="text-sm">🌱 For a Sustainable Future</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Smart Waste Management for a Cleaner Jamnagar
              </h1>
              <p className="text-lg text-muted-foreground max-w-[600px]">
                Join us in revolutionizing waste management through technology. 
                Track, manage, and dispose of waste responsibly while earning rewards.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2 group">
                  Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative lg:pl-8">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/50 to-primary/30 blur-lg" />
                <img
                  src="/images/hero-image.jpg"
                  alt="Smart Waste Management"
                  className="relative rounded-lg shadow-2xl"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Key Features
            </h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Experience the future of waste management with our comprehensive suite of features
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-background rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-[1.02]"
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative p-6 bg-background rounded-xl border text-center space-y-4 transition-all hover:shadow-md"
              >
                <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-4xl font-bold text-primary">{stat.value}</h4>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Join thousands of citizens who are already contributing to a cleaner,
            greener Jamnagar. Start your journey today.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2 group">
              Join Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home