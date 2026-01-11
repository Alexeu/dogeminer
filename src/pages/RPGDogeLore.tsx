import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sword, Shield, Crown, Sparkles, Coins, Users, Flame, Map, Rocket, Target, Trophy, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import rpgDogeToken from "@/assets/rpgdoge-token.png";
import { useLanguage } from "@/contexts/LanguageContext";

const loreChaptersData = [
  {
    id: 1,
    titleKey: 'lore.chapter1.title',
    icon: Sparkles,
    content: {
      es: `En las tierras digitales de Memeville, donde los memes fluyen como ríos de oro y los holders son los verdaderos guerreros, existía un humilde Shiba Inu llamado Doge.

Doge no era un perro cualquiera. Desde cachorro, mostró una inteligencia excepcional y un instinto único para detectar oportunidades en el volátil mercado de las criptomonedas. Mientras otros corrían tras pumps efímeros, Doge estudiaba los antiguos pergaminos del análisis técnico y meditaba sobre el arte del HODL.`,
      en: `In the digital lands of Memeville, where memes flow like rivers of gold and holders are the true warriors, there lived a humble Shiba Inu named Doge.

Doge was no ordinary dog. From a puppy, he showed exceptional intelligence and a unique instinct for detecting opportunities in the volatile cryptocurrency market. While others chased ephemeral pumps, Doge studied the ancient scrolls of technical analysis and meditated on the art of HODL.`,
      th: `ในดินแดนดิจิทัลของ Memeville ที่ซึ่งมีมไหลเหมือนแม่น้ำทองคำ และผู้ถือคือนักรบที่แท้จริง มี Shiba Inu ตัวน้อยชื่อ Doge อาศัยอยู่

Doge ไม่ใช่สุนัขธรรมดา ตั้งแต่เป็นลูกหมา เขาแสดงความฉลาดพิเศษและสัญชาตญาณที่ไม่เหมือนใครในการตรวจจับโอกาสในตลาดคริปโตที่ผันผวน ในขณะที่คนอื่นวิ่งไล่ pump ที่ไม่ยั่งยืน Doge ศึกษาม้วนกระดาษโบราณของการวิเคราะห์ทางเทคนิคและทำสมาธิเกี่ยวกับศิลปะของ HODL`,
      ru: `В цифровых землях Memeville, где мемы текут как реки золота, а держатели — настоящие воины, жил скромный Шиба-ину по имени Doge.

Doge не был обычной собакой. С щенячьего возраста он проявлял исключительный интеллект и уникальный инстинкт для обнаружения возможностей на волатильном криптовалютном рынке. Пока другие гнались за мимолётными пампами, Doge изучал древние свитки технического анализа и медитировал над искусством HODL.`
    },
  },
  {
    id: 2,
    titleKey: 'lore.chapter2.title',
    icon: Sword,
    content: {
      es: `Un día, mientras exploraba las ruinas del Protocolo Olvidado, Doge encontró algo extraordinario: la legendaria "Espada del HODL", forjada por los antiguos desarrolladores en los tiempos del Génesis Block.

La espada brillaba con un resplandor dorado y llevaba inscrita una profecía: "Quien empuñe esta espada y mantenga su fe, protegerá a los holders de la volatilidad eterna."

Al tocar la empuñadura, Doge sintió el poder fluir a través de él. Sus ojos brillaron con determinación y supo que su destino era proteger a la comunidad.`,
      en: `One day, while exploring the ruins of the Forgotten Protocol, Doge found something extraordinary: the legendary "Sword of HODL", forged by the ancient developers in the times of the Genesis Block.

The sword shone with a golden glow and bore an inscribed prophecy: "Whoever wields this sword and maintains their faith shall protect the holders from eternal volatility."

Upon touching the hilt, Doge felt power flow through him. His eyes shone with determination and he knew his destiny was to protect the community.`,
      th: `วันหนึ่ง ขณะที่สำรวจซากปรักหักพังของ Forgotten Protocol Doge พบสิ่งพิเศษ: "ดาบแห่ง HODL" ในตำนาน ที่ถูกตีขึ้นโดยนักพัฒนาโบราณในยุคของ Genesis Block

ดาบส่องประกายสีทองและมีคำทำนายจารึกไว้: "ผู้ใดถือดาบนี้และรักษาศรัทธา จะปกป้องผู้ถือจากความผันผวนชั่วนิรันดร์"

เมื่อสัมผัสด้ามดาบ Doge รู้สึกถึงพลังไหลผ่านร่างกาย ดวงตาของเขาส่องประกายด้วยความมุ่งมั่น และเขารู้ว่าชะตากรรมของเขาคือการปกป้องชุมชน`,
      ru: `Однажды, исследуя руины Забытого Протокола, Doge нашёл нечто необычное: легендарный «Меч HODL», выкованный древними разработчиками во времена Genesis Block.

Меч сиял золотым светом и нёс на себе пророчество: «Тот, кто владеет этим мечом и хранит веру, защитит держателей от вечной волатильности.»

Прикоснувшись к рукояти, Doge почувствовал, как сила течёт сквозь него. Его глаза засияли решимостью, и он понял, что его судьба — защищать сообщество.`
    },
  },
  {
    id: 3,
    titleKey: 'lore.chapter3.title',
    icon: Shield,
    content: {
      es: `Con la Espada del HODL en su pata, Doge se transformó. Ya no era solo un meme simpático, sino RPGDOGE, el Guardián del Reino Crypto.

Reunió a los mejores guerreros del blockchain: holders diamante que nunca vendieron en rojo, developers que codificaban día y noche, y community managers que mantenían la fe en los tiempos oscuros.

Juntos, formaron la Orden del RDOGE, jurando proteger el tesoro de la comunidad y llevar prosperidad a todos los que creyeran en la misión.`,
      en: `With the Sword of HODL in his paw, Doge transformed. He was no longer just a cute meme, but RPGDOGE, the Guardian of the Crypto Kingdom.

He gathered the best warriors of the blockchain: diamond holders who never sold in the red, developers who coded day and night, and community managers who kept the faith in dark times.

Together, they formed the Order of RDOGE, swearing to protect the community's treasure and bring prosperity to all who believed in the mission.`,
      th: `ด้วยดาบแห่ง HODL ในอุ้งเท้า Doge เปลี่ยนแปลงไป เขาไม่ใช่แค่มีมน่ารักอีกต่อไป แต่เป็น RPGDOGE ผู้พิทักษ์อาณาจักรคริปโต

เขารวบรวมนักรบที่ดีที่สุดของบล็อกเชน: ผู้ถือเพชรที่ไม่เคยขายในขาลง นักพัฒนาที่เขียนโค้ดทั้งวันทั้งคืน และผู้จัดการชุมชนที่รักษาศรัทธาในยามมืดมน

ด้วยกัน พวกเขาก่อตั้ง Order of RDOGE สาบานที่จะปกป้องสมบัติของชุมชนและนำความเจริญรุ่งเรืองมาสู่ทุกคนที่เชื่อในภารกิจ`,
      ru: `С Мечом HODL в лапе Doge преобразился. Он больше не был просто милым мемом, а стал RPGDOGE, Стражем Крипто-Королевства.

Он собрал лучших воинов блокчейна: бриллиантовых держателей, которые никогда не продавали в минус, разработчиков, кодящих день и ночь, и комьюнити-менеджеров, хранящих веру в тёмные времена.

Вместе они сформировали Орден RDOGE, поклявшись защищать сокровища сообщества и приносить процветание всем, кто верит в миссию.`
    },
  },
  {
    id: 4,
    titleKey: 'lore.chapter4.title',
    icon: Crown,
    content: {
      es: `Hoy, RPGDOGE lidera desde su fortaleza digital, donde cada token RDOGE representa una parte del poder del reino.

Los que hacen staking de sus tokens contribuyen al "Tesoro del Reino", recibiendo recompensas por su lealtad. Los holders más antiguos son conocidos como "Caballeros Diamante", respetados por toda la comunidad.

Y la leyenda dice que cuando el suministro total de 1,000,000,000,000 RDOGE sea distribuido entre verdaderos creyentes, el reino alcanzará su máximo esplendor...`,
      en: `Today, RPGDOGE leads from his digital fortress, where each RDOGE token represents a piece of the kingdom's power.

Those who stake their tokens contribute to the "Kingdom Treasury", receiving rewards for their loyalty. The oldest holders are known as "Diamond Knights", respected by the entire community.

And legend says that when the total supply of 1,000,000,000,000 RDOGE is distributed among true believers, the kingdom will reach its maximum splendor...`,
      th: `วันนี้ RPGDOGE เป็นผู้นำจากป้อมปราการดิจิทัลของเขา ที่ซึ่งโทเค็น RDOGE แต่ละอันแทนส่วนหนึ่งของพลังอาณาจักร

ผู้ที่ stake โทเค็นมีส่วนร่วมใน "คลังอาณาจักร" และได้รับรางวัลสำหรับความภักดี ผู้ถือที่เก่าแก่ที่สุดเป็นที่รู้จักในชื่อ "อัศวินเพชร" ได้รับความเคารพจากทั้งชุมชน

และตำนานกล่าวว่าเมื่ออุปทานทั้งหมด 1,000,000,000,000 RDOGE ถูกแจกจ่ายให้กับผู้เชื่อที่แท้จริง อาณาจักรจะบรรลุความรุ่งโรจน์สูงสุด...`,
      ru: `Сегодня RPGDOGE управляет из своей цифровой крепости, где каждый токен RDOGE представляет часть силы королевства.

Те, кто стейкает свои токены, пополняют «Казну Королевства», получая награды за лояльность. Старейшие держатели известны как «Бриллиантовые Рыцари», уважаемые всем сообществом.

И легенда гласит, что когда общий запас в 1,000,000,000,000 RDOGE будет распределён среди истинных верующих, королевство достигнет своего величайшего расцвета...`
    },
  },
];

