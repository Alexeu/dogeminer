import { CheckCircle2 } from "lucide-react";

const withdrawals = [
  { email: "alex....com", time: "3 minutes ago", amount: "0.004875 DOGE" },
  { email: "mike....com", time: "7 minutes ago", amount: "0.015243 DOGE" },
  { email: "sara....com", time: "14 minutes ago", amount: "0.000780 DOGE" },
  { email: "john....com", time: "21 minutes ago", amount: "0.006370 DOGE" },
  { email: "emma....com", time: "28 minutes ago", amount: "0.020280 DOGE" },
  { email: "luca....com", time: "45 minutes ago", amount: "0.003704 DOGE" },
  { email: "yuki....jp", time: "about 1 hour ago", amount: "0.027625 DOGE" },
  { email: "pedro...br", time: "about 1 hour ago", amount: "0.012285 DOGE" },
  { email: "anna....de", time: "about 1 hour ago", amount: "0.102700 DOGE" },
  { email: "omar....com", time: "about 2 hours ago", amount: "0.009750 DOGE" },
];

const WithdrawalsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Latest Withdrawals
          </h2>
          <p className="text-muted-foreground">Real users, real earnings</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="divide-y divide-border">
              {withdrawals.map((withdrawal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {withdrawal.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{withdrawal.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gradient">
                      {withdrawal.amount}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WithdrawalsSection;
