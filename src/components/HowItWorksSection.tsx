const steps = [
  {
    number: "1",
    title: "Sign Up & Get Free BONK",
    description:
      "Create your account and receive a free Common BONK to start mining immediately.",
  },
  {
    number: "2",
    title: "Open Mystery Boxes",
    description:
      "Use your earnings to open boxes and expand your collection with rare BONKs.",
  },
  {
    number: "3",
    title: "Mine BONK Automatically",
    description:
      "Watch your balance grow as your BONKs mine passively. Withdraw anytime!",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative animate-slide-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="text-center">
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-bonk-lg text-2xl font-bold text-primary-foreground relative z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
