export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-8 text-center">
          About Rai Aura
        </h1>

        <div className="prose prose-lg mx-auto">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-8">
            <img
              src="/images/about.jpg"
              alt="About Rai Aura"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Welcome to Rai Aura, where timeless elegance meets contemporary design. Founded with a passion for creating exceptional jewellery, we believe that every piece should tell a story and celebrate the unique beauty of its wearer.
            </p>

            <h2 className="font-serif text-3xl text-foreground mt-12 mb-4">Our Story</h2>
            <p>
              Rai Aura was born from a simple vision: to create jewellery that transcends trends and becomes a cherished part of your life's most precious moments. Each piece in our collection is meticulously handcrafted by skilled artisans who pour their expertise and passion into every detail.
            </p>

            <h2 className="font-serif text-3xl text-foreground mt-12 mb-4">Our Craftsmanship</h2>
            <p>
              We take pride in our commitment to exceptional quality and craftsmanship. From selecting the finest materials to the final polish, every step of our process is guided by a dedication to excellence. Our artisans blend traditional techniques with modern design sensibilities to create pieces that are both timeless and contemporary.
            </p>

            <h2 className="font-serif text-3xl text-foreground mt-12 mb-4">Our Promise</h2>
            <p>
              When you choose Rai Aura, you're not just purchasing jewellery—you're investing in a piece that will accompany you through life's journey. We stand behind the quality of our work and are committed to your complete satisfaction.
            </p>

            <div className="bg-accent/20 rounded-lg p-8 mt-12">
              <p className="text-center font-serif text-2xl text-foreground italic">
                "Every piece tells a story. What will yours be?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
