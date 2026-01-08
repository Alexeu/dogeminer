import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sword, Shield, Crown, Sparkles, Coins, Users, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import rpgDogeToken from "@/assets/rpgdoge-token.png";

const loreChapters = [
  {
    id: 1,
    title: "El Origen",
    icon: Sparkles,
    content: `En las tierras digitales de Memeville, donde los memes fluyen como ríos de oro y los holders son los verdaderos guerreros, existía un humilde Shiba Inu llamado Doge.

Doge no era un perro cualquiera. Desde cachorro, mostró una inteligencia excepcional y un instinto único para detectar oportunidades en el volátil mercado de las criptomonedas. Mientras otros corrían tras pumps efímeros, Doge estudiaba los antiguos pergaminos del análisis técnico y meditaba sobre el arte del HODL.`,
  },
  {
    id: 2,
    title: "La Espada del HODL",
    icon: Sword,
    content: `Un día, mientras exploraba las ruinas del Protocolo Olvidado, Doge encontró algo extraordinario: la legendaria "Espada del HODL", forjada por los antiguos desarrolladores en los tiempos del Génesis Block.

La espada brillaba con un resplandor dorado y llevaba inscrita una profecía: "Quien empuñe esta espada y mantenga su fe, protegerá a los holders de la volatilidad eterna."

Al tocar la empuñadura, Doge sintió el poder fluir a través de él. Sus ojos brillaron con determinación y supo que su destino era proteger a la comunidad.`,
  },
  {
    id: 3,
    title: "El Guardián Renace",
    icon: Shield,
    content: `Con la Espada del HODL en su pata, Doge se transformó. Ya no era solo un meme simpático, sino RPGDOGE, el Guardián del Reino Crypto.

Reunió a los mejores guerreros del blockchain: holders diamante que nunca vendieron en rojo, developers que codificaban día y noche, y community managers que mantenían la fe en los tiempos oscuros.

Juntos, formaron la Orden del RDOGE, jurando proteger el tesoro de la comunidad y llevar prosperidad a todos los que creyeran en la misión.`,
  },
  {
    id: 4,
    title: "El Reino Actual",
    icon: Crown,
    content: `Hoy, RPGDOGE lidera desde su fortaleza digital, donde cada token RDOGE representa una parte del poder del reino.

Los que hacen staking de sus tokens contribuyen al "Tesoro del Reino", recibiendo recompensas por su lealtad. Los holders más antiguos son conocidos como "Caballeros Diamante", respetados por toda la comunidad.

Y la leyenda dice que cuando el suministro total de 10,000,000,000 RDOGE sea distribuido entre verdaderos creyentes, el reino alcanzará su máximo esplendor...`,
  },
];

const tokenomics = [
  { label: "Suministro Total", value: "10,000,000,000 RDOGE", icon: Coins },
  { label: "Comunidad", value: "40%", icon: Users },
  { label: "Staking Rewards", value: "25%", icon: Sparkles },
  { label: "Quema Épica", value: "Deflacionario", icon: Flame },
];

const RPGDogeLore = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#16213e] to-[#0f0f23] text-white overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -20, 20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Glowing Orb Background */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-purple-500/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute -top-20 left-0"
          >
            <Link to="/">
              <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al Reino
              </Button>
            </Link>
          </motion.div>

          {/* Token Image */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0.4 }}
            className="relative inline-block mb-8"
          >
            <motion.div
              className="absolute inset-0 bg-yellow-400/50 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <motion.img
              src={rpgDogeToken}
              alt="RPGDOGE Token"
              className="w-48 h-48 md:w-64 md:h-64 relative z-10 drop-shadow-2xl"
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 360],
              }}
              transition={{
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
              RPGDOGE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-yellow-200/80 mb-2"
          >
            El Guardián del Reino Crypto
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-lg text-gray-400 font-mono"
          >
            $RDOGE • ERC-20
          </motion.p>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-yellow-400/60"
            >
              <Sword className="w-8 h-8 rotate-180" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Lore Chapters Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              📜 La Leyenda de RPGDOGE
            </span>
          </motion.h2>

          {/* Chapter Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {loreChapters.map((chapter, index) => (
              <motion.button
                key={chapter.id}
                onClick={() => setActiveChapter(index)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                  activeChapter === index
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-black font-bold shadow-lg shadow-yellow-500/30"
                    : "border-yellow-500/30 text-yellow-200 hover:border-yellow-400 hover:bg-yellow-500/10"
                }`}
              >
                <chapter.icon className="w-5 h-5" />
                <span className="hidden md:inline">{chapter.title}</span>
                <span className="md:hidden">Cap. {chapter.id}</span>
              </motion.button>
            ))}
          </div>

          {/* Chapter Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-purple-500/20 shadow-2xl">
                {/* Chapter Header */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg"
                  >
                    {(() => {
                      const Icon = loreChapters[activeChapter].icon;
                      return <Icon className="w-8 h-8 text-black" />;
                    })()}
                  </motion.div>
                  <div>
                    <p className="text-yellow-400 text-sm font-mono">Capítulo {loreChapters[activeChapter].id}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {loreChapters[activeChapter].title}
                    </h3>
                  </div>
                </div>

                {/* Chapter Text */}
                <div className="prose prose-lg prose-invert max-w-none">
                  {loreChapters[activeChapter].content.split("\n\n").map((paragraph, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="text-gray-300 leading-relaxed mb-4 text-lg"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                    disabled={activeChapter === 0}
                    className="text-yellow-400 hover:text-yellow-300 disabled:opacity-30"
                  >
                    ← Anterior
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveChapter(Math.min(loreChapters.length - 1, activeChapter + 1))}
                    disabled={activeChapter === loreChapters.length - 1}
                    className="text-yellow-400 hover:text-yellow-300 disabled:opacity-30"
                  >
                    Siguiente →
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              ⚔️ Tokenomics del Reino
            </span>
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {tokenomics.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 text-center group hover:border-yellow-400/50 transition-all duration-300"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-flex p-4 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full mb-4 group-hover:from-yellow-400/30 group-hover:to-orange-400/30 transition-all"
                >
                  <item.icon className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <p className="text-2xl md:text-3xl font-bold text-white mb-2">{item.value}</p>
                <p className="text-yellow-200/70 text-sm">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-3xl p-12 border border-yellow-500/30">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🏰
            </motion.div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              ¿Listo para unirte al Reino?
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              Conviértete en un Caballero Diamante y protege el tesoro de la comunidad
            </p>
            <Link to="/rpgdoge/presale">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg px-10 py-6 rounded-full shadow-lg shadow-yellow-500/30">
                  <Coins className="w-5 h-5 mr-2" />
                  Comenzar Preventa
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 text-sm">
        <p>© 2024 RPGDOGE Kingdom • Todos los derechos reservados</p>
        <p className="mt-2">La leyenda continúa...</p>
      </footer>
    </div>
  );
};

export default RPGDogeLore;
