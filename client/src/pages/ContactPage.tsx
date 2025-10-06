import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, MessageCircle, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4 text-center">
          Get in Touch
        </h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          We'd love to hear from you. Reach out to us for any queries or assistance.
        </p>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input placeholder="Your name" data-testid="input-contact-name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input type="email" placeholder="your@email.com" data-testid="input-contact-email" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      placeholder="Your message"
                      rows={5}
                      data-testid="input-contact-message"
                    />
                  </div>
                  <Button className="w-full hover-elevate active-elevate-2" data-testid="button-send-message">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="hover-elevate">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Chat with us on WhatsApp for quick responses
                  </p>
                  <Button variant="outline" size="sm" className="hover-elevate active-elevate-2" asChild data-testid="button-whatsapp-contact">
                    <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
                      Message Us
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Instagram className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Instagram</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Follow us for the latest collections and updates
                  </p>
                  <Button variant="outline" size="sm" className="hover-elevate active-elevate-2" asChild data-testid="button-instagram-contact">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                      Follow Us
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground text-sm">
                    support@raiaura.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Visit Us</h3>
                  <p className="text-muted-foreground text-sm">
                    123 Jewellery Lane<br />
                    Fashion District<br />
                    New York, NY 10001
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