const RPGDogeLore = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { t, language } = useLanguage();

  const loreChapters = loreChaptersData.map(chapter => ({
    ...chapter,
    title: t(chapter.titleKey),
    contentText: chapter.content[language as keyof typeof chapter.content] || chapter.content.es,
  }));

  const tokenomics = [
    { label: t('lore.totalSupply'), value: "1,000,000,000,000 RDOGE", icon: Coins },
    { label: t('lore.community'), value: "40%", icon: Users },
    { label: t('lore.stakingRewards'), value: "25%", icon: Sparkles },
    { label: t('lore.epicBurn'), value: t('lore.deflationary'), icon: Flame },
  ];

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
                {t('rpgdoge.backToKingdom')}
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
            {t('rpgdoge.guardian')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-lg text-gray-400 font-mono">
              $RDOGE • Solana
            </p>
            
            {/* Pump.fun & Solana Badge */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1 }}
            >
              <a 
                href="https://pump.fun/coin/2cbcV3PsabFRttudnJNY5GFVYSLxZiYjPN5Dh5aXpump" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full border border-green-500/40 hover:border-green-400 hover:bg-green-500/30 transition-all cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Rocket className="w-4 h-4 text-green-400" />
                </motion.div>
                <span className="text-green-300 text-sm font-medium">{t('token.launchingOn')} pump.fun</span>
              </a>
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-violet-500/20 px-4 py-2 rounded-full border border-purple-500/40">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-green-400" />
                <span className="text-purple-300 text-sm font-medium">{t('token.poweredBy')} Solana</span>
              </div>
            </motion.div>
          </motion.div>

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
              {t('rpgdoge.legend')}
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
                <span className="md:hidden">{t('rpgdoge.chapter')} {chapter.id}</span>
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
                    <p className="text-yellow-400 text-sm font-mono">{t('rpgdoge.chapter')} {loreChapters[activeChapter].id}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {loreChapters[activeChapter].title}
                    </h3>
                  </div>
                </div>

                {/* Chapter Text */}
                <div className="prose prose-lg prose-invert max-w-none">
                  {loreChapters[activeChapter].contentText.split("\n\n").map((paragraph, i) => (
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
                    {t('rpgdoge.previous')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveChapter(Math.min(loreChapters.length - 1, activeChapter + 1))}
                    disabled={activeChapter === loreChapters.length - 1}
                    className="text-yellow-400 hover:text-yellow-300 disabled:opacity-30"
                  >
                    {t('rpgdoge.next')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Solana & Pump.fun Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-900/30 via-purple-900/30 to-green-900/30 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-green-500/30 relative overflow-hidden"
          >
            {/* Animated background elements */}
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-6 py-3 rounded-full border border-green-500/40 mb-6"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Rocket className="w-5 h-5 text-green-400" />
                  </motion.div>
                  <span className="text-green-300 font-bold">{t('token.comingSoon')}</span>
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-green-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                    {t('token.launchingOn')} pump.fun
                  </span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  {t('token.fairLaunch')}
                </p>
              </div>

              {/* Solana Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-black/40 rounded-2xl p-6 border border-purple-500/20 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-green-500/20 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('token.solanaSpeed')}</h3>
                  <p className="text-gray-400 text-sm">{t('token.fastTransactions')}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/40 rounded-2xl p-6 border border-green-500/20 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Coins className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('token.lowFees')}</h3>
                  <p className="text-gray-400 text-sm">{t('token.pumpFunListing')}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-black/40 rounded-2xl p-6 border border-yellow-500/20 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                    <Users className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('token.ecosystem')}</h3>
                  <p className="text-gray-400 text-sm">{t('token.solanaNetwork')}</p>
                </motion.div>
              </div>

              {/* Solana Logo */}
              <div className="flex justify-center mt-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 bg-black/50 px-6 py-3 rounded-full border border-purple-500/30"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-green-400" />
                  <span className="text-purple-300 font-medium">{t('token.poweredBy')} Solana Blockchain</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
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
              {t('rpgdoge.tokenomics')}
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

      {/* Roadmap Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-6"
          >
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {t('rpgdoge.roadmap')}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-400 text-center mb-16 max-w-2xl mx-auto"
          >
            {t('rpgdoge.roadmapSubtitle')}
          </motion.p>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 via-purple-500 to-blue-500 hidden md:block transform -translate-x-1/2" />

            {/* Phase 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative grid md:grid-cols-2 gap-8 mb-12"
            >
              <div className="md:text-right md:pr-12">
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
                  <Trophy className="w-4 h-4" />
                  {t('rpgdoge.completed')}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('rpgdoge.phase1')}</h3>
                <p className="text-gray-400 mb-4">Q4 2024</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2 md:justify-end">
                    <span>{t('roadmap.tokenCreation')}</span>
                    <Star className="w-4 h-4 text-green-400" />
                  </li>
                  <li className="flex items-center gap-2 md:justify-end">
                    <span>{t('roadmap.communityLaunch')}</span>
                    <Star className="w-4 h-4 text-green-400" />
                  </li>
                  <li className="flex items-center gap-2 md:justify-end">
                    <span>{t('roadmap.loreDev')}</span>
                    <Star className="w-4 h-4 text-green-400" />
                  </li>
                  <li className="flex items-center gap-2 md:justify-end">
                    <span>{t('roadmap.website')}</span>
                    <Star className="w-4 h-4 text-green-400" />
                  </li>
                </ul>
              </div>
              <div className="hidden md:flex items-center justify-start">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Phase 2 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative grid md:grid-cols-2 gap-8 mb-12"
            >
              <div className="hidden md:flex items-center justify-end">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <div className="md:pl-12">
                <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-1 rounded-full text-sm font-medium mb-4 animate-pulse">
                  <Zap className="w-4 h-4" />
                  {t('rpgdoge.inProgress')}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('rpgdoge.phase2')}</h3>
                <p className="text-gray-400 mb-4">Q1 2025</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{t('roadmap.publicPresale')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{t('roadmap.bonusSystem')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>{t('roadmap.audit')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>{t('roadmap.partnerships')}</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Phase 3 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative grid md:grid-cols-2 gap-8 mb-12"
            >
              <div className="md:text-right md:pr-12">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
                  <Target className="w-4 h-4" />
                  {t('rpgdoge.comingSoon')}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('rpgdoge.phase3')}</h3>
                <p className="text-gray-400 mb-4">Q2 2025</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2 md:justify-end">
                    <span>{t('roadmap.dexListing')}</span>
                    <Star className="w-4 h-4 text-gray-500" />
                  </li>
                  <li className="flex items-center gap-2 md:justify-end">
                    <span>{t('roadmap.stakingLaunch')}</span>
                    <Star className="w-4 h-4 text-gray-500" />
                  </li>
                  <li className="flex items-center gap-2 md:justify-end">
                    <span>{t('roadmap.daoGovernance')}</span>
                    <Star className="w-4 h-4 text-gray-500" />
                  </li>
                  <li className="flex items-center gap-2 md:justify-end">
                    <span>{t('roadmap.marketing')}</span>
                    <Star className="w-4 h-4 text-gray-500" />
                  </li>
                </ul>
              </div>
              <div className="hidden md:flex items-center justify-start">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30"
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Phase 4 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative grid md:grid-cols-2 gap-8"
            >
              <div className="hidden md:flex items-center justify-end">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
                >
                  <Rocket className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <div className="md:pl-12">
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
                  <Rocket className="w-4 h-4" />
                  {t('rpgdoge.future')}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('rpgdoge.phase4')}</h3>
                <p className="text-gray-400 mb-4">Q3-Q4 2025</p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>{t('roadmap.cexListing')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>{t('roadmap.p2eGame')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>{t('roadmap.nftCollection')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>{t('roadmap.metaverse')}</span>
                  </li>
                </ul>
              </div>
            </motion.div>
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
              {t('rpgdoge.readyToJoin')}
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              {t('rpgdoge.becomeKnight')}
            </p>
            <Link to="/rpgdoge/presale">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg px-10 py-6 rounded-full shadow-lg shadow-yellow-500/30">
                  <Coins className="w-5 h-5 mr-2" />
                  {t('rpgdoge.startPresale')}
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 text-sm">
        <p>{t('rpgdoge.footer')}</p>
        <p className="mt-2">{t('rpgdoge.legendContinues')}</p>
      </footer>
    </div>
  );
};

export default RPGDogeLore;
