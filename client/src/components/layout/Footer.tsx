import { Link } from "wouter";
import { Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h3 className="font-serif text-2xl text-primary mb-4">Rai Aura</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Discover timeless elegance with our handcrafted jewellery collection. Each piece is designed to celebrate your unique beauty.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 tracking-wide">QUICK LINKS</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/shop">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-shop">
                  Shop
                </a>
              </Link>
              <Link href="/about">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-about">
                  About Us
                </a>
              </Link>
              <Link href="/contact">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-contact">
                  Contact
                </a>
              </Link>
              <Link href="/faq">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-faq">
                  FAQ
                </a>
              </Link>
              <Link href="/policies">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-policies">
                  Policies
                </a>
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 tracking-wide">CONNECT WITH US</h4>
            <div className="flex gap-3 mb-6">
              <Button
                variant="outline"
                size="icon"
                className="hover-elevate active-elevate-2"
                asChild
                data-testid="button-instagram"
              >
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hover-elevate active-elevate-2"
                asChild
                data-testid="button-whatsapp"
              >
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="text-sm"
                  data-testid="input-newsletter-email"
                />
                <Button variant="default" size="sm" className="hover-elevate active-elevate-2" data-testid="button-subscribe">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rai Aura. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
