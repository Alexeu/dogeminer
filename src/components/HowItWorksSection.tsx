const steps = [
  {
    number: "1",
    title: "Regístrate & Obtén DOGE Gratis",
    description:
      "Crea tu cuenta y recibe un DOGE Starter gratis para comenzar a minar inmediatamente.",
  },
  {
    number: "2",
    title: "Abre Mystery Boxes",
    description:
      "Usa tus ganancias para abrir cajas y expandir tu colección con DOGEs raros.",
  },
  {
    number: "3",
    title: "Mina DOGE Automáticamente",
    description:
      "Mira cómo crece tu balance mientras tus DOGEs minan pasivamente. ¡Retira cuando quieras!",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Cómo Funciona
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
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-doge-lg text-2xl font-bold text-primary-foreground relative z-10">
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