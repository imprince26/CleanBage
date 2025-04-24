import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="CleanBage" className="h-8 w-8" />
              <span className="font-bold">CleanBage</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Smart Waste Management System for Jamnagar Municipal Corporation
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Team Members</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">John Doe - Team Lead</li>
              <li className="text-muted-foreground">Jane Smith - Developer</li>
              <li className="text-muted-foreground">Mike Johnson - Designer</li>
              <li className="text-muted-foreground">Sarah Brown - Developer</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Contact Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Email: support@cleanbage.com</li>
              <li className="text-muted-foreground">Phone: +91 1234567890</li>
              <li className="text-muted-foreground">
                Address: JMC Office, Jamnagar, Gujarat, India
              </li>
              <li className="mt-4 flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </a>
                {/* <a href="#" className="text-muted-foreground hover:text-foreground">
                  <GitHub className="h-5 w-5" />
                </a> */}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 CleanBage. All rights reserved. Made with ❤️ for Jamnagar
          </p>
        </div>
      </div>
    </footer>
  )
}