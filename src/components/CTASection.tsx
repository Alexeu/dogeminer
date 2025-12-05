import { Button } from "@/components/ui/button";
import { Rocket, Dog } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-comic text-lg">
            <Dog className="w-5 h-5" />
            Much opportunity! 🌙
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Start Mining?
          </h2>
          <p className="text-lg text-muted-foreground font-comic">
            Join thousands of miners earning DOGE every day. To the moon! 🚀
          </p>
          <Button variant="hero" size="lg" className="text-lg">
            <Rocket className="w-5 h-5" />
            Create Free Account
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
